import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AutoVersionConfig {
  enabled: boolean;
  minTimeBetweenVersions: number; // milliseconds
  minContentChangeThreshold: number; // characters
  minContentChangePercent: number; // 0-1
}

interface ScriptSnapshot {
  content: string;
  title: string;
  niche: string;
  length: string;
  tone: string;
  timestamp: number;
}

const DEFAULT_CONFIG: AutoVersionConfig = {
  enabled: true,
  minTimeBetweenVersions: 5 * 60 * 1000, // 5 minutes
  minContentChangeThreshold: 50, // 50 characters
  minContentChangePercent: 0.1, // 10%
};

export const useAutoVersion = (
  scriptId: string | null,
  currentSnapshot: ScriptSnapshot | null,
  config: Partial<AutoVersionConfig> = {}
) => {
  const [isCreating, setIsCreating] = useState(false);
  const lastVersionRef = useRef<ScriptSnapshot | null>(null);
  const lastVersionTimeRef = useRef<number>(0);
  const { toast } = useToast();
  
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const calculateChanges = useCallback((oldContent: string, newContent: string) => {
    const lengthDiff = Math.abs(newContent.length - oldContent.length);
    const percentChange = oldContent.length > 0 
      ? lengthDiff / oldContent.length 
      : 1;
    
    return {
      characterDiff: lengthDiff,
      percentChange,
    };
  }, []);

  const generateChangeDescription = useCallback((
    oldSnapshot: ScriptSnapshot,
    newSnapshot: ScriptSnapshot
  ): string => {
    const changes: string[] = [];

    if (oldSnapshot.title !== newSnapshot.title) {
      changes.push(`Title changed to: "${newSnapshot.title}"`);
    }

    if (oldSnapshot.niche !== newSnapshot.niche) {
      changes.push(`Niche changed from ${oldSnapshot.niche} to ${newSnapshot.niche}`);
    }

    if (oldSnapshot.length !== newSnapshot.length) {
      changes.push(`Length changed to ${newSnapshot.length}`);
    }

    if (oldSnapshot.tone !== newSnapshot.tone) {
      changes.push(`Tone changed to ${newSnapshot.tone}`);
    }

    const { characterDiff, percentChange } = calculateChanges(
      oldSnapshot.content,
      newSnapshot.content
    );

    if (characterDiff > 0) {
      const percentStr = (percentChange * 100).toFixed(0);
      changes.push(`Content updated (${percentStr}% change, ${characterDiff} characters)`);
    }

    return changes.length > 0 
      ? changes.join('; ') 
      : 'Auto-save checkpoint';
  }, [calculateChanges]);

  const shouldCreateVersion = useCallback((
    oldSnapshot: ScriptSnapshot,
    newSnapshot: ScriptSnapshot
  ): boolean => {
    if (!fullConfig.enabled) return false;

    const timeSinceLastVersion = Date.now() - lastVersionTimeRef.current;
    if (timeSinceLastVersion < fullConfig.minTimeBetweenVersions) {
      return false;
    }

    // Check metadata changes
    const hasMetadataChange = 
      oldSnapshot.title !== newSnapshot.title ||
      oldSnapshot.niche !== newSnapshot.niche ||
      oldSnapshot.length !== newSnapshot.length ||
      oldSnapshot.tone !== newSnapshot.tone;

    if (hasMetadataChange) return true;

    // Check content changes
    const { characterDiff, percentChange } = calculateChanges(
      oldSnapshot.content,
      newSnapshot.content
    );

    return (
      characterDiff >= fullConfig.minContentChangeThreshold ||
      percentChange >= fullConfig.minContentChangePercent
    );
  }, [fullConfig, calculateChanges]);

  const createAutoVersion = useCallback(async (
    snapshot: ScriptSnapshot,
    userId: string
  ): Promise<boolean> => {
    if (!scriptId || isCreating) return false;

    setIsCreating(true);

    try {
      const changeDescription = lastVersionRef.current
        ? generateChangeDescription(lastVersionRef.current, snapshot)
        : 'Initial auto-save';

      const { error } = await supabase.functions.invoke('create-script-version', {
        body: {
          scriptId,
          title: snapshot.title,
          content: snapshot.content,
          niche: snapshot.niche,
          length: snapshot.length,
          tone: snapshot.tone,
          changeDescription: `[Auto] ${changeDescription}`,
          userId,
        },
      });

      if (error) {
        console.error('Auto-version creation failed:', error);
        return false;
      }

      lastVersionRef.current = snapshot;
      lastVersionTimeRef.current = Date.now();

      toast({
        title: "Version saved automatically",
        description: changeDescription,
        duration: 2000,
      });

      return true;
    } catch (error) {
      console.error('Auto-version error:', error);
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [scriptId, isCreating, generateChangeDescription, toast]);

  const checkAndCreateVersion = useCallback(async (
    snapshot: ScriptSnapshot,
    userId: string
  ) => {
    if (!lastVersionRef.current) {
      lastVersionRef.current = snapshot;
      lastVersionTimeRef.current = Date.now();
      return;
    }

    if (shouldCreateVersion(lastVersionRef.current, snapshot)) {
      await createAutoVersion(snapshot, userId);
    }
  }, [shouldCreateVersion, createAutoVersion]);

  // Reset when script changes
  useEffect(() => {
    lastVersionRef.current = null;
    lastVersionTimeRef.current = 0;
  }, [scriptId]);

  return {
    checkAndCreateVersion,
    isCreating,
    lastVersionTime: lastVersionTimeRef.current,
  };
};
