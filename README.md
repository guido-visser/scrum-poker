# Scrum Poker

Scrum Poker is a lightweight planning-poker app with a React frontend and an Express plus Socket.IO backend.

## Requirements

- Node.js `20.x` to `25.x`
- Yarn `1.22+`

## Scripts

Run these commands with Yarn.

- `yarn dev`: starts the backend in watch mode and the Vite frontend on port `3000`
- `yarn client`: starts the Vite frontend only
- `yarn start`: starts the production Node server from `server.js`
- `yarn server`: starts the production Node server from `server.js`
- `yarn server:watch`: starts the backend only with Node watch mode
- `yarn build`: creates a production build in `build/`
- `yarn preview`: previews the production frontend bundle
- `yarn test`: prints the current test-suite status

## Security notes

- Websocket actions are authorized from server-side socket session state instead of trusting client-supplied user and room identifiers.
- The frontend toolchain was migrated from CRA/CRACO to Vite to remove the large vulnerable dependency tree from `react-scripts`.
- The server uses `helmet`, disables `x-powered-by`, and limits JSON and form payload sizes.

## Development

1. Run `yarn install`
2. Run `yarn dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Production

1. Run `yarn install`
2. Run `yarn build`
3. Start the app with `yarn start`
4. The Express server will serve the compiled frontend from `build/`

## Plesk

1. Set the application root to this project.
2. Use a Node.js version in the `20.x` to `25.x` range.
3. Set the startup file to `server.js`, or use the app start command `yarn start`.
4. Run `yarn install` and then `yarn build` after each deploy.
5. Make sure the app is exposed through Plesk's assigned `PORT`; the server already reads `process.env.PORT`.
6. Runtime logs are written to `logs/server.log` inside the project root.

If Plesk also asks for a document root, leave the Node app pointed at the project root. The Express server serves the compiled frontend from `build/` itself.
