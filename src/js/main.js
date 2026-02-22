Main · JS
Copy

// ── Mobile menu ─────────────────────────────────────────────────────────────
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });
  });
}

// ── Footer year ──────────────────────────────────────────────────────────────
const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// ── Navigator's Pocket Guide Overlay ────────────────────────────────────────
(function () {

  const KIT_FORM_ID = "9117315";

  const STORAGE_KEY = "ft_overlay_seen";
  const backdrop    = document.getElementById("ft-overlay-backdrop");

  if (!backdrop) return;

  // Don't show if visitor has already interacted
  if (localStorage.getItem(STORAGE_KEY)) {
    backdrop.style.display = "none";
    return;
  }

  const closeBtn   = document.getElementById("ft-overlay-close");
  const dismissBtn = document.getElementById("ft-overlay-dismiss");
  const form       = document.getElementById("ft-overlay-form");
  const emailInput = document.getElementById("ft-overlay-email");
  const submitBtn  = document.getElementById("ft-overlay-submit");
  const successMsg = document.getElementById("ft-overlay-success");

  // Show after a brief delay so the page loads first
  setTimeout(() => {
    backdrop.removeAttribute("hidden");
    backdrop.style.display = "";
    if (emailInput) emailInput.focus();
  }, 1200);

  function closeOverlay() {
    backdrop.style.opacity = "0";
    backdrop.style.transition = "opacity 0.25s ease";
    setTimeout(() => (backdrop.style.display = "none"), 260);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  }

  if (closeBtn)   closeBtn.addEventListener("click", closeOverlay);
  if (dismissBtn) dismissBtn.addEventListener("click", closeOverlay);

  // Close on backdrop click (outside the card)
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeOverlay();
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.style.display !== "none") closeOverlay();
  });

  // Form submit → Kit API
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : "";
      if (!email || !email.includes("@")) {
        if (emailInput) {
          emailInput.style.borderColor = "#c0392b";
          emailInput.focus();
        }
        return;
      }

      // Optimistic UI — disable while submitting
      submitBtn.textContent = "Sending\u2026";
      submitBtn.disabled = true;
      if (emailInput) emailInput.disabled = true;

      try {
        const res = await fetch(
          `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ email_address: email }),
          }
        );

        if (res.ok || res.status === 200 || res.status === 201) {
          // Show success state inside the card
          form.style.display = "none";
          if (dismissBtn) dismissBtn.style.display = "none";
          if (successMsg) successMsg.removeAttribute("hidden");
          // Auto-close after they read the confirmation
          setTimeout(closeOverlay, 4000);
        } else {
          throw new Error("Kit API returned " + res.status);
        }
      } catch (err) {
        // Graceful fallback — open mailto so the lead isn't lost
        console.warn("Kit submission failed, falling back to mailto:", err);
        const subject = encodeURIComponent("Navigator's Pocket Guide Request");
        const body    = encodeURIComponent(
          "Hi Whit,\n\nPlease send me the Navigator's Pocket Guide PDF.\n\nThanks!"
        );
        window.location.href =
          "mailto:themissingconversationsguide@gmail.com" +
          "?subject=" + subject +
          "&body=" + body +
          "&reply-to=" + encodeURIComponent(email);
        setTimeout(closeOverlay, 1500);
      }
    });
  }

})();
