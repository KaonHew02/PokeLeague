/* ============ drive-config.js — the Google Drive copy of the saves (drive.js) ============
 * PokeLeague uses the shared GameHub OAuth client, the same one as CardVerse (CardVerse's docs/GAMEHUB.md):
 * one Google Cloud project named GameHub, one client ID for every game on https://kaonhew02.github.io, so the
 * sign-in window says "GameHub" and every game files its save in one folder, GameHub, in the player's own
 * Drive. The client's only authorised origin is https://kaonhew02.github.io (an origin has no path, so it
 * covers /PokeLeague/ too); http://localhost:8130 is not on it, so signing in works on the published game only.
 * docs/DRIVE.md has the details.
 *
 * An OAuth client ID is not a secret: it only names the app, Google gives it nothing without you signing in
 * and agreeing, and it only works from the web addresses registered for it. What must NEVER be here is a
 * client SECRET: this kind of sign-in does not use one.
 */
G.DRIVE_CONFIG = Object.freeze({
  clientId: '612843079573-ujp69s8asq895kofufsb84j372qrhl9f.apps.googleusercontent.com',
  /** The folder shared by the GameHub games (made in your Drive by whichever game is first), and this game's
   *  one file in it: the name must differ from every other game's (CardVerse's is cardverse-data.json).
   *  Renaming either later would leave the old file behind, unseen. */
  folderName: 'GameHub',
  filename: 'pokeleague-data.json'
});
