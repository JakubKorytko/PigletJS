function mountProgress() {
  if (document.querySelector(".read-progress")) {
    return;
  }

  const bar = document.createElement("div");
  bar.className = "read-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  const update = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const value = height > 0 ? window.scrollY / height : 0;
    bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, value)) + ")";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function markCover() {
  const hash = window.location.hash.replace(/^#\/?/, "").replace(/\?.*$/, "");
  document.body.classList.toggle("on-cover", hash === "");
}

function wrapTables() {
  document.querySelectorAll(".markdown-section table").forEach((table) => {
    if (table.parentElement && table.parentElement.classList.contains("table-wrap")) {
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
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

function sidebarPages() {
  const seen = Object.create(null);
  const pages = [];

  document.querySelectorAll(".sidebar-nav a").forEach((anchor) => {
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
  const index = pages.findIndex((page) => {
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

function bindShortcuts() {
  if (document.body.dataset.pigShortcuts === "1") {
    return;
  }

  document.body.dataset.pigShortcuts = "1";
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

    if (event.key !== "/" || typing || event.metaKey || event.ctrlKey) {
      return;
    }

    const input = document.querySelector(".search input");
    if (!input) {
      return;
    }

    event.preventDefault();
    input.focus();
  });
}

export {
  bindShortcuts,
  fixPagination,
  markCover,
  mountProgress,
  pageKey,
  wrapTables,
};
