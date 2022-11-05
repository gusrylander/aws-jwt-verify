const G=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerpolicy&&(r.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?r.credentials="include":i.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=n(i);fetch(i.href,r)}};G();class w extends Error{}class y extends w{constructor(e,n,s){super(e),this.failedAssertion={actual:n,expected:s}}}class h extends w{constructor(e,n){const s=n!=null?`${e}: ${n}`:e;super(s)}}class l extends w{}class _ extends w{}class I extends y{}class g extends y{withRawJwt({header:e,payload:n}){return this.rawJwt={header:e,payload:n},this}}class z extends g{}class Q extends g{}class X extends g{}class ee extends g{}class te extends g{}class v extends w{}class J extends w{}class x extends w{}class T extends w{}class ne extends w{}class se extends w{}class ie extends y{}class re extends y{}class M extends w{constructor(e,n){super(`Failed to fetch ${e}: ${n}`)}}class j extends M{}class D extends w{}function oe(t,e,n){if(e===429)throw new M(t,"Too many requests");if(e!==200)throw new j(t,`Status code is ${e}, expected 200`);if(!n||!n.toLowerCase().startsWith("application/json"))throw new j(t,`Content-type is "${n}", expected "application/json"`)}function W(t){return typeof t=="object"&&!Array.isArray(t)&&t!==null}function E(t){return JSON.parse(t,(e,n)=>(typeof n=="object"&&!Array.isArray(n)&&n!==null&&(delete n.__proto__,delete n.constructor),n))}var F;(function(t){t.RS256="SHA-256",t.RS384="SHA-384",t.RS512="SHA-512"})(F||(F={}));const d={fetchJson:async(t,e,n)=>{var r;const s=Number(e==null?void 0:e.responseTimeout);if(s){const o=new AbortController;setTimeout(()=>o.abort(new M(t,`Response time-out (after ${s} ms.)`)),s),e={signal:o.signal,...e}}const i=await fetch(t,{...e,body:n});return oe(t,i.status,(r=i.headers.get("content-type"))!=null?r:void 0),i.text().then(o=>E(o))},defaultFetchTimeouts:{response:3e3},transformJwkToKeyObjectSync:()=>{throw new D("Synchronously transforming a JWK into a key object is not supported in the browser")},transformJwkToKeyObjectAsync:(t,e)=>{var s;const n=(s=t.alg)!=null?s:e;if(!n)throw new I("Missing alg on both JWK and JWT header",n);return window.crypto.subtle.importKey("jwk",t,{name:"RSASSA-PKCS1-v1_5",hash:F[n]},!1,["verify"])},verifySignatureSync:()=>{throw new D("Synchronously verifying a JWT signature is not supported in the browser")},verifySignatureAsync:({jwsSigningInput:t,keyObject:e,signature:n})=>window.crypto.subtle.verify({name:"RSASSA-PKCS1-v1_5"},e,H(n),new TextEncoder().encode(t)),parseB64UrlString:t=>new TextDecoder().decode(H(t)),setTimeoutUnref:window.setTimeout.bind(window)},H=function(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("").reduce((e,n,s)=>Object.assign(e,{[n.charCodeAt(0)]:s}),{});return function(e){const n=e.match(/^.+?(=?=?)$/)[1].length;let s,i,r,o;return e.match(/.{1,4}/g).reduce((a,c,f)=>(s=t[c.charCodeAt(0)],i=t[c.charCodeAt(1)],r=t[c.charCodeAt(2)],o=t[c.charCodeAt(3)],a[3*f]=s<<2|i>>4,a[3*f+1]=(i&15)<<4|r>>2,a[3*f+2]=(r&3)<<6|o,a),new Uint8Array(e.length*3/4-n))}}(),R=d.fetchJson;class ae{constructor(e){this.defaultRequestOptions={timeout:d.defaultFetchTimeouts.socketIdle,responseTimeout:d.defaultFetchTimeouts.response,...e==null?void 0:e.defaultRequestOptions}}async fetch(e,n,s){n={...this.defaultRequestOptions,...n};try{return await R(e,n,s)}catch(i){if(i instanceof j)throw i;return R(e,n,s)}}}function O(t,e,n,s=y){if(!e)throw new s(`Missing ${t}. Expected: ${n}`,e,n);if(typeof e!="string")throw new s(`${t} is not of type string`,e,n);if(n!==e)throw new s(`${t} not allowed: ${e}. Expected: ${n}`,e,n)}function U(t,e,n,s=y){if(!e)throw new s(`Missing ${t}. ${N(n)}`,e,n);if(typeof e!="string")throw new s(`${t} is not of type string`,e,n);return B(t,e,n,s)}function B(t,e,n,s=y){if(!e)throw new s(`Missing ${t}. ${N(n)}`,e,n);const i=new Set(Array.isArray(n)?n:[n]);if(typeof e=="string"&&(e=[e]),!Array.isArray(e))throw new s(`${t} is not an array`,e,n);if(!e.some(o=>{if(typeof o!="string")throw new s(`${t} includes elements that are not of type string`,e,n);return i.has(o)}))throw new s(`${t} not allowed: ${e.join(", ")}. ${N(n)}`,e,n)}function N(t){return Array.isArray(t)?t.length>1?`Expected one of: ${t.join(", ")}`:`Expected: ${t[0]}`:`Expected: ${t}`}function ce(t,e){if(t&&typeof t.then=="function")throw e()}const fe=["use","alg","kid","n","e"],he=["kty"];function S(t,e){return t.keys.find(n=>n.kid!=null&&n.kid===e)}async function we(t){const e=await R(t);return P(e),e}async function de(t,e){if(!e.header.kid)throw new x("JWT header does not have valid kid claim");const n=await we(t),s=S(n,e.header.kid);if(!s)throw new T(`JWK for kid "${e.header.kid}" not found in the JWKS`);return s}function P(t){if(!t)throw new v("JWKS empty");if(!W(t))throw new v("JWKS should be an object");if(!Object.keys(t).includes("keys"))throw new v("JWKS does not include keys");if(!Array.isArray(t.keys))throw new v("JWKS keys should be an array");for(const e of t.keys)q(e)}function ue(t){if(O("JWK use",t.use,"sig",ie),O("JWK kty",t.kty,"RSA",re),!t.n)throw new J("Missing modulus (n)");if(!t.e)throw new J("Missing exponent (e)")}function q(t){if(!t)throw new J("JWK empty");if(!W(t))throw new J("JWK should be an object");for(const e of he)if(typeof t[e]!="string")throw new J(`JWK ${e} should be a string`);for(const e of fe)if(e in t&&typeof t[e]!="string")throw new J(`JWK ${e} should be a string`)}function le(t){try{return P(t),!0}catch{return!1}}function ye(t){try{return q(t),!0}catch{return!1}}class ge{constructor(e){var n;this.waitingUris=new Map,this.waitSeconds=(n=e==null?void 0:e.waitSeconds)!=null?n:10}async wait(e){if(this.waitingUris.has(e))throw new ne("Not allowed to fetch JWKS yet, still waiting for back off period to end")}release(e){const n=this.waitingUris.get(e);n&&(clearTimeout(n),this.waitingUris.delete(e))}registerFailedAttempt(e){const n=d.setTimeoutUnref(()=>{this.waitingUris.delete(e)},this.waitSeconds*1e3);this.waitingUris.set(e,n)}registerSuccessfulAttempt(e){this.release(e)}}class Je{constructor(e){var n,s;this.jwksCache=new Map,this.fetchingJwks=new Map,this.penaltyBox=(n=e==null?void 0:e.penaltyBox)!=null?n:new ge,this.fetcher=(s=e==null?void 0:e.fetcher)!=null?s:new ae}addJwks(e,n){this.jwksCache.set(e,n)}async getJwks(e){const n=this.fetchingJwks.get(e);if(n)return n;const s=this.fetcher.fetch(e).then(r=>(P(r),r));this.fetchingJwks.set(e,s);let i;try{i=await s}finally{this.fetchingJwks.delete(e)}return this.jwksCache.set(e,i),i}getCachedJwk(e,n){if(typeof n.header.kid!="string")throw new x("JWT header does not have valid kid claim");if(!this.jwksCache.has(e))throw new se(`JWKS for uri ${e} not yet available in cache`);const s=S(this.jwksCache.get(e),n.header.kid);if(!s)throw new T(`JWK for kid ${n.header.kid} not found in the JWKS`);return s}async getJwk(e,n){if(typeof n.header.kid!="string")throw new x("JWT header does not have valid kid claim");const s=this.jwksCache.get(e);if(s){const o=S(s,n.header.kid);if(o)return o}await this.penaltyBox.wait(e,n.header.kid);const i=await this.getJwks(e),r=S(i,n.header.kid);if(r)this.penaltyBox.registerSuccessfulAttempt(e,n.header.kid);else throw this.penaltyBox.registerFailedAttempt(e,n.header.kid),new T(`JWK for kid "${n.header.kid}" not found in the JWKS`);return r}}const me=["RS256","RS384","RS512"];function ke(t){if(!W(t))throw new h("JWT header is not an object");if(t.alg!==void 0&&typeof t.alg!="string")throw new h("JWT header alg claim is not a string");if(t.kid!==void 0&&typeof t.kid!="string")throw new h("JWT header kid claim is not a string")}function be(t){if(!W(t))throw new h("JWT payload is not an object");if(t.exp!==void 0&&!Number.isFinite(t.exp))throw new h("JWT payload exp claim is not a number");if(t.iss!==void 0&&typeof t.iss!="string")throw new h("JWT payload iss claim is not a string");if(t.aud!==void 0&&typeof t.aud!="string"&&(!Array.isArray(t.aud)||t.aud.some(e=>typeof e!="string")))throw new h("JWT payload aud claim is not a string or array of strings");if(t.nbf!==void 0&&!Number.isFinite(t.nbf))throw new h("JWT payload nbf claim is not a number");if(t.iat!==void 0&&!Number.isFinite(t.iat))throw new h("JWT payload iat claim is not a number");if(t.scope!==void 0&&typeof t.scope!="string")throw new h("JWT payload scope claim is not a string");if(t.jti!==void 0&&typeof t.jti!="string")throw new h("JWT payload jti claim is not a string")}function Se(t){if(!t)throw new h("Empty JWT");if(typeof t!="string")throw new h("JWT is not a string");if(!t.match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/))throw new h("JWT string does not consist of exactly 3 parts (header, payload, signature)");const[e,n,s]=t.split("."),[i,r]=[e,n].map(d.parseB64UrlString);let o;try{o=E(i)}catch(c){throw new h("Invalid JWT. Header is not a valid JSON object",c)}ke(o);let a;try{a=E(r)}catch(c){throw new h("Invalid JWT. Payload is not a valid JSON object",c)}return be(a),{header:o,headerB64:e,payload:a,payloadB64:n,signatureB64:s}}function Z(t,e){var n,s,i;if(t.exp!==void 0&&t.exp+((n=e.graceSeconds)!=null?n:0)<Date.now()/1e3)throw new ee(`Token expired at ${new Date(t.exp*1e3).toISOString()}`,t.exp);if(t.nbf!==void 0&&t.nbf-((s=e.graceSeconds)!=null?s:0)>Date.now()/1e3)throw new te(`Token can't be used before ${new Date(t.nbf*1e3).toISOString()}`,t.nbf);if(e.issuer!==null){if(e.issuer===void 0)throw new l("issuer must be provided or set to null explicitly");U("Issuer",t.iss,e.issuer,z)}if(e.audience!==null){if(e.audience===void 0)throw new l("audience must be provided or set to null explicitly");B("Audience",t.aud,e.audience,Q)}e.scope!=null&&B("Scope",(i=t.scope)==null?void 0:i.split(" "),e.scope,X)}function Y(t,e){ue(e),e.alg&&O("JWT signature algorithm",t.alg,e.alg,I),U("JWT signature algorithm",t.alg,me,I)}async function pe(t,e,n,s=de,i=d.transformJwkToKeyObjectAsync){const{header:r,headerB64:o,payload:a,payloadB64:c,signatureB64:f}=t,k=await s(e,t);Y(t.header,k);const L=await i(k,r.alg,a.iss);if(!await d.verifySignatureAsync({jwsSigningInput:`${o}.${c}`,signature:f,alg:r.alg,keyObject:L}))throw new _("Invalid signature");try{Z(a,n),n.customJwtCheck&&await n.customJwtCheck({header:r,payload:a,jwk:k})}catch($){throw n.includeRawJwtInErrors&&$ instanceof g?$.withRawJwt(t):$}return a}function ve(t,e,n,s){const{header:i,headerB64:r,payload:o,payloadB64:a,signatureB64:c}=t;let f;if(ye(e))f=e;else if(le(e)){const u=i.kid?S(e,i.kid):void 0;if(!u)throw new T(`JWK for kid ${i.kid} not found in the JWKS`);f=u}else throw new l([`Expected a valid JWK or JWKS (parsed as JavaScript object), but received: ${e}.`,"If you're passing a JWKS URI, use the async verify() method instead, it will download and parse the JWKS for you"].join());Y(t.header,f);const k=s(f,i.alg,o.iss);if(!d.verifySignatureSync({jwsSigningInput:`${r}.${a}`,signature:c,alg:i.alg,keyObject:k}))throw new _("Invalid signature");try{if(Z(o,n),n.customJwtCheck){const u=n.customJwtCheck({header:i,payload:o,jwk:f});ce(u,()=>new l("Custom JWT checks must be synchronous but a promise was returned"))}}catch(u){throw n.includeRawJwtInErrors&&u instanceof g?u.withRawJwt(t):u}return o}class Ke{constructor(e,n=new Je){if(this.jwksCache=n,this.issuersConfig=new Map,this.publicKeyCache=new Te,Array.isArray(e)){if(!e.length)throw new l("Provide at least one issuer configuration");for(const s of e){if(this.issuersConfig.has(s.issuer))throw new l(`issuer ${s.issuer} supplied multiple times`);this.issuersConfig.set(s.issuer,this.withJwksUri(s))}}else this.issuersConfig.set(e.issuer,this.withJwksUri(e))}get expectedIssuers(){return Array.from(this.issuersConfig.keys())}getIssuerConfig(e){if(!e){if(this.issuersConfig.size!==1)throw new l("issuer must be provided");e=this.issuersConfig.keys().next().value}const n=this.issuersConfig.get(e);if(!n)throw new l(`issuer not configured: ${e}`);return n}cacheJwks(...[e,n]){const s=this.getIssuerConfig(n);this.jwksCache.addJwks(s.jwksUri,e),this.publicKeyCache.clearCache(s.issuer)}async hydrate(){const e=this.expectedIssuers.map(n=>this.getIssuerConfig(n).jwksUri).map(n=>this.jwksCache.getJwks(n));await Promise.all(e)}verifySync(...[e,n]){const{decomposedJwt:s,jwksUri:i,verifyProperties:r}=this.getVerifyParameters(e,n);return this.verifyDecomposedJwtSync(s,i,r)}verifyDecomposedJwtSync(e,n,s){const i=this.jwksCache.getCachedJwk(n,e);return ve(e,i,s,this.publicKeyCache.transformJwkToKeyObjectSync.bind(this.publicKeyCache))}async verify(...[e,n]){const{decomposedJwt:s,jwksUri:i,verifyProperties:r}=this.getVerifyParameters(e,n);return this.verifyDecomposedJwt(s,i,r)}verifyDecomposedJwt(e,n,s){return pe(e,n,s,this.jwksCache.getJwk.bind(this.jwksCache),this.publicKeyCache.transformJwkToKeyObjectAsync.bind(this.publicKeyCache))}getVerifyParameters(e,n){const s=Se(e);U("Issuer",s.payload.iss,this.expectedIssuers,z);const i=this.getIssuerConfig(s.payload.iss);return{decomposedJwt:s,jwksUri:i.jwksUri,verifyProperties:{...i,...n}}}withJwksUri(e){if(e.jwksUri)return e;const n=new URL(e.issuer).pathname.replace(/\/$/,"");return{jwksUri:new URL(`${n}/.well-known/jwks.json`,e.issuer).href,...e}}}class Ae extends Ke{static create(e,n){return new this(e,n==null?void 0:n.jwksCache)}}class Te{constructor(e=d.transformJwkToKeyObjectSync,n=d.transformJwkToKeyObjectAsync){this.transformJwkToKeyObjectSyncFn=e,this.transformJwkToKeyObjectAsyncFn=n,this.publicKeys=new Map}transformJwkToKeyObjectSync(e,n,s){var a,c,f;const i=(a=e.alg)!=null?a:n;if(!s||!e.kid||!i)return this.transformJwkToKeyObjectSyncFn(e,i,s);const r=(f=(c=this.publicKeys.get(s))==null?void 0:c.get(e.kid))==null?void 0:f.get(i);if(r)return r;const o=this.transformJwkToKeyObjectSyncFn(e,i,s);return this.putKeyObjectInCache(s,e.kid,i,o),o}async transformJwkToKeyObjectAsync(e,n,s){var a,c,f;const i=(a=e.alg)!=null?a:n;if(!s||!e.kid||!i)return this.transformJwkToKeyObjectAsyncFn(e,i,s);const r=(f=(c=this.publicKeys.get(s))==null?void 0:c.get(e.kid))==null?void 0:f.get(i);if(r)return r;const o=await this.transformJwkToKeyObjectAsyncFn(e,i,s);return this.putKeyObjectInCache(s,e.kid,i,o),o}putKeyObjectInCache(e,n,s,i){const r=this.publicKeys.get(e),o=r==null?void 0:r.get(n);o?o.set(s,i):r?r.set(n,new Map([[s,i]])):this.publicKeys.set(e,new Map([[n,new Map([[s,i]])]]))}clearCache(e){this.publicKeys.delete(e)}}const m=document.querySelector("#jwt"),K=document.querySelector("#issuer"),b=document.querySelector("#audience"),A=document.querySelector("#jwksuri"),C=document.querySelector("#verifyrsa"),p=document.querySelector("#result"),V=document.querySelector("#prettyprint");m&&(m.onkeyup=()=>{m&&C&&(C.disabled=m.value===""),p&&(p.innerHTML="Unverified")});C&&(C.onclick=async()=>{if(m&&K&&A&&b&&p){const t=Ae.create({issuer:K==null?void 0:K.value,audience:(b==null?void 0:b.value)===""?null:b.value,jwksUri:A==null?void 0:A.value});try{const e=await t.verify(m.value);console.log("Token is valid. Payload:",e),p.innerHTML="Verified",V&&(V.innerHTML=JSON.stringify(e,null,2))}catch(e){console.log(e),console.log("Token not valid!"),p.innerHTML=e.message}}});
