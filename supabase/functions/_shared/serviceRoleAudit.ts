import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { truncateUserId, maskEmail } from "./piiMasking.ts";

export interface ServiceRoleOperation {
  operation: string;
  table?: string;
  action?: string;
  userId?: string;
  targetUserId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log service role operations to admin_audit_log for enhanced monitoring
 * This tracks all privileged operations performed with the service role key
 */
export async function logServiceRoleOperation(
  supabase: SupabaseClient,
  req: Request,
  operation: ServiceRoleOperation
): Promise<void> {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
  const userAgent = req.headers.get('user-agent');
  
  // Mask sensitive data in metadata
  const maskedMetadata = {
    ...operation.metadata,
    service_role_operation: true,
    operation_type: operation.operation,
    target_table: operation.table,
    success: operation.success,
    error: operation.errorMessage,
    target_user_id: operation.targetUserId ? truncateUserId(operation.targetUserId) : undefined,
    timestamp: new Date().toISOString(),
  };

  try {
    await supabase.from('admin_audit_log').insert({
      admin_id: operation.userId || '00000000-0000-0000-0000-000000000000',
      action: `service_role:${operation.action || operation.operation}`,
      resource_type: operation.table || 'system',
      resource_id: operation.resourceId,
      metadata: maskedMetadata,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // Console log for immediate visibility
    console.log(`[SERVICE_ROLE_AUDIT] ${operation.operation}`, {
      table: operation.table,
      action: operation.action,
      success: operation.success,
      userId: operation.userId ? truncateUserId(operation.userId) : 'system',
      resourceId: operation.resourceId,
    });
  } catch (error) {
    // Don't throw - audit logging should not break main flow
    console.error('[SERVICE_ROLE_AUDIT] Failed to log operation:', error);
  }
}

/**
 * Log batch service role operations
 */
export async function logServiceRoleBatch(
  supabase: SupabaseClient,
  req: Request,
  operations: ServiceRoleOperation[]
): Promise<void> {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
  const userAgent = req.headers.get('user-agent');

  const auditEntries = operations.map(op => ({
    admin_id: op.userId || '00000000-0000-0000-0000-000000000000',
    action: `service_role:${op.action || op.operation}`,
    resource_type: op.table || 'system',
    resource_id: op.resourceId,
    metadata: {
      service_role_operation: true,
      operation_type: op.operation,
      target_table: op.table,
      success: op.success,
      error: op.errorMessage,
      target_user_id: op.targetUserId ? truncateUserId(op.targetUserId) : undefined,
      timestamp: new Date().toISOString(),
      ...op.metadata,
    },
    ip_address: ipAddress,
    user_agent: userAgent,
  }));

  try {
    await supabase.from('admin_audit_log').insert(auditEntries);
    console.log(`[SERVICE_ROLE_AUDIT] Batch logged ${operations.length} operations`);
  } catch (error) {
    console.error('[SERVICE_ROLE_AUDIT] Failed to log batch operations:', error);
  }
}

/**
 * Create a wrapped Supabase client that logs all service role operations
 */
export function createAuditedServiceClient(
  supabase: SupabaseClient,
  req: Request,
  contextUserId?: string
) {
  return {
    /**
     * Perform an insert with audit logging
     */
    async auditedInsert(
      table: string,
      data: any,
      options?: { resourceId?: string; metadata?: any }
    ) {
      const result = await supabase.from(table).insert(data);
      
      await logServiceRoleOperation(supabase, req, {
        operation: 'insert',
        table,
        action: 'insert',
        userId: contextUserId,
        resourceId: options?.resourceId,
        metadata: options?.metadata,
        success: !result.error,
        errorMessage: result.error?.message,
      });

      return result;
    },

    /**
     * Perform an update with audit logging
     */
    async auditedUpdate(
      table: string,
      data: any,
      filter: { column: string; value: any },
      options?: { resourceId?: string; metadata?: any }
    ) {
      const result = await supabase
        .from(table)
        .update(data)
        .eq(filter.column, filter.value);

      await logServiceRoleOperation(supabase, req, {
        operation: 'update',
        table,
        action: 'update',
        userId: contextUserId,
        resourceId: options?.resourceId || filter.value,
        metadata: { ...options?.metadata, filter },
        success: !result.error,
        errorMessage: result.error?.message,
      });

      return result;
    },

    /**
     * Perform a delete with audit logging
     */
    async auditedDelete(
      table: string,
      filter: { column: string; value: any },
      options?: { resourceId?: string; metadata?: any }
    ) {
      const result = await supabase
        .from(table)
        .delete()
        .eq(filter.column, filter.value);

      await logServiceRoleOperation(supabase, req, {
        operation: 'delete',
        table,
        action: 'delete',
        userId: contextUserId,
        resourceId: options?.resourceId || filter.value,
        metadata: { ...options?.metadata, filter },
        success: !result.error,
        errorMessage: result.error?.message,
      });

      return result;
    },

    /**
     * Perform an upsert with audit logging
     */
    async auditedUpsert(
      table: string,
      data: any,
      options?: { onConflict?: string; resourceId?: string; metadata?: any }
    ) {
      const result = await supabase
        .from(table)
        .upsert(data, options?.onConflict ? { onConflict: options.onConflict } : undefined);

      await logServiceRoleOperation(supabase, req, {
        operation: 'upsert',
        table,
        action: 'upsert',
        userId: contextUserId,
        resourceId: options?.resourceId,
        metadata: { ...options?.metadata, onConflict: options?.onConflict },
        success: !result.error,
        errorMessage: result.error?.message,
      });

      return result;
    },

    /**
     * Log a custom service role operation
     */
    async logOperation(operation: Omit<ServiceRoleOperation, 'userId'>) {
      await logServiceRoleOperation(supabase, req, {
        ...operation,
        userId: contextUserId,
      });
    },
  };
}
