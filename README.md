# Dracula's Monster Check

Open `index.html` in a modern browser. No build step or internet connection is required.

For a local preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765.

The English game includes five profiles, five clue questions, three shadow matches, five power scenarios, a persistent monster passport, restart, optional synthesized sound and a mission-code reward. Monster illustrations were generated for the project; the current Dracula host uses the user-supplied PNG in assets. All assets are stored locally in `assets/`.

Completion is stored in localStorage when the browser permits it. When embedded, completion sends `HOTEL_MISSION_COMPLETED` to the parent with mission `meet-the-monsters` and code `MONSTER1`. The local award and mission code remain visible even if the parent does not handle the message.

To configure a parent map, set `window.HOTEL_PARENT_MAP` to the map directory URL before `script.js` runs. The map button then opens `index.html?mission=1&complete=true` in that directory. Without configuration, it displays instructions and the copyable mission code.

Restart clears the saved run and reward. The gallery remains available after completion; replay starts a new check while retaining the viewed profiles.

## Current game flow

1. Meet all five monsters in a castle portrait gallery with themed gold frames and glowing progress medallions.
2. Answer five WHO AM I? clues. Specific hints appear after repeated errors.
3. Match three shadows. Each match opens a native modal dialog: tap shuffled words to build a sentence and light a candle. Tap placed words to return them; START AGAIN clears the sentence. Closing or pressing Escape keeps the puzzle available. The pending puzzle and chosen word order survive reload.
4. Solve five hotel situations in SKILLS & SECRETS, then receive the guest award immediately.

The separate sentence-building screen and final written introduction were removed to keep the mission short. Saved runs on those removed screens migrate into the shorter flow. Profile facts use larger type (23px on phones, 24–32px on desktop).

LISTEN uses an installed local English system voice; no online voice is requested. Availability depends on the browser and installed voices. Reading and all game mechanics work without it.

Open `tests/playthrough.html` through the local server for the interaction checks; add `?mobile` for a 390px frame. Tests reset the game in the same browser origin. Target duration has not been timed with children.

## Gallery profile presentation

Profiles use a gothic gold frame, themed velvet backdrop, pedestal, candlelight, illustrated fact emblems and a separate signature-ability panel. Vampire details use bat and fang motifs. Both actions share gold-trimmed fantasy styling; LISTEN has a high-contrast burgundy treatment. A local progress badge and the header show monsters met while viewing the gallery or a profile; during the check, the header shows earned stamps. The redesign adds no tasks.

## WHO AM I? visual update

The five original clues and answer IDs are unchanged. The round uses a locally drawn ivory-and-gold parchment, the existing castle background and original character PNGs in gothic portrait frames. The speaker sits inside the parchment and calls the same local speech playback. Portrait buttons use visual descriptions instead of monster names; only the clicked name appears in answer feedback. Repeated mistakes offer hints without highlighting the correct portrait in this round. Correct answers add a short gold-frame glow, particles and a character effect; Dracula reacts in a short speech bubble. Five clue medallions supplement the existing mission progress. Animation respects reduced-motion preferences. All decorative assets and artwork work offline; no character artwork was replaced.

## Shadow theatre update

ROUND 02 uses the original character PNGs as black silhouettes behind warm illuminated screens, with velvet curtains, gold gothic arches, moonbeams and subtle moving fog. Nameplates support native desktop drag-and-drop to either an arch or its empty slot, plus keyboard/tap matching in either order (shadow then name, or name then shadow). The existing scrambled sentences, saved pending puzzles, word order, retries and progression are preserved. Only a solved sentence lights an illustrated candle and triggers the silhouette dissolve and original colour-art reveal. Motion respects reduced-motion preferences. The word dialog keeps its monster in silhouette until the sentence is completed; no artwork is replaced.

## Cinematic welcome dialogue

The intro and pre-check Dracula dialogue use the unchanged original host PNG and exact English lines in an ivory gothic speech bubble. The brighter lobby remains visible, with a soft contact shadow, warm edge lighting, a gentle entrance and low-amplitude idle motion. CONTINUE stays directly below the bubble, followed by scene-progress dots. Sound and restart remain accessible; the marketing header and footer are hidden only during these dialogue scenes. Intro lines update in the same DOM nodes without rebuilding the character or bubble. Reduced-motion preferences disable the added animations.

