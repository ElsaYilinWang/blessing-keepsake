# Publishing your business project

## What is live in this version
The website is a browser-based card maker. Illustration generation is manual in ChatGPT.
Visitors select finished illustrations (or photos), type wording, then download:
- A 10 脳 15 cm PNG, 1181 脳 1772 px or reversed, with 300 DPI PNG metadata.
- A smaller JPEG digital preview.
- A padded 1080 脳 2400 phone wallpaper.

Images and wording stay in the visitor's browser. No AI requests, image uploads, account system,
payments, gallery, server storage or background processing are included.
Ordinary website delivery still passes request data such as IP addresses to the hosting provider.
There is no application analytics or third-party script.

The browser renderer uses local fonts and may differ slightly across devices.
The Python/Pillow renderer remains the canonical repeatable offline layout option.
Browser PNG colour management depends on the browser; the Python export explicitly embeds sRGB.

## GitHub, step by step
1. Sign in to GitHub and create a **public** repository (your chosen visibility) called blessing-keepsake.
2. Do not add a generated README, licence or .gitignore; use the project's files.
3. Extract the project and open a terminal inside its top-level folder.
4. Run the commands below, inspecting staged files before committing.
5. Verify that GitHub displays the Public badge and the expected file list.

```powershell
git init -b main
git add .
git diff --cached --stat
git commit -m "Initial keepsake studio"
git remote add origin https://github.com/ElsaYilinWang/blessing-keepsake.git
git push -u origin main
```

If the repository already contains commits, clone it and copy the project files into that checkout
instead. Do not force-push or overwrite unrelated history.

## Is .gitignore needed?
Yes, for this project. Commit the .gitignore file itself.
It excludes private images/configs, exports, environment secrets, local Python environments,
Node dependencies and Cloudflare local state. Keep client files deliberately public under web/.
Never put private source photos or secrets under web/: deployment publishes that folder.
Ignored files already tracked by Git remain tracked; ignore rules do not erase history.

## Licence for a business
The source repository is public by your choice, and does not offer an open-source licence.
LICENSE and package metadata reflect this choice. Public repositories can be viewed and forked on GitHub under its platform terms. Do not treat public source as confidential. A public website can alternatively use a private source repository.
The original prototype used MIT. MIT also permits a business, but grants reuse rights to others
receiving that version. Changing your project does not revoke rights already granted in any
previously distributed MIT copies.
Third-party software, photos, fonts, model terms and output rights remain separate.
Choose a company name/copyright notice and review customer terms and privacy arrangements before a paid launch.

## Cloudflare Workers (recommended)
This site needs no build dependencies and no API keys. Only web/ is published.
wrangler.jsonc at the repository root describes the static assets.

Dashboard route:
1. Open Cloudflare > Workers & Pages > Create application.
2. Choose Connect GitHub / Import a repository, select the repository.
3. If authorisation is needed, grant access only to blessing-keepsake.
4. Use the project name blessing-keepsake and production branch main.
5. Keep the root directory at the repository root.
6. Build command: leave empty if permitted, otherwise use `echo No build required`.
7. Deploy command: `npx wrangler deploy`.
8. Deploy and open the returned workers.dev address.
9. Check the editor and download a sample print PNG before sharing.

Alternatively install Wrangler from the official npm registry:
```powershell
npx wrangler login
npx wrangler deploy
```
Sign in to your own Cloudflare account. Never paste an API token into source code.

A dashboard static-file upload can also host web/ directly, without a Git connection.
That route does not automatically deploy future GitHub commits.
Do not upload the entire Python repository as public web assets.

## Future automatic AI generation
A customer website cannot spend your interactive ChatGPT subscription allowance.
For automation, add a backend image-editing provider using a separately billed API.
Do not automate ChatGPT sign-in/cookies or put a provider API key into browser JavaScript.
Keep the core layout independent of the image provider.

Suggested future flow:
consented upload -> private temporary object -> authenticated generation job ->
approved illustration -> browser card layout -> private download -> scheduled deletion.

Before enabling paid generation, implement authentication, server-side upload validation,
per-user quotas, abuse controls, explicit provider consent and retention/deletion.
These are not needed to store photos in this version because photos are never sent to the server.

## Source references
- Git ignores: https://docs.github.com/en/get-started/git-basics/ignoring-files
- MIT permissions: https://choosealicense.com/licenses/mit/
- No open-source grant: https://choosealicense.com/no-permission/
- Cloudflare static assets: https://developers.cloudflare.com/workers/static-assets/get-started/
- OpenAI image edits API: https://developers.openai.com/api/reference/resources/images/methods/edit
