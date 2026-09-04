/* ============================================================
   Escalemos Ecommerce
   Router por hash + comparadores antes/después.

   Reproduce la lógica del prototipo «Escalemos Ecommerce v2.dc.html»:
   una sola página con nueve pantallas, navegación por hash, y el
   subrayado del nav marcando Trabajo también dentro de cada caso.
   ============================================================ */

(function () {
  'use strict';

  /* hash → pantalla */
  var ROUTES = {
    inicio: 'home',
    trabajo: 'trabajo',
    precio: 'precio',
    sobre: 'sobre',
    contacto: 'contacto',
    molitos: 'mol',
    organika: 'org',
    'black-rabbit': 'br',
    'barra-zero': 'bz'
  };

  /* pantallas que son un caso: mantienen «Trabajo» activo en el nav */
  var CASES = { mol: 1, org: 1, br: 1, bz: 1 };

  var TITLES = {
    home: 'Escalemos Ecommerce — Tiendas Shopify con identidad propia',
    trabajo: 'El trabajo — Escalemos Ecommerce',
    mol: 'Molitos — Escalemos Ecommerce',
    org: 'Home Orgánika — Escalemos Ecommerce',
    br: 'Black Rabbit — Escalemos Ecommerce',
    bz: 'Barra Zero — Escalemos Ecommerce',
    precio: 'El precio — Escalemos Ecommerce',
    sobre: 'Sobre — Escalemos Ecommerce',
    contacto: 'Contacto — Escalemos Ecommerce'
  };

  var screens = document.querySelectorAll('[data-screen]');
  var navLinks = document.querySelectorAll('[data-nav]');
  var current = null;

  /* Reinicia una animación CSS ya consumida por el elemento. */
  function replay(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  function screenFromHash() {
    var h = (window.location.hash || '').replace('#', '');
    return ROUTES[h] || 'home';
  }

  function render(next) {
    if (next === current) return;
    current = next;

    for (var i = 0; i < screens.length; i++) {
      var el = screens[i];
      var on = el.getAttribute('data-screen') === next;
      el.hidden = !on;
      if (on) replay(el);
    }

    var navKey = CASES[next] ? 'trabajo' : next;
    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
      if (link.getAttribute('data-nav') === navKey) {
        void link.offsetWidth;
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    }

    document.title = TITLES[next] || TITLES.home;
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', function () {
    render(screenFromHash());
  });

  /* Volver arriba también cuando se pincha el hash ya activo
     (en ese caso el navegador no dispara hashchange). */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    if (a.getAttribute('href') === window.location.hash) {
      e.preventDefault();
      window.scrollTo(0, 0);
    }
  });

  /* ---------------- comparadores antes / después ---------------- */

  var compares = document.querySelectorAll('.compare');
  for (var k = 0; k < compares.length; k++) {
    (function (box) {
      var range = box.querySelector('.compare__range');
      if (!range) return;
      var apply = function () {
        box.style.setProperty('--p', range.value + '%');
      };
      range.addEventListener('input', apply);
      apply();
    })(compares[k]);
  }

  render(screenFromHash());
})();
