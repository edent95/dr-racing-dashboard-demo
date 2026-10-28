import{o as Re,d as Ie}from"./vendor-DRzE2AjG.js";/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo=()=>{};var Bi={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hr=function(e){const n=[];let r=0;for(let s=0;s<e.length;s++){let c=e.charCodeAt(s);c<128?n[r++]=c:c<2048?(n[r++]=c>>6|192,n[r++]=c&63|128):(c&64512)===55296&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===56320?(c=65536+((c&1023)<<10)+(e.charCodeAt(++s)&1023),n[r++]=c>>18|240,n[r++]=c>>12&63|128,n[r++]=c>>6&63|128,n[r++]=c&63|128):(n[r++]=c>>12|224,n[r++]=c>>6&63|128,n[r++]=c&63|128)}return n},Wo=function(e){const n=[];let r=0,s=0;for(;r<e.length;){const c=e[r++];if(c<128)n[s++]=String.fromCharCode(c);else if(c>191&&c<224){const d=e[r++];n[s++]=String.fromCharCode((c&31)<<6|d&63)}else if(c>239&&c<365){const d=e[r++],f=e[r++],E=e[r++],S=((c&7)<<18|(d&63)<<12|(f&63)<<6|E&63)-65536;n[s++]=String.fromCharCode(55296+(S>>10)),n[s++]=String.fromCharCode(56320+(S&1023))}else{const d=e[r++],f=e[r++];n[s++]=String.fromCharCode((c&15)<<12|(d&63)<<6|f&63)}}return n.join("")},En={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(e,n){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=n?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let c=0;c<e.length;c+=3){const d=e[c],f=c+1<e.length,E=f?e[c+1]:0,S=c+2<e.length,v=S?e[c+2]:0,P=d>>2,I=(d&3)<<4|E>>4;let G=(E&15)<<2|v>>6,W=v&63;S||(W=64,f||(G=64)),s.push(r[P],r[I],r[G],r[W])}return s.join("")},encodeString(e,n){return this.HAS_NATIVE_SUPPORT&&!n?btoa(e):this.encodeByteArray(hr(e),n)},decodeString(e,n){return this.HAS_NATIVE_SUPPORT&&!n?atob(e):Wo(this.decodeStringToByteArray(e,n))},decodeStringToByteArray(e,n){this.init_();const r=n?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let c=0;c<e.length;){const d=r[e.charAt(c++)],E=c<e.length?r[e.charAt(c)]:0;++c;const v=c<e.length?r[e.charAt(c)]:64;++c;const I=c<e.length?r[e.charAt(c)]:64;if(++c,d==null||E==null||v==null||I==null)throw new Vo;const G=d<<2|E>>4;if(s.push(G),v!==64){const W=E<<4&240|v>>2;if(s.push(W),I!==64){const H=v<<6&192|I;s.push(H)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class Vo extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const qo=function(e){const n=hr(e);return En.encodeByteArray(n,!0)},Ae=function(e){return qo(e).replace(/\./g,"")},Go=function(e){try{return En.decodeString(e,!0)}catch(n){console.error("base64Decode failed: ",n)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lr(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xo=()=>lr().__FIREBASE_DEFAULTS__,Jo=()=>{if(typeof process>"u"||typeof Bi>"u")return;const e=Bi.__FIREBASE_DEFAULTS__;if(e)return JSON.parse(e)},Yo=()=>{if(typeof document>"u")return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const n=e&&Go(e[1]);return n&&JSON.parse(n)},De=()=>{try{return zo()||Xo()||Jo()||Yo()}catch(e){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);return}},Zo=e=>{var n,r;return(r=(n=De())==null?void 0:n.emulatorHosts)==null?void 0:r[e]},Qh=e=>{const n=Zo(e);if(!n)return;const r=n.lastIndexOf(":");if(r<=0||r+1===n.length)throw new Error(`Invalid host ${n} with no separate hostname and port!`);const s=parseInt(n.substring(r+1),10);return n[0]==="["?[n.substring(1,r-1),s]:[n.substring(0,r),s]},ur=()=>{var e;return(e=De())==null?void 0:e.config},tl=e=>{var n;return(n=De())==null?void 0:n[`_${e}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((n,r)=>{this.resolve=n,this.reject=r})}wrapCallback(n){return(r,s)=>{r?this.reject(r):this.resolve(s),typeof n=="function"&&(this.promise.catch(()=>{}),n.length===1?n(r):n(r,s))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function el(e,n){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const r={alg:"none",type:"JWT"},s=n||"demo-project",c=e.iat||0,d=e.sub||e.user_id;if(!d)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const f={iss:`https://securetoken.google.com/${s}`,aud:s,iat:c,exp:c+3600,auth_time:c,sub:d,user_id:d,firebase:{sign_in_provider:"custom",identities:{}},...e};return[Ae(JSON.stringify(r)),Ae(JSON.stringify(f)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fr(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function nl(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(fr())}function dr(){var n;const e=(n=De())==null?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function il(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function rl(){const e=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof e=="object"&&e.id!==void 0}function ol(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function sl(){const e=fr();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0}function al(){return!dr()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function cl(){return!dr()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Oe(){try{return typeof indexedDB=="object"}catch{return!1}}function pr(){return new Promise((e,n)=>{try{let r=!0;const s="validate-browser-context-for-indexeddb-analytics-module",c=self.indexedDB.open(s);c.onsuccess=()=>{c.result.close(),r||self.indexedDB.deleteDatabase(s),e(!0)},c.onupgradeneeded=()=>{r=!1},c.onerror=()=>{var d;n(((d=c.error)==null?void 0:d.message)||"")}}catch(r){n(r)}})}function Qo(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ts="FirebaseError";class Pt extends Error{constructor(n,r,s){super(r),this.code=n,this.customData=s,this.name=ts,Object.setPrototypeOf(this,Pt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ne.prototype.create)}}class ne{constructor(n,r,s){this.service=n,this.serviceName=r,this.errors=s}create(n,...r){const s=r[0]||{},c=`${this.service}/${n}`,d=this.errors[n],f=d?es(d,s):"Error",E=`${this.serviceName}: ${f} (${c}).`;return new Pt(c,E,s)}}function es(e,n){return e.replace(ns,(r,s)=>{const c=n[s];return c!=null?String(c):`<${s}?>`})}const ns=/\{\$([^}]+)}/g;function hl(e){for(const n in e)if(Object.prototype.hasOwnProperty.call(e,n))return!1;return!0}function pn(e,n){if(e===n)return!0;const r=Object.keys(e),s=Object.keys(n);for(const c of r){if(!s.includes(c))return!1;const d=e[c],f=n[c];if(ji(d)&&ji(f)){if(!pn(d,f))return!1}else if(d!==f)return!1}for(const c of s)if(!r.includes(c))return!1;return!0}function ji(e){return e!==null&&typeof e=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ll(e){const n=[];for(const[r,s]of Object.entries(e))Array.isArray(s)?s.forEach(c=>{n.push(encodeURIComponent(r)+"="+encodeURIComponent(c))}):n.push(encodeURIComponent(r)+"="+encodeURIComponent(s));return n.length?"&"+n.join("&"):""}function ul(e){const n={};return e.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[c,d]=s.split("=");n[decodeURIComponent(c)]=decodeURIComponent(d)}}),n}function fl(e){const n=e.indexOf("?");if(!n)return"";const r=e.indexOf("#",n);return e.substring(n,r>0?r:void 0)}function dl(e,n){const r=new is(e,n);return r.subscribe.bind(r)}class is{constructor(n,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{n(this)}).catch(s=>{this.error(s)})}next(n){this.forEachObserver(r=>{r.next(n)})}error(n){this.forEachObserver(r=>{r.error(n)}),this.close(n)}complete(){this.forEachObserver(n=>{n.complete()}),this.close()}subscribe(n,r,s){let c;if(n===void 0&&r===void 0&&s===void 0)throw new Error("Missing Observer.");rs(n,["next","error","complete"])?c=n:c={next:n,error:r,complete:s},c.next===void 0&&(c.next=sn),c.error===void 0&&(c.error=sn),c.complete===void 0&&(c.complete=sn);const d=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?c.error(this.finalError):c.complete()}catch{}}),this.observers.push(c),d}unsubscribeOne(n){this.observers===void 0||this.observers[n]===void 0||(delete this.observers[n],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(n){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,n)}sendOne(n,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[n]!==void 0)try{r(this.observers[n])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(n){this.finalized||(this.finalized=!0,n!==void 0&&(this.finalError=n),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function rs(e,n){if(typeof e!="object"||e===null)return!1;for(const r of n)if(r in e&&typeof e[r]=="function")return!0;return!1}function sn(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os=1e3,ss=2,as=14400*1e3,cs=.5;function hs(e,n=os,r=ss){const s=n*Math.pow(r,e),c=Math.round(cs*s*(Math.random()-.5)*2);return Math.min(as,s+c)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nt(e){return e&&e._delegate?e._delegate:e}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pl(e){try{return(e.startsWith("http://")||e.startsWith("https://")?new URL(e).hostname:e).endsWith(".cloudworkstations.dev")}catch{return!1}}async function gl(e){return(await fetch(e,{credentials:"include"})).ok}class Y{constructor(n,r,s){this.name=n,this.instanceFactory=r,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(n){return this.instantiationMode=n,this}setMultipleInstances(n){return this.multipleInstances=n,this}setServiceProps(n){return this.serviceProps=n,this}setInstanceCreatedCallback(n){return this.onInstanceCreated=n,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(n,r){this.name=n,this.container=r,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(n){const r=this.normalizeInstanceIdentifier(n);if(!this.instancesDeferred.has(r)){const s=new Qt;if(this.instancesDeferred.set(r,s),this.isInitialized(r)||this.shouldAutoInitialize())try{const c=this.getOrInitializeService({instanceIdentifier:r});c&&s.resolve(c)}catch{}}return this.instancesDeferred.get(r).promise}getImmediate(n){const r=this.normalizeInstanceIdentifier(n==null?void 0:n.identifier),s=(n==null?void 0:n.optional)??!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(c){if(s)return null;throw c}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(n){if(n.name!==this.name)throw Error(`Mismatching Component ${n.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=n,!!this.shouldAutoInitialize()){if(fs(n))try{this.getOrInitializeService({instanceIdentifier:bt})}catch{}for(const[r,s]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(r);try{const d=this.getOrInitializeService({instanceIdentifier:c});s.resolve(d)}catch{}}}}clearInstance(n=bt){this.instancesDeferred.delete(n),this.instancesOptions.delete(n),this.instances.delete(n)}async delete(){const n=Array.from(this.instances.values());await Promise.all([...n.filter(r=>"INTERNAL"in r).map(r=>r.INTERNAL.delete()),...n.filter(r=>"_delete"in r).map(r=>r._delete())])}isComponentSet(){return this.component!=null}isInitialized(n=bt){return this.instances.has(n)}getOptions(n=bt){return this.instancesOptions.get(n)||{}}initialize(n={}){const{options:r={}}=n,s=this.normalizeInstanceIdentifier(n.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const c=this.getOrInitializeService({instanceIdentifier:s,options:r});for(const[d,f]of this.instancesDeferred.entries()){const E=this.normalizeInstanceIdentifier(d);s===E&&f.resolve(c)}return c}onInit(n,r){const s=this.normalizeInstanceIdentifier(r),c=this.onInitCallbacks.get(s)??new Set;c.add(n),this.onInitCallbacks.set(s,c);const d=this.instances.get(s);return d&&n(d,s),()=>{c.delete(n)}}invokeOnInitCallbacks(n,r){const s=this.onInitCallbacks.get(r);if(s)for(const c of s)try{c(n,r)}catch{}}getOrInitializeService({instanceIdentifier:n,options:r={}}){let s=this.instances.get(n);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:us(n),options:r}),this.instances.set(n,s),this.instancesOptions.set(n,r),this.invokeOnInitCallbacks(s,n),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,n,s)}catch{}return s||null}normalizeInstanceIdentifier(n=bt){return this.component?this.component.multipleInstances?n:bt:n}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function us(e){return e===bt?void 0:e}function fs(e){return e.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(n){this.name=n,this.providers=new Map}addComponent(n){const r=this.getProvider(n.name);if(r.isComponentSet())throw new Error(`Component ${n.name} has already been registered with ${this.name}`);r.setComponent(n)}addOrOverwriteComponent(n){this.getProvider(n.name).isComponentSet()&&this.providers.delete(n.name),this.addComponent(n)}getProvider(n){if(this.providers.has(n))return this.providers.get(n);const r=new ls(n,this);return this.providers.set(n,r),r}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var R;(function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"})(R||(R={}));const ps={debug:R.DEBUG,verbose:R.VERBOSE,info:R.INFO,warn:R.WARN,error:R.ERROR,silent:R.SILENT},gs=R.INFO,ms={[R.DEBUG]:"log",[R.VERBOSE]:"log",[R.INFO]:"info",[R.WARN]:"warn",[R.ERROR]:"error"},ys=(e,n,...r)=>{if(n<e.logLevel)return;const s=new Date().toISOString(),c=ms[n];if(c)console[c](`[${s}]  ${e.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${n})`)};class gr{constructor(n){this.name=n,this._logLevel=gs,this._logHandler=ys,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(n){if(!(n in R))throw new TypeError(`Invalid value "${n}" assigned to \`logLevel\``);this._logLevel=n}setLogLevel(n){this._logLevel=typeof n=="string"?ps[n]:n}get logHandler(){return this._logHandler}set logHandler(n){if(typeof n!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=n}get userLogHandler(){return this._userLogHandler}set userLogHandler(n){this._userLogHandler=n}debug(...n){this._userLogHandler&&this._userLogHandler(this,R.DEBUG,...n),this._logHandler(this,R.DEBUG,...n)}log(...n){this._userLogHandler&&this._userLogHandler(this,R.VERBOSE,...n),this._logHandler(this,R.VERBOSE,...n)}info(...n){this._userLogHandler&&this._userLogHandler(this,R.INFO,...n),this._logHandler(this,R.INFO,...n)}warn(...n){this._userLogHandler&&this._userLogHandler(this,R.WARN,...n),this._logHandler(this,R.WARN,...n)}error(...n){this._userLogHandler&&this._userLogHandler(this,R.ERROR,...n),this._logHandler(this,R.ERROR,...n)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(n){this.container=n}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(bs(r)){const s=r.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(r=>r).join(" ")}}function bs(e){const n=e.getComponent();return(n==null?void 0:n.type)==="VERSION"}const gn="@firebase/app",Fi="0.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q=new gr("@firebase/app"),vs="@firebase/app-compat",Es="@firebase/analytics-compat",Ts="@firebase/analytics",Ss="@firebase/app-check-compat",Is="@firebase/app-check",As="@firebase/auth",_s="@firebase/auth-compat",ks="@firebase/database",Cs="@firebase/data-connect",Rs="@firebase/database-compat",Ds="@firebase/functions",Os="@firebase/functions-compat",Ps="@firebase/installations",Ns="@firebase/installations-compat",Ms="@firebase/messaging",xs="@firebase/messaging-compat",Bs="@firebase/performance",js="@firebase/performance-compat",Fs="@firebase/remote-config",$s="@firebase/remote-config-compat",Hs="@firebase/storage",Ls="@firebase/storage-compat",Us="@firebase/firestore",Ks="@firebase/ai",zs="@firebase/firestore-compat",Ws="firebase",Vs="12.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mn="[DEFAULT]",qs={[gn]:"fire-core",[vs]:"fire-core-compat",[Ts]:"fire-analytics",[Es]:"fire-analytics-compat",[Is]:"fire-app-check",[Ss]:"fire-app-check-compat",[As]:"fire-auth",[_s]:"fire-auth-compat",[ks]:"fire-rtdb",[Cs]:"fire-data-connect",[Rs]:"fire-rtdb-compat",[Ds]:"fire-fn",[Os]:"fire-fn-compat",[Ps]:"fire-iid",[Ns]:"fire-iid-compat",[Ms]:"fire-fcm",[xs]:"fire-fcm-compat",[Bs]:"fire-perf",[js]:"fire-perf-compat",[Fs]:"fire-rc",[$s]:"fire-rc-compat",[Hs]:"fire-gcs",[Ls]:"fire-gcs-compat",[Us]:"fire-fst",[zs]:"fire-fst-compat",[Ks]:"fire-vertex","fire-js":"fire-js",[Ws]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _e=new Map,Gs=new Map,yn=new Map;function $i(e,n){try{e.container.addComponent(n)}catch(r){Q.debug(`Component ${n.name} failed to register with FirebaseApp ${e.name}`,r)}}function tt(e){const n=e.name;if(yn.has(n))return Q.debug(`There were multiple attempts to register component ${n}.`),!1;yn.set(n,e);for(const r of _e.values())$i(r,e);for(const r of Gs.values())$i(r,e);return!0}function ie(e,n){const r=e.container.getProvider("heartbeat").getImmediate({optional:!0});return r&&r.triggerHeartbeat(),e.container.getProvider(n)}function ml(e){return e==null?!1:e.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xs={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ft=new ne("app","Firebase",Xs);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Js{constructor(n,r,s){this._isDeleted=!1,this._options={...n},this._config={...r},this._name=r.name,this._automaticDataCollectionEnabled=r.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Y("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(n){this.checkDestroyed(),this._automaticDataCollectionEnabled=n}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(n){this._isDeleted=n}checkDestroyed(){if(this.isDeleted)throw ft.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yl=Vs;function Ys(e,n={}){let r=e;typeof n!="object"&&(n={name:n});const s={name:mn,automaticDataCollectionEnabled:!0,...n},c=s.name;if(typeof c!="string"||!c)throw ft.create("bad-app-name",{appName:String(c)});if(r||(r=ur()),!r)throw ft.create("no-options");const d=_e.get(c);if(d){if(pn(r,d.options)&&pn(s,d.config))return d;throw ft.create("duplicate-app",{appName:c})}const f=new ds(c);for(const S of yn.values())f.addComponent(S);const E=new Js(r,s,f);return _e.set(c,E),E}function mr(e=mn){const n=_e.get(e);if(!n&&e===mn&&ur())return Ys();if(!n)throw ft.create("no-app",{appName:e});return n}function Z(e,n,r){let s=qs[e]??e;r&&(s+=`-${r}`);const c=s.match(/\s|\//),d=n.match(/\s|\//);if(c||d){const f=[`Unable to register library "${s}" with version "${n}":`];c&&f.push(`library name "${s}" contains illegal characters (whitespace or "/")`),c&&d&&f.push("and"),d&&f.push(`version name "${n}" contains illegal characters (whitespace or "/")`),Q.warn(f.join(" "));return}tt(new Y(`${s}-version`,()=>({library:s,version:n}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs="firebase-heartbeat-database",Qs=1,te="firebase-heartbeat-store";let an=null;function yr(){return an||(an=Re(Zs,Qs,{upgrade:(e,n)=>{switch(n){case 0:try{e.createObjectStore(te)}catch(r){console.warn(r)}}}}).catch(e=>{throw ft.create("idb-open",{originalErrorMessage:e.message})})),an}async function ta(e){try{const r=(await yr()).transaction(te),s=await r.objectStore(te).get(wr(e));return await r.done,s}catch(n){if(n instanceof Pt)Q.warn(n.message);else{const r=ft.create("idb-get",{originalErrorMessage:n==null?void 0:n.message});Q.warn(r.message)}}}async function Hi(e,n){try{const s=(await yr()).transaction(te,"readwrite");await s.objectStore(te).put(n,wr(e)),await s.done}catch(r){if(r instanceof Pt)Q.warn(r.message);else{const s=ft.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Q.warn(s.message)}}}function wr(e){return`${e.name}!${e.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ea=1024,na=30;class ia{constructor(n){this.container=n,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new oa(r),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var n,r;try{const c=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),d=Li();if(((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===d||this._heartbeatsCache.heartbeats.some(f=>f.date===d))return;if(this._heartbeatsCache.heartbeats.push({date:d,agent:c}),this._heartbeatsCache.heartbeats.length>na){const f=sa(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(f,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){Q.warn(s)}}async getHeartbeatsHeader(){var n;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=Li(),{heartbeatsToSend:s,unsentEntries:c}=ra(this._heartbeatsCache.heartbeats),d=Ae(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=r,c.length>0?(this._heartbeatsCache.heartbeats=c,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),d}catch(r){return Q.warn(r),""}}}function Li(){return new Date().toISOString().substring(0,10)}function ra(e,n=ea){const r=[];let s=e.slice();for(const c of e){const d=r.find(f=>f.agent===c.agent);if(d){if(d.dates.push(c.date),Ui(r)>n){d.dates.pop();break}}else if(r.push({agent:c.agent,dates:[c.date]}),Ui(r)>n){r.pop();break}s=s.slice(1)}return{heartbeatsToSend:r,unsentEntries:s}}class oa{constructor(n){this.app=n,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Oe()?pr().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await ta(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(n){if(await this._canUseIndexedDBPromise){const s=await this.read();return Hi(this.app,{lastSentHeartbeatDate:n.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:n.heartbeats})}else return}async add(n){if(await this._canUseIndexedDBPromise){const s=await this.read();return Hi(this.app,{lastSentHeartbeatDate:n.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...n.heartbeats]})}else return}}function Ui(e){return Ae(JSON.stringify({version:2,heartbeats:e})).length}function sa(e){if(e.length===0)return-1;let n=0,r=e[0].date;for(let s=1;s<e.length;s++)e[s].date<r&&(r=e[s].date,n=s);return n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aa(e){tt(new Y("platform-logger",n=>new ws(n),"PRIVATE")),tt(new Y("heartbeat",n=>new ia(n),"PRIVATE")),Z(gn,Fi,e),Z(gn,Fi,"esm2020"),Z("fire-js","")}aa("");var ca="firebase",ha="12.15.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Z(ca,ha,"app");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wn=new Map,br={activated:!1,tokenObservers:[]},la={initialized:!1,enabled:!1};function O(e){return wn.get(e)||{...br}}function ua(e,n){return wn.set(e,n),wn.get(e)}function Pe(){return la}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vr="https://content-firebaseappcheck.googleapis.com/v1",fa="exchangeRecaptchaEnterpriseToken",da="exchangeDebugToken",Ki={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:960*1e3},pa=1440*60*1e3;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(n,r,s,c,d){if(this.operation=n,this.retryPolicy=r,this.getWaitDuration=s,this.lowerBound=c,this.upperBound=d,this.pending=null,this.nextErrorWaitInterval=c,c>d)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(n){this.stop();try{this.pending=new Qt,this.pending.promise.catch(r=>{}),await ma(this.getNextRun(n)),this.pending.resolve(),await this.pending.promise,this.pending=new Qt,this.pending.promise.catch(r=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(r){this.retryPolicy(r)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(n){if(n)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const r=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),r}}}function ma(e){return new Promise(n=>{setTimeout(n,e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ya={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","already-internally-initialized":"App Check has already been automatically initialized by {$initializerName} with default options. If you want to initialize App Check with custom options, call initializeAppCheck() with those options before initializing {$initializerName}.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","no-provider":"No attestation provider was passed to initializeAppCheck() and no ReCAPTCHA Enterprise site key was found in the Firebase config.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},j=new ne("appCheck","AppCheck",ya);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zi(e=!1){var n;return e?(n=self.grecaptcha)==null?void 0:n.enterprise:self.grecaptcha}function Tn(e){if(!O(e).activated)throw j.create("use-before-activation",{appName:e.name})}function Er(e){const n=Math.round(e/1e3),r=Math.floor(n/(3600*24)),s=Math.floor((n-r*3600*24)/3600),c=Math.floor((n-r*3600*24-s*3600)/60),d=n-r*3600*24-s*3600-c*60;let f="";return r&&(f+=Ee(r)+"d:"),s&&(f+=Ee(s)+"h:"),f+=Ee(c)+"m:"+Ee(d)+"s",f}function Ee(e){return e===0?"00":e>=10?e.toString():"0"+e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sn({url:e,body:n},r){const s={"Content-Type":"application/json"},c=r.getImmediate({optional:!0});if(c){const I=await c.getHeartbeatsHeader();I&&(s["X-Firebase-Client"]=I)}const d={method:"POST",body:JSON.stringify(n),headers:s};let f;try{f=await fetch(e,d)}catch(I){throw j.create("fetch-network-error",{originalErrorMessage:I==null?void 0:I.message})}if(f.status!==200)throw j.create("fetch-status-error",{httpStatus:f.status});let E;try{E=await f.json()}catch(I){throw j.create("fetch-parse-error",{originalErrorMessage:I==null?void 0:I.message})}const S=E.ttl.match(/^([\d.]+)(s)$/);if(!S||!S[2]||isNaN(Number(S[1])))throw j.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${E.ttl}`});const v=Number(S[1])*1e3,P=Date.now();return{token:E.token,expireTimeMillis:P+v,issuedAtTimeMillis:P}}function wa(e,n){const{projectId:r,appId:s,apiKey:c}=e.options;return{url:`${vr}/projects/${r}/apps/${s}:${fa}?key=${c}`,body:{recaptcha_enterprise_token:n}}}function Tr(e,n){const{projectId:r,appId:s,apiKey:c}=e.options;return{url:`${vr}/projects/${r}/apps/${s}:${da}?key=${c}`,body:{debug_token:n}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ba="firebase-app-check-database",va=1,ee="firebase-app-check-store",Sr="debug-token";let Te=null;function Ir(){return Te||(Te=new Promise((e,n)=>{try{const r=indexedDB.open(ba,va);r.onsuccess=s=>{e(s.target.result)},r.onerror=s=>{var c;n(j.create("storage-open",{originalErrorMessage:(c=s.target.error)==null?void 0:c.message}))},r.onupgradeneeded=s=>{const c=s.target.result;switch(s.oldVersion){case 0:c.createObjectStore(ee,{keyPath:"compositeKey"})}}}catch(r){n(j.create("storage-open",{originalErrorMessage:r==null?void 0:r.message}))}}),Te)}function Ea(e){return _r(kr(e))}function Ta(e,n){return Ar(kr(e),n)}function Sa(e){return Ar(Sr,e)}function Ia(){return _r(Sr)}async function Ar(e,n){const s=(await Ir()).transaction(ee,"readwrite"),d=s.objectStore(ee).put({compositeKey:e,value:n});return new Promise((f,E)=>{d.onsuccess=S=>{f()},s.onerror=S=>{var v;E(j.create("storage-set",{originalErrorMessage:(v=S.target.error)==null?void 0:v.message}))}})}async function _r(e){const r=(await Ir()).transaction(ee,"readonly"),c=r.objectStore(ee).get(e);return new Promise((d,f)=>{c.onsuccess=E=>{const S=E.target.result;d(S?S.value:void 0)},r.onerror=E=>{var S;f(j.create("storage-get",{originalErrorMessage:(S=E.target.error)==null?void 0:S.message}))}})}function kr(e){return`${e.options.appId}-${e.name}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ut=new gr("@firebase/app-check");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Aa(e){if(Oe()){let n;try{n=await Ea(e)}catch(r){ut.warn(`Failed to read token from IndexedDB. Error: ${r}`)}return n}}function cn(e,n){return Oe()?Ta(e,n).catch(r=>{ut.warn(`Failed to write token to IndexedDB. Error: ${r}`)}):Promise.resolve()}async function _a(){let e;try{e=await Ia()}catch{}if(e)return e;{const n=crypto.randomUUID();return Sa(n).catch(r=>ut.warn(`Failed to persist debug token to IndexedDB. Error: ${r}`)),n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function In(){return Pe().enabled}async function An(){const e=Pe();if(e.enabled&&e.token)return e.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function ka(){const e=lr(),n=Pe();if(n.initialized=!0,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&e.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;n.enabled=!0;const r=new Qt;n.token=r,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?r.resolve(e.FIREBASE_APPCHECK_DEBUG_TOKEN):r.resolve(_a())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ca={error:"UNKNOWN_ERROR"};function Ra(e){return En.encodeString(JSON.stringify(e),!1)}async function ke(e,n=!1,r=!1){const s=e.app;Tn(s);const c=O(s);let d=c.token,f;if(d&&!Rt(d)&&(c.token=void 0,d=void 0),!d){const v=await c.cachedTokenPromise;v&&(Rt(v)?d=v:await cn(s,void 0))}if(!n&&d&&Rt(d))return{token:d.token};let E=!1;if(In())try{const v=await An();c.exchangeTokenPromise||(c.exchangeTokenPromise=Sn(Tr(s,v),e.heartbeatServiceProvider).finally(()=>{c.exchangeTokenPromise=void 0}),E=!0);const P=await c.exchangeTokenPromise;return await cn(s,P),c.token=P,{token:P.token}}catch(v){return v.code==="appCheck/throttled"||v.code==="appCheck/initial-throttle"?ut.warn(v.message):r&&ut.error(v),hn(v)}try{c.exchangeTokenPromise||(c.exchangeTokenPromise=c.provider.getToken().finally(()=>{c.exchangeTokenPromise=void 0}),E=!0),d=await O(s).exchangeTokenPromise}catch(v){v.code==="appCheck/throttled"||v.code==="appCheck/initial-throttle"?ut.warn(v.message):r&&ut.error(v),f=v}let S;return d?f?Rt(d)?S={token:d.token,internalError:f}:S=hn(f):(S={token:d.token},c.token=d,await cn(s,d)):S=hn(f),E&&Dr(s,S),S}async function Da(e){const n=e.app;Tn(n);const{provider:r}=O(n);if(In()){const s=await An(),c=Tr(n,s);c.body.limited_use=!0;const{token:d}=await Sn(c,e.heartbeatServiceProvider);return{token:d}}else{const{token:s}=await r.getToken(!0);return{token:s}}}function Cr(e,n,r,s){const{app:c}=e,d=O(c),f={next:r,error:s,type:n};if(d.tokenObservers=[...d.tokenObservers,f],d.token&&Rt(d.token)){const E=d.token;Promise.resolve().then(()=>{r({token:E.token}),Wi(e)}).catch(()=>{})}d.cachedTokenPromise.then(()=>Wi(e))}function Rr(e,n){const r=O(e),s=r.tokenObservers.filter(c=>c.next!==n);s.length===0&&r.tokenRefresher&&r.tokenRefresher.isRunning()&&r.tokenRefresher.stop(),r.tokenObservers=s}function Wi(e){const{app:n}=e,r=O(n);let s=r.tokenRefresher;s||(s=Oa(e),r.tokenRefresher=s),!s.isRunning()&&r.isTokenAutoRefreshEnabled&&s.start()}function Oa(e){const{app:n}=e;return new ga(async()=>{const r=O(n);let s;if(r.token?s=await ke(e,!0):s=await ke(e),s.error)throw s.error;if(s.internalError)throw s.internalError},()=>!0,()=>{const r=O(n);if(r.token){let s=r.token.issuedAtTimeMillis+(r.token.expireTimeMillis-r.token.issuedAtTimeMillis)*.5+3e5;const c=r.token.expireTimeMillis-300*1e3;return s=Math.min(s,c),Math.max(0,s-Date.now())}else return 0},Ki.RETRIAL_MIN_WAIT,Ki.RETRIAL_MAX_WAIT)}function Dr(e,n){const r=O(e).tokenObservers;for(const s of r)try{s.type==="EXTERNAL"&&n.error!=null?s.error(n.error):s.next(n)}catch{}}function Rt(e){return e.expireTimeMillis-Date.now()>0}function hn(e){return{token:Ra(Ca),error:e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(n,r){this.app=n,this.heartbeatServiceProvider=r}_delete(){const{tokenObservers:n}=O(this.app);for(const r of n)Rr(this.app,r.next);return Promise.resolve()}}function Na(e,n){return new Pa(e,n)}function Ma(e){return{getToken:n=>ke(e,n),getLimitedUseToken:()=>Da(e),addTokenListener:n=>Cr(e,"INTERNAL",n),removeTokenListener:n=>Rr(e.app,n)}}const xa="@firebase/app-check",Ba="0.12.0",ja="https://www.google.com/recaptcha/enterprise.js";function Fa(e,n){const r=new Qt,s=O(e);s.reCAPTCHAState={initialized:r};const c=$a(e),d=zi(!0);return d?Vi(e,n,d,c,r):Ua(()=>{const f=zi(!0);if(!f)throw new Error("no recaptcha");Vi(e,n,f,c,r)}),r.promise}function Vi(e,n,r,s,c){r.ready(()=>{La(e,n,r,s),c.resolve(r)})}function $a(e){const n=`fire_app_check_${e.name}`,r=document.createElement("div");return r.id=n,r.style.display="none",document.body.appendChild(r),n}async function Ha(e){Tn(e);const r=await O(e).reCAPTCHAState.initialized.promise;return new Promise((s,c)=>{const d=O(e).reCAPTCHAState;r.ready(()=>{s(r.execute(d.widgetId,{action:"fire_app_check"}))})})}function La(e,n,r,s){const c=r.render(s,{sitekey:n,size:"invisible",callback:()=>{O(e).reCAPTCHAState.succeeded=!0},"error-callback":()=>{O(e).reCAPTCHAState.succeeded=!1}}),d=O(e);d.reCAPTCHAState={...d.reCAPTCHAState,widgetId:c}}function Ua(e){const n=document.createElement("script");n.src=ja+"?render=explicit",n.onload=e,document.head.appendChild(n)}class _n{constructor(n){this._siteKey=n,this._throttleData=null}async getToken(n=!1){var c,d,f;za(this._throttleData);const r=await Ha(this._app).catch(E=>{throw j.create("recaptcha-error")});if(!((c=O(this._app).reCAPTCHAState)!=null&&c.succeeded))throw j.create("recaptcha-error");let s;try{const E=wa(this._app,r);n&&(E.body.limited_use=!0),s=await Sn(E,this._heartbeatServiceProvider)}catch(E){throw(d=E.code)!=null&&d.includes("fetch-status-error")?(this._throttleData=Ka(Number((f=E.customData)==null?void 0:f.httpStatus),this._throttleData),j.create("initial-throttle",{time:Er(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):E}return this._throttleData=null,s}initialize(n){this._app=n,this._heartbeatServiceProvider=ie(n,"heartbeat"),Fa(n,this._siteKey).catch(()=>{})}isEqual(n){return n instanceof _n?this._siteKey===n._siteKey:!1}}function Ka(e,n){if(e===404||e===403)return{backoffCount:1,allowRequestsAfter:Date.now()+pa,httpStatus:e};{const r=n?n.backoffCount:0,s=hs(r,1e3,2);return{backoffCount:r+1,allowRequestsAfter:Date.now()+s,httpStatus:e}}}function za(e){if(e&&Date.now()-e.allowRequestsAfter<=0)throw j.create("throttled",{time:Er(e.allowRequestsAfter-Date.now()),httpStatus:e.httpStatus})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wl(e=mr(),n){var f;e=nt(e),Pe().initialized||ka(),In()&&An().then(E=>console.log(`App Check debug token: ${E}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`));let r;if(!(n!=null&&n.provider)&&e.options.recaptchaSiteKey&&(r=new _n(e.options.recaptchaSiteKey)),!(n!=null&&n.provider)&&!r)throw j.create("no-provider");const s={...n,provider:(n==null?void 0:n.provider)||r},c=ie(e,"app-check");if(c.isInitialized()){const E=c.getImmediate(),S=c.getOptions();if(S.isTokenAutoRefreshEnabled===s.isTokenAutoRefreshEnabled&&((f=S.provider)!=null&&f.isEqual(s.provider)))return E;throw typeof O(e).internallyInitializedBy=="string"?j.create("already-internally-initialized",{initializerName:O(e).internallyInitializedBy}):j.create("already-initialized",{appName:e.name})}const d=c.initialize({options:s});return Wa(e,s.provider,s.isTokenAutoRefreshEnabled),O(e).isTokenAutoRefreshEnabled&&Cr(d,"INTERNAL",()=>{}),d}function Wa(e,n,r=!1){const s=ua(e,{...br});s.activated=!0,s.provider=n,s.cachedTokenPromise=Aa(e).then(c=>(c&&Rt(c)&&(s.token=c,Dr(e,{token:c.token})),c)),s.isTokenAutoRefreshEnabled=r&&e.automaticDataCollectionEnabled,!e.automaticDataCollectionEnabled&&r&&ut.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),s.provider.initialize(e)}async function bl(e,n){const r=await ke(e,n);if(r.error)throw r.error;if(r.internalError)throw r.internalError;return{token:r.token}}const Va="app-check",qi="app-check-internal";function qa(){tt(new Y(Va,e=>{const n=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat");return Na(n,r)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider(qi).initialize()})),tt(new Y(qi,e=>{const n=e.getProvider("app-check").getImmediate();return Ma(n)},"PUBLIC").setInstantiationMode("EXPLICIT")),Z(xa,Ba)}qa();var Gi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ga,Xa;(function(){var e;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function n(g,h){function u(){}u.prototype=h.prototype,g.F=h.prototype,g.prototype=new u,g.prototype.constructor=g,g.D=function(m,p,w){for(var l=Array(arguments.length-2),U=2;U<arguments.length;U++)l[U-2]=arguments[U];return h.prototype[p].apply(m,l)}}function r(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}n(s,r),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function c(g,h,u){u||(u=0);const m=Array(16);if(typeof h=="string")for(var p=0;p<16;++p)m[p]=h.charCodeAt(u++)|h.charCodeAt(u++)<<8|h.charCodeAt(u++)<<16|h.charCodeAt(u++)<<24;else for(p=0;p<16;++p)m[p]=h[u++]|h[u++]<<8|h[u++]<<16|h[u++]<<24;h=g.g[0],u=g.g[1],p=g.g[2];let w=g.g[3],l;l=h+(w^u&(p^w))+m[0]+3614090360&4294967295,h=u+(l<<7&4294967295|l>>>25),l=w+(p^h&(u^p))+m[1]+3905402710&4294967295,w=h+(l<<12&4294967295|l>>>20),l=p+(u^w&(h^u))+m[2]+606105819&4294967295,p=w+(l<<17&4294967295|l>>>15),l=u+(h^p&(w^h))+m[3]+3250441966&4294967295,u=p+(l<<22&4294967295|l>>>10),l=h+(w^u&(p^w))+m[4]+4118548399&4294967295,h=u+(l<<7&4294967295|l>>>25),l=w+(p^h&(u^p))+m[5]+1200080426&4294967295,w=h+(l<<12&4294967295|l>>>20),l=p+(u^w&(h^u))+m[6]+2821735955&4294967295,p=w+(l<<17&4294967295|l>>>15),l=u+(h^p&(w^h))+m[7]+4249261313&4294967295,u=p+(l<<22&4294967295|l>>>10),l=h+(w^u&(p^w))+m[8]+1770035416&4294967295,h=u+(l<<7&4294967295|l>>>25),l=w+(p^h&(u^p))+m[9]+2336552879&4294967295,w=h+(l<<12&4294967295|l>>>20),l=p+(u^w&(h^u))+m[10]+4294925233&4294967295,p=w+(l<<17&4294967295|l>>>15),l=u+(h^p&(w^h))+m[11]+2304563134&4294967295,u=p+(l<<22&4294967295|l>>>10),l=h+(w^u&(p^w))+m[12]+1804603682&4294967295,h=u+(l<<7&4294967295|l>>>25),l=w+(p^h&(u^p))+m[13]+4254626195&4294967295,w=h+(l<<12&4294967295|l>>>20),l=p+(u^w&(h^u))+m[14]+2792965006&4294967295,p=w+(l<<17&4294967295|l>>>15),l=u+(h^p&(w^h))+m[15]+1236535329&4294967295,u=p+(l<<22&4294967295|l>>>10),l=h+(p^w&(u^p))+m[1]+4129170786&4294967295,h=u+(l<<5&4294967295|l>>>27),l=w+(u^p&(h^u))+m[6]+3225465664&4294967295,w=h+(l<<9&4294967295|l>>>23),l=p+(h^u&(w^h))+m[11]+643717713&4294967295,p=w+(l<<14&4294967295|l>>>18),l=u+(w^h&(p^w))+m[0]+3921069994&4294967295,u=p+(l<<20&4294967295|l>>>12),l=h+(p^w&(u^p))+m[5]+3593408605&4294967295,h=u+(l<<5&4294967295|l>>>27),l=w+(u^p&(h^u))+m[10]+38016083&4294967295,w=h+(l<<9&4294967295|l>>>23),l=p+(h^u&(w^h))+m[15]+3634488961&4294967295,p=w+(l<<14&4294967295|l>>>18),l=u+(w^h&(p^w))+m[4]+3889429448&4294967295,u=p+(l<<20&4294967295|l>>>12),l=h+(p^w&(u^p))+m[9]+568446438&4294967295,h=u+(l<<5&4294967295|l>>>27),l=w+(u^p&(h^u))+m[14]+3275163606&4294967295,w=h+(l<<9&4294967295|l>>>23),l=p+(h^u&(w^h))+m[3]+4107603335&4294967295,p=w+(l<<14&4294967295|l>>>18),l=u+(w^h&(p^w))+m[8]+1163531501&4294967295,u=p+(l<<20&4294967295|l>>>12),l=h+(p^w&(u^p))+m[13]+2850285829&4294967295,h=u+(l<<5&4294967295|l>>>27),l=w+(u^p&(h^u))+m[2]+4243563512&4294967295,w=h+(l<<9&4294967295|l>>>23),l=p+(h^u&(w^h))+m[7]+1735328473&4294967295,p=w+(l<<14&4294967295|l>>>18),l=u+(w^h&(p^w))+m[12]+2368359562&4294967295,u=p+(l<<20&4294967295|l>>>12),l=h+(u^p^w)+m[5]+4294588738&4294967295,h=u+(l<<4&4294967295|l>>>28),l=w+(h^u^p)+m[8]+2272392833&4294967295,w=h+(l<<11&4294967295|l>>>21),l=p+(w^h^u)+m[11]+1839030562&4294967295,p=w+(l<<16&4294967295|l>>>16),l=u+(p^w^h)+m[14]+4259657740&4294967295,u=p+(l<<23&4294967295|l>>>9),l=h+(u^p^w)+m[1]+2763975236&4294967295,h=u+(l<<4&4294967295|l>>>28),l=w+(h^u^p)+m[4]+1272893353&4294967295,w=h+(l<<11&4294967295|l>>>21),l=p+(w^h^u)+m[7]+4139469664&4294967295,p=w+(l<<16&4294967295|l>>>16),l=u+(p^w^h)+m[10]+3200236656&4294967295,u=p+(l<<23&4294967295|l>>>9),l=h+(u^p^w)+m[13]+681279174&4294967295,h=u+(l<<4&4294967295|l>>>28),l=w+(h^u^p)+m[0]+3936430074&4294967295,w=h+(l<<11&4294967295|l>>>21),l=p+(w^h^u)+m[3]+3572445317&4294967295,p=w+(l<<16&4294967295|l>>>16),l=u+(p^w^h)+m[6]+76029189&4294967295,u=p+(l<<23&4294967295|l>>>9),l=h+(u^p^w)+m[9]+3654602809&4294967295,h=u+(l<<4&4294967295|l>>>28),l=w+(h^u^p)+m[12]+3873151461&4294967295,w=h+(l<<11&4294967295|l>>>21),l=p+(w^h^u)+m[15]+530742520&4294967295,p=w+(l<<16&4294967295|l>>>16),l=u+(p^w^h)+m[2]+3299628645&4294967295,u=p+(l<<23&4294967295|l>>>9),l=h+(p^(u|~w))+m[0]+4096336452&4294967295,h=u+(l<<6&4294967295|l>>>26),l=w+(u^(h|~p))+m[7]+1126891415&4294967295,w=h+(l<<10&4294967295|l>>>22),l=p+(h^(w|~u))+m[14]+2878612391&4294967295,p=w+(l<<15&4294967295|l>>>17),l=u+(w^(p|~h))+m[5]+4237533241&4294967295,u=p+(l<<21&4294967295|l>>>11),l=h+(p^(u|~w))+m[12]+1700485571&4294967295,h=u+(l<<6&4294967295|l>>>26),l=w+(u^(h|~p))+m[3]+2399980690&4294967295,w=h+(l<<10&4294967295|l>>>22),l=p+(h^(w|~u))+m[10]+4293915773&4294967295,p=w+(l<<15&4294967295|l>>>17),l=u+(w^(p|~h))+m[1]+2240044497&4294967295,u=p+(l<<21&4294967295|l>>>11),l=h+(p^(u|~w))+m[8]+1873313359&4294967295,h=u+(l<<6&4294967295|l>>>26),l=w+(u^(h|~p))+m[15]+4264355552&4294967295,w=h+(l<<10&4294967295|l>>>22),l=p+(h^(w|~u))+m[6]+2734768916&4294967295,p=w+(l<<15&4294967295|l>>>17),l=u+(w^(p|~h))+m[13]+1309151649&4294967295,u=p+(l<<21&4294967295|l>>>11),l=h+(p^(u|~w))+m[4]+4149444226&4294967295,h=u+(l<<6&4294967295|l>>>26),l=w+(u^(h|~p))+m[11]+3174756917&4294967295,w=h+(l<<10&4294967295|l>>>22),l=p+(h^(w|~u))+m[2]+718787259&4294967295,p=w+(l<<15&4294967295|l>>>17),l=u+(w^(p|~h))+m[9]+3951481745&4294967295,g.g[0]=g.g[0]+h&4294967295,g.g[1]=g.g[1]+(p+(l<<21&4294967295|l>>>11))&4294967295,g.g[2]=g.g[2]+p&4294967295,g.g[3]=g.g[3]+w&4294967295}s.prototype.v=function(g,h){h===void 0&&(h=g.length);const u=h-this.blockSize,m=this.C;let p=this.h,w=0;for(;w<h;){if(p==0)for(;w<=u;)c(this,g,w),w+=this.blockSize;if(typeof g=="string"){for(;w<h;)if(m[p++]=g.charCodeAt(w++),p==this.blockSize){c(this,m),p=0;break}}else for(;w<h;)if(m[p++]=g[w++],p==this.blockSize){c(this,m),p=0;break}}this.h=p,this.o+=h},s.prototype.A=function(){var g=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);g[0]=128;for(var h=1;h<g.length-8;++h)g[h]=0;h=this.o*8;for(var u=g.length-8;u<g.length;++u)g[u]=h&255,h/=256;for(this.v(g),g=Array(16),h=0,u=0;u<4;++u)for(let m=0;m<32;m+=8)g[h++]=this.g[u]>>>m&255;return g};function d(g,h){var u=E;return Object.prototype.hasOwnProperty.call(u,g)?u[g]:u[g]=h(g)}function f(g,h){this.h=h;const u=[];let m=!0;for(let p=g.length-1;p>=0;p--){const w=g[p]|0;m&&w==h||(u[p]=w,m=!1)}this.g=u}var E={};function S(g){return-128<=g&&g<128?d(g,function(h){return new f([h|0],h<0?-1:0)}):new f([g|0],g<0?-1:0)}function v(g){if(isNaN(g)||!isFinite(g))return I;if(g<0)return N(v(-g));const h=[];let u=1;for(let m=0;g>=u;m++)h[m]=g/u|0,u*=4294967296;return new f(h,0)}function P(g,h){if(g.length==0)throw Error("number format error: empty string");if(h=h||10,h<2||36<h)throw Error("radix out of range: "+h);if(g.charAt(0)=="-")return N(P(g.substring(1),h));if(g.indexOf("-")>=0)throw Error('number format error: interior "-" character');const u=v(Math.pow(h,8));let m=I;for(let w=0;w<g.length;w+=8){var p=Math.min(8,g.length-w);const l=parseInt(g.substring(w,w+p),h);p<8?(p=v(Math.pow(h,p)),m=m.j(p).add(v(l))):(m=m.j(u),m=m.add(v(l)))}return m}var I=S(0),G=S(1),W=S(16777216);e=f.prototype,e.m=function(){if(L(this))return-N(this).m();let g=0,h=1;for(let u=0;u<this.g.length;u++){const m=this.i(u);g+=(m>=0?m:4294967296+m)*h,h*=4294967296}return g},e.toString=function(g){if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(H(this))return"0";if(L(this))return"-"+N(this).toString(g);const h=v(Math.pow(g,6));var u=this;let m="";for(;;){const p=At(u,h).g;u=St(u,p.j(h));let w=((u.g.length>0?u.g[0]:u.h)>>>0).toString(g);if(u=p,H(u))return w+m;for(;w.length<6;)w="0"+w;m=w+m}},e.i=function(g){return g<0?0:g<this.g.length?this.g[g]:this.h};function H(g){if(g.h!=0)return!1;for(let h=0;h<g.g.length;h++)if(g.g[h]!=0)return!1;return!0}function L(g){return g.h==-1}e.l=function(g){return g=St(this,g),L(g)?-1:H(g)?0:1};function N(g){const h=g.g.length,u=[];for(let m=0;m<h;m++)u[m]=~g.g[m];return new f(u,~g.h).add(G)}e.abs=function(){return L(this)?N(this):this},e.add=function(g){const h=Math.max(this.g.length,g.g.length),u=[];let m=0;for(let p=0;p<=h;p++){let w=m+(this.i(p)&65535)+(g.i(p)&65535),l=(w>>>16)+(this.i(p)>>>16)+(g.i(p)>>>16);m=l>>>16,w&=65535,l&=65535,u[p]=l<<16|w}return new f(u,u[u.length-1]&-2147483648?-1:0)};function St(g,h){return g.add(N(h))}e.j=function(g){if(H(this)||H(g))return I;if(L(this))return L(g)?N(this).j(N(g)):N(N(this).j(g));if(L(g))return N(this.j(N(g)));if(this.l(W)<0&&g.l(W)<0)return v(this.m()*g.m());const h=this.g.length+g.g.length,u=[];for(var m=0;m<2*h;m++)u[m]=0;for(m=0;m<this.g.length;m++)for(let p=0;p<g.g.length;p++){const w=this.i(m)>>>16,l=this.i(m)&65535,U=g.i(p)>>>16,dt=g.i(p)&65535;u[2*m+2*p]+=l*dt,It(u,2*m+2*p),u[2*m+2*p+1]+=w*dt,It(u,2*m+2*p+1),u[2*m+2*p+1]+=l*U,It(u,2*m+2*p+1),u[2*m+2*p+2]+=w*U,It(u,2*m+2*p+2)}for(g=0;g<h;g++)u[g]=u[2*g+1]<<16|u[2*g];for(g=h;g<2*h;g++)u[g]=0;return new f(u,0)};function It(g,h){for(;(g[h]&65535)!=g[h];)g[h+1]+=g[h]>>>16,g[h]&=65535,h++}function it(g,h){this.g=g,this.h=h}function At(g,h){if(H(h))throw Error("division by zero");if(H(g))return new it(I,I);if(L(g))return h=At(N(g),h),new it(N(h.g),N(h.h));if(L(h))return h=At(g,N(h)),new it(N(h.g),h.h);if(g.g.length>30){if(L(g)||L(h))throw Error("slowDivide_ only works with positive integers.");for(var u=G,m=h;m.l(g)<=0;)u=rt(u),m=rt(m);var p=z(u,1),w=z(m,1);for(m=z(m,2),u=z(u,2);!H(m);){var l=w.add(m);l.l(g)<=0&&(p=p.add(u),w=l),m=z(m,1),u=z(u,1)}return h=St(g,p.j(h)),new it(p,h)}for(p=I;g.l(h)>=0;){for(u=Math.max(1,Math.floor(g.m()/h.m())),m=Math.ceil(Math.log(u)/Math.LN2),m=m<=48?1:Math.pow(2,m-48),w=v(u),l=w.j(h);L(l)||l.l(g)>0;)u-=m,w=v(u),l=w.j(h);H(w)&&(w=G),p=p.add(w),g=St(g,l)}return new it(p,g)}e.B=function(g){return At(this,g).h},e.and=function(g){const h=Math.max(this.g.length,g.g.length),u=[];for(let m=0;m<h;m++)u[m]=this.i(m)&g.i(m);return new f(u,this.h&g.h)},e.or=function(g){const h=Math.max(this.g.length,g.g.length),u=[];for(let m=0;m<h;m++)u[m]=this.i(m)|g.i(m);return new f(u,this.h|g.h)},e.xor=function(g){const h=Math.max(this.g.length,g.g.length),u=[];for(let m=0;m<h;m++)u[m]=this.i(m)^g.i(m);return new f(u,this.h^g.h)};function rt(g){const h=g.g.length+1,u=[];for(let m=0;m<h;m++)u[m]=g.i(m)<<1|g.i(m-1)>>>31;return new f(u,g.h)}function z(g,h){const u=h>>5;h%=32;const m=g.g.length-u,p=[];for(let w=0;w<m;w++)p[w]=h>0?g.i(w+u)>>>h|g.i(w+u+1)<<32-h:g.i(w+u);return new f(p,g.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,Xa=s,f.prototype.add=f.prototype.add,f.prototype.multiply=f.prototype.j,f.prototype.modulo=f.prototype.B,f.prototype.compare=f.prototype.l,f.prototype.toNumber=f.prototype.m,f.prototype.toString=f.prototype.toString,f.prototype.getBits=f.prototype.i,f.fromNumber=v,f.fromString=P,Ga=f}).apply(typeof Gi<"u"?Gi:typeof self<"u"?self:typeof window<"u"?window:{});var Se=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Ja,Ya,Za,Qa,tc,ec,nc,ic;(function(){var e,n=Object.defineProperty;function r(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof Se=="object"&&Se];for(var i=0;i<t.length;++i){var o=t[i];if(o&&o.Math==Math)return o}throw Error("Cannot find global object")}var s=r(this);function c(t,i){if(i)t:{var o=s;t=t.split(".");for(var a=0;a<t.length-1;a++){var y=t[a];if(!(y in o))break t;o=o[y]}t=t[t.length-1],a=o[t],i=i(a),i!=a&&i!=null&&n(o,t,{configurable:!0,writable:!0,value:i})}}c("Symbol.dispose",function(t){return t||Symbol("Symbol.dispose")}),c("Array.prototype.values",function(t){return t||function(){return this[Symbol.iterator]()}}),c("Object.entries",function(t){return t||function(i){var o=[],a;for(a in i)Object.prototype.hasOwnProperty.call(i,a)&&o.push([a,i[a]]);return o}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var d=d||{},f=this||self;function E(t){var i=typeof t;return i=="object"&&t!=null||i=="function"}function S(t,i,o){return t.call.apply(t.bind,arguments)}function v(t,i,o){return v=S,v.apply(null,arguments)}function P(t,i){var o=Array.prototype.slice.call(arguments,1);return function(){var a=o.slice();return a.push.apply(a,arguments),t.apply(this,a)}}function I(t,i){function o(){}o.prototype=i.prototype,t.Z=i.prototype,t.prototype=new o,t.prototype.constructor=t,t.Ob=function(a,y,b){for(var T=Array(arguments.length-2),A=2;A<arguments.length;A++)T[A-2]=arguments[A];return i.prototype[y].apply(a,T)}}var G=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?t=>t&&AsyncContext.Snapshot.wrap(t):t=>t;function W(t){const i=t.length;if(i>0){const o=Array(i);for(let a=0;a<i;a++)o[a]=t[a];return o}return[]}function H(t,i){for(let a=1;a<arguments.length;a++){const y=arguments[a];var o=typeof y;if(o=o!="object"?o:y?Array.isArray(y)?"array":o:"null",o=="array"||o=="object"&&typeof y.length=="number"){o=t.length||0;const b=y.length||0;t.length=o+b;for(let T=0;T<b;T++)t[o+T]=y[T]}else t.push(y)}}class L{constructor(i,o){this.i=i,this.j=o,this.h=0,this.g=null}get(){let i;return this.h>0?(this.h--,i=this.g,this.g=i.next,i.next=null):i=this.i(),i}}function N(t){f.setTimeout(()=>{throw t},0)}function St(){var t=g;let i=null;return t.g&&(i=t.g,t.g=t.g.next,t.g||(t.h=null),i.next=null),i}class It{constructor(){this.h=this.g=null}add(i,o){const a=it.get();a.set(i,o),this.h?this.h.next=a:this.g=a,this.h=a}}var it=new L(()=>new At,t=>t.reset());class At{constructor(){this.next=this.g=this.h=null}set(i,o){this.h=i,this.g=o,this.next=null}reset(){this.next=this.g=this.h=null}}let rt,z=!1,g=new It,h=()=>{const t=Promise.resolve(void 0);rt=()=>{t.then(u)}};function u(){for(var t;t=St();){try{t.h.call(t.g)}catch(o){N(o)}var i=it;i.j(t),i.h<100&&(i.h++,t.next=i.g,i.g=t)}z=!1}function m(){this.u=this.u,this.C=this.C}m.prototype.u=!1,m.prototype.dispose=function(){this.u||(this.u=!0,this.N())},m.prototype[Symbol.dispose]=function(){this.dispose()},m.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function p(t,i){this.type=t,this.g=this.target=i,this.defaultPrevented=!1}p.prototype.h=function(){this.defaultPrevented=!0};var w=(function(){if(!f.addEventListener||!Object.defineProperty)return!1;var t=!1,i=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const o=()=>{};f.addEventListener("test",o,i),f.removeEventListener("test",o,i)}catch{}return t})();function l(t){return/^[\s\xa0]*$/.test(t)}function U(t,i){p.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t&&this.init(t,i)}I(U,p),U.prototype.init=function(t,i){const o=this.type=t.type,a=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;this.target=t.target||t.srcElement,this.g=i,i=t.relatedTarget,i||(o=="mouseover"?i=t.fromElement:o=="mouseout"&&(i=t.toElement)),this.relatedTarget=i,a?(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=t.pointerType,this.state=t.state,this.i=t,t.defaultPrevented&&U.Z.h.call(this)},U.prototype.h=function(){U.Z.h.call(this);const t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var dt="closure_listenable_"+(Math.random()*1e6|0),uo=0;function fo(t,i,o,a,y){this.listener=t,this.proxy=null,this.src=i,this.type=o,this.capture=!!a,this.ha=y,this.key=++uo,this.da=this.fa=!1}function se(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function ae(t,i,o){for(const a in t)i.call(o,t[a],a,t)}function po(t,i){for(const o in t)i.call(void 0,t[o],o,t)}function xn(t){const i={};for(const o in t)i[o]=t[o];return i}const Bn="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function jn(t,i){let o,a;for(let y=1;y<arguments.length;y++){a=arguments[y];for(o in a)t[o]=a[o];for(let b=0;b<Bn.length;b++)o=Bn[b],Object.prototype.hasOwnProperty.call(a,o)&&(t[o]=a[o])}}function ce(t){this.src=t,this.g={},this.h=0}ce.prototype.add=function(t,i,o,a,y){const b=t.toString();t=this.g[b],t||(t=this.g[b]=[],this.h++);const T=Be(t,i,a,y);return T>-1?(i=t[T],o||(i.fa=!1)):(i=new fo(i,this.src,b,!!a,y),i.fa=o,t.push(i)),i};function xe(t,i){const o=i.type;if(o in t.g){var a=t.g[o],y=Array.prototype.indexOf.call(a,i,void 0),b;(b=y>=0)&&Array.prototype.splice.call(a,y,1),b&&(se(i),t.g[o].length==0&&(delete t.g[o],t.h--))}}function Be(t,i,o,a){for(let y=0;y<t.length;++y){const b=t[y];if(!b.da&&b.listener==i&&b.capture==!!o&&b.ha==a)return y}return-1}var je="closure_lm_"+(Math.random()*1e6|0),Fe={};function Fn(t,i,o,a,y){if(Array.isArray(i)){for(let b=0;b<i.length;b++)Fn(t,i[b],o,a,y);return null}return o=Ln(o),t&&t[dt]?t.J(i,o,E(a)?!!a.capture:!1,y):go(t,i,o,!1,a,y)}function go(t,i,o,a,y,b){if(!i)throw Error("Invalid event type");const T=E(y)?!!y.capture:!!y;let A=He(t);if(A||(t[je]=A=new ce(t)),o=A.add(i,o,a,T,b),o.proxy)return o;if(a=mo(),o.proxy=a,a.src=t,a.listener=o,t.addEventListener)w||(y=T),y===void 0&&(y=!1),t.addEventListener(i.toString(),a,y);else if(t.attachEvent)t.attachEvent(Hn(i.toString()),a);else if(t.addListener&&t.removeListener)t.addListener(a);else throw Error("addEventListener and attachEvent are unavailable.");return o}function mo(){function t(o){return i.call(t.src,t.listener,o)}const i=yo;return t}function $n(t,i,o,a,y){if(Array.isArray(i))for(var b=0;b<i.length;b++)$n(t,i[b],o,a,y);else a=E(a)?!!a.capture:!!a,o=Ln(o),t&&t[dt]?(t=t.i,b=String(i).toString(),b in t.g&&(i=t.g[b],o=Be(i,o,a,y),o>-1&&(se(i[o]),Array.prototype.splice.call(i,o,1),i.length==0&&(delete t.g[b],t.h--)))):t&&(t=He(t))&&(i=t.g[i.toString()],t=-1,i&&(t=Be(i,o,a,y)),(o=t>-1?i[t]:null)&&$e(o))}function $e(t){if(typeof t!="number"&&t&&!t.da){var i=t.src;if(i&&i[dt])xe(i.i,t);else{var o=t.type,a=t.proxy;i.removeEventListener?i.removeEventListener(o,a,t.capture):i.detachEvent?i.detachEvent(Hn(o),a):i.addListener&&i.removeListener&&i.removeListener(a),(o=He(i))?(xe(o,t),o.h==0&&(o.src=null,i[je]=null)):se(t)}}}function Hn(t){return t in Fe?Fe[t]:Fe[t]="on"+t}function yo(t,i){if(t.da)t=!0;else{i=new U(i,this);const o=t.listener,a=t.ha||t.src;t.fa&&$e(t),t=o.call(a,i)}return t}function He(t){return t=t[je],t instanceof ce?t:null}var Le="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ln(t){return typeof t=="function"?t:(t[Le]||(t[Le]=function(i){return t.handleEvent(i)}),t[Le])}function B(){m.call(this),this.i=new ce(this),this.M=this,this.G=null}I(B,m),B.prototype[dt]=!0,B.prototype.removeEventListener=function(t,i,o,a){$n(this,t,i,o,a)};function F(t,i){var o,a=t.G;if(a)for(o=[];a;a=a.G)o.push(a);if(t=t.M,a=i.type||i,typeof i=="string")i=new p(i,t);else if(i instanceof p)i.target=i.target||t;else{var y=i;i=new p(a,t),jn(i,y)}y=!0;let b,T;if(o)for(T=o.length-1;T>=0;T--)b=i.g=o[T],y=he(b,a,!0,i)&&y;if(b=i.g=t,y=he(b,a,!0,i)&&y,y=he(b,a,!1,i)&&y,o)for(T=0;T<o.length;T++)b=i.g=o[T],y=he(b,a,!1,i)&&y}B.prototype.N=function(){if(B.Z.N.call(this),this.i){var t=this.i;for(const i in t.g){const o=t.g[i];for(let a=0;a<o.length;a++)se(o[a]);delete t.g[i],t.h--}}this.G=null},B.prototype.J=function(t,i,o,a){return this.i.add(String(t),i,!1,o,a)},B.prototype.K=function(t,i,o,a){return this.i.add(String(t),i,!0,o,a)};function he(t,i,o,a){if(i=t.i.g[String(i)],!i)return!0;i=i.concat();let y=!0;for(let b=0;b<i.length;++b){const T=i[b];if(T&&!T.da&&T.capture==o){const A=T.listener,M=T.ha||T.src;T.fa&&xe(t.i,T),y=A.call(M,a)!==!1&&y}}return y&&!a.defaultPrevented}function wo(t,i){if(typeof t!="function")if(t&&typeof t.handleEvent=="function")t=v(t.handleEvent,t);else throw Error("Invalid listener argument");return Number(i)>2147483647?-1:f.setTimeout(t,i||0)}function Un(t){t.g=wo(()=>{t.g=null,t.i&&(t.i=!1,Un(t))},t.l);const i=t.h;t.h=null,t.m.apply(null,i)}class bo extends m{constructor(i,o){super(),this.m=i,this.l=o,this.h=null,this.i=!1,this.g=null}j(i){this.h=arguments,this.g?this.i=!0:Un(this)}N(){super.N(),this.g&&(f.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Bt(t){m.call(this),this.h=t,this.g={}}I(Bt,m);var Kn=[];function zn(t){ae(t.g,function(i,o){this.g.hasOwnProperty(o)&&$e(i)},t),t.g={}}Bt.prototype.N=function(){Bt.Z.N.call(this),zn(this)},Bt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ue=f.JSON.stringify,vo=f.JSON.parse,Eo=class{stringify(t){return f.JSON.stringify(t,void 0)}parse(t){return f.JSON.parse(t,void 0)}};function Wn(){}function Vn(){}var jt={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Ke(){p.call(this,"d")}I(Ke,p);function ze(){p.call(this,"c")}I(ze,p);var pt={},qn=null;function le(){return qn=qn||new B}pt.Ia="serverreachability";function Gn(t){p.call(this,pt.Ia,t)}I(Gn,p);function Ft(t){const i=le();F(i,new Gn(i))}pt.STAT_EVENT="statevent";function Xn(t,i){p.call(this,pt.STAT_EVENT,t),this.stat=i}I(Xn,p);function $(t){const i=le();F(i,new Xn(i,t))}pt.Ja="timingevent";function Jn(t,i){p.call(this,pt.Ja,t),this.size=i}I(Jn,p);function $t(t,i){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return f.setTimeout(function(){t()},i)}function Ht(){this.g=!0}Ht.prototype.ua=function(){this.g=!1};function To(t,i,o,a,y,b){t.info(function(){if(t.g)if(b){var T="",A=b.split("&");for(let k=0;k<A.length;k++){var M=A[k].split("=");if(M.length>1){const x=M[0];M=M[1];const J=x.split("_");T=J.length>=2&&J[1]=="type"?T+(x+"="+M+"&"):T+(x+"=redacted&")}}}else T=null;else T=b;return"XMLHTTP REQ ("+a+") [attempt "+y+"]: "+i+`
`+o+`
`+T})}function So(t,i,o,a,y,b,T){t.info(function(){return"XMLHTTP RESP ("+a+") [ attempt "+y+"]: "+i+`
`+o+`
`+b+" "+T})}function _t(t,i,o,a){t.info(function(){return"XMLHTTP TEXT ("+i+"): "+Ao(t,o)+(a?" "+a:"")})}function Io(t,i){t.info(function(){return"TIMEOUT: "+i})}Ht.prototype.info=function(){};function Ao(t,i){if(!t.g)return i;if(!i)return null;try{const b=JSON.parse(i);if(b){for(t=0;t<b.length;t++)if(Array.isArray(b[t])){var o=b[t];if(!(o.length<2)){var a=o[1];if(Array.isArray(a)&&!(a.length<1)){var y=a[0];if(y!="noop"&&y!="stop"&&y!="close")for(let T=1;T<a.length;T++)a[T]=""}}}}return Ue(b)}catch{return i}}var ue={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Yn={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Zn;function We(){}I(We,Wn),We.prototype.g=function(){return new XMLHttpRequest},Zn=new We;function Lt(t){return encodeURIComponent(String(t))}function _o(t){var i=1;t=t.split(":");const o=[];for(;i>0&&t.length;)o.push(t.shift()),i--;return t.length&&o.push(t.join(":")),o}function ot(t,i,o,a){this.j=t,this.i=i,this.l=o,this.S=a||1,this.V=new Bt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Qn}function Qn(){this.i=null,this.g="",this.h=!1}var ti={},Ve={};function qe(t,i,o){t.M=1,t.A=de(X(i)),t.u=o,t.R=!0,ei(t,null)}function ei(t,i){t.F=Date.now(),fe(t),t.B=X(t.A);var o=t.B,a=t.S;Array.isArray(a)||(a=[String(a)]),pi(o.i,"t",a),t.C=0,o=t.j.L,t.h=new Qn,t.g=Pi(t.j,o?i:null,!t.u),t.P>0&&(t.O=new bo(v(t.Y,t,t.g),t.P)),i=t.V,o=t.g,a=t.ba;var y="readystatechange";Array.isArray(y)||(y&&(Kn[0]=y.toString()),y=Kn);for(let b=0;b<y.length;b++){const T=Fn(o,y[b],a||i.handleEvent,!1,i.h||i);if(!T)break;i.g[T.key]=T}i=t.J?xn(t.J):{},t.u?(t.v||(t.v="POST"),i["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.B,t.v,t.u,i)):(t.v="GET",t.g.ea(t.B,t.v,null,i)),Ft(),To(t.i,t.v,t.B,t.l,t.S,t.u)}ot.prototype.ba=function(t){t=t.target;const i=this.O;i&&ct(t)==3?i.j():this.Y(t)},ot.prototype.Y=function(t){try{if(t==this.g)t:{const A=ct(this.g),M=this.g.ya(),k=this.g.ca();if(!(A<3)&&(A!=3||this.g&&(this.h.h||this.g.la()||Ei(this.g)))){this.K||A!=4||M==7||(M==8||k<=0?Ft(3):Ft(2)),Ge(this);var i=this.g.ca();this.X=i;var o=ko(this);if(this.o=i==200,So(this.i,this.v,this.B,this.l,this.S,A,i),this.o){if(this.U&&!this.L){e:{if(this.g){var a,y=this.g;if((a=y.g?y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!l(a)){var b=a;break e}}b=null}if(t=b)_t(this.i,this.l,t,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Xe(this,t);else{this.o=!1,this.m=3,$(12),gt(this),Ut(this);break t}}if(this.R){t=!0;let x;for(;!this.K&&this.C<o.length;)if(x=Co(this,o),x==Ve){A==4&&(this.m=4,$(14),t=!1),_t(this.i,this.l,null,"[Incomplete Response]");break}else if(x==ti){this.m=4,$(15),_t(this.i,this.l,o,"[Invalid Chunk]"),t=!1;break}else _t(this.i,this.l,x,null),Xe(this,x);if(ni(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),A!=4||o.length!=0||this.h.h||(this.m=1,$(16),t=!1),this.o=this.o&&t,!t)_t(this.i,this.l,o,"[Invalid Chunked Response]"),gt(this),Ut(this);else if(o.length>0&&!this.W){this.W=!0;var T=this.j;T.g==this&&T.aa&&!T.P&&(T.j.info("Great, no buffering proxy detected. Bytes received: "+o.length),rn(T),T.P=!0,$(11))}}else _t(this.i,this.l,o,null),Xe(this,o);A==4&&gt(this),this.o&&!this.K&&(A==4?Ci(this.j,this):(this.o=!1,fe(this)))}else Uo(this.g),i==400&&o.indexOf("Unknown SID")>0?(this.m=3,$(12)):(this.m=0,$(13)),gt(this),Ut(this)}}}catch{}finally{}};function ko(t){if(!ni(t))return t.g.la();const i=Ei(t.g);if(i==="")return"";let o="";const a=i.length,y=ct(t.g)==4;if(!t.h.i){if(typeof TextDecoder>"u")return gt(t),Ut(t),"";t.h.i=new f.TextDecoder}for(let b=0;b<a;b++)t.h.h=!0,o+=t.h.i.decode(i[b],{stream:!(y&&b==a-1)});return i.length=0,t.h.g+=o,t.C=0,t.h.g}function ni(t){return t.g?t.v=="GET"&&t.M!=2&&t.j.Aa:!1}function Co(t,i){var o=t.C,a=i.indexOf(`
`,o);return a==-1?Ve:(o=Number(i.substring(o,a)),isNaN(o)?ti:(a+=1,a+o>i.length?Ve:(i=i.slice(a,a+o),t.C=a+o,i)))}ot.prototype.cancel=function(){this.K=!0,gt(this)};function fe(t){t.T=Date.now()+t.H,ii(t,t.H)}function ii(t,i){if(t.D!=null)throw Error("WatchDog timer not null");t.D=$t(v(t.aa,t),i)}function Ge(t){t.D&&(f.clearTimeout(t.D),t.D=null)}ot.prototype.aa=function(){this.D=null;const t=Date.now();t-this.T>=0?(Io(this.i,this.B),this.M!=2&&(Ft(),$(17)),gt(this),this.m=2,Ut(this)):ii(this,this.T-t)};function Ut(t){t.j.I==0||t.K||Ci(t.j,t)}function gt(t){Ge(t);var i=t.O;i&&typeof i.dispose=="function"&&i.dispose(),t.O=null,zn(t.V),t.g&&(i=t.g,t.g=null,i.abort(),i.dispose())}function Xe(t,i){try{var o=t.j;if(o.I!=0&&(o.g==t||Je(o.h,t))){if(!t.L&&Je(o.h,t)&&o.I==3){try{var a=o.Ba.g.parse(i)}catch{a=null}if(Array.isArray(a)&&a.length==3){var y=a;if(y[0]==0){t:if(!o.v){if(o.g)if(o.g.F+3e3<t.F)we(o),me(o);else break t;nn(o),$(18)}}else o.xa=y[1],0<o.xa-o.K&&y[2]<37500&&o.F&&o.A==0&&!o.C&&(o.C=$t(v(o.Va,o),6e3));si(o.h)<=1&&o.ta&&(o.ta=void 0)}else yt(o,11)}else if((t.L||o.g==t)&&we(o),!l(i))for(y=o.Ba.g.parse(i),i=0;i<y.length;i++){let k=y[i];const x=k[0];if(!(x<=o.K))if(o.K=x,k=k[1],o.I==2)if(k[0]=="c"){o.M=k[1],o.ba=k[2];const J=k[3];J!=null&&(o.ka=J,o.j.info("VER="+o.ka));const wt=k[4];wt!=null&&(o.za=wt,o.j.info("SVER="+o.za));const ht=k[5];ht!=null&&typeof ht=="number"&&ht>0&&(a=1.5*ht,o.O=a,o.j.info("backChannelRequestTimeoutMs_="+a)),a=o;const lt=t.g;if(lt){const ve=lt.g?lt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ve){var b=a.h;b.g||ve.indexOf("spdy")==-1&&ve.indexOf("quic")==-1&&ve.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Ye(b,b.h),b.h=null))}if(a.G){const on=lt.g?lt.g.getResponseHeader("X-HTTP-Session-Id"):null;on&&(a.wa=on,C(a.J,a.G,on))}}o.I=3,o.l&&o.l.ra(),o.aa&&(o.T=Date.now()-t.F,o.j.info("Handshake RTT: "+o.T+"ms")),a=o;var T=t;if(a.na=Oi(a,a.L?a.ba:null,a.W),T.L){ai(a.h,T);var A=T,M=a.O;M&&(A.H=M),A.D&&(Ge(A),fe(A)),a.g=T}else _i(a);o.i.length>0&&ye(o)}else k[0]!="stop"&&k[0]!="close"||yt(o,7);else o.I==3&&(k[0]=="stop"||k[0]=="close"?k[0]=="stop"?yt(o,7):en(o):k[0]!="noop"&&o.l&&o.l.qa(k),o.A=0)}}Ft(4)}catch{}}var Ro=class{constructor(t,i){this.g=t,this.map=i}};function ri(t){this.l=t||10,f.PerformanceNavigationTiming?(t=f.performance.getEntriesByType("navigation"),t=t.length>0&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(f.chrome&&f.chrome.loadTimes&&f.chrome.loadTimes()&&f.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function oi(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function si(t){return t.h?1:t.g?t.g.size:0}function Je(t,i){return t.h?t.h==i:t.g?t.g.has(i):!1}function Ye(t,i){t.g?t.g.add(i):t.h=i}function ai(t,i){t.h&&t.h==i?t.h=null:t.g&&t.g.has(i)&&t.g.delete(i)}ri.prototype.cancel=function(){if(this.i=ci(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function ci(t){if(t.h!=null)return t.i.concat(t.h.G);if(t.g!=null&&t.g.size!==0){let i=t.i;for(const o of t.g.values())i=i.concat(o.G);return i}return W(t.i)}var hi=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Do(t,i){if(t){t=t.split("&");for(let o=0;o<t.length;o++){const a=t[o].indexOf("=");let y,b=null;a>=0?(y=t[o].substring(0,a),b=t[o].substring(a+1)):y=t[o],i(y,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function st(t){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let i;t instanceof st?(this.l=t.l,Kt(this,t.j),this.o=t.o,this.g=t.g,zt(this,t.u),this.h=t.h,Ze(this,gi(t.i)),this.m=t.m):t&&(i=String(t).match(hi))?(this.l=!1,Kt(this,i[1]||"",!0),this.o=Wt(i[2]||""),this.g=Wt(i[3]||"",!0),zt(this,i[4]),this.h=Wt(i[5]||"",!0),Ze(this,i[6]||"",!0),this.m=Wt(i[7]||"")):(this.l=!1,this.i=new qt(null,this.l))}st.prototype.toString=function(){const t=[];var i=this.j;i&&t.push(Vt(i,li,!0),":");var o=this.g;return(o||i=="file")&&(t.push("//"),(i=this.o)&&t.push(Vt(i,li,!0),"@"),t.push(Lt(o).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o=this.u,o!=null&&t.push(":",String(o))),(o=this.h)&&(this.g&&o.charAt(0)!="/"&&t.push("/"),t.push(Vt(o,o.charAt(0)=="/"?No:Po,!0))),(o=this.i.toString())&&t.push("?",o),(o=this.m)&&t.push("#",Vt(o,xo)),t.join("")},st.prototype.resolve=function(t){const i=X(this);let o=!!t.j;o?Kt(i,t.j):o=!!t.o,o?i.o=t.o:o=!!t.g,o?i.g=t.g:o=t.u!=null;var a=t.h;if(o)zt(i,t.u);else if(o=!!t.h){if(a.charAt(0)!="/")if(this.g&&!this.h)a="/"+a;else{var y=i.h.lastIndexOf("/");y!=-1&&(a=i.h.slice(0,y+1)+a)}if(y=a,y==".."||y==".")a="";else if(y.indexOf("./")!=-1||y.indexOf("/.")!=-1){a=y.lastIndexOf("/",0)==0,y=y.split("/");const b=[];for(let T=0;T<y.length;){const A=y[T++];A=="."?a&&T==y.length&&b.push(""):A==".."?((b.length>1||b.length==1&&b[0]!="")&&b.pop(),a&&T==y.length&&b.push("")):(b.push(A),a=!0)}a=b.join("/")}else a=y}return o?i.h=a:o=t.i.toString()!=="",o?Ze(i,gi(t.i)):o=!!t.m,o&&(i.m=t.m),i};function X(t){return new st(t)}function Kt(t,i,o){t.j=o?Wt(i,!0):i,t.j&&(t.j=t.j.replace(/:$/,""))}function zt(t,i){if(i){if(i=Number(i),isNaN(i)||i<0)throw Error("Bad port number "+i);t.u=i}else t.u=null}function Ze(t,i,o){i instanceof qt?(t.i=i,Bo(t.i,t.l)):(o||(i=Vt(i,Mo)),t.i=new qt(i,t.l))}function C(t,i,o){t.i.set(i,o)}function de(t){return C(t,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),t}function Wt(t,i){return t?i?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Vt(t,i,o){return typeof t=="string"?(t=encodeURI(t).replace(i,Oo),o&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function Oo(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var li=/[#\/\?@]/g,Po=/[#\?:]/g,No=/[#\?]/g,Mo=/[#\?@]/g,xo=/#/g;function qt(t,i){this.h=this.g=null,this.i=t||null,this.j=!!i}function mt(t){t.g||(t.g=new Map,t.h=0,t.i&&Do(t.i,function(i,o){t.add(decodeURIComponent(i.replace(/\+/g," ")),o)}))}e=qt.prototype,e.add=function(t,i){mt(this),this.i=null,t=kt(this,t);let o=this.g.get(t);return o||this.g.set(t,o=[]),o.push(i),this.h+=1,this};function ui(t,i){mt(t),i=kt(t,i),t.g.has(i)&&(t.i=null,t.h-=t.g.get(i).length,t.g.delete(i))}function fi(t,i){return mt(t),i=kt(t,i),t.g.has(i)}e.forEach=function(t,i){mt(this),this.g.forEach(function(o,a){o.forEach(function(y){t.call(i,y,a,this)},this)},this)};function di(t,i){mt(t);let o=[];if(typeof i=="string")fi(t,i)&&(o=o.concat(t.g.get(kt(t,i))));else for(t=Array.from(t.g.values()),i=0;i<t.length;i++)o=o.concat(t[i]);return o}e.set=function(t,i){return mt(this),this.i=null,t=kt(this,t),fi(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[i]),this.h+=1,this},e.get=function(t,i){return t?(t=di(this,t),t.length>0?String(t[0]):i):i};function pi(t,i,o){ui(t,i),o.length>0&&(t.i=null,t.g.set(kt(t,i),W(o)),t.h+=o.length)}e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],i=Array.from(this.g.keys());for(let a=0;a<i.length;a++){var o=i[a];const y=Lt(o);o=di(this,o);for(let b=0;b<o.length;b++){let T=y;o[b]!==""&&(T+="="+Lt(o[b])),t.push(T)}}return this.i=t.join("&")};function gi(t){const i=new qt;return i.i=t.i,t.g&&(i.g=new Map(t.g),i.h=t.h),i}function kt(t,i){return i=String(i),t.j&&(i=i.toLowerCase()),i}function Bo(t,i){i&&!t.j&&(mt(t),t.i=null,t.g.forEach(function(o,a){const y=a.toLowerCase();a!=y&&(ui(this,a),pi(this,y,o))},t)),t.j=i}function jo(t,i){const o=new Ht;if(f.Image){const a=new Image;a.onload=P(at,o,"TestLoadImage: loaded",!0,i,a),a.onerror=P(at,o,"TestLoadImage: error",!1,i,a),a.onabort=P(at,o,"TestLoadImage: abort",!1,i,a),a.ontimeout=P(at,o,"TestLoadImage: timeout",!1,i,a),f.setTimeout(function(){a.ontimeout&&a.ontimeout()},1e4),a.src=t}else i(!1)}function Fo(t,i){const o=new Ht,a=new AbortController,y=setTimeout(()=>{a.abort(),at(o,"TestPingServer: timeout",!1,i)},1e4);fetch(t,{signal:a.signal}).then(b=>{clearTimeout(y),b.ok?at(o,"TestPingServer: ok",!0,i):at(o,"TestPingServer: server error",!1,i)}).catch(()=>{clearTimeout(y),at(o,"TestPingServer: error",!1,i)})}function at(t,i,o,a,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),a(o)}catch{}}function $o(){this.g=new Eo}function Qe(t){this.i=t.Sb||null,this.h=t.ab||!1}I(Qe,Wn),Qe.prototype.g=function(){return new pe(this.i,this.h)};function pe(t,i){B.call(this),this.H=t,this.o=i,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}I(pe,B),e=pe.prototype,e.open=function(t,i){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=t,this.D=i,this.readyState=1,Xt(this)},e.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const i={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};t&&(i.body=t),(this.H||f).fetch(new Request(this.D,i)).then(this.Pa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Gt(this)),this.readyState=0},e.Pa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Xt(this)),this.g&&(this.readyState=3,Xt(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof f.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;mi(this)}else t.text().then(this.Oa.bind(this),this.ga.bind(this))};function mi(t){t.j.read().then(t.Ma.bind(t)).catch(t.ga.bind(t))}e.Ma=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var i=t.value?t.value:new Uint8Array(0);(i=this.B.decode(i,{stream:!t.done}))&&(this.response=this.responseText+=i)}t.done?Gt(this):Xt(this),this.readyState==3&&mi(this)}},e.Oa=function(t){this.g&&(this.response=this.responseText=t,Gt(this))},e.Na=function(t){this.g&&(this.response=t,Gt(this))},e.ga=function(){this.g&&Gt(this)};function Gt(t){t.readyState=4,t.l=null,t.j=null,t.B=null,Xt(t)}e.setRequestHeader=function(t,i){this.A.append(t,i)},e.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],i=this.h.entries();for(var o=i.next();!o.done;)o=o.value,t.push(o[0]+": "+o[1]),o=i.next();return t.join(`\r
`)};function Xt(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(pe.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function yi(t){let i="";return ae(t,function(o,a){i+=a,i+=":",i+=o,i+=`\r
`}),i}function tn(t,i,o){t:{for(a in o){var a=!1;break t}a=!0}a||(o=yi(o),typeof t=="string"?o!=null&&Lt(o):C(t,i,o))}function D(t){B.call(this),this.headers=new Map,this.L=t||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}I(D,B);var Ho=/^https?$/i,Lo=["POST","PUT"];e=D.prototype,e.Fa=function(t){this.H=t},e.ea=function(t,i,o,a){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);i=i?i.toUpperCase():"GET",this.D=t,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Zn.g(),this.g.onreadystatechange=G(v(this.Ca,this));try{this.B=!0,this.g.open(i,String(t),!0),this.B=!1}catch(b){wi(this,b);return}if(t=o||"",o=new Map(this.headers),a)if(Object.getPrototypeOf(a)===Object.prototype)for(var y in a)o.set(y,a[y]);else if(typeof a.keys=="function"&&typeof a.get=="function")for(const b of a.keys())o.set(b,a.get(b));else throw Error("Unknown input type for opt_headers: "+String(a));a=Array.from(o.keys()).find(b=>b.toLowerCase()=="content-type"),y=f.FormData&&t instanceof f.FormData,!(Array.prototype.indexOf.call(Lo,i,void 0)>=0)||a||y||o.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,T]of o)this.g.setRequestHeader(b,T);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(t),this.v=!1}catch(b){wi(this,b)}};function wi(t,i){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=i,t.o=5,bi(t),ge(t)}function bi(t){t.A||(t.A=!0,F(t,"complete"),F(t,"error"))}e.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=t||7,F(this,"complete"),F(this,"abort"),ge(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ge(this,!0)),D.Z.N.call(this)},e.Ca=function(){this.u||(this.B||this.v||this.j?vi(this):this.Xa())},e.Xa=function(){vi(this)};function vi(t){if(t.h&&typeof d<"u"){if(t.v&&ct(t)==4)setTimeout(t.Ca.bind(t),0);else if(F(t,"readystatechange"),ct(t)==4){t.h=!1;try{const b=t.ca();t:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var i=!0;break t;default:i=!1}var o;if(!(o=i)){var a;if(a=b===0){let T=String(t.D).match(hi)[1]||null;!T&&f.self&&f.self.location&&(T=f.self.location.protocol.slice(0,-1)),a=!Ho.test(T?T.toLowerCase():"")}o=a}if(o)F(t,"complete"),F(t,"success");else{t.o=6;try{var y=ct(t)>2?t.g.statusText:""}catch{y=""}t.l=y+" ["+t.ca()+"]",bi(t)}}finally{ge(t)}}}}function ge(t,i){if(t.g){t.m&&(clearTimeout(t.m),t.m=null);const o=t.g;t.g=null,i||F(t,"ready");try{o.onreadystatechange=null}catch{}}}e.isActive=function(){return!!this.g};function ct(t){return t.g?t.g.readyState:0}e.ca=function(){try{return ct(this)>2?this.g.status:-1}catch{return-1}},e.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},e.La=function(t){if(this.g){var i=this.g.responseText;return t&&i.indexOf(t)==0&&(i=i.substring(t.length)),vo(i)}};function Ei(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.F){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function Uo(t){const i={};t=(t.g&&ct(t)>=2&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let a=0;a<t.length;a++){if(l(t[a]))continue;var o=_o(t[a]);const y=o[0];if(o=o[1],typeof o!="string")continue;o=o.trim();const b=i[y]||[];i[y]=b,b.push(o)}po(i,function(a){return a.join(", ")})}e.ya=function(){return this.o},e.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Jt(t,i,o){return o&&o.internalChannelParams&&o.internalChannelParams[t]||i}function Ti(t){this.za=0,this.i=[],this.j=new Ht,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Jt("failFast",!1,t),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Jt("baseRetryDelayMs",5e3,t),this.Za=Jt("retryDelaySeedMs",1e4,t),this.Ta=Jt("forwardChannelMaxRetries",2,t),this.va=Jt("forwardChannelRequestTimeoutMs",2e4,t),this.ma=t&&t.xmlHttpFactory||void 0,this.Ua=t&&t.Rb||void 0,this.Aa=t&&t.useFetchStreams||!1,this.O=void 0,this.L=t&&t.supportsCrossDomainXhr||!1,this.M="",this.h=new ri(t&&t.concurrentRequestLimit),this.Ba=new $o,this.S=t&&t.fastHandshake||!1,this.R=t&&t.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=t&&t.Pb||!1,t&&t.ua&&this.j.ua(),t&&t.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&t&&t.detectBufferingProxy||!1,this.ia=void 0,t&&t.longPollingTimeout&&t.longPollingTimeout>0&&(this.ia=t.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}e=Ti.prototype,e.ka=8,e.I=1,e.connect=function(t,i,o,a){$(0),this.W=t,this.H=i||{},o&&a!==void 0&&(this.H.OSID=o,this.H.OAID=a),this.F=this.X,this.J=Oi(this,null,this.W),ye(this)};function en(t){if(Si(t),t.I==3){var i=t.V++,o=X(t.J);if(C(o,"SID",t.M),C(o,"RID",i),C(o,"TYPE","terminate"),Yt(t,o),i=new ot(t,t.j,i),i.M=2,i.A=de(X(o)),o=!1,f.navigator&&f.navigator.sendBeacon)try{o=f.navigator.sendBeacon(i.A.toString(),"")}catch{}!o&&f.Image&&(new Image().src=i.A,o=!0),o||(i.g=Pi(i.j,null),i.g.ea(i.A)),i.F=Date.now(),fe(i)}Di(t)}function me(t){t.g&&(rn(t),t.g.cancel(),t.g=null)}function Si(t){me(t),t.v&&(f.clearTimeout(t.v),t.v=null),we(t),t.h.cancel(),t.m&&(typeof t.m=="number"&&f.clearTimeout(t.m),t.m=null)}function ye(t){if(!oi(t.h)&&!t.m){t.m=!0;var i=t.Ea;rt||h(),z||(rt(),z=!0),g.add(i,t),t.D=0}}function Ko(t,i){return si(t.h)>=t.h.j-(t.m?1:0)?!1:t.m?(t.i=i.G.concat(t.i),!0):t.I==1||t.I==2||t.D>=(t.Sa?0:t.Ta)?!1:(t.m=$t(v(t.Ea,t,i),Ri(t,t.D)),t.D++,!0)}e.Ea=function(t){if(this.m)if(this.m=null,this.I==1){if(!t){this.V=Math.floor(Math.random()*1e5),t=this.V++;const y=new ot(this,this.j,t);let b=this.o;if(this.U&&(b?(b=xn(b),jn(b,this.U)):b=this.U),this.u!==null||this.R||(y.J=b,b=null),this.S)t:{for(var i=0,o=0;o<this.i.length;o++){e:{var a=this.i[o];if("__data__"in a.map&&(a=a.map.__data__,typeof a=="string")){a=a.length;break e}a=void 0}if(a===void 0)break;if(i+=a,i>4096){i=o;break t}if(i===4096||o===this.i.length-1){i=o+1;break t}}i=1e3}else i=1e3;i=Ai(this,y,i),o=X(this.J),C(o,"RID",t),C(o,"CVER",22),this.G&&C(o,"X-HTTP-Session-Id",this.G),Yt(this,o),b&&(this.R?i="headers="+Lt(yi(b))+"&"+i:this.u&&tn(o,this.u,b)),Ye(this.h,y),this.Ra&&C(o,"TYPE","init"),this.S?(C(o,"$req",i),C(o,"SID","null"),y.U=!0,qe(y,o,null)):qe(y,o,i),this.I=2}}else this.I==3&&(t?Ii(this,t):this.i.length==0||oi(this.h)||Ii(this))};function Ii(t,i){var o;i?o=i.l:o=t.V++;const a=X(t.J);C(a,"SID",t.M),C(a,"RID",o),C(a,"AID",t.K),Yt(t,a),t.u&&t.o&&tn(a,t.u,t.o),o=new ot(t,t.j,o,t.D+1),t.u===null&&(o.J=t.o),i&&(t.i=i.G.concat(t.i)),i=Ai(t,o,1e3),o.H=Math.round(t.va*.5)+Math.round(t.va*.5*Math.random()),Ye(t.h,o),qe(o,a,i)}function Yt(t,i){t.H&&ae(t.H,function(o,a){C(i,a,o)}),t.l&&ae({},function(o,a){C(i,a,o)})}function Ai(t,i,o){o=Math.min(t.i.length,o);const a=t.l?v(t.l.Ka,t.l,t):null;t:{var y=t.i;let A=-1;for(;;){const M=["count="+o];A==-1?o>0?(A=y[0].g,M.push("ofs="+A)):A=0:M.push("ofs="+A);let k=!0;for(let x=0;x<o;x++){var b=y[x].g;const J=y[x].map;if(b-=A,b<0)A=Math.max(0,y[x].g-100),k=!1;else try{b="req"+b+"_"||"";try{var T=J instanceof Map?J:Object.entries(J);for(const[wt,ht]of T){let lt=ht;E(ht)&&(lt=Ue(ht)),M.push(b+wt+"="+encodeURIComponent(lt))}}catch(wt){throw M.push(b+"type="+encodeURIComponent("_badmap")),wt}}catch{a&&a(J)}}if(k){T=M.join("&");break t}}T=void 0}return t=t.i.splice(0,o),i.G=t,T}function _i(t){if(!t.g&&!t.v){t.Y=1;var i=t.Da;rt||h(),z||(rt(),z=!0),g.add(i,t),t.A=0}}function nn(t){return t.g||t.v||t.A>=3?!1:(t.Y++,t.v=$t(v(t.Da,t),Ri(t,t.A)),t.A++,!0)}e.Da=function(){if(this.v=null,ki(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var t=4*this.T;this.j.info("BP detection timer enabled: "+t),this.B=$t(v(this.Wa,this),t)}},e.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,$(10),me(this),ki(this))};function rn(t){t.B!=null&&(f.clearTimeout(t.B),t.B=null)}function ki(t){t.g=new ot(t,t.j,"rpc",t.Y),t.u===null&&(t.g.J=t.o),t.g.P=0;var i=X(t.na);C(i,"RID","rpc"),C(i,"SID",t.M),C(i,"AID",t.K),C(i,"CI",t.F?"0":"1"),!t.F&&t.ia&&C(i,"TO",t.ia),C(i,"TYPE","xmlhttp"),Yt(t,i),t.u&&t.o&&tn(i,t.u,t.o),t.O&&(t.g.H=t.O);var o=t.g;t=t.ba,o.M=1,o.A=de(X(i)),o.u=null,o.R=!0,ei(o,t)}e.Va=function(){this.C!=null&&(this.C=null,me(this),nn(this),$(19))};function we(t){t.C!=null&&(f.clearTimeout(t.C),t.C=null)}function Ci(t,i){var o=null;if(t.g==i){we(t),rn(t),t.g=null;var a=2}else if(Je(t.h,i))o=i.G,ai(t.h,i),a=1;else return;if(t.I!=0){if(i.o)if(a==1){o=i.u?i.u.length:0,i=Date.now()-i.F;var y=t.D;a=le(),F(a,new Jn(a,o)),ye(t)}else _i(t);else if(y=i.m,y==3||y==0&&i.X>0||!(a==1&&Ko(t,i)||a==2&&nn(t)))switch(o&&o.length>0&&(i=t.h,i.i=i.i.concat(o)),y){case 1:yt(t,5);break;case 4:yt(t,10);break;case 3:yt(t,6);break;default:yt(t,2)}}}function Ri(t,i){let o=t.Qa+Math.floor(Math.random()*t.Za);return t.isActive()||(o*=2),o*i}function yt(t,i){if(t.j.info("Error code "+i),i==2){var o=v(t.bb,t),a=t.Ua;const y=!a;a=new st(a||"//www.google.com/images/cleardot.gif"),f.location&&f.location.protocol=="http"||Kt(a,"https"),de(a),y?jo(a.toString(),o):Fo(a.toString(),o)}else $(2);t.I=0,t.l&&t.l.pa(i),Di(t),Si(t)}e.bb=function(t){t?(this.j.info("Successfully pinged google.com"),$(2)):(this.j.info("Failed to ping google.com"),$(1))};function Di(t){if(t.I=0,t.ja=[],t.l){const i=ci(t.h);(i.length!=0||t.i.length!=0)&&(H(t.ja,i),H(t.ja,t.i),t.h.i.length=0,W(t.i),t.i.length=0),t.l.oa()}}function Oi(t,i,o){var a=o instanceof st?X(o):new st(o);if(a.g!="")i&&(a.g=i+"."+a.g),zt(a,a.u);else{var y=f.location;a=y.protocol,i=i?i+"."+y.hostname:y.hostname,y=+y.port;const b=new st(null);a&&Kt(b,a),i&&(b.g=i),y&&zt(b,y),o&&(b.h=o),a=b}return o=t.G,i=t.wa,o&&i&&C(a,o,i),C(a,"VER",t.ka),Yt(t,a),a}function Pi(t,i,o){if(i&&!t.L)throw Error("Can't create secondary domain capable XhrIo object.");return i=t.Aa&&!t.ma?new D(new Qe({ab:o})):new D(t.ma),i.Fa(t.L),i}e.isActive=function(){return!!this.l&&this.l.isActive(this)};function Ni(){}e=Ni.prototype,e.ra=function(){},e.qa=function(){},e.pa=function(){},e.oa=function(){},e.isActive=function(){return!0},e.Ka=function(){};function be(){}be.prototype.g=function(t,i){return new K(t,i)};function K(t,i){B.call(this),this.g=new Ti(i),this.l=t,this.h=i&&i.messageUrlParams||null,t=i&&i.messageHeaders||null,i&&i.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=i&&i.initMessageHeaders||null,i&&i.messageContentType&&(t?t["X-WebChannel-Content-Type"]=i.messageContentType:t={"X-WebChannel-Content-Type":i.messageContentType}),i&&i.sa&&(t?t["X-WebChannel-Client-Profile"]=i.sa:t={"X-WebChannel-Client-Profile":i.sa}),this.g.U=t,(t=i&&i.Qb)&&!l(t)&&(this.g.u=t),this.A=i&&i.supportsCrossDomainXhr||!1,this.v=i&&i.sendRawJson||!1,(i=i&&i.httpSessionIdParam)&&!l(i)&&(this.g.G=i,t=this.h,t!==null&&i in t&&(t=this.h,i in t&&delete t[i])),this.j=new Ct(this)}I(K,B),K.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},K.prototype.close=function(){en(this.g)},K.prototype.o=function(t){var i=this.g;if(typeof t=="string"){var o={};o.__data__=t,t=o}else this.v&&(o={},o.__data__=Ue(t),t=o);i.i.push(new Ro(i.Ya++,t)),i.I==3&&ye(i)},K.prototype.N=function(){this.g.l=null,delete this.j,en(this.g),delete this.g,K.Z.N.call(this)};function Mi(t){Ke.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var i=t.__sm__;if(i){t:{for(const o in i){t=o;break t}t=void 0}(this.i=t)&&(t=this.i,i=i!==null&&t in i?i[t]:void 0),this.data=i}else this.data=t}I(Mi,Ke);function xi(){ze.call(this),this.status=1}I(xi,ze);function Ct(t){this.g=t}I(Ct,Ni),Ct.prototype.ra=function(){F(this.g,"a")},Ct.prototype.qa=function(t){F(this.g,new Mi(t))},Ct.prototype.pa=function(t){F(this.g,new xi)},Ct.prototype.oa=function(){F(this.g,"b")},be.prototype.createWebChannel=be.prototype.g,K.prototype.send=K.prototype.o,K.prototype.open=K.prototype.m,K.prototype.close=K.prototype.close,ic=function(){return new be},nc=function(){return le()},ec=pt,tc={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ue.NO_ERROR=0,ue.TIMEOUT=8,ue.HTTP_ERROR=6,Qa=ue,Yn.COMPLETE="complete",Za=Yn,Vn.EventType=jt,jt.OPEN="a",jt.CLOSE="b",jt.ERROR="c",jt.MESSAGE="d",B.prototype.listen=B.prototype.J,Ya=Vn,D.prototype.listenOnce=D.prototype.K,D.prototype.getLastError=D.prototype.Ha,D.prototype.getLastErrorCode=D.prototype.ya,D.prototype.getStatus=D.prototype.ca,D.prototype.getResponseJson=D.prototype.La,D.prototype.getResponseText=D.prototype.la,D.prototype.send=D.prototype.ea,D.prototype.setWithCredentials=D.prototype.Fa,Ja=D}).apply(typeof Se<"u"?Se:typeof self<"u"?self:typeof window<"u"?window:{});const Or="@firebase/installations",kn="0.6.22";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pr=1e4,Nr=`w:${kn}`,Mr="FIS_v2",rc="https://firebaseinstallations.googleapis.com/v1",oc=3600*1e3,sc="installations",ac="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cc={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Et=new ne(sc,ac,cc);function xr(e){return e instanceof Pt&&e.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Br({projectId:e}){return`${rc}/projects/${e}/installations`}function jr(e){return{token:e.token,requestStatus:2,expiresIn:lc(e.expiresIn),creationTime:Date.now()}}async function Fr(e,n){const s=(await n.json()).error;return Et.create("request-failed",{requestName:e,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function $r({apiKey:e}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e})}function hc(e,{refreshToken:n}){const r=$r(e);return r.append("Authorization",uc(n)),r}async function Hr(e){const n=await e();return n.status>=500&&n.status<600?e():n}function lc(e){return Number(e.replace("s","000"))}function uc(e){return`${Mr} ${e}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fc({appConfig:e,heartbeatServiceProvider:n},{fid:r}){const s=Br(e),c=$r(e),d=n.getImmediate({optional:!0});if(d){const v=await d.getHeartbeatsHeader();v&&c.append("x-firebase-client",v)}const f={fid:r,authVersion:Mr,appId:e.appId,sdkVersion:Nr},E={method:"POST",headers:c,body:JSON.stringify(f)},S=await Hr(()=>fetch(s,E));if(S.ok){const v=await S.json();return{fid:v.fid||r,registrationStatus:2,refreshToken:v.refreshToken,authToken:jr(v.authToken)}}else throw await Fr("Create Installation",S)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lr(e){return new Promise(n=>{setTimeout(n,e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dc(e){return btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pc=/^[cdef][\w-]{21}$/,bn="";function gc(){try{const e=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(e),e[0]=112+e[0]%16;const r=mc(e);return pc.test(r)?r:bn}catch{return bn}}function mc(e){return dc(e).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nt(e){return`${e.appName}!${e.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt=new Map;function Ur(e,n){const r=Nt(e);Kr(r,n),bc(r,n)}function yc(e,n){zr();const r=Nt(e);let s=Dt.get(r);s||(s=new Set,Dt.set(r,s)),s.add(n)}function wc(e,n){const r=Nt(e),s=Dt.get(r);s&&(s.delete(n),s.size===0&&Dt.delete(r),Wr())}function Kr(e,n){const r=Dt.get(e);if(r)for(const s of r)s(n)}function bc(e,n){const r=zr();r&&r.postMessage({key:e,fid:n}),Wr()}let vt=null;function zr(){return!vt&&"BroadcastChannel"in self&&(vt=new BroadcastChannel("[Firebase] FID Change"),vt.onmessage=e=>{Kr(e.data.key,e.data.fid)}),vt}function Wr(){Dt.size===0&&vt&&(vt.close(),vt=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vc="firebase-installations-database",Ec=1,Tt="firebase-installations-store";let ln=null;function Cn(){return ln||(ln=Re(vc,Ec,{upgrade:(e,n)=>{switch(n){case 0:e.createObjectStore(Tt)}}})),ln}async function Ce(e,n){const r=Nt(e),c=(await Cn()).transaction(Tt,"readwrite"),d=c.objectStore(Tt),f=await d.get(r);return await d.put(n,r),await c.done,(!f||f.fid!==n.fid)&&Ur(e,n.fid),n}async function Vr(e){const n=Nt(e),s=(await Cn()).transaction(Tt,"readwrite");await s.objectStore(Tt).delete(n),await s.done}async function Ne(e,n){const r=Nt(e),c=(await Cn()).transaction(Tt,"readwrite"),d=c.objectStore(Tt),f=await d.get(r),E=n(f);return E===void 0?await d.delete(r):await d.put(E,r),await c.done,E&&(!f||f.fid!==E.fid)&&Ur(e,E.fid),E}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Rn(e){let n;const r=await Ne(e.appConfig,s=>{const c=Tc(s),d=Sc(e,c);return n=d.registrationPromise,d.installationEntry});return r.fid===bn?{installationEntry:await n}:{installationEntry:r,registrationPromise:n}}function Tc(e){const n=e||{fid:gc(),registrationStatus:0};return qr(n)}function Sc(e,n){if(n.registrationStatus===0){if(!navigator.onLine){const c=Promise.reject(Et.create("app-offline"));return{installationEntry:n,registrationPromise:c}}const r={fid:n.fid,registrationStatus:1,registrationTime:Date.now()},s=Ic(e,r);return{installationEntry:r,registrationPromise:s}}else return n.registrationStatus===1?{installationEntry:n,registrationPromise:Ac(e)}:{installationEntry:n}}async function Ic(e,n){try{const r=await fc(e,n);return Ce(e.appConfig,r)}catch(r){throw xr(r)&&r.customData.serverCode===409?await Vr(e.appConfig):await Ce(e.appConfig,{fid:n.fid,registrationStatus:0}),r}}async function Ac(e){let n=await Xi(e.appConfig);for(;n.registrationStatus===1;)await Lr(100),n=await Xi(e.appConfig);if(n.registrationStatus===0){const{installationEntry:r,registrationPromise:s}=await Rn(e);return s||r}return n}function Xi(e){return Ne(e,n=>{if(!n)throw Et.create("installation-not-found");return qr(n)})}function qr(e){return _c(e)?{fid:e.fid,registrationStatus:0}:e}function _c(e){return e.registrationStatus===1&&e.registrationTime+Pr<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kc({appConfig:e,heartbeatServiceProvider:n},r){const s=Cc(e,r),c=hc(e,r),d=n.getImmediate({optional:!0});if(d){const v=await d.getHeartbeatsHeader();v&&c.append("x-firebase-client",v)}const f={installation:{sdkVersion:Nr,appId:e.appId}},E={method:"POST",headers:c,body:JSON.stringify(f)},S=await Hr(()=>fetch(s,E));if(S.ok){const v=await S.json();return jr(v)}else throw await Fr("Generate Auth Token",S)}function Cc(e,{fid:n}){return`${Br(e)}/${n}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Dn(e,n=!1){let r;const s=await Ne(e.appConfig,d=>{if(!Gr(d))throw Et.create("not-registered");const f=d.authToken;if(!n&&Oc(f))return d;if(f.requestStatus===1)return r=Rc(e,n),d;{if(!navigator.onLine)throw Et.create("app-offline");const E=Nc(d);return r=Dc(e,E),E}});return r?await r:s.authToken}async function Rc(e,n){let r=await Ji(e.appConfig);for(;r.authToken.requestStatus===1;)await Lr(100),r=await Ji(e.appConfig);const s=r.authToken;return s.requestStatus===0?Dn(e,n):s}function Ji(e){return Ne(e,n=>{if(!Gr(n))throw Et.create("not-registered");const r=n.authToken;return Mc(r)?{...n,authToken:{requestStatus:0}}:n})}async function Dc(e,n){try{const r=await kc(e,n),s={...n,authToken:r};return await Ce(e.appConfig,s),r}catch(r){if(xr(r)&&(r.customData.serverCode===401||r.customData.serverCode===404))await Vr(e.appConfig);else{const s={...n,authToken:{requestStatus:0}};await Ce(e.appConfig,s)}throw r}}function Gr(e){return e!==void 0&&e.registrationStatus===2}function Oc(e){return e.requestStatus===2&&!Pc(e)}function Pc(e){const n=Date.now();return n<e.creationTime||e.creationTime+e.expiresIn<n+oc}function Nc(e){const n={requestStatus:1,requestTime:Date.now()};return{...e,authToken:n}}function Mc(e){return e.requestStatus===1&&e.requestTime+Pr<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xc(e){const n=e,{installationEntry:r,registrationPromise:s}=await Rn(n);return s?s.catch(console.error):Dn(n).catch(console.error),r.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bc(e,n=!1){const r=e;return await jc(r),(await Dn(r,n)).token}async function jc(e){const{registrationPromise:n}=await Rn(e);n&&await n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fc(e,n){const{appConfig:r}=e;return yc(r,n),()=>{wc(r,n)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $c(e){if(!e||!e.options)throw un("App Configuration");if(!e.name)throw un("App Name");const n=["projectId","apiKey","appId"];for(const r of n)if(!e.options[r])throw un(r);return{appName:e.name,projectId:e.options.projectId,apiKey:e.options.apiKey,appId:e.options.appId}}function un(e){return Et.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xr="installations",Hc="installations-internal",Lc=e=>{const n=e.getProvider("app").getImmediate(),r=$c(n),s=ie(n,"heartbeat");return{app:n,appConfig:r,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},Uc=e=>{const n=e.getProvider("app").getImmediate(),r=ie(n,Xr).getImmediate();return{getId:()=>xc(r),getToken:c=>Bc(r,c)}};function Kc(){tt(new Y(Xr,Lc,"PUBLIC")),tt(new Y(Hc,Uc,"PRIVATE"))}Kc();Z(Or,kn);Z(Or,kn,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zc="/firebase-messaging-sw.js",Wc="/firebase-cloud-messaging-push-scope",Jr="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Vc="https://fcmregistrations.googleapis.com/v1",Yr="google.c.a.c_id",qc="google.c.a.c_l",Gc="google.c.a.ts",Xc="google.c.a.e",Yi=1e4;var Zi;(function(e){e[e.DATA_MESSAGE=1]="DATA_MESSAGE",e[e.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(Zi||(Zi={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var Ot;(function(e){e.PUSH_RECEIVED="push-received",e.NOTIFICATION_CLICKED="notification-clicked",e.FID_REGISTERED="fid-registered"})(Ot||(Ot={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V(e){const n=new Uint8Array(e);return btoa(String.fromCharCode(...n)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Zr(e){const n="=".repeat((4-e.length%4)%4),r=(e+n).replace(/\-/g,"+").replace(/_/g,"/"),s=atob(r),c=new Uint8Array(s.length);for(let d=0;d<s.length;++d)c[d]=s.charCodeAt(d);return c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn="fcm_token_details_db",Jc=5,Qi="fcm_token_object_Store";async function Yc(e){if("databases"in indexedDB&&!(await indexedDB.databases()).map(d=>d.name).includes(fn))return null;let n=null;return(await Re(fn,Jc,{upgrade:async(s,c,d,f)=>{if(c<2||!s.objectStoreNames.contains(Qi))return;const E=f.objectStore(Qi),S=await E.index("fcmSenderId").get(e);if(await E.clear(),!!S){if(c===2){const v=S;if(!v.auth||!v.p256dh||!v.endpoint)return;n={token:v.fcmToken,createTime:v.createTime??Date.now(),subscriptionOptions:{auth:v.auth,p256dh:v.p256dh,endpoint:v.endpoint,swScope:v.swScope,vapidKey:typeof v.vapidKey=="string"?v.vapidKey:V(v.vapidKey)}}}else if(c===3){const v=S;n={token:v.fcmToken,createTime:v.createTime,subscriptionOptions:{auth:V(v.auth),p256dh:V(v.p256dh),endpoint:v.endpoint,swScope:v.swScope,vapidKey:V(v.vapidKey)}}}else if(c===4){const v=S;n={token:v.fcmToken,createTime:v.createTime,subscriptionOptions:{auth:V(v.auth),p256dh:V(v.p256dh),endpoint:v.endpoint,swScope:v.swScope,vapidKey:V(v.vapidKey)}}}}}})).close(),await Ie(fn),await Ie("fcm_vapid_details_db"),await Ie("undefined"),Zc(n)?n:null}function Zc(e){if(!e||!e.subscriptionOptions)return!1;const{subscriptionOptions:n}=e;return typeof e.createTime=="number"&&e.createTime>0&&typeof e.token=="string"&&e.token.length>0&&typeof n.auth=="string"&&n.auth.length>0&&typeof n.p256dh=="string"&&n.p256dh.length>0&&typeof n.endpoint=="string"&&n.endpoint.length>0&&typeof n.swScope=="string"&&n.swScope.length>0&&typeof n.vapidKey=="string"&&n.vapidKey.length>0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qc={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","fid-registration-failed":"A problem occurred while creating an FCM registration via FID: {$errorInfo}","fid-unregister-failed":"A problem occurred while unregistering the FCM registration via FID: {$errorInfo}","fid-registration-idb-schema-unavailable":"Unable to read or persist FID registration metadata because the messaging IndexedDB schema is unavailable (for example, the database could not be upgraded to the latest version).","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used.","invalid-on-registered-handler":"No onRegistered callback handler was provided or registered. Implement onRegistered() before register()."},_=new ne("messaging","Messaging",Qc);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tr="firebase-messaging-database",er=2,et="firebase-messaging-store",q="firebase-messaging-fid-registration-store",th={openDB:Re,deleteDB:Ie};let nr=th,Zt=null;function eh(e,n,r){switch(n){case 0:if(e.createObjectStore(et),r===1)break;case 1:r===2&&e.createObjectStore(q)}}function ir(e){return{upgrade:(n,r)=>{eh(n,r,e)},blocked:()=>{},blocking:(n,r,s)=>{var c;Zt=null,(c=s.target)==null||c.close()},terminated:()=>{Zt=null}}}function Mt(){return Zt||(Zt=nr.openDB(tr,er,ir(2)).catch(()=>nr.openDB(tr,er-1,ir(1)))),Zt}function Qr(e,n){return e.objectStoreNames.contains(n)}function On(e){if(!Qr(e,q))throw _.create("fid-registration-idb-schema-unavailable")}async function to(e){const n=xt(e),s=await(await Mt()).transaction(et).objectStore(et).get(n);if(s)return s;{const c=await Yc(e.appConfig.senderId);if(c)return await Pn(e,c),c}}async function Pn(e,n){const r=xt(e),s=await Mt(),c=[et],d=Qr(s,q);d&&c.push(q);const f=s.transaction(c,"readwrite");return await f.objectStore(et).put(n,r),d&&await f.objectStore(q).delete(r),await f.done,n}async function eo(e){const n=xt(e),s=(await Mt()).transaction(et,"readwrite");await s.objectStore(et).delete(n),await s.done}async function Me(e){const n=xt(e),r=await Mt();return On(r),await r.transaction(q).objectStore(q).get(n)}async function nh(e,n){const r=xt(e),s=await Mt();On(s);const c=s.transaction([et,q],"readwrite");return await c.objectStore(q).put(n,r),await c.objectStore(et).delete(r),await c.done,n}async function no(e){const n=xt(e),r=await Mt();On(r);const s=r.transaction(q,"readwrite");await s.objectStore(q).delete(n),await s.done}function xt({appConfig:e}){return e.appId}const rr="@firebase/messaging",vn="0.13.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ih=3,rh=1e3;async function oh(e,n){const r=await oe(e),s=Nn(n,e.appConfig.appName,!1),c={method:"POST",headers:r,body:JSON.stringify(s)};let d;try{d=await(await fetch(re(e.appConfig),c)).json()}catch(f){throw _.create("token-subscribe-failed",{errorInfo:f==null?void 0:f.toString()})}if(d.error){const f=d.error.message;throw _.create("token-subscribe-failed",{errorInfo:f})}if(!d.token)throw _.create("token-subscribe-no-token");return d.token}async function sh(e,n){var S;const r=await oe(e),s=Nn(n,e.appConfig.appName,!0),c={method:"POST",headers:r,body:JSON.stringify(s)};let d;try{d=await lh(()=>fetch(re(e.appConfig),c),ih,rh)}catch(v){throw _.create("fid-registration-failed",{errorInfo:v==null?void 0:v.toString()})}if(d.ok)return{responseFid:await ah(d)};let f;try{f=await d.json()}catch{throw _.create("fid-registration-failed",{errorInfo:d.statusText})}const E=((S=f.error)==null?void 0:S.message)??d.statusText;throw _.create("fid-registration-failed",{errorInfo:E})}async function io(e,n){var d;const s={method:"DELETE",headers:await oe(e)};let c;try{c=await fetch(`${re(e.appConfig)}/${n}`,s)}catch(f){throw _.create("fid-unregister-failed",{errorInfo:f==null?void 0:f.toString()})}if(!c.ok)try{throw((d=(await c.json()).error)==null?void 0:d.message)??c.statusText}catch(f){throw _.create("fid-unregister-failed",{errorInfo:typeof f=="string"&&f||c.statusText||(f==null?void 0:f.toString())})}}async function ah(e){const n=await e.text();if(!n.trim())throw _.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is empty"});let r;try{r=JSON.parse(n)}catch{throw _.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is not valid JSON"})}const s=r.name;if(typeof s!="string"||s.length===0)throw _.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response did not include a non-empty name"});return ch(s)}const or="/registrations/";function ch(e){const n=e.indexOf(or);if(n!==-1){const r=e.slice(n+or.length);if(r.length>0)return r}throw _.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response name is not a valid registration resource name"})}async function hh(e,n){const r=await oe(e),s=Nn(n.subscriptionOptions,e.appConfig.appName,!1),c={method:"PATCH",headers:r,body:JSON.stringify(s)};let d;try{d=await(await fetch(`${re(e.appConfig)}/${n.token}`,c)).json()}catch(f){throw _.create("token-update-failed",{errorInfo:f==null?void 0:f.toString()})}if(d.error){const f=d.error.message;throw _.create("token-update-failed",{errorInfo:f})}if(!d.token)throw _.create("token-update-no-token");return d.token}async function ro(e,n){const s={method:"DELETE",headers:await oe(e)};try{const d=await(await fetch(`${re(e.appConfig)}/${n}`,s)).json();if(d.error){const f=d.error.message;throw _.create("token-unsubscribe-failed",{errorInfo:f})}}catch(c){throw _.create("token-unsubscribe-failed",{errorInfo:c==null?void 0:c.toString()})}}async function lh(e,n,r){let s;for(let c=0;c<n;c++)try{return await e()}catch(d){if(s=d,c<n-1){const f=r*Math.pow(2,c);await new Promise(E=>setTimeout(E,f))}}throw s}function re({projectId:e}){return`${Vc}/projects/${e}/registrations`}async function oe({appConfig:e,installations:n}){const r=await n.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":e.apiKey,"x-goog-firebase-installations-auth":`FIS ${r}`})}function uh(e,n){var r,s;try{if(/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e))return new URL(e).host}catch{}try{if(typeof self<"u"&&((r=self.location)!=null&&r.href))return new URL(e,self.location.origin).host}catch{}return typeof self<"u"&&((s=self.location)!=null&&s.host)?self.location.host:n}function Nn({p256dh:e,auth:n,endpoint:r,vapidKey:s,swScope:c},d,f){const E={web:{origin:uh(c,d),endpoint:r,auth:n,p256dh:e}};return f&&(E.fcm_sdk_version=vn),s!==Jr&&(E.web.applicationPubKey=s),E}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh=10080*60*1e3;async function dh(e){const n=await wh(e.swRegistration,e.vapidKey),r={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:n.endpoint,auth:V(n.getKey("auth")),p256dh:V(n.getKey("p256dh"))},s=await to(e.firebaseDependencies);if(s){if(bh(s.subscriptionOptions,r))return Date.now()>=s.createTime+fh?yh(e,{token:s.token,createTime:Date.now(),subscriptionOptions:r}):s.token;try{await ro(e.firebaseDependencies,s.token)}catch(c){console.warn(c)}return sr(e.firebaseDependencies,r)}else return sr(e.firebaseDependencies,r)}async function ph(e,n){await ro(e.firebaseDependencies,n.token),await eo(e.firebaseDependencies),await oo(e.firebaseDependencies)}async function gh(e){const n=await Me(e.firebaseDependencies).catch(()=>{}),r=n==null?void 0:n.fid;r&&await io(e.firebaseDependencies,r),await oo(e.firebaseDependencies),r&&Eh(e,r)}async function mh(e){const n=await to(e.firebaseDependencies);n?await ph(e,n):await gh(e);const r=await e.swRegistration.pushManager.getSubscription();return r?r.unsubscribe():!0}async function yh(e,n){try{const r=await hh(e.firebaseDependencies,n),s={...n,token:r,createTime:Date.now()};return await Pn(e.firebaseDependencies,s),r}catch(r){throw r}}async function sr(e,n){const s={token:await oh(e,n),createTime:Date.now(),subscriptionOptions:n};return await Pn(e,s),s.token}async function wh(e,n){const r=await e.pushManager.getSubscription();return r||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Zr(n)})}function bh(e,n){const r=n.vapidKey===e.vapidKey,s=n.endpoint===e.endpoint,c=n.auth===e.auth,d=n.p256dh===e.p256dh;return r&&s&&c&&d}async function oo(e){try{await no(e)}catch{}}function vh(e,n){const r=e.onRegisteredHandler;r&&(typeof r=="function"?r(n):r.next(n))}function Eh(e,n){const r=e.onUnregisteredHandler;r&&(typeof r=="function"?r(n):r.next(n))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function so(e){try{e.swRegistration=await navigator.serviceWorker.register(zc,{scope:Wc}),e.swRegistration.update().catch(()=>{}),await Th(e.swRegistration)}catch(n){throw _.create("failed-service-worker-registration",{browserErrorMessage:n==null?void 0:n.message})}}async function Th(e){return new Promise((n,r)=>{const s=setTimeout(()=>r(new Error(`Service worker not registered after ${Yi} ms`)),Yi),c=e.installing||e.waiting;e.active?(clearTimeout(s),n()):c?c.onstatechange=d=>{var f;((f=d.target)==null?void 0:f.state)==="activated"&&(c.onstatechange=null,clearTimeout(s),n())}:(clearTimeout(s),r(new Error("No incoming service worker found.")))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ao(e,n){if(!n&&!e.swRegistration&&await so(e),!(!n&&e.swRegistration)){if(!(n instanceof ServiceWorkerRegistration))throw _.create("invalid-sw-registration");e.swRegistration=n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function co(e,n){n?e.vapidKey=n:e.vapidKey||(e.vapidKey=Jr)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ar=3;async function Sh(e,n){const r=await Ih(e.swRegistration,e.vapidKey),s={vapidKey:e.vapidKey,swScope:e.swRegistration.scope,endpoint:r.endpoint,auth:V(r.getKey("auth")),p256dh:V(r.getKey("p256dh"))},c=e.firebaseDependencies.installations;for(let d=0;d<ar;d++){const{responseFid:f}=await sh(e.firebaseDependencies,s);if(f===n)return;d<ar-1&&await c.getToken(!0)}throw _.create("fid-registration-failed",{errorInfo:"CreateRegistration response FID does not match Firebase Installation ID"})}async function Ih(e,n){const r=await e.pushManager.getSubscription();return r||e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Zr(n)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ah=10080*60*1e3;async function Mn(e,n){if(!navigator)throw _.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw _.create("permission-blocked");if(!e.onRegisteredHandler)throw _.create("invalid-on-registered-handler");await co(e,n==null?void 0:n.vapidKey),await ao(e,n==null?void 0:n.serviceWorkerRegistration);const r=e._registerNotifyChain.catch(()=>{});return e._registerNotifyChain=r.then(async()=>{const s=await e.firebaseDependencies.installations.getId(),c=await Me(e.firebaseDependencies),d=Date.now();if((!c||c.fid!==s||d>=c.lastRegisterTime+Ah)&&(await Sh(e,s),await nh(e.firebaseDependencies,{fid:s,lastRegisterTime:d,vapidKey:e.vapidKey})),!e.onRegisteredHandler)throw _.create("invalid-on-registered-handler");vh(e,s)}),e._registerNotifyChain}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _h(e,n){return Fc(n,()=>{(async()=>!e.onRegisteredHandler||!await Me(e.firebaseDependencies)||await Mn(e).catch(()=>{}))()})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cr(e){const n={from:e.from,collapseKey:e.collapse_key,messageId:e.fcmMessageId};return kh(n,e),Ch(n,e),Rh(n,e),n}function kh(e,n){if(!n.notification)return;e.notification={};const r=n.notification.title;r&&(e.notification.title=r);const s=n.notification.body;s&&(e.notification.body=s);const c=n.notification.image;c&&(e.notification.image=c);const d=n.notification.icon;d&&(e.notification.icon=d)}function Ch(e,n){n.data&&(e.data=n.data)}function Rh(e,n){var c,d,f,E;if(!n.fcmOptions&&!((c=n.notification)!=null&&c.click_action))return;e.fcmOptions={};const r=((d=n.fcmOptions)==null?void 0:d.link)??((f=n.notification)==null?void 0:f.click_action);r&&(e.fcmOptions.link=r);const s=(E=n.fcmOptions)==null?void 0:E.analytics_label;s&&(e.fcmOptions.analyticsLabel=s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dh(e){return typeof e=="object"&&!!e&&Yr in e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oh(e){if(!e||!e.options)throw dn("App Configuration Object");if(!e.name)throw dn("App Name");const n=["projectId","apiKey","appId","messagingSenderId"],{options:r}=e;for(const s of n)if(!r[s])throw dn(s);return{appName:e.name,projectId:r.projectId,apiKey:r.apiKey,appId:r.appId,senderId:r.messagingSenderId}}function dn(e){return _.create("missing-app-config-values",{valueName:e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ph{constructor(n,r,s){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.onRegisteredHandler=null,this.onUnregisteredHandler=null,this._registerNotifyChain=Promise.resolve(),this._fidChangeUnsubscribe=null,this.logEvents=[],this.logQueue={state:"stopped"};const c=Oh(n);this.firebaseDependencies={app:n,appConfig:c,installations:r,analyticsProvider:s}}_delete(){return this._fidChangeUnsubscribe&&(this._fidChangeUnsubscribe(),this._fidChangeUnsubscribe=null),this.logQueue.state==="scheduled"&&clearTimeout(this.logQueue.timerId),this.logQueue={state:"stopped"},Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ho(e,n){if(!navigator)throw _.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw _.create("permission-blocked");return await co(e,n==null?void 0:n.vapidKey),await ao(e,n==null?void 0:n.serviceWorkerRegistration),dh(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nh(e,n,r){const s=Mh(n);(await e.firebaseDependencies.analyticsProvider.get()).logEvent(s,{message_id:r[Yr],message_name:r[qc],message_time:r[Gc],message_device_time:Math.floor(Date.now()/1e3)})}function Mh(e){switch(e){case Ot.NOTIFICATION_CLICKED:return"notification_open";case Ot.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xh(e,n){const r=n.data;if(!r.isFirebaseMessaging)return;if(e.onMessageHandler&&r.messageType===Ot.PUSH_RECEIVED&&(typeof e.onMessageHandler=="function"?e.onMessageHandler(cr(r)):e.onMessageHandler.next(cr(r))),e.onRegisteredHandler&&r.messageType===Ot.FID_REGISTERED){const c=r.fid;typeof e.onRegisteredHandler=="function"?e.onRegisteredHandler(c):e.onRegisteredHandler.next(c)}const s=r.data;Dh(s)&&s[Xc]==="1"&&await Nh(e,r.messageType,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bh=e=>{const n=new Ph(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),e.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",r=>xh(n,r)),n._fidChangeUnsubscribe=_h(n,e.getProvider("installations").getImmediate()),n},jh=e=>{const n=e.getProvider("messaging").getImmediate();return{getToken:s=>ho(n,s),register:s=>Mn(n,s)}};function Fh(){tt(new Y("messaging",Bh,"PUBLIC")),tt(new Y("messaging-internal",jh,"PRIVATE")),Z(rr,vn),Z(rr,vn,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lo(){try{await pr()}catch{return!1}return typeof window<"u"&&Oe()&&Qo()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $h(e){if(!navigator)throw _.create("only-available-in-window");return e.swRegistration||await so(e),mh(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hh(e,n){if(!navigator)throw _.create("only-available-in-window");return e.onMessageHandler=n,()=>{e.onMessageHandler=null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lh(e,n){return e.onRegisteredHandler=n,()=>{e.onRegisteredHandler===n&&(e.onRegisteredHandler=null)}}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uh(e,n){return e.onUnregisteredHandler=n,()=>{e.onUnregisteredHandler===n&&(e.onUnregisteredHandler=null)}}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kh(e){if(!navigator)throw _.create("only-available-in-window");const n=await Me(e.firebaseDependencies).catch(()=>{}),r=(n==null?void 0:n.fid)??await e.firebaseDependencies.installations.getId();await io(e.firebaseDependencies,r);try{await no(e.firebaseDependencies)}catch{}try{await eo(e.firebaseDependencies)}catch{}const s=e.onUnregisteredHandler;s&&(typeof s=="function"?s(r):s.next(r))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zh(e=mr()){return lo().then(n=>{if(!n)throw _.create("unsupported-browser")},n=>{throw _.create("indexed-db-unsupported")}),ie(nt(e),"messaging").getImmediate()}async function Wh(e,n){return e=nt(e),ho(e,n)}function Vh(e){return e=nt(e),$h(e)}function qh(e,n){return e=nt(e),Hh(e,n)}async function Gh(e,n){return e=nt(e),Mn(e,n)}async function Xh(e){return e=nt(e),Kh(e)}function Jh(e,n){return e=nt(e),Lh(e,n)}function Yh(e,n){return e=nt(e),Uh(e,n)}Fh();const vl=Object.freeze(Object.defineProperty({__proto__:null,deleteToken:Vh,getMessaging:zh,getToken:Wh,isSupported:lo,onMessage:qh,onRegistered:Jh,onUnregistered:Yh,register:Gh,unregister:Xh},Symbol.toStringTag,{value:"Module"}));export{dl as A,Go as B,Y as C,ll as D,ec as E,Pt as F,Zo as G,ul as H,Ga as I,fl as J,Qt as K,gr as L,Xa as M,sl as N,hl as O,il as P,Ys as Q,wl as R,tc as S,_n as T,bl as U,vl as V,Ya as W,Ja as X,ml as _,R as a,ie as b,mr as c,pn as d,Qh as e,el as f,nt as g,nc as h,pl as i,Za as j,Qa as k,ic as l,al as m,fr as n,lr as o,gl as p,Oe as q,cl as r,tt as s,Z as t,yl as u,tl as v,nl as w,ol as x,rl as y,ne as z};
