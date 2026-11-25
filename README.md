# HTML Preview for Trello

Firefox extension (also works in Firefox-based browsers like Zen). Trello serves
HTML attachments as downloads, with no preview. With this extension, clicking an
`.html` attachment link opens it as a rendered page in a new tab, the same way a
local file opens.

## How it works

- For `trello.com/1/cards/*/attachments/*/download/*.html` it swaps
  `Content-Disposition: attachment` for `Content-Type: text/html`.
- It adds `Content-Security-Policy: sandbox …` without `allow-same-origin`.
  The page runs in an opaque origin, so its scripts cannot use your Trello
  session. The catch: pages that rely on `localStorage` or cookies will not
  work.
- A content script opens matching links in a new tab instead of Trello's
  "no preview" dialog, and strips `download` attributes.

## Develop

```sh
mise install                                   # web-ext
mise exec -- web-ext run --source-dir src      # throwaway Firefox profile
```

Or load `src/manifest.json` via `about:debugging` → "Load Temporary Add-on".

## Sign and install

Signing goes through addons.mozilla.org as an unlisted add-on. Store your
[AMO API credentials](https://addons.mozilla.org/developers/addon/api/key/)
in the keyring once:

```sh
secret-tool store --label="AMO JWT issuer" service amo key issuer
secret-tool store --label="AMO JWT secret" service amo key secret
```

Then bump `version` in `src/manifest.json`, run `./sign.sh`, and open the
resulting `.xpi` in the browser.
