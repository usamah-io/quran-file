<script lang="ts">
  import { Motion } from 'svelte-motion';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
    class?: string;
    delay?: number;
    hoverScale?: number;
    hoverY?: number;
    onclick?: () => void;
  }

  let {
    children,
    class: className = '',
    delay = 0,
    hoverScale = 1.015,
    hoverY = -4,
    onclick
  }: Props = $props();
</script>

<Motion
  initial={{ opacity: 0, y: 22, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    type: 'spring',
    stiffness: 280,
    damping: 24,
    delay
  }}
  whileHover={{
    scale: hoverScale,
    y: hoverY,
    transition: { type: 'spring', stiffness: 400, damping: 22 }
  }}
  whileTap={{ scale: 0.98 }}
  let:motion
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div use:motion class={className} {onclick}>
    {@render children?.()}
  </div>
</Motion>
