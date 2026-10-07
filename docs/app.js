/** @author Jakub Korytko */
import { mountToggle } from "./plugin/theme.js";
import {
  bindSectionWatch,
  bindSidebarPin,
  markSection,
  scrollNavToActive,
} from "./plugin/sidebar.js";
import {
  bindShortcuts,
  fixPagination,
  markCover,
  mountProgress,
  wrapTables,
} from "./plugin/pages.js";

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
