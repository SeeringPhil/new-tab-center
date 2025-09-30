import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

export const theme = writable<Theme>('light');

// Load theme from Chrome storage
export async function initializeTheme(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['theme']);
    const savedTheme: Theme = result.theme || 'light';
    theme.set(savedTheme);
    
    const root = document.querySelector('div[data-theme]');
    if (root) {
      root.setAttribute('data-theme', savedTheme);
    }
  } catch (error) {
    console.error('Error loading theme:', error);
    theme.set('light');
  }
}

// Save theme to Chrome storage
async function saveTheme(newTheme: Theme): Promise<void> {
  try {
    await chrome.storage.local.set({ theme: newTheme });
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

export function toggleTheme(): void {
  theme.update(current => {
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    const root = document.querySelector('div[data-theme]');
    if (root) {
      root.setAttribute('data-theme', newTheme);
    }
    saveTheme(newTheme);
    return newTheme;
  });
}

// Listen for theme changes from other tabs
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
    if (namespace === 'local' && changes.theme) {
      const newTheme = changes.theme.newValue as Theme;
      theme.set(newTheme);
      const root = document.querySelector('div[data-theme]');
      if (root) {
        root.setAttribute('data-theme', newTheme);
      }
    }
  });
}