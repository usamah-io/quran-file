<script lang="ts">
  import { page } from '$app/state';
  import { BookOpen, Headphones, Home, LayoutGrid, Search } from 'lucide-svelte';

  type NavId = 'home' | 'quran' | 'search' | 'audio' | 'more';

  const items: {
    id: NavId;
    label: string;
    href: string;
    icon: typeof Home;
  }[] = [
    { id: 'home', label: 'Beranda', href: '/', icon: Home },
    { id: 'quran', label: "Al-Qur'an", href: '/dashboard', icon: BookOpen },
    { id: 'search', label: 'Cari', href: '/dashboard?search=1', icon: Search },
    { id: 'audio', label: 'Murottal', href: '/murottal', icon: Headphones },
    { id: 'more', label: 'Lainnya', href: '/lainnya', icon: LayoutGrid }
  ];

  const activeId = $derived.by(() => {
    const path = page.url.pathname;
    const mode = page.url.searchParams.get('mode');
    const query = page.url.searchParams.get('q');

    if (path === '/') return 'home';
    if (path.startsWith('/murottal')) return 'audio';
    if (path.startsWith('/lainnya')) return 'more';
    if (path.startsWith('/dashboard')) {
      if (mode === 'asbabun_nuzul') return 'more';
      if (page.url.searchParams.get('search') === '1' || mode === 'all' || mode === 'terjemahan' || Boolean(query)) return 'search';
      return 'quran';
    }
    return 'home';
  });
</script>

<nav
  class="fixed bottom-0 inset-x-0 z-50 md:bottom-3"
  aria-label="Navigasi utama"
>
  <div
    class="mobile-bottom-nav mx-auto max-w-lg border-t border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#18211d]/95 backdrop-blur-xl shadow-[0_-5px_18px_-8px_rgba(15,23,42,0.18)] dark:shadow-[0_-5px_18px_-8px_rgba(0,0,0,0.55)] md:max-w-xl md:rounded-2xl md:border md:shadow-xl"
  >
    <ul class="grid grid-cols-5 h-[68px] px-1">
      {#each items as item}
        {@const Icon = item.icon}
        {@const isActive = activeId === item.id}
        <li class="min-w-0">
          <a
            href={item.href}
            class="flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-colors {isActive
              ? 'text-[#28684f] dark:text-[#a1c9b3]'
              : 'text-slate-500 dark:text-slate-400'}"
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={21} strokeWidth={isActive ? 2.15 : 1.75} />
            <span class="text-[10px] leading-none tracking-wide {isActive ? 'font-semibold' : 'font-medium'}">
              {item.label}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>

<style>
  .mobile-bottom-nav {
    border-top-left-radius: 1.25rem;
    border-top-right-radius: 1.25rem;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .mobile-bottom-nav a { min-height: 44px; }
  @media (min-width: 768px) {
    .mobile-bottom-nav { padding-bottom: 0; }
  }
</style>
