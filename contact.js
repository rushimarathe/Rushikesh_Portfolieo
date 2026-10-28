(() => {
  const form=document.querySelector('.pro-contact-form');
  const status=document.getElementById('contactFormStatus');
  const button=form.querySelector('button[type="submit"]');
  let busy=false, widget, challengeReady=Promise.resolve();
  const show=(message,ok=false)=>{status.style.display='block';status.style.background=ok?'rgba(34,197,94,.12)':'rgba(248,113,113,.12)';status.style.color=ok?'#86efac':'#fca5a5';status.textContent=message;};
  for(const [key,min,max] of [['name',1,100],['email',3,254],['subject',1,160],['message',10,5000]]) {
    form.elements[key].minLength=min; form.elements[key].maxLength=max;
  }
  challengeReady=fetch('/api/config').then(async r=>{
    if(!r.ok) throw Error('Could not load form configuration.');
    const config=await r.json();
    if(config.siteKey) await new Promise((resolve,reject)=>{
      window.contactChallengeReady=()=>{widget=window.turnstile.render('#contactChallenge',{sitekey:config.siteKey});resolve();};
      const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=contactChallengeReady&render=explicit';script.onerror=()=>reject(Error('Spam protection could not load. Check your connection.'));document.head.append(script);
      setTimeout(()=>reject(Error('Spam protection timed out. Reload and try again.')),15000);
    });
  });
  // Handle configuration rejection immediately, even before the visitor submits.
  challengeReady.catch(e=>show(e.message));
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy || !form.reportValidity()) return;
    busy=true;button.disabled=true;form.setAttribute('aria-busy','true');const label=button.innerHTML;button.textContent='Sending…';show('Sending your message…');
    try {
      await challengeReady;
      const data=Object.fromEntries(new FormData(form));data.token=widget !== undefined ? window.turnstile.getResponse(widget) : '';
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(25000)});
      let result;try {result=await r.json();} catch {throw Error(`Unexpected server response (HTTP ${r.status}). Delivery is unconfirmed.`);}
      if(!r.ok || result.accepted !== true || typeof result.messageId !== 'string') throw Error(result.error || `Unexpected server response (HTTP ${r.status}).`);
      show('Your message was accepted by the email provider. Inbox delivery is not yet verified. Thank you!',true);form.reset();
    } catch(e) {show((e instanceof TypeError || e.name==='TimeoutError' ? 'Network error or timeout. Delivery is unconfirmed; check before resubmitting.' : e.message)+' You can email rushikeshmarathe47@gmail.com directly.');}
    finally {if(widget !== undefined) window.turnstile.reset(widget);busy=false;button.disabled=false;button.innerHTML=label;form.removeAttribute('aria-busy');}
  });
})();
