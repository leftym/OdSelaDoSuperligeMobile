# Od Sela do Superlige

A football club owner game: take a muddy village club from the Opštinska liga to the Serbian Superliga
and into Europe. It's built as a single web page and wrapped as an Android app.

## What's where

| Folder | What it holds |
|---|---|
| `game/src/js/` | The game's code, one file per system (`00-utilities.js` … `39-boot.js`). Files are joined in name order. |
| `game/src/styles.css`, `game/src/index.html` | The look, and the page the code goes into. |
| `game/src/img/` | The paintings (WebP). |
| `game/src/fonts/` | The fonts the Android app carries, so it works offline (Fontsource, SIL Open Font License). |
| `game/build.js` | Builds `game/dist/od-sela.html` (+ `img/`) and the Android app's copy of the game. |
| `game/tests/` | The test suite (runs the game in a real browser). |
| `game/tools/import.js` | Splits a single `od-sela.html` back into `game/src/`. |
| `android/` | The Android app: a full-screen WebView that runs the game. |

## How a change reaches your phone

1. Change files in `game/src/` (or import a new `od-sela.html`, below) and push to GitHub.
2. GitHub runs **Build and test** automatically: it builds the game, runs every test,
   and only if they all pass, builds the Android app.
3. Open the run under **Actions**. A green check gives you two downloads:
   - **od-sela-app**: a zip with `app-debug.apk`. Install it over the old app; your career is kept.
   - **od-sela-web**: the game page and its paintings, playable in any browser.

   A red ✗ means a test failed and no app was built. Open the failed step to see why.

The version number goes up by itself with every GitHub build. Keep `android/app/debug.keystore`
as it is: every version is signed with it, which is what lets a new APK install over the old one
without losing your career.

## Installing on the phone

1. Download **od-sela-app** from the latest green run, unzip it, and open `app-debug.apk` on the phone.
2. Allow installing from this source when Android asks. If Play Protect says it doesn't recognize
   the app, choose **Install anyway**: it's flagged only because it didn't come from Google Play.

**Bringing a career over from the browser:** in the browser version open **Klub → Čuvanje → Kopiraj kod**.
In the app, start any career, then **Klub → Čuvanje → Učitaj kod** and paste it.

The career lives inside the app, so uninstalling the app deletes it. Updating does not.

## When you receive a new od-sela.html instead of source files

```
node game/tools/import.js path/to/od-sela.html
node game/build.js
node game/tests/run.js
```

Then commit the changed `game/src/` files. (New paintings go in `game/src/img/`.)

## Running things on a computer (optional)

You need Node.js 20 or newer.

```
npm ci                          # once: installs the test browser driver
npx playwright install chromium # once: the browser the tests use
node game/build.js              # build the game
node game/tests/run.js          # run every test (about a minute and a half)
node game/tests/run.js saves    # run only test files whose name contains "saves"
```

Building the APK yourself needs the Android SDK; GitHub does that part for you.

## Not set up yet

Google Play publishing (release signing key, store listing, upload) is deliberately left out
until the game is ready for it.
