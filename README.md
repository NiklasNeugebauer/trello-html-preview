# HTML Preview for Trello

Firefox extension (also works in Firefox-based browsers like Zen). Trello serves
HTML attachments as downloads, with no preview. With this extension, Trello's
attachment viewer shows the rendered page, and "Open in new tab" opens it the same
way a local file opens.

## How it works

- For `trello.com/1/cards/*/attachments/*/download/*.html` it swaps
  `Content-Disposition: attachment` for `Content-Type: text/html`.
- It adds `Content-Security-Policy: sandbox …` without `allow-same-origin`.
  The page runs in an opaque origin, so its scripts cannot use your Trello
  session. The catch: pages that rely on `localStorage` or cookies will not
  work.
- A content script replaces the viewer's "no preview" message with an iframe of
  the attachment, and strips `download` attributes from attachment links.

## Develop

```sh
mise install                                   # web-ext
mise exec -- web-ext run --source-dir src      # throwaway Firefox profile
```

Or load `src/manifest.json` via `about:debugging` → "Load Temporary Add-on".

## Install

Open the `.xpi` from the
[latest release](https://github.com/NiklasNeugebauer/trello-html-preview/releases/latest)
in Firefox 142+ or Zen. It is signed as an unlisted add-on and updates itself
from later releases.

## Release

Publish a GitHub release tagged `vX.Y.Z`. The workflow sets that version, signs
it on addons.mozilla.org (repo secrets `AMO_JWT_ISSUER` / `AMO_JWT_SECRET`) and
attaches the `.xpi` and `updates.json` to the release. Every version can only
be signed once.
