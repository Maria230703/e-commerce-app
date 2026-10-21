import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from './catalog-logic.js';
import { createOrder, OrderInputError } from './orders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Errore nella lettura del file');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      throw new OrderInputError('Richiesta troppo grande');
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new OrderInputError('Richiesta non valida');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/orders' && req.method === 'POST') {
    try {
      const input = await readJsonBody(req);
      const order = await createOrder(input);
      sendJson(res, 201, { order });
    } catch (error) {
      if (error instanceof OrderInputError) {
        sendJson(res, 400, { error: error.message });
        return;
      }

      sendJson(res, 500, { error: 'Non è stato possibile salvare l’ordine.' });
    }
    return;
  }

  if (url.pathname === '/api/products') {
    sendJson(res, 200, PRODUCTS);
    return;
  }

  if (url.pathname === '/catalog-logic.js') {
    serveFile(res, path.join(__dirname, 'catalog-logic.js'));
    return;
  }

  if (url.pathname === '/scopri' || url.pathname === '/') {
    serveFile(res, path.join(publicDir, 'index.html'));
    return;
  }

  let relativePath = url.pathname;
  const filePath = path.join(publicDir, relativePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Accesso negato');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      const fallback = path.join(publicDir, 'index.html');
      serveFile(res, fallback);
      return;
    }

    serveFile(res, filePath);
  });
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`Server e-commerce attivo su http://localhost:${PORT}`);
});
