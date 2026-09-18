AmirGram — Team Messenger
=========================

GitHub: https://github.com/amirgamer1388qw-ux

Version: 9
Platform: Node.js + Express + Socket.IO + Multer

This project is a lightweight team messenger that stores its data locally
inside the data/ directory. It does not require MySQL or PostgreSQL to run.

Quick Start
-----------

1) Install Node.js.
2) Open Terminal/CMD inside the project directory.
3) Install the dependencies:

   npm install

4) Start the server:

   npm start

5) Open your browser and go to:

   http://localhost:3000


For the complete local setup, Windows, Android/Termux, VPS hosting,
domain configuration, and HTTPS instructions, see:

SETUP_AND_HOSTING.txt


Account Registration
--------------------

- Create a username and password from the registration page.
- The default invite code on the first run is:

  team2026

  unless the TEAM_INVITE_CODE environment variable has been configured.

- The first registered account becomes the group administrator.
- The invite code can later be changed from the administrator settings.


Project Structure
-----------------

server.js          Express and Socket.IO server
public/index.html  User interface
public/app.js      Client-side application logic
public/style.css   Application styles
data/              Local user and message data


Project Credits
---------------

AmirGram
GitHub: https://github.com/amirgamer1388qw-ux
