import{r as o}from"./vendor-react-qoZPGuNy.js";/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */const c=250;function i(e,t=c){const[u,n]=o.useState(e);return o.useEffect(()=>{const r=window.setTimeout(()=>{n(e)},t);return()=>{window.clearTimeout(r)}},[e,t]),u}export{i as u};
