<script lang="ts">
  import { onMount } from "svelte";
  import { theme, initializeTheme } from "./lib/stores/theme";
  import { loadNotesFromStorage, initializeToday } from "./lib/stores/notes";
  import { setupKeyboardShortcuts } from "./lib/utils/keyboard";

  import Header from "./lib/components/Header.svelte";
  import SearchBar from "./lib/components/SearchBar.svelte";
  import Navigation from "./lib/components/Navigation.svelte";
  import NotesList from "./lib/components/NotesList.svelte";
  import Editor from "./lib/components/Editor.svelte";

  onMount(async () => {
    initializeTheme();
    await loadNotesFromStorage();
    await initializeToday();
    setupKeyboardShortcuts();
  });
</script>

<div class="h-screen flex flex-col bg-base-100" data-theme={$theme}>
  <Header />
  <SearchBar />
  <Navigation />
  
  <div class="flex flex-1 overflow-hidden">
    <NotesList />
    <Editor />
  </div>
</div>
