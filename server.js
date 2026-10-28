import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {contact} from './lib/contact.js';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.pdf':'application/pdf'};
const assets = new Set(['index.html','style.css','contact.js','bg.png','images/cyber-bg.jpg','images/cybersecurity-person.png','assets/Rushikesh_Marathe_Security_Analyst.pdf']);
http.createServer(async (req,res) => {
  const json = (status,data) => {res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try {
    const path = new URL(req.url,'http://localhost').pathname;
    if (path === '/api/config') return json(200,{siteKey:process.env.TURNSTILE_SITE_KEY || ''});
    if (path === '/api/contact') {
      let raw = ''; let bytes = 0;
      for await (const chunk of req) {bytes += chunk.length; if(bytes > 24000) return json(413,{error:'Message too large.'}); raw += chunk;}
      let body; try {body=JSON.parse(raw);} catch {return json(400,{error:'Invalid JSON.'});}
      const result=await contact({method:req.method,headers:req.headers,body,ip:req.socket.remoteAddress});
      return json(result.status,result.body);
    }
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!assets.has(file) || !['GET','HEAD'].includes(req.method)) {res.writeHead(404);return res.end('Not found');}
    const content=await readFile(new URL(file,import.meta.url));
    res.writeHead(200,{'Content-Type':types[file.slice(file.lastIndexOf('.'))] || 'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {if(!res.headersSent) json(500,{error:'Local server error.'});else res.end();}
}).listen(3000,'127.0.0.1',()=>console.log('Open http://localhost:3000 (Ctrl+C to stop)'));
