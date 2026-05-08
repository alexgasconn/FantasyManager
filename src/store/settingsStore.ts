import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, DEFAULT_SETTINGS } from '../types/fantasy';

interface SettingsStore {
    settings: AppSettings;
    updateSettings: (partial: Partial<AppSettings>) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            settings: { ...DEFAULT_SETTINGS },
            updateSettings: (partial) =>
                set(state => ({
                    settings: { ...state.settings, ...partial },
                })),
            resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),
        }),
        {
            name: 'fantasy-settings',
            version: 2,
            migrate: (persistedState: unknown) => {
                const state = persistedState as { settings?: Partial<AppSettings> } | undefined;
                return {
                    settings: { ...DEFAULT_SETTINGS, ...(state?.settings || {}) },
                };
            },
        }
    )
);
