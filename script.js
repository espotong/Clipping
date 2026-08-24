/*
 * Klipin — script.js
 * Vanilla JS only. No analytics, no third-party auth, no API keys.
 */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector("[data-burger]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Accordion (FAQ) ---------- */
  var accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    var triggers = accordion.querySelectorAll(".accordion__trigger");
    triggers.forEach(function (trigger) {
      var panel = trigger.parentElement.querySelector(".accordion__panel");

      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";

        // close all others
        triggers.forEach(function (t) {
          if (t !== trigger) {
            t.setAttribute("aria-expanded", "false");
            var p = t.parentElement.querySelector(".accordion__panel");
            if (p) p.style.maxHeight = null;
          }
        });

        trigger.setAttribute("aria-expanded", String(!expanded));
        panel.style.maxHeight = expanded ? null : panel.scrollHeight + "px";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Timeline marker demo interaction ---------- */
  var markers = document.querySelectorAll(".timeline__marker");
  markers.forEach(function (marker) {
    marker.addEventListener("click", function () {
      markers.forEach(function (m) {
        m.style.background = "";
      });
      marker.style.background = "var(--accent)";
    });
  });

  /* ---------- Sticky nav shadow on scroll ---------- */
  var nav = document.querySelector("[data-nav]");
  if (nav) {
    var lastScrolled = false;
    window.addEventListener(
      "scroll",
      function () {
        var scrolled = window.scrollY > 8;
        if (scrolled !== lastScrolled) {
          nav.style.boxShadow = scrolled
            ? "0 8px 24px -18px rgba(0,0,0,.6)"
            : "none";
          lastScrolled = scrolled;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Demo form: no backend wired up ---------- */
  var heroForm = document.querySelector(".hero__form");
  if (heroForm) {
    heroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = heroForm.querySelector("input");
      if (!input.value.trim()) {
        input.focus();
        return;
      }
      // Placeholder only — wire this up to your own processing logic.
      window.alert(
        "Ini contoh tampilan saja. Sambungkan tombol ini ke logika pemrosesan videomu sendiri."
      );
    });
  }
})();
