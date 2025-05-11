function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const links = document.querySelectorAll(".nav-bar-link:not(.dropdown)");

const adjustNavbar = () => {
    const nav = document.getElementById('navBar');
    const moreMenu = document.getElementById('moreMenu');
    const moreLinks = document.getElementById('moreLinks');

    resetNavbar(links, moreLinks, moreMenu);

    const pigSize = calculatePigSize();
    const navWidth = calculateNavWidth(nav, pigSize);

    prepareMoreMenu(moreMenu);

    const moreMenuWidth = moreMenu.getBoundingClientRect().width;

    finalizeMoreMenu(moreMenu);

    distributeLinks(links, moreLinks, moreMenu, navWidth, moreMenuWidth);
};

const resetNavbar = (links, moreLinks, moreMenu) => {
    moreLinks.style.left = "auto";
    moreLinks.style.right = "0";
    links.forEach(link => link.style.display = 'flex');
    moreLinks.innerHTML = '';
    moreMenu.style.display = 'none';
};

const calculatePigSize = () => {
    return document.querySelector(".logo").offsetWidth + convertRemToPixels(4);
};

const calculateNavWidth = (nav, pigSize) => {
    return nav.offsetWidth - pigSize - 10;
};

const prepareMoreMenu = (moreMenu) => {
    moreMenu.style.display = 'flex';
    moreMenu.style.visibility = 'hidden';
};

const finalizeMoreMenu = (moreMenu) => {
    moreMenu.style.display = 'none';
    moreMenu.style.visibility = '';
};

const distributeLinks = (links, moreLinks, moreMenu, navWidth, moreMenuWidth) => {
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
        overflowLink.style.display = 'none';

        const clone = overflowLink.cloneNode(true);
        clone.style.display = 'flex';
        clone.addEventListener("click", clickCallback);

        moreLinks.appendChild(clone);
    }
    moreMenu.style.display = 'flex';
};

function clickCallback() {
    const route = this.getAttribute("data-route");
    const navigateResult = $navigate(route);
    if (navigateResult) {
        document.querySelectorAll(".nav-bar-link").forEach(link => {
            if (link === this) return;
            link.classList.remove("active");
        });
        this.classList.add("active");
    }
}

const handlePopState = () => {
    const route = window.location.pathname;
    links.forEach(link => {
        link.classList.toggle("active", link.getAttribute("data-route") === route);
    });
};

const setupEventListeners = () => {
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('load', initializeNavbar);
    window.addEventListener('resize', adjustNavbar);
};

const initializeNavbar = () => {
    adjustNavbar();
    links.forEach(link => {
        link.addEventListener("click", clickCallback);
        link.classList.toggle("active", window.location.pathname === link.getAttribute("data-route"));
    });

    const moreMenu = document.getElementById("moreMenu");
    const moreLinks = document.getElementById("moreLinks");

    setupMoreMenuHover(moreMenu, moreLinks);
};

const setupMoreMenuHover = (moreMenu, moreLinks) => {
    moreMenu.addEventListener("mouseenter", () => {
        moreLinks.classList.add("visible");

        requestAnimationFrame(() => {
            moreLinks.style.left = "0";
            moreLinks.style.right = "auto";

            const rect = moreLinks.getBoundingClientRect();

            if (rect.right > window.innerWidth) {
                moreLinks.style.left = "auto";
                moreLinks.style.right = "0";
            }
        });
    });

    moreMenu.addEventListener("mouseleave", () => {
        moreLinks.classList.remove("visible");
    });
};

setupEventListeners();
