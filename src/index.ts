import express from 'express';
import bodyParser from 'body-parser';
import { logHandler } from './log';
import dotenv from 'dotenv';
import http from 'http';
import dataStore from './StoredData'; // Ensure correct import path
import { riskHandler } from './riskAnalysis';

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(bodyParser.json());

app.post('/log', logHandler);
app.get('/risk/:parameter', riskHandler);

// Define routes
app.post('/log', logHandler);
app.get('/', (req, res) => {
    res.send('Risk-based Authentication Service is running');
});


const server = http.createServer(app);

server.listen(DEFAULT_PORT, () => {
    console.log(`Server is running on http://localhost:${DEFAULT_PORT}`);
});

