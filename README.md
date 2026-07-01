# vibering webring

A dead-simple, **fully static**, **invite-only** [webring](https://en.wikipedia.org/wiki/Webring):
a loop of personal websites that link to one another. No backend, no database, no build step.
Deploys free to GitHub Pages, Netlify, Vercel, or any static host.

```
webring/
├── index.html        the directory + join panel
├── manifesto.html    the "why make a personal website" manifesto
├── go.html           the prev / next redirect engine
├── random/index.html the clean /random/ redirect
├── webring.js        shared config + routing logic  ← edit CONFIG here
├── webring.json      the member list (curated; PRs need a vouch)
├── badge.svg         88×31 badge members link back with
├── JOIN.md           the file you hand to invited people
└── README.md
```

## How it works

The whole ring is driven by `webring.json`, an **ordered** array of members:

```json
[
  { "name": "you",     "gh": "your-github-username", "url": "https://your-site.com", "invitedBy": "founder" },
  { "name": "ada",     "gh": "torvalds",             "url": "https://ada.example.com", "invitedBy": "you" }
]
```

`name`, `gh`, and `url` are the basics (`gh` is optional; it just pulls the GitHub avatar).
`note` is an optional one-line descriptor shown under each member (e.g. `"solo dev · india"`).
`invitedBy` records who vouched for each member: use `"founder"` for the people who started
the ring, and the inviter's handle for everyone else. It keeps the invite-only model honest.

`index.html` fetches that file and renders the directory. `go.html` reads it too and resolves
navigation entirely in the browser:

| Link                                   | Goes to                                   |
| -------------------------------------- | ----------------------------------------- |
| `go.html?from=NAME&dir=next`           | the member **after** NAME (wraps around)  |
| `go.html?from=NAME&dir=prev`           | the member **before** NAME (wraps around) |
| `/random/` (or `go.html?dir=random`)   | a random member                           |

The homepage is a clean dark theme, with a `/manifesto.html` page and a member directory that
renders from `webring.json` (avatar, name, host, and the optional `note`).

## How to join the ring (invite-only)

Membership is invite-only. There is no public sign-up: people can't add themselves. To be invited,
message **arshnah on Discord** (<https://discord.com/users/1352866897900732446>) and ask.

Once someone is invited, they get the full step-by-step guide in [`JOIN.md`](JOIN.md) — that's the
file you hand to anyone you invite (fork, add your entry to `webring.json` with `invitedBy` set,
add the ring nav to your site, open a PR that your inviter approves).

### How invite-only is actually enforced

A static site can't verify anything on its own: the member list is public and any forker can type
`"invitedBy": "anyone"`. So verification happens at the **one real gate, the pull request**, using
the fact that GitHub authenticates who submits a review.

The included Action, [`.github/workflows/validate-membership.yml`](.github/workflows/validate-membership.yml),
runs on every join PR and posts a status check called `invite/vouch`. It passes **only** when:

1. the diff is a clean single self-addition (it rejects PRs that edit or remove other members, add
   more than one entry, or touch any file other than `webring.json`);
2. the new entry is well-formed (`name`, `url`, optional `gh`) and `invitedBy` names a current member;
3. **that member's own GitHub account submits an approving review on the PR** (a maintainer approval
   also counts, e.g. for `founder` entries).

Point 3 is what makes it unfakeable. Writing `invitedBy: "dhh"` does nothing on its own — only
`dhh`'s authenticated account clicking **Approve** flips the check green. The bot leaves a comment
tagging the inviter and explaining what's needed.

**Two things you must set up once (they can't live in a file):**

1. Edit the `MAINTAINERS` line in the workflow to your admin GitHub username(s).
2. Turn on **branch protection** for `main`: Settings → Branches → add rule →
   *Require a pull request before merging* + *Require status checks to pass* → select
   **`invite/vouch`** → *Restrict who can merge* to your admins. Without this, the check still runs
   but nothing forces it to be green before merge.

## Rebranding it (name, colours, URL)

Everything brandable lives in one place — the `CONFIG` object at the top of **`webring.js`**:

```js
const CONFIG = {
  name:    "vibering",                       // ring name
  tagline: "a hand-made ring of ...",        // subtitle
  baseUrl: "https://vibering.example.com",   // where this site is deployed (for the snippet)
  dataUrl: "webring.json",
};
```

Change the palette via the CSS variables at the top of `index.html` (`--paper`, `--navy`,
`--link`, etc.). The wordmark text lives in the `.banner` block of `index.html`.

> **Important:** set `CONFIG.baseUrl` to your real deployed URL — the copy-paste embed snippet
> uses it, and members will paste broken links otherwise.

## Deploying

**GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from `main` /
root. Done. (Serve over HTTP — opening `index.html` as a `file://` will fail because browsers
block `fetch` of local files.)

**Netlify / Vercel:** drag-and-drop the folder, or point it at the repo. No build command,
publish directory = this folder.

## Credits

The webring concept and the "join by PR-ing a JSON file" workflow are an old web tradition.
This is an independent, from-scratch static implementation with its own design.
