---
name: GitHub history divergence
description: Safe handling when a workspace snapshot and the target GitHub repository have unrelated histories.
---

When a target repository already has a newer, unrelated `main` history, do not force-push the workspace branch. Fetch the remote, create an integration branch from `origin/main`, apply only the requested changes, and push that branch for review.

**Why:** A force-push can erase work that already exists in the user's repository, while a review branch preserves both histories and makes conflicts explicit.

**How to apply:** Prefer a pull request branch named for the feature. Verify the remote branch SHA after pushing and leave `main` untouched until the user merges.