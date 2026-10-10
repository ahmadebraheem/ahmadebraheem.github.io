(function () {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_COLOR = { dark: '#171717', light: '#f6f6f3' };
  const GISCUS_THEME = { dark: 'transparent_dark', light: 'light' };

  const stored = () => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  };
  const systemTheme = () => (media.matches ? 'dark' : 'light');
  const current = () => root.getAttribute('data-theme') || systemTheme();

  const syncGiscus = (theme) => {
    const tag = document.querySelector('script[src="https://giscus.app/client.js"]');
    if (tag) tag.setAttribute('data-theme', GISCUS_THEME[theme]);
    const frame = document.querySelector('iframe.giscus-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: GISCUS_THEME[theme] } } },
        'https://giscus.app'
      );
    }
  };

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    syncGiscus(theme);
  };

  apply(current());

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', next); } catch (e) {}
      apply(next);
    });
  });

  // Follow live OS changes only while the visitor hasn't chosen a theme manually.
  media.addEventListener('change', () => {
    if (!stored()) apply(systemTheme());
  });

  // Giscus loads async; re-sync once its iframe appears so it matches the page theme.
  const giscusTag = document.querySelector('script[src="https://giscus.app/client.js"]');
  if (giscusTag) {
    const observer = new MutationObserver(() => {
      if (document.querySelector('iframe.giscus-frame')) {
        observer.disconnect();
        const frame = document.querySelector('iframe.giscus-frame');
        frame.addEventListener('load', () => syncGiscus(current()), { once: true });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
