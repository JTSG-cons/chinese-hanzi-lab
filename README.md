# Hanzi Lab

A visual study site for 汉语教程 (3rd ed.) Book 1A lessons 1-8 (182 characters), Chinese listening lessons 1-5 and China Overview, built around a 2-day exam plan.

- **Today**: exam countdowns and an hour-by-hour plan with tick boxes.
- **Palace 3D**: one room per lesson, with every character on a fixed pedestal (memory palace). Tap a tile to open it.
- **Character card**: stroke-order animation, write-it quiz, parts, picture story and a 3D tone ribbon.
- **Drill**: meaning, pinyin, writing, words, sentence order and listening drills, scheduled with FSRS.
- **Reading / Listening / Overview**: dialogues, tone and initial/final drills, a 3D history timeline and a quiz.
- **Mock exams**: one timed paper for each of the 4 exams, newly generated each time.

Static HTML, CSS and JS with no build step. three.js, Hanzi Writer (+ stroke data for the 182 characters only) and ts-fsrs are bundled in `vendor/`.

Run locally: `python -m http.server` in this folder, then open http://localhost:8000. The local `private/` folder (not published) adds the textbook's own lesson texts. `audio/` holds the textbook recordings for L1-5.
