/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SECURITY: staff leave (MC) attachments and other user-supplied "file_data_url"
 * values are attacker-controlled strings. A lower-privileged account can store
 * `javascript:...` (or an `image/svg+xml` payload) and have it execute inside an
 * Admin / Super Admin browser context the moment the link is clicked.
 *
 * Never bind a stored data-url string straight to `href` / `src`. Route it
 * through `createAttachmentObjectUrl` (or at minimum `isSafeAttachmentDataUrl`)
 * so only an allow-listed, non-scriptable MIME type ever reaches the DOM, and
 * only as a same-origin blob: URL.
 */const i=["application/pdf","image/png","image/jpeg","image/gif","image/webp","image/bmp","image/heic","image/heif"],c=i.join(","),o=/^data:([a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*);base64,([A-Za-z0-9+/]+={0,2})$/i,l=t=>typeof t=="string"&&i.includes(t.trim().toLowerCase()),s=(t,e)=>{if(typeof t!="string")return null;const n=o.exec(t.trim());if(!n)return null;const a=n[1].toLowerCase();return!l(a)||typeof e=="string"&&e.trim().length>0&&e.trim().toLowerCase()!==a?null:{mimeType:a,base64:n[2]}},m=(t,e)=>s(t,e)!==null,u=t=>{if(!t)return null;const e=s(t.file_data_url,t.type);if(!e)return null;try{const n=atob(e.base64),a=new Uint8Array(n.length);for(let r=0;r<n.length;r+=1)a[r]=n.charCodeAt(r);return URL.createObjectURL(new Blob([a],{type:e.mimeType}))}catch{return null}};export{c as A,l as a,u as c,m as i};
