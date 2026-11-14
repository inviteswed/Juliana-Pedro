# Juliana & Pedro · Wedding Invitation

Open `index.html` in a browser. There is nothing to install or build.
(GSAP and ScrollTrigger are bundled in `js/vendor/`, so it works offline; only the Google Fonts need internet.)

## Everything you will want to edit is in `js/config.js`

| What | Where in `config.js` |
|---|---|
| Names, monogram | `couple` |
| Wedding date, time, time zone, calendar title/description | `wedding` |
| Venue name, place, **full address**, Google Maps link | `venue` |
| Bible verse + reference | `verse` |
| Bride / groom details, intro text, Instagram, interests, quote, note | `bride`, `groom` |
| Love-story dates, text and photos | `story` |
| Hero / bride / groom / venue photos | `images` |
| Gallery photos (12–16; #1 is the big centre image) | `gallery` |
| Music file and volume | `music` |
| Share message and the final website URL | `share` |

Anything still written like `[Add Date]` is a placeholder (shown with a dashed underline). Replace it and the styling disappears. Optional bride/groom extras (Instagram, interests, quote, note) stay hidden until you fill them in. Nothing has been invented.

## Replacing photos
Overwrite the files in `assets/images/` (same names, JPG) or change the paths in `config.js`.

| File | Suggested size |
|---|---|
| `hero.jpg`, `venue.jpg` | 1920×1080 |
| `bride.jpg`, `groom.jpg` | 1100×1400 (portrait) |
| `story-1/2/3.jpg` | 1000×760 |
| `gallery/gallery-01…15.jpg` | any proportions; keep file names, or edit the list |

The current images are generated placeholders.

## Music
`assets/music/wedding-music.mp3` is an original instrumental loop made for this project (no copyrighted song). Swap in any file you have rights to and update `music.src`. Music only starts after the visitor taps **Explore our invitation**, and play/pause and mute choices are remembered.

## Before you publish
- Set `share.url` to the real website address (otherwise the current page address is shared).
- Fill in `venue.address`, the Bible verse, and the profile details.
- Upload the whole `wedding-invitation/` folder to any static host (Netlify, GitHub Pages, etc.).

## Notes
- `js/rsvp.js` contains the **Share Invitation** logic (Web Share → copy link, plus WhatsApp). There is no RSVP form, and no download buttons of any kind.
- **Add to Calendar** builds a valid `.ics` file in the browser and also offers a Google Calendar link. Time is 11:00 in `+05:30` (India), so every visitor's calendar shows it in their own time zone.
- `prefers-reduced-motion` is respected: animations are replaced by an immediate, static end state.
