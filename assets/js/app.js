/* Luca Cars | zajednički kod za sve stranice */
(function () {
  'use strict';

  var PHONE = '+381631528666';
  var WA = '381631528666';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Pomoćne funkcije ---------- */
  var nf = new Intl.NumberFormat('sr-Latn-RS');
  function money(n) { return nf.format(n) + ' €'; }
  function km(n) { return nf.format(n) + ' km'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Google slike: menja širinu na kraju linka, podešava kvalitet (-l) i traži WebP format (-rw)
  function img(url, w) {
    if (!/googleusercontent\.com/.test(url)) return url;
    var q = w <= 400 ? 70 : w <= 800 ? 72 : 82;
    return url.replace(/=[a-z0-9-]+$/i, '') + '=w' + w + '-l' + q + '-rw';
  }
  function icon(id, cls) { return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"></use></svg>'; }
  // Opciono polje "fokus" (npr. "80% 50%") pomera kadar naslovne slike
  function focus(v) { return v.fokus && /^[\d.% a-z]+$/i.test(v.fokus) ? ' style="object-position:' + v.fokus + '"' : ''; }
  function name(v) { return v.marka + ' ' + v.model; }
  function waLink(text) { return 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function waText(v) { return 'Zdravo, zanima me ' + v.marka + ' ' + v.model + ' ' + v.godiste + ' sa vašeg sajta.'; }

  var dataPromise;
  function loadVozila() {
    if (!dataPromise) {
      dataPromise = fetch('data/vozila.json')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (list) { return list.filter(function (v) { return v && v.id; }); });
    }
    return dataPromise;
  }

  /* ---------- Slike: skeleton i fade ---------- */
  function watchImages(root) {
    $$('img.fade', root).forEach(function (im) {
      if (im.dataset.watched) return;
      im.dataset.watched = '1';
      var done = function () {
        im.classList.add('is-loaded');
        var box = im.closest('.skel');
        if (box) box.classList.add('is-loaded');
      };
      im.addEventListener('load', done, { once: true });
      im.addEventListener('error', function () { if (!retry(im)) done(); });
      if (im.complete && im.naturalWidth) done();
      else if (im.complete && im.src && !im.naturalWidth && !retry(im)) done();
    });
  }
  // Ako Google slika ne stigne, pokušaj još jednom sa osnovnim linkom (bez -l i -rw)
  function retry(im) {
    var n = +(im.dataset.retried || 0);
    if (n >= 2 || !/googleusercontent\.com/.test(im.src)) return false;
    im.dataset.retried = n + 1;
    var base = im.currentSrc || im.src;
    setTimeout(function () {
      im.removeAttribute('srcset');
      var m = base.match(/=w(\d+)/);
      var w = m ? +m[1] : 800;
      // prvi put osnovni link iste širine, drugi put malo drugačija širina (novi URL, nov keš)
      im.src = base.replace(/=[a-z0-9-]+$/i, '') + '=w' + (n ? w - 2 : w);
    }, n ? 2200 : 700);
    return true;
  }
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && !t.classList.contains('fade')) retry(t);
  }, true);

  /* ---------- Reveal pri skrolovanju ---------- */
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  function reveal(root) {
    $$('[data-reveal]', root).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  }

  /* ---------- Magnetna dugmad ---------- */
  function magnetic(root) {
    if (!finePointer || reduce) return;
    $$('.magnetic', root).forEach(function (el) {
      if (el.dataset.mag) return;
      el.dataset.mag = '1';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Navigacija ---------- */
  function initNav() {
    var nav = $('[data-nav]');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var btn = $('.nav__toggle'), menu = $('#menu');
    if (!btn || !menu) return;
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.sr-only').textContent = open ? 'Zatvori meni' : 'Otvori meni';
      menu.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('lock', open);
      document.body.classList.toggle('menu-open', open);
      nav.classList.toggle('is-scrolled', open || window.scrollY > 24);
      if (open) setTimeout(function () { var a = $('a', menu); if (a) a.focus({ preventScroll: true }); }, 350);
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960 && menu.classList.contains('is-open')) setOpen(false); });
  }

  function initCallbar() {
    var bar = $('.callbar');
    if (bar) setTimeout(function () { bar.classList.add('is-on'); }, reduce ? 0 : 900);
  }

  /* ---------- Brojač ocene ---------- */
  function initCounters() {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var fmt = function (v) { return v.toFixed(1).replace('.', ','); };
      if (reduce || !('IntersectionObserver' in window)) { el.textContent = fmt(target); return; }
      el.textContent = fmt(0);
      var obs = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        obs.disconnect();
        var t0 = performance.now(), dur = 1800;
        var tick = function (t) {
          var p = Math.min(1, (t - t0) / dur);
          var e = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(target * e);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = (function () {
    var root, track, countEl, capEl, prev, next, closeBtn, items = [], index = 0, lastFocus, scrollT;
    function build() {
      root = document.createElement('div');
      root.className = 'lb';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.setAttribute('aria-label', 'Pregled fotografija');
      root.innerHTML =
        '<div class="lb__bar"><p class="lb__count num" aria-live="polite"></p>' +
        '<button class="lb__close" type="button" aria-label="Zatvori pregled">' + icon('close') + '</button></div>' +
        '<div class="lb__track"></div>' +
        '<p class="lb__cap"></p>' +
        '<button class="lb__nav lb__nav--prev" type="button" aria-label="Prethodna fotografija">' + icon('chev-l') + '</button>' +
        '<button class="lb__nav lb__nav--next" type="button" aria-label="Sledeća fotografija">' + icon('chev-r') + '</button>';
      document.body.appendChild(root);
      track = $('.lb__track', root); countEl = $('.lb__count', root); capEl = $('.lb__cap', root);
      prev = $('.lb__nav--prev', root); next = $('.lb__nav--next', root); closeBtn = $('.lb__close', root);
      closeBtn.addEventListener('click', close);
      prev.addEventListener('click', function () { go(index - 1); });
      next.addEventListener('click', function () { go(index + 1); });
      track.addEventListener('scroll', function () {
        clearTimeout(scrollT);
        scrollT = setTimeout(function () {
          var i = Math.round(track.scrollLeft / track.clientWidth);
          if (i !== index) { index = i; update(); }
        }, 60);
      }, { passive: true });
      track.addEventListener('click', function (e) { if (e.target === track || e.target.classList.contains('lb__slide')) close(); });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') go(index + 1);
        else if (e.key === 'ArrowLeft') go(index - 1);
        else if (e.key === 'Tab') {
          var f = $$('button:not([disabled])', root);
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function update() {
      countEl.innerHTML = '<b>' + pad(index + 1) + '</b> / ' + pad(items.length);
      capEl.textContent = items[index].alt || '';
      prev.disabled = index === 0;
      next.disabled = index === items.length - 1;
    }
    function go(i) {
      if (i < 0 || i >= items.length) return;
      index = i;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      update();
    }
    function open(list, i) {
      if (!root) build();
      items = list; index = i || 0;
      lastFocus = document.activeElement;
      track.innerHTML = items.map(function (it, k) {
        return '<div class="lb__slide"><img src="' + esc(img(it.src, 1600)) + '" alt="' + esc(it.alt) + '" loading="' + (Math.abs(k - index) < 2 ? 'eager' : 'lazy') + '" decoding="async" width="1600" height="1200"></div>';
      }).join('');
      root.classList.add('is-open');
      document.documentElement.classList.add('lock');
      requestAnimationFrame(function () { track.scrollLeft = index * track.clientWidth; });
      update();
      setTimeout(function () { closeBtn.focus(); }, 50);
    }
    function close() {
      root.classList.remove('is-open');
      document.documentElement.classList.remove('lock');
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    return { open: open };
  })();

  function initGalleryLightbox() {
    var items = $$('[data-lightbox]');
    if (!items.length) return;
    var list = items.map(function (el) { return { src: el.dataset.lightbox, alt: el.querySelector('img').alt }; });
    items.forEach(function (el, i) { el.addEventListener('click', function () { lb.open(list, i); }); });
  }

  /* ---------- Kartica vozila ---------- */
  function cardHTML(v, eager, still) {
    var first = v.slike && v.slike[0] ? v.slike[0] : '';
    return '<article class="card"' + (still ? '' : ' data-reveal') + '>' +
      '<a class="card__link" href="vozilo.html?id=' + encodeURIComponent(v.id) + '">' +
        '<div class="card__media media skel">' +
          (v.primer ? '<span class="tag">Primer oglasa</span>' : '') +
          '<img class="fade" src="' + esc(img(first, 800)) + '" alt="' + esc(name(v) + ', ' + (v.boja || '').toLowerCase()) + '" width="800" height="600" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async"' + focus(v) + '>' +
        '</div>' +
        '<div class="card__body">' +
          '<div class="card__top"><div><h3 class="card__title">' + esc(name(v)) + '</h3><span class="card__ver">' + esc(v.verzija || '') + '</span></div>' +
          '<p class="card__price num">' + money(v.cena) + '</p></div>' +
          '<ul class="specs num">' +
            '<li>' + icon('cal') + '<span class="sr-only">Godište </span>' + v.godiste + '.</li>' +
            '<li>' + icon('gauge') + '<span class="sr-only">Kilometraža </span>' + km(v.kilometraza) + '</li>' +
            '<li>' + icon('fuel') + '<span class="sr-only">Gorivo </span>' + esc(v.gorivo) + '</li>' +
            '<li>' + icon('gear') + '<span class="sr-only">Menjač </span>' + esc(v.menjac) + '</li>' +
          '</ul>' +
        '</div>' +
        '<span class="card__more" aria-hidden="true">' + icon('arrow') + '</span>' +
      '</a></article>';
  }
  function mount(container, html) {
    container.innerHTML = html;
    watchImages(container);
    reveal(container);
  }
  function errorHTML() {
    return '<div class="empty"><p class="h3">Ponuda trenutno nije dostupna.</p><p>Osvežite stranicu ili nas pozovite na <a class="link link--gold" href="tel:' + PHONE + '">063 152 8666</a>.</p></div>';
  }

  function uniq(arr) { return arr.filter(function (x, i) { return x && arr.indexOf(x) === i; }).sort(function (a, b) { return a.localeCompare(b, 'sr'); }); }
  function fillSelect(sel, values, current) {
    if (!sel) return;
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = v;
      if (v === current) o.selected = true;
      sel.appendChild(o);
    });
  }

  /* ---------- Početna ---------- */
  function initHome() {
    var box = $('#featured');
    var form = $('#search');
    loadVozila().then(function (list) {
      if (box) {
        var pick = list.filter(function (v) { return v.istaknuto; });
        if (pick.length < 3) pick = pick.concat(list.filter(function (v) { return !v.istaknuto; }));
        mount(box, pick.slice(0, 3).map(function (v) { return cardHTML(v); }).join(''));
      }
      if (form) {
        fillSelect(form.marka, uniq(list.map(function (v) { return v.marka; })));
        fillSelect(form.gorivo, uniq(list.map(function (v) { return v.gorivo; })));
      }
      var c = $('[data-total]');
      if (c) c.textContent = list.length;
    }).catch(function () { if (box) mount(box, errorHTML()); });

    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = new URLSearchParams();
      ['marka', 'gorivo', 'cena_do'].forEach(function (k) { if (form[k].value) p.set(k, form[k].value); });
      var q = p.toString();
      location.href = 'ponuda.html' + (q ? '?' + q : '');
    });
  }

  /* ---------- Ponuda ---------- */
  var SORTS = {
    novo: function (a, b) { return String(b.dodato || '').localeCompare(String(a.dodato || '')); },
    cena_rastuce: function (a, b) { return a.cena - b.cena; },
    cena_opadajuce: function (a, b) { return b.cena - a.cena; },
    godiste: function (a, b) { return b.godiste - a.godiste; },
    km: function (a, b) { return a.kilometraza - b.kilometraza; }
  };
  function initPonuda() {
    var form = $('#filters'), grid = $('#results'), countEl = $('#count'), chips = $('#chips');
    if (!form || !grid) return;
    var params = new URLSearchParams(location.search);
    var keys = ['marka', 'gorivo', 'cena_od', 'cena_do', 'sort'];
    var labels = { marka: '', gorivo: '', cena_od: 'od ', cena_do: 'do ' };

    loadVozila().then(function (list) {
      fillSelect(form.marka, uniq(list.map(function (v) { return v.marka; })), params.get('marka'));
      fillSelect(form.gorivo, uniq(list.map(function (v) { return v.gorivo; })), params.get('gorivo'));
      ['cena_od', 'cena_do', 'sort'].forEach(function (k) {
        var val = params.get(k);
        if (val && $('option[value="' + CSS.escape(val) + '"]', form[k])) form[k].value = val;
      });

      var render = function (push) {
        var f = {};
        keys.forEach(function (k) { f[k] = form[k].value; });
        var out = list.filter(function (v) {
          if (f.marka && v.marka !== f.marka) return false;
          if (f.gorivo && v.gorivo !== f.gorivo) return false;
          if (f.cena_od && v.cena < +f.cena_od) return false;
          if (f.cena_do && v.cena > +f.cena_do) return false;
          return true;
        }).sort(SORTS[f.sort] || SORTS.novo);

        var p = new URLSearchParams();
        keys.forEach(function (k) { if (f[k] && !(k === 'sort' && f[k] === 'novo')) p.set(k, f[k]); });
        if (push) history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));

        var n = out.length;
        countEl.innerHTML = '<strong class="num">' + n + '</strong> ' + (n % 10 === 1 && n % 100 !== 11 ? 'vozilo' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'vozila' : 'vozila');

        var active = keys.filter(function (k) { return k !== 'sort' && f[k]; });
        chips.innerHTML = active.map(function (k) {
          var txt = (k === 'cena_od' || k === 'cena_do') ? labels[k] + money(+f[k]) : f[k];
          return '<button type="button" class="chip" data-clear="' + k + '">' + esc(txt) + icon('close') + '<span class="sr-only"> ukloni filter</span></button>';
        }).join('') + (active.length ? '<button type="button" class="reset" data-clear="all">Poništi sve</button>' : '');

        if (!n) {
          mount(grid, '<div class="empty">' +
            '<svg class="road" viewBox="0 0 360 90" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 80h360" opacity=".35"/><path d="M20 80h40M90 80h40M160 80h40M230 80h40M300 80h40" stroke-width="2" opacity=".6"/><path d="M118 66c0-6 4-10 10-11l26-4 22-15c4-3 9-4 14-4h38c6 0 11 2 15 6l14 14 22 4c6 1 10 6 10 12v4h-14"/><path d="M146 70h66"/><circle cx="132" cy="70" r="10"/><circle cx="226" cy="70" r="10"/><path d="M178 36v15M160 51h86" opacity=".6"/></svg>' +
            '<p class="h3">Nema vozila za izabrane filtere.</p>' +
            '<p>Proširite raspon cene ili uklonite neki od filtera. Ako tražite nešto određeno, pozovite nas i recite šta vam treba.</p>' +
            '<div class="btn-row"><button type="button" class="btn btn--gold magnetic" data-clear="all">Prikaži sva vozila</button><a class="btn btn--ghost magnetic" href="tel:' + PHONE + '">' + icon('phone') + '063 152 8666</a></div>' +
          '</div>');
          magnetic(grid);
        } else {
          mount(grid, out.map(function (v, i) { return cardHTML(v, i < 2, true); }).join(''));
        }
      };

      form.addEventListener('change', function () { render(true); });
      form.addEventListener('submit', function (e) { e.preventDefault(); render(true); });
      document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-clear]');
        if (!b) return;
        var k = b.dataset.clear;
        if (k === 'all') { ['marka', 'gorivo', 'cena_od', 'cena_do'].forEach(function (x) { form[x].value = ''; }); }
        else form[k].value = '';
        render(true);
        if (k === 'all') form.marka.focus();
      });
      render(false);
    }).catch(function () { mount(grid, errorHTML()); });
  }

  /* ---------- Stranica vozila ---------- */
  function initVozilo() {
    var root = $('#vozilo');
    if (!root) return;
    var id = new URLSearchParams(location.search).get('id');
    loadVozila().then(function (list) {
      var v = list.filter(function (x) { return x.id === id; })[0];
      if (!v) { renderMissing(root); return; }
      renderVozilo(root, v, list);
    }).catch(function () { mount(root, '<div class="wrap v-top">' + errorHTML() + '</div>'); });
  }

  function renderMissing(root) {
    document.title = 'Vozilo nije pronađeno | Luca Cars Sombor';
    mount(root, '<section class="page-head grain"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Putanja"><a href="index.html">Početna</a><span class="sep"></span><a href="ponuda.html">Ponuda</a></nav>' +
      '<h1>Ovo vozilo više nije u ponudi.</h1>' +
      '<p class="lead">Moguće je da je prodato ili da je link pogrešan. Pogledajte šta je trenutno na placu.</p>' +
      '<div class="btn-row" style="margin-top:36px"><a class="btn btn--gold magnetic" href="ponuda.html">Pogledajte ponudu' + icon('arrow', 'i--arrow') + '</a><a class="btn btn--ghost magnetic" href="tel:' + PHONE + '">' + icon('phone') + '063 152 8666</a></div>' +
      '</div></section>');
    magnetic(root);
  }

  function renderVozilo(root, v, list) {
    var title = name(v) + ' ' + (v.verzija || '');
    document.title = title + ' (' + v.godiste + '.) | Luca Cars Sombor';
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', title + ', ' + v.godiste + '. godište, ' + km(v.kilometraza) + ', ' + v.gorivo.toLowerCase() + '. Cena ' + money(v.cena) + '. Luca Cars, Ilije Birčanina 60, Sombor.');

    var slike = (v.slike || []).filter(Boolean);
    var many = slike.length > 1;
    var alt = function (i) { return name(v) + ', fotografija ' + (i + 1) + ' od ' + slike.length; };
    var kw = v.snaga_kw ? v.snaga_kw + ' kW (' + Math.round(v.snaga_kw * 1.36) + ' KS)' : '';
    var rows = [
      ['Marka', v.marka], ['Model', v.model], ['Motor', v.verzija], ['Godište', v.godiste ? v.godiste + '.' : ''],
      ['Kilometraža', v.kilometraza != null ? km(v.kilometraza) : ''], ['Gorivo', v.gorivo], ['Menjač', v.menjac],
      ['Snaga', kw], ['Kubikaža', v.kubikaza ? nf.format(v.kubikaza) + ' cm³' : ''], ['Karoserija', v.karoserija],
      ['Pogon', v.pogon], ['Boja', v.boja], ['Broj vrata', v.vrata]
    ].filter(function (r) { return r[1]; });
    var opis = String(v.opis || '').split(/\n+/).filter(Boolean);
    var primerNote = '';

    var html =
      '<div class="wrap v-top">' +
        '<nav class="crumbs" aria-label="Putanja"><a href="index.html">Početna</a><span class="sep"></span><a href="ponuda.html">Ponuda</a><span class="sep"></span><span aria-current="page">' + esc(name(v)) + '</span></nav>' +
        '<div class="v-grid">' +
          '<section class="vg" aria-label="Fotografije">' +
            '<div class="vg__main">' +
              (v.primer ? '<span class="tag">Primer oglasa</span>' : '') +
              '<div class="vg__track" tabindex="0" aria-label="Fotografije vozila, prevucite za sledeću">' +
                slike.map(function (s, i) {
                  return '<button type="button" class="vg__slide media skel" data-i="' + i + '" aria-label="Uvećaj fotografiju ' + (i + 1) + '">' +
                    '<img class="fade" src="' + esc(img(s, 1600)) + '" srcset="' + esc(img(s, 800)) + ' 800w, ' + esc(img(s, 1600)) + ' 1600w" sizes="(min-width: 1024px) 62vw, 100vw" alt="' + esc(alt(i)) + '" width="1600" height="1200" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async"' + (i === 0 ? focus(v) : '') + '></button>';
                }).join('') +
              '</div>' +
              (many ? '<button type="button" class="vg__nav vg__nav--prev" aria-label="Prethodna fotografija" disabled>' + icon('chev-l') + '</button><button type="button" class="vg__nav vg__nav--next" aria-label="Sledeća fotografija">' + icon('chev-r') + '</button>' : '') +
              (many ? '<span class="vg__count num" aria-live="polite">1 / ' + slike.length + '</span>' : '') +
              '<button type="button" class="vg__full" aria-label="Prikaz preko celog ekrana">' + icon('expand') + '</button>' +
            '</div>' +
            (many ? '<div class="vg__thumbs">' + slike.map(function (s, i) {
              return '<button type="button" class="vg__thumb media skel" data-i="' + i + '" aria-label="Fotografija ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><img class="fade" src="' + esc(img(s, 400)) + '" alt="" width="400" height="300" loading="lazy" decoding="async"></button>';
            }).join('') + '</div>' : '') +
          '</section>' +
          '<aside class="v-aside">' +
            '<div class="v-panel">' +
              '<h1 class="v-title">' + esc(name(v)) + '</h1>' +
              '<p class="v-ver">' + esc([v.verzija, v.karoserija, v.boja].filter(Boolean).join(', ')) + '</p>' +
              '<div class="v-price"><span class="label">Cena</span><strong class="num">' + money(v.cena) + '</strong></div>' +
              '<ul class="v-keys num">' +
                '<li>' + icon('cal') + '<span><small>Godište</small>' + v.godiste + '.</span></li>' +
                '<li>' + icon('gauge') + '<span><small>Kilometraža</small>' + km(v.kilometraza) + '</span></li>' +
                '<li>' + icon('fuel') + '<span><small>Gorivo</small>' + esc(v.gorivo) + '</span></li>' +
                '<li>' + icon('gear') + '<span><small>Menjač</small>' + esc(v.menjac) + '</span></li>' +
              '</ul>' +
              '<div class="v-actions">' +
                '<a class="btn btn--gold btn--block magnetic" href="tel:' + PHONE + '">' + icon('phone') + 'Pozovi 063 152 8666</a>' +
                '<a class="btn btn--ghost btn--block magnetic" href="' + esc(waLink(waText(v))) + '" target="_blank" rel="noopener">' + icon('wa') + 'Pišite na WhatsApp</a>' +
              '</div>' +
            '</div>' +
            '<p class="v-note">' + icon('pin') + '<span>Vozilo možete pogledati na placu u Ilije Birčanina 60, Sombor. Najavite dolazak telefonom.</span></p>' +
          '</aside>' +
        '</div>' +
        '<div class="v-details">' +
          '<section aria-labelledby="h-spec"><h2 class="v-sub" id="h-spec">Specifikacija</h2><dl class="spec-table num">' +
            rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') +
          '</dl></section>' +
          '<section class="v-desc" aria-labelledby="h-desc"><h2 class="v-sub" id="h-desc">Opis</h2>' + primerNote +
            opis.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
            (v.oprema && v.oprema.length ? '<h2 class="v-sub" style="margin-top:48px">Oprema</h2><ul class="equip">' + v.oprema.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' : '') +
          '</section>' +
        '</div>' +
      '</div>';

    var similar = list.filter(function (x) { return x.id !== v.id; }).map(function (x) {
      var s = 0;
      if (x.marka === v.marka) s += 2;
      if (x.karoserija === v.karoserija) s += 1;
      if (Math.abs(x.cena - v.cena) <= v.cena * 0.35) s += 1.5;
      return { v: x, s: s - Math.abs(x.cena - v.cena) / 100000 };
    }).sort(function (a, b) { return b.s - a.s; }).slice(0, 3).map(function (o) { return o.v; });

    if (similar.length) {
      html += '<section class="section" aria-labelledby="h-sim"><div class="wrap">' +
        '<header class="sec-head"><p class="sec-label"><span class="sec-label__num">+</span><span class="sec-label__rule"></span>Još iz ponude</p>' +
        '<div class="sec-head__row"><h2 class="h2" id="h-sim">Slična vozila</h2><a class="link link--gold" href="ponuda.html">Cela ponuda' + icon('arrow') + '</a></div></header>' +
        '<div class="cards">' + similar.map(function (x) { return cardHTML(x); }).join('') + '</div>' +
        '</div></section>';
    }

    mount(root, html);
    magnetic(root);
    injectCarSchema(v, slike);

    // Galerija sa swipe-om
    var track = $('.vg__track', root);
    var count = $('.vg__count', root);
    var pv = $('.vg__nav--prev', root), nx = $('.vg__nav--next', root);
    var thumbs = $$('.vg__thumb', root);
    var cur = 0, t;
    var items = slike.map(function (s, i) { return { src: s, alt: alt(i) }; });
    var setCur = function (i) {
      cur = i;
      if (count) count.textContent = (i + 1) + ' / ' + slike.length;
      if (pv) pv.disabled = i === 0;
      if (nx) nx.disabled = i === slike.length - 1;
      thumbs.forEach(function (th, k) {
        if (k === i) { th.setAttribute('aria-current', 'true'); th.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
        else th.removeAttribute('aria-current');
      });
    };
    var goTo = function (i) {
      i = Math.max(0, Math.min(slike.length - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      setCur(i);
    };
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        if (i !== cur) setCur(i);
      }, 60);
    }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); }
    });
    if (pv) pv.addEventListener('click', function () { goTo(cur - 1); });
    if (nx) nx.addEventListener('click', function () { goTo(cur + 1); });
    thumbs.forEach(function (th) { th.addEventListener('click', function () { goTo(+th.dataset.i); }); });
    $$('.vg__slide', root).forEach(function (s) { s.addEventListener('click', function () { lb.open(items, +s.dataset.i); }); });
    $('.vg__full', root).addEventListener('click', function () { lb.open(items, cur); });
    // Posle učitavanja stranice dovuci i ostale fotografije galerije
    var warm = function () { $$('.vg__slide img[loading="lazy"]', root).forEach(function (im) { im.loading = 'eager'; }); };
    if (document.readyState === 'complete') setTimeout(warm, 600); else window.addEventListener('load', function () { setTimeout(warm, 600); });
  }

  function injectCarSchema(v, slike) {
    var data = {
      '@context': 'https://schema.org',
      '@type': 'Car',
      name: name(v) + ' ' + (v.verzija || ''),
      brand: { '@type': 'Brand', name: v.marka },
      model: v.model,
      vehicleModelDate: String(v.godiste),
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.kilometraza, unitCode: 'KMT' },
      fuelType: v.gorivo,
      vehicleTransmission: v.menjac,
      color: v.boja,
      image: slike.map(function (s) { return img(s, 1600); }),
      offers: {
        '@type': 'Offer', price: v.cena, priceCurrency: 'EUR', availability: 'https://schema.org/InStock',
        seller: { '@type': 'AutoDealer', name: 'Luca Cars DOO', telephone: PHONE }
      }
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Mapa se učitava tek kad se približi ekranu ---------- */
  function initMaps() {
    var frames = $$('iframe[data-src]');
    if (!frames.length) return;
    var load = function (f) { f.src = f.dataset.src; f.removeAttribute('data-src'); };
    if (!('IntersectionObserver' in window)) { frames.forEach(load); return; }
    var obs = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { load(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    frames.forEach(function (f) { obs.observe(f); });
  }

  /* ---------- Kontakt forma (šalje preko WhatsApp-a) ---------- */
  function initContactForm() {
    var f = $('#wa-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.poruka.value.trim();
      var ime = f.ime.value.trim();
      if (!msg) { f.poruka.focus(); f.poruka.setAttribute('aria-invalid', 'true'); return; }
      f.poruka.removeAttribute('aria-invalid');
      var text = 'Zdravo, ' + (ime ? 'ovde ' + ime + '. ' : '') + msg;
      window.open(waLink(text), '_blank', 'noopener');
    });
  }

  /* ---------- Start ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initCallbar();
    watchImages(document);
    reveal(document);
    magnetic(document);
    initCounters();
    initGalleryLightbox();
    initContactForm();
    initMaps();
    var y = $('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
    var page = document.body.dataset.page;
    if (page === 'home') initHome();
    if (page === 'ponuda') initPonuda();
    if (page === 'vozilo') initVozilo();
  });
})();
