function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const adjustNavbar = () => {
  const links = $elements("nav-link:not(section *)");
  const nav = $element("nav");
  const moreMenu = $element("section");
  const moreLinks = $element("menu");

  if (!links.length || !nav || !moreMenu || !moreLinks) {
    return;
  }

  links.forEach((link) => (link.style.display = "flex"));
  Object.assign(moreLinks.style, { left: "auto", right: "0" });
  moreMenu.style.display = "none";
  moreLinks.innerHTML = "";

  const pigSize = $element("img").offsetWidth + convertRemToPixels(4);
  const navWidth = nav.offsetWidth - pigSize - 10;

  Object.assign(moreMenu.style, { visibility: "hidden", display: "flex" });

  const moreMenuWidth = moreMenu.getBoundingClientRect().width;

  Object.assign(moreMenu.style, { visibility: "", display: "none" });

  distributeLinks(links, moreLinks, moreMenu, navWidth, moreMenuWidth);
};

const distributeLinks = (
  links,
  moreLinks,
  moreMenu,
  navWidth,
  moreMenuWidth,
) => {
  let totalWidth = 0;

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    totalWidth += link.offsetWidth + (i > 0 ? convertRemToPixels(0.5) : 0);

    if (totalWidth + moreMenuWidth > navWidth) {
      moveOverflowLinks(links, moreLinks, moreMenu, i);
      break;
    }
  }
};

const moveOverflowLinks = (links, moreLinks, moreMenu, startIndex) => {
  for (let j = startIndex; j < links.length; j++) {
    const overflowLink = links[j];
    overflowLink.style.display = "none";

    const clone = overflowLink.clone();
    const handLeft = document.createElement("i");
    handLeft.className = "fa fa-hand-o-left";
    handLeft.ariaHidden = "true";
    clone.appendChild(handLeft);
    clone.style.display = "flex";
    moreLinks.appendChild(clone);
  }
  moreMenu.style.display = "flex";
};

const setupMoreMenuHover = () => {
  const moreMenu = $element("section");
  const moreLinks = $element("menu");

  let isTouchMode = false;
  let isMenuOpen = false;

  const showMenu = () => {
    moreLinks.classList.add("visible");
    Object.assign(moreLinks.style, { left: "0", right: "auto" });

    const rect = moreLinks.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      Object.assign(moreLinks.style, { left: "auto", right: "0" });
    }

    this.ownerDocument.addEventListener("touchstart", handleOutsideTap, {
      passive: true,
    });

    isMenuOpen = true;
  };

  const hideMenu = () => {
    moreLinks.classList.remove("visible");
    isMenuOpen = false;
    this.ownerDocument.removeEventListener("touchstart", handleOutsideTap);
  };

  const handleOutsideTap = (e) => {
    if (!moreMenu.contains(e.target)) {
      hideMenu();
    }
  };

  moreMenu
    .on("mouseenter", () => {
      if (isTouchMode) return;
      showMenu();
    })
    .on("mouseleave", () => {
      if (isTouchMode) return;
      hideMenu();
    })
    .on("touchstart", (e) => {
      e.stopPropagation();
      isTouchMode = true;
      if (!isMenuOpen && e.target.tagName !== "NAV-LINK") {
        showMenu();
      } else if (isMenuOpen && e.target.tagName === "NAV-LINK") {
        hideMenu();
        e.target.click();
      }
    });
};

const preLoad = () => {
  adjustNavbar();
  setupMoreMenuHover();
  window.removeEventListener("resize", adjustNavbar);
  window.addEventListener("resize", adjustNavbar);
};

const img = $element("img", HTMLImageElement.prototype);

if (img.complete) {
  preLoad();
} else {
  img.on("load", preLoad);
}
