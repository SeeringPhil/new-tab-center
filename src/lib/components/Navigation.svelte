<script lang="ts">
  import { viewMode, createNewNote, getTodayKey, loadNote } from '../stores/notes';
  
  function switchToToday() {
    viewMode.set('today');
    loadNote(getTodayKey());
  }
  
  function switchToAll() {
    viewMode.set('all');
  }
  
  function handleNewNote() {
    createNewNote();
  }
</script>

<nav class="flex justify-between items-center p-4 bg-base-100 border-b border-base-300">
  <div class="flex gap-2">
    <button
      class="btn btn-sm {$viewMode === 'today' ? 'btn-primary' : 'btn-ghost'}"
      onclick={switchToToday}
    >
      Today
    </button>
    <button
      class="btn btn-sm {$viewMode === 'all' ? 'btn-primary' : 'btn-ghost'}"
      onclick={switchToAll}
    >
      All Notes
    </button>
  </div>
  
  <button
    class="btn btn-sm btn-primary gap-1"
    onclick={handleNewNote}
  >
    + New Note
  </button>
</nav>
