// Applies the visitor's colour theme before the first paint (light, unless they chose dark with the
// toggle), so the page never flashes the wrong theme. ThemeContext takes over after.
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem('rmast_studio_theme_v2');
  } catch (e) {
    // Storage blocked: use the default (light)
  }
  if (saved !== 'dark') {
    var c = document.documentElement.classList;
    c.add('theme-light');
    c.remove('theme-dark', 'dark');
  }
})();
