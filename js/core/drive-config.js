/* ============ drive-config.js — the Google Drive copy of the saves (drive.js) ============
 * clientId: Google Cloud → APIs & Services → Credentials → OAuth client ID (Web application), for the
 * PokeLeague project; it ends in ".apps.googleusercontent.com". Until it is filled in, the Drive buttons
 * say the copy is not set up, and nothing ever talks to Google. docs/DRIVE.md walks through making one.
 *
 * An OAuth client ID is not a secret: it only names the app, Google gives it nothing without you signing in
 * and agreeing, and it only works from the web addresses registered for it. What must NEVER be here is a
 * client SECRET: this kind of sign-in does not use one.
 */
G.DRIVE_CONFIG = Object.freeze({
  clientId: '',
  /** The folder the game makes in your Drive (once), and the one file it keeps there. */
  folderName: 'PokeLeague',
  filename: 'pokeleague-saves.json'
});
