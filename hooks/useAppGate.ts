import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

type GateStatus = 'loading' | 'ok' | 'force-update' | 'maintenance' | 'server-error';

export function useAppGate() {
  const [status, setStatus] = useState<GateStatus>('loading');

  const check = useCallback(async () => {
    try {
      const { data: configs, error } = await supabase
        .from('app_config')
        .select('key, value')
        .in('key', ['minimum_app_version', 'maintenance_mode']);

      if (error || !configs) {
        setStatus('server-error');
        return;
      }

      const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));

      if (configMap.maintenance_mode === 'true') {
        setStatus('maintenance');
        return;
      }

      const minVersion = configMap.minimum_app_version;
      if (minVersion) {
        const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
        if (compareVersions(currentVersion, minVersion) < 0) {
          setStatus('force-update');
          return;
        }
      }

      setStatus('ok');
    } catch {
      setStatus('server-error');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, recheck: check };
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}
