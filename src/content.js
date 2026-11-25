"use strict";

function htmlAttachmentLink(event) {
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  return link && isHtmlAttachment(link.href) ? link : null;
}

// A download attribute would force a download even for "Open link in new tab".
for (const type of ["mousedown", "contextmenu"]) {
  document.addEventListener(type, (event) => htmlAttachmentLink(event)?.removeAttribute("download"), true);
}

document.addEventListener(
  "click",
  (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = htmlAttachmentLink(event);
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.open(link.href, "_blank", "noopener");
  },
  true,
);
