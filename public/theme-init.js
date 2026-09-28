// Applies the visitor's colour theme before the first paint (their saved choice, otherwise the
// operating-system setting), so the page never flashes the wrong theme. ThemeContext takes over after.
(function () {
  try {
    var saved = localStorage.getItem('rmast_studio_theme_v2');
    var light =
      saved === 'light' ||
      (saved !== 'dark' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
    var c = document.documentElement.classList;
    if (light) {
      c.add('theme-light');
      c.remove('theme-dark', 'dark');
    }
  } catch (e) {
    // Storage blocked: keep the default (dark)
  }
})();
