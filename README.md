[![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)

# e-commerce-mavericcks-bn

Backend for team Maverick's e-commerce website

# PIVOTAL TRACKER WITH GITHUB BEST PRACTICES

[Pivotal Tracker's Docs](https://www.pivotaltracker.com/help/articles/github_integration/#attaching-branches-to-a-story-automatically)

Welcome! This document will guide you through what are the best practices during making sure that your works are available in Pivotal tracker, and of course if they are matching with provided tasks.

## NAMING CONVENTIONS

### Branches

If you create a branch from the command line and include the story id in the branch name, Tracker will automatically attach a branch to the story.

For example, creating a branch with the name `123123-super-cool-feature` will attach it to the story with id 123123.

### Commits

Add the Tracker story id with a preceding hash symbol within square brackets at the end of your commit message.
Optionally, you can include a state change for the Tracker story within the brackets.
Currently, there are two state changes supported:

1. **Finished** and
2. **Delivered.**

For example, including “Finishes” or “Fixes” in your commit message will change the specified story to the Finished state, while “Delivers” will change the specified story to Delivered state.

**SYNTAX:** `[(Finishes|Fixes|Delivers) #TRACKER_STORY_ID]`

**_E.G:_** `git commit -m "[finishes #123123] Updated settings for holograph projector"`
This will mark the story with id: _123123_ as _Finished._

You can specify multiple story ids in a commit by separating each id with a comma or space, within square brackets. However, all story ids will show in the commit on all specified stories.

**SYNTAX:** `[#TRACKER_STORY_ID,#TRACKER_STORY_ID]` or `[#TRACKER_STORY_ID #TRACKER_STORY_ID]`

Alternatively, you can place each story id in its on set of square brackets, and separate each set of brackets with a comma or space. This will prevent story ids from showing up in non-related stories.

**SYNTAX:** `[#TRACKER_STORY_ID],[#TRACKER_STORY_ID]` or `[#TRACKER_STORY_ID] [#TRACKER_STORY_ID]`

### Pull Requests

Tracker will automatically attach a pull request to a story if the name of the branch that is being merged starts with that story’s ID, as described in Attaching Branches to a Story Automatically above.

## BEST PRACTICES WHILE NAMING

### Branches

Here are some best practices to name a branch while working as a team.

1. Remember, no upercases, and spaces should be replaced with hyphen.
2. Start with Pivotal tracker's story id. (If you want to connect it with certain story.)
3. COntinue with prefix for what you are working on:
   1. `ch` for chores.
   2. `fit` for features.
   3. `bg-fix` for bug fixes.
4. Keep the name short.
5. Be consistent. Follow just one convention.
6. Finally, make sure that the name matches the feature that you have worked on.

### Commits

During commiting, make sure you follow these practices.

1. Start the subject line with a verb in the imperative mood that describes the change introduced by the commit.
   > Examples: "Fix", "Add", "Implement", "Refactor", etc.
2. Keep the subject line concise, ideally under 50 characters. This ensures readability in various Git tools.
3. Explain the reason for the change, not just the mechanics.
4. Aim for commits that represent a single, logical change. This makes it easier to understand the code history.
5. Capitalize the first letter of the subject line and any following words.

By following all of those listed conventions, as well as best practices, you will not only be able to provide readable, maintainable, and well-written codes, but also help your colleagues.

#### Useful links

1. [Pivotal Tracker's Offical Documentation](https://www.pivotaltracker.com/help/articles/github_integration/#attaching-branches-to-a-story-automatically)
2. [freeCodeCamp Article on Naming Commits](https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/)
3. [Medium article on Naming Branches](https://medium.com/@abhay.pixolo/naming-conventions-for-git-branches-a-cheatsheet-8549feca2534)

# Setting up Swagger Documentations

If this is your first time to setup your swagger documentaions, you will need to follow the following steps. Since Everything is set up, you don't need to set them up again. All you need is to intergrate your `.yaml` files in src/docs.
Checkout the detailed steps.

## Steps to setup your swagger documentations.

1. Since you have cloned files from github, you will have to navigate to the location: src/docs.
2. After reaching there create the file with extension `.yaml`.
3. _Open that file, and write all your documentations._
4. Everything wiil be perfect after that. You don't need to set things related to the swagger documentaions in server.ts again.

### **Keep in mind, you are writing in `.yaml` and it strictly follows indentations so make sure you follow them too.**
