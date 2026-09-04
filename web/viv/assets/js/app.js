/* ============================================================
   Escalemos Ecommerce — versión ViV

   Cuatro cosas: el router por hash, los comparadores, el footer
   que se revela bajo el contenido y la miniatura que sigue al
   cursor sobre la lista de trabajo del footer.
   ============================================================ */

(function () {
  'use strict';

  var ROUTES = {
    inicio: 'home', trabajo: 'trabajo', precio: 'precio', sobre: 'sobre',
    contacto: 'contacto', molitos: 'mol', organika: 'org',
    'black-rabbit': 'br', 'barra-zero': 'bz'
  };
  var CASES = { mol: 1, org: 1, br: 1, bz: 1 };
  var TITLES = {
    home: 'Escalemos Ecommerce — Estudio de tiendas Shopify',
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

    var key = CASES[next] ? 'trabajo' : next;
    for (var j = 0; j < navLinks.length; j++) {
      var link = navLinks[j];
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
      if (link.getAttribute('data-nav') === key) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    }

    document.title = TITLES[next] || TITLES.home;
    window.scrollTo(0, 0);
    measureFooter();
  }

  window.addEventListener('hashchange', function () { render(screenFromHash()); });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var key = a.getAttribute('href').slice(1);
    if (!ROUTES[key]) return;
    e.preventDefault();
    try {
      if (window.location.hash !== '#' + key) window.location.hash = '#' + key;
    } catch (err) { /* sin hash disponible: basta el render directo */ }
    render(ROUTES[key]);
    window.scrollTo(0, 0);
  });

  /* ---------------- comparadores ---------------- */

  var boxes = document.querySelectorAll('.compare');
  for (var k = 0; k < boxes.length; k++) {
    (function (box) {
      var range = box.querySelector('.compare__range');
      if (!range) return;
      var apply = function () { box.style.setProperty('--p', range.value + '%'); };
      range.addEventListener('input', apply);
      apply();
    })(boxes[k]);
  }

  /* ---------------- footer que se revela ----------------
     El contenido se desliza por encima del footer, que queda fijo al
     fondo. Sólo se activa cuando el footer cabe holgadamente en la
     pantalla; si no, se queda estático y el sitio funciona igual. */

  var foot = document.querySelector('.foot');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function measureFooter() {
    if (!foot) return;
    document.body.classList.remove('has-reveal');
    document.body.style.removeProperty('--foot-h');
    var h = foot.offsetHeight;
    if (reduce.matches) return;
    if (window.innerWidth < 900) return;
    if (h > window.innerHeight * 0.9) return;
    document.body.style.setProperty('--foot-h', h + 'px');
    document.body.classList.add('has-reveal');
  }

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(measureFooter, 150);
  });

  /* ---------------- miniatura al pasar el cursor ---------------- */

  var peek = document.querySelector('.foot__peek');
  var peekLinks = document.querySelectorAll('.foot__links a[data-img]');
  if (peek && peekLinks.length && window.matchMedia('(pointer: fine)').matches) {
    var move = function (e) {
      peek.style.top = e.clientY + 'px';
      peek.style.left = e.clientX + 'px';
    };
    for (var m = 0; m < peekLinks.length; m++) {
      (function (a) {
        a.addEventListener('mouseenter', function (e) {
          peek.style.backgroundImage = 'url("' + a.dataset.img + '")';
          peek.style.backgroundColor = a.dataset.tone || '#333';
          peek.classList.add('is-on');
          move(e);
        });
        a.addEventListener('mousemove', move);
        a.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); });
      })(peekLinks[m]);
    }
  }

  render(screenFromHash());
  window.addEventListener('load', measureFooter);
})();
