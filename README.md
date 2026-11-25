# HTML Preview for Trello

Browser extension for Firefox (including Zen) and Chrome. Trello serves HTML
attachments as downloads, with no preview. With this extension, Trello's
attachment viewer shows the rendered page, and "Open in new tab" opens it the same
way a local file opens.

## How it works

- For `trello.com/1/cards/*/attachments/*/download/*.html` it swaps
  `Content-Disposition: attachment` for `Content-Type: text/html`. Links with
  `?dl=1` (Trello's Download button) stay downloads.
- It adds `Content-Security-Policy: sandbox …` without `allow-same-origin`.
  The page runs in an opaque origin, so its scripts cannot use your Trello
  session. The catch: pages that rely on `localStorage` or cookies will not
  work.
- A content script replaces the viewer's "no preview" message with an iframe of
  the attachment and turns the Download button under it into "Open in new tab".

## Layout

| Path | What |
|---|---|
| `src/common/` | content script and URL matching, plain DOM, used by both browsers |
| `src/firefox/` | MV2 manifest and a blocking `webRequest` listener for the header rewrite |
| `src/chrome/` | MV3 manifest and a static `declarativeNetRequest` ruleset for the header rewrite |

`./build.sh` assembles `dist/firefox/` and `dist/chrome/`.

## Develop

```sh
./build.sh
mise exec -- web-ext run --source-dir dist/firefox   # throwaway Firefox profile
```

Or load `dist/firefox/manifest.json` via `about:debugging` → "Load Temporary
Add-on", or `dist/chrome/` via `chrome://extensions` → Developer mode → "Load
unpacked".

## Install

From the [latest release](https://github.com/NiklasNeugebauer/trello-html-preview/releases/latest):

- **Firefox 142+ / Zen:** open the `-firefox-….xpi`. It is signed as an unlisted
  add-on and updates itself from later releases.
- **Chrome 120+:** unzip the `-chrome-….zip`, then `chrome://extensions` →
  Developer mode → "Load unpacked". No automatic updates.

## Release

Publish a GitHub release tagged `vX.Y.Z`. The workflow builds both browsers at
that version, signs Firefox on addons.mozilla.org (repo secrets
`AMO_JWT_ISSUER` / `AMO_JWT_SECRET`) and attaches the `.xpi`, the Chrome `.zip`
and `updates.json` to the release. Every version can only be signed once.
