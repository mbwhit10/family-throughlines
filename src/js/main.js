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
  const KIT_API_KEY = "nDt2H6Z46daBKLuAwZv7eA"; // ← REPLACE THIS: Kit → Settings → Advanced → "API Key"

  const STORAGE_KEY = "ft_overlay_seen";
  const backdrop    = document.getElementById("ft-overlay-backdrop");

  if (!backdrop) return;

  // Don't show if visitor has already interacted
  try {
    if (localStorage.getItem(STORAGE_KEY)) {
      backdrop.style.display = "none";
      return;
    }
  } catch (e) {}

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

  function showSuccess() {
    if (form)       form.style.display       = "none";
    if (dismissBtn) dismissBtn.style.display = "none";
    if (successMsg) successMsg.removeAttribute("hidden");
    setTimeout(closeOverlay, 4000);
  }

  if (closeBtn)   closeBtn.addEventListener("click", closeOverlay);
  if (dismissBtn) dismissBtn.addEventListener("click", closeOverlay);

  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeOverlay();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.style.display !== "none") closeOverlay();
  });

  // Form submit → Kit v3 API (correct endpoint + public API key)
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

      submitBtn.textContent = "Sending\u2026";
      submitBtn.disabled = true;
      if (emailInput) emailInput.disabled = true;

      try {
        const res = await fetch(
          `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              api_key: KIT_API_KEY,
              email: email,
            }),
          }
        );

        const data = await res.json();

        // Kit returns { subscription: { ... } } on success
        if (data && data.subscription) {
          showSuccess();
        } else {
          throw new Error(JSON.stringify(data));
        }

      } catch (err) {
        console.warn("Kit submission error:", err);
        // Re-enable the form so they can try again
        submitBtn.textContent = "Send Me the Pocket Guide \u2192";
        submitBtn.disabled = false;
        if (emailInput) {
          emailInput.disabled = false;
          emailInput.style.borderColor = "#c0392b";
        }
        // Show inline error if not already there
        if (!document.getElementById("ft-overlay-error")) {
          const errEl = document.createElement("p");
          errEl.id = "ft-overlay-error";
          errEl.style.cssText = "font-size:0.82rem;color:#c0392b;margin-top:0.4rem;text-align:center;";
          errEl.textContent = "Something went wrong \u2014 please try again or email me directly at themissingconversationsguide@gmail.com";
          form.appendChild(errEl);
        }
      }
    });
  }

})();
