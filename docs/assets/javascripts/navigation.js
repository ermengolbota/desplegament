document.addEventListener("DOMContentLoaded", () => {
  const toc = document.querySelector(".sidebar-toc");
  const articleLink = toc ? toc.previousElementSibling : null;
  const setArticleExpanded = (expanded) => {
    if (!toc || !articleLink) return;
    toc.hidden = !expanded;
    articleLink.setAttribute("aria-expanded", String(expanded));
  };
  if (articleLink) {
    articleLink.classList.add("sidebar-article-toggle");
    articleLink.setAttribute("aria-controls", toc.id);
    setArticleExpanded(true);
    articleLink.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      setArticleExpanded(toc.hidden);
    });
  }
  const tocButtons = toc ? [...toc.querySelectorAll(".sidebar-toc-toggle")] : [];
  const setTocExpanded = (button, expanded) => {
    document.getElementById(button.getAttribute("aria-controls")).hidden = !expanded;
    button.setAttribute("aria-expanded", String(expanded));
  };
  tocButtons.forEach((button) => {
    button.hidden = false;
    setTocExpanded(button, false);
    button.addEventListener("click", () => {
      setTocExpanded(button, button.getAttribute("aria-expanded") !== "true");
    });
  });
  const syncToc = () => {
    if (!toc) return;
    toc.querySelectorAll("a[href]").forEach((link) => {
      const active = new URL(link.href).hash === window.location.hash;
      if (active) {
        setArticleExpanded(true);
        link.setAttribute("aria-current", "location");
        let list = link.closest("ul");
        while (list && toc.contains(list)) {
          if (list.id) {
            const button = tocButtons.find((item) => item.getAttribute("aria-controls") === list.id);
            if (button) setTocExpanded(button, true);
          }
          list = list.parentElement.closest("ul");
        }
      } else link.removeAttribute("aria-current");
    });
  };
  window.addEventListener("hashchange", syncToc);
  syncToc();

  const sidebar = document.querySelector(".wy-nav-side");
  const toggle = document.querySelector(".mobile-menu-toggle");
  const close = document.querySelector(".sidebar-close");
  if (!sidebar || !toggle || !close) return;

  const mobile = window.matchMedia("(max-width: 768px)");
  let wasExpanded = false;

  const syncNavigation = () => {
    const expanded = mobile.matches && sidebar.classList.contains("shift");
    const hidden = mobile.matches && !expanded;
    sidebar.inert = hidden;
    if (hidden) sidebar.setAttribute("aria-hidden", "true");
    else sidebar.removeAttribute("aria-hidden");
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Tanca el menú" : "Obre el menú");

    if (expanded && !wasExpanded) close.focus({ preventScroll: true });
    if (!expanded && wasExpanded && mobile.matches) toggle.focus({ preventScroll: true });
    wasExpanded = expanded;
  };

  new MutationObserver(syncNavigation).observe(sidebar, {
    attributes: true,
    attributeFilter: ["class"],
  });
  mobile.addEventListener("change", syncNavigation);

  document.addEventListener("keydown", (event) => {
    if (!mobile.matches || !sidebar.classList.contains("shift")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      document.querySelectorAll("[data-toggle='wy-nav-shift'], .rst-versions")
        .forEach((element) => element.classList.remove("shift"));
    }

    if (event.key === "Tab") {
      const controls = [...sidebar.querySelectorAll("a[href], button, input, summary")]
        .filter((element) => !element.disabled && element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  syncNavigation();
});
