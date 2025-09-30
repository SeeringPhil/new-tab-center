<script lang="ts">
  import { filteredNotes, currentNote, loadNote, deleteNote, stripHtml, formatDateShort } from '../stores/notes';
  import IconTrash from '~icons/lucide/trash-2';
  
  function selectNote(noteId: string) {
    loadNote(noteId);
  }
  
  function handleDelete(e: MouseEvent, noteId: string) {
    e.stopPropagation();
    deleteNote(noteId);
  }
</script>

<div class="w-80 bg-base-200 border-r border-base-300 overflow-y-auto">
  <div class="p-2 space-y-2">
    {#if $filteredNotes.length === 0}
      <div class="p-4 text-center text-base-content/70">
        No notes found
      </div>
    {:else}
      {#each $filteredNotes as note (note.id)}
        <div
          class="card bg-base-100 hover:bg-base-100/80 p-3 cursor-pointer transition-all {$currentNote?.id === note.id ? 'ring-2 ring-primary' : ''}"
          onclick={() => selectNote(note.id)}
          onkeydown={(e) => e.key === 'Enter' && selectNote(note.id)}
          role="button"
          tabindex="0"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="font-semibold text-sm truncate flex-1 pr-2">
              {note.title}
            </div>
            <button
              class="btn btn-ghost btn-xs hover:btn-error"
              onclick={(e) => handleDelete(e, note.id)}
              aria-label="Delete note"
            >
              <IconTrash class="w-3 h-3" />
            </button>
          </div>
          
          <div class="text-xs text-base-content/70 mb-2">
            {formatDateShort(note.date)}
          </div>
          
          <div class="text-xs text-base-content/70 line-clamp-3">
            {stripHtml(note.content).substring(0, 100)}{stripHtml(note.content).length > 100 ? '...' : ''}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
