# Illustration handoff and future adapters

This project makes layouts, not portraits. No API keys, uploads, face analysis, model weights, or paid provider dependencies are included. Manually create an illustration in a tool you choose, review it, save PNG/JPEG locally, and reference it from a private card JSON.

## Reusable art brief
Create a warm, intimate keepsake illustration from the consented reference photo.
Use soft coloured pencil, subtle watercolour, cream and natural muted colours,
a restrained paper feel, and a simplified version of the actual background.
Identity first: preserve face shape, hairstyle including buns, glasses, and each person's distinct expression.
Keep original poses, linked arms, clothing, medals, bags, pets, and meaningful location cues.
Avoid exaggerated eyes, chibi proportions, heavy smoothing, strong filters, and busy decoration.
Do not add text: the local layout engine supplies clean typography later.

Append the specific identity / moment / story lists from your card config.
Request enough image resolution for the intended image slot; adding pixels cannot restore missing detail.
Use PNG where available. Avoid baking names, dates or blessings into the illustration.

## Quality gate
Compare reference and illustration side by side. Check every person and every must-preserve item.
Approve likeness before polishing the decorative style. Review with the recipient where appropriate.
The JSON review fields are a manual checklist only; the program does not verify or enforce consent or likeness.

## Optional ComfyUI / PuLID integration
Reserved directory: integrations/comfyui/.
An adapter may later accept a local, consented source and a private job manifest,
then write an approved illustration path for this same layout engine.
Keep adapter dependencies optional, service URLs local/configurable, seeds and workflow versions recorded,
and credentials outside Git. Do not automatically upload or publish source photos.
No workflow or compatibility promise is included in v0.1. Check each selected model, weights and
face/identity component's own licence before commercial use; this repository's MIT licence does not cover them.
