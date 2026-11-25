"use strict";

const ATTACHMENT_PATH = /^\/1\/cards\/[^/]+\/attachments\/[^/]+\/download\/([^/]+)$/;
const HTML_NAME = /\.x?html?$/i;

function isHtmlAttachment(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  if (url.hostname !== "trello.com") return false;
  const match = url.pathname.match(ATTACHMENT_PATH);
  return Boolean(match) && HTML_NAME.test(decodeURIComponent(match[1]));
}
