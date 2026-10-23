# NHL 26 – Ultimate 3D Hockey (online 2-player edition)

This project keeps the uploaded Three.js hockey game and adds a small Socket.IO server for room codes and sharing match state between two browsers.

## Run locally
1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000` in your browser.

For a friend on a different computer, deploy the **whole project folder** to a Node.js hosting service that supports persistent WebSockets (for example, a Node web service on Render or Railway). Once deployed, both players open the same public website URL. The host clicks **CREATE ONLINE ROOM**, shares the six-character room code, chooses teams and clicks **DROP THE PUCK**. The friend opens the same URL, enters the code and clicks **JOIN ROOM**.

## Controls
WASD skate, mouse look, hold Space and release to shoot, Shift pass, F body check, P switch skater, Q/E dangle, 1–8 arena (host controls arena selection).

## Notes
- This is a two-player prototype based on the provided HTML. The host computer runs the authoritative simulation and sends snapshots to the guest.
- It requires the Node server; opening `public/index.html` directly as a file will not enable online rooms.
- The generated project is not yet deployed to a public URL. Deploy it to a Node-compatible host to get the shareable website link.
