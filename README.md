# Gunslinger EDH

A hidden-role (BANG!-style) overlay for a virtual Commander pod. One player is
the public Sheriff; everyone else is secretly a Deputy, Outlaw, Gunslinger,
Warrior, or Civilian with their own win condition layered on top of the
regular game.

No backend, no accounts, no database. The host deals the roles locally in
their browser and gets one private link per player — the role is encoded
*inside the link itself* (after the `#`, which browsers never send to a
server), so nothing is ever uploaded anywhere. Send each link privately (a
DM), not in the pod's shared channel.

## Role distribution

| Players | Roles in the deck |
|---|---|
| 5 | Sheriff, Deputy, 2× Outlaw, Gunslinger |
| 6 | + Warrior |
| 7 | + Civilian |

- **Sheriff** — public from the start, starts at 60 life. Wins when both Outlaws are dead.
- **Deputy** — hidden. Wins when both Outlaws are dead.
- **Outlaw** (×2) — hidden. Wins when the Sheriff is dead.
- **Gunslinger** — hidden, reveals on death. Instead of dying: phase out your permanents, commander to the command zone, shuffle library, keep hand, re-enter at 20 life with a locked life total and protection from everything until your next turn. Wins when the Deputy, one Outlaw, and the Warrior are dead.
- **Warrior** — hidden, reveals on death. Whoever's source lands the killing blow is eliminated too. Wins when the Deputy, one Outlaw, and the Gunslinger are dead.
- **Civilian** — hidden. Reveals (and wins) once someone else has already won.

There's no shared board — this is intentionally a static, no-backend build.
Revealing a role means what it always meant at a physical table: flip your
card (hold your screen up to the camera / say it out loud). Life totals
aren't tracked by the app at all — use whatever life counter your pod
already uses for Commander.

## How it works

1. The host opens the site, picks a player count (5–7), optionally names the
   seats, and hits **Shuffle & Deal**.
2. The page generates one link per seat and shows them in a list with a
   **Copy link** button each. The host sends each link privately to that
   player.
3. Each player opens their own link. The page decodes the role from the URL
   fragment client-side and shows only that player's role, win condition,
   and any special reminder text — plus the Sheriff's name (public) and the
   table roster (names only).

## Local development

No build step. Serve the directory with any static file server, e.g.:

```sh
npx serve .
# or
python3 -m http.server 8080
```

## Deploying to Netlify

1. Push this directory to a git repository, then in Netlify: **Add new site
   → Import an existing project**, and point it at the repo.
   `netlify.toml` already sets the publish directory to `.` — no build
   command needed.
2. Or drag-and-drop the folder onto
   [app.netlify.com/drop](https://app.netlify.com/drop) for an instant
   deploy without git.

No environment variables or secrets are required.

## Notes / limitations

- Privacy here is "the role only exists in a link you control," not
  cryptography — anyone who gets a player's link (or that player's browser
  history) can see their role. Fine for a friend game; don't reuse for
  anything with money on it.
- Role links can get long (a few hundred characters, base64-encoded). Most
  DM clients handle that fine; if one truncates it, resend as plain text
  instead of a rich preview.
- If you want a *live-synced* version instead (one shared link, Sheriff
  reveal / life totals / eliminated status updating on everyone's screen in
  real time), that needs an actual backend (e.g. Firebase) — a fundamentally
  different build from this static one.
