### Overview

This branch is for an ongoing effort to re-organize the doc structure. The goal is to make it better by:
* Establising a better table of contents that follows a natural flow.
* Remove duplicate or stale content.
* Manage versions of doc across major releases.

### Contributors Guide

1. [Fork the project on github](https://help.github.com/articles/fork-a-repo/)
2. Git clone your fork:  
`git clone https://github.com/<your-username-here>/glusterdocs`
3. Add upstream remote:   
`git remote add upstream https://github.com/gluster/glusterdocs/`  
`git pull upstream`
4. Checkout the refactor branch:  
`git checkout -b refactor upstream/refactor`
5. Create your branch from the refactor branch:  
`git checkout -b <your-branch-name>`  
6. Make change, commit and push to your fork:  
`git commit -as`  
`git push origin`  
7. [Create a PR against refactor branch.](https://help.github.com/articles/using-pull-requests/)
8. Address review comments by adding commits to your PR or amending original commit.
9. Your PR will be merged by one of the maintainers.
