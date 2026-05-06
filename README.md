# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This repo is configured for Render deployment.

### Prerequisites
- GitHub account (repo already connected)
- Render account (free tier available at render.com)
- Supabase project with credentials

### Deployment Steps

1. **Connect to Render:**
   - Go to https://dashboard.render.com
   - Connect your GitHub account and select this repository
   - Render will auto-detect `render.yaml`

2. **Set Environment Variables in Render:**
   - `DATABASE_URL` — PostgreSQL/Supabase connection string
   - `JWT_SECRET` — Secret key for token signing
   - `SUPABASE_URL` — Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (for backend operations)
   - `VITE_SUPABASE_URL` — Same as `SUPABASE_URL` (for frontend)
   - `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key (for frontend)

3. **Deploy:**
   - Click "Deploy" in Render
   - Render will create two services from `render.yaml`:
     - `orehack-web` for the React frontend
     - `orehack-api` for the Express API
   - Your frontend will be live at the Render static site URL
   - Your API will be live at the Render web service URL

### Architecture
- **Frontend:** React app built to `dist/` and hosted as a Render static site
- **Backend:** Node.js Express API hosted as a separate Render web service at `/api/**`
- **Database:** Supabase (frontend connects directly for read/write, backend for admin operations)

The frontend and API are deployed together from the same repo, but as separate Render services.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
