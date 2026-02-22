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

  // Form submit → POST to Kit via hidden iframe (avoids CORS, no API key needed,
  // no page navigation — Kit receives the subscription in the background)
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : "";
      if (!email || !email.includes("@")) {
        if (emailInput) {
          emailInput.style.borderColor = "#c0392b";
          emailInput.focus();
        }
        return;
      }

      // Show success immediately — Kit will process in background
      showSuccess();

      // Create a hidden iframe to receive the POST response (prevents page navigation)
      const iframe = document.createElement("iframe");
      iframe.name  = "kit-subscribe-frame";
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Point the form at Kit's endpoint and submit into the iframe
      form.action = `https://app.convertkit.com/forms/${KIT_FORM_ID}/subscriptions`;
      form.method = "POST";
      form.target = "kit-subscribe-frame";
      form.submit();

      // Clean up iframe after Kit has had time to process
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 5000);
    });
  }

})();