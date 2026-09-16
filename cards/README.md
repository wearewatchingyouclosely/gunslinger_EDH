# Card art

Drop your own card images in this folder using these exact filenames, and
every new game deals with them automatically — no need to paste a URL on
the deal screen each time:

```
cards/sheriff.png
cards/deputy.png
cards/outlaw-1.png   (first Outlaw seat dealt)
cards/outlaw-2.png   (second Outlaw seat dealt)
cards/gunslinger.png
cards/warrior.png
cards/civilian.png
```

Outlaw is the one role with two seats, so it gets two variant images — each
Outlaw player sees their own on their reveal link, while everyone's rules
carousel shows `outlaw-1.png` as the generic reference. Typing a manual URL
into the Outlaw field on the deal screen overrides both seats with that one
image instead.

Any image format works (`.png`, `.jpg`, `.webp`, ...) — just update the
matching path(s) in `DEFAULT_ART` near the top of `js/app.js` if you don't
use `.png`.

You don't need every role filled in. A missing file just falls back to the
plain text card for that role, so you can add them one at a time.

These are meant to be full card images already containing your own art,
title, and rules text — the app displays them as-is with no text overlaid
on top. The "Card art" fields on the deal screen pre-fill from whatever's
here but can be overridden per game (paste a different URL, or clear the
field to force the plain text card for that one deal).
