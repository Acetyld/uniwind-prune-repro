# Uniwind Pro: pruneUnmountedEntries cost on every mount

Repro for https://github.com/uni-stack/uniwind/issues/717.

Not run yet as a standalone project: it follows the setup of the app where we measured this (same versions). Needs a Uniwind Pro licence. This repo contains no Pro code; install Pro yourself.

## Run

1. `npm install`, then install the Pro build (`npx uniwind-pro`).
2. `npx expo prebuild`, then `npm run android` or `npm run ios` (release build, on a physical device if possible; a low-end Android phone shows it best).
3. Turn on the Perf Monitor (or profile the main thread with Perfetto / Instruments).

Android note: on RN 0.88, Pro 1.8.1 resolves the Fabric UIManager in the `UniwindModule` constructor, before it exists. We resolve it lazily on first use in a local patch; without that the app may not start on Android.

## What to look at

- Scroll the FlashList fast. Every scroll frame that mounts cells is a Fabric mount, and every mount runs `pruneUnmountedEntries` over all registered entries.
- Press "Mount 300 hidden rows". The registered entry count goes up by about 2400 while nothing visible changes. The red bar is a Reanimated animation, so every frame is a mount; its UI-thread frame rate and the scroll frame rate drop in proportion to the entry count.
- Our workaround (described in the issue comment) runs the prune at most once per 750 ms, always on the first mount and while a theme commit is pending. With it, the same scroll costs clearly less main-thread time.
