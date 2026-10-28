import {contact} from '../lib/contact.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (Buffer.byteLength(JSON.stringify(req.body || {})) > 24000) return res.status(413).json({error:'Message too large.'});
  const result = await contact({method:req.method,headers:req.headers,body:req.body,ip:req.headers['x-real-ip'] || 'unknown'});
  res.status(result.status).json(result.body);
}
