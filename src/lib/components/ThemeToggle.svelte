<script lang="ts">
  import { theme, toggleTheme } from "../stores/theme";
  import IconMoon from '~icons/lucide/moon';
  import IconSunMedium from '~icons/lucide/sun-medium';
</script>

<button class="btn btn-circle" onclick={toggleTheme}>
  {#if $theme === "light"}
    <IconMoon class="w-5 h-5" />
  {:else}
    <IconSunMedium class="w-5 h-5" />
  {/if}
</button>
