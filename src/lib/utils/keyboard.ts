import { searchMode, createNewNote } from '../stores/notes';

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchMode.update(v => !v);
    }
    
    // Ctrl/Cmd + N for new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewNote();
    }
    
    // Escape to close search
    if (e.key === 'Escape') {
      searchMode.update(v => {
        if (v) {
          return false;
        }
        return v;
      });
    }
    
    // Toolbar shortcuts (only when focused on editor)
    const target = e.target as HTMLElement;
    if (target.getAttribute('contenteditable') === 'true') {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            document.execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            document.execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            document.execCommand('underline');
            break;
        }
      }
    }
  });
}
