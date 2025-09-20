
import { https } from 'firebase-functions';
import next from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev: isDev, conf: { distDir: '.next' } });
const nextHandle = nextApp.getRequestHandler();

exports.helloWorld = https.onRequest((req, res) => {
  return nextApp.prepare().then(() => nextHandle(req, res));
});
