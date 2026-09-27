/** @author Jakub Korytko */
(function () {
  const THEME_KEY = "piglet-docs-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#faf4ee" : "#0c0907");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* ignore quota / private mode */
    }

    const button = document.querySelector("[data-theme-toggle]");
    if (!button) {
      return;
    }

    const next = theme === "light" ? "dark" : "light";
    button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    button.setAttribute("aria-label", "Switch to " + next + " theme");
    button.lastChild.textContent = theme === "light" ? "Light" : "Dark";
  }

  function icon(name) {
    if (name === "sun") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>';
    }

    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>';
  }

  function mountToggle() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector("[data-theme-toggle]")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.setAttribute("data-theme-toggle", "");
    button.innerHTML = icon("sun") + icon("moon") + "<span>Dark</span>";
    button.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    sidebar.appendChild(button);
    applyTheme(currentTheme());
  }

  function mountProgress() {
    if (document.querySelector(".read-progress")) {
      return;
    }

    const bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = function () {
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      const value = height > 0 ? window.scrollY / height : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, value)) + ")";
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function markCover() {
    const hash = window.location.hash.replace(/^#\/?/, "").replace(/\?.*$/, "");
    document.body.classList.toggle("on-cover", hash === "" || hash === "README");
  }

  function wrapTables() {
    document.querySelectorAll(".markdown-section table").forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains("table-wrap")) {
        return;
      }

      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function pageHref(href) {
    href = (href || "").trim();
    if (!href) {
      return "";
    }

    if (href.indexOf("#/") === 0) {
      return "#/" + href.slice(2).split("?")[0].split("#")[0];
    }

    return href.split("?")[0].split("#")[0];
  }

  function pageKey(href) {
    href = href || "";
    const routed = href.match(/#\/([^?#]*)/);
    const raw = routed ? routed[1] : href.replace(/^#\/?/, "");
    return raw
      .replace(/\.md$/i, "")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+$/, "")
      .toLowerCase();
  }

  function sidebarPages() {
    const seen = Object.create(null);
    const pages = [];

    document.querySelectorAll(".sidebar-nav a").forEach(function (anchor) {
      const href = anchor.getAttribute("href") || "";
      const key = pageKey(href);
      if (!key || seen[key]) {
        return;
      }

      seen[key] = true;
      pages.push({
        key: key,
        href: pageHref(href),
        title: (anchor.textContent || "").trim(),
      });
    });

    return pages;
  }

  function setPaginationLink(item, page) {
    if (!item) {
      return;
    }

    const link = item.querySelector("a");
    if (!page || !link) {
      item.hidden = true;
      return;
    }

    item.hidden = false;
    link.setAttribute("href", page.href);
    const title = item.querySelector(".pagination-item-title");
    if (title) {
      title.textContent = page.title;
    }

    const subtitle = item.querySelector(".pagination-item-subtitle");
    if (subtitle) {
      subtitle.remove();
    }
  }

  function fixPagination() {
    if (document.body.classList.contains("on-cover")) {
      return;
    }

    const pages = sidebarPages();
    const index = pages.findIndex(function (page) {
      return page.key === pageKey(window.location.hash);
    });
    if (index === -1) {
      return;
    }

    setPaginationLink(
      document.querySelector(".pagination-item--previous"),
      pages[index - 1]
    );
    setPaginationLink(
      document.querySelector(".pagination-item--next"),
      pages[index + 1]
    );
  }

  function markSection() {
    const nav = document.querySelector(".sidebar-nav");
    if (!nav) {
      return;
    }

    const page = pageKey(window.location.hash);
    const root = nav.querySelector("ul");
    if (!root) {
      return;
    }

    Array.prototype.forEach.call(root.children, function (item) {
      if (item.tagName !== "LI") {
        return;
      }
      const onPage = Array.prototype.some.call(item.querySelectorAll("a"), function (anchor) {
        return page && pageKey(anchor.getAttribute("href") || "") === page;
      });
      item.classList.toggle("pig-in", onPage);
    });
  }

  function bindSidebarPin() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.dataset.pigPin === "1") {
      return;
    }

    sidebar.dataset.pigPin = "1";
    let pinned = sidebar.scrollTop;
    let pageScrolling = false;
    let pageScrollTimer = 0;

    window.addEventListener(
      "scroll",
      function () {
        pageScrolling = true;
        sidebar.scrollTop = pinned;
        window.clearTimeout(pageScrollTimer);
        pageScrollTimer = window.setTimeout(function () {
          pageScrolling = false;
        }, 80);
      },
      { passive: true }
    );

    sidebar.addEventListener("scroll", function () {
      if (pageScrolling) {
        sidebar.scrollTop = pinned;
        return;
      }
      pinned = sidebar.scrollTop;
    });

    window.__pigPinNav = function (value) {
      pinned = value;
    };
  }

  function scrollNavToActive() {
    const sidebar = document.querySelector(".sidebar");
    const active = document.querySelector(
      ".sidebar-nav li.active > a, .sidebar-nav a.active"
    );
    if (!sidebar || !active) {
      return;
    }

    const sidebarBox = sidebar.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const name = document.querySelector(".sidebar .app-name");
    const search = document.querySelector(".sidebar .search");
    const toggle = document.querySelector(".theme-toggle");
    const topPad = (name ? name.offsetHeight : 0) + (search ? search.offsetHeight : 0);
    const bottomPad = toggle ? toggle.offsetHeight : 0;
    const visibleTop = sidebarBox.top + topPad + 8;
    const visibleBottom = sidebarBox.bottom - bottomPad - 8;

    if (activeBox.top >= visibleTop && activeBox.bottom <= visibleBottom) {
      if (window.__pigPinNav) {
        window.__pigPinNav(sidebar.scrollTop);
      }
      return;
    }

    sidebar.scrollTop += activeBox.top - (visibleTop + visibleBottom) / 2 + activeBox.height / 2;
    if (window.__pigPinNav) {
      window.__pigPinNav(sidebar.scrollTop);
    }
  }

  function bindSectionWatch() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.dataset.pigSectionWatch === "1") {
      return;
    }

    sidebar.dataset.pigSectionWatch = "1";
    new MutationObserver(function () {
      markSection();
    }).observe(sidebar, { childList: true, subtree: true });
  }

  function bindShortcuts() {
    if (document.body.dataset.pigShortcuts === "1") {
      return;
    }

    document.body.dataset.pigShortcuts = "1";
    document.addEventListener("keydown", function (event) {
      const target = event.target;
      const typing =
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        const input = document.querySelector(".search input");
        if (input) {
          event.preventDefault();
          input.focus();
        }
      }
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.ready(function () {
      mountToggle();
      mountProgress();
      bindShortcuts();
      bindSectionWatch();
      bindSidebarPin();
      markCover();
      markSection();
      window.addEventListener("hashchange", markSection);
    });
    hook.doneEach(function () {
      wrapTables();
      markCover();
      mountToggle();
      bindSectionWatch();
      bindSidebarPin();
      markSection();
      setTimeout(function () {
        fixPagination();
        scrollNavToActive();
      }, 0);
    });
  });
})();
