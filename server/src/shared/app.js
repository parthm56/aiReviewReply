import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import modules from '../modules.config.js';
import errorHandler from './error-handler.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health',(req, res) => {
    res.json({'status': 'ok'});
});

for (const module of modules) 
{
    const routeModule = await import(`../${module}/Routes/${module}.route.js`);
    app.use(`/${module}`,routeModule.default);
}

app.use(errorHandler);
export default app;
