<script lang="ts">
  import { currentNote, updateCurrentNote, scheduleAutoSave, autoSaveStatus, formatDateShort, stripHtml } from '../stores/notes';
  import { onMount } from 'svelte';
  
  let editorElement = $state<HTMLDivElement>();
  let titleValue = $state('');
  let wordCount = $state(0);
  
  $effect(() => {
    if ($currentNote) {
      titleValue = $currentNote.title;
      if (editorElement) {
        editorElement.innerHTML = $currentNote.content;
      }
      updateWordCount();
    }
  });
  
  function handleTitleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    titleValue = target.value;
    if ($currentNote && editorElement) {
      updateCurrentNote(titleValue, editorElement.innerHTML);
      scheduleAutoSave();
    }
  }
  
  function handleContentInput() {
    if ($currentNote && editorElement) {
      updateCurrentNote(titleValue, editorElement.innerHTML);
      scheduleAutoSave();
      updateWordCount();
    }
  }
  
  function updateWordCount() {
    if (editorElement) {
      const text = stripHtml(editorElement.innerHTML);
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      wordCount = words.length;
    }
  }
  
  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    if (editorElement) {
      editorElement.focus();
    }
    handleContentInput();
  }
  
  onMount(() => {
    if ($currentNote && editorElement) {
      editorElement.innerHTML = $currentNote.content;
      updateWordCount();
    }
  });
</script>

<div class="flex-1 flex flex-col bg-base-100">
  {#if $currentNote}
    <!-- Toolbar -->
    <div class="flex gap-1 p-2 border-b border-base-300 bg-base-200">
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('bold')}
        title="Bold (Ctrl+B)"
      >
        <b>B</b>
      </button>
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('italic')}
        title="Italic (Ctrl+I)"
      >
        <i>I</i>
      </button>
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('underline')}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </button>
      
      <div class="divider divider-horizontal mx-0"></div>
      
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('insertUnorderedList')}
        title="Bullet List"
      >
        • List
      </button>
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('insertOrderedList')}
        title="Numbered List"
      >
        1. List
      </button>
      
      <div class="divider divider-horizontal mx-0"></div>
      
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('formatBlock', 'h1')}
        title="Heading 1"
      >
        H1
      </button>
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('formatBlock', 'h2')}
        title="Heading 2"
      >
        H2
      </button>
      <button
        class="btn btn-xs btn-ghost"
        onclick={() => execCommand('formatBlock', 'p')}
        title="Paragraph"
      >
        P
      </button>
    </div>
    
    <!-- Editor Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-6 space-y-4">
        <!-- Title -->
        <div class="flex justify-between items-center">
          <input
            type="text"
            value={titleValue}
            oninput={handleTitleInput}
            placeholder="Note title..."
            class="input input-ghost text-2xl font-bold flex-1 focus:outline-none"
          />
          <span class="text-sm text-base-content/70">
            {formatDateShort($currentNote.date)}
          </span>
        </div>
        
        <!-- Editor -->
        <div
          bind:this={editorElement}
          contenteditable="true"
          oninput={handleContentInput}
          onpaste={handleContentInput}
          class="prose max-w-none min-h-[400px] focus:outline-none"
        >
        </div>
      </div>
    </div>
    
    <!-- Status Bar -->
    <div class="flex justify-between items-center p-2 border-t border-base-300 bg-base-200 text-sm">
      <span class="text-base-content/70">
        {#if $autoSaveStatus === 'saving'}
          <span class="loading loading-spinner loading-xs"></span> Saving...
        {:else if $autoSaveStatus === 'synced'}
          ✓ Synced
        {:else}
          ✓ Auto-saved
        {/if}
      </span>
      <span class="text-base-content/70">
        {wordCount} word{wordCount !== 1 ? 's' : ''}
      </span>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center text-base-content/70">
      <div class="text-center">
        <p class="text-xl mb-2">Select a note to start editing</p>
        <p class="text-sm">or create a new note</p>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.prose h1) {
    font-size: 2em;
    font-weight: bold;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  :global(.prose h2) {
    font-size: 1.5em;
    font-weight: bold;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  :global(.prose p) {
    margin-bottom: 0.75em;
  }
  
  :global(.prose ul),
  :global(.prose ol) {
    margin-left: 1.5em;
    margin-bottom: 0.75em;
  }
  
  :global(.prose li) {
    margin-bottom: 0.25em;
  }
</style>
