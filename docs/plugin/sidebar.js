import { pageKey } from "./pages.js";

const pin = {
  ready: false,
  sidebar: null,
  proto: null,
  pinned: 0,
  lock: false,
};

function pinNav(value) {
  if (pin.ready) {
    pin.lock = false;
    pin.proto.set.call(pin.sidebar, value);
    pin.pinned = pin.proto.get.call(pin.sidebar);
    return;
  }

  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    return;
  }

  sidebar.scrollTop = value;
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

  Array.prototype.forEach.call(root.children, (item) => {
    if (item.tagName !== "LI") {
      return;
    }
    const onPage = Array.prototype.some.call(item.querySelectorAll("a"), (anchor) => {
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
  const proto = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop");
  let pageScrollTimer = 0;
  pin.sidebar = sidebar;
  pin.proto = proto;
  pin.pinned = proto.get.call(sidebar);
  pin.lock = false;
  pin.ready = true;

  // Docsify assigns sidebar.scrollTop when the active heading changes.
  // That write paints for one frame before a restore, which flashes the nav.
  Object.defineProperty(sidebar, "scrollTop", {
    configurable: true,
    enumerable: true,
    get() {
      return proto.get.call(this);
    },
    set(value) {
      if (pin.lock) {
        return;
      }
      proto.set.call(this, value);
      pin.pinned = proto.get.call(this);
    },
  });

  window.addEventListener(
    "scroll",
    (event) => {
      if (event.target === sidebar) {
        return;
      }
      pin.lock = true;
      window.clearTimeout(pageScrollTimer);
      pageScrollTimer = window.setTimeout(() => {
        pin.lock = false;
      }, 0);
    },
    { capture: true, passive: true }
  );

  sidebar.addEventListener("scroll", () => {
    if (!pin.lock) {
      pin.pinned = proto.get.call(sidebar);
      return;
    }
    if (proto.get.call(sidebar) !== pin.pinned) {
      proto.set.call(sidebar, pin.pinned);
    }
  });
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

  const next =
    activeBox.top >= visibleTop && activeBox.bottom <= visibleBottom
      ? sidebar.scrollTop
      : sidebar.scrollTop +
        (activeBox.top - (visibleTop + visibleBottom) / 2 + activeBox.height / 2);

  pinNav(next);
}

function bindSectionWatch() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || sidebar.dataset.pigSectionWatch === "1") {
    return;
  }

  sidebar.dataset.pigSectionWatch = "1";
  new MutationObserver(() => {
    markSection();
  }).observe(sidebar, { childList: true, subtree: true });
}

export { bindSectionWatch, bindSidebarPin, markSection, scrollNavToActive };
