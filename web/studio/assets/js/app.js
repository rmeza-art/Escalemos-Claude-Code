/* ============================================================
   Escalemos Ecommerce — capa de experiencia

   1. Carga real, gatillada por la precarga de las siete imágenes
   2. Cursor propio, con estado sobre enlaces y sobre comparadores
   3. Canvas de apertura: las cuatro tiendas pasando de antes a después
   4. Revelados por intersección
   5. El párrafo del estudio se enciende palabra por palabra con el scroll
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
      iniciarEscena();
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

  /* ============================ 3 · canvas de apertura ============================ */

  var lienzo = document.getElementById('scene');
  var ctx = lienzo.getContext('2d');
  var rotulo = document.getElementById('heroNow');
  var DUR = 4200;   // lo que dura una tienda
  var idx = 0, t0 = 0, manual = -1, ultimoToque = 0;

  function medir() {
    var r = lienzo.getBoundingClientRect();
    var d = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(r.width * d);
    lienzo.height = Math.round(r.height * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    return r;
  }

  function cubrir(img, w, h) {
    if (!img || !img.naturalWidth) return;
    var ri = img.naturalWidth / img.naturalHeight;
    var rc = w / h;
    var dw, dh;
    if (ri > rc) { dh = h; dw = h * ri; } else { dw = w; dh = w / ri; }
    ctx.drawImage(img, (w - dw) / 2, 0, dw, dh);   // anclado arriba, como en las fichas
  }

  function cuadro(ahora) {
    var r = lienzo.getBoundingClientRect();
    var w = r.width, h = r.height;
    if (!w || !h) { requestAnimationFrame(cuadro); return; }

    var tienda = TIENDAS[idx];
    var p;
    if (manual >= 0 && ahora - ultimoToque < 1600) {
      p = manual;
    } else {
      if (manual >= 0) { manual = -1; t0 = ahora; }
      var e = (ahora - t0) / DUR;
      if (e >= 1) { idx = (idx + 1) % TIENDAS.length; t0 = ahora; e = 0; tienda = TIENDAS[idx]; }
      p = easeInOut(clamp((e - .18) / .58, 0, 1));   // entra, barre, descansa
    }

    ctx.clearRect(0, 0, w, h);
    cubrir(archivo[tienda.antes], w, h);

    if (!tienda.sinAntes) {
      var x = w * p;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, x, h);
      ctx.clip();
      cubrir(archivo[tienda.despues], w, h);
      ctx.restore();
      if (p > .001 && p < .999) {
        ctx.fillStyle = '#F85C0F';
        ctx.fillRect(x - 1, 0, 2, h);
      }
    }

    var texto = tienda.sinAntes
      ? tienda.nombre + ' · creada desde cero'
      : tienda.nombre + ' · antes → después';
    if (rotulo.textContent !== texto) rotulo.textContent = texto;

    requestAnimationFrame(cuadro);
  }

  function iniciarEscena() {
    medir();
    if (reduce) {
      var w = lienzo.getBoundingClientRect().width, h = lienzo.getBoundingClientRect().height;
      cubrir(archivo[TIENDAS[0].antes], w, h);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w * .55, h); ctx.clip();
      cubrir(archivo[TIENDAS[0].despues], w, h); ctx.restore();
      ctx.fillStyle = '#F85C0F'; ctx.fillRect(w * .55 - 1, 0, 2, h);
      return;
    }
    t0 = performance.now();
    requestAnimationFrame(cuadro);
  }

  window.addEventListener('resize', function () { medir(); });

  // la apertura responde al puntero: el barrido sigue el cursor
  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      manual = clamp((e.clientX - r.left) / r.width, 0, 1);
      ultimoToque = performance.now();
    });
  }

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

  /* ============================ 5 · palabra por palabra ============================ */

  var about = document.querySelector('.about');
  var palabras = Array.prototype.slice.call(document.querySelectorAll('.about__copy b'));
  var regla = document.querySelector('.about__rule');

  function pintarAbout() {
    if (!about) return;
    var r = about.getBoundingClientRect();
    var total = about.offsetHeight - window.innerHeight;
    var p = clamp((-r.top) / (total || 1), 0, 1);
    var hasta = Math.round(clamp(p / .78, 0, 1) * palabras.length);
    for (var i = 0; i < palabras.length; i++) palabras[i].classList.toggle('on', i < hasta);
    if (regla) regla.style.setProperty('--rp', clamp((p - .72) / .24, 0, 1));
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

  var pendiente = false;
  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      pintarAbout();
      pintarCortina();
      pendiente = false;
    });
  }
  window.addEventListener('scroll', alScroll, { passive: true });
  window.addEventListener('resize', alScroll);
  alScroll();
})();
