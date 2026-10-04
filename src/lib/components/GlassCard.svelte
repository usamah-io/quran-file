<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    class?: string;
    variant?: 'default' | 'glow' | 'subtle' | 'interactive';
    padding?: string;
    onclick?: () => void;
  }

  let {
    children,
    class: className = '',
    variant = 'default',
    padding = 'p-6',
    onclick
  }: Props = $props();

  const variantClasses = $derived(() => {
    switch (variant) {
      case 'glow':
        return 'glass-card border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:border-emerald-500/40';
      case 'subtle':
        return 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-white/60 backdrop-blur-md border border-white/5 dark:border-white/5 light:border-slate-200/80';
      case 'interactive':
        return 'glass-card hover:-translate-y-1 hover:border-emerald-500/30 cursor-pointer active:scale-[0.99] transition-all duration-300';
      default:
        return 'glass-card';
    }
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="rounded-3xl {variantClasses()} {padding} {className} transition-all duration-300 relative overflow-hidden"
  {onclick}
>
  {@render children?.()}
</div>
