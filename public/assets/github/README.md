# GitHub profile assets

The original YOLO and Pull Shark PNGs were verified on
https://github.com/jiangfengwhu on 2026-10-24. They are GitHub artwork,
downloaded from the source URLs recorded in `src/data/githubSnapshot.json`.

Refresh from the project root with `python scripts/sync-github.py` (Python 3.9+).
The script reads public profile/contribution data and repository languages,
then saves original badge images locally. If the API is rate limited, previous
language statistics remain available; contribution and badge updates continue.

`.github/workflows/github-profile.yml` refreshes once daily and can be run
manually. It becomes active after the project is pushed to the GitHub default
branch with Actions enabled. A deployed static site needs its usual rebuild
after a snapshot commit. The script never embeds a token in site assets.

The contribution snake uses a separate small texture at 10 fps. It pauses on
Act II, work details, hidden tabs, and reduced-motion preference. These texture
frames reuse the existing shadow map.
