"use strict";

// No allow-same-origin: the page gets an opaque origin, so its scripts cannot
// read trello.com cookies or call the Trello API as the logged-in user.
const SANDBOX_CSP =
  "sandbox allow-scripts allow-forms allow-modals allow-popups " +
  "allow-popups-to-escape-sandbox allow-downloads";

const REPLACED_HEADERS = new Set([
  "content-disposition",
  "content-type",
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
]);

browser.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!isHtmlAttachment(details.url) || isDownloadRequest(details.url)) return;
    if (details.statusCode >= 300 && details.statusCode < 400) {
      const location = details.responseHeaders.find((h) => h.name.toLowerCase() === "location");
      console.warn("HTML attachment redirected, not rewritten:", details.url, "->", location?.value);
      return;
    }
    if (details.statusCode !== 200) return;

    const contentType = details.responseHeaders.find((h) => h.name.toLowerCase() === "content-type");
    const charset = contentType?.value.match(/charset=([^;\s]+)/i)?.[1];
    const responseHeaders = details.responseHeaders.filter((h) => !REPLACED_HEADERS.has(h.name.toLowerCase()));
    responseHeaders.push(
      { name: "Content-Type", value: charset ? `text/html; charset=${charset}` : "text/html" },
      { name: "Content-Security-Policy", value: SANDBOX_CSP },
    );
    return { responseHeaders };
  },
  { urls: ["https://trello.com/1/cards/*/attachments/*/download/*"], types: ["main_frame", "sub_frame"] },
  ["blocking", "responseHeaders"],
);
