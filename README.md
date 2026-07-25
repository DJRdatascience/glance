This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## After a Reboot

The dashboard runs in Docker via [Colima](https://github.com/abiosoft/colima), which is registered as a `brew services` background job and should start itself on login. If the dashboard isn't reachable after a restart:

```bash
brew services start colima   # only needed if it didn't auto-start
docker compose up -d
```

Check it came up with `docker compose ps`, then confirm it's serving with `curl http://localhost:3000`.

## Self-Hosted Deployment (Docker + Colima)

This app is self-hosted on a Mac and displayed on a wall-mounted Kindle Fire tablet as an always-on dashboard. One-time setup:

1. Install Docker tooling and the lightweight Colima runtime (no Docker Desktop GUI needed):
   ```bash
   brew install docker docker-compose colima
   ```
2. Point Docker's CLI at the `docker-compose` plugin by adding to `~/.docker/config.json`:
   ```json
   { "cliPluginsExtraDirs": ["/opt/homebrew/lib/docker/cli-plugins"] }
   ```
3. Start Colima as a persistent background service so it survives reboots:
   ```bash
   brew services start colima
   ```
4. Create a `.env` file (see the variables referenced in `docker-compose.yml`), then build and start the container:
   ```bash
   docker compose up -d --build
   ```
5. Find the machine's LAN IP (`ipconfig getifaddr en0`) and reserve it as static in your router's DHCP settings so it never changes.
6. On the Kindle Fire, sideload **Fully Kiosk Browser** (Fire OS's Silk browser can't stay fullscreen or auto-restart), set the start URL to `http://<lan-ip>:3000`, and enable "Start on boot" / "Keep screen on".

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
