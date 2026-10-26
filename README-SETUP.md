# Z-Path Sri Lanka — AI Advisor setup

This folder contains your existing Z-Path calculator, an AI Advisor panel, and a Netlify Function that keeps the AI API key on the server.

## What is included
- `index.html` — your original dark-blue calculator with an added AI University & Career Advisor panel.
- `netlify/functions/ai-advisor.js` — secure server-side AI request handler.
- `netlify.toml` — Netlify publish and function settings.

## Before the AI can answer
The advisor needs an OpenAI API key. ChatGPT subscriptions and API billing are separate; do not paste a key into the HTML or share it in chat.

1. Sign in to Netlify and open your site.
2. Deploy the **contents** of this folder (the `index.html`, `netlify.toml`, and `netlify` folder must be at the published project root). For the easiest route, upload the folder through a Git repository connected to Netlify; Netlify's drag-and-drop manual deploy can be used for static previews but function deployment support/workflow may require a connected repository or Netlify CLI.
3. In Netlify, open **Site configuration / Environment variables** (menu wording may vary) and add `OPENAI_API_KEY` with your secret API key as its value. Optionally add `OPENAI_MODEL` with a model available to your API account; default is `gpt-4.1-mini`.
4. Redeploy the site so the function receives the new environment variables.
5. Open the deployed site, enter a stream, district, subjects, marks, means and standard deviations, calculate, then try the AI Advisor.
6. If it fails, check the function logs in Netlify. The API account must have API access and billing configured as applicable.

## Important limits
- This version does **not** contain an official UGC data feed, verified yearly cut-off dataset, or a live job-market database. The AI is instructed not to make up admission cut-offs or guarantee eligibility, but AI output can still be wrong. Verify course names and requirements in the latest official UGC admissions handbook and official university websites.
- The calculator's average of three individually calculated Z-scores is a personal estimate only. It is **not** the official UGC admission Z-score and is not used by the AI to determine eligibility.
- Do not collect names, contact details, school details or other personal information in this prototype.
- Keep `OPENAI_API_KEY` only in Netlify environment variables. Never add it to `index.html`, Git, screenshots, or public messages.

## Troubleshooting
- `AI is not configured yet`: add `OPENAI_API_KEY` to the Netlify site's environment variables and redeploy.
- `AI service could not complete the request`: verify the API key, API account access/billing, model availability, and Netlify function logs.
- The advisor endpoint is `/.netlify/functions/ai-advisor`; it will not work by simply double-clicking `index.html` on your computer. Deploy through Netlify so the function runs.
