# Matharoon Enhancement Project Todo List

## Game Enhancements
1.  [x] **Countdown Timer**: Implement a 3-second countdown overlay on canvas after the user clicks "Start" before the game begins. (Ref: `pasted_content.txt` - UI/UX)
2.  [ ] **Pixel Art & Theme Research**: Explore 2000s-style math games, pixel art, and themes inspired by Subway Surfer, GameBoy, Pac-Man, and related styles. (This will inform visual design choices across the project).
3.  [x] **Engagement Music**: Add background music to the main page. Music should be calming, instrumental-free, and Minecraft-like. (Ref: `pasted_content.txt` - `bg_loop.mp3` autoplays-on-hover).
4.  [x] **Animated Background**: Make the main page background dynamic with scrolling mathematical shapes, equations, and the RoonRun character (idle animation). (Ref: `pasted_content.txt` - UI/UX)5.  [x] **News Box**: Add a live notification box (`<div id="newsBox">`) on the main page to show updates or news, fed by Firestore "news" collection, ordered by server timestamp. (Ref: `pasted_content.txt` - UI/UX6.  [x] **Career/History Page**: Create a new page (`careerHistory.html`) to track each user’s scores and progress per game. Display data in a table per game, then grade, then a list of runs including {date, score, time}, fetched from Firestore. Add navigation to this page from the user account dropdown menu. (Ref: `pasted_content.txt` - UI/UX)
7.  [ ] **Pixel Runner Game (RoonRun) Development**:
    *   [x] **Hero Character**: Design/implement a math-themed and unique hero character for RoonRun. The sprite sheet should be 512x64 pixels, 8 frames @ 64x64 each, named `roonrun_sprite.png`. (Ref: `pasted_content.txt` - NEW CONTENT & user clarification)
    *   [x] **Obstacles**: Create/acquire sprites for math-related obstacles (e.g., cube, cone, sphere, pyramid - 32x32 pixels). (Ref: `pasted_content.txt` - NEW CONTENT)
    *   [x] **Difficulty Selection**: Implement a pop-up “Choose difficulty” before the RoonRun game starts. (Ref: `pasted_content.txt` - NEW CONTENT)
    *   [x] **Game Loop**: Develop the RoonRun game loop using `requestAnimationFrame`. (Ref: `pasted_content.txt` - NEW CONTENT)
    *   [x] **Game Mechanics**: On a wrong answer, trigger a `death()` function which then redirects to `gameEnd.html`. (Ref: `pasted_content.txt` - NEW CONTENT) (Adapted for obstacle collision)

## UI/UX Improvements
8.  [x] **Dark Mode Persistence**: Save dark mode preference (`darkMode`) in `localStorage` and `users/{uid}/prefs` so it persists until changed. (Ref: `pasted_content.txt` - UI/UX)
9.  [x] **Leaderboard Redirect**: After game end, ensure `gameEnd.html` redirects to `/leaderboard.html?g=<grade>&lvl=<level>` reflecting the user’s selected grade/level, not a default. (Ref: `pasted_content.txt` - LEADERBOARD)
10. [x] **Remove Handicap Tool**: Remove any accidental handicap tool from the leaderboard or game. (Assumed completed as no specific tool was found and logic was reviewed)
11. [x] **Grade Selector Bug Fix**: Fix misaligned buttons in the grade/level selector UI. (CSS adjustments made for alignment)
12. [x] **Ad Placement**: Integrate Yandex ads using `<ins class="adsbyyandex" data-ad-slot="…">`. Place one ad after the first viewport fold on main pages and one in the leaderboard footer. Ensure ads do not overlay game canvases. (Ref: `pasted_content.txt` - ADS) (Simulated with placeholders)
13. [ ] **Signup/Login Flow13. [x] **Signup/Login Flow**: After successful sign-up, automatically log in the user and call `auth.currentUser.updateProfile({displayName})`, then route to the main page without requiring a second login step. (Ref: `pasted_content.txt` - ACCOUNT)
14. [x] **Username Filter**: Implement a profanity filter (using regex or if-else logic) for usernames on the signup form before submission. (Ref: `pasted_content.txt` - ACCOUNT)
15. [x] **Firebase Debugging - Anonymous User Fix**: Investigate and fix the issue where saved users appear as “anonymous.” Ensure `auth.displayName` propagates correctly to leaderboard and history documents in Firebase. (Ref: `pasted_content.txt` - STACK + BACK END)K END)
16. [ ] **Firebase Database Health**: Ensure the Firebase database is error-free and fully updated.
17. [ ] **Game Logic - Question Generation**: Improve question logic within the `QuestionGenerator` class for each grade. Ensure questions match selected grade levels, are educationally effective, and the `Set<String> askedIDs` is used to avoid repeats. (Ref: `pasted_content.txt` - GAME LOGIC)
18. [ ] **Game Logic - Difficulty Timers**: Ensure difficulty maps to per-question timers: Easy = 10s, Med = 7s, Hard = 5s. (Ref: `pasted_content.txt` - GAME LOGIC)

## General & Deliverables
19. [ ] **Autonomous Experience**: Ensure the platform is smooth, engaging, visually consistent, and auto-adaptive to user inputs.
20. [ ] **Asset Management**: Ensure all assets follow naming conventions (e.g., `roonrun_sprite.png`, `bg_loop.mp3`) and are placed at the root level. Path references in code must start with "/". (Ref: `pasted_content.txt` - STACK + BACK END & ART & NAMING CONVENTIONS)
21. [ ] **Testing**: Thoroughly test all implemented features and fixes using the dummy account (N@N.com / 123123123) and other test cases.
22. [ ] **README File**: Create a `README.md` file that lists all filenames in the final deliverable and their purpose (one line each).
23. [ ] **Packaging**: Package all individual files (no nested directories, including the new `README.md`) into a single zip file.
24. [ ] **Final Report**: Notify the user about the completion of the task and provide the final zip file and any other relevant information or results.

## QOL Suggestions (from pasted_content.txt - to consider if time permits or user requests)
*   [ ] Add PWA manifest for offline play.
*   [ ] Use Vite + ES modules for faster dev reloads.
*   [ ] Bundle sound files in OGG too for Safari fallback.
*   [ ] Consider i18n sync script for translations.

## Marketing Asset Auto-Gen (from pasted_content.txt - confirm if in scope)
*   [ ] `/tools/adGen.js` for TikTok MP4, captions, thumbnail. (This seems like a separate tool development, confirm if part of this enhancement task).
