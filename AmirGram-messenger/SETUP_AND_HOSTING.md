# AmirGram — Setup & Hosting Guide

GitHub: https://github.com/amirgamer1388qw-ux

This guide covers running AmirGram from zero to a public host.

## 1) Requirements

- Node.js installed (Windows / Linux / macOS / Android Termux)
- Terminal or CMD access
- For a VPS: SSH access

## 2) Local run on Windows

1. Extract the project folder
2. Open CMD inside the project directory
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000
5. Stop the server with `Ctrl+C` in the same terminal

## 3) Local run on Linux / macOS

```bash
cd /path/to/AmirGram
npm install
npm start
```

## 4) Android (Termux)

1. Install Termux
2. Install Node.js in Termux
3. Copy the project into Termux storage
4. `cd` into the project, then `npm install` and `npm start`
5. Open the shown address in your phone browser (often http://localhost:3000)

## 5) Environment

Optional invite code:

```bash
# Linux / macOS
export TEAM_INVITE_CODE=mySecretCode
npm start
```

```cmd
REM Windows CMD
set TEAM_INVITE_CODE=mySecretCode
npm start
```

## 6) VPS basics

1. Install Node.js on the server
2. Upload the project (git clone or SCP)
3. `npm install`
4. Run with `npm start` or a process manager (PM2 recommended)
5. Open firewall only as needed (prefer reverse proxy over exposing port 3000)

Example with PM2:

```bash
npm install -g pm2
pm2 start server.js --name amirgram
pm2 save
```

## 7) Domain DNS

Point an **A record** from your domain to the server public IPv4.

## 8) HTTPS

For public use, enable HTTPS. A common setup:

**Internet → HTTPS (Nginx) → http://127.0.0.1:3000 → AmirGram**

Use Let's Encrypt for certificates. If you use Cloudflare, configure DNS/proxy and TLS there as well.

## 9) Nginx reverse proxy

Proxy your domain to port 3000. After HTTPS is active, users should open `https://...`.

## 10) WebSocket / Socket.IO

AmirGram uses Socket.IO. Your reverse proxy must allow WebSocket upgrades (`Upgrade` / `Connection` headers).

## 11) Security checklist before going public

- Use strong passwords
- Change the default invite code
- Do not expose port 3000 directly if you have Nginx
- Back up `data/` regularly
- Keep Node.js and dependencies updated
- Serve the app over HTTPS only in production

## 12) Backup

Before major changes, back up the whole project — especially `data/`.

## 13) Updating

1. Back up the current version
2. Replace files with the new release
3. If `package.json` changed: `npm install`
4. Restart the process

## 14) Common issues

**npm install fails**
- Check `node -v` and `npm -v`
- Check network access to the npm registry

**Port 3000 already in use**
- Stop the other process, or change `PORT` in `server.js`

**Users cannot connect from the internet**
- Check public IP / DNS, firewall, reverse proxy, and tunnels
- HTTPS alone does not fix reachability if the server is not exposed correctly

## Credits

AmirGram — https://github.com/amirgamer1388qw-ux
