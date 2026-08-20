/**
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
 */const d=/^[=+\-@]/,u=/^[\u0000-\u0020\u007F-\u00A0\u1680\u2000-\u200D\u2028\u2029\u202F\u205F\u3000\uFEFF]+/,i=o=>{if(o==null)return"";let t;typeof o=="string"?t=o:typeof o=="number"||typeof o=="boolean"?t=String(o):t=JSON.stringify(o);const n=t.replace(u,"");return d.test(n)&&(t=`'${n}`),/[",\t\r\n]/.test(t)&&(t=`"${t.replace(/"/g,'""')}"`),t},l=(o,t)=>[o,...t].map(n=>n.map(i).join(",")).join(`\r
`),p=o=>{const t=[],n=new Set;o.forEach(r=>{Object.keys(r).forEach(s=>{n.has(s)||(n.add(s),t.push(s))})});const c=t.map(i).join(","),e=o.map(r=>t.map(s=>i(r[s])).join(","));return[c,...e].join(`\r
`)},a=(o,t)=>{const n=new Blob([`\uFEFF${o}`],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(n),e=document.createElement("a");e.href=c,e.download=t,document.body.appendChild(e),e.click(),document.body.removeChild(e),URL.revokeObjectURL(c)},m=(o,t)=>{const n=new Date().toISOString().slice(0,10);a(p(o),`${t}_${n}.csv`)},f=(o,t,n)=>{a(l(o,t),n)};export{m as a,f as d};
