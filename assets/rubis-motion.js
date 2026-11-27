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

  ready(function () {
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

    /* Les polices et images changent la hauteur des sections : on recalcule une fois tout chargé. */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
