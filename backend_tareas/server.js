import app from './src/app.js';
import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';

// Cargar los certificados SSL/TLS
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const PORT = process.env.PORT || 3000;

// Creamos el servidor HTTPS
const server = https.createServer(options, app);
server.listen(PORT, () => {
  console.log(`🚀 Servidor seguro corriendo en: https://localhost:${PORT}`);
});