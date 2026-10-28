const recipient = 'rushikeshmarathe47@gmail.com';
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
export function createContact({env = process.env, fetcher = fetch, now = Date.now} = {}) {
  const attempts = new Map();
  return async function contact({method, headers, body, ip}) {
    const reply = (status, error, extra = {}) => ({status, body: {error, ...extra}});
    if (method !== 'POST') return reply(405, 'Use POST.');
    const origin = env.SITE_ORIGIN;
    if (!origin || headers.origin !== origin) return reply(403, 'This website origin is not allowed. Check SITE_ORIGIN.');
    if (!headers['content-type']?.startsWith('application/json')) return reply(415, 'Send JSON.');
    if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(400, 'Invalid request.');
    const local = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    const t = now();
    for (const [key, value] of attempts) if (t - value.start >= 600000) attempts.delete(key);
    if (!attempts.has(ip) && attempts.size >= 10000) return reply(429, 'Server busy. Please wait and retry.');
    const bucket = attempts.get(ip) || {start:t, count:0};
    attempts.set(ip, bucket);
    if (++bucket.count > 5) return reply(429, 'Too many attempts. Wait 10 minutes before trying again.');
    if (body.website) return reply(400, 'Spam check failed.');
    const limits = {name:[1,100], email:[3,254], subject:[1,160], message:[10,5000]};
    const fields = {};
    for (const [key,[min,max]] of Object.entries(limits)) {
      if (typeof body[key] !== 'string') return reply(400, `${key} is required.`);
      fields[key] = body[key].trim();
      if (fields[key].length < min || fields[key].length > max) return reply(400, `${key} must contain ${min}–${max} characters.`);
      if (key !== 'message' && /[\r\n\x00-\x1f\x7f]/.test(fields[key])) return reply(400, `${key} contains invalid characters.`);
    }
    if (!emailPattern.test(fields.email)) return reply(400, 'Enter a valid email address.');
    if (!env.BREVO_API_KEY || env.BREVO_API_KEY.startsWith('replace_') || !emailPattern.test(env.BREVO_SENDER_EMAIL || '')) return reply(503, 'Email is not configured. The site owner must set the Brevo API key and verified sender.');
    if (!local && (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY)) return reply(503, 'Spam protection is not configured.');
    if (env.TURNSTILE_SECRET_KEY) {
      if (typeof body.token !== 'string' || body.token.length > 2048 || !body.token) return reply(400, 'Complete the spam check.');
      try {
        const r = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method:'POST', body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:body.token}), signal:AbortSignal.timeout(8000)});
        const result = await r.json();
        if (!r.ok || !result.success || result.hostname !== new URL(origin).hostname) return reply(400, 'Spam check expired or failed. Please try again.');
      } catch { return reply(503, 'Spam protection is unavailable. Try again later.'); }
    }
    try {
      const r = await fetcher('https://api.brevo.com/v3/smtp/email', {
        method:'POST', headers:{'api-key':env.BREVO_API_KEY,'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({sender:{email:env.BREVO_SENDER_EMAIL,name:'Rushikesh Portfolio'},to:[{email:recipient}],replyTo:{email:fields.email},subject:`Portfolio: ${fields.subject}`,textContent:`Name: ${fields.name}\nEmail: ${fields.email}\n\n${fields.message}`}),
        signal:AbortSignal.timeout(12000)
      });
      const result = await r.json().catch(() => null);
      if (r.status === 201 && typeof result?.messageId === 'string' && result.messageId) return {status:200,body:{accepted:true,messageId:result.messageId}};
      if (r.status === 401) return reply(502, 'Email provider authentication failed. The site owner must check the API key.');
      if (r.status === 403) return reply(502, 'Email provider denied sending. Check sender verification, account activation and API key permissions.');
      if (r.status === 429 || r.status === 402) return reply(503, 'Email provider rate limit or sending quota reached. Try later or email directly.');
      if (r.status === 400) return reply(502, 'Email provider rejected the request. The site owner should check sender settings, credits and transactional logs.');
      return reply(502, 'Unexpected email provider response. Delivery is unconfirmed; check provider logs before resubmitting.');
    } catch { return reply(504, 'Email provider connection failed or timed out. Delivery is unconfirmed; check logs before resubmitting.'); }
  };
}
export const contact = createContact();
