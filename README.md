# CodeLens AI

An AI-powered code reviewer built with Next.js, React, and the Gemini API. It streams code-review feedback from a server-side API route.

## Requirements
- Node.js 20.9 or newer
- A Gemini API key

## Run locally
1. Extract this ZIP.
2. Open the extracted `codelens-ai` folder in VS Code.
3. In the terminal, run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Add your key to `.env.local`:
   `GEMINI_API_KEY=your_real_key`
6. Run `npm run dev`.
7. Open http://localhost:3000.

Never commit `.env.local` or expose the API key in frontend code.

## Deploy
Push the project to GitHub, import it into Vercel, and add `GEMINI_API_KEY` under Project Settings → Environment Variables. Redeploy after adding the variable.

## Notes
- The review route validates language, empty input, and a 20,000-character limit.
- Gemini calls are made only on the server.
- The API streams text to the browser.
- AI suggestions should be checked and tested before use.
