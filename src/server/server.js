import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { apolloServer } from './apolloServer';
import * as renderer from './renderer';
import { getUserAgent } from '../utils/device';
import { isBot } from '../utils/device';

export function startServer() {
	const app = express();
	const port = process.env.PORT || 8080;

	app.use((req, res, next) => {
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQUEST IN <<<<<<<<<<<<<<<<<<<<<<<`);
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQ.method ++++++++++++++++: ${req.method}`);
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQ.url +++++++++++++++++++: ${req.url}`);
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQ.path ++++++++++++++++++: ${req.path}`);
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQ.originalUrl +++++++++++: ${req.originalUrl}`);
		console.log(`>>>>>>>>>>>>>>>>> SERVER > REQUEST OUT <<<<<<<<<<<<<<<<<<<<<<<`);
		next();
	});

	// =====================================================

	app.use(express.static(path.join(__dirname, '../../public')))

	app.use((req, res, next) => {
		req.counterPreloadedState = Math.floor(Math.random() * (100 - 1)) + 1;
		req.userAgent = getUserAgent(req.headers['user-agent']);
		req.isBot = isBot(req.headers['user-agent']);
		next();
	});

	apolloServer(app);

	app.get('*', (req, res, next) => { 
			console.log('>>>> SERVER > RENDERER !!!! ===========================');
			next();
		}, renderer.get
	);

	// =====================================================

	if (process.env.NODE_ENV !== 'test') {
		const server = createServer(app);

		server.listen(port, () => {
			console.log(`Listening on ${port}`);
		});

		server.on('error', err => {
			if (err.syscall !== 'listen') throw err;

			const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

			switch (err.code) {
				case 'EACCES':
					console.error(`${bind} requires elevated privileges`);
					process.exit(1);
					break;
				case 'EADDRINUSE':
					console.error(`${bind} is already in use`);
					process.exit(1);
					break;
				default:
					throw err;
			}
		});
	}

	return app;
}
