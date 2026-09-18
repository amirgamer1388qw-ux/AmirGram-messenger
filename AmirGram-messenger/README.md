# AmirGram

**Lightweight team messenger** — real-time chat you can host yourself.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/license-see%20repo-blue)

**Author:** [amirgamer1388qw-ux](https://github.com/amirgamer1388qw-ux)  
**Repo:** https://github.com/amirgamer1388qw-ux/AmirGram-messenger

---

## Features

- Real-time messaging (Socket.IO)
- Group chat + direct messages
- File attachments and voice messages
- Message replies, edit, delete
- Emoji reactions
- Read receipts
- Profile photo
- Team invite code
- Admin tools (owner)
- Dark / light theme
- **No database** — data is stored as JSON files in `data/`

## Tech stack

- Node.js
- Express
- Socket.IO
- Multer

## Quick start

```bash
npm install
npm start
```

Open: [http://localhost:3000](http://localhost:3000)

### First account

1. Open the app and go to **Sign up**
2. Choose a username and password
3. Default invite code: `team2026`  
   (or the value of `TEAM_INVITE_CODE` if set)
4. The **first registered account** becomes the team owner

## Project structure

```
server.js          Express + Socket.IO server
package.json
public/
  index.html       UI
  app.js           Client logic
  style.css        Styles
  uploads/         Uploaded files
data/              Local users & messages (created at runtime)
```

## Configuration

| Variable | Description |
|----------|-------------|
| `TEAM_INVITE_CODE` | Optional default invite code (otherwise `team2026`) |
| Port | `3000` in `server.js` |

## Hosting

See **[SETUP_AND_HOSTING.md](SETUP_AND_HOSTING.md)** for Windows, Termux, VPS, domain, HTTPS, and Nginx/WebSocket notes.

## Security notes

- Change the default invite code before public use
- Prefer HTTPS in production
- Back up the `data/` folder regularly
- Do not commit real user data

## Credits

**AmirGram** by [amirgamer1388qw-ux](https://github.com/amirgamer1388qw-ux)

---

If this project is useful, a star on GitHub is appreciated.
