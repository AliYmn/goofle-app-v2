import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useGenerationStore } from '@/stores/useGenerationStore';
import { useCreditStore } from '@/stores/useCreditStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { analytics } from '@/lib/analytics';

export type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';

interface UseGenerationResult {
  status: GenerationStatus;
  generationId: string | null;
  resultImageUrl: string | null;
  startGeneration: (params: {
    modId: string;
    modSlug: string;
    sourceImageUrl: string;
    customPrompt?: string;
  }) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 40;

export function useGeneration(): UseGenerationResult {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttemptsRef = useRef(0);

  const {
    setStatus: setStoreStatus,
    startGeneration: storeStartGeneration,
    completeGeneration,
    failGeneration,
  } = useGenerationStore();
  const { refreshBalance } = useCreditStore();
  const { refreshStreak } = useStreakStore();
  const { session } = useAuthStore();

  const userId = session?.user?.id;

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (genId: string) => {
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setStatus('failed');
        failGeneration();
        if (userId) refreshBalance(userId);
        return;
      }

      pollAttemptsRef.current += 1;

      try {
        const res = await supabase.functions.invoke('check-generation-status', {
          body: { id: genId },
        });

        if (res.error) throw res.error;

        const data = res.data as {
          status: string;
          result_image_url?: string;
        };

        if (data.status === 'completed' && data.result_image_url) {
          stopPolling();
          setStatus('completed');
          completeGeneration(data.result_image_url);
          setResultImageUrl(data.result_image_url);
          if (userId) {
            refreshBalance(userId);
            refreshStreak(userId);
          }
        } else if (data.status === 'failed') {
          stopPolling();
          setStatus('failed');
          failGeneration();
          if (userId) refreshBalance(userId);
        } else {
          pollTimerRef.current = setTimeout(() => pollStatus(genId), POLL_INTERVAL_MS);
        }
      } catch {
        pollTimerRef.current = setTimeout(() => pollStatus(genId), POLL_INTERVAL_MS);
      }
    },
    [stopPolling, completeGeneration, failGeneration, refreshBalance, refreshStreak, userId],
  );

  const startGeneration = useCallback(
    async ({
      modId,
      modSlug,
      sourceImageUrl,
      customPrompt,
    }: {
      modId: string;
      modSlug: string;
      sourceImageUrl: string;
      customPrompt?: string;
    }) => {
      setStatus('submitting');
      setStoreStatus('pending');
      setGenerationId(null);
      setResultImageUrl(null);
      pollAttemptsRef.current = 0;

      analytics.generationStarted(modSlug);

      const res = await supabase.functions.invoke('create-generation-job', {
        body: {
          mod_id: modId,
          source_image_url: sourceImageUrl,
          custom_prompt: customPrompt,
        },
      });

      if (res.error || (res.data as any)?.error) {
        const errMsg = (res.data as any)?.error ?? res.error?.message ?? 'unknown';
        setStatus('failed');
        failGeneration();
        analytics.generationFailed(modSlug, errMsg);
        return;
      }

      const { generation_id, fal_job_id } = res.data as {
        generation_id: string;
        fal_job_id: string;
      };

      setGenerationId(generation_id);
      setStatus('processing');
      storeStartGeneration(generation_id, fal_job_id);

      pollTimerRef.current = setTimeout(() => pollStatus(generation_id), POLL_INTERVAL_MS);
    },
    [setStoreStatus, storeStartGeneration, failGeneration, pollStatus],
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setGenerationId(null);
    setResultImageUrl(null);
    pollAttemptsRef.current = 0;
    setStoreStatus('idle');
  }, [stopPolling, setStoreStatus]);

  return { status, generationId, resultImageUrl, startGeneration, reset };
}
