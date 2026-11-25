"use strict";

// A download attribute would force a download even for "Open link in new tab".
for (const type of ["mousedown", "contextmenu"]) {
  document.addEventListener(
    type,
    (event) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link && isHtmlAttachment(link.href) && !isDownloadRequest(link.href)) link.removeAttribute("download");
    },
    true,
  );
}

// Trello's attachment viewer shows a "no preview" message for HTML files. Replace it
// with an iframe; background.js serves the frame as a sandboxed text/html document.
const NO_PREVIEW = /no preview available|keine vorschau/i;
const FRAME_CLASS = "trello-html-preview-frame";

function findNoPreviewMessages() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (NO_PREVIEW.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const messages = [];
  while (walker.nextNode()) messages.push(walker.currentNode.parentElement);
  return messages;
}

function attachmentUrlNear(element) {
  for (let node = element; node && node !== document.body; node = node.parentElement) {
    const link = [...node.querySelectorAll("a[href]")].find((a) => isHtmlAttachment(a.href));
    if (link) {
      const url = new URL(link.href);
      url.searchParams.delete("dl");
      return url.href;
    }
  }
  return null;
}

// The message sits in a container marked data-dont-close-preview, together with the
// Download button; the frame goes into that container so clicks on it keep the viewer open.
function injectPreviews() {
  for (const message of findNoPreviewMessages()) {
    const url = attachmentUrlNear(message);
    if (!url) continue;
    let frame = message.parentElement.querySelector(`.${FRAME_CLASS}`);
    if (!frame) {
      frame = document.createElement("iframe");
      frame.className = FRAME_CLASS;
      Object.assign(frame.style, {
        display: "block",
        width: "min(1400px, 90vw)",
        height: "75vh",
        margin: "0 auto 12px",
        border: "0",
        borderRadius: "8px",
        background: "#fff",
      });
      message.before(frame);
      message.style.display = "none";
    }
    if (frame.src !== url) frame.src = url;
  }
}

let scheduled = false;
new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    injectPreviews();
  });
}).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
