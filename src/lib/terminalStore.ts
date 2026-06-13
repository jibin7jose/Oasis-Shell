import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'meta' | 'done';
  content: string;
  timestamp: string;
}

export interface TerminalTab {
  id: string;
  name: string;
  cwd: string;
  lines: TerminalLine[];
  history: string[];
}

interface TerminalStore {
  tabs: TerminalTab[];
  activeTabId: string;
  addTab: (cwd?: string) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabCwd: (id: string, cwd: string) => void;
  addTabLines: (id: string, newLines: TerminalLine[]) => void;
  setTabLines: (id: string, lines: TerminalLine[]) => void;
  clearTabLines: (id: string) => void;
  addTabHistory: (id: string, cmd: string) => void;
}

export const useTerminalStore = create<TerminalStore>()(
  persist(
    (set) => ({
      tabs: [
        {
          id: 'default-1',
          name: 'oasis',
          cwd: 'C:\\',
          lines: [
            { id: 'boot1', type: 'meta', content: '╔══════════════════════════════════════╗', timestamp: '' },
            { id: 'boot2', type: 'meta', content: '║   OASIS KERNEL v4.5 — SENTINEL LINK  ║', timestamp: '' },
            { id: 'boot3', type: 'meta', content: '╚══════════════════════════════════════╝', timestamp: '' },
            { id: 'boot4', type: 'output', content: 'Real-time streaming terminal active.', timestamp: '' }
          ],
          history: [],
        }
      ],
      activeTabId: 'default-1',
      
      addTab: (cwd = 'C:\\') => set((state) => {
        const newId = Date.now().toString();
        return {
          tabs: [...state.tabs, {
            id: newId,
            name: 'oasis',
            cwd,
            lines: [
              { id: `boot1-${newId}`, type: 'meta', content: '╔══════════════════════════════════════╗', timestamp: '' },
              { id: `boot2-${newId}`, type: 'meta', content: '║   OASIS KERNEL v4.5 — SENTINEL LINK  ║', timestamp: '' },
              { id: `boot3-${newId}`, type: 'meta', content: '╚══════════════════════════════════════╝', timestamp: '' },
              { id: `boot4-${newId}`, type: 'output', content: 'Real-time streaming terminal active.', timestamp: '' }
            ],
            history: [],
          }],
          activeTabId: newId,
        };
      }),

      removeTab: (id: string) => set((state) => {
        if (state.tabs.length <= 1) return state; // Don't close last tab
        const newTabs = state.tabs.filter(t => t.id !== id);
        const newActiveId = state.activeTabId === id ? newTabs[newTabs.length - 1].id : state.activeTabId;
        return { tabs: newTabs, activeTabId: newActiveId };
      }),

      setActiveTab: (id: string) => set({ activeTabId: id }),

      updateTabCwd: (id: string, cwd: string) => set((state) => ({
        tabs: state.tabs.map(tab => tab.id === id ? { ...tab, cwd } : tab)
      })),

      addTabLines: (id: string, newLines: TerminalLine[]) => set((state) => ({
        tabs: state.tabs.map(tab => tab.id === id ? { ...tab, lines: [...tab.lines, ...newLines] } : tab)
      })),

      setTabLines: (id: string, lines: TerminalLine[]) => set((state) => ({
        tabs: state.tabs.map(tab => tab.id === id ? { ...tab, lines } : tab)
      })),

      clearTabLines: (id: string) => set((state) => ({
        tabs: state.tabs.map(tab => tab.id === id ? { ...tab, lines: tab.lines.slice(0, 4) } : tab) // Keep boot sequence
      })),

      addTabHistory: (id: string, cmd: string) => set((state) => ({
        tabs: state.tabs.map(tab => tab.id === id ? { ...tab, history: [cmd, ...tab.history] } : tab)
      })),
    }),
    {
      name: 'oasis-terminal-storage',
    }
  )
);