## Monster rescue mission (Round 03)

The original five educational questions and answer IDs are unchanged. A single illustrated SVG environment now fills the mission stage, with a compact five-member team below. All five original character PNGs remain intact. Scenery is local interactive vector artwork in `assets/rescue-scenes.js` and loads without fetch or external services, including from file URLs.

Implemented actions follow the existing questions and introduced abilities:

- Vampire enters, fades into a bat silhouette and flies through the high window.
- Werewolf enters the moonlit garden and howls with expanding sound rings and glowing hotel windows.
- Invisible Man fades and passes through the corridor doorway as its panel moves.
- Frankenstein's monster approaches and lifts the heavy bag.
- Mummy poses on the Egyptian film set with moving camera reels, a recording light and a brighter spotlight. No new supernatural historical power is implied.

Wrong selections enter the scene with a brief character reaction and allow retry, without highlighting the correct helper. Correct selections animate the scene, award the same stored passport stamp and enable NEXT. The original mission completion, parent message and reward remain unchanged. Reduced-motion mode shows static solved states. LISTEN still reads the original scenario.

## Fixed 16:9 stage and Genially

Every screen now uses one logical 1600×900 canvas, uniformly fitted to the actual browser or iframe viewport. `viewport.js` responds to resize events; `viewport.css` compacts each scene into the canvas. Layout breakpoints use the named canvas container rather than the outer iframe width, so embedded content retains its composition. Both page scrollbars are disabled, and the native word dialog fits independently to the viewport. A tall viewport letterboxes the 16:9 scene; landscape is recommended for readability on phones.

The supplied `assets/3ad26a70-5601-48f9-bd42-0fc684b35cbf.png` is the current Dracula host. Its original file and the former host image are both retained.

For GitHub Pages publish the extracted root files and complete assets directory, including `viewport.css`, `viewport.js` and `.nojekyll`. See `EMBED_GENIALLY.txt` for exact setup and iframe markup. `embed-preview.html` provides a local 16:9 iframe preview. No repository has been published and the actual Genially editor has not been tested; local iframe rendering and game interactions were verified.

## Cinematic rescue backgrounds

Five original high-resolution panoramic PNG environments generated with built-in imagegen now replace the flat vector rooms. Files: `assets/rescue-room-vampire.png`, `rescue-room-werewolf.png`, `rescue-room-invisible-man.png`, `rescue-room-frankenstein-monster.png` and `rescue-room-mummy.png`. The original monster images, answer IDs, questions, team controls, animated actors/props and stored rewards remain unchanged. The scenes load locally and are preloaded. Interactive lighting is layered over the generated artwork. Prompts are recorded in `assets/rescue-art-prompts.json`.

## Illustrated rescue props

`assets/rescue-suitcase.png` and `assets/rescue-camera.png` replace the flat CSS prop drawings with original transparent high-resolution illustrations generated using built-in imagegen. The suitcase retains its lifting animation and receives a contact shadow. The camera uses the illustrated tripod instead of the CSS silhouette, with a recording glow, subtle shutter movement and a projected light effect during filming. Prompt set: `assets/rescue-prop-prompts.json`.

## Victory celebration

Only a completed run with all five earned stamps can render the celebration. The existing castle lobby, supplied Dracula image and five monster PNGs form a large celebratory cast. An animated gold-and-burgundy pass shows five portrait seals and OFFICIAL MONSTER FRIEND. Clicking it adds a magical shine. The MONSTER1 key and two main controls appear after a short celebration; reduced-motion mode shows them immediately. Both the key and COPY SECRET CODE copy the exact code using the Clipboard API, then a selected-input/execCommand fallback, then visible manual copying. CONTINUE ADVENTURE keeps the existing HOTEL_PARENT_MAP navigation; without a configured destination it gives local instructions to return to the Genially map. No destination is invented. The parent completion message and saved reward stay unchanged.

The game now opens directly with Dracula’s hotel greeting. ENTER HOTEL and the separate start screen have been removed. Restart returns to the first greeting; saved mission progress still resumes as before.

Final reward now shows only the golden key, without a visible MONSTER1 code or copy controls. CONTINUE ADVENTURE retains configured map navigation and a code-free return instruction. The internal completion event keeps its existing identifier for compatibility.
