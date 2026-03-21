import { create } from 'zustand';
import { GenerationRow, ModRow } from '@/lib/supabase';

type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

interface GenerationState {
  status: GenerationStatus;
  currentGenerationId: string | null;
  currentJobId: string | null;
  selectedMod: ModRow | null;
  sourceImageUri: string | null;
  resultImageUrl: string | null;
  customPrompt: string;
  history: GenerationRow[];
  setStatus: (status: GenerationStatus) => void;
  setSelectedMod: (mod: ModRow | null) => void;
  setSourceImageUri: (uri: string | null) => void;
  setResultImageUrl: (url: string | null) => void;
  setCustomPrompt: (prompt: string) => void;
  startGeneration: (generationId: string, jobId: string) => void;
  completeGeneration: (resultUrl: string) => void;
  failGeneration: () => void;
  reset: () => void;
  addToHistory: (generation: GenerationRow) => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  status: 'idle',
  currentGenerationId: null,
  currentJobId: null,
  selectedMod: null,
  sourceImageUri: null,
  resultImageUrl: null,
  customPrompt: '',
  history: [],

  setStatus: (status) => set({ status }),
  setSelectedMod: (mod) => set({ selectedMod: mod }),
  setSourceImageUri: (uri) => set({ sourceImageUri: uri }),
  setResultImageUrl: (url) => set({ resultImageUrl: url }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),

  startGeneration: (generationId, jobId) =>
    set({ status: 'processing', currentGenerationId: generationId, currentJobId: jobId }),

  completeGeneration: (resultUrl) =>
    set({ status: 'completed', resultImageUrl: resultUrl, currentJobId: null }),

  failGeneration: () =>
    set({ status: 'failed', currentGenerationId: null, currentJobId: null }),

  reset: () =>
    set({
      status: 'idle',
      currentGenerationId: null,
      currentJobId: null,
      resultImageUrl: null,
      customPrompt: '',
    }),

  addToHistory: (generation) =>
    set((state) => ({ history: [generation, ...state.history] })),
}));
