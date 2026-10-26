/* The Beat Life Club · Parcerias · comportamento. Tudo degrada bem sem JS. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header: transparente no topo, sólido depois; barra de progresso */
  var header = d.querySelector('.site-header'), bar = d.querySelector('.progress');
  function onScroll() {
    var y = window.scrollY || 0, h = d.documentElement.scrollHeight - window.innerHeight;
    
    if (bar && h > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / h) + ')';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* reveal */
  var items = d.querySelectorAll('.rv, .rv-img');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  /* vídeo do hero: pausa/continua (WCAG) */
  var hv = d.querySelector('.hero-media video'), tg = d.querySelector('.vid-toggle');
  if (hv && tg) {
    if (reduce) { hv.pause(); tg.textContent = 'Reproduzir vídeo'; tg.setAttribute('aria-pressed', 'true'); }
    tg.addEventListener('click', function () {
      if (hv.paused) { hv.play(); tg.textContent = 'Pausar vídeo'; tg.setAttribute('aria-pressed', 'false'); }
      else { hv.pause(); tg.textContent = 'Reproduzir vídeo'; tg.setAttribute('aria-pressed', 'true'); }
    });
  } else if (tg) { tg.remove(); }

  /* filtros dos formatos */
  var chips = d.querySelectorAll('.chip'), cards = d.querySelectorAll('.card[data-cat]'), live = d.getElementById('filter-live');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f'), n = 0;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      cards.forEach(function (card) {
        var show = f === 'todos' || card.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        card.hidden = !show; if (show) n++;
      });
      if (live) live.textContent = n + ' formatos exibidos';
    });
  });

  /* galeria: setas */
  var gal = d.querySelector('.gal');
  d.querySelectorAll('[data-gal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var dir = b.getAttribute('data-gal') === 'next' ? 1 : -1;
      gal.scrollBy({ left: dir * Math.min(560, gal.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* vídeo da galeria: carrega só quando visível */
  d.querySelectorAll('video[data-lazy]').forEach(function (v) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es, o) {
      es.forEach(function (e) { if (e.isIntersecting) { v.preload = 'auto'; o.disconnect(); } });
    }, { rootMargin: '300px' }).observe(v);
  });
})();

/* vídeos das aulas: clique para tocar (sem autoplay) */
document.querySelectorAll('.reel-btn').forEach(function (b) {
  b.setAttribute('aria-label', 'Reproduzir vídeo da aula de ' + b.getAttribute('data-label'));
  b.addEventListener('click', function () {
    var w = document.createElement('div'); w.className = 'reel-vid';
    var v = document.createElement('video');
    v.src = b.getAttribute('data-video'); v.poster = b.getAttribute('data-poster');
    v.controls = true; v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('aria-label', 'Aula de ' + b.getAttribute('data-label'));
    w.appendChild(v); b.replaceWith(w); v.play().catch(function () {}); v.focus();
  });
});
