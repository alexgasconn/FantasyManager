<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: <https://ai.studio/apps/0bb315ae-6d92-4b8e-be49-67195dda4c94>

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production Notes

- This app needs the Node server endpoints under /api (Biwenger, FutbolFantasy, ClubElo). A static-only deploy will fail on login.
- If frontend and backend are deployed in different domains, set VITE_API_BASE_URL in the frontend build (example: <https://your-backend-domain.com>).
- Backend supports CORS via CORS_ORIGIN env var.

Suggested production env vars:

- Frontend: VITE_API_BASE_URL=<https://your-backend-domain.com>
- Backend: PORT=5173
- Backend: CORS_ORIGIN=<https://your-frontend-domain.com>
