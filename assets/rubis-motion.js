/* Éclat Rubis : animations (GSAP + ScrollTrigger)
   Personnalité « Premium » : une courbe (power2.out), trois durées (0.35 / 0.6 / 1.2 s), pas de rebond.
   Un seul grand moment : la lumière du héros qui s'allume. Le reste reste calme.
   Tout est désactivé si la personne a demandé moins d'animations. */
(function () {
  'use strict';

  var root = document.documentElement;
  var EASE = 'power2.out';
  var D = { quick: 0.35, std: 0.6, slow: 1.2 };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function showAll(scope) {
    (scope || document).querySelectorAll('[data-er-reveal]').forEach(function (el) {
      el.style.opacity = 1;
    });
  }

  /* Ce qui doit marcher même sans GSAP : galerie au doigt et barre d'achat fixe. */
  function initGallery() {
    document.querySelectorAll('[data-er-gallery]').forEach(function (g) {
      var track = g.querySelector('[data-er-gallery-track]');
      var dots = g.querySelector('[data-er-gallery-dots]');
      if (!track || !dots) return;
      var n = track.children.length;
      if (n < 2) return;
      for (var i = 0; i < n; i++) dots.appendChild(document.createElement('i'));
      var current = -1;
      function update() {
        var idx = Math.round(track.scrollLeft / track.clientWidth);
        if (idx === current) return;
        current = idx;
        Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('is-on', j === idx); });
      }
      var ticking = false;
      track.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; update(); });
      }, { passive: true });
      update();
    });
  }

  function initSticky() {
    document.querySelectorAll('[data-er-sticky]').forEach(function (bar) {
      var scope = bar.closest('[data-er-product]') || document;
      var button = scope.querySelector('[data-er-buy-button]');
      if (!button || !('IntersectionObserver' in window)) return;
      bar.hidden = false;
      var io = new IntersectionObserver(function (entries) {
        var e = entries[0];
        /* La barre apparaît quand le bouton principal est sorti par le haut de l'écran. */
        bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
      });
      io.observe(button);
    });
  }

  function initDialogs() {
    document.querySelectorAll('[data-er-dialog-open]').forEach(function (btn) {
      var d = document.getElementById(btn.getAttribute('data-er-dialog-open'));
      if (!d || !d.showModal) { btn.hidden = true; return; }
      btn.addEventListener('click', function () { d.showModal(); });
      d.addEventListener('click', function (ev) {
        if (ev.target === d || ev.target.closest('[data-er-dialog-close]')) d.close();
      });
    });
  }

  ready(function () {
    initDialogs();
    initGallery();
    initSticky();
    if (!window.gsap || !window.ScrollTrigger) {
      root.classList.remove('er-js');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
        desktop: '(min-width: 800px)'
      },
      function (ctx) {
        var c = ctx.conditions;
        if (c.reduce) {
          showAll();
          document.querySelectorAll('[data-er-count]').forEach(function (el) {
            el.textContent = el.getAttribute('data-er-count');
          });
          return;
        }

        initHero();
        initReveals();
        initCounts();
        initRitual(c.desktop);
        initStagger();
        initTimeline();
        initAccordions();
      }
    );

    /* Héros : on « allume » le masque. La lueur rouge monte, puis le titre apparaît ligne par ligne. */
    function initHero() {
      document.querySelectorAll('.er-hero').forEach(function (hero) {
        var glow = hero.querySelector('.er-hero__glow');
        var lines = hero.querySelectorAll('.er-line > span');
        var rest = hero.querySelectorAll('[data-er-reveal]');

        var tl = gsap.timeline({ defaults: { ease: EASE } });
        if (glow) tl.fromTo(glow, { opacity: 0, scale: 0.85 }, { opacity: 0.85, scale: 1, duration: D.slow, ease: 'power1.inOut' });
        if (lines.length) tl.from(lines, { yPercent: 110, duration: D.std * 1.3, stagger: 0.12 }, '-=0.6');
        if (rest.length) tl.fromTo(rest, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: D.std, stagger: 0.08 }, '-=0.35');

        /* Couche d'ambiance : la lumière respire très lentement, comme un masque allumé. */
        if (glow) {
          tl.add(function () {
            gsap.to(glow, { opacity: 0.65, scale: 1.04, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          });
        }
      });
    }

    /* Apparitions au défilement, regroupées pour rester légères. */
    function initReveals() {
      var targets = Array.prototype.filter.call(document.querySelectorAll('[data-er-reveal]'), function (el) {
        return !el.closest('.er-hero');
      });
      if (!targets.length) return;
      gsap.set(targets, { opacity: 0, y: 20 });
      ScrollTrigger.batch(targets, {
        start: 'top 85%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: D.std, ease: EASE, stagger: 0.08, overwrite: true });
        }
      });
    }

    /* Chiffres qui défilent jusqu'à leur valeur (comparaison de prix). */
    function initCounts() {
      document.querySelectorAll('[data-er-count]').forEach(function (el) {
        var end = parseFloat(el.getAttribute('data-er-count'));
        var obj = { v: 0 };
        el.textContent = '0';
        gsap.to(obj, {
          v: end,
          duration: D.slow,
          ease: 'power1.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: function () { el.textContent = Math.round(obj.v); }
        });
      });
    }

    /* Rituel : sur ordinateur, la section reste en place et le cadran fait ses 10 minutes au défilement. */
    function initRitual(isDesktop) {
      document.querySelectorAll('.er-ritual').forEach(function (section) {
        var arc = section.querySelector('.er-ritual__arc');
        var minutes = section.querySelector('.er-ritual__minutes');
        var steps = section.querySelectorAll('.er-ritual__step');
        if (!arc) return;
        var len = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });

        if (!isDesktop) {
          gsap.to(arc, {
            strokeDashoffset: 0,
            duration: D.slow * 1.5,
            ease: 'power1.inOut',
            scrollTrigger: { trigger: section, start: 'top 70%', once: true },
            onUpdate: function () {
              if (minutes) minutes.textContent = Math.round(this.progress() * 10);
            }
          });
          return;
        }

        section.classList.add('is-scrubbing');
        var state = { p: 0 };
        gsap.to(state, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=' + Math.round(window.innerHeight * 1.2),
            pin: true,
            scrub: 0.6
          },
          onUpdate: function () {
            var p = state.p;
            arc.style.strokeDashoffset = String(len * (1 - p));
            if (minutes) minutes.textContent = Math.round(p * 10);
            var active = Math.min(steps.length - 1, Math.floor(p * steps.length));
            steps.forEach(function (s, i) { s.classList.toggle('is-active', i === active); });
          }
        });
        if (steps[0]) steps[0].classList.add('is-active');
      });
    }

    /* Listes et cartes : les éléments arrivent l'un après l'autre. */
    function initStagger() {
      document.querySelectorAll('[data-er-stagger]').forEach(function (list) {
        var items = list.children;
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 14 });
        ScrollTrigger.create({
          trigger: list,
          start: 'top 88%',
          once: true,
          onEnter: function () {
            gsap.to(items, { opacity: 1, y: 0, duration: D.std, ease: EASE, stagger: 0.07, clearProps: 'transform' });
          }
        });
      });
    }

    /* Livraison : le trait rubis avance d'une étape à l'autre. */
    function initTimeline() {
      document.querySelectorAll('[data-er-timeline]').forEach(function (tl) {
        var dots = tl.querySelectorAll('.er-timeline__dot');
        tl.style.setProperty('--er-tl', 0);
        gsap.set(dots, { scale: 0.4, opacity: 0 });
        var t = gsap.timeline({ scrollTrigger: { trigger: tl, start: 'top 90%', once: true } });
        t.to(tl, { '--er-tl': 1, duration: D.slow, ease: 'power1.inOut' }, 0);
        t.to(dots, { scale: 1, opacity: 1, duration: D.quick, ease: EASE, stagger: D.slow / 2.2 }, 0);
      });
    }

    /* Questions : ouverture et fermeture en douceur. */
    function initAccordions() {
      document.querySelectorAll('.er-accordion, .er-faq details').forEach(function (d) {
        var summary = d.querySelector('summary');
        var body = summary && summary.nextElementSibling;
        if (!body || d.erBound) return;
        d.erBound = true;
        summary.addEventListener('click', function (ev) {
          ev.preventDefault();
          gsap.killTweensOf(body);
          if (d.open) {
            gsap.to(body, {
              height: 0, opacity: 0, duration: D.quick, ease: EASE,
              onComplete: function () { d.open = false; gsap.set(body, { clearProps: 'height,opacity' }); }
            });
          } else {
            d.open = true;
            gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: D.quick, ease: EASE, clearProps: 'height,opacity' });
          }
        });
      });
    }

    /* Les polices et images changent la hauteur des sections : on recalcule une fois tout chargé. */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
