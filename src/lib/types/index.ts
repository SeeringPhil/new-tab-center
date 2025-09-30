export interface MenuItem {
  icon: string;
  label: string;
  action?: () => void;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  lastModified: string; // ISO string
}

export type NotesMap = Record<string, Note>;

export type ViewMode = 'today' | 'all';
