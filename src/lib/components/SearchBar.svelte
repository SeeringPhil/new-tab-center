<script lang="ts">
  import { searchMode, searchNotes, highlightText, formatDateShort, loadNote } from '../stores/notes';
  import { onMount } from 'svelte';
  import IconX from '~icons/lucide/x';
  
  let searchQuery = $state('');
  let searchResults = $state<ReturnType<typeof searchNotes>>([]);
  
  $effect(() => {
    if ($searchMode) {
      // Focus on input when search mode opens
      setTimeout(() => {
        const input = document.getElementById('search-input');
        input?.focus();
      }, 100);
    }
  });
  
  function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }
    searchResults = searchNotes(searchQuery);
  }
  
  function selectNote(noteId: string) {
    loadNote(noteId);
    closeSearch();
  }
  
  function closeSearch() {
    searchMode.set(false);
    searchQuery = '';
    searchResults = [];
  }
</script>

{#if $searchMode}
  <div class="bg-base-200 border-b border-base-300 p-4">
    <div class="flex gap-2 mb-4">
      <input
        id="search-input"
        type="text"
        bind:value={searchQuery}
        oninput={handleSearch}
        placeholder="Search across all notes..."
        class="input input-bordered flex-1"
      />
      <button 
        class="btn btn-ghost btn-sm"
        onclick={closeSearch}
        aria-label="Close search"
      >
        <IconX class="w-4 h-4" />
      </button>
    </div>
    
    <div class="max-h-[300px] overflow-y-auto space-y-2">
      {#if searchQuery && searchResults.length === 0}
        <div class="card bg-base-100 p-4 text-center text-base-content/70">
          No results found
        </div>
      {:else if searchResults.length > 0}
        {#each searchResults as result}
          <button
            class="card bg-base-100 hover:bg-base-100/80 p-4 w-full text-left transition-all cursor-pointer hover:shadow-md"
            onclick={() => selectNote(result.note.id)}
          >
            <div class="font-semibold mb-1">
              {@html highlightText(result.note.title, searchQuery)}
            </div>
            <div class="text-xs text-base-content/70 mb-2">
              {formatDateShort(result.note.date)}
            </div>
            <div class="text-sm text-base-content/70">
              {@html highlightText(result.snippet, searchQuery)}
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </div>
{/if}
