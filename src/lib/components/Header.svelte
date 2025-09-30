<script lang="ts">
  import { formatDate, searchMode } from '../stores/notes';
  import ThemeToggle from './ThemeToggle.svelte';
  
  let currentDate = formatDate(new Date());
  
  function toggleSearch() {
    searchMode.update(v => !v);
  }
</script>

<header class="navbar bg-base-200 shadow-lg px-6">
  <div class="navbar-start gap-4">
    <h1 class="text-2xl font-bold text-primary">📝 Daily Notes</h1>
    <span class="text-sm text-base-content/70">{currentDate}</span>
  </div>
  
  <div class="navbar-end gap-2">
    <button 
      class="btn btn-ghost btn-sm gap-2"
      onclick={toggleSearch}
      aria-label="Search notes"
    >
      🔍 Search
    </button>
    <ThemeToggle />
  </div>
</header>
