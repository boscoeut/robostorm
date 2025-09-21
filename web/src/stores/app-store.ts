import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AppState, User } from './types';

interface AppStore extends AppState {
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;
  resetState: () => void;
  
  // User management
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        user: null,
        theme: 'light',

        // Actions
        setLoading: (loading: boolean) => 
          set({ isLoading: loading }, false, 'app/setLoading'),
        
        setError: (error: string | null) => 
          set({ error }, false, 'app/setError'),
        
        setLastUpdated: (date: Date) => 
          set({ lastUpdated: date }, false, 'app/setLastUpdated'),
        
        resetState: () => 
          set(initialState, false, 'app/resetState'),
        
        // User management
        setUser: (user: User | null) => 
          set({ user }, false, 'app/setUser'),
        
        // Theme
        toggleTheme: () => 
          set(
            (state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }), 
            false, 
            'app/toggleTheme'
          ),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selectors for derived state
export const useUser = () => useAppStore((state) => state.user);
export const useTheme = () => useAppStore((state) => state.theme);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
