import{bd as d}from"./index-DpRNdQZt.js";/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generic CSV export helpers. Works with any array of plain objects:
 * columns are the union of keys (first-seen order), nested objects/arrays
 * are serialised as JSON strings so no data is silently dropped.
 * Files include a UTF-8 BOM so Chinese text opens correctly in Excel.
 *
 * SECURITY: this module is the single hardened CSV encoder for the app.
 * Every export must go through `buildCsv` / `buildCsvFromRows` (or the
 * matching download helpers) so spreadsheet formula payloads are neutralised
 * consistently. Do not hand-roll `"${value}"` encoders in feature code.
 */const u=/^[=+\-@]/,l=/^[\u0000-\u0020\u007F-\u00A0\u1680\u2000-\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF]+/,i=t=>{if(t==null)return"";let o;typeof t=="string"?o=t:typeof t=="number"||typeof t=="boolean"?o=String(t):o=JSON.stringify(t);const n=o.replace(l,"");return u.test(n)&&(o=`'${n}`),/[",\t\r\n]/.test(o)&&(o=`"${o.replace(/"/g,'""')}"`),o},m=(t,o)=>[t,...o].map(n=>n.map(i).join(",")).join(`\r
`),p=t=>{const o=[],n=new Set;t.forEach(r=>{Object.keys(r).forEach(s=>{n.has(s)||(n.add(s),o.push(s))})});const c=o.map(i).join(","),e=t.map(r=>o.map(s=>i(r[s])).join(","));return[c,...e].join(`\r
`)},a=(t,o)=>{const n=new Blob([`\uFEFF${t}`],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(n),e=document.createElement("a");e.href=c,e.download=o,document.body.appendChild(e),e.click(),document.body.removeChild(e),URL.revokeObjectURL(c)},b=(t,o)=>{const n=d();a(p(t),`${o}_${n}.csv`)},F=(t,o,n)=>{a(m(t,o),n)};export{b as a,F as d};
