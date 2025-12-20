import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/corsHeaders.ts";

// ============================================================
// AES-GCM Encryption Implementation (Inline for Edge Function)
// ============================================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;
const CURRENT_KEY_VERSION = 2; // Version 2 = AES-GCM (Version 1 was XOR)

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptAesGcm(plaintext: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(secret, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    encoder.encode(plaintext)
  );
  
  const result = new Uint8Array(1 + salt.length + iv.length + encrypted.byteLength);
  result[0] = CURRENT_KEY_VERSION;
  result.set(salt, 1);
  result.set(iv, 1 + salt.length);
  result.set(new Uint8Array(encrypted), 1 + salt.length + iv.length);
  
  return btoa(String.fromCharCode(...result));
}

async function decryptAesGcm(encryptedData: string, secret: string): Promise<string> {
  const decoder = new TextDecoder();
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  
  const version = combined[0];
  
  // Handle legacy XOR encryption (version 1 or missing version byte)
  if (version !== CURRENT_KEY_VERSION) {
    return decryptLegacyXor(encryptedData, secret);
  }
  
  const salt = combined.slice(1, 17);
  const iv = combined.slice(17, 17 + IV_LENGTH);
  const ciphertext = combined.slice(17 + IV_LENGTH);
  
  const key = await deriveKey(secret, salt);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
    key,
    ciphertext
  );
  
  return decoder.decode(decrypted);
}

function decryptLegacyXor(encrypted: string, key: string): string {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function isLegacyEncryption(encryptedData: string): boolean {
  try {
    const decoded = atob(encryptedData);
    return decoded.charCodeAt(0) !== CURRENT_KEY_VERSION;
  } catch {
    return true;
  }
}

// ============================================================
// TOTP Implementation
// ============================================================

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateSecret(length = 20): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[array[i] % 32];
  }
  return secret;
}

function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/, '').toUpperCase();
  const output = new Uint8Array(Math.floor(cleaned.length * 5 / 8));
  let bits = 0;
  let value = 0;
  let index = 0;
  
  for (const char of cleaned) {
    const charIndex = BASE32_CHARS.indexOf(char);
    if (charIndex === -1) continue;
    value = (value << 5) | charIndex;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  
  return output;
}

async function generateHOTP(secret: string, counter: bigint): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setBigUint64(0, counter, false);
  
  const signature = await crypto.subtle.sign('HMAC', key, counterBuffer);
  const signatureArray = new Uint8Array(signature);
  
  const offset = signatureArray[signatureArray.length - 1] & 0x0f;
  const code = (
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

async function generateTOTP(secret: string, timeStep = 30): Promise<string> {
  const counter = BigInt(Math.floor(Date.now() / 1000 / timeStep));
  return generateHOTP(secret, counter);
}

async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  const timeStep = 30;
  const currentCounter = BigInt(Math.floor(Date.now() / 1000 / timeStep));
  
  for (let i = -window; i <= window; i++) {
    const expectedToken = await generateHOTP(secret, currentCounter + BigInt(i));
    if (expectedToken === token) {
      return true;
    }
  }
  
  return false;
}

function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const array = new Uint8Array(5);
    crypto.getRandomValues(array);
    const code = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    codes.push(code.toUpperCase());
  }
  return codes;
}

// ============================================================
// Main Handler
// ============================================================

