/* Calle 23 — interacciones del tema.
   El catálogo y las preguntas frecuentes se renderizan en Liquid, no aquí.
   Este archivo sólo maneja comportamiento: carril, filtros, carrito, acordeón,
   cuenta regresiva, marquesinas, menú móvil y apariciones al hacer scroll. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- avisos ---------- */
  var toast = document.getElementById('toast');
  var toastText = document.getElementById('toastText');
  var toastTimer;
  function aviso(txt) {
    if (!toast) return;
    toastText.textContent = txt;
    toast.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.setAttribute('data-show', 'false'); }, 3200);
  }

  /* ---------- switch de carril menudeo / mayoreo ----------
     Visual únicamente. El precio real lo decide Shopify según la lista de
     precios del cliente; ver NOTAS-SHOPIFY.md. Se recuerda la elección para
     que el mayorista no la repita en cada página. */
  function setLane(lane) {
    root.setAttribute('data-lane', lane);
    document.querySelectorAll('[data-lane-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lane-btn') === lane));
    });
    try { localStorage.setItem('calle23-lane', lane); } catch (e) {}
  }
  document.querySelectorAll('[data-lane-btn]').forEach(function (b) {
    b.addEventListener('click', function () { setLane(b.getAttribute('data-lane-btn')); });
  });
  var laneGuardado = 'menudeo';
  try { laneGuardado = localStorage.getItem('calle23-lane') || 'menudeo'; } catch (e) {}
  setLane(laneGuardado === 'mayoreo' ? 'mayoreo' : 'menudeo');

  /* ---------- filtros del catálogo ---------- */
  var contador = document.getElementById('filterCount');
  document.querySelectorAll('[data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      var visibles = 0;
      document.querySelectorAll('.card').forEach(function (card) {
        var tags = (card.getAttribute('data-cat') || '').split(' ');
        var ok = f === 'todos' || tags.indexOf(f) > -1;
        card.hidden = !ok;
        if (ok) visibles++;
      });
      if (contador) contador.textContent = visibles + (visibles === 1 ? ' modelo' : ' modelos');
    });
  });

  /* ---------- selección de talla ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.size');
    if (!b || b.disabled) return;
    var activa = b.getAttribute('aria-pressed') === 'true';
    b.parentElement.querySelectorAll('.size').forEach(function (s) {
      s.setAttribute('aria-pressed', 'false');
    });
    b.setAttribute('aria-pressed', activa ? 'false' : 'true');
    var card = b.closest('.card');
    if (card) card.setAttribute('data-variant', activa ? '' : (b.getAttribute('data-variant') || ''));
  });

  /* ---------- carrito ---------- */
  var cartCount = document.getElementById('cartCount');
  var cartBtn = document.getElementById('cartBtn');
  function pintarCarrito(n) {
    if (cartCount) { cartCount.textContent = n; cartCount.hidden = n < 1; }
    if (cartBtn) cartBtn.setAttribute('aria-label', 'Carrito, ' + n + ' artículos');
  }
  function refrescarCarrito() {
    fetch(window.Shopify ? '/cart.js' : '', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (c) { pintarCarrito(c.item_count); })
      .catch(function () {});
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-add]');
    if (!b) return;
    var card = b.closest('.card');
    var nombre = b.getAttribute('data-add');
    var qty = root.getAttribute('data-lane') === 'mayoreo'
      ? parseInt(b.getAttribute('data-moq') || '6', 10) : 1;
    var variante = card && card.getAttribute('data-variant');

    if (!variante) {
      // Tarjeta de demostración, o talla sin elegir: no hay variante que mandar.
      aviso(card && card.querySelector('.size')
        ? 'Elige una talla primero'
        : nombre + ' · conecta una colección real para vender');
      return;
    }

    b.disabled = true;
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(variante), quantity: qty }] })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('rechazado');
        return r.json();
      })
      .then(function () {
        aviso(nombre + ' · ' + qty + (qty === 1 ? ' par agregado' : ' pares agregados'));
        refrescarCarrito();
      })
      .catch(function () { aviso('No se pudo agregar. Revisa la existencia de esa talla.'); })
      .then(function () { b.disabled = false; });
  });

  /* ---------- preguntas frecuentes ---------- */
  var faqList = document.getElementById('faqList');
  if (faqList) {
    var botones = faqList.querySelectorAll('.faq-q');
    botones.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var abierto = btn.getAttribute('aria-expanded') === 'true';
        botones.forEach(function (o) {
          if (o === btn) return;
          o.setAttribute('aria-expanded', 'false');
          var op = document.getElementById(o.getAttribute('aria-controls'));
          if (op) op.style.height = '0px';
        });
        btn.setAttribute('aria-expanded', abierto ? 'false' : 'true');
        panel.style.transition = 'height 300ms cubic-bezier(.2,.9,.12,1)';
        panel.style.height = abierto ? '0px' : panel.scrollHeight + 'px';
      });
    });
  }

  /* ---------- cuenta regresiva al próximo drop ---------- */
  var cd = document.getElementById('countdown');
  if (cd) {
    var diaObjetivo = parseInt(cd.getAttribute('data-dia') || '5', 10); // 0 domingo … 5 viernes
    var horaObjetivo = parseInt(cd.getAttribute('data-hora') || '20', 10);
    var celdas = {};
    cd.querySelectorAll('[data-cd]').forEach(function (el) { celdas[el.getAttribute('data-cd')] = el; });

    function proximoDrop() {
      var ahora = new Date();
      var d = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaObjetivo, 0, 0, 0);
      var faltan = (diaObjetivo - d.getDay() + 7) % 7;
      if (faltan === 0 && ahora.getTime() >= d.getTime()) faltan = 7;
      d.setDate(d.getDate() + faltan);
      return d;
    }
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var ms = proximoDrop() - new Date();
      if (ms < 0) ms = 0;
      var s = Math.floor(ms / 1000);
      if (celdas.d) celdas.d.textContent = pad(Math.floor(s / 86400));
      if (celdas.h) celdas.h.textContent = pad(Math.floor((s % 86400) / 3600));
      if (celdas.m) celdas.m.textContent = pad(Math.floor((s % 3600) / 60));
      if (celdas.s) celdas.s.textContent = pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- marquesinas sin costura ---------- */
  document.querySelectorAll('[data-marquee-group]').forEach(function (g) {
    if (g.parentElement) g.parentElement.appendChild(g.cloneNode(true));
  });

  /* ---------- menú móvil ---------- */
  var menu = document.getElementById('mobileMenu');
  var burger = document.getElementById('burger');
  function abrirMenu(abierto) {
    if (!menu) return;
    menu.hidden = !abierto;
    document.body.style.overflow = abierto ? 'hidden' : '';
    if (burger) burger.setAttribute('aria-expanded', String(abierto));
  }
  if (burger) burger.addEventListener('click', function () { abrirMenu(true); });
  var closeMenu = document.getElementById('closeMenu');
  if (closeMenu) closeMenu.addEventListener('click', function () { abrirMenu(false); });
  document.querySelectorAll('[data-close]').forEach(function (a) {
    a.addEventListener('click', function () { abrirMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) abrirMenu(false);
  });

  /* ---------- aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    document.body.classList.add('all-visible');
  }
  setTimeout(function () { document.body.classList.add('all-visible'); }, 2400);

  if (window.Shopify) refrescarCarrito();
})();
