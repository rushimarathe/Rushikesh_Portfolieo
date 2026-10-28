import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createContact} from '../lib/contact.js';
const env={SITE_ORIGIN:'http://localhost:3000',BREVO_API_KEY:'test-private',BREVO_SENDER_EMAIL:'owner@example.com'};
const body={name:'Visitor',email:'visitor@example.com',subject:'Test',message:'A valid test message',website:''};
const request=(patch={})=>({method:'POST',headers:{origin:env.SITE_ORIGIN,'content-type':'application/json'},body:{...body},ip:'local',...patch});
const response=(status,data)=>({status,ok:status>=200&&status<300,json:async()=>data});
test('acceptance requires 201 and ID; fixed recipient and reply-to',async()=>{
 const c=createContact({env,fetcher:async(url,options)=>{const payload=JSON.parse(options.body);assert.deepEqual(payload.to,[{email:'rushikeshmarathe47@gmail.com'}]);assert.equal(payload.replyTo.email,body.email);assert.equal(options.headers['api-key'],'test-private');return response(201,{messageId:'test-id'});}});
 assert.equal((await c(request({body:{...body,to:'attacker@example.com'}}))).body.accepted,true);
});
for(const [name,patch] of [['missing name',{name:''}],['invalid email',{email:'invalid'}],['short message',{message:' '}],['header injection',{subject:'hello\r\nBcc: x@y.com'}],['honeypot',{website:'bot'}],['wrong type',{message:[]}]] ) test(name,async()=>{const c=createContact({env,fetcher:()=>{throw Error('must not send');}});assert.equal((await c(request({body:{...body,...patch}}))).status,400);});
for(const [provider,status,match] of [[401,502,/authentication/],[403,502,/denied/],[429,503,/quota/],[402,503,/quota/],[400,502,/rejected/],[500,502,/Unexpected/],[201,502,/Unexpected/]]) test(`provider ${provider}`,async()=>{const c=createContact({env,fetcher:async()=>response(provider,{})});const r=await c(request());assert.equal(r.status,status);assert.match(r.body.error,match);assert.equal(r.body.accepted,undefined);});
test('provider network failure',async()=>{const c=createContact({env,fetcher:async()=>{throw Error('network');}});assert.equal((await c(request())).status,504);});
test('rate limit expires',async()=>{let time=0;const c=createContact({env,now:()=>time,fetcher:async()=>response(201,{messageId:'mock'})});for(let i=0;i<5;i++)assert.equal((await c(request())).status,200);assert.equal((await c(request())).status,429);time=600001;assert.equal((await c(request())).status,200);});
test('origin and missing configuration',async()=>{assert.equal((await createContact({env})(request({headers:{origin:'https://evil.example'}}))).status,403);assert.equal((await createContact({env:{SITE_ORIGIN:env.SITE_ORIGIN}})(request())).status,503);});
test('public origin fails closed without challenge',async()=>{const e={...env,SITE_ORIGIN:'https://portfolio.example'};assert.equal((await createContact({env:e})(request({headers:{origin:e.SITE_ORIGIN,'content-type':'application/json'}}))).status,503);});
test('challenge hostname rejected',async()=>{const e={...env,TURNSTILE_SECRET_KEY:'test',TURNSTILE_SITE_KEY:'public'};const c=createContact({env:e,fetcher:async()=>response(200,{success:true,hostname:'evil.example'})});assert.equal((await c(request({body:{...body,token:'token'}}))).status,400);});
