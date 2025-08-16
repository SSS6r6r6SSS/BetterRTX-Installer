import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Installation {
  FriendlyName: string;
  InstallLocation: string;
  Preview: boolean;
  installed_preset?: {
    uuid: string;
    name: string;
    installed_at: string;
  };
}

export interface PackInfo {
  name: string;
  uuid: string;
  stub: string;
  tonemapping: string;
  bloom: string;
}

interface AppState {
  // State
  installations: Installation[];
  presets: PackInfo[];
  selectedInstallations: Set<string>;
  selectedPreset: string | null;
  consoleOutput: string[];
  activeTab: 'installations' | 'presets' | 'actions';
  toolbarOpen: boolean;

  // Actions
  setInstallations: (installations: Installation[]) => void;
  setPresets: (presets: PackInfo[]) => void;
  setSelectedInstallations: (selected: Set<string>) => void;
  setSelectedPreset: (preset: string | null) => void;
  setActiveTab: (tab: 'installations' | 'presets' | 'actions') => void;
  setToolbarOpen: (open: boolean) => void;
  addConsoleOutput: (message: string) => void;
  clearConsole: () => void;

  // Async actions
  refreshInstallations: () => Promise<void>;
  refreshPresets: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  installations: [],
  presets: [],
  selectedInstallations: new Set(),
  selectedPreset: null,
  consoleOutput: [],
  activeTab: 'installations',
  toolbarOpen: false,

  // Setters
  setInstallations: (installations) => set({ installations }),
  setPresets: (presets) => set({ presets }),
  setSelectedInstallations: (selectedInstallations) => set({ selectedInstallations }),
  setSelectedPreset: (selectedPreset) => set({ selectedPreset }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setToolbarOpen: (toolbarOpen) => set({ toolbarOpen }),

  addConsoleOutput: (message) => {
    const timestamp = new Date().toLocaleTimeString();
    set((state) => ({
      consoleOutput: [...state.consoleOutput, `[${timestamp}] ${message}`]
    }));
  },

  clearConsole: () => set({ consoleOutput: [] }),

  // Async actions
  refreshInstallations: async () => {
    const { addConsoleOutput, setInstallations } = get();
    
    try {
      addConsoleOutput('Scanning for Minecraft installations...');
      
      const data = await invoke<Installation[]>('list_installations');
      setInstallations(data);
      addConsoleOutput(`Found ${data.length} installations`);
    } catch (error) {
      const errorMsg = `Error loading installations: ${error}`;
      addConsoleOutput(errorMsg);
    }
  },

  refreshPresets: async (forceRefresh = false) => {
    const { addConsoleOutput, setPresets } = get();
    
    try {
      addConsoleOutput('Fetching RTX presets...');
      
      const data = await invoke<PackInfo[]>('list_presets', { forceRefresh });
      setPresets(data);
      addConsoleOutput(`Loaded ${data.length} presets`);
    } catch (error) {
      const errorMsg = `Error loading presets: ${error}`;
      addConsoleOutput(errorMsg);
    }
  },

  clearCache: async () => {
    const { addConsoleOutput } = get();
    
    try {
      addConsoleOutput('Clearing cache...');
      await invoke('clear_cache');
      addConsoleOutput('Cache cleared successfully');
    } catch (error) {
      const errorMsg = `Error clearing cache: ${error}`;
      addConsoleOutput(errorMsg);
    }
  },
}));
