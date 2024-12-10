import cors, { CorsOptions } from "cors";
import express from 'express';
import initRoutes from './src/routes';
import { registerErrorHandler } from './src/errorHandlers';
import { initAuthRoutes } from "./src/auth";

const app: express.Application = express();

const port: number = 3001;

const corsOptions: CorsOptions = {
    origin: true,
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
initAuthRoutes(app);
initRoutes(app);
registerErrorHandler(app);

if (!module.parent) {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
}

export { app }
