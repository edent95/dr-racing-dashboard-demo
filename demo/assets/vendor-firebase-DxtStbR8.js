import{o as fi}from"./vendor-DYoFVlt0.js";const pi=()=>{};var tr={};/**
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
 */const pr=function(i){const r=[];let s=0;for(let a=0;a<i.length;a++){let u=i.charCodeAt(a);u<128?r[s++]=u:u<2048?(r[s++]=u>>6|192,r[s++]=u&63|128):(u&64512)===55296&&a+1<i.length&&(i.charCodeAt(a+1)&64512)===56320?(u=65536+((u&1023)<<10)+(i.charCodeAt(++a)&1023),r[s++]=u>>18|240,r[s++]=u>>12&63|128,r[s++]=u>>6&63|128,r[s++]=u&63|128):(r[s++]=u>>12|224,r[s++]=u>>6&63|128,r[s++]=u&63|128)}return r},gi=function(i){const r=[];let s=0,a=0;for(;s<i.length;){const u=i[s++];if(u<128)r[a++]=String.fromCharCode(u);else if(u>191&&u<224){const w=i[s++];r[a++]=String.fromCharCode((u&31)<<6|w&63)}else if(u>239&&u<365){const w=i[s++],v=i[s++],T=i[s++],A=((u&7)<<18|(w&63)<<12|(v&63)<<6|T&63)-65536;r[a++]=String.fromCharCode(55296+(A>>10)),r[a++]=String.fromCharCode(56320+(A&1023))}else{const w=i[s++],v=i[s++];r[a++]=String.fromCharCode((u&15)<<12|(w&63)<<6|v&63)}}return r.join("")},We={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(i,r){if(!Array.isArray(i))throw Error("encodeByteArray takes an array as a parameter");this.init_();const s=r?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let u=0;u<i.length;u+=3){const w=i[u],v=u+1<i.length,T=v?i[u+1]:0,A=u+2<i.length,E=A?i[u+2]:0,x=w>>2,_=(w&3)<<4|T>>4;let K=(T&15)<<2|E>>6,W=E&63;A||(W=64,v||(K=64)),a.push(s[x],s[_],s[K],s[W])}return a.join("")},encodeString(i,r){return this.HAS_NATIVE_SUPPORT&&!r?btoa(i):this.encodeByteArray(pr(i),r)},decodeString(i,r){return this.HAS_NATIVE_SUPPORT&&!r?atob(i):gi(this.decodeStringToByteArray(i,r))},decodeStringToByteArray(i,r){this.init_();const s=r?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let u=0;u<i.length;){const w=s[i.charAt(u++)],T=u<i.length?s[i.charAt(u)]:0;++u;const E=u<i.length?s[i.charAt(u)]:64;++u;const _=u<i.length?s[i.charAt(u)]:64;if(++u,w==null||T==null||E==null||_==null)throw new di;const K=w<<2|T>>4;if(a.push(K),E!==64){const W=T<<4&240|E>>2;if(a.push(W),_!==64){const $=E<<6&192|_;a.push($)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let i=0;i<this.ENCODED_VALS.length;i++)this.byteToCharMap_[i]=this.ENCODED_VALS.charAt(i),this.charToByteMap_[this.byteToCharMap_[i]]=i,this.byteToCharMapWebSafe_[i]=this.ENCODED_VALS_WEBSAFE.charAt(i),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]]=i,i>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)]=i,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)]=i)}}};class di extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const mi=function(i){const r=pr(i);return We.encodeByteArray(r,!0)},oe=function(i){return mi(i).replace(/\./g,"")},yi=function(i){try{return We.decodeString(i,!0)}catch(r){console.error("base64Decode failed: ",r)}return null};/**
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
 */function gr(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const vi=()=>gr().__FIREBASE_DEFAULTS__,wi=()=>{if(typeof process>"u"||typeof tr>"u")return;const i=tr.__FIREBASE_DEFAULTS__;if(i)return JSON.parse(i)},bi=()=>{if(typeof document>"u")return;let i;try{i=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const r=i&&yi(i[1]);return r&&JSON.parse(r)},le=()=>{try{return pi()||vi()||wi()||bi()}catch(i){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${i}`);return}},Ei=i=>{var r,s;return(s=(r=le())==null?void 0:r.emulatorHosts)==null?void 0:s[i]},Oo=i=>{const r=Ei(i);if(!r)return;const s=r.lastIndexOf(":");if(s<=0||s+1===r.length)throw new Error(`Invalid host ${r} with no separate hostname and port!`);const a=parseInt(r.substring(s+1),10);return r[0]==="["?[r.substring(1,s-1),a]:[r.substring(0,s),a]},dr=()=>{var i;return(i=le())==null?void 0:i.config},Po=i=>{var r;return(r=le())==null?void 0:r[`_${i}`]};/**
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
 */class jt{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((r,s)=>{this.resolve=r,this.reject=s})}wrapCallback(r){return(s,a)=>{s?this.reject(s):this.resolve(a),typeof r=="function"&&(this.promise.catch(()=>{}),r.length===1?r(s):r(s,a))}}}/**
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
 */function Mo(i,r){if(i.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const s={alg:"none",type:"JWT"},a=r||"demo-project",u=i.iat||0,w=i.sub||i.user_id;if(!w)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const v={iss:`https://securetoken.google.com/${a}`,aud:a,iat:u,exp:u+3600,auth_time:u,sub:w,user_id:w,firebase:{sign_in_provider:"custom",identities:{}},...i};return[oe(JSON.stringify(s)),oe(JSON.stringify(v)),""].join(".")}/**
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
 */function mr(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function xo(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(mr())}function yr(){var r;const i=(r=le())==null?void 0:r.forceEnvironment;if(i==="node")return!0;if(i==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Bo(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function No(){const i=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof i=="object"&&i.id!==void 0}function jo(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ho(){const i=mr();return i.indexOf("MSIE ")>=0||i.indexOf("Trident/")>=0}function $o(){return!yr()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Lo(){return!yr()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Ke(){try{return typeof indexedDB=="object"}catch{return!1}}function Ti(){return new Promise((i,r)=>{try{let s=!0;const a="validate-browser-context-for-indexeddb-analytics-module",u=self.indexedDB.open(a);u.onsuccess=()=>{u.result.close(),s||self.indexedDB.deleteDatabase(a),i(!0)},u.onupgradeneeded=()=>{s=!1},u.onerror=()=>{var w;r(((w=u.error)==null?void 0:w.message)||"")}}catch(s){r(s)}})}/**
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
 */const Ai="FirebaseError";class Ft extends Error{constructor(r,s,a){super(s),this.code=r,this.customData=a,this.name=Ai,Object.setPrototypeOf(this,Ft.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Xe.prototype.create)}}class Xe{constructor(r,s,a){this.service=r,this.serviceName=s,this.errors=a}create(r,...s){const a=s[0]||{},u=`${this.service}/${r}`,w=this.errors[r],v=w?_i(w,a):"Error",T=`${this.serviceName}: ${v} (${u}).`;return new Ft(u,T,a)}}function _i(i,r){return i.replace(Si,(s,a)=>{const u=r[a];return u!=null?String(u):`<${a}?>`})}const Si=/\{\$([^}]+)}/g;function Fo(i){for(const r in i)if(Object.prototype.hasOwnProperty.call(i,r))return!1;return!0}function $e(i,r){if(i===r)return!0;const s=Object.keys(i),a=Object.keys(r);for(const u of s){if(!a.includes(u))return!1;const w=i[u],v=r[u];if(er(w)&&er(v)){if(!$e(w,v))return!1}else if(w!==v)return!1}for(const u of a)if(!s.includes(u))return!1;return!0}function er(i){return i!==null&&typeof i=="object"}/**
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
 */function zo(i){const r=[];for(const[s,a]of Object.entries(i))Array.isArray(a)?a.forEach(u=>{r.push(encodeURIComponent(s)+"="+encodeURIComponent(u))}):r.push(encodeURIComponent(s)+"="+encodeURIComponent(a));return r.length?"&"+r.join("&"):""}function Uo(i){const r={};return i.replace(/^\?/,"").split("&").forEach(a=>{if(a){const[u,w]=a.split("=");r[decodeURIComponent(u)]=decodeURIComponent(w)}}),r}function Wo(i){const r=i.indexOf("?");if(!r)return"";const s=i.indexOf("#",r);return i.substring(r,s>0?s:void 0)}function Ko(i,r){const s=new Ci(i,r);return s.subscribe.bind(s)}class Ci{constructor(r,s){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=s,this.task.then(()=>{r(this)}).catch(a=>{this.error(a)})}next(r){this.forEachObserver(s=>{s.next(r)})}error(r){this.forEachObserver(s=>{s.error(r)}),this.close(r)}complete(){this.forEachObserver(r=>{r.complete()}),this.close()}subscribe(r,s,a){let u;if(r===void 0&&s===void 0&&a===void 0)throw new Error("Missing Observer.");Ii(r,["next","error","complete"])?u=r:u={next:r,error:s,complete:a},u.next===void 0&&(u.next=Be),u.error===void 0&&(u.error=Be),u.complete===void 0&&(u.complete=Be);const w=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?u.error(this.finalError):u.complete()}catch{}}),this.observers.push(u),w}unsubscribeOne(r){this.observers===void 0||this.observers[r]===void 0||(delete this.observers[r],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(r){if(!this.finalized)for(let s=0;s<this.observers.length;s++)this.sendOne(s,r)}sendOne(r,s){this.task.then(()=>{if(this.observers!==void 0&&this.observers[r]!==void 0)try{s(this.observers[r])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(r){this.finalized||(this.finalized=!0,r!==void 0&&(this.finalError=r),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Ii(i,r){if(typeof i!="object"||i===null)return!1;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}function Be(){}/**
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
 */const ki=1e3,Di=2,Ri=14400*1e3,Oi=.5;function Pi(i,r=ki,s=Di){const a=r*Math.pow(s,i),u=Math.round(Oi*a*(Math.random()-.5)*2);return Math.min(Ri,a+u)}/**
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
 */function Mi(i){return i&&i._delegate?i._delegate:i}/**
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
 */function Xo(i){try{return(i.startsWith("http://")||i.startsWith("https://")?new URL(i).hostname:i).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Go(i){return(await fetch(i,{credentials:"include"})).ok}class wt{constructor(r,s,a){this.name=r,this.instanceFactory=s,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(r){return this.instantiationMode=r,this}setMultipleInstances(r){return this.multipleInstances=r,this}setServiceProps(r){return this.serviceProps=r,this}setInstanceCreatedCallback(r){return this.onInstanceCreated=r,this}}/**
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
 */const ut="[DEFAULT]";/**
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
 */class xi{constructor(r,s){this.name=r,this.container=s,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(r){const s=this.normalizeInstanceIdentifier(r);if(!this.instancesDeferred.has(s)){const a=new jt;if(this.instancesDeferred.set(s,a),this.isInitialized(s)||this.shouldAutoInitialize())try{const u=this.getOrInitializeService({instanceIdentifier:s});u&&a.resolve(u)}catch{}}return this.instancesDeferred.get(s).promise}getImmediate(r){const s=this.normalizeInstanceIdentifier(r==null?void 0:r.identifier),a=(r==null?void 0:r.optional)??!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(u){if(a)return null;throw u}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(r){if(r.name!==this.name)throw Error(`Mismatching Component ${r.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=r,!!this.shouldAutoInitialize()){if(Ni(r))try{this.getOrInitializeService({instanceIdentifier:ut})}catch{}for(const[s,a]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(s);try{const w=this.getOrInitializeService({instanceIdentifier:u});a.resolve(w)}catch{}}}}clearInstance(r=ut){this.instancesDeferred.delete(r),this.instancesOptions.delete(r),this.instances.delete(r)}async delete(){const r=Array.from(this.instances.values());await Promise.all([...r.filter(s=>"INTERNAL"in s).map(s=>s.INTERNAL.delete()),...r.filter(s=>"_delete"in s).map(s=>s._delete())])}isComponentSet(){return this.component!=null}isInitialized(r=ut){return this.instances.has(r)}getOptions(r=ut){return this.instancesOptions.get(r)||{}}initialize(r={}){const{options:s={}}=r,a=this.normalizeInstanceIdentifier(r.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const u=this.getOrInitializeService({instanceIdentifier:a,options:s});for(const[w,v]of this.instancesDeferred.entries()){const T=this.normalizeInstanceIdentifier(w);a===T&&v.resolve(u)}return u}onInit(r,s){const a=this.normalizeInstanceIdentifier(s),u=this.onInitCallbacks.get(a)??new Set;u.add(r),this.onInitCallbacks.set(a,u);const w=this.instances.get(a);return w&&r(w,a),()=>{u.delete(r)}}invokeOnInitCallbacks(r,s){const a=this.onInitCallbacks.get(s);if(a)for(const u of a)try{u(r,s)}catch{}}getOrInitializeService({instanceIdentifier:r,options:s={}}){let a=this.instances.get(r);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:Bi(r),options:s}),this.instances.set(r,a),this.instancesOptions.set(r,s),this.invokeOnInitCallbacks(a,r),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,r,a)}catch{}return a||null}normalizeInstanceIdentifier(r=ut){return this.component?this.component.multipleInstances?r:ut:r}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Bi(i){return i===ut?void 0:i}function Ni(i){return i.instantiationMode==="EAGER"}/**
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
 */class ji{constructor(r){this.name=r,this.providers=new Map}addComponent(r){const s=this.getProvider(r.name);if(s.isComponentSet())throw new Error(`Component ${r.name} has already been registered with ${this.name}`);s.setComponent(r)}addOrOverwriteComponent(r){this.getProvider(r.name).isComponentSet()&&this.providers.delete(r.name),this.addComponent(r)}getProvider(r){if(this.providers.has(r))return this.providers.get(r);const s=new xi(r,this);return this.providers.set(r,s),s}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var k;(function(i){i[i.DEBUG=0]="DEBUG",i[i.VERBOSE=1]="VERBOSE",i[i.INFO=2]="INFO",i[i.WARN=3]="WARN",i[i.ERROR=4]="ERROR",i[i.SILENT=5]="SILENT"})(k||(k={}));const Hi={debug:k.DEBUG,verbose:k.VERBOSE,info:k.INFO,warn:k.WARN,error:k.ERROR,silent:k.SILENT},$i=k.INFO,Li={[k.DEBUG]:"log",[k.VERBOSE]:"log",[k.INFO]:"info",[k.WARN]:"warn",[k.ERROR]:"error"},Fi=(i,r,...s)=>{if(r<i.logLevel)return;const a=new Date().toISOString(),u=Li[r];if(u)console[u](`[${a}]  ${i.name}:`,...s);else throw new Error(`Attempted to log a message with an invalid logType (value: ${r})`)};class vr{constructor(r){this.name=r,this._logLevel=$i,this._logHandler=Fi,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(r){if(!(r in k))throw new TypeError(`Invalid value "${r}" assigned to \`logLevel\``);this._logLevel=r}setLogLevel(r){this._logLevel=typeof r=="string"?Hi[r]:r}get logHandler(){return this._logHandler}set logHandler(r){if(typeof r!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=r}get userLogHandler(){return this._userLogHandler}set userLogHandler(r){this._userLogHandler=r}debug(...r){this._userLogHandler&&this._userLogHandler(this,k.DEBUG,...r),this._logHandler(this,k.DEBUG,...r)}log(...r){this._userLogHandler&&this._userLogHandler(this,k.VERBOSE,...r),this._logHandler(this,k.VERBOSE,...r)}info(...r){this._userLogHandler&&this._userLogHandler(this,k.INFO,...r),this._logHandler(this,k.INFO,...r)}warn(...r){this._userLogHandler&&this._userLogHandler(this,k.WARN,...r),this._logHandler(this,k.WARN,...r)}error(...r){this._userLogHandler&&this._userLogHandler(this,k.ERROR,...r),this._logHandler(this,k.ERROR,...r)}}/**
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
 */class zi{constructor(r){this.container=r}getPlatformInfoString(){return this.container.getProviders().map(s=>{if(Ui(s)){const a=s.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(s=>s).join(" ")}}function Ui(i){const r=i.getComponent();return(r==null?void 0:r.type)==="VERSION"}const Le="@firebase/app",nr="0.15.0";/**
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
 */const V=new vr("@firebase/app"),Wi="@firebase/app-compat",Ki="@firebase/analytics-compat",Xi="@firebase/analytics",Gi="@firebase/app-check-compat",Vi="@firebase/app-check",qi="@firebase/auth",Yi="@firebase/auth-compat",Ji="@firebase/database",Zi="@firebase/data-connect",Qi="@firebase/database-compat",ts="@firebase/functions",es="@firebase/functions-compat",ns="@firebase/installations",rs="@firebase/installations-compat",is="@firebase/messaging",ss="@firebase/messaging-compat",os="@firebase/performance",as="@firebase/performance-compat",hs="@firebase/remote-config",ls="@firebase/remote-config-compat",cs="@firebase/storage",us="@firebase/storage-compat",fs="@firebase/firestore",ps="@firebase/ai",gs="@firebase/firestore-compat",ds="firebase",ms="12.15.0";/**
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
 */const Fe="[DEFAULT]",ys={[Le]:"fire-core",[Wi]:"fire-core-compat",[Xi]:"fire-analytics",[Ki]:"fire-analytics-compat",[Vi]:"fire-app-check",[Gi]:"fire-app-check-compat",[qi]:"fire-auth",[Yi]:"fire-auth-compat",[Ji]:"fire-rtdb",[Zi]:"fire-data-connect",[Qi]:"fire-rtdb-compat",[ts]:"fire-fn",[es]:"fire-fn-compat",[ns]:"fire-iid",[rs]:"fire-iid-compat",[is]:"fire-fcm",[ss]:"fire-fcm-compat",[os]:"fire-perf",[as]:"fire-perf-compat",[hs]:"fire-rc",[ls]:"fire-rc-compat",[cs]:"fire-gcs",[us]:"fire-gcs-compat",[fs]:"fire-fst",[gs]:"fire-fst-compat",[ps]:"fire-vertex","fire-js":"fire-js",[ds]:"fire-js-all"};/**
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
 */const ae=new Map,vs=new Map,ze=new Map;function rr(i,r){try{i.container.addComponent(r)}catch(s){V.debug(`Component ${r.name} failed to register with FirebaseApp ${i.name}`,s)}}function Ht(i){const r=i.name;if(ze.has(r))return V.debug(`There were multiple attempts to register component ${r}.`),!1;ze.set(r,i);for(const s of ae.values())rr(s,i);for(const s of vs.values())rr(s,i);return!0}function wr(i,r){const s=i.container.getProvider("heartbeat").getImmediate({optional:!0});return s&&s.triggerHeartbeat(),i.container.getProvider(r)}function Vo(i){return i==null?!1:i.settings!==void 0}/**
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
 */const ws={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},it=new Xe("app","Firebase",ws);/**
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
 */class bs{constructor(r,s,a){this._isDeleted=!1,this._options={...r},this._config={...s},this._name=s.name,this._automaticDataCollectionEnabled=s.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new wt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(r){this.checkDestroyed(),this._automaticDataCollectionEnabled=r}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(r){this._isDeleted=r}checkDestroyed(){if(this.isDeleted)throw it.create("app-deleted",{appName:this._name})}}/**
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
 */const qo=ms;function Es(i,r={}){let s=i;typeof r!="object"&&(r={name:r});const a={name:Fe,automaticDataCollectionEnabled:!0,...r},u=a.name;if(typeof u!="string"||!u)throw it.create("bad-app-name",{appName:String(u)});if(s||(s=dr()),!s)throw it.create("no-options");const w=ae.get(u);if(w){if($e(s,w.options)&&$e(a,w.config))return w;throw it.create("duplicate-app",{appName:u})}const v=new ji(u);for(const A of ze.values())v.addComponent(A);const T=new bs(s,a,v);return ae.set(u,T),T}function Ts(i=Fe){const r=ae.get(i);if(!r&&i===Fe&&dr())return Es();if(!r)throw it.create("no-app",{appName:i});return r}function Nt(i,r,s){let a=ys[i]??i;s&&(a+=`-${s}`);const u=a.match(/\s|\//),w=r.match(/\s|\//);if(u||w){const v=[`Unable to register library "${a}" with version "${r}":`];u&&v.push(`library name "${a}" contains illegal characters (whitespace or "/")`),u&&w&&v.push("and"),w&&v.push(`version name "${r}" contains illegal characters (whitespace or "/")`),V.warn(v.join(" "));return}Ht(new wt(`${a}-version`,()=>({library:a,version:r}),"VERSION"))}/**
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
 */const As="firebase-heartbeat-database",_s=1,$t="firebase-heartbeat-store";let Ne=null;function br(){return Ne||(Ne=fi(As,_s,{upgrade:(i,r)=>{switch(r){case 0:try{i.createObjectStore($t)}catch(s){console.warn(s)}}}}).catch(i=>{throw it.create("idb-open",{originalErrorMessage:i.message})})),Ne}async function Ss(i){try{const s=(await br()).transaction($t),a=await s.objectStore($t).get(Er(i));return await s.done,a}catch(r){if(r instanceof Ft)V.warn(r.message);else{const s=it.create("idb-get",{originalErrorMessage:r==null?void 0:r.message});V.warn(s.message)}}}async function ir(i,r){try{const a=(await br()).transaction($t,"readwrite");await a.objectStore($t).put(r,Er(i)),await a.done}catch(s){if(s instanceof Ft)V.warn(s.message);else{const a=it.create("idb-set",{originalErrorMessage:s==null?void 0:s.message});V.warn(a.message)}}}function Er(i){return`${i.name}!${i.options.appId}`}/**
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
 */const Cs=1024,Is=30;class ks{constructor(r){this.container=r,this._heartbeatsCache=null;const s=this.container.getProvider("app").getImmediate();this._storage=new Rs(s),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){var r,s;try{const u=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),w=sr();if(((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((s=this._heartbeatsCache)==null?void 0:s.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===w||this._heartbeatsCache.heartbeats.some(v=>v.date===w))return;if(this._heartbeatsCache.heartbeats.push({date:w,agent:u}),this._heartbeatsCache.heartbeats.length>Is){const v=Os(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(v,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(a){V.warn(a)}}async getHeartbeatsHeader(){var r;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((r=this._heartbeatsCache)==null?void 0:r.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const s=sr(),{heartbeatsToSend:a,unsentEntries:u}=Ds(this._heartbeatsCache.heartbeats),w=oe(JSON.stringify({version:2,heartbeats:a}));return this._heartbeatsCache.lastSentHeartbeatDate=s,u.length>0?(this._heartbeatsCache.heartbeats=u,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),w}catch(s){return V.warn(s),""}}}function sr(){return new Date().toISOString().substring(0,10)}function Ds(i,r=Cs){const s=[];let a=i.slice();for(const u of i){const w=s.find(v=>v.agent===u.agent);if(w){if(w.dates.push(u.date),or(s)>r){w.dates.pop();break}}else if(s.push({agent:u.agent,dates:[u.date]}),or(s)>r){s.pop();break}a=a.slice(1)}return{heartbeatsToSend:s,unsentEntries:a}}class Rs{constructor(r){this.app=r,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ke()?Ti().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const s=await Ss(this.app);return s!=null&&s.heartbeats?s:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(r){if(await this._canUseIndexedDBPromise){const a=await this.read();return ir(this.app,{lastSentHeartbeatDate:r.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:r.heartbeats})}else return}async add(r){if(await this._canUseIndexedDBPromise){const a=await this.read();return ir(this.app,{lastSentHeartbeatDate:r.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...r.heartbeats]})}else return}}function or(i){return oe(JSON.stringify({version:2,heartbeats:i})).length}function Os(i){if(i.length===0)return-1;let r=0,s=i[0].date;for(let a=1;a<i.length;a++)i[a].date<s&&(s=i[a].date,r=a);return r}/**
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
 */function Ps(i){Ht(new wt("platform-logger",r=>new zi(r),"PRIVATE")),Ht(new wt("heartbeat",r=>new ks(r),"PRIVATE")),Nt(Le,nr,i),Nt(Le,nr,"esm2020"),Nt("fire-js","")}Ps("");var Ms="firebase",xs="12.15.0";/**
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
 */Nt(Ms,xs,"app");/**
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
 */const Ue=new Map,Tr={activated:!1,tokenObservers:[]},Bs={initialized:!1,enabled:!1};function R(i){return Ue.get(i)||{...Tr}}function Ns(i,r){return Ue.set(i,r),Ue.get(i)}function ce(){return Bs}/**
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
 */const Ar="https://content-firebaseappcheck.googleapis.com/v1",js="exchangeRecaptchaEnterpriseToken",Hs="exchangeDebugToken",ar={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:960*1e3},$s=1440*60*1e3;/**
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
 */class Ls{constructor(r,s,a,u,w){if(this.operation=r,this.retryPolicy=s,this.getWaitDuration=a,this.lowerBound=u,this.upperBound=w,this.pending=null,this.nextErrorWaitInterval=u,u>w)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(r){this.stop();try{this.pending=new jt,this.pending.promise.catch(s=>{}),await Fs(this.getNextRun(r)),this.pending.resolve(),await this.pending.promise,this.pending=new jt,this.pending.promise.catch(s=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(s){this.retryPolicy(s)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(r){if(r)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const s=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),s}}}function Fs(i){return new Promise(r=>{setTimeout(r,i)})}/**
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
 */const zs={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","already-internally-initialized":"App Check has already been automatically initialized by {$initializerName} with default options. If you want to initialize App Check with custom options, call initializeAppCheck() with those options before initializing {$initializerName}.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","no-provider":"No attestation provider was passed to initializeAppCheck() and no ReCAPTCHA Enterprise site key was found in the Firebase config.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},N=new Xe("appCheck","AppCheck",zs);/**
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
 */function hr(i=!1){var r;return i?(r=self.grecaptcha)==null?void 0:r.enterprise:self.grecaptcha}function Ge(i){if(!R(i).activated)throw N.create("use-before-activation",{appName:i.name})}function _r(i){const r=Math.round(i/1e3),s=Math.floor(r/(3600*24)),a=Math.floor((r-s*3600*24)/3600),u=Math.floor((r-s*3600*24-a*3600)/60),w=r-s*3600*24-a*3600-u*60;let v="";return s&&(v+=re(s)+"d:"),a&&(v+=re(a)+"h:"),v+=re(u)+"m:"+re(w)+"s",v}function re(i){return i===0?"00":i>=10?i.toString():"0"+i}/**
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
 */async function Ve({url:i,body:r},s){const a={"Content-Type":"application/json"},u=s.getImmediate({optional:!0});if(u){const _=await u.getHeartbeatsHeader();_&&(a["X-Firebase-Client"]=_)}const w={method:"POST",body:JSON.stringify(r),headers:a};let v;try{v=await fetch(i,w)}catch(_){throw N.create("fetch-network-error",{originalErrorMessage:_==null?void 0:_.message})}if(v.status!==200)throw N.create("fetch-status-error",{httpStatus:v.status});let T;try{T=await v.json()}catch(_){throw N.create("fetch-parse-error",{originalErrorMessage:_==null?void 0:_.message})}const A=T.ttl.match(/^([\d.]+)(s)$/);if(!A||!A[2]||isNaN(Number(A[1])))throw N.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${T.ttl}`});const E=Number(A[1])*1e3,x=Date.now();return{token:T.token,expireTimeMillis:x+E,issuedAtTimeMillis:x}}function Us(i,r){const{projectId:s,appId:a,apiKey:u}=i.options;return{url:`${Ar}/projects/${s}/apps/${a}:${js}?key=${u}`,body:{recaptcha_enterprise_token:r}}}function Sr(i,r){const{projectId:s,appId:a,apiKey:u}=i.options;return{url:`${Ar}/projects/${s}/apps/${a}:${Hs}?key=${u}`,body:{debug_token:r}}}/**
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
 */const Ws="firebase-app-check-database",Ks=1,Lt="firebase-app-check-store",Cr="debug-token";let ie=null;function Ir(){return ie||(ie=new Promise((i,r)=>{try{const s=indexedDB.open(Ws,Ks);s.onsuccess=a=>{i(a.target.result)},s.onerror=a=>{var u;r(N.create("storage-open",{originalErrorMessage:(u=a.target.error)==null?void 0:u.message}))},s.onupgradeneeded=a=>{const u=a.target.result;switch(a.oldVersion){case 0:u.createObjectStore(Lt,{keyPath:"compositeKey"})}}}catch(s){r(N.create("storage-open",{originalErrorMessage:s==null?void 0:s.message}))}}),ie)}function Xs(i){return Dr(Rr(i))}function Gs(i,r){return kr(Rr(i),r)}function Vs(i){return kr(Cr,i)}function qs(){return Dr(Cr)}async function kr(i,r){const a=(await Ir()).transaction(Lt,"readwrite"),w=a.objectStore(Lt).put({compositeKey:i,value:r});return new Promise((v,T)=>{w.onsuccess=A=>{v()},a.onerror=A=>{var E;T(N.create("storage-set",{originalErrorMessage:(E=A.target.error)==null?void 0:E.message}))}})}async function Dr(i){const s=(await Ir()).transaction(Lt,"readonly"),u=s.objectStore(Lt).get(i);return new Promise((w,v)=>{u.onsuccess=T=>{const A=T.target.result;w(A?A.value:void 0)},s.onerror=T=>{var A;v(N.create("storage-get",{originalErrorMessage:(A=T.target.error)==null?void 0:A.message}))}})}function Rr(i){return`${i.options.appId}-${i.name}`}/**
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
 */const rt=new vr("@firebase/app-check");/**
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
 */async function Ys(i){if(Ke()){let r;try{r=await Xs(i)}catch(s){rt.warn(`Failed to read token from IndexedDB. Error: ${s}`)}return r}}function je(i,r){return Ke()?Gs(i,r).catch(s=>{rt.warn(`Failed to write token to IndexedDB. Error: ${s}`)}):Promise.resolve()}async function Js(){let i;try{i=await qs()}catch{}if(i)return i;{const r=crypto.randomUUID();return Vs(r).catch(s=>rt.warn(`Failed to persist debug token to IndexedDB. Error: ${s}`)),r}}/**
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
 */function qe(){return ce().enabled}async function Ye(){const i=ce();if(i.enabled&&i.token)return i.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function Zs(){const i=gr(),r=ce();if(r.initialized=!0,typeof i.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&i.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;r.enabled=!0;const s=new jt;r.token=s,typeof i.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?s.resolve(i.FIREBASE_APPCHECK_DEBUG_TOKEN):s.resolve(Js())}/**
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
 */const Qs={error:"UNKNOWN_ERROR"};function to(i){return We.encodeString(JSON.stringify(i),!1)}async function he(i,r=!1,s=!1){const a=i.app;Ge(a);const u=R(a);let w=u.token,v;if(w&&!vt(w)&&(u.token=void 0,w=void 0),!w){const E=await u.cachedTokenPromise;E&&(vt(E)?w=E:await je(a,void 0))}if(!r&&w&&vt(w))return{token:w.token};let T=!1;if(qe())try{const E=await Ye();u.exchangeTokenPromise||(u.exchangeTokenPromise=Ve(Sr(a,E),i.heartbeatServiceProvider).finally(()=>{u.exchangeTokenPromise=void 0}),T=!0);const x=await u.exchangeTokenPromise;return await je(a,x),u.token=x,{token:x.token}}catch(E){return E.code==="appCheck/throttled"||E.code==="appCheck/initial-throttle"?rt.warn(E.message):s&&rt.error(E),He(E)}try{u.exchangeTokenPromise||(u.exchangeTokenPromise=u.provider.getToken().finally(()=>{u.exchangeTokenPromise=void 0}),T=!0),w=await R(a).exchangeTokenPromise}catch(E){E.code==="appCheck/throttled"||E.code==="appCheck/initial-throttle"?rt.warn(E.message):s&&rt.error(E),v=E}let A;return w?v?vt(w)?A={token:w.token,internalError:v}:A=He(v):(A={token:w.token},u.token=w,await je(a,w)):A=He(v),T&&Mr(a,A),A}async function eo(i){const r=i.app;Ge(r);const{provider:s}=R(r);if(qe()){const a=await Ye(),u=Sr(r,a);u.body.limited_use=!0;const{token:w}=await Ve(u,i.heartbeatServiceProvider);return{token:w}}else{const{token:a}=await s.getToken(!0);return{token:a}}}function Or(i,r,s,a){const{app:u}=i,w=R(u),v={next:s,error:a,type:r};if(w.tokenObservers=[...w.tokenObservers,v],w.token&&vt(w.token)){const T=w.token;Promise.resolve().then(()=>{s({token:T.token}),lr(i)}).catch(()=>{})}w.cachedTokenPromise.then(()=>lr(i))}function Pr(i,r){const s=R(i),a=s.tokenObservers.filter(u=>u.next!==r);a.length===0&&s.tokenRefresher&&s.tokenRefresher.isRunning()&&s.tokenRefresher.stop(),s.tokenObservers=a}function lr(i){const{app:r}=i,s=R(r);let a=s.tokenRefresher;a||(a=no(i),s.tokenRefresher=a),!a.isRunning()&&s.isTokenAutoRefreshEnabled&&a.start()}function no(i){const{app:r}=i;return new Ls(async()=>{const s=R(r);let a;if(s.token?a=await he(i,!0):a=await he(i),a.error)throw a.error;if(a.internalError)throw a.internalError},()=>!0,()=>{const s=R(r);if(s.token){let a=s.token.issuedAtTimeMillis+(s.token.expireTimeMillis-s.token.issuedAtTimeMillis)*.5+3e5;const u=s.token.expireTimeMillis-300*1e3;return a=Math.min(a,u),Math.max(0,a-Date.now())}else return 0},ar.RETRIAL_MIN_WAIT,ar.RETRIAL_MAX_WAIT)}function Mr(i,r){const s=R(i).tokenObservers;for(const a of s)try{a.type==="EXTERNAL"&&r.error!=null?a.error(r.error):a.next(r)}catch{}}function vt(i){return i.expireTimeMillis-Date.now()>0}function He(i){return{token:to(Qs),error:i}}/**
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
 */class ro{constructor(r,s){this.app=r,this.heartbeatServiceProvider=s}_delete(){const{tokenObservers:r}=R(this.app);for(const s of r)Pr(this.app,s.next);return Promise.resolve()}}function io(i,r){return new ro(i,r)}function so(i){return{getToken:r=>he(i,r),getLimitedUseToken:()=>eo(i),addTokenListener:r=>Or(i,"INTERNAL",r),removeTokenListener:r=>Pr(i.app,r)}}const oo="@firebase/app-check",ao="0.12.0",ho="https://www.google.com/recaptcha/enterprise.js";function lo(i,r){const s=new jt,a=R(i);a.reCAPTCHAState={initialized:s};const u=co(i),w=hr(!0);return w?cr(i,r,w,u,s):po(()=>{const v=hr(!0);if(!v)throw new Error("no recaptcha");cr(i,r,v,u,s)}),s.promise}function cr(i,r,s,a,u){s.ready(()=>{fo(i,r,s,a),u.resolve(s)})}function co(i){const r=`fire_app_check_${i.name}`,s=document.createElement("div");return s.id=r,s.style.display="none",document.body.appendChild(s),r}async function uo(i){Ge(i);const s=await R(i).reCAPTCHAState.initialized.promise;return new Promise((a,u)=>{const w=R(i).reCAPTCHAState;s.ready(()=>{a(s.execute(w.widgetId,{action:"fire_app_check"}))})})}function fo(i,r,s,a){const u=s.render(a,{sitekey:r,size:"invisible",callback:()=>{R(i).reCAPTCHAState.succeeded=!0},"error-callback":()=>{R(i).reCAPTCHAState.succeeded=!1}}),w=R(i);w.reCAPTCHAState={...w.reCAPTCHAState,widgetId:u}}function po(i){const r=document.createElement("script");r.src=ho+"?render=explicit",r.onload=i,document.head.appendChild(r)}class Je{constructor(r){this._siteKey=r,this._throttleData=null}async getToken(r=!1){var u,w,v;mo(this._throttleData);const s=await uo(this._app).catch(T=>{throw N.create("recaptcha-error")});if(!((u=R(this._app).reCAPTCHAState)!=null&&u.succeeded))throw N.create("recaptcha-error");let a;try{const T=Us(this._app,s);r&&(T.body.limited_use=!0),a=await Ve(T,this._heartbeatServiceProvider)}catch(T){throw(w=T.code)!=null&&w.includes("fetch-status-error")?(this._throttleData=go(Number((v=T.customData)==null?void 0:v.httpStatus),this._throttleData),N.create("initial-throttle",{time:_r(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):T}return this._throttleData=null,a}initialize(r){this._app=r,this._heartbeatServiceProvider=wr(r,"heartbeat"),lo(r,this._siteKey).catch(()=>{})}isEqual(r){return r instanceof Je?this._siteKey===r._siteKey:!1}}function go(i,r){if(i===404||i===403)return{backoffCount:1,allowRequestsAfter:Date.now()+$s,httpStatus:i};{const s=r?r.backoffCount:0,a=Pi(s,1e3,2);return{backoffCount:s+1,allowRequestsAfter:Date.now()+a,httpStatus:i}}}function mo(i){if(i&&Date.now()-i.allowRequestsAfter<=0)throw N.create("throttled",{time:_r(i.allowRequestsAfter-Date.now()),httpStatus:i.httpStatus})}/**
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
 */function Yo(i=Ts(),r){var v;i=Mi(i),ce().initialized||Zs(),qe()&&Ye().then(T=>console.log(`App Check debug token: ${T}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`));let s;if(!(r!=null&&r.provider)&&i.options.recaptchaSiteKey&&(s=new Je(i.options.recaptchaSiteKey)),!(r!=null&&r.provider)&&!s)throw N.create("no-provider");const a={...r,provider:(r==null?void 0:r.provider)||s},u=wr(i,"app-check");if(u.isInitialized()){const T=u.getImmediate(),A=u.getOptions();if(A.isTokenAutoRefreshEnabled===a.isTokenAutoRefreshEnabled&&((v=A.provider)!=null&&v.isEqual(a.provider)))return T;throw typeof R(i).internallyInitializedBy=="string"?N.create("already-internally-initialized",{initializerName:R(i).internallyInitializedBy}):N.create("already-initialized",{appName:i.name})}const w=u.initialize({options:a});return yo(i,a.provider,a.isTokenAutoRefreshEnabled),R(i).isTokenAutoRefreshEnabled&&Or(w,"INTERNAL",()=>{}),w}function yo(i,r,s=!1){const a=Ns(i,{...Tr});a.activated=!0,a.provider=r,a.cachedTokenPromise=Ys(i).then(u=>(u&&vt(u)&&(a.token=u,Mr(i,{token:u.token})),u)),a.isTokenAutoRefreshEnabled=s&&i.automaticDataCollectionEnabled,!i.automaticDataCollectionEnabled&&s&&rt.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),a.provider.initialize(i)}async function Jo(i,r){const s=await he(i,r);if(s.error)throw s.error;if(s.internalError)throw s.internalError;return{token:s.token}}const vo="app-check",ur="app-check-internal";function wo(){Ht(new wt(vo,i=>{const r=i.getProvider("app").getImmediate(),s=i.getProvider("heartbeat");return io(r,s)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((i,r,s)=>{i.getProvider(ur).initialize()})),Ht(new wt(ur,i=>{const r=i.getProvider("app-check").getImmediate();return so(r)},"PUBLIC").setInstantiationMode("EXPLICIT")),Nt(oo,ao)}wo();var fr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bo,Eo;(function(){var i;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function r(p,h){function c(){}c.prototype=h.prototype,p.F=h.prototype,p.prototype=new c,p.prototype.constructor=p,p.D=function(g,f,m){for(var l=Array(arguments.length-2),F=2;F<arguments.length;F++)l[F-2]=arguments[F];return h.prototype[f].apply(g,l)}}function s(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}r(a,s),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function u(p,h,c){c||(c=0);const g=Array(16);if(typeof h=="string")for(var f=0;f<16;++f)g[f]=h.charCodeAt(c++)|h.charCodeAt(c++)<<8|h.charCodeAt(c++)<<16|h.charCodeAt(c++)<<24;else for(f=0;f<16;++f)g[f]=h[c++]|h[c++]<<8|h[c++]<<16|h[c++]<<24;h=p.g[0],c=p.g[1],f=p.g[2];let m=p.g[3],l;l=h+(m^c&(f^m))+g[0]+3614090360&4294967295,h=c+(l<<7&4294967295|l>>>25),l=m+(f^h&(c^f))+g[1]+3905402710&4294967295,m=h+(l<<12&4294967295|l>>>20),l=f+(c^m&(h^c))+g[2]+606105819&4294967295,f=m+(l<<17&4294967295|l>>>15),l=c+(h^f&(m^h))+g[3]+3250441966&4294967295,c=f+(l<<22&4294967295|l>>>10),l=h+(m^c&(f^m))+g[4]+4118548399&4294967295,h=c+(l<<7&4294967295|l>>>25),l=m+(f^h&(c^f))+g[5]+1200080426&4294967295,m=h+(l<<12&4294967295|l>>>20),l=f+(c^m&(h^c))+g[6]+2821735955&4294967295,f=m+(l<<17&4294967295|l>>>15),l=c+(h^f&(m^h))+g[7]+4249261313&4294967295,c=f+(l<<22&4294967295|l>>>10),l=h+(m^c&(f^m))+g[8]+1770035416&4294967295,h=c+(l<<7&4294967295|l>>>25),l=m+(f^h&(c^f))+g[9]+2336552879&4294967295,m=h+(l<<12&4294967295|l>>>20),l=f+(c^m&(h^c))+g[10]+4294925233&4294967295,f=m+(l<<17&4294967295|l>>>15),l=c+(h^f&(m^h))+g[11]+2304563134&4294967295,c=f+(l<<22&4294967295|l>>>10),l=h+(m^c&(f^m))+g[12]+1804603682&4294967295,h=c+(l<<7&4294967295|l>>>25),l=m+(f^h&(c^f))+g[13]+4254626195&4294967295,m=h+(l<<12&4294967295|l>>>20),l=f+(c^m&(h^c))+g[14]+2792965006&4294967295,f=m+(l<<17&4294967295|l>>>15),l=c+(h^f&(m^h))+g[15]+1236535329&4294967295,c=f+(l<<22&4294967295|l>>>10),l=h+(f^m&(c^f))+g[1]+4129170786&4294967295,h=c+(l<<5&4294967295|l>>>27),l=m+(c^f&(h^c))+g[6]+3225465664&4294967295,m=h+(l<<9&4294967295|l>>>23),l=f+(h^c&(m^h))+g[11]+643717713&4294967295,f=m+(l<<14&4294967295|l>>>18),l=c+(m^h&(f^m))+g[0]+3921069994&4294967295,c=f+(l<<20&4294967295|l>>>12),l=h+(f^m&(c^f))+g[5]+3593408605&4294967295,h=c+(l<<5&4294967295|l>>>27),l=m+(c^f&(h^c))+g[10]+38016083&4294967295,m=h+(l<<9&4294967295|l>>>23),l=f+(h^c&(m^h))+g[15]+3634488961&4294967295,f=m+(l<<14&4294967295|l>>>18),l=c+(m^h&(f^m))+g[4]+3889429448&4294967295,c=f+(l<<20&4294967295|l>>>12),l=h+(f^m&(c^f))+g[9]+568446438&4294967295,h=c+(l<<5&4294967295|l>>>27),l=m+(c^f&(h^c))+g[14]+3275163606&4294967295,m=h+(l<<9&4294967295|l>>>23),l=f+(h^c&(m^h))+g[3]+4107603335&4294967295,f=m+(l<<14&4294967295|l>>>18),l=c+(m^h&(f^m))+g[8]+1163531501&4294967295,c=f+(l<<20&4294967295|l>>>12),l=h+(f^m&(c^f))+g[13]+2850285829&4294967295,h=c+(l<<5&4294967295|l>>>27),l=m+(c^f&(h^c))+g[2]+4243563512&4294967295,m=h+(l<<9&4294967295|l>>>23),l=f+(h^c&(m^h))+g[7]+1735328473&4294967295,f=m+(l<<14&4294967295|l>>>18),l=c+(m^h&(f^m))+g[12]+2368359562&4294967295,c=f+(l<<20&4294967295|l>>>12),l=h+(c^f^m)+g[5]+4294588738&4294967295,h=c+(l<<4&4294967295|l>>>28),l=m+(h^c^f)+g[8]+2272392833&4294967295,m=h+(l<<11&4294967295|l>>>21),l=f+(m^h^c)+g[11]+1839030562&4294967295,f=m+(l<<16&4294967295|l>>>16),l=c+(f^m^h)+g[14]+4259657740&4294967295,c=f+(l<<23&4294967295|l>>>9),l=h+(c^f^m)+g[1]+2763975236&4294967295,h=c+(l<<4&4294967295|l>>>28),l=m+(h^c^f)+g[4]+1272893353&4294967295,m=h+(l<<11&4294967295|l>>>21),l=f+(m^h^c)+g[7]+4139469664&4294967295,f=m+(l<<16&4294967295|l>>>16),l=c+(f^m^h)+g[10]+3200236656&4294967295,c=f+(l<<23&4294967295|l>>>9),l=h+(c^f^m)+g[13]+681279174&4294967295,h=c+(l<<4&4294967295|l>>>28),l=m+(h^c^f)+g[0]+3936430074&4294967295,m=h+(l<<11&4294967295|l>>>21),l=f+(m^h^c)+g[3]+3572445317&4294967295,f=m+(l<<16&4294967295|l>>>16),l=c+(f^m^h)+g[6]+76029189&4294967295,c=f+(l<<23&4294967295|l>>>9),l=h+(c^f^m)+g[9]+3654602809&4294967295,h=c+(l<<4&4294967295|l>>>28),l=m+(h^c^f)+g[12]+3873151461&4294967295,m=h+(l<<11&4294967295|l>>>21),l=f+(m^h^c)+g[15]+530742520&4294967295,f=m+(l<<16&4294967295|l>>>16),l=c+(f^m^h)+g[2]+3299628645&4294967295,c=f+(l<<23&4294967295|l>>>9),l=h+(f^(c|~m))+g[0]+4096336452&4294967295,h=c+(l<<6&4294967295|l>>>26),l=m+(c^(h|~f))+g[7]+1126891415&4294967295,m=h+(l<<10&4294967295|l>>>22),l=f+(h^(m|~c))+g[14]+2878612391&4294967295,f=m+(l<<15&4294967295|l>>>17),l=c+(m^(f|~h))+g[5]+4237533241&4294967295,c=f+(l<<21&4294967295|l>>>11),l=h+(f^(c|~m))+g[12]+1700485571&4294967295,h=c+(l<<6&4294967295|l>>>26),l=m+(c^(h|~f))+g[3]+2399980690&4294967295,m=h+(l<<10&4294967295|l>>>22),l=f+(h^(m|~c))+g[10]+4293915773&4294967295,f=m+(l<<15&4294967295|l>>>17),l=c+(m^(f|~h))+g[1]+2240044497&4294967295,c=f+(l<<21&4294967295|l>>>11),l=h+(f^(c|~m))+g[8]+1873313359&4294967295,h=c+(l<<6&4294967295|l>>>26),l=m+(c^(h|~f))+g[15]+4264355552&4294967295,m=h+(l<<10&4294967295|l>>>22),l=f+(h^(m|~c))+g[6]+2734768916&4294967295,f=m+(l<<15&4294967295|l>>>17),l=c+(m^(f|~h))+g[13]+1309151649&4294967295,c=f+(l<<21&4294967295|l>>>11),l=h+(f^(c|~m))+g[4]+4149444226&4294967295,h=c+(l<<6&4294967295|l>>>26),l=m+(c^(h|~f))+g[11]+3174756917&4294967295,m=h+(l<<10&4294967295|l>>>22),l=f+(h^(m|~c))+g[2]+718787259&4294967295,f=m+(l<<15&4294967295|l>>>17),l=c+(m^(f|~h))+g[9]+3951481745&4294967295,p.g[0]=p.g[0]+h&4294967295,p.g[1]=p.g[1]+(f+(l<<21&4294967295|l>>>11))&4294967295,p.g[2]=p.g[2]+f&4294967295,p.g[3]=p.g[3]+m&4294967295}a.prototype.v=function(p,h){h===void 0&&(h=p.length);const c=h-this.blockSize,g=this.C;let f=this.h,m=0;for(;m<h;){if(f==0)for(;m<=c;)u(this,p,m),m+=this.blockSize;if(typeof p=="string"){for(;m<h;)if(g[f++]=p.charCodeAt(m++),f==this.blockSize){u(this,g),f=0;break}}else for(;m<h;)if(g[f++]=p[m++],f==this.blockSize){u(this,g),f=0;break}}this.h=f,this.o+=h},a.prototype.A=function(){var p=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);p[0]=128;for(var h=1;h<p.length-8;++h)p[h]=0;h=this.o*8;for(var c=p.length-8;c<p.length;++c)p[c]=h&255,h/=256;for(this.v(p),p=Array(16),h=0,c=0;c<4;++c)for(let g=0;g<32;g+=8)p[h++]=this.g[c]>>>g&255;return p};function w(p,h){var c=T;return Object.prototype.hasOwnProperty.call(c,p)?c[p]:c[p]=h(p)}function v(p,h){this.h=h;const c=[];let g=!0;for(let f=p.length-1;f>=0;f--){const m=p[f]|0;g&&m==h||(c[f]=m,g=!1)}this.g=c}var T={};function A(p){return-128<=p&&p<128?w(p,function(h){return new v([h|0],h<0?-1:0)}):new v([p|0],p<0?-1:0)}function E(p){if(isNaN(p)||!isFinite(p))return _;if(p<0)return O(E(-p));const h=[];let c=1;for(let g=0;p>=c;g++)h[g]=p/c|0,c*=4294967296;return new v(h,0)}function x(p,h){if(p.length==0)throw Error("number format error: empty string");if(h=h||10,h<2||36<h)throw Error("radix out of range: "+h);if(p.charAt(0)=="-")return O(x(p.substring(1),h));if(p.indexOf("-")>=0)throw Error('number format error: interior "-" character');const c=E(Math.pow(h,8));let g=_;for(let m=0;m<p.length;m+=8){var f=Math.min(8,p.length-m);const l=parseInt(p.substring(m,m+f),h);f<8?(f=E(Math.pow(h,f)),g=g.j(f).add(E(l))):(g=g.j(c),g=g.add(E(l)))}return g}var _=A(0),K=A(1),W=A(16777216);i=v.prototype,i.m=function(){if(L(this))return-O(this).m();let p=0,h=1;for(let c=0;c<this.g.length;c++){const g=this.i(c);p+=(g>=0?g:4294967296+g)*h,h*=4294967296}return p},i.toString=function(p){if(p=p||10,p<2||36<p)throw Error("radix out of range: "+p);if($(this))return"0";if(L(this))return"-"+O(this).toString(p);const h=E(Math.pow(p,6));var c=this;let g="";for(;;){const f=gt(c,h).g;c=ft(c,f.j(h));let m=((c.g.length>0?c.g[0]:c.h)>>>0).toString(p);if(c=f,$(c))return m+g;for(;m.length<6;)m="0"+m;g=m+g}},i.i=function(p){return p<0?0:p<this.g.length?this.g[p]:this.h};function $(p){if(p.h!=0)return!1;for(let h=0;h<p.g.length;h++)if(p.g[h]!=0)return!1;return!0}function L(p){return p.h==-1}i.l=function(p){return p=ft(this,p),L(p)?-1:$(p)?0:1};function O(p){const h=p.g.length,c=[];for(let g=0;g<h;g++)c[g]=~p.g[g];return new v(c,~p.h).add(K)}i.abs=function(){return L(this)?O(this):this},i.add=function(p){const h=Math.max(this.g.length,p.g.length),c=[];let g=0;for(let f=0;f<=h;f++){let m=g+(this.i(f)&65535)+(p.i(f)&65535),l=(m>>>16)+(this.i(f)>>>16)+(p.i(f)>>>16);g=l>>>16,m&=65535,l&=65535,c[f]=l<<16|m}return new v(c,c[c.length-1]&-2147483648?-1:0)};function ft(p,h){return p.add(O(h))}i.j=function(p){if($(this)||$(p))return _;if(L(this))return L(p)?O(this).j(O(p)):O(O(this).j(p));if(L(p))return O(this.j(O(p)));if(this.l(W)<0&&p.l(W)<0)return E(this.m()*p.m());const h=this.g.length+p.g.length,c=[];for(var g=0;g<2*h;g++)c[g]=0;for(g=0;g<this.g.length;g++)for(let f=0;f<p.g.length;f++){const m=this.i(g)>>>16,l=this.i(g)&65535,F=p.i(f)>>>16,st=p.i(f)&65535;c[2*g+2*f]+=l*st,pt(c,2*g+2*f),c[2*g+2*f+1]+=m*st,pt(c,2*g+2*f+1),c[2*g+2*f+1]+=l*F,pt(c,2*g+2*f+1),c[2*g+2*f+2]+=m*F,pt(c,2*g+2*f+2)}for(p=0;p<h;p++)c[p]=c[2*p+1]<<16|c[2*p];for(p=h;p<2*h;p++)c[p]=0;return new v(c,0)};function pt(p,h){for(;(p[h]&65535)!=p[h];)p[h+1]+=p[h]>>>16,p[h]&=65535,h++}function q(p,h){this.g=p,this.h=h}function gt(p,h){if($(h))throw Error("division by zero");if($(p))return new q(_,_);if(L(p))return h=gt(O(p),h),new q(O(h.g),O(h.h));if(L(h))return h=gt(p,O(h)),new q(O(h.g),h.h);if(p.g.length>30){if(L(p)||L(h))throw Error("slowDivide_ only works with positive integers.");for(var c=K,g=h;g.l(p)<=0;)c=Y(c),g=Y(g);var f=U(c,1),m=U(g,1);for(g=U(g,2),c=U(c,2);!$(g);){var l=m.add(g);l.l(p)<=0&&(f=f.add(c),m=l),g=U(g,1),c=U(c,1)}return h=ft(p,f.j(h)),new q(f,h)}for(f=_;p.l(h)>=0;){for(c=Math.max(1,Math.floor(p.m()/h.m())),g=Math.ceil(Math.log(c)/Math.LN2),g=g<=48?1:Math.pow(2,g-48),m=E(c),l=m.j(h);L(l)||l.l(p)>0;)c-=g,m=E(c),l=m.j(h);$(m)&&(m=K),f=f.add(m),p=ft(p,l)}return new q(f,p)}i.B=function(p){return gt(this,p).h},i.and=function(p){const h=Math.max(this.g.length,p.g.length),c=[];for(let g=0;g<h;g++)c[g]=this.i(g)&p.i(g);return new v(c,this.h&p.h)},i.or=function(p){const h=Math.max(this.g.length,p.g.length),c=[];for(let g=0;g<h;g++)c[g]=this.i(g)|p.i(g);return new v(c,this.h|p.h)},i.xor=function(p){const h=Math.max(this.g.length,p.g.length),c=[];for(let g=0;g<h;g++)c[g]=this.i(g)^p.i(g);return new v(c,this.h^p.h)};function Y(p){const h=p.g.length+1,c=[];for(let g=0;g<h;g++)c[g]=p.i(g)<<1|p.i(g-1)>>>31;return new v(c,p.h)}function U(p,h){const c=h>>5;h%=32;const g=p.g.length-c,f=[];for(let m=0;m<g;m++)f[m]=h>0?p.i(m+c)>>>h|p.i(m+c+1)<<32-h:p.i(m+c);return new v(f,p.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,Eo=a,v.prototype.add=v.prototype.add,v.prototype.multiply=v.prototype.j,v.prototype.modulo=v.prototype.B,v.prototype.compare=v.prototype.l,v.prototype.toNumber=v.prototype.m,v.prototype.toString=v.prototype.toString,v.prototype.getBits=v.prototype.i,v.fromNumber=E,v.fromString=x,bo=v}).apply(typeof fr<"u"?fr:typeof self<"u"?self:typeof window<"u"?window:{});var se=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var To,Ao,_o,So,Co,Io,ko,Do;(function(){var i,r=Object.defineProperty;function s(t){t=[typeof globalThis=="object"&&globalThis,t,typeof window=="object"&&window,typeof self=="object"&&self,typeof se=="object"&&se];for(var e=0;e<t.length;++e){var n=t[e];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}var a=s(this);function u(t,e){if(e)t:{var n=a;t=t.split(".");for(var o=0;o<t.length-1;o++){var d=t[o];if(!(d in n))break t;n=n[d]}t=t[t.length-1],o=n[t],e=e(o),e!=o&&e!=null&&r(n,t,{configurable:!0,writable:!0,value:e})}}u("Symbol.dispose",function(t){return t||Symbol("Symbol.dispose")}),u("Array.prototype.values",function(t){return t||function(){return this[Symbol.iterator]()}}),u("Object.entries",function(t){return t||function(e){var n=[],o;for(o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.push([o,e[o]]);return n}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var w=w||{},v=this||self;function T(t){var e=typeof t;return e=="object"&&t!=null||e=="function"}function A(t,e,n){return t.call.apply(t.bind,arguments)}function E(t,e,n){return E=A,E.apply(null,arguments)}function x(t,e){var n=Array.prototype.slice.call(arguments,1);return function(){var o=n.slice();return o.push.apply(o,arguments),t.apply(this,o)}}function _(t,e){function n(){}n.prototype=e.prototype,t.Z=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.Ob=function(o,d,y){for(var b=Array(arguments.length-2),S=2;S<arguments.length;S++)b[S-2]=arguments[S];return e.prototype[d].apply(o,b)}}var K=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?t=>t&&AsyncContext.Snapshot.wrap(t):t=>t;function W(t){const e=t.length;if(e>0){const n=Array(e);for(let o=0;o<e;o++)n[o]=t[o];return n}return[]}function $(t,e){for(let o=1;o<arguments.length;o++){const d=arguments[o];var n=typeof d;if(n=n!="object"?n:d?Array.isArray(d)?"array":n:"null",n=="array"||n=="object"&&typeof d.length=="number"){n=t.length||0;const y=d.length||0;t.length=n+y;for(let b=0;b<y;b++)t[n+b]=d[b]}else t.push(d)}}class L{constructor(e,n){this.i=e,this.j=n,this.h=0,this.g=null}get(){let e;return this.h>0?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}function O(t){v.setTimeout(()=>{throw t},0)}function ft(){var t=p;let e=null;return t.g&&(e=t.g,t.g=t.g.next,t.g||(t.h=null),e.next=null),e}class pt{constructor(){this.h=this.g=null}add(e,n){const o=q.get();o.set(e,n),this.h?this.h.next=o:this.g=o,this.h=o}}var q=new L(()=>new gt,t=>t.reset());class gt{constructor(){this.next=this.g=this.h=null}set(e,n){this.h=e,this.g=n,this.next=null}reset(){this.next=this.g=this.h=null}}let Y,U=!1,p=new pt,h=()=>{const t=Promise.resolve(void 0);Y=()=>{t.then(c)}};function c(){for(var t;t=ft();){try{t.h.call(t.g)}catch(n){O(n)}var e=q;e.j(t),e.h<100&&(e.h++,t.next=e.g,e.g=t)}U=!1}function g(){this.u=this.u,this.C=this.C}g.prototype.u=!1,g.prototype.dispose=function(){this.u||(this.u=!0,this.N())},g.prototype[Symbol.dispose]=function(){this.dispose()},g.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function f(t,e){this.type=t,this.g=this.target=e,this.defaultPrevented=!1}f.prototype.h=function(){this.defaultPrevented=!0};var m=(function(){if(!v.addEventListener||!Object.defineProperty)return!1;var t=!1,e=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const n=()=>{};v.addEventListener("test",n,e),v.removeEventListener("test",n,e)}catch{}return t})();function l(t){return/^[\s\xa0]*$/.test(t)}function F(t,e){f.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t&&this.init(t,e)}_(F,f),F.prototype.init=function(t,e){const n=this.type=t.type,o=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;this.target=t.target||t.srcElement,this.g=e,e=t.relatedTarget,e||(n=="mouseover"?e=t.fromElement:n=="mouseout"&&(e=t.toElement)),this.relatedTarget=e,o?(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0):(this.clientX=t.clientX!==void 0?t.clientX:t.pageX,this.clientY=t.clientY!==void 0?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType=t.pointerType,this.state=t.state,this.i=t,t.defaultPrevented&&F.Z.h.call(this)},F.prototype.h=function(){F.Z.h.call(this);const t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var st="closure_listenable_"+(Math.random()*1e6|0),xr=0;function Br(t,e,n,o,d){this.listener=t,this.proxy=null,this.src=e,this.type=n,this.capture=!!o,this.ha=d,this.key=++xr,this.da=this.fa=!1}function zt(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function Ut(t,e,n){for(const o in t)e.call(n,t[o],o,t)}function Nr(t,e){for(const n in t)e.call(void 0,t[n],n,t)}function Ze(t){const e={};for(const n in t)e[n]=t[n];return e}const Qe="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function tn(t,e){let n,o;for(let d=1;d<arguments.length;d++){o=arguments[d];for(n in o)t[n]=o[n];for(let y=0;y<Qe.length;y++)n=Qe[y],Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}}function Wt(t){this.src=t,this.g={},this.h=0}Wt.prototype.add=function(t,e,n,o,d){const y=t.toString();t=this.g[y],t||(t=this.g[y]=[],this.h++);const b=fe(t,e,o,d);return b>-1?(e=t[b],n||(e.fa=!1)):(e=new Br(e,this.src,y,!!o,d),e.fa=n,t.push(e)),e};function ue(t,e){const n=e.type;if(n in t.g){var o=t.g[n],d=Array.prototype.indexOf.call(o,e,void 0),y;(y=d>=0)&&Array.prototype.splice.call(o,d,1),y&&(zt(e),t.g[n].length==0&&(delete t.g[n],t.h--))}}function fe(t,e,n,o){for(let d=0;d<t.length;++d){const y=t[d];if(!y.da&&y.listener==e&&y.capture==!!n&&y.ha==o)return d}return-1}var pe="closure_lm_"+(Math.random()*1e6|0),ge={};function en(t,e,n,o,d){if(Array.isArray(e)){for(let y=0;y<e.length;y++)en(t,e[y],n,o,d);return null}return n=sn(n),t&&t[st]?t.J(e,n,T(o)?!!o.capture:!1,d):jr(t,e,n,!1,o,d)}function jr(t,e,n,o,d,y){if(!e)throw Error("Invalid event type");const b=T(d)?!!d.capture:!!d;let S=me(t);if(S||(t[pe]=S=new Wt(t)),n=S.add(e,n,o,b,y),n.proxy)return n;if(o=Hr(),n.proxy=o,o.src=t,o.listener=n,t.addEventListener)m||(d=b),d===void 0&&(d=!1),t.addEventListener(e.toString(),o,d);else if(t.attachEvent)t.attachEvent(rn(e.toString()),o);else if(t.addListener&&t.removeListener)t.addListener(o);else throw Error("addEventListener and attachEvent are unavailable.");return n}function Hr(){function t(n){return e.call(t.src,t.listener,n)}const e=$r;return t}function nn(t,e,n,o,d){if(Array.isArray(e))for(var y=0;y<e.length;y++)nn(t,e[y],n,o,d);else o=T(o)?!!o.capture:!!o,n=sn(n),t&&t[st]?(t=t.i,y=String(e).toString(),y in t.g&&(e=t.g[y],n=fe(e,n,o,d),n>-1&&(zt(e[n]),Array.prototype.splice.call(e,n,1),e.length==0&&(delete t.g[y],t.h--)))):t&&(t=me(t))&&(e=t.g[e.toString()],t=-1,e&&(t=fe(e,n,o,d)),(n=t>-1?e[t]:null)&&de(n))}function de(t){if(typeof t!="number"&&t&&!t.da){var e=t.src;if(e&&e[st])ue(e.i,t);else{var n=t.type,o=t.proxy;e.removeEventListener?e.removeEventListener(n,o,t.capture):e.detachEvent?e.detachEvent(rn(n),o):e.addListener&&e.removeListener&&e.removeListener(o),(n=me(e))?(ue(n,t),n.h==0&&(n.src=null,e[pe]=null)):zt(t)}}}function rn(t){return t in ge?ge[t]:ge[t]="on"+t}function $r(t,e){if(t.da)t=!0;else{e=new F(e,this);const n=t.listener,o=t.ha||t.src;t.fa&&de(t),t=n.call(o,e)}return t}function me(t){return t=t[pe],t instanceof Wt?t:null}var ye="__closure_events_fn_"+(Math.random()*1e9>>>0);function sn(t){return typeof t=="function"?t:(t[ye]||(t[ye]=function(e){return t.handleEvent(e)}),t[ye])}function B(){g.call(this),this.i=new Wt(this),this.M=this,this.G=null}_(B,g),B.prototype[st]=!0,B.prototype.removeEventListener=function(t,e,n,o){nn(this,t,e,n,o)};function j(t,e){var n,o=t.G;if(o)for(n=[];o;o=o.G)n.push(o);if(t=t.M,o=e.type||e,typeof e=="string")e=new f(e,t);else if(e instanceof f)e.target=e.target||t;else{var d=e;e=new f(o,t),tn(e,d)}d=!0;let y,b;if(n)for(b=n.length-1;b>=0;b--)y=e.g=n[b],d=Kt(y,o,!0,e)&&d;if(y=e.g=t,d=Kt(y,o,!0,e)&&d,d=Kt(y,o,!1,e)&&d,n)for(b=0;b<n.length;b++)y=e.g=n[b],d=Kt(y,o,!1,e)&&d}B.prototype.N=function(){if(B.Z.N.call(this),this.i){var t=this.i;for(const e in t.g){const n=t.g[e];for(let o=0;o<n.length;o++)zt(n[o]);delete t.g[e],t.h--}}this.G=null},B.prototype.J=function(t,e,n,o){return this.i.add(String(t),e,!1,n,o)},B.prototype.K=function(t,e,n,o){return this.i.add(String(t),e,!0,n,o)};function Kt(t,e,n,o){if(e=t.i.g[String(e)],!e)return!0;e=e.concat();let d=!0;for(let y=0;y<e.length;++y){const b=e[y];if(b&&!b.da&&b.capture==n){const S=b.listener,P=b.ha||b.src;b.fa&&ue(t.i,b),d=S.call(P,o)!==!1&&d}}return d&&!o.defaultPrevented}function Lr(t,e){if(typeof t!="function")if(t&&typeof t.handleEvent=="function")t=E(t.handleEvent,t);else throw Error("Invalid listener argument");return Number(e)>2147483647?-1:v.setTimeout(t,e||0)}function on(t){t.g=Lr(()=>{t.g=null,t.i&&(t.i=!1,on(t))},t.l);const e=t.h;t.h=null,t.m.apply(null,e)}class Fr extends g{constructor(e,n){super(),this.m=e,this.l=n,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:on(this)}N(){super.N(),this.g&&(v.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function bt(t){g.call(this),this.h=t,this.g={}}_(bt,g);var an=[];function hn(t){Ut(t.g,function(e,n){this.g.hasOwnProperty(n)&&de(e)},t),t.g={}}bt.prototype.N=function(){bt.Z.N.call(this),hn(this)},bt.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ve=v.JSON.stringify,zr=v.JSON.parse,Ur=class{stringify(t){return v.JSON.stringify(t,void 0)}parse(t){return v.JSON.parse(t,void 0)}};function ln(){}function cn(){}var Et={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function we(){f.call(this,"d")}_(we,f);function be(){f.call(this,"c")}_(be,f);var ot={},un=null;function Xt(){return un=un||new B}ot.Ia="serverreachability";function fn(t){f.call(this,ot.Ia,t)}_(fn,f);function Tt(t){const e=Xt();j(e,new fn(e))}ot.STAT_EVENT="statevent";function pn(t,e){f.call(this,ot.STAT_EVENT,t),this.stat=e}_(pn,f);function H(t){const e=Xt();j(e,new pn(e,t))}ot.Ja="timingevent";function gn(t,e){f.call(this,ot.Ja,t),this.size=e}_(gn,f);function At(t,e){if(typeof t!="function")throw Error("Fn must not be null and must be a function");return v.setTimeout(function(){t()},e)}function _t(){this.g=!0}_t.prototype.ua=function(){this.g=!1};function Wr(t,e,n,o,d,y){t.info(function(){if(t.g)if(y){var b="",S=y.split("&");for(let C=0;C<S.length;C++){var P=S[C].split("=");if(P.length>1){const M=P[0];P=P[1];const G=M.split("_");b=G.length>=2&&G[1]=="type"?b+(M+"="+P+"&"):b+(M+"=redacted&")}}}else b=null;else b=y;return"XMLHTTP REQ ("+o+") [attempt "+d+"]: "+e+`
`+n+`
`+b})}function Kr(t,e,n,o,d,y,b){t.info(function(){return"XMLHTTP RESP ("+o+") [ attempt "+d+"]: "+e+`
`+n+`
`+y+" "+b})}function dt(t,e,n,o){t.info(function(){return"XMLHTTP TEXT ("+e+"): "+Gr(t,n)+(o?" "+o:"")})}function Xr(t,e){t.info(function(){return"TIMEOUT: "+e})}_t.prototype.info=function(){};function Gr(t,e){if(!t.g)return e;if(!e)return null;try{const y=JSON.parse(e);if(y){for(t=0;t<y.length;t++)if(Array.isArray(y[t])){var n=y[t];if(!(n.length<2)){var o=n[1];if(Array.isArray(o)&&!(o.length<1)){var d=o[0];if(d!="noop"&&d!="stop"&&d!="close")for(let b=1;b<o.length;b++)o[b]=""}}}}return ve(y)}catch{return e}}var Gt={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},dn={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},mn;function Ee(){}_(Ee,ln),Ee.prototype.g=function(){return new XMLHttpRequest},mn=new Ee;function St(t){return encodeURIComponent(String(t))}function Vr(t){var e=1;t=t.split(":");const n=[];for(;e>0&&t.length;)n.push(t.shift()),e--;return t.length&&n.push(t.join(":")),n}function J(t,e,n,o){this.j=t,this.i=e,this.l=n,this.S=o||1,this.V=new bt(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new yn}function yn(){this.i=null,this.g="",this.h=!1}var vn={},Te={};function Ae(t,e,n){t.M=1,t.A=qt(X(e)),t.u=n,t.R=!0,wn(t,null)}function wn(t,e){t.F=Date.now(),Vt(t),t.B=X(t.A);var n=t.B,o=t.S;Array.isArray(o)||(o=[String(o)]),Pn(n.i,"t",o),t.C=0,n=t.j.L,t.h=new yn,t.g=Yn(t.j,n?e:null,!t.u),t.P>0&&(t.O=new Fr(E(t.Y,t,t.g),t.P)),e=t.V,n=t.g,o=t.ba;var d="readystatechange";Array.isArray(d)||(d&&(an[0]=d.toString()),d=an);for(let y=0;y<d.length;y++){const b=en(n,d[y],o||e.handleEvent,!1,e.h||e);if(!b)break;e.g[b.key]=b}e=t.J?Ze(t.J):{},t.u?(t.v||(t.v="POST"),e["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.B,t.v,t.u,e)):(t.v="GET",t.g.ea(t.B,t.v,null,e)),Tt(),Wr(t.i,t.v,t.B,t.l,t.S,t.u)}J.prototype.ba=function(t){t=t.target;const e=this.O;e&&tt(t)==3?e.j():this.Y(t)},J.prototype.Y=function(t){try{if(t==this.g)t:{const S=tt(this.g),P=this.g.ya(),C=this.g.ca();if(!(S<3)&&(S!=3||this.g&&(this.h.h||this.g.la()||$n(this.g)))){this.K||S!=4||P==7||(P==8||C<=0?Tt(3):Tt(2)),_e(this);var e=this.g.ca();this.X=e;var n=qr(this);if(this.o=e==200,Kr(this.i,this.v,this.B,this.l,this.S,S,e),this.o){if(this.U&&!this.L){e:{if(this.g){var o,d=this.g;if((o=d.g?d.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!l(o)){var y=o;break e}}y=null}if(t=y)dt(this.i,this.l,t,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Se(this,t);else{this.o=!1,this.m=3,H(12),at(this),Ct(this);break t}}if(this.R){t=!0;let M;for(;!this.K&&this.C<n.length;)if(M=Yr(this,n),M==Te){S==4&&(this.m=4,H(14),t=!1),dt(this.i,this.l,null,"[Incomplete Response]");break}else if(M==vn){this.m=4,H(15),dt(this.i,this.l,n,"[Invalid Chunk]"),t=!1;break}else dt(this.i,this.l,M,null),Se(this,M);if(bn(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),S!=4||n.length!=0||this.h.h||(this.m=1,H(16),t=!1),this.o=this.o&&t,!t)dt(this.i,this.l,n,"[Invalid Chunked Response]"),at(this),Ct(this);else if(n.length>0&&!this.W){this.W=!0;var b=this.j;b.g==this&&b.aa&&!b.P&&(b.j.info("Great, no buffering proxy detected. Bytes received: "+n.length),Me(b),b.P=!0,H(11))}}else dt(this.i,this.l,n,null),Se(this,n);S==4&&at(this),this.o&&!this.K&&(S==4?Xn(this.j,this):(this.o=!1,Vt(this)))}else ci(this.g),e==400&&n.indexOf("Unknown SID")>0?(this.m=3,H(12)):(this.m=0,H(13)),at(this),Ct(this)}}}catch{}finally{}};function qr(t){if(!bn(t))return t.g.la();const e=$n(t.g);if(e==="")return"";let n="";const o=e.length,d=tt(t.g)==4;if(!t.h.i){if(typeof TextDecoder>"u")return at(t),Ct(t),"";t.h.i=new v.TextDecoder}for(let y=0;y<o;y++)t.h.h=!0,n+=t.h.i.decode(e[y],{stream:!(d&&y==o-1)});return e.length=0,t.h.g+=n,t.C=0,t.h.g}function bn(t){return t.g?t.v=="GET"&&t.M!=2&&t.j.Aa:!1}function Yr(t,e){var n=t.C,o=e.indexOf(`
`,n);return o==-1?Te:(n=Number(e.substring(n,o)),isNaN(n)?vn:(o+=1,o+n>e.length?Te:(e=e.slice(o,o+n),t.C=o+n,e)))}J.prototype.cancel=function(){this.K=!0,at(this)};function Vt(t){t.T=Date.now()+t.H,En(t,t.H)}function En(t,e){if(t.D!=null)throw Error("WatchDog timer not null");t.D=At(E(t.aa,t),e)}function _e(t){t.D&&(v.clearTimeout(t.D),t.D=null)}J.prototype.aa=function(){this.D=null;const t=Date.now();t-this.T>=0?(Xr(this.i,this.B),this.M!=2&&(Tt(),H(17)),at(this),this.m=2,Ct(this)):En(this,this.T-t)};function Ct(t){t.j.I==0||t.K||Xn(t.j,t)}function at(t){_e(t);var e=t.O;e&&typeof e.dispose=="function"&&e.dispose(),t.O=null,hn(t.V),t.g&&(e=t.g,t.g=null,e.abort(),e.dispose())}function Se(t,e){try{var n=t.j;if(n.I!=0&&(n.g==t||Ce(n.h,t))){if(!t.L&&Ce(n.h,t)&&n.I==3){try{var o=n.Ba.g.parse(e)}catch{o=null}if(Array.isArray(o)&&o.length==3){var d=o;if(d[0]==0){t:if(!n.v){if(n.g)if(n.g.F+3e3<t.F)te(n),Zt(n);else break t;Pe(n),H(18)}}else n.xa=d[1],0<n.xa-n.K&&d[2]<37500&&n.F&&n.A==0&&!n.C&&(n.C=At(E(n.Va,n),6e3));_n(n.h)<=1&&n.ta&&(n.ta=void 0)}else lt(n,11)}else if((t.L||n.g==t)&&te(n),!l(e))for(d=n.Ba.g.parse(e),e=0;e<d.length;e++){let C=d[e];const M=C[0];if(!(M<=n.K))if(n.K=M,C=C[1],n.I==2)if(C[0]=="c"){n.M=C[1],n.ba=C[2];const G=C[3];G!=null&&(n.ka=G,n.j.info("VER="+n.ka));const ct=C[4];ct!=null&&(n.za=ct,n.j.info("SVER="+n.za));const et=C[5];et!=null&&typeof et=="number"&&et>0&&(o=1.5*et,n.O=o,n.j.info("backChannelRequestTimeoutMs_="+o)),o=n;const nt=t.g;if(nt){const ne=nt.g?nt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ne){var y=o.h;y.g||ne.indexOf("spdy")==-1&&ne.indexOf("quic")==-1&&ne.indexOf("h2")==-1||(y.j=y.l,y.g=new Set,y.h&&(Ie(y,y.h),y.h=null))}if(o.G){const xe=nt.g?nt.g.getResponseHeader("X-HTTP-Session-Id"):null;xe&&(o.wa=xe,I(o.J,o.G,xe))}}n.I=3,n.l&&n.l.ra(),n.aa&&(n.T=Date.now()-t.F,n.j.info("Handshake RTT: "+n.T+"ms")),o=n;var b=t;if(o.na=qn(o,o.L?o.ba:null,o.W),b.L){Sn(o.h,b);var S=b,P=o.O;P&&(S.H=P),S.D&&(_e(S),Vt(S)),o.g=b}else Wn(o);n.i.length>0&&Qt(n)}else C[0]!="stop"&&C[0]!="close"||lt(n,7);else n.I==3&&(C[0]=="stop"||C[0]=="close"?C[0]=="stop"?lt(n,7):Oe(n):C[0]!="noop"&&n.l&&n.l.qa(C),n.A=0)}}Tt(4)}catch{}}var Jr=class{constructor(t,e){this.g=t,this.map=e}};function Tn(t){this.l=t||10,v.PerformanceNavigationTiming?(t=v.performance.getEntriesByType("navigation"),t=t.length>0&&(t[0].nextHopProtocol=="hq"||t[0].nextHopProtocol=="h2")):t=!!(v.chrome&&v.chrome.loadTimes&&v.chrome.loadTimes()&&v.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function An(t){return t.h?!0:t.g?t.g.size>=t.j:!1}function _n(t){return t.h?1:t.g?t.g.size:0}function Ce(t,e){return t.h?t.h==e:t.g?t.g.has(e):!1}function Ie(t,e){t.g?t.g.add(e):t.h=e}function Sn(t,e){t.h&&t.h==e?t.h=null:t.g&&t.g.has(e)&&t.g.delete(e)}Tn.prototype.cancel=function(){if(this.i=Cn(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const t of this.g.values())t.cancel();this.g.clear()}};function Cn(t){if(t.h!=null)return t.i.concat(t.h.G);if(t.g!=null&&t.g.size!==0){let e=t.i;for(const n of t.g.values())e=e.concat(n.G);return e}return W(t.i)}var In=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Zr(t,e){if(t){t=t.split("&");for(let n=0;n<t.length;n++){const o=t[n].indexOf("=");let d,y=null;o>=0?(d=t[n].substring(0,o),y=t[n].substring(o+1)):d=t[n],e(d,y?decodeURIComponent(y.replace(/\+/g," ")):"")}}}function Z(t){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let e;t instanceof Z?(this.l=t.l,It(this,t.j),this.o=t.o,this.g=t.g,kt(this,t.u),this.h=t.h,ke(this,Mn(t.i)),this.m=t.m):t&&(e=String(t).match(In))?(this.l=!1,It(this,e[1]||"",!0),this.o=Dt(e[2]||""),this.g=Dt(e[3]||"",!0),kt(this,e[4]),this.h=Dt(e[5]||"",!0),ke(this,e[6]||"",!0),this.m=Dt(e[7]||"")):(this.l=!1,this.i=new Ot(null,this.l))}Z.prototype.toString=function(){const t=[];var e=this.j;e&&t.push(Rt(e,kn,!0),":");var n=this.g;return(n||e=="file")&&(t.push("//"),(e=this.o)&&t.push(Rt(e,kn,!0),"@"),t.push(St(n).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),n=this.u,n!=null&&t.push(":",String(n))),(n=this.h)&&(this.g&&n.charAt(0)!="/"&&t.push("/"),t.push(Rt(n,n.charAt(0)=="/"?ei:ti,!0))),(n=this.i.toString())&&t.push("?",n),(n=this.m)&&t.push("#",Rt(n,ri)),t.join("")},Z.prototype.resolve=function(t){const e=X(this);let n=!!t.j;n?It(e,t.j):n=!!t.o,n?e.o=t.o:n=!!t.g,n?e.g=t.g:n=t.u!=null;var o=t.h;if(n)kt(e,t.u);else if(n=!!t.h){if(o.charAt(0)!="/")if(this.g&&!this.h)o="/"+o;else{var d=e.h.lastIndexOf("/");d!=-1&&(o=e.h.slice(0,d+1)+o)}if(d=o,d==".."||d==".")o="";else if(d.indexOf("./")!=-1||d.indexOf("/.")!=-1){o=d.lastIndexOf("/",0)==0,d=d.split("/");const y=[];for(let b=0;b<d.length;){const S=d[b++];S=="."?o&&b==d.length&&y.push(""):S==".."?((y.length>1||y.length==1&&y[0]!="")&&y.pop(),o&&b==d.length&&y.push("")):(y.push(S),o=!0)}o=y.join("/")}else o=d}return n?e.h=o:n=t.i.toString()!=="",n?ke(e,Mn(t.i)):n=!!t.m,n&&(e.m=t.m),e};function X(t){return new Z(t)}function It(t,e,n){t.j=n?Dt(e,!0):e,t.j&&(t.j=t.j.replace(/:$/,""))}function kt(t,e){if(e){if(e=Number(e),isNaN(e)||e<0)throw Error("Bad port number "+e);t.u=e}else t.u=null}function ke(t,e,n){e instanceof Ot?(t.i=e,ii(t.i,t.l)):(n||(e=Rt(e,ni)),t.i=new Ot(e,t.l))}function I(t,e,n){t.i.set(e,n)}function qt(t){return I(t,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),t}function Dt(t,e){return t?e?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function Rt(t,e,n){return typeof t=="string"?(t=encodeURI(t).replace(e,Qr),n&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function Qr(t){return t=t.charCodeAt(0),"%"+(t>>4&15).toString(16)+(t&15).toString(16)}var kn=/[#\/\?@]/g,ti=/[#\?:]/g,ei=/[#\?]/g,ni=/[#\?@]/g,ri=/#/g;function Ot(t,e){this.h=this.g=null,this.i=t||null,this.j=!!e}function ht(t){t.g||(t.g=new Map,t.h=0,t.i&&Zr(t.i,function(e,n){t.add(decodeURIComponent(e.replace(/\+/g," ")),n)}))}i=Ot.prototype,i.add=function(t,e){ht(this),this.i=null,t=mt(this,t);let n=this.g.get(t);return n||this.g.set(t,n=[]),n.push(e),this.h+=1,this};function Dn(t,e){ht(t),e=mt(t,e),t.g.has(e)&&(t.i=null,t.h-=t.g.get(e).length,t.g.delete(e))}function Rn(t,e){return ht(t),e=mt(t,e),t.g.has(e)}i.forEach=function(t,e){ht(this),this.g.forEach(function(n,o){n.forEach(function(d){t.call(e,d,o,this)},this)},this)};function On(t,e){ht(t);let n=[];if(typeof e=="string")Rn(t,e)&&(n=n.concat(t.g.get(mt(t,e))));else for(t=Array.from(t.g.values()),e=0;e<t.length;e++)n=n.concat(t[e]);return n}i.set=function(t,e){return ht(this),this.i=null,t=mt(this,t),Rn(this,t)&&(this.h-=this.g.get(t).length),this.g.set(t,[e]),this.h+=1,this},i.get=function(t,e){return t?(t=On(this,t),t.length>0?String(t[0]):e):e};function Pn(t,e,n){Dn(t,e),n.length>0&&(t.i=null,t.g.set(mt(t,e),W(n)),t.h+=n.length)}i.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],e=Array.from(this.g.keys());for(let o=0;o<e.length;o++){var n=e[o];const d=St(n);n=On(this,n);for(let y=0;y<n.length;y++){let b=d;n[y]!==""&&(b+="="+St(n[y])),t.push(b)}}return this.i=t.join("&")};function Mn(t){const e=new Ot;return e.i=t.i,t.g&&(e.g=new Map(t.g),e.h=t.h),e}function mt(t,e){return e=String(e),t.j&&(e=e.toLowerCase()),e}function ii(t,e){e&&!t.j&&(ht(t),t.i=null,t.g.forEach(function(n,o){const d=o.toLowerCase();o!=d&&(Dn(this,o),Pn(this,d,n))},t)),t.j=e}function si(t,e){const n=new _t;if(v.Image){const o=new Image;o.onload=x(Q,n,"TestLoadImage: loaded",!0,e,o),o.onerror=x(Q,n,"TestLoadImage: error",!1,e,o),o.onabort=x(Q,n,"TestLoadImage: abort",!1,e,o),o.ontimeout=x(Q,n,"TestLoadImage: timeout",!1,e,o),v.setTimeout(function(){o.ontimeout&&o.ontimeout()},1e4),o.src=t}else e(!1)}function oi(t,e){const n=new _t,o=new AbortController,d=setTimeout(()=>{o.abort(),Q(n,"TestPingServer: timeout",!1,e)},1e4);fetch(t,{signal:o.signal}).then(y=>{clearTimeout(d),y.ok?Q(n,"TestPingServer: ok",!0,e):Q(n,"TestPingServer: server error",!1,e)}).catch(()=>{clearTimeout(d),Q(n,"TestPingServer: error",!1,e)})}function Q(t,e,n,o,d){try{d&&(d.onload=null,d.onerror=null,d.onabort=null,d.ontimeout=null),o(n)}catch{}}function ai(){this.g=new Ur}function De(t){this.i=t.Sb||null,this.h=t.ab||!1}_(De,ln),De.prototype.g=function(){return new Yt(this.i,this.h)};function Yt(t,e){B.call(this),this.H=t,this.o=e,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}_(Yt,B),i=Yt.prototype,i.open=function(t,e){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=t,this.D=e,this.readyState=1,Mt(this)},i.send=function(t){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const e={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};t&&(e.body=t),(this.H||v).fetch(new Request(this.D,e)).then(this.Pa.bind(this),this.ga.bind(this))},i.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Pt(this)),this.readyState=0},i.Pa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Mt(this)),this.g&&(this.readyState=3,Mt(this),this.g)))if(this.responseType==="arraybuffer")t.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof v.ReadableStream<"u"&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;xn(this)}else t.text().then(this.Oa.bind(this),this.ga.bind(this))};function xn(t){t.j.read().then(t.Ma.bind(t)).catch(t.ga.bind(t))}i.Ma=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var e=t.value?t.value:new Uint8Array(0);(e=this.B.decode(e,{stream:!t.done}))&&(this.response=this.responseText+=e)}t.done?Pt(this):Mt(this),this.readyState==3&&xn(this)}},i.Oa=function(t){this.g&&(this.response=this.responseText=t,Pt(this))},i.Na=function(t){this.g&&(this.response=t,Pt(this))},i.ga=function(){this.g&&Pt(this)};function Pt(t){t.readyState=4,t.l=null,t.j=null,t.B=null,Mt(t)}i.setRequestHeader=function(t,e){this.A.append(t,e)},i.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},i.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],e=this.h.entries();for(var n=e.next();!n.done;)n=n.value,t.push(n[0]+": "+n[1]),n=e.next();return t.join(`\r
`)};function Mt(t){t.onreadystatechange&&t.onreadystatechange.call(t)}Object.defineProperty(Yt.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(t){this.m=t?"include":"same-origin"}});function Bn(t){let e="";return Ut(t,function(n,o){e+=o,e+=":",e+=n,e+=`\r
`}),e}function Re(t,e,n){t:{for(o in n){var o=!1;break t}o=!0}o||(n=Bn(n),typeof t=="string"?n!=null&&St(n):I(t,e,n))}function D(t){B.call(this),this.headers=new Map,this.L=t||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}_(D,B);var hi=/^https?$/i,li=["POST","PUT"];i=D.prototype,i.Fa=function(t){this.H=t},i.ea=function(t,e,n,o){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);e=e?e.toUpperCase():"GET",this.D=t,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():mn.g(),this.g.onreadystatechange=K(E(this.Ca,this));try{this.B=!0,this.g.open(e,String(t),!0),this.B=!1}catch(y){Nn(this,y);return}if(t=n||"",n=new Map(this.headers),o)if(Object.getPrototypeOf(o)===Object.prototype)for(var d in o)n.set(d,o[d]);else if(typeof o.keys=="function"&&typeof o.get=="function")for(const y of o.keys())n.set(y,o.get(y));else throw Error("Unknown input type for opt_headers: "+String(o));o=Array.from(n.keys()).find(y=>y.toLowerCase()=="content-type"),d=v.FormData&&t instanceof v.FormData,!(Array.prototype.indexOf.call(li,e,void 0)>=0)||o||d||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[y,b]of n)this.g.setRequestHeader(y,b);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(t),this.v=!1}catch(y){Nn(this,y)}};function Nn(t,e){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=e,t.o=5,jn(t),Jt(t)}function jn(t){t.A||(t.A=!0,j(t,"complete"),j(t,"error"))}i.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=t||7,j(this,"complete"),j(this,"abort"),Jt(this))},i.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Jt(this,!0)),D.Z.N.call(this)},i.Ca=function(){this.u||(this.B||this.v||this.j?Hn(this):this.Xa())},i.Xa=function(){Hn(this)};function Hn(t){if(t.h&&typeof w<"u"){if(t.v&&tt(t)==4)setTimeout(t.Ca.bind(t),0);else if(j(t,"readystatechange"),tt(t)==4){t.h=!1;try{const y=t.ca();t:switch(y){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break t;default:e=!1}var n;if(!(n=e)){var o;if(o=y===0){let b=String(t.D).match(In)[1]||null;!b&&v.self&&v.self.location&&(b=v.self.location.protocol.slice(0,-1)),o=!hi.test(b?b.toLowerCase():"")}n=o}if(n)j(t,"complete"),j(t,"success");else{t.o=6;try{var d=tt(t)>2?t.g.statusText:""}catch{d=""}t.l=d+" ["+t.ca()+"]",jn(t)}}finally{Jt(t)}}}}function Jt(t,e){if(t.g){t.m&&(clearTimeout(t.m),t.m=null);const n=t.g;t.g=null,e||j(t,"ready");try{n.onreadystatechange=null}catch{}}}i.isActive=function(){return!!this.g};function tt(t){return t.g?t.g.readyState:0}i.ca=function(){try{return tt(this)>2?this.g.status:-1}catch{return-1}},i.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},i.La=function(t){if(this.g){var e=this.g.responseText;return t&&e.indexOf(t)==0&&(e=e.substring(t.length)),zr(e)}};function $n(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.F){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch{return null}}function ci(t){const e={};t=(t.g&&tt(t)>=2&&t.g.getAllResponseHeaders()||"").split(`\r
`);for(let o=0;o<t.length;o++){if(l(t[o]))continue;var n=Vr(t[o]);const d=n[0];if(n=n[1],typeof n!="string")continue;n=n.trim();const y=e[d]||[];e[d]=y,y.push(n)}Nr(e,function(o){return o.join(", ")})}i.ya=function(){return this.o},i.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function xt(t,e,n){return n&&n.internalChannelParams&&n.internalChannelParams[t]||e}function Ln(t){this.za=0,this.i=[],this.j=new _t,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=xt("failFast",!1,t),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=xt("baseRetryDelayMs",5e3,t),this.Za=xt("retryDelaySeedMs",1e4,t),this.Ta=xt("forwardChannelMaxRetries",2,t),this.va=xt("forwardChannelRequestTimeoutMs",2e4,t),this.ma=t&&t.xmlHttpFactory||void 0,this.Ua=t&&t.Rb||void 0,this.Aa=t&&t.useFetchStreams||!1,this.O=void 0,this.L=t&&t.supportsCrossDomainXhr||!1,this.M="",this.h=new Tn(t&&t.concurrentRequestLimit),this.Ba=new ai,this.S=t&&t.fastHandshake||!1,this.R=t&&t.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=t&&t.Pb||!1,t&&t.ua&&this.j.ua(),t&&t.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&t&&t.detectBufferingProxy||!1,this.ia=void 0,t&&t.longPollingTimeout&&t.longPollingTimeout>0&&(this.ia=t.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}i=Ln.prototype,i.ka=8,i.I=1,i.connect=function(t,e,n,o){H(0),this.W=t,this.H=e||{},n&&o!==void 0&&(this.H.OSID=n,this.H.OAID=o),this.F=this.X,this.J=qn(this,null,this.W),Qt(this)};function Oe(t){if(Fn(t),t.I==3){var e=t.V++,n=X(t.J);if(I(n,"SID",t.M),I(n,"RID",e),I(n,"TYPE","terminate"),Bt(t,n),e=new J(t,t.j,e),e.M=2,e.A=qt(X(n)),n=!1,v.navigator&&v.navigator.sendBeacon)try{n=v.navigator.sendBeacon(e.A.toString(),"")}catch{}!n&&v.Image&&(new Image().src=e.A,n=!0),n||(e.g=Yn(e.j,null),e.g.ea(e.A)),e.F=Date.now(),Vt(e)}Vn(t)}function Zt(t){t.g&&(Me(t),t.g.cancel(),t.g=null)}function Fn(t){Zt(t),t.v&&(v.clearTimeout(t.v),t.v=null),te(t),t.h.cancel(),t.m&&(typeof t.m=="number"&&v.clearTimeout(t.m),t.m=null)}function Qt(t){if(!An(t.h)&&!t.m){t.m=!0;var e=t.Ea;Y||h(),U||(Y(),U=!0),p.add(e,t),t.D=0}}function ui(t,e){return _n(t.h)>=t.h.j-(t.m?1:0)?!1:t.m?(t.i=e.G.concat(t.i),!0):t.I==1||t.I==2||t.D>=(t.Sa?0:t.Ta)?!1:(t.m=At(E(t.Ea,t,e),Gn(t,t.D)),t.D++,!0)}i.Ea=function(t){if(this.m)if(this.m=null,this.I==1){if(!t){this.V=Math.floor(Math.random()*1e5),t=this.V++;const d=new J(this,this.j,t);let y=this.o;if(this.U&&(y?(y=Ze(y),tn(y,this.U)):y=this.U),this.u!==null||this.R||(d.J=y,y=null),this.S)t:{for(var e=0,n=0;n<this.i.length;n++){e:{var o=this.i[n];if("__data__"in o.map&&(o=o.map.__data__,typeof o=="string")){o=o.length;break e}o=void 0}if(o===void 0)break;if(e+=o,e>4096){e=n;break t}if(e===4096||n===this.i.length-1){e=n+1;break t}}e=1e3}else e=1e3;e=Un(this,d,e),n=X(this.J),I(n,"RID",t),I(n,"CVER",22),this.G&&I(n,"X-HTTP-Session-Id",this.G),Bt(this,n),y&&(this.R?e="headers="+St(Bn(y))+"&"+e:this.u&&Re(n,this.u,y)),Ie(this.h,d),this.Ra&&I(n,"TYPE","init"),this.S?(I(n,"$req",e),I(n,"SID","null"),d.U=!0,Ae(d,n,null)):Ae(d,n,e),this.I=2}}else this.I==3&&(t?zn(this,t):this.i.length==0||An(this.h)||zn(this))};function zn(t,e){var n;e?n=e.l:n=t.V++;const o=X(t.J);I(o,"SID",t.M),I(o,"RID",n),I(o,"AID",t.K),Bt(t,o),t.u&&t.o&&Re(o,t.u,t.o),n=new J(t,t.j,n,t.D+1),t.u===null&&(n.J=t.o),e&&(t.i=e.G.concat(t.i)),e=Un(t,n,1e3),n.H=Math.round(t.va*.5)+Math.round(t.va*.5*Math.random()),Ie(t.h,n),Ae(n,o,e)}function Bt(t,e){t.H&&Ut(t.H,function(n,o){I(e,o,n)}),t.l&&Ut({},function(n,o){I(e,o,n)})}function Un(t,e,n){n=Math.min(t.i.length,n);const o=t.l?E(t.l.Ka,t.l,t):null;t:{var d=t.i;let S=-1;for(;;){const P=["count="+n];S==-1?n>0?(S=d[0].g,P.push("ofs="+S)):S=0:P.push("ofs="+S);let C=!0;for(let M=0;M<n;M++){var y=d[M].g;const G=d[M].map;if(y-=S,y<0)S=Math.max(0,d[M].g-100),C=!1;else try{y="req"+y+"_"||"";try{var b=G instanceof Map?G:Object.entries(G);for(const[ct,et]of b){let nt=et;T(et)&&(nt=ve(et)),P.push(y+ct+"="+encodeURIComponent(nt))}}catch(ct){throw P.push(y+"type="+encodeURIComponent("_badmap")),ct}}catch{o&&o(G)}}if(C){b=P.join("&");break t}}b=void 0}return t=t.i.splice(0,n),e.G=t,b}function Wn(t){if(!t.g&&!t.v){t.Y=1;var e=t.Da;Y||h(),U||(Y(),U=!0),p.add(e,t),t.A=0}}function Pe(t){return t.g||t.v||t.A>=3?!1:(t.Y++,t.v=At(E(t.Da,t),Gn(t,t.A)),t.A++,!0)}i.Da=function(){if(this.v=null,Kn(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var t=4*this.T;this.j.info("BP detection timer enabled: "+t),this.B=At(E(this.Wa,this),t)}},i.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,H(10),Zt(this),Kn(this))};function Me(t){t.B!=null&&(v.clearTimeout(t.B),t.B=null)}function Kn(t){t.g=new J(t,t.j,"rpc",t.Y),t.u===null&&(t.g.J=t.o),t.g.P=0;var e=X(t.na);I(e,"RID","rpc"),I(e,"SID",t.M),I(e,"AID",t.K),I(e,"CI",t.F?"0":"1"),!t.F&&t.ia&&I(e,"TO",t.ia),I(e,"TYPE","xmlhttp"),Bt(t,e),t.u&&t.o&&Re(e,t.u,t.o),t.O&&(t.g.H=t.O);var n=t.g;t=t.ba,n.M=1,n.A=qt(X(e)),n.u=null,n.R=!0,wn(n,t)}i.Va=function(){this.C!=null&&(this.C=null,Zt(this),Pe(this),H(19))};function te(t){t.C!=null&&(v.clearTimeout(t.C),t.C=null)}function Xn(t,e){var n=null;if(t.g==e){te(t),Me(t),t.g=null;var o=2}else if(Ce(t.h,e))n=e.G,Sn(t.h,e),o=1;else return;if(t.I!=0){if(e.o)if(o==1){n=e.u?e.u.length:0,e=Date.now()-e.F;var d=t.D;o=Xt(),j(o,new gn(o,n)),Qt(t)}else Wn(t);else if(d=e.m,d==3||d==0&&e.X>0||!(o==1&&ui(t,e)||o==2&&Pe(t)))switch(n&&n.length>0&&(e=t.h,e.i=e.i.concat(n)),d){case 1:lt(t,5);break;case 4:lt(t,10);break;case 3:lt(t,6);break;default:lt(t,2)}}}function Gn(t,e){let n=t.Qa+Math.floor(Math.random()*t.Za);return t.isActive()||(n*=2),n*e}function lt(t,e){if(t.j.info("Error code "+e),e==2){var n=E(t.bb,t),o=t.Ua;const d=!o;o=new Z(o||"//www.google.com/images/cleardot.gif"),v.location&&v.location.protocol=="http"||It(o,"https"),qt(o),d?si(o.toString(),n):oi(o.toString(),n)}else H(2);t.I=0,t.l&&t.l.pa(e),Vn(t),Fn(t)}i.bb=function(t){t?(this.j.info("Successfully pinged google.com"),H(2)):(this.j.info("Failed to ping google.com"),H(1))};function Vn(t){if(t.I=0,t.ja=[],t.l){const e=Cn(t.h);(e.length!=0||t.i.length!=0)&&($(t.ja,e),$(t.ja,t.i),t.h.i.length=0,W(t.i),t.i.length=0),t.l.oa()}}function qn(t,e,n){var o=n instanceof Z?X(n):new Z(n);if(o.g!="")e&&(o.g=e+"."+o.g),kt(o,o.u);else{var d=v.location;o=d.protocol,e=e?e+"."+d.hostname:d.hostname,d=+d.port;const y=new Z(null);o&&It(y,o),e&&(y.g=e),d&&kt(y,d),n&&(y.h=n),o=y}return n=t.G,e=t.wa,n&&e&&I(o,n,e),I(o,"VER",t.ka),Bt(t,o),o}function Yn(t,e,n){if(e&&!t.L)throw Error("Can't create secondary domain capable XhrIo object.");return e=t.Aa&&!t.ma?new D(new De({ab:n})):new D(t.ma),e.Fa(t.L),e}i.isActive=function(){return!!this.l&&this.l.isActive(this)};function Jn(){}i=Jn.prototype,i.ra=function(){},i.qa=function(){},i.pa=function(){},i.oa=function(){},i.isActive=function(){return!0},i.Ka=function(){};function ee(){}ee.prototype.g=function(t,e){return new z(t,e)};function z(t,e){B.call(this),this.g=new Ln(e),this.l=t,this.h=e&&e.messageUrlParams||null,t=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(t?t["X-WebChannel-Content-Type"]=e.messageContentType:t={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.sa&&(t?t["X-WebChannel-Client-Profile"]=e.sa:t={"X-WebChannel-Client-Profile":e.sa}),this.g.U=t,(t=e&&e.Qb)&&!l(t)&&(this.g.u=t),this.A=e&&e.supportsCrossDomainXhr||!1,this.v=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!l(e)&&(this.g.G=e,t=this.h,t!==null&&e in t&&(t=this.h,e in t&&delete t[e])),this.j=new yt(this)}_(z,B),z.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},z.prototype.close=function(){Oe(this.g)},z.prototype.o=function(t){var e=this.g;if(typeof t=="string"){var n={};n.__data__=t,t=n}else this.v&&(n={},n.__data__=ve(t),t=n);e.i.push(new Jr(e.Ya++,t)),e.I==3&&Qt(e)},z.prototype.N=function(){this.g.l=null,delete this.j,Oe(this.g),delete this.g,z.Z.N.call(this)};function Zn(t){we.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var e=t.__sm__;if(e){t:{for(const n in e){t=n;break t}t=void 0}(this.i=t)&&(t=this.i,e=e!==null&&t in e?e[t]:void 0),this.data=e}else this.data=t}_(Zn,we);function Qn(){be.call(this),this.status=1}_(Qn,be);function yt(t){this.g=t}_(yt,Jn),yt.prototype.ra=function(){j(this.g,"a")},yt.prototype.qa=function(t){j(this.g,new Zn(t))},yt.prototype.pa=function(t){j(this.g,new Qn)},yt.prototype.oa=function(){j(this.g,"b")},ee.prototype.createWebChannel=ee.prototype.g,z.prototype.send=z.prototype.o,z.prototype.open=z.prototype.m,z.prototype.close=z.prototype.close,Do=function(){return new ee},ko=function(){return Xt()},Io=ot,Co={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Gt.NO_ERROR=0,Gt.TIMEOUT=8,Gt.HTTP_ERROR=6,So=Gt,dn.COMPLETE="complete",_o=dn,cn.EventType=Et,Et.OPEN="a",Et.CLOSE="b",Et.ERROR="c",Et.MESSAGE="d",B.prototype.listen=B.prototype.J,Ao=cn,D.prototype.listenOnce=D.prototype.K,D.prototype.getLastError=D.prototype.Ha,D.prototype.getLastErrorCode=D.prototype.ya,D.prototype.getStatus=D.prototype.ca,D.prototype.getResponseJson=D.prototype.La,D.prototype.getResponseText=D.prototype.la,D.prototype.send=D.prototype.ea,D.prototype.setWithCredentials=D.prototype.Fa,To=D}).apply(typeof se<"u"?se:typeof self<"u"?self:typeof window<"u"?window:{});export{Ko as A,yi as B,wt as C,zo as D,Io as E,Ft as F,Ei as G,Ho as H,bo as I,Fo as J,Uo as K,vr as L,Eo as M,Wo as N,jt as O,Bo as P,Es as Q,Yo as R,qo as S,Je as T,Jo as U,Ao as W,To as X,Ht as _,Vo as a,wr as b,Oo as c,Ts as d,Mo as e,k as f,Mi as g,$e as h,Xo as i,ko as j,_o as k,So as l,Do as m,$o as n,mr as o,Go as p,gr as q,Nt as r,Ke as s,Lo as t,Co as u,Po as v,xo as w,jo as x,No as y,Xe as z};
