# A copy of the saves in Google Drive

PokeLeague keeps its saves in the browser first: that never changes, and the game works with no account
and no network. This adds a **second copy in your own Google Drive**, so a cleared browser or a new phone
is an inconvenience rather than a loss.

In the game: **Settings → Game → Google Drive**.

- **Save to Drive**: writes this device's three save slots into a file in your Drive.
- **Load from Drive**: shows what Drive and this device hold (names, badges, play time, date), and only
  once you agree writes Drive's saves into their slots. A slot that is empty in Drive keeps what is here.
  During a game it goes back to the title screen afterwards.
- **Auto**: off unless you turn it on. Then, after each save in the game, a copy goes up a few seconds
  later. It never opens a Google sign-in window by itself: the first copy has to be one you send, and if
  Google stops signing you in quietly, Auto stands down and the status turns red until you press
  **Save to Drive** once.
- On the save slots screen (**Continue**), **From Google Drive** does the same as Load from Drive, for a new
  phone or a cleared browser.

The copy is one file, `pokeleague-data.json`, in a folder named **GameHub** in your Drive: the folder the
author's games share (CardVerse files `cardverse-data.json` there). Whichever game is first makes the folder.
Each slot in the file is the same save that **Export** writes, and the game checks that a file is a
PokeLeague backup before it loads anything from it.

For a copy that is never overwritten, use **Export** on the save slots screen: it writes a dated file.

---

## How it is set up: the shared GameHub client

PokeLeague uses the same Google sign-in as CardVerse: one Google Cloud project named **GameHub** with one
OAuth client (Web application) for every game published on `https://kaonhew02.github.io`. CardVerse's
`docs/GAMEHUB.md` is the full convention and how the project was made. In short:

- **The client ID** is in `js/core/drive-config.js` (`clientId`), the same string as in CardVerse's
  `drive-config.js`. It is safe to publish: it only names the app. There is no client *secret* anywhere,
  and there must never be one: this sign-in does not use it (`tests/drive.test.cjs` checks the file).
- **The consent screen** belongs to the project, so the sign-in window says **GameHub**, not PokeLeague.
- **The scope** is `drive.file`: the games see only the files they made themselves, nothing else in your
  Drive, and that needs no review by Google. Because `drive.file` is granted per client, the games on the
  one client share one grant and one folder.
- **The folder** is a name, `folderName: 'GameHub'`, looked up (or made) in whichever Drive signs in, so
  every player gets their own. **The file** is `filename: 'pokeleague-data.json'`, which must stay unique
  among the games. Do not rename either once saves exist: a renamed file is a new one, and the old one is
  left behind, unseen.
- **Authorised JavaScript origins**: only `https://kaonhew02.github.io`. An origin is scheme and host, no
  path, so it covers `https://kaonhew02.github.io/PokeLeague/`. `http://localhost:8130` is **not** on the
  client, so Google refuses the sign-in from a local copy; try Drive on the published game. (Adding
  `http://localhost:8130` to the GameHub client in Google Cloud would allow it for every game on the client.)
- **Test users**: while the GameHub project is in Testing, only the Google accounts on its test users list can
  sign in (APIs & Services → OAuth consent screen → Audience → Test users).

### Trying it

Open `https://kaonhew02.github.io/PokeLeague/`, **Settings → Game → Save to Drive**. Google asks you to sign
in and to allow GameHub, once (a player who already allowed it for CardVerse may not be asked again). Then
`pokeleague-data.json` appears in the **GameHub** folder of your Drive. **Load from Drive** should offer the
same saves back.

---

## What it is, and what it is not

It is a copy you press for (or that Auto sends after a save). It is not live syncing between devices: each
device holds its own saves, and Drive holds whichever pressed **Save to Drive** last. **Load from Drive** on
the other device then replaces that device's slots (the ones Drive has). The safe habit: play on one device,
and only load on the others.

## When something breaks

- **"Google Drive is not set up for this game yet"**: `drive-config.js` has no client ID.
- **The sign-in window opens and closes at once, or Google says the origin is not allowed**: the page is not on
  `https://kaonhew02.github.io` (for example `http://localhost:8130`, which the GameHub client does not list).
- **"Access blocked: GameHub has not completed the Google verification process"**: the Google account is not
  on the GameHub project's test users list.
- **"The Google sign-in window could not open"**: allow pop-ups for the site. On iPhone, the game opened from
  the Home Screen icon may not be able to come back from Google's window (an iOS limit); use it from Safari.
- **Sign-in works, saving fails with 403**: the Drive API is not enabled in the GameHub project.
- **It asks you to sign in again after a while**: expected. A token lasts about an hour, and Testing mode asks
  for consent again now and then. Nothing is lost: the saves are in the browser regardless.