const logStep = (step: string, details?: any) => {
  console.log(`[USER-2FA] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // Use a stronger key derivation from service role key
    const encryptionKey = serviceRoleKey;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...params } = await req.json();
    logStep(`Action: ${action}`, { userId: user.id.slice(0, 8) });

    const tableName = 'user_totp';

    switch (action) {
      case 'setup': {
        const secret = generateSecret(20);
        const backupCodes = generateBackupCodes(10);
        
        // Use AES-GCM encryption
        const encryptedSecret = await encryptAesGcm(secret, encryptionKey);
        const encryptedBackupCodes = await Promise.all(
          backupCodes.map(code => encryptAesGcm(code, encryptionKey))
        );
        
        const { error: insertError } = await supabase
          .from(tableName)
          .upsert({
            user_id: user.id,
            secret_encrypted: encryptedSecret,
            backup_codes: encryptedBackupCodes,
            is_enabled: false,
            created_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (insertError) throw insertError;
        
        const email = user.email || 'user';
        const issuer = 'MiniDrama';
        const uri = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
        
        logStep('2FA setup initiated with AES-GCM encryption', { userId: user.id.slice(0, 8) });
        
        return new Response(
          JSON.stringify({
            success: true,
            secret,
            uri,
            backupCodes,
            message: 'Scan QR code with authenticator app, then verify with a code'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'verify-setup': {
        const { code } = params;
        
        if (!code || typeof code !== 'string' || code.length !== 6) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: totpData, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError || !totpData) {
          return new Response(
            JSON.stringify({ error: '2FA setup not found. Please start setup again.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Decrypt with AES-GCM (automatically handles legacy XOR)
        const secret = await decryptAesGcm(totpData.secret_encrypted, encryptionKey);
        const isValid = await verifyTOTP(secret, code);
        
        if (!isValid) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // If using legacy encryption, upgrade to AES-GCM
        if (isLegacyEncryption(totpData.secret_encrypted)) {
          const upgradedSecret = await encryptAesGcm(secret, encryptionKey);
          const decryptedBackups = await Promise.all(
            (totpData.backup_codes || []).map((c: string) => decryptAesGcm(c, encryptionKey))
          );
          const upgradedBackups = await Promise.all(
            decryptedBackups.map(c => encryptAesGcm(c, encryptionKey))
          );
          
          await supabase
            .from(tableName)
            .update({
              secret_encrypted: upgradedSecret,
              backup_codes: upgradedBackups,
              is_enabled: true,
              verified_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          logStep('2FA enabled and upgraded to AES-GCM', { userId: user.id.slice(0, 8) });
          
          // Send security alert for 2FA enabled
          try {
            const alertUrl = `${supabaseUrl}/functions/v1/send-security-alert`;
            fetch(alertUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                userId: user.id,
                alertType: '2fa_enabled',
                ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
                userAgent: req.headers.get('user-agent') || '',
              }),
            }).catch(err => logStep('Failed to send 2FA enabled alert', { error: err.message }));
          } catch (alertError) {
            logStep('Security alert error', { error: alertError });
          }
        } else {
          await supabase
            .from(tableName)
            .update({
              is_enabled: true,
              verified_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          logStep('2FA enabled successfully', { userId: user.id.slice(0, 8) });
          
          // Send security alert for 2FA enabled
          try {
            const alertUrl = `${supabaseUrl}/functions/v1/send-security-alert`;
            fetch(alertUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                userId: user.id,
                alertType: '2fa_enabled',
                ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
                userAgent: req.headers.get('user-agent') || '',
              }),
            }).catch(err => logStep('Failed to send 2FA enabled alert', { error: err.message }));
          } catch (alertError) {
            logStep('Security alert error', { error: alertError });
          }
        }
        
        return new Response(
          JSON.stringify({ success: true, message: '2FA enabled successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'verify': {
        const { code } = params;
        
        if (!code || typeof code !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Verification code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: totpData, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .eq('is_enabled', true)
          .single();
        
        if (fetchError || !totpData) {
          return new Response(
            JSON.stringify({ error: '2FA not enabled for this account' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const secret = await decryptAesGcm(totpData.secret_encrypted, encryptionKey);
        
        // Check backup codes
        if (code.length === 10) {
          const encryptedBackupCodes = totpData.backup_codes || [];
          const decryptedCodes = await Promise.all(
            encryptedBackupCodes.map((c: string) => decryptAesGcm(c, encryptionKey))
          );
          const codeIndex = decryptedCodes.indexOf(code.toUpperCase());
          
          if (codeIndex !== -1) {
            const newBackupCodes = [...encryptedBackupCodes];
            newBackupCodes.splice(codeIndex, 1);
            
            await supabase
              .from(tableName)
              .update({
                backup_codes: newBackupCodes,
                last_used_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                verified: true,
                remainingBackupCodes: newBackupCodes.length
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        const isValid = await verifyTOTP(secret, code);
        
        if (!isValid) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        await supabase
          .from(tableName)
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', user.id);
        
        return new Response(
          JSON.stringify({ success: true, verified: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'status': {
        const { data: totpData } = await supabase
          .from(tableName)
          .select('is_enabled, verified_at, last_used_at, backup_codes, secret_encrypted')
          .eq('user_id', user.id)
          .single();
        
        // Check encryption version for status
        const encryptionVersion = totpData?.secret_encrypted && !isLegacyEncryption(totpData.secret_encrypted) 
          ? 'AES-GCM' 
          : totpData?.secret_encrypted 
            ? 'Legacy (upgrade recommended)' 
            : null;
        
        return new Response(
          JSON.stringify({
            enabled: totpData?.is_enabled || false,
            verifiedAt: totpData?.verified_at,
            lastUsedAt: totpData?.last_used_at,
            backupCodesRemaining: totpData?.backup_codes?.length || 0,
            encryptionVersion
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'disable': {
        const { code } = params;
        
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Current 2FA code required to disable' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: totpData } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .eq('is_enabled', true)
          .single();
        
        if (!totpData) {
          return new Response(
            JSON.stringify({ error: '2FA not enabled' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const secret = await decryptAesGcm(totpData.secret_encrypted, encryptionKey);
        const isValid = await verifyTOTP(secret, code);
        
        if (!isValid) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        await supabase
          .from(tableName)
          .delete()
          .eq('user_id', user.id);
        
        logStep('2FA disabled', { userId: user.id.slice(0, 8) });
        
        // Send security alert for 2FA disabled
        try {
          const alertUrl = `${supabaseUrl}/functions/v1/send-security-alert`;
          fetch(alertUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              userId: user.id,
              alertType: '2fa_disabled',
              ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
              userAgent: req.headers.get('user-agent') || '',
            }),
          }).catch(err => logStep('Failed to send 2FA disabled alert', { error: err.message }));
        } catch (alertError) {
          logStep('Security alert error', { error: alertError });
        }
        
        return new Response(
          JSON.stringify({ success: true, message: '2FA has been disabled' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'regenerate-backup': {
        const { code } = params;
        
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'Current 2FA code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data: totpData } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .eq('is_enabled', true)
          .single();
        
        if (!totpData) {
          return new Response(
            JSON.stringify({ error: '2FA not enabled' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const secret = await decryptAesGcm(totpData.secret_encrypted, encryptionKey);
        const isValid = await verifyTOTP(secret, code);
        
        if (!isValid) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const newBackupCodes = generateBackupCodes(10);
        const encryptedCodes = await Promise.all(
          newBackupCodes.map(c => encryptAesGcm(c, encryptionKey))
        );
        
        await supabase
          .from(tableName)
          .update({ backup_codes: encryptedCodes })
          .eq('user_id', user.id);
        
        logStep('Backup codes regenerated with AES-GCM', { userId: user.id.slice(0, 8) });
        
        return new Response(
          JSON.stringify({ success: true, backupCodes: newBackupCodes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'rotate-encryption': {
        // This action upgrades legacy XOR encryption to AES-GCM
        const { data: totpData } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!totpData) {
          return new Response(
            JSON.stringify({ error: '2FA not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!isLegacyEncryption(totpData.secret_encrypted)) {
          return new Response(
            JSON.stringify({ success: true, message: 'Already using latest encryption' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Decrypt and re-encrypt with AES-GCM
        const secret = await decryptAesGcm(totpData.secret_encrypted, encryptionKey);
        const upgradedSecret = await encryptAesGcm(secret, encryptionKey);
        
        const decryptedBackups = await Promise.all(
          (totpData.backup_codes || []).map((c: string) => decryptAesGcm(c, encryptionKey))
        );
        const upgradedBackups = await Promise.all(
          decryptedBackups.map(c => encryptAesGcm(c, encryptionKey))
        );
        
        await supabase
          .from(tableName)
          .update({
            secret_encrypted: upgradedSecret,
            backup_codes: upgradedBackups
          })
          .eq('user_id', user.id);
        
        logStep('Encryption rotated to AES-GCM', { userId: user.id.slice(0, 8) });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Encryption upgraded to AES-GCM' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[USER-2FA] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
