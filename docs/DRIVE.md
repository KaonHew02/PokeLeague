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

The game makes one folder in your Drive, **PokeLeague**, with one file in it, `pokeleague-saves.json`. Each
slot in it is the same save that **Export** writes.

For a copy that is never overwritten, use **Export** on the save slots screen: it writes a dated file.

---

## Setting it up (once, about five minutes)

Until the client ID is filled in, the Drive section only says it is not set up, and the game never talks
to Google.

### Step 1: a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. Project dropdown at the top → **New project**. Name it `PokeLeague`. Create.
3. Make sure the project selector now says **PokeLeague** before going on: every step below applies to the
   selected project, and setting up MoneyFlow's by mistake is the easiest error to make.

It costs nothing: this kind of project is free, and Drive calls at this volume are free.

### Step 2: switch the Drive API on

**APIs & Services** → **Library** → search **Google Drive API** → **Enable**.

Without it, sign-in works and every save fails with 403.

### Step 3: the consent screen

**APIs & Services** → **OAuth consent screen**.

1. User type **External**. Create.
2. App name `PokeLeague`, your email as the user support and developer contact. Save and continue.
3. **Scopes** → **Add or remove scopes** → tick **`.../auth/drive.file`** ("See, edit, create and delete only
   the specific Google Drive files you use with this app"). Update, then save and continue.
4. **Test users** → **Add users** → your own Gmail address (and anyone else who will use it). Save.

Why `drive.file` and nothing wider: the game can only see the files it made itself. It cannot read your
other documents or list your Drive, and that is also why Google needs no review. Do not use the wider
`drive` scope.

Leave it in **Testing**. Publishing starts a verification you have no use for; Testing works for the test
users you listed. Google asks for consent again now and then: a few taps, months apart.

### Step 4: the client ID

**APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.

- Application type: **Web application**
- Name: `PokeLeague web`
- **Authorised JavaScript origins**, both, exactly, no trailing slash:
  - `https://kaonhew02.github.io`
  - `http://localhost:8130`
- **Authorised redirect URIs**: leave empty (the game takes its token in a pop-up).

Create, and copy the client ID: it ends in `.apps.googleusercontent.com`.

There is a client *secret* on that screen too. The game does not use it and must not: a secret in a public
GitHub repository is not a secret.

### Step 5: paste it in

In `js/core/drive-config.js`:

```js
G.DRIVE_CONFIG = Object.freeze({
  clientId: '1234567890-abcdefg.apps.googleusercontent.com',
  folderName: 'PokeLeague',
  filename: 'pokeleague-saves.json'
});
```

Then `node tools/build.js`, commit and push. The client ID is safe to publish: it only names the app.

### Step 6: try it

Open the game (on `https://kaonhew02.github.io/PokeLeague/` or `http://localhost:8130/`), **Settings → Game →
Save to Drive**. Google asks you to sign in and to allow PokeLeague, once. Then the folder **PokeLeague** with
`pokeleague-saves.json` appears in your Drive. **Load from Drive** should offer the same saves back.

---

## What it is, and what it is not

It is a copy you press for (or that Auto sends after a save). It is not live syncing between devices: each
device holds its own saves, and Drive holds whichever pressed **Save to Drive** last. **Load from Drive** on
the other device then replaces that device's slots (the ones Drive has). The safe habit: play on one device,
and only load on the others.

## When something breaks

- **"Google Drive is not set up for this game yet"**: `drive-config.js` has no client ID yet (step 5).
- **The sign-in window opens and closes at once**: this address is not in the authorised origins (step 4).
  `http://localhost:8130` and `https://kaonhew02.github.io` are different origins; both must be there.
- **"Access blocked: PokeLeague has not completed the Google verification process"**: the Google account is not
  on the test users list (step 3, item 4).
- **"The Google sign-in window could not open"**: allow pop-ups for the site. On iPhone, the game opened from
  the Home Screen icon may not be able to come back from Google's window (an iOS limit); use it from Safari.
- **Sign-in works, saving fails with 403**: the Drive API is not enabled (step 2).
- **It asks you to sign in again after a while**: expected. A token lasts about an hour, and Testing mode asks
  for consent again now and then. Nothing is lost: the saves are in the browser regardless.
