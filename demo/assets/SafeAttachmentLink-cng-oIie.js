import{r as o,j as a}from"./vendor-react-qoZPGuNy.js";import{t as A}from"./index-B4iCw7ff.js";/**
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
 */const l=["application/pdf","image/png","image/jpeg","image/gif","image/webp","image/bmp","image/heic","image/heif"],T=l.join(","),m=/^data:([a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*);base64,([A-Za-z0-9+/]+={0,2})$/i,g=e=>typeof e=="string"&&l.includes(e.trim().toLowerCase()),u=(e,r)=>{if(typeof e!="string")return null;const t=m.exec(e.trim());if(!t)return null;const n=t[1].toLowerCase();return!g(n)||typeof r=="string"&&r.trim().length>0&&r.trim().toLowerCase()!==n?null:{mimeType:n,base64:t[2]}},_=(e,r)=>u(e,r)!==null,b=e=>{if(!e)return null;const r=u(e.file_data_url,e.type);if(!r)return null;try{const t=atob(r.base64),n=new Uint8Array(t.length);for(let s=0;s<t.length;s+=1)n[s]=t.charCodeAt(s);return URL.createObjectURL(new Blob([n],{type:r.mimeType}))}catch{return null}},U=({attachment:e,className:r,unsafeClassName:t,children:n})=>{const[s,c]=o.useState(null),p=e==null?void 0:e.file_data_url,f=e==null?void 0:e.type;return o.useEffect(()=>{const i=b(e);return c(i),()=>{i&&URL.revokeObjectURL(i)}},[p,f]),e?s?a.jsx("a",{href:s,download:e.name||"attachment",target:"_blank",rel:"noopener noreferrer",className:r,children:n}):a.jsx("span",{className:t||r,title:A("附件格式不受支持或已被安全策略拦截。","Attachment type is unsupported or was blocked by the security policy.","Jenis lampiran tidak disokong atau disekat oleh dasar keselamatan."),children:n}):null};export{T as A,U as S,_ as a,g as i};
