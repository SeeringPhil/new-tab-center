import { writable, derived, get } from 'svelte/store';
import type { Note, NotesMap, ViewMode } from '../types';

// Store for all notes
export const notes = writable<NotesMap>({});

// Store for current note being edited
export const currentNote = writable<Note | null>(null);

// Store for current view mode
export const viewMode = writable<ViewMode>('today');

// Store for search mode
export const searchMode = writable(false);

// Store for auto-save status
export const autoSaveStatus = writable<'saved' | 'saving' | 'synced'>('synced');

// Derived store for filtered notes based on view mode
export const filteredNotes = derived(
  [notes, viewMode],
  ([$notes, $viewMode]) => {
    const notesArray = Object.values($notes);
    
    if ($viewMode === 'today') {
      const todayKey = getTodayKey();
      return notesArray.filter(note => note.id === todayKey);
    }
    
    // Sort by creation date (newest first)
    return notesArray.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
);

// Helper functions
export function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// Chrome storage functions
export async function loadNotesFromStorage(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(['dailyNotes']);
    const loadedNotes = result.dailyNotes || {};
    notes.set(loadedNotes);
    console.log('Loaded notes from storage:', Object.keys(loadedNotes));
  } catch (error) {
    console.error('Error loading notes:', error);
    notes.set({});
  }
}

export async function saveNotesToStorage(): Promise<void> {
  try {
    const currentNotes = get(notes);
    await chrome.storage.local.set({ dailyNotes: currentNotes });
    console.log('Saved notes to storage:', Object.keys(currentNotes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// Initialize today's note
export async function initializeToday(): Promise<void> {
  const today = getTodayKey();
  const currentNotes = get(notes);
  
  if (!currentNotes[today]) {
    const newNote: Note = {
      id: today,
      title: `Notes for ${formatDate(new Date())}`,
      content: '<p>Start writing your thoughts for today...</p>',
      date: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    notes.update(n => ({ ...n, [today]: newNote }));
    await saveNotesToStorage();
  }
}

// CRUD operations
export function loadNote(noteId: string): void {
  const currentNotes = get(notes);
  const note = currentNotes[noteId];
  
  if (note) {
    currentNote.set(note);
  }
}

export function createNewNote(): void {
  const now = new Date();
  const noteId = `note-${Date.now()}`;
  
  const newNote: Note = {
    id: noteId,
    title: 'New Note',
    content: '<p>Start writing...</p>',
    date: now.toISOString(),
    lastModified: now.toISOString()
  };
  
  notes.update(n => ({ ...n, [noteId]: newNote }));
  currentNote.set(newNote);
  viewMode.set('all');
  
  saveNotesToStorage();
}

export async function deleteNote(noteId: string): Promise<void> {
  const currentNotes = get(notes);
  const note = currentNotes[noteId];
  
  if (!note) return;
  
  const confirmed = confirm(`Are you sure you want to delete "${note.title}"?\n\nThis action cannot be undone.`);
  
  if (!confirmed) return;
  
  // Clear current note if it's the one being deleted
  const current = get(currentNote);
  if (current && current.id === noteId) {
    currentNote.set(null);
  }
  
  // Remove from notes
  notes.update(n => {
    const updated = { ...n };
    delete updated[noteId];
    return updated;
  });
  
  await saveNotesToStorage();
  
  // If we deleted today's note, recreate it
  const mode = get(viewMode);
  if (mode === 'today' && noteId === getTodayKey()) {
    await initializeToday();
    loadNote(getTodayKey());
  }
}

export function updateCurrentNote(title: string, content: string): void {
  const current = get(currentNote);
  
  if (!current) return;
  
  const updated: Note = {
    ...current,
    title,
    content,
    lastModified: new Date().toISOString()
  };
  
  currentNote.set(updated);
  
  notes.update(n => ({ ...n, [current.id]: updated }));
}

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleAutoSave(): void {
  autoSaveStatus.set('saving');
  
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(async () => {
    await saveNotesToStorage();
    autoSaveStatus.set('synced');
  }, 1000);
}

// Search functionality
export function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

export function searchNotes(query: string): Array<{
  note: Note;
  snippet: string;
  titleMatch: boolean;
  contentMatch: boolean;
}> {
  const searchTerm = query.toLowerCase();
  const results: Array<{
    note: Note;
    snippet: string;
    titleMatch: boolean;
    contentMatch: boolean;
  }> = [];
  
  const currentNotes = get(notes);
  
  Object.values(currentNotes).forEach(note => {
    const titleMatch = note.title.toLowerCase().includes(searchTerm);
    const contentText = stripHtml(note.content).toLowerCase();
    const contentMatch = contentText.includes(searchTerm);
    
    if (titleMatch || contentMatch) {
      const snippet = getSearchSnippet(contentText, searchTerm);
      results.push({
        note,
        snippet,
        titleMatch,
        contentMatch
      });
    }
  });
  
  // Sort by relevance (title matches first, then by date)
  results.sort((a, b) => {
    if (a.titleMatch && !b.titleMatch) return -1;
    if (!a.titleMatch && b.titleMatch) return 1;
    return new Date(b.note.lastModified).getTime() - new Date(a.note.lastModified).getTime();
  });
  
  return results;
}

function getSearchSnippet(content: string, searchTerm: string, maxLength = 150): string {
  const index = content.indexOf(searchTerm);
  if (index === -1) return content.substring(0, maxLength) + '...';
  
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + searchTerm.length + 50);
  let snippet = content.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

export function highlightText(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="bg-yellow-300 text-black px-1 rounded">$1</span>');
}

// Listen for storage changes from other tabs
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
    if (namespace === 'local' && changes.dailyNotes) {
      const newNotes = changes.dailyNotes.newValue || {};
      notes.set(newNotes);
    }
  });
}
