const cors = require('cors');
import express from 'express';
import initRoutes from './src/routes';
import { registerErrorHandler } from './src/errorHandlers';

const app: express.Application = express();

const port: number = 3001;

const corsOptions = {
  origin: 'http://localhost:1420',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
initRoutes(app);
registerErrorHandler(app);

if (!module.parent) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export { app }
