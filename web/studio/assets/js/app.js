/* ============================================================
   Escalemos Ecommerce — capa de experiencia

   1. Carga real, gatillada por la precarga de las siete imágenes
   2. Cursor propio, con estado sobre enlaces y sobre comparadores
   3. La apertura es una sola palabra moviéndose por el eje de ancho
   4. Revelados por intersección
   5. La frase de apertura de la sección se rediseña a sí misma al bajar
   6. Cortina de cierre
   7. Contador del precio y marcado del nav

   Sin dependencias.
   ============================================================ */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IMG = '../assets/img/';
  var TIENDAS = [
    { nombre: 'Molitos',        antes: 'molitos-antes.jpg',      despues: 'molitos-despues.jpg' },
    { nombre: 'Black Rabbit',   antes: 'black-rabbit-antes.jpg', despues: 'black-rabbit-despues.jpg' },
    { nombre: 'Barra Zero',     antes: 'barra-zero-antes.jpg',   despues: 'barra-zero-despues.jpg' },
    { nombre: 'Home Orgánika',  antes: 'home-organika-tienda-creada-desde-cero.jpg',
                                despues: 'home-organika-tienda-creada-desde-cero.jpg', sinAntes: true }
  ];

  var clamp = function (n, a, b) { return n < a ? a : n > b ? b : n; };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ============================ 1 · carga ============================ */

  var loader = document.getElementById('loader');
  var count = loader.querySelector('.loader__count');
  var bar = loader.querySelector('.loader__bar');
  var archivo = {};
  var listos = 0;

  document.body.classList.add('is-loading');

  var rutas = [];
  TIENDAS.forEach(function (t) {
    if (rutas.indexOf(t.antes) < 0) rutas.push(t.antes);
    if (rutas.indexOf(t.despues) < 0) rutas.push(t.despues);
  });

  function pintarProgreso(p) {
    var n = Math.round(p * 100);
    count.textContent = String(n).padStart(3, '0');
    bar.style.transform = 'scaleX(' + p + ')';
    loader.setAttribute('aria-valuenow', n);
  }

  var arranque = Date.now();

  function terminar() {
    var espera = Math.max(0, 700 - (Date.now() - arranque));
    setTimeout(function () {
      pintarProgreso(1);
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      iniciarTipografia();
    }, espera);
  }

  rutas.forEach(function (r) {
    // Si la imagen ya está en el documento se reusa su src. Evita pedirla
    // dos veces, y al empaquetar todo en un archivo evita repetir el
    // data URI en el HTML y en el script.
    var enDom = document.querySelector('img[data-file="' + r + '"]');
    var im = new Image();
    im.onload = im.onerror = function () {
      listos++;
      pintarProgreso(listos / rutas.length);
      if (listos === rutas.length) terminar();
    };
    im.src = enDom ? (enDom.currentSrc || enDom.getAttribute('src')) : IMG + r;
    archivo[r] = im;
  });

  /* ============================ 2 · cursor ============================ */

  var cursor = document.getElementById('cursor');
  var etiqueta = cursor.querySelector('.cursor__label');

  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var cx = 0, cy = 0, px = 0, py = 0, vivo = false;

    document.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!vivo) { px = cx; py = cy; vivo = true; cursor.classList.add('is-on'); }
      var t = e.target;
      var arrastrable = t.closest && t.closest('[data-drag]');
      var enlace = t.closest && t.closest('a, button, input[type="range"]');
      cursor.classList.toggle('is-drag', !!arrastrable);
      cursor.classList.toggle('is-link', !arrastrable && !!enlace);
      if (arrastrable) etiqueta.textContent = 'arrastra';
    });
    document.addEventListener('pointerleave', function () { cursor.classList.remove('is-on'); vivo = false; });

    (function seguir() {
      px += (cx - px) * .22;
      py += (cy - py) * .22;
      cursor.style.transform = 'translate(' + px + 'px,' + py + 'px) translate(-50%,-50%)';
      requestAnimationFrame(seguir);
    })();
  }

  /* ============================ 3 · la palabra que escala ============================ */

  /* Archivo tiene eje de ancho (wdth 62–125). Ese eje es la animación.
     En cada paso se recalcula el tamaño para que el ancho del texto siga
     siendo exactamente el de la caja: la palabra cambia de proporción sin
     despegarse de los bordes. Los anchos se miden una vez por valor entero
     y se guardan, así el bucle sólo escribe dos propiedades. */

  var mark = document.getElementById('mark');
  var pista = document.getElementById('heroHint');
  var REF = 300, W0 = 62, W1 = 125;
  var tabla = [], cajaW = 0;

  function medirTabla() {
    if (!mark) return;
    cajaW = mark.parentElement.getBoundingClientRect().width;
    var antes = mark.getAttribute('style') || '';
    mark.style.fontSize = REF + 'px';
    tabla = [];
    for (var w = W0; w <= W1; w++) {
      mark.style.fontVariationSettings = "'wdth' " + w;
      tabla[w] = mark.offsetWidth;
    }
    mark.setAttribute('style', antes);
    // se reserva la altura del caso más alto (el más angosto, que es el de
    // mayor cuerpo) para que nada salte mientras la palabra respira
    if (tabla[W0]) {
      var alto = REF * (cajaW / tabla[W0]) * 0.8;
      mark.parentElement.style.minHeight = Math.round(alto) + 'px';
    }
  }

  function pintarMarca(w) {
    if (!mark || !tabla.length) return;
    w = clamp(w, W0, W1);
    // el eje se pinta con decimales, así que el ancho se interpola entre los
    // dos enteros vecinos de la tabla; redondear dejaba la palabra hasta 9px
    // fuera del borde
    var i0 = Math.floor(w), i1 = Math.min(W1, i0 + 1);
    if (!tabla[i0] || !tabla[i1]) return;
    var ancho = tabla[i0] + (tabla[i1] - tabla[i0]) * (w - i0);
    mark.style.fontVariationSettings = "'wdth' " + w.toFixed(1);
    mark.style.fontSize = (REF * (cajaW / ancho)).toFixed(2) + 'px';
  }

  var actual = W0, objetivo = 100, finIntro = 0, ultimoPuntero = -9999, usada = false, pistaPrev = '';

  function latir(ahora) {
    if (ahora < finIntro) {
      actual = W0 + (100 - W0) * easeInOut(1 - (finIntro - ahora) / 1500);
    } else {
      var base = (ahora - ultimoPuntero < 2000)
        ? objetivo
        : 100 + Math.sin(ahora / 2400) * 5;      // respiración cuando nadie toca
      actual += (base - actual) * .12;
    }
    pintarMarca(actual);
    if (pista) {
      var t = usada ? 'Ancho ' + Math.round(actual) : 'Mueve el cursor';
      if (t !== pistaPrev) { pista.textContent = t; pistaPrev = t; }
    }
    requestAnimationFrame(latir);
  }

  function iniciarTipografia() {
    if (!mark) return;
    medirTabla();
    if (reduce) { pintarMarca(100); return; }
    finIntro = performance.now() + 1500;
    requestAnimationFrame(latir);
  }

  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      objetivo = W0 + clamp((e.clientX - r.left) / r.width, 0, 1) * (W1 - W0);
      ultimoPuntero = performance.now();
      if (!usada) { usada = true; pista.classList.add('is-used'); }
    });
  }

  var reMedir;
  window.addEventListener('resize', function () {
    clearTimeout(reMedir);
    reMedir = setTimeout(function () { medirTabla(); pintarMarca(actual); }, 160);
  });

  /* ---------- revelado letra por letra ---------- */

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.classList.add('is-split');
    var frag = document.createDocumentFragment();
    txt.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(s);
    });
    el.textContent = '';
    el.appendChild(frag);
  });

  /* ============================ 4 · revelados ============================ */

  var ojo = new IntersectionObserver(function (filas) {
    filas.forEach(function (f) {
      if (f.isIntersecting) {
        f.target.setAttribute('data-entered', 'true');
        if (f.target.classList.contains('price__grid')) contarPrecio();
        ojo.unobserve(f.target);
      }
    });
  }, { threshold: .2, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-entered]').forEach(function (el) { ojo.observe(el); });

  /* ============================ 5 · la frase que se rediseña ============================ */

  /* Mismo mecanismo que los comparadores de las tiendas: una barra que
     barre de izquierda a derecha y cambia lo que se ve. Acá lo que cambia
     no es una tienda, son las mismas palabras puestas de otra manera. */

  var about = document.querySelector('.about');
  var rebuild = document.querySelector('.rebuild');
  var regla = document.querySelector('.about__rule');

  function avanceAbout() {
    if (!about) return 0;
    var r = about.getBoundingClientRect();
    var total = about.offsetHeight - window.innerHeight;
    return clamp((-r.top) / (total || 1), 0, 1);
  }

  function pintarAbout() {
    if (!about) return;
    var p = avanceAbout();
    if (rebuild) {
      var w = clamp((p - .10) / .55, 0, 1);
      rebuild.style.setProperty('--w', (w * 100).toFixed(2) + '%');
      rebuild.classList.toggle('is-mid', w > .015 && w < .985);
    }
    if (regla) regla.style.setProperty('--rp', clamp((p - .74) / .22, 0, 1));
  }

  /* ============================ 6 · cortina ============================ */

  var contacto = document.querySelector('.contact');
  function pintarCortina() {
    if (!contacto || reduce) return;
    var r = contacto.getBoundingClientRect();
    var total = contacto.offsetHeight - window.innerHeight;
    var p = clamp((-r.top) / (total || 1), 0, 1);
    contacto.querySelector('.contact__curtain').style.setProperty('--cp', clamp(p / .34, 0, 1));
  }

  /* ============================ 7 · precio y nav ============================ */

  var contado = false;
  function contarPrecio() {
    var el = document.querySelector('.price__fig .count');
    if (!el || contado) return;
    contado = true;
    if (reduce) return;
    var meta = parseInt(el.dataset.to, 10);
    var ini = performance.now();
    (function paso(now) {
      var p = clamp((now - ini) / 1100, 0, 1);
      var v = Math.round(meta * easeInOut(p) / 1000) * 1000;
      el.textContent = '$' + v.toLocaleString('es-CL');
      if (p < 1) requestAnimationFrame(paso);
      else el.textContent = '$' + meta.toLocaleString('es-CL');
    })(ini);
  }

  var espias = document.querySelectorAll('[data-spy]');
  var secciones = ['sobre', 'trabajo', 'precio', 'contacto'].map(function (id) { return document.getElementById(id); });

  var spy = new IntersectionObserver(function (filas) {
    filas.forEach(function (f) {
      if (!f.isIntersecting) return;
      espias.forEach(function (a) { a.classList.toggle('is-active', a.dataset.spy === f.target.id); });
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  secciones.forEach(function (s) { if (s) spy.observe(s); });

  /* ============================ comparadores ============================ */

  document.querySelectorAll('.compare').forEach(function (caja) {
    var rango = caja.querySelector('.compare__range');
    if (!rango) return;
    var aplicar = function () { caja.style.setProperty('--p', rango.value + '%'); };
    rango.addEventListener('input', aplicar);
    aplicar();
  });

  /* ============================ scroll ============================ */

  /* El nav va sobre fondo oscuro en la apertura y en el cierre, y sobre
     papel en el medio. Se marca por posición en vez de mezclar, así el
     símbolo del logo conserva su naranja. */
  var navEl = document.querySelector('.nav');
  function pintarNav() {
    if (!navEl || !hero) return;
    var y = window.scrollY + 30;
    var finHero = hero.offsetTop + hero.offsetHeight;
    var iniContacto = contacto ? contacto.offsetTop : Infinity;
    navEl.classList.toggle('sobre-claro', y > finHero && y < iniContacto);
  }

  var pendiente = false;
  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      pintarAbout();
      pintarCortina();
      pintarNav();
      pendiente = false;
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  window.addEventListener('resize', alScroll);
  alScroll();
})();
