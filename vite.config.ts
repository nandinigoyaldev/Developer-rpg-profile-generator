/* eslint-disable */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite API Dev Server Plugin to run Vercel serverless functions locally
const apiPlugin = () => {
  return {
    name: 'api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/')) {
          const url = new URL(req.url, 'http://localhost');
          const endpointName = url.pathname.slice(5); // removes '/api/'
          
          // API endpoint mapping (e.g. /api/github -> api/github.ts)
          const handlerPath = path.resolve(__dirname, `api/${endpointName}.ts`);
          if (fs.existsSync(handlerPath)) {
            try {
              // Load TS module dynamically in the SSR context of Vite
              const module = await server.ssrLoadModule(handlerPath);
              const handler = module.default;
              
              // Parse queries
              const query = Object.fromEntries(url.searchParams.entries());
              
              // Handle POST body parsing (raw buffer or JSON)
              let body: any = {};
              if (req.method === 'POST') {
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const rawBody = Buffer.concat(chunks);
                const contentType = req.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                  body = JSON.parse(rawBody.toString('utf-8') || '{}');
                } else {
                  body = rawBody; // Keep raw Buffer for file uploads
                }
              }
              
              const vercelReq = Object.assign(req, { query, body });
              const vercelRes = Object.assign(res, {
                status(statusCode: number) {
                  res.statusCode = statusCode;
                  return vercelRes;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return vercelRes;
                },
                send(data: any) {
                  if (typeof data === 'object') {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  } else {
                    res.end(data);
                  }
                  return vercelRes;
                }
              });
              
              await handler(vercelReq, vercelRes);
              return;
            } catch (err: any) {
              console.error(`Error executing API ${endpointName}:`, err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
              return;
            }
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `API endpoint /api/${endpointName} not found` }));
            return;
          }
        }
        next();
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port: 5173,
  }
});
