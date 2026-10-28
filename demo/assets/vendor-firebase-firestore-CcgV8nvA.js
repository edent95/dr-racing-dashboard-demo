import{L as Vh,I as $t,_ as Rh,g as be,F as Ph,a as Ye,b as Gu,d as Ku,i as ta,p as ju,c as xh,e as bh,f as Sh,h as Ch,E as Dh,X as Nh,j as kh,k as _i,W as es,l as Oh,m as Qu,n as Ts,o as Lh,q as Mh,r as Wu,M as Fh,S as Ao,s as Uh,C as Bh,t as vo,u as qh}from"./vendor-firebase-BFwEYO3r.js";import{R as na}from"./vendor-re2js-C8U-Xn59.js";/**
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
 */class ae{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ae.UNAUTHENTICATED=new ae(null),ae.GOOGLE_CREDENTIALS=new ae("google-credentials-uid"),ae.FIRST_PARTY=new ae("first-party-uid"),ae.MOCK_USER=new ae("mock-user");/**
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
 */let Un="12.15.0";function zh(r){Un=r}/**
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
 *//**
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
 */const Wt=new Vh("@firebase/firestore");function dn(){return Wt.logLevel}function I(r,...e){if(Wt.logLevel<=Ye.DEBUG){const t=e.map(ra);Wt.debug(`Firestore (${Un}): ${r}`,...t)}}function Y(r,...e){if(Wt.logLevel<=Ye.ERROR){const t=e.map(ra);Wt.error(`Firestore (${Un}): ${r}`,...t)}}function Ne(r,...e){if(Wt.logLevel<=Ye.WARN){const t=e.map(ra);Wt.warn(`Firestore (${Un}): ${r}`,...t)}}function ra(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function v(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,Hu(r,n,t)}function Hu(r,e,t){let n=`FIRESTORE (${Un}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw Y(n),new Error(n)}function E(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||Hu(e,s,n)}function V(r,e){return r}/**
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
 */const p={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class T extends Ph{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Me{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Yu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class $h{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(ae.UNAUTHENTICATED)))}shutdown(){}}class Gh{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Kh{constructor(e){this.t=e,this.currentUser=ae.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){E(this.o===void 0,42304);let n=this.i;const s=u=>this.i!==n?(n=this.i,t(u)):Promise.resolve();let i=new Me;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Me,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const u=i;e.enqueueRetryable((async()=>{await u.promise,await s(this.currentUser)}))},o=u=>{I("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((u=>o(u))),setTimeout((()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?o(u):(I("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Me)}}),0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.i!==e?(I("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(E(typeof n.accessToken=="string",31837,{l:n}),new Yu(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return E(e===null||typeof e=="string",2055,{h:e}),new ae(e)}}class jh{constructor(e,t,n){this.T=e,this.P=t,this.R=n,this.type="FirstParty",this.user=ae.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);const e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class Qh{constructor(e,t,n){this.T=e,this.P=t,this.R=n}getToken(){return Promise.resolve(new jh(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable((()=>t(ae.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Vo{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Wh{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Rh(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){E(this.o===void 0,3512);const n=i=>{i.error!=null&&I("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.m;return this.m=i.token,I("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{I("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):I("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Vo(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(E(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Vo(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Hh(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class sa{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=Hh(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function S(r,e){return r<e?-1:r>e?1:0}function Ri(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return pi(s)===pi(i)?S(s,i):pi(s)?1:-1}return S(r.length,e.length)}const Yh=55296,Jh=57343;function pi(r){const e=r.charCodeAt(0);return e>=Yh&&e<=Jh}function yn(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}function Ju(r){return r+"\0"}/**
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
 */const Be="__name__";class Fe{constructor(e,t,n){t===void 0?t=0:t>e.length&&v(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&v(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return Fe.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Fe?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=Fe.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return S(e.length,t.length)}static compareSegments(e,t){const n=Fe.isNumericId(e),s=Fe.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?Fe.extractNumericId(e).compare(Fe.extractNumericId(t)):Ri(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return $t.fromString(e.substring(4,e.length-2))}}class D extends Fe{construct(e,t,n){return new D(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new T(p.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new D(t)}static emptyPath(){return new D([])}}const Xh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class $ extends Fe{construct(e,t,n){return new $(e,t,n)}static isValidIdentifier(e){return Xh.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),$.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Be}static keyField(){return new $([Be])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new T(p.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let a=!1;for(;s<e.length;){const o=e[s];if(o==="\\"){if(s+1===e.length)throw new T(p.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new T(p.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=u,s+=2}else o==="`"?(a=!a,s++):o!=="."||a?(n+=o,s++):(i(),s++)}if(i(),a)throw new T(p.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new $(t)}static emptyPath(){return new $([])}}/**
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
 */class A{constructor(e){this.path=e}static fromPath(e){return new A(D.fromString(e))}static fromName(e){return new A(D.fromString(e).popFirst(5))}static empty(){return new A(D.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&D.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return D.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new A(new D(e.slice()))}}/**
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
 */function Xu(r,e,t){if(!t)throw new T(p.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Zh(r,e,t,n){if(e===!0&&n===!0)throw new T(p.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Ro(r){if(!A.isDocumentKey(r))throw new T(p.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Po(r){if(A.isDocumentKey(r))throw new T(p.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function Mr(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function $s(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":v(12329,{type:typeof r})}function ne(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new T(p.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=$s(r);throw new T(p.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
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
 */function X(r,e){const t={typeString:r};return e&&(t.value=e),t}function Fr(r,e){if(!Mr(r))throw new T(p.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const a=r[n];if(s&&typeof a!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new T(p.INVALID_ARGUMENT,t);return!0}/**
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
 */const xo=-62135596800,bo=1e6;class U{static now(){return U.fromMillis(Date.now())}static fromDate(e){return U.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*bo);return new U(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new T(p.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new T(p.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<xo)throw new T(p.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new T(p.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/bo}_compareTo(e){return this.seconds===e.seconds?S(this.nanoseconds,e.nanoseconds):S(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:U._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Fr(e,U._jsonSchema))return new U(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-xo;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}U._jsonSchemaVersion="firestore/timestamp/1.0",U._jsonSchema={type:X("string",U._jsonSchemaVersion),seconds:X("number"),nanoseconds:X("number")};/**
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
 */class P{static fromTimestamp(e){return new P(e)}static min(){return new P(new U(0,0))}static max(){return new P(new U(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */const In=-1;class Es{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function Pi(r){return r.fields.find((e=>e.kind===2))}function kt(r){return r.fields.filter((e=>e.kind!==2))}Es.UNKNOWN_ID=-1;class cs{constructor(e,t){this.fieldPath=e,this.kind=t}}class yr{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new yr(0,Se.min())}}function Zu(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=P.fromTimestamp(n===1e9?new U(t+1,0):new U(t,n));return new Se(s,A.empty(),e)}function ec(r){return new Se(r.readTime,r.key,In)}class Se{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Se(P.min(),A.empty(),In)}static max(){return new Se(P.max(),A.empty(),In)}}function ia(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=A.comparator(r.documentKey,e.documentKey),t!==0?t:S(r.largestBatchId,e.largestBatchId))}/**
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
 */const tc="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class nc{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function bt(r){if(r.code!==p.FAILED_PRECONDITION||r.message!==tc)throw r;I("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class m{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&v(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new m(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof m?t:m.resolve(t)}catch(t){return m.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):m.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):m.reject(t)}static resolve(e){return new m(((t,n)=>{t(e)}))}static reject(e){return new m(((t,n)=>{n(e)}))}static waitFor(e){return new m(((t,n)=>{let s=0,i=0,a=!1;e.forEach((o=>{++s,o.next((()=>{++i,a&&i===s&&t()}),(u=>n(u)))})),a=!0,i===s&&t()}))}static or(e){let t=m.resolve(!1);for(const n of e)t=t.next((s=>s?m.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new m(((n,s)=>{const i=e.length,a=new Array(i);let o=0;for(let u=0;u<i;u++){const c=u;t(e[c]).next((l=>{a[c]=l,++o,o===i&&n(a)}),(l=>s(l)))}}))}static doWhile(e,t){return new m(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}/**
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
 */const Ve="SimpleDb";class Gs{static open(e,t,n,s){try{return new Gs(t,e.transaction(s,n))}catch(i){throw new ar(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.v=new Me,this.transaction.oncomplete=()=>{this.v.resolve()},this.transaction.onabort=()=>{t.error?this.v.reject(new ar(e,t.error)):this.v.resolve()},this.transaction.onerror=n=>{const s=aa(n.target.error);this.v.reject(new ar(e,s))}}get S(){return this.v.promise}abort(e){e&&this.v.reject(e),this.aborted||(I(Ve,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}D(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new td(t)}}class pt{static delete(e){return I(Ve,"Removing database:",e),Lt(Lh().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!Mh())return!1;if(pt.F())return!0;const e=Ts(),t=pt.O(e),n=0<t&&t<10,s=rc(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static M(e,t){return e.store(t)}static O(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.N=n,this.L=null,pt.O(Ts())===12.2&&Y("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async B(e){return this.db||(I(Ve,"Opening database:",this.name),this.db=await new Promise(((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;t(a)},s.onblocked=()=>{n(new ar(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new T(p.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new T(p.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new ar(e,a))},s.onupgradeneeded=i=>{I(Ve,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.N.U(a,s.transaction,i.oldVersion,this.version).next((()=>{I(Ve,"Database upgrade to version "+this.version+" complete")}))}}))),this.k&&(this.db.onversionchange=t=>this.k(t)),this.db}q(e){this.k=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let a=0;for(;;){++a;try{this.db=await this.B(e);const o=Gs.open(this.db,e,i?"readonly":"readwrite",n),u=s(o).next((c=>(o.D(),c))).catch((c=>(o.abort(c),m.reject(c)))).toPromise();return u.catch((()=>{})),await o.S,u}catch(o){const u=o,c=u.name!=="FirebaseError"&&a<3;if(I(Ve,"Transaction failed with error:",u.message,"Retrying:",c),this.close(),!c)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function rc(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class ed{constructor(e){this.$=e,this.K=!1,this.W=null}get isDone(){return this.K}get G(){return this.W}set cursor(e){this.$=e}done(){this.K=!0}j(e){this.W=e}delete(){return Lt(this.$.delete())}}class ar extends T{constructor(e,t){super(p.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function St(r){return r.name==="IndexedDbTransactionError"}class td{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(I(Ve,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(I(Ve,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),Lt(n)}add(e){return I(Ve,"ADD",this.store.name,e,e),Lt(this.store.add(e))}get(e){return Lt(this.store.get(e)).next((t=>(t===void 0&&(t=null),I(Ve,"GET",this.store.name,e,t),t)))}delete(e){return I(Ve,"DELETE",this.store.name,e),Lt(this.store.delete(e))}count(){return I(Ve,"COUNT",this.store.name),Lt(this.store.count())}H(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new m(((a,o)=>{i.onerror=u=>{o(u.target.error)},i.onsuccess=u=>{a(u.target.result)}}))}{const i=this.cursor(n),a=[];return this.J(i,((o,u)=>{a.push(u)})).next((()=>a))}}Y(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new m(((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}}))}Z(e,t){I(Ve,"DELETE ALL",this.store.name);const n=this.options(e,t);n.X=!1;const s=this.cursor(n);return this.J(s,((i,a,o)=>o.delete()))}ee(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.J(s,t)}te(e){const t=this.cursor({});return new m(((n,s)=>{t.onerror=i=>{const a=aa(i.target.error);s(a)},t.onsuccess=i=>{const a=i.target.result;a?e(a.primaryKey,a.value).next((o=>{o?a.continue():n()})):n()}}))}J(e,t){const n=[];return new m(((s,i)=>{e.onerror=a=>{i(a.target.error)},e.onsuccess=a=>{const o=a.target.result;if(!o)return void s();const u=new ed(o),c=t(o.primaryKey,o.value,u);if(c instanceof m){const l=c.catch((h=>(u.done(),m.reject(h))));n.push(l)}u.isDone?s():u.G===null?o.continue():o.continue(u.G)}})).next((()=>m.waitFor(n)))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.X?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Lt(r){return new m(((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=aa(n.target.error);t(s)}}))}let So=!1;function aa(r){const e=pt.O(Ts());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new T("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return So||(So=!0,setTimeout((()=>{throw n}),0)),n}}return r}const or="IndexBackfiller";class nd{constructor(e,t){this.asyncQueue=e,this.ne=t,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}re(e){I(or,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.ne.ie();I(or,`Documents written: ${t}`)}catch(t){St(t)?I(or,"Ignoring IndexedDB error during index backfill: ",t):await bt(t)}await this.re(6e4)}))}}class rd{constructor(e,t){this.localStore=e,this.persistence=t}async ie(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.se(t,e)))}se(e,t){const n=new Set;let s=t,i=!0;return m.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((a=>{if(a!==null&&!n.has(a))return I(or,`Processing collection: ${a}`),this._e(e,a,s).next((o=>{s-=o,n.add(a)}));i=!1})))).next((()=>t-s))}_e(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next((i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(e,a).next((()=>this.oe(s,i))).next((o=>(I(or,`Updating offset: ${o}`),this.localStore.indexManager.updateCollectionGroup(e,t,o)))).next((()=>a.size))}))))}oe(e,t){let n=e;return t.changes.forEach(((s,i)=>{const a=ec(i);ia(a,n)>0&&(n=a)})),new Se(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class Ie{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>t.writeSequenceNumber(n))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Ie.ce=-1;/**
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
 */const Gt=-1;function Ur(r){return r==null}function Tn(r){return r===0&&1/r==-1/0}function sc(r){return typeof r=="number"&&Number.isInteger(r)&&!Tn(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function sd(r){return typeof r=="string"}/**
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
 */const ws="";function _e(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Co(e)),e=id(r.get(t),e);return Co(e)}function id(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case ws:t+="";break;default:t+=i}}return t}function Co(r){return r+ws+""}function qe(r){const e=r.length;if(E(e>=2,64408,{path:r}),e===2)return E(r.charAt(0)===ws&&r.charAt(1)==="",56145,{path:r}),D.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const a=r.indexOf(ws,i);switch((a<0||a>t)&&v(50515,{path:r}),r.charAt(a+1)){case"":const o=r.substring(i,a);let u;s.length===0?u=o:(s+=o,u=s,s=""),n.push(u);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:v(61167,{path:r})}i=a+2}return new D(n)}/**
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
 */const Ot="remoteDocuments",Br="owner",sn="owner",Ir="mutationQueues",ad="userId",Le="mutations",Do="batchId",qt="userMutationsIndex",No=["userId","batchId"];/**
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
 */function ls(r,e){return[r,_e(e)]}function ic(r,e,t){return[r,_e(e),t]}const od={},En="documentMutations",As="remoteDocumentsV14",ud=["prefixPath","collectionGroup","readTime","documentId"],hs="documentKeyIndex",cd=["prefixPath","collectionGroup","documentId"],ac="collectionGroupIndex",ld=["collectionGroup","readTime","prefixPath","documentId"],Tr="remoteDocumentGlobal",xi="remoteDocumentGlobalKey",wn="targets",oc="queryTargetsIndex",hd=["canonicalId","targetId"],An="targetDocuments",dd=["targetId","path"],oa="documentTargetsIndex",fd=["path","targetId"],vs="targetGlobalKey",Kt="targetGlobal",Er="collectionParents",md=["collectionId","parent"],vn="clientMetadata",_d="clientId",Ks="bundles",pd="bundleId",js="namedQueries",gd="name",ua="indexConfiguration",yd="indexId",bi="collectionGroupIndex",Id="collectionGroup",ur="indexState",Td=["indexId","uid"],uc="sequenceNumberIndex",Ed=["uid","sequenceNumber"],cr="indexEntries",wd=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],cc="documentKeyIndex",Ad=["indexId","uid","orderedDocumentKey"],Qs="documentOverlays",vd=["userId","collectionPath","documentId"],Si="collectionPathOverlayIndex",Vd=["userId","collectionPath","largestBatchId"],lc="collectionGroupOverlayIndex",Rd=["userId","collectionGroup","largestBatchId"],ca="globals",Pd="name",hc=[Ir,Le,En,Ot,wn,Br,Kt,An,vn,Tr,Er,Ks,js],xd=[...hc,Qs],dc=[Ir,Le,En,As,wn,Br,Kt,An,vn,Tr,Er,Ks,js,Qs],fc=dc,la=[...fc,ua,ur,cr],bd=la,mc=[...la,ca],Sd=mc;/**
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
 */class Ci extends nc{constructor(e,t){super(),this.le=e,this.currentSequenceNumber=t}}function re(r,e){const t=V(r);return pt.M(t.le,e)}/**
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
 */class q{constructor(e,t){this.comparator=e,this.root=t||le.EMPTY}insert(e,t){return new q(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,le.BLACK,null,null))}remove(e){return new q(this.comparator,this.root.remove(e,this.comparator).copy(null,null,le.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ts(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ts(this.root,e,this.comparator,!1)}getReverseIterator(){return new ts(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ts(this.root,e,this.comparator,!0)}}class ts{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class le{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??le.RED,this.left=s??le.EMPTY,this.right=i??le.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new le(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return le.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return le.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,le.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,le.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw v(43730,{key:this.key,value:this.value});if(this.right.isRed())throw v(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw v(27949);return e+(this.isRed()?0:1)}}le.EMPTY=null,le.RED=!0,le.BLACK=!1;le.EMPTY=new class{constructor(){this.size=0}get key(){throw v(57766)}get value(){throw v(16141)}get color(){throw v(16727)}get left(){throw v(29726)}get right(){throw v(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new le(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class F{constructor(e){this.comparator=e,this.data=new q(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ko(this.data.getIterator())}getIteratorFrom(e){return new ko(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof F)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new F(this.comparator);return t.data=e,t}}class ko{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function an(r){return r.hasNext()?r.getNext():void 0}/**
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
 */class Te{constructor(e){this.fields=e,e.sort($.comparator)}static empty(){return new Te([])}unionWith(e){let t=new F($.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Te(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return yn(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function Vs(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Ct(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function Cd(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function _c(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class pc extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Q{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new pc("Invalid base64 string: "+i):i}})(e);return new Q(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new Q(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return S(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Q.EMPTY_BYTE_STRING=new Q("");const Dd=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function tt(r){if(E(!!r,39018),typeof r=="string"){let e=0;const t=Dd.exec(r);if(E(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:z(r.seconds),nanos:z(r.nanos)}}function z(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function nt(r){return typeof r=="string"?Q.fromBase64String(r):Q.fromUint8Array(r)}/**
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
 */const gc="server_timestamp",yc="__type__",Ic="__previous_value__",Tc="__local_write_time__";function Ws(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[yc])==null?void 0:n.stringValue)===gc}function qr(r){const e=r.mapValue.fields[Ic];return Ws(e)?qr(e):e}function Vn(r){const e=tt(r.mapValue.fields[Tc].timestampValue);return new U(e.seconds,e.nanos)}/**
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
 */class Nd{constructor(e,t,n,s,i,a,o,u,c,l,h){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=o,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=l,this.apiKey=h}}const wr="(default)";class Ht{constructor(e,t){this.projectId=e,this.database=t||wr}static empty(){return new Ht("","")}get isDefaultDatabase(){return this.database===wr}isEqual(e){return e instanceof Ht&&e.projectId===this.projectId&&e.database===this.database}}function kd(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new T(p.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ht(r.options.projectId,e)}/**
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
 */const ha="__type__",Ec="__max__",mt={mapValue:{fields:{__type__:{stringValue:Ec}}}},da="__vector__",Yt="value",Ke={nullValue:"NULL_VALUE"},we={booleanValue:!0},ue={booleanValue:!1};function Z(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?Ws(r)?4:wc(r)?9007199254740991:Jt(r)?10:11:v(28295,{value:r})}function ke(r,e,t){if(r===e)return!0;const n=Z(r);if(n!==Z(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Vn(r).isEqual(Vn(e));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const o=tt(i.timestampValue),u=tt(a.timestampValue);return o.seconds===u.seconds&&o.nanos===u.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,a){return nt(i.bytesValue).isEqual(nt(a.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,a){return z(i.geoPointValue.latitude)===z(a.geoPointValue.latitude)&&z(i.geoPointValue.longitude)===z(a.geoPointValue.longitude)})(r,e);case 2:return(function(i,a,o){if("integerValue"in i&&"integerValue"in a)return z(i.integerValue)===z(a.integerValue);let u,c;if("doubleValue"in i&&"doubleValue"in a)u=z(i.doubleValue),c=z(a.doubleValue);else{if(!(o!=null&&o.Ee))return!1;u=z(i.integerValue??i.doubleValue),c=z(a.integerValue??a.doubleValue)}return u===c?!!(o!=null&&o.he)||Tn(u)===Tn(c):!!(o===void 0||o.Te)&&isNaN(u)&&isNaN(c)})(r,e,t);case 9:return yn(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>ke(s,i,t)));case 10:case 11:return(function(i,a,o){const u=i.mapValue.fields||{},c=a.mapValue.fields||{};if(Vs(u)!==Vs(c))return!1;for(const l in u)if(u.hasOwnProperty(l)&&(c[l]===void 0||!ke(u[l],c[l],o)))return!1;return!0})(r,e,t);default:return v(52216,{left:r})}}function Ar(r,e){return(r.values||[]).find((t=>ke(t,e)))!==void 0}function pe(r,e){if(r===e)return 0;const t=Z(r),n=Z(e);if(t!==n)return S(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return S(r.booleanValue,e.booleanValue);case 2:return(function(i,a){const o=z(i.integerValue||i.doubleValue),u=z(a.integerValue||a.doubleValue);return o<u?-1:o>u?1:o===u?0:isNaN(o)?isNaN(u)?0:-1:1})(r,e);case 3:return Oo(r.timestampValue,e.timestampValue);case 4:return Oo(Vn(r),Vn(e));case 5:return Ri(r.stringValue,e.stringValue);case 6:return(function(i,a){const o=nt(i),u=nt(a);return o.compareTo(u)})(r.bytesValue,e.bytesValue);case 7:return(function(i,a){const o=i.split("/"),u=a.split("/");for(let c=0;c<o.length&&c<u.length;c++){const l=S(o[c],u[c]);if(l!==0)return l}return S(o.length,u.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,a){const o=S(z(i.latitude),z(a.latitude));return o!==0?o:S(z(i.longitude),z(a.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return Lo(r.arrayValue,e.arrayValue);case 10:return(function(i,a){var d,_,y,R;const o=i.fields||{},u=a.fields||{},c=(d=o[Yt])==null?void 0:d.arrayValue,l=(_=u[Yt])==null?void 0:_.arrayValue,h=S(((y=c==null?void 0:c.values)==null?void 0:y.length)||0,((R=l==null?void 0:l.values)==null?void 0:R.length)||0);return h!==0?h:Lo(c,l)})(r.mapValue,e.mapValue);case 11:return(function(i,a){if(i===mt.mapValue&&a===mt.mapValue)return 0;if(i===mt.mapValue)return 1;if(a===mt.mapValue)return-1;const o=i.fields||{},u=Object.keys(o),c=a.fields||{},l=Object.keys(c);u.sort(),l.sort();for(let h=0;h<u.length&&h<l.length;++h){const d=Ri(u[h],l[h]);if(d!==0)return d;const _=pe(o[u[h]],c[l[h]]);if(_!==0)return _}return S(u.length,l.length)})(r.mapValue,e.mapValue);default:throw v(23264,{Pe:t})}}function Oo(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return S(r,e);const t=tt(r),n=tt(e),s=S(t.seconds,n.seconds);return s!==0?s:S(t.nanos,n.nanos)}function Lo(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=pe(t[s],n[s]);if(i!==void 0&&i!==0)return i}return S(t.length,n.length)}function Rn(r){return Di(r)}function Di(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=tt(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return nt(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return A.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=Di(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${Di(t.fields[a])}`;return s+"}"})(r.mapValue):v(61005,{value:r})}function ds(r){switch(Z(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=qr(r);return e?16+ds(e):16;case 5:return 2*r.stringValue.length;case 6:return nt(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+ds(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return Ct(n.fields,((i,a)=>{s+=i.length+ds(a)})),s})(r.mapValue);default:throw v(13486,{value:r})}}function vr(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function ze(r){return!!r&&"integerValue"in r}function zt(r){return!!r&&"doubleValue"in r}function Et(r){return ze(r)||zt(r)}function wt(r){return!!r&&"arrayValue"in r}function Pe(r){return!!r&&"nullValue"in r}function Ae(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function jt(r){return!!r&&"mapValue"in r}function Jt(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[ha])==null?void 0:n.stringValue)===da}function Ni(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[Yt])==null?void 0:t.arrayValue}function lr(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return Ct(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=lr(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=lr(r.arrayValue.values[t]);return e}return{...r}}function wc(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===Ec}const Ac={mapValue:{fields:{[ha]:{stringValue:da},[Yt]:{arrayValue:{}}}}};function Od(r){return"nullValue"in r?Ke:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?vr(Ht.empty(),A.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Jt(r)?Ac:{mapValue:{}}:v(35942,{value:r})}function Ld(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?vr(Ht.empty(),A.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?Ac:"mapValue"in r?Jt(r)?{mapValue:{}}:mt:v(61959,{value:r})}function Mo(r,e){const t=pe(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function Fo(r,e){const t=pe(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
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
 */class oe{constructor(e){this.value=e}static empty(){return new oe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!jt(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=lr(t)}setAll(e){let t=$.emptyPath(),n={},s=[];e.forEach(((a,o)=>{if(!t.isImmediateParentOf(o)){const u=this.getFieldsMap(t);this.applyChanges(u,n,s),n={},s=[],t=o.popLast()}a?n[o.lastSegment()]=lr(a):s.push(o.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());jt(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ke(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];jt(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){Ct(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new oe(lr(this.value))}}function vc(r){const e=[];return Ct(r.fields,((t,n)=>{const s=new $([t]);if(jt(n)){const i=vc(n.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new Te(e)}/**
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
 */function Hs(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Tn(e)?"-0":e}}function fa(r){return{integerValue:""+r}}function ma(r,e,t){return Number.isInteger(e)&&(t!=null&&t.preferIntegers)||sc(e)?fa(e):Hs(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class Ys{constructor(){this._=void 0}}function Md(r,e,t){return r instanceof Pn?(function(s,i){const a={fields:{[yc]:{stringValue:gc},[Tc]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ws(i)&&(i=qr(i)),i&&(a.fields[Ic]=i),{mapValue:a}})(t,e):r instanceof xn?Rc(r,e):r instanceof bn?Pc(r,e):r instanceof Sn?(function(s,i){const a=Vc(s,i),o=Rs(a)+Rs(s.Re);return ze(a)&&ze(s.Re)?fa(o):Hs(s.serializer,o)})(r,e):r instanceof Vr?(function(s,i){return Uo(s,i,Math.min)})(r,e):r instanceof Rr?(function(s,i){return Uo(s,i,Math.max)})(r,e):void 0}function Fd(r,e,t){return r instanceof xn?Rc(r,e):r instanceof bn?Pc(r,e):t}function Vc(r,e){return r instanceof Sn?Et(e)?e:{integerValue:0}:null}class Pn extends Ys{}class xn extends Ys{constructor(e){super(),this.elements=e}}function Rc(r,e){const t=xc(e);for(const n of r.elements)t.some((s=>ke(s,n)))||t.push(n);return{arrayValue:{values:t}}}class bn extends Ys{constructor(e){super(),this.elements=e}}function Pc(r,e){let t=xc(e);for(const n of r.elements)t=t.filter((s=>!ke(s,n)));return{arrayValue:{values:t}}}class _a extends Ys{constructor(e,t){super(),this.serializer=e,this.Re=t}}class Sn extends _a{}class Vr extends _a{}class Rr extends _a{}function Uo(r,e,t){if(!Et(e))return r.Re;const n=t(Rs(e),Rs(r.Re));return ze(e)&&ze(r.Re)?fa(n):Hs(r.serializer,n)}function Rs(r){return z(r.integerValue||r.doubleValue)}function xc(r){return wt(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class bc{constructor(e,t){this.field=e,this.transform=t}}function Ud(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof xn&&s instanceof xn||n instanceof bn&&s instanceof bn?yn(n.elements,s.elements,ke):n instanceof Sn&&s instanceof Sn||n instanceof Vr&&s instanceof Vr||n instanceof Rr&&s instanceof Rr?ke(n.Re,s.Re):n instanceof Pn&&s instanceof Pn})(r.transform,e.transform)}class Bd{constructor(e,t){this.version=e,this.transformResults=t}}class W{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new W}static exists(e){return new W(void 0,e)}static updateTime(e){return new W(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function fs(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class Js{}function Sc(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new qn(r.key,W.none()):new Bn(r.key,r.data,W.none());{const t=r.data,n=oe.empty();let s=new F($.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new at(r.key,n,new Te(s.toArray()),W.none())}}function qd(r,e,t){r instanceof Bn?(function(s,i,a){const o=s.value.clone(),u=qo(s.fieldTransforms,i,a.transformResults);o.setAll(u),i.convertToFoundDocument(a.version,o).setHasCommittedMutations()})(r,e,t):r instanceof at?(function(s,i,a){if(!fs(s.precondition,i))return void i.convertToUnknownDocument(a.version);const o=qo(s.fieldTransforms,i,a.transformResults),u=i.data;u.setAll(Cc(s)),u.setAll(o),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()})(r,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function hr(r,e,t,n){return r instanceof Bn?(function(i,a,o,u){if(!fs(i.precondition,a))return o;const c=i.value.clone(),l=zo(i.fieldTransforms,u,a);return c.setAll(l),a.convertToFoundDocument(a.version,c).setHasLocalMutations(),null})(r,e,t,n):r instanceof at?(function(i,a,o,u){if(!fs(i.precondition,a))return o;const c=zo(i.fieldTransforms,u,a),l=a.data;return l.setAll(Cc(i)),l.setAll(c),a.convertToFoundDocument(a.version,l).setHasLocalMutations(),o===null?null:o.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((h=>h.field)))})(r,e,t,n):(function(i,a,o){return fs(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):o})(r,e,t)}function zd(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=Vc(n.transform,s||null);i!=null&&(t===null&&(t=oe.empty()),t.set(n.field,i))}return t||null}function Bo(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&yn(n,s,((i,a)=>Ud(i,a)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Bn extends Js{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class at extends Js{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Cc(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function qo(r,e,t){const n=new Map;E(r.length===t.length,32656,{Ie:t.length,Ae:r.length});for(let s=0;s<t.length;s++){const i=r[s],a=i.transform,o=e.data.field(i.field);n.set(i.field,Fd(a,o,t[s]))}return n}function zo(r,e,t){const n=new Map;for(const s of r){const i=s.transform,a=t.data.field(s.field);n.set(s.field,Md(i,a,e))}return n}class qn extends Js{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class pa extends Js{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Cn{constructor(e,t){this.position=e,this.inclusive=t}}function $o(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],a=r.position[s];if(i.field.isKeyField()?n=A.comparator(A.fromName(a.referenceValue),t.key):n=pe(a,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Go(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!ke(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class Dc{}class L extends Dc{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new $d(e,t,n):t==="array-contains"?new jd(e,n):t==="in"?new Fc(e,n):t==="not-in"?new Qd(e,n):t==="array-contains-any"?new Wd(e,n):new L(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new Gd(e,n):new Kd(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(pe(t,this.value)):t!==null&&Z(this.value)===Z(t)&&this.matchesComparison(pe(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return v(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class B extends Dc{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new B(e,t)}matches(e){return Dn(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ve!==null||(this.Ve=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function Dn(r){return r.op==="and"}function ki(r){return r.op==="or"}function ga(r){return Nc(r)&&Dn(r)}function Nc(r){for(const e of r.filters)if(e instanceof B)return!1;return!0}function Oi(r){if(r instanceof L)return r.field.canonicalString()+r.op.toString()+Rn(r.value);if(ga(r))return r.filters.map((e=>Oi(e))).join(",");{const e=r.filters.map((t=>Oi(t))).join(",");return`${r.op}(${e})`}}function kc(r,e){return r instanceof L?(function(n,s){return s instanceof L&&n.op===s.op&&n.field.isEqual(s.field)&&ke(n.value,s.value)})(r,e):r instanceof B?(function(n,s){return s instanceof B&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,a,o)=>i&&kc(a,s.filters[o])),!0):!1})(r,e):void v(19439)}function Oc(r,e){const t=r.filters.concat(e);return B.create(t,r.op)}function Lc(r){return r instanceof L?(function(t){return`${t.field.canonicalString()} ${t.op} ${Rn(t.value)}`})(r):r instanceof B?(function(t){return t.op.toString()+" {"+t.getFilters().map(Lc).join(" ,")+"}"})(r):"Filter"}class $d extends L{constructor(e,t,n){super(e,t,n),this.key=A.fromName(n.referenceValue)}matches(e){const t=A.comparator(e.key,this.key);return this.matchesComparison(t)}}class Gd extends L{constructor(e,t){super(e,"in",t),this.keys=Mc("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class Kd extends L{constructor(e,t){super(e,"not-in",t),this.keys=Mc("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Mc(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>A.fromName(n.referenceValue)))}class jd extends L{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return wt(t)&&Ar(t.arrayValue,this.value)}}class Fc extends L{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ar(this.value.arrayValue,t)}}class Qd extends L{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ar(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Ar(this.value.arrayValue,t)}}class Wd extends L{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!wt(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>Ar(this.value.arrayValue,n)))}}/**
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
 */class Pr{constructor(e,t="asc"){this.field=e,this.dir=t}}function Hd(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class j{constructor(e,t,n,s,i,a,o){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=o}static newInvalidDocument(e){return new j(e,0,P.min(),P.min(),P.min(),oe.empty(),0)}static newFoundDocument(e,t,n,s){return new j(e,1,t,P.min(),n,s,0)}static newNoDocument(e,t){return new j(e,2,t,P.min(),P.min(),oe.empty(),0)}static newUnknownDocument(e,t){return new j(e,3,t,P.min(),P.min(),oe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(P.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=oe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=oe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=P.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof j&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new j(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Yd{constructor(e,t=null,n=[],s=[],i=null,a=null,o=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=o,this.de=null}}function Li(r,e=null,t=[],n=[],s=null,i=null,a=null){return new Yd(r,e,t,n,s,i,a)}function Ps(r){const e=V(r);if(e.de===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>Oi(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Ur(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>Rn(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>Rn(n))).join(",")),e.de=t}return e.de}function ya(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!Hd(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!kc(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!Go(r.startAt,e.startAt)&&Go(r.endAt,e.endAt)}function Je(r){return!!r.isCorePipeline}function Ia(r){return!!r.path&&A.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function xs(r,e){return r.filters.filter((t=>t instanceof L&&t.field.isEqual(e)))}function Ko(r,e,t){let n=Ke,s=!0;for(const i of xs(r,e)){let a=Ke,o=!0;switch(i.op){case"<":case"<=":a=Od(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,o=!1;break;case"!=":case"not-in":a=Ke}Mo({value:n,inclusive:s},{value:a,inclusive:o})<0&&(n=a,s=o)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];Mo({value:n,inclusive:s},{value:a,inclusive:t.inclusive})<0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}function jo(r,e,t){let n=mt,s=!0;for(const i of xs(r,e)){let a=mt,o=!0;switch(i.op){case">=":case">":a=Ld(i.value),o=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,o=!1;break;case"!=":case"not-in":a=mt}Fo({value:n,inclusive:s},{value:a,inclusive:o})>0&&(n=a,s=o)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];Fo({value:n,inclusive:s},{value:a,inclusive:t.inclusive})>0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
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
 */class zn{constructor(e,t=null,n=[],s=[],i=null,a="F",o=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=o,this.endAt=u,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function Uc(r,e,t,n,s,i,a,o){return new zn(r,e,t,n,s,i,a,o)}function zr(r){return new zn(r)}function Qo(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function Jd(r){return A.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Bc(r){return r.collectionGroup!==null}function dr(r){const e=V(r);if(e.fe===null){e.fe=[];const t=new Set;for(const i of e.explicitOrderBy)e.fe.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let o=new F($.comparator);return a.filters.forEach((u=>{u.getFlattenedFilters().forEach((c=>{c.isInequality()&&(o=o.add(c.field))}))})),o})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.fe.push(new Pr(i,n))})),t.has($.keyField().canonicalString())||e.fe.push(new Pr($.keyField(),n))}return e.fe}function xe(r){const e=V(r);return e.me||(e.me=Xd(e,dr(r))),e.me}function Xd(r,e){if(r.limitType==="F")return Li(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new Pr(s.field,i)}));const t=r.endAt?new Cn(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Cn(r.startAt.position,r.startAt.inclusive):null;return Li(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function Mi(r,e){const t=r.filters.concat([e]);return new zn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Zd(r,e){const t=r.explicitOrderBy.concat([e]);return new zn(r.path,r.collectionGroup,t,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}function bs(r,e,t){return new zn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function ef(r,e){return ya(xe(r),xe(e))&&r.limitType===e.limitType}function fr(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>Lc(s))).join(", ")}]`),Ur(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>Rn(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>Rn(s))).join(",")),`Target(${n})`})(xe(r))}; limitType=${r.limitType})`}function Xs(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):A.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of dr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(a,o,u){const c=$o(a,o,u);return a.inclusive?c<=0:c<0})(n.startAt,dr(n),s)||n.endAt&&!(function(a,o,u){const c=$o(a,o,u);return a.inclusive?c>=0:c>0})(n.endAt,dr(n),s))})(r,e)}function Ta(r){return(e,t)=>{let n=!1;for(const s of dr(r)){const i=tf(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function tf(r,e,t){const n=r.field.isKeyField()?A.comparator(e.key,t.key):(function(i,a,o){const u=a.data.field(i),c=o.data.field(i);return u!==null&&c!==null?pe(u,c):v(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return v(19790,{direction:r.dir})}}/**
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
 */class nf{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var J,M;function qc(r){switch(r){case p.OK:return v(64938);case p.CANCELLED:case p.UNKNOWN:case p.DEADLINE_EXCEEDED:case p.RESOURCE_EXHAUSTED:case p.INTERNAL:case p.UNAVAILABLE:case p.UNAUTHENTICATED:return!1;case p.INVALID_ARGUMENT:case p.NOT_FOUND:case p.ALREADY_EXISTS:case p.PERMISSION_DENIED:case p.FAILED_PRECONDITION:case p.ABORTED:case p.OUT_OF_RANGE:case p.UNIMPLEMENTED:case p.DATA_LOSS:return!0;default:return v(15467,{code:r})}}function zc(r){if(r===void 0)return Y("GRPC error has no .code"),p.UNKNOWN;switch(r){case J.OK:return p.OK;case J.CANCELLED:return p.CANCELLED;case J.UNKNOWN:return p.UNKNOWN;case J.DEADLINE_EXCEEDED:return p.DEADLINE_EXCEEDED;case J.RESOURCE_EXHAUSTED:return p.RESOURCE_EXHAUSTED;case J.INTERNAL:return p.INTERNAL;case J.UNAVAILABLE:return p.UNAVAILABLE;case J.UNAUTHENTICATED:return p.UNAUTHENTICATED;case J.INVALID_ARGUMENT:return p.INVALID_ARGUMENT;case J.NOT_FOUND:return p.NOT_FOUND;case J.ALREADY_EXISTS:return p.ALREADY_EXISTS;case J.PERMISSION_DENIED:return p.PERMISSION_DENIED;case J.FAILED_PRECONDITION:return p.FAILED_PRECONDITION;case J.ABORTED:return p.ABORTED;case J.OUT_OF_RANGE:return p.OUT_OF_RANGE;case J.UNIMPLEMENTED:return p.UNIMPLEMENTED;case J.DATA_LOSS:return p.DATA_LOSS;default:return v(39323,{code:r})}}(M=J||(J={}))[M.OK=0]="OK",M[M.CANCELLED=1]="CANCELLED",M[M.UNKNOWN=2]="UNKNOWN",M[M.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",M[M.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",M[M.NOT_FOUND=5]="NOT_FOUND",M[M.ALREADY_EXISTS=6]="ALREADY_EXISTS",M[M.PERMISSION_DENIED=7]="PERMISSION_DENIED",M[M.UNAUTHENTICATED=16]="UNAUTHENTICATED",M[M.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",M[M.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",M[M.ABORTED=10]="ABORTED",M[M.OUT_OF_RANGE=11]="OUT_OF_RANGE",M[M.UNIMPLEMENTED=12]="UNIMPLEMENTED",M[M.INTERNAL=13]="INTERNAL",M[M.UNAVAILABLE=14]="UNAVAILABLE",M[M.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class ot{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Ct(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return _c(this.inner)}size(){return this.innerSize}}/**
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
 */const rf=new q(A.comparator);function te(){return rf}const $c=new q(A.comparator);function Mt(...r){let e=$c;for(const t of r)e=e.insert(t.key,t);return e}function Gc(r){let e=$c;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function De(){return mr()}function Kc(){return mr()}function mr(){return new ot((r=>r.toString()),((r,e)=>r.isEqual(e)))}const sf=new q(A.comparator),af=new F(A.comparator);function C(...r){let e=af;for(const t of r)e=e.add(t);return e}const of=new F(S);function Ea(){return of}/**
 * @license
 * Copyright 2023 Google LLC
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
 */function uf(){return new TextEncoder}/**
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
 */const cf=new $t([4294967295,4294967295],0);function Wo(r){const e=uf().encode(r),t=new Fh;return t.update(e),new Uint8Array(t.digest())}function Ho(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new $t([t,n],0),new $t([s,i],0)]}class wa{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new rr(`Invalid padding: ${t}`);if(n<0)throw new rr(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new rr(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new rr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=$t.fromNumber(this.ge)}we(e,t,n){let s=e.add(t.multiply($t.fromNumber(n)));return s.compare(cf)===1&&(s=new $t([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Wo(e),[n,s]=Ho(t);for(let i=0;i<this.hashCount;i++){const a=this.we(n,s,i);if(!this.be(a))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new wa(i,s,t);return n.forEach((o=>a.insert(o))),a}insert(e){if(this.ge===0)return;const t=Wo(e),[n,s]=Ho(t);for(let i=0;i<this.hashCount;i++){const a=this.we(n,s,i);this.ve(a)}}ve(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class rr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class $n{constructor(e,t,n,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,$r.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new $n(P.min(),s,new q(S),te(),te(),C())}}class $r{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new $r(n,t,C(),C(),C())}}/**
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
 */class ms{constructor(e,t,n,s){this.Se=e,this.removedTargetIds=t,this.key=n,this.De=s}}class jc{constructor(e,t){this.targetId=e,this.xe=t}}class Qc{constructor(e,t,n=Q.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class Yo{constructor(e){this.targetId=e,this.Ce=0,this.Fe=Jo(),this.Oe=Q.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return this.Ce!==0}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=C(),t=C(),n=C();return this.Fe.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:v(38017,{changeType:i})}})),new $r(this.Oe,this.Me,e,t,n)}qe(){this.Ne=!1,this.Fe=Jo()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,E(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}const Jn="WatchChangeAggregator";class lf{constructor(e){this.ze=e,this.je=new Map,this.He=te(),this.Je=ns(),this.Ye=te(),this.Ze=ns(),this.Xe=new q(S)}et(e){for(const t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(const t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,(t=>{const n=this.je.get(t);if(n)switch(e.state){case 0:this.it(t)&&n.Ue(e.resumeToken);break;case 1:n.Qe(),n.Le||n.qe(),n.Ue(e.resumeToken);break;case 2:n.Qe(),n.Le||this.removeTarget(t);break;case 3:this.it(t)&&(n.Ge(),n.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),n.Ue(e.resumeToken));break;default:v(56790,{state:e.state})}else I(Jn,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach(((n,s)=>{this.it(s)&&t(s)}))}_t(e){var t;return Je(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:Ia(e)}ot(e){const t=e.targetId,n=e.xe.count,s=this.ut(t);if(s){const i=s.target;if(this._t(i))if(n===0){const a=new A(Je(i)?D.fromString(i.getPipelineDocuments()[0]):i.path);this.nt(t,a,j.newNoDocument(a,P.min()))}else E(n===1,20013,"Single document existence filter with count: "+n);else{const a=this.ct(t);if(a!==n){const o=this.lt(e),u=o?this.Et(o,e,a):1;if(u!==0){this.st(t);const c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Xe=this.Xe.insert(t,c)}}}}}lt(e){const t=e.xe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let a,o;try{a=nt(n).toUint8Array()}catch(u){if(u instanceof pc)return Ne("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{o=new wa(a,s,i)}catch(u){return Ne(u instanceof rr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return o.ge===0?null:o}Et(e,t,n){return t.xe.count===n-this.Pt(e,t.targetId)?0:2}Pt(e,t){const n=this.ze.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const a=this.ze.Tt(),o=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(o)||(this.nt(t,i,null),s++)})),s}Rt(e){const t=new Map;this.je.forEach(((i,a)=>{const o=this.ut(a);if(o){if(i.current&&this._t(o.target)){const u=Je(o.target)?D.fromString(o.target.getPipelineDocuments()[0]):o.target.path,c=new A(u);this.It(c).has(a)||this.At(a,c)||this.nt(a,c,j.newNoDocument(c,e))}i.Be&&(t.set(a,i.ke()),i.qe())}}));let n=C();this.Ze.forEach(((i,a)=>{let o=!0;a.forEachWhile((u=>{const c=this.ut(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(o=!1,!1)})),o&&(n=n.add(i))})),this.He.forEach(((i,a)=>a.setReadTime(e))),this.Ye.forEach(((i,a)=>a.setReadTime(e)));const s=new $n(e,t,this.Xe,this.He,this.Ye,n);return this.He=te(),this.Je=ns(),this.Ye=te(),this.Ze=ns(),this.Xe=new q(S),s}tt(e,t){const n=this.je.get(e);if(!n||!this.it(e))return void I(Jn,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.At(e,t.key)?2:0;n.$e(t.key,s),Je(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,n){const s=this.je.get(e);s&&this.it(e)?(this.At(e,t)?s.$e(t,1):s.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),n&&(Je(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t,n):this.He=this.He.insert(t,n))):I(Jn,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){const t=this.je.get(e);if(!t)return 0;const n=t.ke();return this.ze.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}We(e){let t=this.je.get(e);t||(I(Jn,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Yo(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new F(S),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new F(S),this.Je=this.Je.insert(e,t)),t}it(e){const t=this.ut(e)!==null;return t||I(Jn,"Detected inactive target",e),t}ut(e){const t=this.je.get(e);return t===void 0||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new Yo(e)),this.ze.getRemoteKeysForTarget(e).forEach((t=>{this.nt(e,t,null)}))}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function ns(){return new q(A.comparator)}function Jo(){return new q(A.comparator)}const hf={asc:"ASCENDING",desc:"DESCENDING"},df={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},ff={and:"AND",or:"OR"};class mf{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Fi(r,e){return r.useProto3Json||Ur(e)?e:{value:e}}function Nn(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Aa(r){const e=tt(r);return new U(e.seconds,e.nanos)}function Wc(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function _s(r,e){return Nn(r,e.toTimestamp())}function ce(r){return E(!!r,49232),P.fromTimestamp(Aa(r))}function va(r,e){return Ui(r,e).canonicalString()}function Ui(r,e){const t=(function(s){return new D(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function Hc(r){const e=D.fromString(r);return E(il(e),10190,{key:e.toString()}),e}function kn(r,e){return va(r.databaseId,e.path)}function Xe(r,e){const t=Hc(e);if(t.get(1)!==r.databaseId.projectId)throw new T(p.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new T(p.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new A(Xc(t))}function Yc(r,e){return va(r.databaseId,e)}function Jc(r){const e=Hc(r);return e.length===4?D.emptyPath():Xc(e)}function Bi(r){return new D(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Xc(r){return E(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function Xo(r,e,t){return{name:kn(r,e),fields:t.value.mapValue.fields}}function _f(r,e,t){const n=Xe(r,e.name),s=ce(e.updateTime),i=e.createTime?ce(e.createTime):P.min(),a=new oe({mapValue:{fields:e.fields}}),o=j.newFoundDocument(n,s,i,a);return t&&o.setHasCommittedMutations(),t?o.setHasCommittedMutations():o}function pf(r,e){return"found"in e?(function(n,s){E(!!s.found,43571),s.found.name,s.found.updateTime;const i=Xe(n,s.found.name),a=ce(s.found.updateTime),o=s.found.createTime?ce(s.found.createTime):P.min(),u=new oe({mapValue:{fields:s.found.fields}});return j.newFoundDocument(i,a,o,u)})(r,e):"missing"in e?(function(n,s){E(!!s.missing,3894),E(!!s.readTime,22933);const i=Xe(n,s.missing),a=ce(s.readTime);return j.newNoDocument(i,a)})(r,e):v(7234,{result:e})}function gf(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:v(39313,{state:c})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(c,l){return c.useProto3Json?(E(l===void 0||typeof l=="string",58123),Q.fromBase64String(l||"")):(E(l===void 0||l instanceof Buffer||l instanceof Uint8Array,16193),Q.fromUint8Array(l||new Uint8Array))})(r,e.targetChange.resumeToken),a=e.targetChange.cause,o=a&&(function(c){const l=c.code===void 0?p.UNKNOWN:zc(c.code);return new T(l,c.message||"")})(a);t=new Qc(n,s,i,o||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=Xe(r,n.document.name),i=ce(n.document.updateTime),a=n.document.createTime?ce(n.document.createTime):P.min(),o=new oe({mapValue:{fields:n.document.fields}}),u=j.newFoundDocument(s,i,a,o),c=n.targetIds||[],l=n.removedTargetIds||[];t=new ms(c,l,u.key,u)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=Xe(r,n.document),i=n.readTime?ce(n.readTime):P.min(),a=j.newNoDocument(s,i),o=n.removedTargetIds||[];t=new ms([],o,a.key,a)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=Xe(r,n.document),i=n.removedTargetIds||[];t=new ms([],i,s,null)}else{if(!("filter"in e))return v(11601,{ft:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new nf(s,i),o=n.targetId;t=new jc(o,a)}}return t}function xr(r,e){let t;if(e instanceof Bn)t={update:Xo(r,e.key,e.value)};else if(e instanceof qn)t={delete:kn(r,e.key)};else if(e instanceof at)t={update:Xo(r,e.key,e.data),updateMask:Af(e.fieldMask)};else{if(!(e instanceof pa))return v(16599,{gt:e.type});t={verify:kn(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,a){const o=a.transform;if(o instanceof Pn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(o instanceof xn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:o.elements}};if(o instanceof bn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:o.elements}};if(o instanceof Sn)return{fieldPath:a.field.canonicalString(),increment:o.Re};if(o instanceof Vr)return{fieldPath:a.field.canonicalString(),minimum:o.Re};if(o instanceof Rr)return{fieldPath:a.field.canonicalString(),maximum:o.Re};throw v(20930,{transform:a.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:_s(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:v(27497)})(r,e.precondition)),t}function qi(r,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?W.updateTime(ce(i.updateTime)):i.exists!==void 0?W.exists(i.exists):W.none()})(e.currentDocument):W.none(),n=e.updateTransforms?e.updateTransforms.map((s=>(function(a,o){let u=null;if("setToServerValue"in o)E(o.setToServerValue==="REQUEST_TIME",16630,{proto:o}),u=new Pn;else if("appendMissingElements"in o){const l=o.appendMissingElements.values||[];u=new xn(l)}else if("removeAllFromArray"in o){const l=o.removeAllFromArray.values||[];u=new bn(l)}else"increment"in o?u=new Sn(a,o.increment):"minimum"in o?u=new Vr(a,o.minimum):"maximum"in o?u=new Rr(a,o.maximum):v(16584,{proto:o});const c=$.fromServerFormat(o.fieldPath);return new bc(c,u)})(r,s))):[];if(e.update){e.update.name;const s=Xe(r,e.update.name),i=new oe({mapValue:{fields:e.update.fields}});if(e.updateMask){const a=(function(u){const c=u.fieldPaths||[];return new Te(c.map((l=>$.fromServerFormat(l))))})(e.updateMask);return new at(s,i,a,t,n)}return new Bn(s,i,t,n)}if(e.delete){const s=Xe(r,e.delete);return new qn(s,t)}if(e.verify){const s=Xe(r,e.verify);return new pa(s,t)}return v(1463,{proto:e})}function yf(r,e){return r&&r.length>0?(E(e!==void 0,14353),r.map((t=>(function(s,i){let a=s.updateTime?ce(s.updateTime):ce(i);return a.isEqual(P.min())&&(a=ce(i)),new Bd(a,s.transformResults||[])})(t,e)))):[]}function Zc(r,e){return{documents:[Yc(r,e.path)]}}function el(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=Yc(r,s);const i=(function(c){if(c.length!==0)return sl(B.create(c,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(c){if(c.length!==0)return c.map((l=>(function(d){return{field:fn(d.field),direction:Tf(d.dir)}})(l)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const o=Fi(r,e.limit);return o!==null&&(t.structuredQuery.limit=o),e.startAt&&(t.structuredQuery.startAt=(function(c){return{before:c.inclusive,values:c.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(c){return{before:!c.inclusive,values:c.position}})(e.endAt)),{yt:t,parent:s}}function tl(r){let e=Jc(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){E(n===1,65062);const l=t.from[0];l.allDescendants?s=l.collectionId:e=e.child(l.collectionId)}let i=[];t.where&&(i=(function(h){const d=rl(h);return d instanceof B&&ga(d)?d.getFilters():[d]})(t.where));let a=[];t.orderBy&&(a=(function(h){return h.map((d=>(function(y){return new Pr(mn(y.field),(function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(y.direction))})(d)))})(t.orderBy));let o=null;t.limit&&(o=(function(h){let d;return d=typeof h=="object"?h.value:h,Ur(d)?null:d})(t.limit));let u=null;t.startAt&&(u=(function(h){const d=!!h.before,_=h.values||[];return new Cn(_,d)})(t.startAt));let c=null;return t.endAt&&(c=(function(h){const d=!h.before,_=h.values||[];return new Cn(_,d)})(t.endAt)),Uc(e,s,a,i,o,"F",u,c)}function If(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return v(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function nl(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function rl(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=mn(t.unaryFilter.field);return L.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=mn(t.unaryFilter.field);return L.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=mn(t.unaryFilter.field);return L.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=mn(t.unaryFilter.field);return L.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return v(61313);default:return v(60726)}})(r):r.fieldFilter!==void 0?(function(t){return L.create(mn(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return v(58110);default:return v(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return B.create(t.compositeFilter.filters.map((n=>rl(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return v(1026)}})(t.compositeFilter.op))})(r):v(30097,{filter:r})}function Tf(r){return hf[r]}function Ef(r){return df[r]}function wf(r){return ff[r]}function fn(r){return{fieldPath:r.canonicalString()}}function mn(r){return $.fromServerFormat(r.fieldPath)}function sl(r){return r instanceof L?(function(t){if(t.op==="=="){if(Ae(t.value))return{unaryFilter:{field:fn(t.field),op:"IS_NAN"}};if(Pe(t.value))return{unaryFilter:{field:fn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Ae(t.value))return{unaryFilter:{field:fn(t.field),op:"IS_NOT_NAN"}};if(Pe(t.value))return{unaryFilter:{field:fn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:fn(t.field),op:Ef(t.op),value:t.value}}})(r):r instanceof B?(function(t){const n=t.getFilters().map((s=>sl(s)));return n.length===1?n[0]:{compositeFilter:{op:wf(t.op),filters:n}}})(r):v(54877,{filter:r})}function Af(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function il(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function al(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function br(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function ol(r){return{stringValue:r}}/**
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
 */function Zs(r){return new mf(r,!0)}/**
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
 */class Re{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Re(Q.fromBase64String(e))}catch(t){throw new T(p.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Re(Q.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Re._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Fr(e,Re._jsonSchema))return Re.fromBase64String(e.bytes)}}Re._jsonSchemaVersion="firestore/bytes/1.0",Re._jsonSchema={type:X("string",Re._jsonSchemaVersion),bytes:X("string")};/**
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
 */class Gn{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new T(p.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new $(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function vf(){return new Gn(Be)}/**
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
 */class ei{constructor(e){this._methodName=e}}/**
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
 */class je{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new T(p.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new T(p.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return S(this._lat,e._lat)||S(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:je._jsonSchemaVersion}}static fromJSON(e){if(Fr(e,je._jsonSchema))return new je(e.latitude,e.longitude)}}function ul(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */je._jsonSchemaVersion="firestore/geoPoint/1.0",je._jsonSchema={type:X("string",je._jsonSchemaVersion),latitude:X("number"),longitude:X("number")};class Vf{bt(e){}shutdown(){}}/**
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
 */const Zo="ConnectivityMonitor";class eu{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){I(Zo,"Network connectivity changed: AVAILABLE");for(const e of this.Ct)e(0)}xt(){I(Zo,"Network connectivity changed: UNAVAILABLE");for(const e of this.Ct)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */let rs=null;function zi(){return rs===null?rs=(function(){return 268435456+Math.round(2147483648*Math.random())})():rs++,"0x"+rs.toString(16)}/**
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
 */const gi="RestConnection",Rf={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Pf{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${n}/databases/${s}`,this.Lt=this.databaseId.database===wr?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Bt(e,t,n,s,i){const a=zi(),o=this.Ut(e,t.toUriEncodedString());I(gi,`Sending RPC '${e}' ${a}:`,o,n);const u={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(u,s,i);const{host:c}=new URL(o),l=ta(c);return this.qt(e,o,u,n,l).then((h=>(I(gi,`Received RPC '${e}' ${a}: `,h),h)),(h=>{throw Ne(gi,`RPC '${e}' ${a} failed with error: `,h,"url: ",o,"request:",n),h}))}$t(e,t,n,s,i,a){return this.Bt(e,t,n,s,i)}kt(e,t,n){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Un})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s))}Ut(e,t){const n=Rf[e];let s=`${this.Mt}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class xf{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
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
 */const de="WebChannelConnection",Xn=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class gn extends Pf{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!gn.sn){const e=Ch();Xn(e,Dh.STAT_EVENT,(t=>{t.stat===Ao.PROXY?I(de,"STAT_EVENT: detected buffering proxy"):t.stat===Ao.NOPROXY&&I(de,"STAT_EVENT: detected no buffering proxy")})),gn.sn=!0}}qt(e,t,n,s,i){const a=zi();return new Promise(((o,u)=>{const c=new Nh;c.setWithCredentials(!0),c.listenOnce(kh.COMPLETE,(()=>{try{switch(c.getLastErrorCode()){case _i.NO_ERROR:const h=c.getResponseJson();I(de,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(h)),o(h);break;case _i.TIMEOUT:I(de,`RPC '${e}' ${a} timed out`),u(new T(p.DEADLINE_EXCEEDED,"Request time out"));break;case _i.HTTP_ERROR:const d=c.getStatus();if(I(de,`RPC '${e}' ${a} failed with status:`,d,"response text:",c.getResponseText()),d>0){let _=c.getResponseJson();Array.isArray(_)&&(_=_[0]);const y=_==null?void 0:_.error;if(y&&y.status&&y.message){const R=(function(k){const N=k.toLowerCase().replace(/_/g,"-");return Object.values(p).indexOf(N)>=0?N:p.UNKNOWN})(y.status);u(new T(R,y.message))}else u(new T(p.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new T(p.UNAVAILABLE,"Connection failed."));break;default:v(9055,{_n:e,streamId:a,an:c.getLastErrorCode(),un:c.getLastError()})}}finally{I(de,`RPC '${e}' ${a} completed.`)}}));const l=JSON.stringify(s);I(de,`RPC '${e}' ${a} sending request:`,s),c.send(t,"POST",l,n,15)}))}cn(e,t,n){const s=zi(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),o={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(o.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(o.useFetchStreams=!0),this.kt(o.initMessageHeaders,t,n),o.encodeInitMessageHeaders=!0;const c=i.join("");I(de,`Creating RPC '${e}' stream ${s}: ${c}`,o);const l=a.createWebChannel(c,o);this.En(l);let h=!1,d=!1;const _=new xf({Kt:y=>{d?I(de,`Not sending because RPC '${e}' stream ${s} is closed:`,y):(h||(I(de,`Opening RPC '${e}' stream ${s} transport.`),l.open(),h=!0),I(de,`RPC '${e}' stream ${s} sending:`,y),l.send(y))},Wt:()=>l.close()});return Xn(l,es.EventType.OPEN,(()=>{d||(I(de,`RPC '${e}' stream ${s} transport opened.`),_.Zt())})),Xn(l,es.EventType.CLOSE,(()=>{d||(d=!0,I(de,`RPC '${e}' stream ${s} transport closed`),_.en(),this.hn(l))})),Xn(l,es.EventType.ERROR,(y=>{d||(d=!0,Ne(de,`RPC '${e}' stream ${s} transport errored. Name:`,y.name,"Message:",y.message),_.en(new T(p.UNAVAILABLE,"The operation could not be completed")))})),Xn(l,es.EventType.MESSAGE,(y=>{var R;if(!d){const x=y.data[0];E(!!x,16349);const k=x,N=(k==null?void 0:k.error)||((R=k[0])==null?void 0:R.error);if(N){I(de,`RPC '${e}' stream ${s} received error:`,N);const O=N.status;let se=(function(ye){const ut=J[ye];if(ut!==void 0)return zc(ut)})(O),K=N.message;O==="NOT_FOUND"&&K.includes("database")&&K.includes("does not exist")&&K.includes(this.databaseId.database)&&Ne(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),se===void 0&&(se=p.INTERNAL,K="Unknown error status: "+O+" with message "+N.message),d=!0,_.en(new T(se,K)),l.close()}else I(de,`RPC '${e}' stream ${s} received:`,x),_.tn(x)}})),gn.rn(),setTimeout((()=>{_.Xt()}),0),_}terminate(){this.nn.forEach((e=>e.close())),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter((t=>t===e))}kt(e,t,n){super.kt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Oh()}}/**
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
 */function bf(r){return new gn(r)}gn.sn=!1;class Va{constructor(e,t,n=1e3,s=1.5,i=6e4){this.Tn=e,this.timerId=t,this.Pn=n,this.Rn=s,this.In=i,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();const t=Math.floor(this.An+this.pn()),n=Math.max(0,Date.now()-this.dn),s=Math.max(0,t-n);s>0&&I("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,s,(()=>(this.dn=Date.now(),e()))),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){this.Vn!==null&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){this.Vn!==null&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
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
 */const tu="PersistentStream";class cl{constructor(e,t,n,s,i,a,o,u){this.Tn=e,this.yn=n,this.wn=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=o,this.listener=u,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new Va(e,t)}Cn(){return this.state===1||this.state===5||this.Fn()}Fn(){return this.state===2||this.state===3}start(){this.Dn=0,this.state!==4?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&this.vn===null&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,(()=>this.Ln())))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,e!==4?this.xn.reset():t&&t.code===p.RESOURCE_EXHAUSTED?(Y(t.toString()),Y("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===p.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;const e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.bn===t&&this.Kn(n,s)}),(n=>{e((()=>{const s=new T(p.UNKNOWN,"Fetching auth token failed: "+n.message);return this.Wn(s)}))}))}Kn(e,t){const n=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt((()=>{n((()=>this.listener.Qt()))})),this.stream.zt((()=>{n((()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,(()=>(this.Fn()&&(this.state=3),Promise.resolve()))),this.listener.zt())))})),this.stream.Ht((s=>{n((()=>this.Wn(s)))})),this.stream.onMessage((s=>{n((()=>++this.Dn==1?this.Gn(s):this.onNext(s)))}))}On(){this.state=5,this.xn.mn((async()=>{this.state=0,this.start()}))}Wn(e){return I(tu,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget((()=>this.bn===e?t():(I(tu,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class Sf extends cl{constructor(e,t,n,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();const t=gf(this.serializer,e),n=(function(i){if(!("targetChange"in i))return P.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?P.min():a.readTime?ce(a.readTime):P.min()})(e);return this.listener.zn(t,n)}jn(e){const t={};t.database=Bi(this.serializer),t.addTarget=(function(i,a){let o;const u=a.target;if(o=Je(u)?{pipelineQuery:nl(i,u)}:Ia(u)?{documents:Zc(i,u)}:{query:el(i,u).yt},o.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){o.resumeToken=Wc(i,a.resumeToken);const c=Fi(i,a.expectedCount);c!==null&&(o.expectedCount=c)}else if(a.snapshotVersion.compareTo(P.min())>0){o.readTime=Nn(i,a.snapshotVersion.toTimestamp());const c=Fi(i,a.expectedCount);c!==null&&(o.expectedCount=c)}return o})(this.serializer,e);const n=If(this.serializer,e);n&&(t.labels=n),this.Bn(t)}Hn(e){const t={};t.database=Bi(this.serializer),t.removeTarget=e,this.Bn(t)}}class Cf extends cl{constructor(e,t,n,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return E(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,E(!e.writeResults||e.writeResults.length===0,55816),this.listener.Zn()}onNext(e){E(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();const t=yf(e.writeResults,e.commitTime),n=ce(e.commitTime);return this.listener.Xn(n,t)}er(){const e={};e.database=Bi(this.serializer),this.Bn(e)}Yn(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>xr(this.serializer,n)))};this.Bn(t)}}/**
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
 */class Df{}class Nf extends Df{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.tr=!1}nr(){if(this.tr)throw new T(p.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,n,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.Bt(e,Ui(t,n),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===p.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new T(p.UNKNOWN,i.toString())}))}$t(e,t,n,s,i){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,o])=>this.connection.$t(e,Ui(t,n),s,a,o,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===p.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new T(p.UNKNOWN,a.toString())}))}terminate(){this.tr=!0,this.connection.terminate()}}function kf(r,e,t,n){return new Nf(r,e,t,n)}/**
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
 */const Of="ComponentProvider",nu=new Map;function Lf(r,e,t,n,s){return new Nd(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,ul(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n)}/**
 * @license
 * Copyright 2018 Google LLC
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
 */const ru={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ll=41943040;class fe{static withCacheSize(e){return new fe(e,fe.DEFAULT_COLLECTION_PERCENTILE,fe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}fe.DEFAULT_COLLECTION_PERCENTILE=10,fe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,fe.DEFAULT=new fe(ll,fe.DEFAULT_COLLECTION_PERCENTILE,fe.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),fe.DISABLED=new fe(-1,0,0);/**
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
 */const su="LruGarbageCollector",hl=1048576;function iu([r,e],[t,n]){const s=S(r,t);return s===0?S(e,n):s}class Mf{constructor(e){this.rr=e,this.buffer=new F(iu),this.ir=0}sr(){return++this.ir}_r(e){const t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();iu(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class dl{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return this.ar!==null}ur(e){I(su,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){St(t)?I(su,"Ignoring IndexedDB error during garbage collection: ",t):await bt(t)}await this.ur(3e5)}))}}class Ff{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return m.resolve(Ie.ce);const n=new Mf(t);return this.cr.forEachTarget(e,(s=>n._r(s.sequenceNumber))).next((()=>this.cr.Er(e,(s=>n._r(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.cr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(I("LruGarbageCollector","Garbage collection skipped; disabled"),m.resolve(ru)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(I("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),ru):this.hr(e,t)))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let n,s,i,a,o,u,c;const l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((h=>(h>this.params.maximumSequenceNumbersToCollect?(I("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${h}`),s=this.params.maximumSequenceNumbersToCollect):s=h,a=Date.now(),this.nthSequenceNumber(e,s)))).next((h=>(n=h,o=Date.now(),this.removeTargets(e,n,t)))).next((h=>(i=h,u=Date.now(),this.removeOrphanedDocuments(e,n)))).next((h=>(c=Date.now(),dn()<=Ye.DEBUG&&I("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-l}ms
	Determined least recently used ${s} in `+(o-a)+`ms
	Removed ${i} targets in `+(u-o)+`ms
	Removed ${h} documents in `+(c-u)+`ms
Total Duration: ${c-l}ms`),m.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:h}))))}}function fl(r,e){return new Ff(r,e)}/**
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
 */const ml="firestore.googleapis.com",au=!0;class ou{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new T(p.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ml,this.ssl=au}else this.host=e.host,this.ssl=e.ssl??au;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ll;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hl)throw new T(p.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Zh("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ul(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ti{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ou({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new T(p.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new T(p.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ou(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new $h;switch(n.type){case"firstParty":return new Qh(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new T(p.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=nu.get(t);n&&(I(Of,"Removing Datastore"),nu.delete(t),n.terminate())})(this),Promise.resolve()}}function Uf(r,e,t,n={}){var c;r=ne(r,ti);const s=ta(e),i=r._getSettings(),a={...i,emulatorOptions:r._getEmulatorOptions()},o=`${e}:${t}`;s&&ju(`https://${o}`),i.host!==ml&&i.host!==o&&Ne("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:o,ssl:s,emulatorOptions:n};if(!Ku(u,a)&&(r._setSettings(u),n.mockUserToken)){let l,h;if(typeof n.mockUserToken=="string")l=n.mockUserToken,h=ae.MOCK_USER;else{l=Sh(n.mockUserToken,(c=r._app)==null?void 0:c.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new T(p.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");h=new ae(d)}r._authCredentials=new Gh(new Yu(l,h))}}/**
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
 */class He{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new He(this.firestore,e,this._query)}}class G{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new G(this.firestore,e,this._key)}toJSON(){return{type:G._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(Fr(t,G._jsonSchema))return new G(e,n||null,new A(D.fromString(t.referencePath)))}}G._jsonSchemaVersion="firestore/documentReference/1.0",G._jsonSchema={type:X("string",G._jsonSchemaVersion),referencePath:X("string")};class gt extends He{constructor(e,t,n){super(e,t,zr(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new G(this.firestore,null,new A(e))}withConverter(e){return new gt(this.firestore,e,this._path)}}function ug(r,e,...t){if(r=be(r),Xu("collection","path",e),r instanceof ti){const n=D.fromString(e,...t);return Po(n),new gt(r,null,n)}{if(!(r instanceof G||r instanceof gt))throw new T(p.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(D.fromString(e,...t));return Po(n),new gt(r.firestore,null,n)}}function cg(r,e,...t){if(r=be(r),arguments.length===1&&(e=sa.newId()),Xu("doc","path",e),r instanceof ti){const n=D.fromString(e,...t);return Ro(n),new G(r,null,new A(n))}{if(!(r instanceof G||r instanceof gt))throw new T(p.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(D.fromString(e,...t));return Ro(n),new G(r.firestore,r instanceof gt?r.converter:null,new A(n))}}/**
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
 *//**
 * @license
 * Copyright 2024 Google LLC
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
 */class Ee{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Ee._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Fr(e,Ee._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Ee(e.vectorValues);throw new T(p.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ee._jsonSchemaVersion="firestore/vectorValue/1.0",Ee._jsonSchema={type:X("string",Ee._jsonSchemaVersion),vectorValues:X("object")};/**
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
 */const Bf=/^__.*__$/;class qf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new at(e,this.data,this.fieldMask,t,this.fieldTransforms):new Bn(e,this.data,t,this.fieldTransforms)}}class _l{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new at(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function pl(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw v(40011,{dataSource:r})}}class Ra{constructor(e,t,n,s,i,a){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Ra({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ss(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(pl(this.dataSource)&&Bf.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class zf{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Zs(e)}createContext(e,t,n,s=!1){return new Ra({dataSource:e,methodName:t,targetDoc:n,path:$.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Gr(r){const e=r._freezeSettings(),t=Zs(r._databaseId);return new zf(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Pa(r,e,t,n,s,i={}){const a=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);Ca("Data must be an object, but it was:",a,n);const o=gl(n,a);let u,c;if(i.merge)u=new Te(a.fieldMask),c=a.fieldTransforms;else if(i.mergeFields){const l=[];for(const h of i.mergeFields){const d=rt(e,h,t);if(!a.contains(d))throw new T(p.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);Tl(l,d)||l.push(d)}u=new Te(l),c=a.fieldTransforms.filter((h=>u.covers(h.field)))}else u=null,c=a.fieldTransforms;return new qf(new oe(o),u,c)}class Kr extends ei{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Kr}}class xa extends ei{_toFieldTransform(e){return new bc(e.path,new Pn)}isEqual(e){return e instanceof xa}}function ba(r,e,t,n){const s=r.createContext(1,e,t);Ca("Data must be an object, but it was:",s,n);const i=[],a=oe.empty();Ct(n,((u,c)=>{const l=Il(e,u,t);c=be(c);const h=s.childContextForFieldPath(l);if(c instanceof Kr)i.push(l);else{const d=At(c,h);d!=null&&(i.push(l),a.set(l,d))}}));const o=new Te(i);return new _l(a,o,s.fieldTransforms)}function Sa(r,e,t,n,s,i){const a=r.createContext(1,e,t),o=[rt(e,n,t)],u=[s];if(i.length%2!=0)throw new T(p.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)o.push(rt(e,i[d])),u.push(i[d+1]);const c=[],l=oe.empty();for(let d=o.length-1;d>=0;--d)if(!Tl(c,o[d])){const _=o[d];let y=u[d];y=be(y);const R=a.childContextForFieldPath(_);if(y instanceof Kr)c.push(_);else{const x=At(y,R);x!=null&&(c.push(_),l.set(_,x))}}const h=new Te(c);return new _l(l,h,a.fieldTransforms)}function $f(r,e,t,n=!1){return At(t,r.createContext(n?4:3,e))}function At(r,e,t){if(yl(r=be(r)))return Ca("Unsupported field value:",e,r),gl(r,e);if(r instanceof ei)return(function(s,i){if(!pl(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let o=0;for(const u of s){let c=At(u,i.childContextForArray(o));c==null&&(c={nullValue:"NULL_VALUE"}),a.push(c),o++}return{arrayValue:{values:a}}})(r,e)}return(function(s,i,a){if((s=be(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return ma(i.serializer,s,a);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const o=U.fromDate(s);return{timestampValue:Nn(i.serializer,o)}}if(s instanceof U){const o=new U(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Nn(i.serializer,o)}}if(s instanceof je)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Re)return{bytesValue:Wc(i.serializer,s._byteString)};if(s instanceof G){const o=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(o))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:va(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Ee)return(function(u,c){const l=u instanceof Ee?u.toArray():u;return{mapValue:{fields:{[ha]:{stringValue:da},[Yt]:{arrayValue:{values:l.map((d=>{if(typeof d!="number")throw c.createError("VectorValues must only contain numeric values.");return Hs(c.serializer,d)}))}}}}}})(s,i);if(al(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${$s(s)}`)})(r,e,t)}function gl(r,e){const t={};return _c(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ct(r,((n,s)=>{const i=At(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function yl(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof U||r instanceof je||r instanceof Re||r instanceof G||r instanceof ei||r instanceof Ee||al(r))}function Ca(r,e,t){if(!yl(t)||!Mr(t)){const n=$s(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function rt(r,e,t){if((e=be(e))instanceof Gn)return e._internalPath;if(typeof e=="string")return Il(r,e);throw Ss("Field path arguments must be of type string or ",r,!1,void 0,t)}const Gf=new RegExp("[~\\*/\\[\\]]");function Il(r,e,t){if(e.search(Gf)>=0)throw Ss(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Gn(...e.split("."))._internalPath}catch{throw Ss(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Ss(r,e,t,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let o=`Function ${e}() called with invalid data`;t&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${n}`),a&&(u+=` in document ${s}`),u+=")"),new T(p.INVALID_ARGUMENT,o+r+u)}function Tl(r,e){return r.some((t=>t.isEqual(e)))}function El(r){return typeof r._readUserData=="function"}/**
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
 */class ge{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=oe.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const a=e[s];let o;i.nestedOptions&&Mr(a)?o={mapValue:{fields:new ge(i.nestedOptions).getOptionsProto(t,a)}}:a&&(o=At(a,t)??void 0),o&&n.set($.fromServerFormat(i.serverName),o)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(Cd(n,((a,o)=>[$.fromServerFormat(o),a!==void 0?At(a,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */function Kf(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Mr(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}/**
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
 */function lg(){return new Kr("deleteField")}function hg(){return new xa("serverTimestamp")}function jf(r){return new Ee(r)}/**
 * @license
 * Copyright 2024 Google LLC
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
 */function w(r){let e;return r instanceof en?r:(e=Mr(r)?Jf(r):r instanceof Array?Xf(r):wl(r,void 0),e)}function yi(r){if(r instanceof en)return r;if(r instanceof Ee)return Sr(r);if(Array.isArray(r))return Sr(jf(r));throw new Error("Unsupported value: "+typeof r)}function Da(r){return sd(r)?ps(r):w(r)}class en{constructor(){this._protoValueType="ProtoValue"}add(e){return new g("add",[this,w(e)],"add")}asBoolean(){if(this instanceof vt)return this;if(this instanceof nn)return new vl(this);if(this instanceof tn)return new Yf(this);if(this instanceof g)return new Al(this);throw new T("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new g("subtract",[this,w(e)],"subtract")}multiply(e){return new g("multiply",[this,w(e)],"multiply")}divide(e){return new g("divide",[this,w(e)],"divide")}mod(e){return new g("mod",[this,w(e)],"mod")}equal(e){return new g("equal",[this,w(e)],"equal").asBoolean()}notEqual(e){return new g("not_equal",[this,w(e)],"notEqual").asBoolean()}lessThan(e){return new g("less_than",[this,w(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new g("less_than_or_equal",[this,w(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new g("greater_than",[this,w(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new g("greater_than_or_equal",[this,w(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>w(s)));return new g("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new g("array_contains",[this,w(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new sr(e.map(w),"arrayContainsAll"):e;return new g("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new sr(e.map(w),"arrayContainsAny"):e;return new g("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new g("array_reverse",[this])}arrayLength(){return new g("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new sr(e.map(w),"equalAny"):e;return new g("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new sr(e.map(w),"notEqualAny"):e;return new g("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new g("exists",[this],"exists").asBoolean()}charLength(){return new g("char_length",[this],"charLength")}like(e){return new g("like",[this,w(e)],"like").asBoolean()}regexContains(e){return new g("regex_contains",[this,w(e)],"regexContains").asBoolean()}regexFind(e){return new g("regex_find",[this,w(e)],"regexFind")}regexFindAll(e){return new g("regex_find_all",[this,w(e)],"regexFindAll")}regexMatch(e){return new g("regex_match",[this,w(e)],"regexMatch").asBoolean()}stringContains(e){return new g("string_contains",[this,w(e)],"stringContains").asBoolean()}startsWith(e){return new g("starts_with",[this,w(e)],"startsWith").asBoolean()}endsWith(e){return new g("ends_with",[this,w(e)],"endsWith").asBoolean()}toLower(){return new g("to_lower",[this],"toLower")}toUpper(){return new g("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(w(e)),new g("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(w(e)),new g("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(w(e)),new g("rtrim",t,"rtrim")}type(){return new g("type",[this])}isType(e){return new g("is_type",[this,Sr(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(w);return new g("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new g("string_index_of",[this,w(e)],"stringIndexOf")}stringRepeat(e){return new g("string_repeat",[this,w(e)],"stringRepeat")}stringReplaceAll(e,t){return new g("string_replace_all",[this,w(e),w(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new g("string_replace_one",[this,w(e),w(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(w);return new g("concat",[this,...n],"concat")}reverse(){return new g("reverse",[this],"reverse")}arrayFilter(e,t){return new g("array_filter",[this,w(e),t],"arrayFilter")}arrayTransform(e,t){return new g("array_transform",[this,w(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new g("array_transform",[this,w(e),w(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,w(e)];return t!==void 0&&n.push(w(t)),new g("array_slice",n,"arraySlice")}arrayFirst(){return new g("array_first",[this],"arrayFirst")}arrayFirstN(e){return new g("array_first_n",[this,w(e)],"arrayFirstN")}arrayLast(){return new g("array_last",[this],"arrayLast")}arrayLastN(e){return new g("array_last_n",[this,w(e)],"arrayLastN")}arrayMaximum(){return new g("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new g("maximum_n",[this,w(e)],"arrayMaximumN")}arrayMinimum(){return new g("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new g("minimum_n",[this,w(e)],"arrayMinimumN")}arrayIndexOf(e){return new g("array_index_of",[this,w(e),w("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new g("array_index_of",[this,w(e),w("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new g("array_index_of_all",[this,w(e)],"arrayIndexOfAll")}byteLength(){return new g("byte_length",[this],"byteLength")}ceil(){return new g("ceil",[this])}floor(){return new g("floor",[this])}abs(){return new g("abs",[this])}exp(){return new g("exp",[this])}mapGet(e){return new g("map_get",[this,Sr(e)],"mapGet")}mapSet(e,t,...n){const s=[this,w(e),w(t),...n.map(w)];return new g("map_set",s,"mapSet")}mapKeys(){return new g("map_keys",[this],"mapKeys")}mapValues(){return new g("map_values",[this],"mapValues")}mapEntries(){return new g("map_entries",[this],"mapEntries")}getField(e){return new g("get_field",[this,w(e)],"get_field")}count(){return ve._create("count",[this],"count")}sum(){return ve._create("sum",[this],"sum")}average(){return ve._create("average",[this],"average")}minimum(){return ve._create("minimum",[this],"minimum")}maximum(){return ve._create("maximum",[this],"maximum")}first(){return ve._create("first",[this],"first")}last(){return ve._create("last",[this],"last")}arrayAgg(){return ve._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return ve._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return ve._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new g("maximum",[this,...n.map(w)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new g("minimum",[this,...n.map(w)],"minimum")}vectorLength(){return new g("vector_length",[this],"vectorLength")}cosineDistance(e){return new g("cosine_distance",[this,yi(e)],"cosineDistance")}dotProduct(e){return new g("dot_product",[this,yi(e)],"dotProduct")}euclideanDistance(e){return new g("euclidean_distance",[this,yi(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new g("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new g("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new g("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new g("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new g("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new g("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new g("timestamp_add",[this,w(e),w(t)],"timestampAdd")}timestampSubtract(e,t){return new g("timestamp_subtract",[this,w(e),w(t)],"timestampSubtract")}timestampDiff(e,t){return new g("timestamp_diff",[this,Da(e),w(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,w(e)];return t&&n.push(w(t)),new g("timestamp_extract",n,"timestampExtract")}documentId(){return new g("document_id",[this],"documentId")}parent(){return new g("parent",[this],"parent")}substring(e,t){const n=w(e);return new g("substring",t===void 0?[this,n]:[this,n,w(t)],"substring")}arrayGet(e){return new g("array_get",[this,w(e)],"arrayGet")}isError(){return new g("is_error",[this],"isError").asBoolean()}ifError(e){const t=new g("if_error",[this,w(e)],"ifError");return e instanceof vt?t.asBoolean():t}isAbsent(){return new g("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new g("map_remove",[this,w(e)],"mapRemove")}mapMerge(e,...t){const n=w(e),s=t.map(w);return new g("map_merge",[this,n,...s],"mapMerge")}pow(e){return new g("pow",[this,w(e)])}trunc(e){return e===void 0?new g("trunc",[this]):new g("trunc",[this,w(e)],"trunc")}round(e){return e===void 0?new g("round",[this]):new g("round",[this,w(e)],"round")}collectionId(){return new g("collection_id",[this])}length(){return new g("length",[this])}ln(){return new g("ln",[this])}sqrt(){return new g("sqrt",[this])}stringReverse(){return new g("string_reverse",[this])}ifAbsent(e){return new g("if_absent",[this,w(e)],"ifAbsent")}ifNull(e){return new g("if_null",[this,w(e)],"ifNull")}coalesce(e,...t){return new g("coalesce",[this,w(e),...t.map(w)],"coalesce")}join(e){return new g("join",[this,w(e)],"join")}log10(){return new g("log10",[this])}arraySum(){return new g("sum",[this])}split(e){return new g("split",[this,w(e)])}timestampTruncate(e,t){const n=[this,w(e)];return t&&n.push(w(t)),new g("timestamp_trunc",n)}ascending(){return Zf(this)}descending(){return em(this)}as(e){return new Wf(this,e,"as")}}class ve{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new ve(e,t);return s._methodName=n,s}as(e){return new Qf(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Qf{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class Wf{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class sr extends en{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map((t=>t._toProto(e)))}}}_readUserData(e){this.Rr.forEach((t=>t._readUserData(e)))}}class tn extends en{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new g("geo_distance",[this,w(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function ps(r){return Hf(r,"field")}function Hf(r,e){return new tn(typeof r=="string"?Be===r?vf()._internalPath:rt("field",r):r._internalPath,e)}class nn extends en{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new nn(e,void 0);return t._protoValue=e,t}_toProto(e){return E(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,Kf(this._protoValue)||(this._protoValue=At(this.value,e))}}function Sr(r,e){return wl(r,"constant")}function wl(r,e){const t=new nn(r,e);return typeof r=="boolean"?new vl(t):t}class g extends en{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new ge({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class vt extends en{get _methodName(){return this._expr._methodName}countIf(){return ve._create("count_if",[this],"countIf")}not(){return new g("not",[this],"not").asBoolean()}conditional(e,t){return new g("conditional",[this,e,t],"conditional")}ifError(e){const t=w(e),n=new g("if_error",[this,t],"ifError");return t instanceof vt?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Al extends vt{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class vl extends vt{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Yf extends vt{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Jf(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(Sr(n)),t.push(w(s))}return new g("map",t,"map")}function Xf(r){return(function(t,n){return new g("array",t.map((s=>w(s))),n)})(r,"array")}function Zf(r){return new Na(Da(r),"ascending","ascending")}function em(r){return new Na(Da(r),"descending","descending")}class Na{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:ol(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class Ce{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Vl extends Ce{get _name(){return"add_fields"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[br(e,this.fields)]}}_readUserData(e){super._readUserData(e),Rt(this.fields,e)}}class Rl extends Ce{get _name(){return"aggregate"}get _optionsUtil(){return new ge({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[br(e,this.accumulators),br(e,this.groups)]}}_readUserData(e){super._readUserData(e),Rt(this.groups,e),Rt(this.accumulators,e)}}class Pl extends Ce{get _name(){return"distinct"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[br(e,this.groups)]}}_readUserData(e){super._readUserData(e),Rt(this.groups,e)}}class jr extends Ce{get _name(){return"collection"}get _optionsUtil(){return new ge({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class Qr extends Ce{get _name(){return"collection_group"}get _optionsUtil(){return new ge({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class ni extends Ce{get _name(){return"database"}get _optionsUtil(){return new ge({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class ri extends Ce{get _name(){return"documents"}get _optionsUtil(){return new ge({})}constructor(e,t){if(super(t),!e||e.length===0)throw new T(p.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new T(p.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=n,this.mr=s}_toProto(e){return{...super._toProto(e),args:this.dr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Wr extends Ce{get _name(){return"where"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),Rt(this.condition,e)}}class Vt extends Ce{get _name(){return"limit"}get _optionsUtil(){return new ge({})}constructor(e,t){E(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[ma(e,this.limit)]}}}class uu extends Ce{get _name(){return"offset"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[ma(e,this.offset)]}}}class tm extends Ce{get _name(){return"select"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[br(e,this.selections)]}}_readUserData(e){super._readUserData(e),Rt(this.selections,e)}}class $e extends Ce{get _name(){return"sort"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),Rt(this.orderings,e)}}class ka extends Ce{get _name(){return"replace_with"}get _optionsUtil(){return new ge({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),ol(ka.pr)]}}_readUserData(e){super._readUserData(e),Rt(this.map,e)}}ka.pr="full_replace";function Rt(r,e){return El(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}// Copyright 2024 Google LLC* @license
class me{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Hr(this)}getPipelineCollectionGroup(){return Oa(this)}getPipelineCollectionId(){return xl(this)}getPipelineDocuments(){return Cs(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==Pl.name&&s._name!==Rl.name||(n="keyless"),s._name===tm.name&&n==="exact"&&(n="augmented"),s._name===Vl.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return Ze(this)}}function Ze(r){const e=r.stages[0];return e instanceof jr||e instanceof Qr||e instanceof ni||e instanceof ri?e._name:"unknown"}function Hr(r){if(Ze(r)==="collection")return r.stages[0].Vr}function Oa(r){if(Ze(r)==="collection_group")return r.stages[0].collectionId}function xl(r){switch(Ze(r)){case"collection":return D.fromString(Hr(r)).lastSegment();case"collection_group":return Oa(r);default:return}}function Cs(r){if(Ze(r)==="documents")return r.stages[0].dr}class _r{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}wr(e,t){const n=this.userDataReader.createContext(3,e);return El(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.wr("where",e),t.push(new Wr(e,{})),new _r(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new Vt(e,{})),new _r(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new $e(this.wr("sort",e.orderings),{})):n.push(new $e(this.wr("sort",[e,...t]),{})),new _r(this._db,this.userDataReader,this._userDataWriter,n)}br(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class f{constructor(e,t){this.type=e,this.value=t}static vr(){return new f("ERROR",void 0)}static Sr(){return new f("UNSET",void 0)}static Dr(){return new f("NULL",Ke)}static newValue(e){return Pe(e)?new f("NULL",Ke):(function(n){return!!n&&"booleanValue"in n})(e)?new f("BOOLEAN",e):ze(e)?new f("INT",e):zt(e)?new f("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new f("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new f("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new f("BYTES",e):e.referenceValue?new f("REFERENCE",e):e.geoPointValue?new f("GEO_POINT",e):wt(e)?new f("ARRAY",e):Jt(e)?new f("VECTOR",e):jt(e)?new f("MAP",e):new f("ERROR",void 0)}Cr(){return this.type==="ERROR"||this.type==="UNSET"}Fr(){return this.type==="NULL"}}function pr(r){if(!r.Cr())return r.value}function bl(r){return r instanceof vt?r._expr:r}function b(r){if((r=bl(r))instanceof tn)return new nm(r);if(r instanceof nn)return new rm(r);if(r instanceof sr)return new sm(r);if(r instanceof g){if(r.name==="add")return new om(r);if(r.name==="subtract")return new um(r);if(r.name==="multiply")return new cm(r);if(r.name==="divide")return new lm(r);if(r.name==="mod")return new hm(r);if(r.name==="and")return new dm(r);if(r.name==="equal")return new vm(r);if(r.name==="not_equal")return new Vm(r);if(r.name==="less_than")return new Rm(r);if(r.name==="less_than_or_equal")return new Pm(r);if(r.name==="greater_than")return new xm(r);if(r.name==="greater_than_or_equal")return new bm(r);if(r.name==="array_concat")return new Sm(r);if(r.name==="array_reverse")return new Cm(r);if(r.name==="array_contains")return new Dm(r);if(r.name==="array_contains_all")return new Nm(r);if(r.name==="array_contains_any")return new km(r);if(r.name==="array_length")return new Om(r);if(r.name==="array_element")return new Lm(r);if(r.name==="equal_any")return new Sl(r);if(r.name==="not_equal_any")return new mm(r);if(r.name==="is_nan")return new _m(r);if(r.name==="is_not_nan")return new pm(r);if(r.name==="is_null")return new gm(r);if(r.name==="is_not_null")return new ym(r);if(r.name==="is_error")return new Im(r);if(r.name==="exists")return new Tm(r);if(r.name==="not")return new si(r);if(r.name==="or")return new fm(r);if(r.name==="xor")return new La(r);if(r.name==="conditional")return new Em(r);if(r.name==="maximum")return new wm(r);if(r.name==="minimum")return new Am(r);if(r.name==="reverse")return new Mm(r);if(r.name==="replace_first")return new Fm(r);if(r.name==="replace_all")return new Um(r);if(r.name==="char_length")return new Bm(r);if(r.name==="byte_length")return new qm(r);if(r.name==="like")return new zm(r);if(r.name==="regex_contains")return new $m(r);if(r.name==="regex_match")return new Gm(r);if(r.name==="string_contains")return new Km(r);if(r.name==="starts_with")return new jm(r);if(r.name==="ends_with")return new Qm(r);if(r.name==="to_lower")return new Wm(r);if(r.name==="to_upper")return new Hm(r);if(r.name==="trim")return new Ym(r);if(r.name==="string_concat")return new Jm(r);if(r.name==="map_get")return new Xm(r);if(r.name==="cosine_distance")return new Zm(r);if(r.name==="dot_product")return new e_(r);if(r.name==="euclidean_distance")return new t_(r);if(r.name==="vector_length")return new n_(r);if(r.name==="unix_micros_to_timestamp")return new o_(r);if(r.name==="timestamp_to_unix_micros")return new l_(r);if(r.name==="unix_millis_to_timestamp")return new u_(r);if(r.name==="timestamp_to_unix_millis")return new h_(r);if(r.name==="unix_seconds_to_timestamp")return new c_(r);if(r.name==="timestamp_to_unix_seconds")return new d_(r);if(r.name==="timestamp_add")return new f_(r);if(r.name==="timestamp_subtract")return new m_(r)}throw new Error(`Unknown Expr : ${r}`)}class nm{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Be)return f.newValue({referenceValue:kn(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return f.newValue({timestampValue:_s(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return f.newValue({timestampValue:_s(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?Ws(n)?f.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:_s(i.serializer,P.fromTimestamp(Vn(a)))};if(i.serverTimestampBehavior==="previous"){const o=qr(a);if(o)return o}return{nullValue:"NULL_VALUE"}})(e,n)):f.newValue(n):f.Sr()}}class rm{constructor(e){this.expr=e}evaluate(e,t){return f.newValue(this.expr._getValue())}}class sm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.Rr.map((s=>b(s).evaluate(e,t)));return n.some((s=>s.Cr()))?f.vr():f.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function he(r){return zt(r)?Number(r.doubleValue):Number(r.integerValue)}function Qe(r){return BigInt(r.integerValue)}const im=BigInt("0x7fffffffffffffff"),am=-BigInt("0x8000000000000000");class Yr{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length>=2,24778);const n=b(this.expr.params[0]).evaluate(e,t),s=b(this.expr.params[1]).evaluate(e,t);let i=this.Or(n,s);for(const a of this.expr.params.slice(2)){const o=b(a).evaluate(e,t);i=this.Or(i,o)}return i}Or(e,t){if(e.Cr()||t.Cr())return f.vr();if(e.Fr()||t.Fr())return f.Dr();const n=e.value,s=t.value;if(!zt(n)&&!ze(n)||!zt(s)&&!ze(s))return f.vr();if(zt(n)||zt(s)){const i=this.Mr(n,s);return i?f.newValue(i):f.vr()}if(ze(n)&&ze(s)){const i=this.Nr(n,s);return i===void 0?f.vr():typeof i=="number"?f.newValue({doubleValue:i}):i<am||i>im?f.vr():f.newValue({integerValue:`${i}`})}return f.vr()}}function st(r,e){return Z(r)!==Z(e)?"TYPE_MISMATCH":Ae(r)||Ae(e)?"NOT_EQ":Pe(r)&&Pe(e)?"EQ":Pe(r)||Pe(e)?"NULL":wt(r)&&wt(e)?(function(n,s){var a,o,u;if(((a=n.values)==null?void 0:a.length)!==((o=s.values)==null?void 0:o.length))return"NOT_EQ";let i=!1;for(let c=0;c<(((u=n.values)==null?void 0:u.length)??0);c++){const l=n.values[c],h=s.values[c];switch(st(l,h)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:v(44609,{Lr:l,Br:h})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):Jt(r)&&Jt(e)||jt(r)&&jt(e)?(function(n,s){const i=n.fields||{},a=s.fields||{};if(Vs(i)!==Vs(a))return"NOT_EQ";let o=!1;for(const u in i)if(i.hasOwnProperty(u)){if(a[u]===void 0)return"NOT_EQ";switch(st(i[u],a[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":o=!0}}return o?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return ke(n,s,{Te:!1,Ee:!0,he:!0})})(r,e)?"EQ":"NOT_EQ"}class om extends Yr{Nr(e,t){return Qe(e)+Qe(t)}Mr(e,t){return{doubleValue:he(e)+he(t)}}}class um extends Yr{constructor(e){super(e),this.expr=e}Nr(e,t){return Qe(e)-Qe(t)}Mr(e,t){return{doubleValue:he(e)-he(t)}}}class cm extends Yr{constructor(e){super(e),this.expr=e}Nr(e,t){return Qe(e)*Qe(t)}Mr(e,t){return{doubleValue:he(e)*he(t)}}}class lm extends Yr{constructor(e){super(e),this.expr=e}Nr(e,t){const n=Qe(t);if(n!==BigInt(0))return Qe(e)/n}Mr(e,t){const n=he(t);return n===0?{doubleValue:Tn(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:he(e)/n}}}class hm extends Yr{constructor(e){super(e),this.expr=e}Nr(e,t){const n=Qe(t);if(n!==BigInt(0))return Qe(e)%n}Mr(e,t){const n=he(t);if(n!==0)return{doubleValue:he(e)%n}}}class dm{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":if(!((i=o.value)!=null&&i.booleanValue))return f.newValue(ue);break;case"NULL":s=!0;break;default:n=!0}}return n?f.vr():s?f.Dr():f.newValue(we)}}class si{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,9634);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return f.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return f.Dr();default:return f.vr()}}}class fm{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":if((i=o.value)!=null&&i.booleanValue)return f.newValue(we);break;case"NULL":s=!0;break;default:n=!0}}return n?f.vr():s?f.Dr():f.newValue(ue)}}class La{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":n=La.xor(n,!!((i=o.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return f.vr()}}return s?f.Dr():f.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class Sl{constructor(e){this.expr=e}evaluate(e,t){var a,o;E(this.expr.params.length===2,55094);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();for(const u of((o=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:o.values)??[])switch(Pe(s.value)&&Pe(u)?"EQ":st(s.value,u)){case"EQ":return f.newValue(we);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:v(44608,{value:s.value,candidate:u})}return n?f.Dr():f.newValue(ue)}}class mm{constructor(e){this.expr=e}evaluate(e,t){return new si(new g("not",[new g("equal_any",this.expr.params)])).evaluate(e,t)}}class _m{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,23322);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return f.newValue(ue);case"DOUBLE":return f.newValue({booleanValue:isNaN(he(n.value))});case"NULL":return f.Dr();default:return f.vr()}}}class pm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,50406),new si(new g("not",[new g("is_nan",this.expr.params)])).evaluate(e,t)}}class gm{constructor(e){this.expr=e}evaluate(e,t){switch(E(this.expr.params.length===1,23123),b(this.expr.params[0]).evaluate(e,t).type){case"NULL":return f.newValue(we);case"UNSET":case"ERROR":return f.vr();default:return f.newValue(ue)}}}class ym{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,23167),new si(new g("not",[new g("is_null",this.expr.params)])).evaluate(e,t)}}class Im{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,5228),b(this.expr.params[0]).evaluate(e,t).type==="ERROR"?f.newValue(we):f.newValue(ue)}}class Tm{constructor(e){this.expr=e}evaluate(e,t){switch(E(this.expr.params.length===1,6877),b(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return f.vr();case"UNSET":return f.newValue(ue);default:return f.newValue(we)}}}class Em{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===3,11706);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?b(this.expr.params[1]).evaluate(e,t):b(this.expr.params[2]).evaluate(e,t);case"NULL":return b(this.expr.params[2]).evaluate(e,t);default:return f.vr()}}}class wm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>b(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||pe(i.value,s.value)>0?i:s}return s===void 0?f.Dr():s}}class Am{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>b(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||pe(i.value,s.value)<0?i:s}return s===void 0?f.Dr():s}}class Kn{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return f.vr()}const s=b(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return f.vr()}return this.Ur(n,s)}}class vm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return f.newValue(we);if(e.Fr()||t.Fr()||Ae(e.value)||Ae(t.value)||Z(e.value)!==Z(t.value))return f.newValue(ue);switch(st(e.value,t.value)){case"EQ":return f.newValue(we);case"NOT_EQ":return f.newValue(ue);case"NULL":return f.Dr();default:v(44615,{left:e,right:t})}}}class Vm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){switch(st(e.value,t.value)){case"EQ":return f.newValue(ue);case"NOT_EQ":case"TYPE_MISMATCH":return f.newValue(we);case"NULL":return f.Dr();default:v(44614,{left:e,right:t})}}}class Rm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||Ae(e.value)||Ae(t.value)?f.newValue(ue):f.newValue({booleanValue:pe(e.value,t.value)<0})}}class Pm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||Ae(e.value)||Ae(t.value)?f.newValue(ue):st(e.value,t.value)==="EQ"?f.newValue(we):f.newValue({booleanValue:pe(e.value,t.value)<0})}}class xm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||Ae(e.value)||Ae(t.value)?f.newValue(ue):f.newValue({booleanValue:pe(e.value,t.value)>0})}}class bm extends Kn{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||Ae(e.value)||Ae(t.value)?f.newValue(ue):st(e.value,t.value)==="EQ"?f.newValue(we):f.newValue({booleanValue:pe(e.value,t.value)>0})}}class Sm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Cm{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,216);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return f.newValue({arrayValue:{values:[...i].reverse()}})}default:return f.vr()}}}class Dm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===2,52884),new Sl(new g("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Nm{constructor(e){this.expr=e}evaluate(e,t){var u,c,l,h;E(this.expr.params.length===2,1392);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=((c=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:c.values)??[],o=((h=(l=s.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[];for(const d of a){let _=!1;n=!1;for(const y of o){switch(Pe(d)&&Pe(y)?"EQ":st(d,y)){case"EQ":_=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:v(44613,{value:y,search:d})}if(_)break}if(!_)return f.newValue(ue)}return f.newValue(we)}}class km{constructor(e){this.expr=e}evaluate(e,t){var u,c,l,h;E(this.expr.params.length===2,2680);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=((c=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:c.values)??[],o=((h=(l=s.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[];for(const d of o)for(const _ of a)switch(Pe(d)&&Pe(_)?"EQ":st(d,_)){case"EQ":return f.newValue(we);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:v(44608,{value:d,search:_})}return n?f.Dr():f.newValue(ue)}}class Om{constructor(e){this.expr=e}evaluate(e,t){var s,i,a;E(this.expr.params.length===1,38605);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"ARRAY":return f.newValue({integerValue:`${((a=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)??0}`});default:return f.vr()}}}class Lm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Mm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,1508);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"BYTES":{const a=(s=n.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const o=Q.fromBase64String(a).toUint8Array();return o.reverse(),f.newValue({bytesValue:Q.fromUint8Array(o).toBase64()})}return f.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=n.value)==null?void 0:i.stringValue,o=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),u=Array.from(o,(c=>c.segment)).reverse();return f.newValue({stringValue:u.join("")})}default:return f.vr()}}}class Fm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Um{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Bm{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,19400);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"STRING":{const s=(function(a){let o=0;for(let u=0;u<a.length;u++){const c=a.codePointAt(u);if(c===void 0)return;if(c<=65535)if(c>=55296&&c<=57343)if(c<=56319){const l=a.codePointAt(u+1);l!==void 0&&l>=56320&&l<=57343?(o+=1,u++):o+=1}else o+=1;else o+=1;else{if(!(c<=1114111))return;o+=1,u++}}return o})(n.value.stringValue);return s===void 0?f.vr():f.newValue({integerValue:s})}default:return f.vr()}}}class qm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,8486);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const a=(s=n.value)==null?void 0:s.bytesValue;return typeof a=="string"?f.newValue({integerValue:Q.fromBase64String(a).toUint8Array().length}):f.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(u){let c=0;for(let l=0;l<u.length;l++){const h=u.codePointAt(l);if(h===void 0)return;if(h>=55296&&h<=57343){if(!(h<=56319))return;{const d=u.codePointAt(l+1);if(d===void 0||!(d>=56320&&d<=57343))return;c+=4,l++}}else if(h<=127)c+=1;else if(h<=2047)c+=2;else if(h<=65535)c+=3;else{if(!(h<=1114111))return;c+=4,l++}}return c})((i=n.value)==null?void 0:i.stringValue);return a===void 0?f.vr():f.newValue({integerValue:a})}case"NULL":return f.Dr();default:return f.vr()}}}class jn{constructor(e){this.expr=e}evaluate(e,t){var a,o;E(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return f.vr()}return n?f.Dr():this.kr((a=s.value)==null?void 0:a.stringValue,(o=i.value)==null?void 0:o.stringValue)}}class zm extends jn{kr(e,t){try{const n=(function(a){let o="";for(let u=0;u<a.length;u++){const c=a.charAt(u);switch(c){case"_":o+=".";break;case"%":o+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":o+="\\"+c;break;default:o+=c}}return"^"+o+"$"})(t),s=na.compile(n);return f.newValue({booleanValue:s.matches(e)})}catch(n){return Ne(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),f.vr()}}}class $m extends jn{kr(e,t){try{const n=na.compile(t);return f.newValue({booleanValue:n.matcher(e).find()})}catch{return Ne(`Invalid regex pattern found in regex_contains: ${t}, returning error`),f.vr()}}}class Gm extends jn{kr(e,t){try{return f.newValue({booleanValue:na.compile(t).matches(e)})}catch{return Ne(`Invalid regex pattern found in regex_match: ${t}, returning error`),f.vr()}}}class Km extends jn{kr(e,t){return f.newValue({booleanValue:e.includes(t)})}}class jm extends jn{kr(e,t){return f.newValue({booleanValue:e.startsWith(t)})}}class Qm extends jn{kr(e,t){return f.newValue({booleanValue:e.endsWith(t)})}}class Wm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,29079);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return f.Dr();default:return f.vr()}}}class Hm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,60487);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return f.Dr();default:return f.vr()}}}class Ym{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,28544);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return f.Dr();default:return f.vr()}}}class Jm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((a=>b(a).evaluate(e,t)));let s="",i=!1;for(const a of n)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return f.vr()}return i?f.Dr():f.newValue({stringValue:s})}}class Xm{constructor(e){this.expr=e}evaluate(e,t){var a,o,u,c;E(this.expr.params.length===2,4483);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return f.Sr();case"MAP":break;default:return f.vr()}const s=b(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return f.vr();const i=(c=(o=(a=n.value)==null?void 0:a.mapValue)==null?void 0:o.fields)==null?void 0:c[(u=s.value)==null?void 0:u.stringValue];return i===void 0?f.Sr():f.newValue(i)}}class Ma{constructor(e){this.expr=e}evaluate(e,t){var c,l;E(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=Ni(s.value),o=Ni(i.value);if(a===void 0||o===void 0||((c=a.values)==null?void 0:c.length)!==((l=o.values)==null?void 0:l.length))return f.vr();const u=this.qr(a,o);return u===void 0||isNaN(u)?f.vr():f.newValue({doubleValue:u})}}class Zm extends Ma{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,a=0,o=0;for(let c=0;c<n.length;c++){if(!Et(n[c])||!Et(s[c]))return;const l=he(n[c]),h=he(s[c]);i+=l*h,a+=l*l,o+=h*h}const u=Math.sqrt(a)*Math.sqrt(o);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class e_ extends Ma{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let a=0;a<n.length;a++){if(!Et(n[a])||!Et(s[a]))return;i+=he(n[a])*he(s[a])}return i}}class t_ extends Ma{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let a=0;a<n.length;a++){if(!Et(n[a])||!Et(s[a]))return;const o=he(n[a]),u=he(s[a]);i+=Math.pow(o-u,2)}return Math.sqrt(i)}}class n_{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,39044);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=Ni(n.value);return f.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return f.Dr();default:return f.vr()}}}const Cr=BigInt(-62135596800),Dr=BigInt(253402300799),Ds=BigInt(1e3),yt=BigInt(1e6),r_=Cr*Ds,s_=Dr*Ds+BigInt(999),i_=Cr*yt,a_=Dr*yt+BigInt(999999);function Fa(r){return r>=i_&&r<=a_}function Cl(r){return r>=Cr&&r<=Dr}function Nr(r,e){const t=BigInt(r);return!(t<Cr||t>Dr)&&!(e<0||e>=1e9)&&(t!==Cr||e===0)&&!(t===Dr&&e>999999999)}function Dl(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function Ua(r){return BigInt(r.seconds)*yt+BigInt(Math.trunc(r.nanoseconds/1e3))}class Ba{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return f.Dr();default:return f.vr()}}}class o_ extends Ba{toTimestamp(e){if(!Fa(e))return f.vr();let t=Number(e/yt),n=Number(e%yt*BigInt(1e3));const s=Dl(t,n);return t=s.seconds,n=s.nanos,Nr(t,n)?f.newValue({timestampValue:{seconds:t,nanos:n}}):f.vr()}}class u_ extends Ba{toTimestamp(e){if(!(function(a){return a>=r_&&a<=s_})(e))return f.vr();let t=Number(e/Ds),n=Number(e%Ds*BigInt(1e6));const s=Dl(t,n);return t=s.seconds,n=s.nanos,Nr(t,n)?f.newValue({timestampValue:{seconds:t,nanos:n}}):f.vr()}}class c_ extends Ba{toTimestamp(e){if(!Cl(e))return f.vr();const t=Number(e);return f.newValue({timestampValue:{seconds:t,nanos:0}})}}class qa{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return f.Dr();default:return f.vr()}const s=Aa(n.value.timestampValue);return Nr(s.seconds,s.nanoseconds)?this.$r(s):f.vr()}}class l_ extends qa{$r(e){const t=Ua(e);return Fa(t)?f.newValue({integerValue:`${t.toString()}`}):f.vr()}}class h_ extends qa{$r(e){const t=Ua(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?f.newValue({integerValue:n.toString()}):f.newValue({integerValue:(n-BigInt(1)).toString()})}}class d_ extends qa{$r(e){const t=BigInt(e.seconds);return Cl(t)?f.newValue({integerValue:t.toString()}):f.vr()}}class Nl{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(N){switch(N){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return f.vr();break;case"NULL":n=!0;break;default:return f.vr()}const o=b(this.expr.params[2]).evaluate(e,t);switch(o.type){case"INT":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const u=BigInt(o.value.integerValue);let c;try{switch(a){case"microsecond":c=u;break;case"millisecond":c=u*BigInt(1e3);break;case"second":c=u*BigInt(1e6);break;case"minute":c=u*BigInt(6e7);break;case"hour":c=u*BigInt(36e8);break;case"day":c=u*BigInt(864e8);break;default:return f.vr()}if(a!=="microsecond"&&u!==BigInt(0)&&c/u!==BigInt(this.Kr(a)))return f.vr()}catch(k){return Ne(`Error during timestamp arithmetic: ${k}`),f.vr()}const l=Aa(s.value.timestampValue);if(!Nr(l.seconds,l.nanoseconds))return f.vr();const h=Ua(l),d=this.Wr(h,c);if(!Fa(d))return f.vr();const _=Number(d/yt),y=d%yt,R=Number((y<0?y+yt:y)*BigInt(1e3)),x=y<0?_-1:_;return Nr(x,R)?f.newValue({timestampValue:{seconds:x,nanos:R}}):f.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class f_ extends Nl{Wr(e,t){return e+t}}class m_ extends Nl{Wr(e,t){return e-t}}function kr(r){if((r=bl(r))instanceof tn)return`fld(${r.fieldName})`;if(r instanceof nn)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof G?`ref(${t.path})`:t instanceof Ee?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof g)return`fn(${r.name},[${r.params.map(kr).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.Rr.map(kr).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function __(r){if(r instanceof Vl)return`${r._name}(${ss(r.fields)})`;if(r instanceof Rl){let e=`${r._name}(${ss(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${ss(r.groups)})`),e}if(r instanceof Pl)return`${r._name}(${ss(r.groups)})`;if(r instanceof jr)return`${r._name}(${r.Vr})`;if(r instanceof Qr)return`${r._name}(${r.collectionId})`;if(r instanceof ni)return`${r._name}()`;if(r instanceof ri)return`${r._name}(${r.dr.sort()})`;if(r instanceof Wr)return`${r._name}(${kr(r.condition)})`;if(r instanceof Vt)return`${r._name}(${r.limit})`;if(r instanceof $e)return`${r._name}(${(function(t){return t.map((n=>`${kr(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function ss(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${kr(t)}`)).join(",")}`}function et(r){return r.stages.map((e=>__(e))).join("|")}function kl(r,e){return et(r)===et(e)}function H(r){return r instanceof me}function cu(r){return H(r)?et(r):fr(r)}function Ol(r){return H(r)?et(r):(function(t){return`${Ps(xe(t))}|lt:${t.limitType}`})(r)}function ii(r,e){return r instanceof me&&e instanceof me?kl(r,e):!(r instanceof me&&!(e instanceof me)||!(r instanceof me)&&e instanceof me)&&ef(r,e)}function ai(r){return Je(r)?et(r):Ps(r)}function za(r,e){return r instanceof me&&e instanceof me?kl(r,e):!(r instanceof me&&!(e instanceof me)||!(r instanceof me)&&e instanceof me)&&ya(r,e)}function p_(r,e){const t=(function(s){let i=!1;const a=[];for(const o of s)if(o instanceof $e)if(i=!0,o.orderings.some((u=>u.expr instanceof tn&&u.expr.fieldName===Be)))a.push(o);else{const u=o.orderings.map((c=>c));u.push(ps(Be).ascending()),a.push(new $e(u,{}))}else o instanceof Vt&&(i||(a.push(new $e([ps(Be).ascending()],{})),i=!0)),a.push(o);return i||a.push(new $e([ps(Be).ascending()],{})),a})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new me(r.userDataReader.serializer,t,e)}/**
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
 */class $a{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&qd(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=hr(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=hr(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=Kc();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let o=this.applyToLocalView(a,i.mutatedFields);o=t.has(s.key)?null:o;const u=Sc(a,o);u!==null&&n.set(s.key,u),a.isValidDocument()||a.convertToNoDocument(P.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),C())}isEqual(e){return this.batchId===e.batchId&&yn(this.mutations,e.mutations,((t,n)=>Bo(t,n)))&&yn(this.baseMutations,e.baseMutations,((t,n)=>Bo(t,n)))}}class Ga{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){E(e.mutations.length===n.length,58842,{Qr:e.mutations.length,Gr:n.length});let s=(function(){return sf})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new Ga(e,t,n,s)}}/**
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
 */class Ka{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
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
 */class Ge{constructor(e,t,n,s,i=P.min(),a=P.min(),o=Q.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=o,this.expectedCount=u}withSequenceNumber(e){return new Ge(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Ge(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Ge(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Ge(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class Ll{constructor(e){this.zr=e}}function g_(r,e){let t;if(e.document)t=_f(r.zr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=A.fromSegments(e.noDocument.path),s=Zt(e.noDocument.readTime);t=j.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return v(56709);{const n=A.fromSegments(e.unknownDocument.path),s=Zt(e.unknownDocument.version);t=j.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime((function(s){const i=new U(s[0],s[1]);return P.fromTimestamp(i)})(e.readTime)),t}function lu(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ns(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=(function(i,a){return{name:kn(i,a.key),fields:a.data.value.mapValue.fields,updateTime:Nn(i,a.version.toTimestamp()),createTime:Nn(i,a.createTime.toTimestamp())}})(r.zr,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:Xt(e.version)};else{if(!e.isUnknownDocument())return v(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:Xt(e.version)}}return n}function Ns(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function Xt(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Zt(r){const e=new U(r.seconds,r.nanoseconds);return P.fromTimestamp(e)}function Ft(r,e){const t=(e.baseMutations||[]).map((i=>qi(r.zr,i)));for(let i=0;i<e.mutations.length-1;++i){const a=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const o=e.mutations[i+1];a.updateTransforms=o.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map((i=>qi(r.zr,i))),s=U.fromMillis(e.localWriteTimeMs);return new $a(e.batchId,s,t,n)}function ir(r,e){const t=Zt(e.readTime),n=e.lastLimboFreeSnapshotVersion!==void 0?Zt(e.lastLimboFreeSnapshotVersion):P.min();let s;return s=(function(a){return a.structuredPipeline!==void 0})(e.query)?(function(a,o){var l,h;const u=a.structuredPipeline;E((((l=u==null?void 0:u.pipeline)==null?void 0:l.stages)??[]).length>0,1845);const c=(h=u==null?void 0:u.pipeline)==null?void 0:h.stages.map(y_);return new me(o,c)})(e.query,r.zr):(function(a){return a.documents!==void 0})(e.query)?(function(a){const o=a.documents.length;return E(o===1,1966,{count:o}),xe(zr(Jc(a.documents[0])))})(e.query):(function(a){return xe(tl(a))})(e.query),new Ge(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,Q.fromBase64String(e.resumeToken))}function Ml(r,e){const t=Xt(e.snapshotVersion),n=Xt(e.lastLimboFreeSnapshotVersion);let s;s=Je(e.target)?nl(r.zr,e.target):Ia(e.target)?Zc(r.zr,e.target):el(r.zr,e.target).yt;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:ai(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Fl(r){const e=tl({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?bs(e,e.limit,"L"):e}function is(r,e){return new Ka(e.largestBatchId,qi(r.zr,e.overlayMutation))}function hu(r,e){const t=e.path.lastSegment();return[r,_e(e.path.popLast()),t]}function du(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:Xt(n.readTime),documentKey:_e(n.documentKey.path),largestBatchId:n.largestBatchId}}function y_(r){switch(r.name){case"collection":return new jr(r.args[0].referenceValue,{});case"collection_group":return new Qr(r.args[1].stringValue,{});case"database":return new ni({});case"documents":return new ri(r.args.map((e=>e.referenceValue)),{});case"where":return new Wr($i(r.args[0]),{});case"limit":{const e=r.args[0].integerValue??r.args[0].doubleValue;return new Vt(typeof e=="number"?e:Number(e),{})}case"sort":return new $e(r.args.map((e=>(function(n){var i,a;const s=(i=n.mapValue)==null?void 0:i.fields;return new Na($i(s.expression),(a=s.direction)==null?void 0:a.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${r.name} not supported.`)}}function $i(r){return r.fieldReferenceValue?new tn(rt("_exprFromProto",r.fieldReferenceValue),"_exprFromProto"):r.functionValue?(function(t){var n;return new g(t.functionValue.name,((n=t.functionValue.args)==null?void 0:n.map($i))||[])})(r):nn._fromProto(r)}class I_{getBundleMetadata(e,t){return fu(e).get(t).next((n=>{if(n)return(function(i){return{id:i.bundleId,createTime:Zt(i.createTime),version:i.version}})(n)}))}saveBundleMetadata(e,t){return fu(e).put((function(s){return{bundleId:s.id,createTime:Xt(ce(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return mu(e).get(t).next((n=>{if(n)return(function(i){return{name:i.name,query:Fl(i.bundledQuery),readTime:Zt(i.readTime)}})(n)}))}saveNamedQuery(e,t){return mu(e).put((function(s){return{name:s.name,readTime:Xt(ce(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function fu(r){return re(r,Ks)}function mu(r){return re(r,js)}/**
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
 */class oi{constructor(e,t){this.serializer=e,this.userId=t}static jr(e,t){const n=t.uid||"";return new oi(e,n)}getOverlay(e,t){return on(e).get(hu(this.userId,t)).next((n=>n?is(this.serializer,n):null))}getOverlays(e,t){const n=De();return m.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=De();return on(e).ee(((s,i)=>{const a=is(this.serializer,i);a.largestBatchId>t&&n.set(a.getKey(),a)})).next((()=>n))}saveOverlays(e,t,n){const s=[];return n.forEach(((i,a)=>{const o=new Ka(t,a);s.push(this.Hr(e,o))})),m.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach((a=>s.add(_e(a.getCollectionPath()))));const i=[];return s.forEach((a=>{const o=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(on(e).Z(Si,o))})),m.waitFor(i)}getOverlaysForCollection(e,t,n){const s=De(),i=_e(t),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return on(e).H(Si,a).next((o=>{for(const u of o){const c=is(this.serializer,u);s.set(c.getKey(),c)}return s}))}getOverlaysForCollectionGroup(e,t,n,s){const i=De();let a;const o=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return on(e).ee({index:lc,range:o},((u,c,l)=>{const h=is(this.serializer,c);i.size()<s||h.largestBatchId===a?(i.set(h.getKey(),h),a=h.largestBatchId):l.done()})).next((()=>i))}Hr(e,t){return on(e).put((function(s,i,a){const[o,u,c]=hu(i,a.mutation.key);return{userId:i,collectionPath:u,documentId:c,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:xr(s.zr,a.mutation)}})(this.serializer,this.userId,t))}}function on(r){return re(r,Qs)}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class T_{Jr(e){return re(e,ca)}getSessionToken(e){return this.Jr(e).get("sessionToken").next((t=>{const n=t==null?void 0:t.value;return n?Q.fromUint8Array(n):Q.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Jr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class Ut{constructor(){}Yr(e,t){this.Zr(e,t),t.Xr()}Zr(e,t){if("nullValue"in e)this.ei(t,5);else if("booleanValue"in e)this.ei(t,10),t.ti(e.booleanValue?1:0);else if("integerValue"in e)this.ei(t,15),t.ti(z(e.integerValue));else if("doubleValue"in e){const n=z(e.doubleValue);isNaN(n)?this.ei(t,13):(this.ei(t,15),Tn(n)?t.ti(0):t.ti(n))}else if("timestampValue"in e){let n=e.timestampValue;this.ei(t,20),typeof n=="string"&&(n=tt(n)),t.ni(`${n.seconds||""}`),t.ti(n.nanos||0)}else if("stringValue"in e)this.ri(e.stringValue,t),this.ii(t);else if("bytesValue"in e)this.ei(t,30),t.si(nt(e.bytesValue)),this.ii(t);else if("referenceValue"in e)this._i(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.ei(t,45),t.ti(n.latitude||0),t.ti(n.longitude||0)}else"mapValue"in e?wc(e)?this.ei(t,Number.MAX_SAFE_INTEGER):Jt(e)?this.oi(e.mapValue,t):(this.ai(e.mapValue,t),this.ii(t)):"arrayValue"in e?(this.ui(e.arrayValue,t),this.ii(t)):v(19022,{ci:e})}ri(e,t){this.ei(t,25),this.li(e,t)}li(e,t){t.ni(e)}ai(e,t){const n=e.fields||{};this.ei(t,55);for(const s of Object.keys(n))this.ri(s,t),this.Zr(n[s],t)}oi(e,t){var a,o;const n=e.fields||{};this.ei(t,53);const s=Yt,i=((o=(a=n[s].arrayValue)==null?void 0:a.values)==null?void 0:o.length)||0;this.ei(t,15),t.ti(z(i)),this.ri(s,t),this.Zr(n[s],t)}ui(e,t){const n=e.values||[];this.ei(t,50);for(const s of n)this.Zr(s,t)}_i(e,t){this.ei(t,37),A.fromName(e).path.forEach((n=>{this.ei(t,60),this.li(n,t)}))}ei(e,t){e.ti(t)}ii(e){e.ti(2)}}Ut.Ei=new Ut;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const un=255;function E_(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function _u(r){const e=64-(function(n){let s=0;for(let i=0;i<8;++i){const a=E_(255&n[i]);if(s+=a,a!==8)break}return s})(r);return Math.ceil(e/8)}class w_{constructor(){this.buffer=new Uint8Array(1024),this.position=0}hi(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ti(n.value),n=t.next();this.Pi()}Ri(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ii(n.value),n=t.next();this.Ai()}Vi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ti(n);else if(n<2048)this.Ti(960|n>>>6),this.Ti(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ti(480|n>>>12),this.Ti(128|63&n>>>6),this.Ti(128|63&n);else{const s=t.codePointAt(0);this.Ti(240|s>>>18),this.Ti(128|63&s>>>12),this.Ti(128|63&s>>>6),this.Ti(128|63&s)}}this.Pi()}di(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ii(n);else if(n<2048)this.Ii(960|n>>>6),this.Ii(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ii(480|n>>>12),this.Ii(128|63&n>>>6),this.Ii(128|63&n);else{const s=t.codePointAt(0);this.Ii(240|s>>>18),this.Ii(128|63&s>>>12),this.Ii(128|63&s>>>6),this.Ii(128|63&s)}}this.Ai()}fi(e){const t=this.mi(e),n=_u(t);this.pi(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}gi(e){const t=this.mi(e),n=_u(t);this.pi(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}yi(){this.wi(un),this.wi(255)}bi(){this.Si(un),this.Si(255)}reset(){this.position=0}seed(e){this.pi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Di(){return this.buffer.slice(0,this.position)}mi(e){const t=(function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)})(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ti(e){const t=255&e;t===0?(this.wi(0),this.wi(255)):t===un?(this.wi(un),this.wi(0)):this.wi(t)}Ii(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===un?(this.Si(un),this.Si(0)):this.Si(e)}Pi(){this.wi(0),this.wi(1)}Ai(){this.Si(0),this.Si(1)}wi(e){this.pi(1),this.buffer[this.position++]=e}Si(e){this.pi(1),this.buffer[this.position++]=~e}pi(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class A_{constructor(e){this.xi=e}si(e){this.xi.hi(e)}ni(e){this.xi.Vi(e)}ti(e){this.xi.fi(e)}Xr(){this.xi.yi()}}class v_{constructor(e){this.xi=e}si(e){this.xi.Ri(e)}ni(e){this.xi.di(e)}ti(e){this.xi.gi(e)}Xr(){this.xi.bi()}}class Zn{constructor(){this.xi=new w_,this.ascending=new A_(this.xi),this.descending=new v_(this.xi)}seed(e){this.xi.seed(e)}Ci(e){return e===0?this.ascending:this.descending}Di(){return this.xi.Di()}reset(){this.xi.reset()}}/**
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
 */class Bt{constructor(e,t,n,s){this.Fi=e,this.Oi=t,this.Mi=n,this.Ni=s}Li(){const e=this.Ni.length,t=e===0||this.Ni[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.Ni,0),t!==e?n.set([0],this.Ni.length):++n[n.length-1],new Bt(this.Fi,this.Oi,this.Mi,n)}Bi(e,t,n){return{indexId:this.Fi,uid:e,arrayValue:gs(this.Mi),directionalValue:gs(this.Ni),orderedDocumentKey:gs(t),documentKey:n.path.toArray()}}Ui(e,t,n){const s=this.Bi(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function ct(r,e){let t=r.Fi-e.Fi;return t!==0?t:(t=pu(r.Mi,e.Mi),t!==0?t:(t=pu(r.Ni,e.Ni),t!==0?t:A.comparator(r.Oi,e.Oi)))}function pu(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function gs(r){return Wu()?(function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n})(r):r}function gu(r){return typeof r!="string"?r:(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(r)}class yu{constructor(e){this.ki=new F(((t,n)=>$.comparator(t.field,n.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.qi=e.orderBy,this.$i=[];for(const t of e.filters){const n=t;n.isInequality()?this.ki=this.ki.add(n):this.$i.push(n)}}get Ki(){return this.ki.size>1}Wi(e){if(E(e.collectionGroup===this.collectionId,49279),this.Ki)return!1;const t=Pi(e);if(t!==void 0&&!this.Qi(t))return!1;const n=kt(e);let s=new Set,i=0,a=0;for(;i<n.length&&this.Qi(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.ki.size>0){const o=this.ki.getIterator().getNext();if(!s.has(o.field.canonicalString())){const u=n[i];if(!this.Gi(o,u)||!this.zi(this.qi[a++],u))return!1}++i}for(;i<n.length;++i){const o=n[i];if(a>=this.qi.length||!this.zi(this.qi[a++],o))return!1}return!0}ji(){if(this.Ki)return null;let e=new F($.comparator);const t=[];for(const n of this.$i)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new cs(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new cs(n.field,0))}for(const n of this.qi)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new cs(n.field,n.dir==="asc"?0:1)));return new Es(Es.UNKNOWN_ID,this.collectionId,t,yr.empty())}Qi(e){for(const t of this.$i)if(this.Gi(t,e))return!0;return!1}Gi(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}zi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function Ul(r){var t,n;if(E(r instanceof L||r instanceof B,20012),r instanceof L){if(r instanceof Fc){const s=((n=(t=r.value.arrayValue)==null?void 0:t.values)==null?void 0:n.map((i=>L.create(r.field,"==",i))))||[];return B.create(s,"or")}return r}const e=r.filters.map((s=>Ul(s)));return B.create(e,r.op)}function V_(r){if(r.getFilters().length===0)return[];const e=ji(Ul(r));return E(Bl(e),7391),Gi(e)||Ki(e)?[e]:e.getFilters()}function Gi(r){return r instanceof L}function Ki(r){return r instanceof B&&ga(r)}function Bl(r){return Gi(r)||Ki(r)||(function(t){if(t instanceof B&&ki(t)){for(const n of t.getFilters())if(!Gi(n)&&!Ki(n))return!1;return!0}return!1})(r)}function ji(r){if(E(r instanceof L||r instanceof B,34018),r instanceof L)return r;if(r.filters.length===1)return ji(r.filters[0]);const e=r.filters.map((n=>ji(n)));let t=B.create(e,r.op);return t=ks(t),Bl(t)?t:(E(t instanceof B,64498),E(Dn(t),40251),E(t.filters.length>1,57927),t.filters.reduce(((n,s)=>ja(n,s))))}function ja(r,e){let t;return E(r instanceof L||r instanceof B,38388),E(e instanceof L||e instanceof B,25473),t=r instanceof L?e instanceof L?(function(s,i){return B.create([s,i],"and")})(r,e):Iu(r,e):e instanceof L?Iu(e,r):(function(s,i){if(E(s.filters.length>0&&i.filters.length>0,48005),Dn(s)&&Dn(i))return Oc(s,i.getFilters());const a=ki(s)?s:i,o=ki(s)?i:s,u=a.filters.map((c=>ja(c,o)));return B.create(u,"or")})(r,e),ks(t)}function Iu(r,e){if(Dn(e))return Oc(e,r.getFilters());{const t=e.filters.map((n=>ja(r,n)));return B.create(t,"or")}}function ks(r){if(E(r instanceof L||r instanceof B,11850),r instanceof L)return r;const e=r.getFilters();if(e.length===1)return ks(e[0]);if(Nc(r))return r;const t=e.map((s=>ks(s))),n=[];return t.forEach((s=>{s instanceof L?n.push(s):s instanceof B&&(s.op===r.op?n.push(...s.filters):n.push(s))})),n.length===1?n[0]:B.create(n,r.op)}/**
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
 */class R_{constructor(){this.Hi=new Qa}addToCollectionParentIndex(e,t){return this.Hi.add(t),m.resolve()}getCollectionParents(e,t){return m.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return m.resolve()}deleteFieldIndex(e,t){return m.resolve()}deleteAllFieldIndexes(e){return m.resolve()}createTargetIndexes(e,t){return m.resolve()}getDocumentsMatchingTarget(e,t){return m.resolve(null)}getIndexType(e,t){return m.resolve(0)}getFieldIndexes(e,t){return m.resolve([])}getNextCollectionGroupToUpdate(e){return m.resolve(null)}getMinOffset(e,t){return m.resolve(Se.min())}getMinOffsetFromCollectionGroup(e,t){return m.resolve(Se.min())}updateCollectionGroup(e,t,n){return m.resolve()}updateIndexEntries(e,t){return m.resolve()}}class Qa{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new F(D.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new F(D.comparator)).toArray()}}/**
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
 */const Tu="IndexedDbIndexManager",as=new Uint8Array(0);class P_{constructor(e,t){this.databaseId=t,this.Ji=new Qa,this.Yi=new ot((n=>Ps(n)),((n,s)=>ya(n,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Ji.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Ji.add(t)}));const i={collectionId:n,parent:_e(s)};return Eu(e).put(i)}return m.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[Ju(t),""],!1,!0);return Eu(e).H(s).next((i=>{for(const a of i){if(a.collectionId!==t)break;n.push(qe(a.parent))}return n}))}addFieldIndex(e,t){const n=er(e),s=(function(o){return{indexId:o.indexId,collectionGroup:o.collectionGroup,fields:o.fields.map((u=>[u.fieldPath.canonicalString(),u.kind]))}})(t);delete s.indexId;const i=n.add(s);if(t.indexState){const a=ln(e);return i.next((o=>{a.put(du(o,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const n=er(e),s=ln(e),i=cn(e);return n.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=er(e),n=cn(e),s=ln(e);return t.Z().next((()=>n.Z())).next((()=>s.Z()))}createTargetIndexes(e,t){return m.forEach(this.Zi(t),(n=>this.getIndexType(e,n).next((s=>{if(s===0||s===1){const i=new yu(n).ji();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const n=cn(e);let s=!0;const i=new Map;return m.forEach(this.Zi(t),(a=>this.Xi(e,a).next((o=>{s&&(s=!!o),i.set(a,o)})))).next((()=>{if(s){let a=C();const o=[];return m.forEach(i,((u,c)=>{I(Tu,`Using index ${(function(O){return`id=${O.indexId}|cg=${O.collectionGroup}|f=${O.fields.map((se=>`${se.fieldPath}:${se.kind}`)).join(",")}`})(u)} to execute ${Ps(t)}`);const l=(function(O,se){const K=Pi(se);if(K===void 0)return null;for(const ee of xs(O,K.fieldPath))switch(ee.op){case"array-contains-any":return ee.value.arrayValue.values||[];case"array-contains":return[ee.value]}return null})(c,u),h=(function(O,se){const K=new Map;for(const ee of kt(se))for(const ye of xs(O,ee.fieldPath))switch(ye.op){case"==":case"in":K.set(ee.fieldPath.canonicalString(),ye.value);break;case"not-in":case"!=":return K.set(ee.fieldPath.canonicalString(),ye.value),Array.from(K.values())}return null})(c,u),d=(function(O,se){const K=[];let ee=!0;for(const ye of kt(se)){const ut=ye.kind===0?Ko(O,ye.fieldPath,O.startAt):jo(O,ye.fieldPath,O.startAt);K.push(ut.value),ee&&(ee=ut.inclusive)}return new Cn(K,ee)})(c,u),_=(function(O,se){const K=[];let ee=!0;for(const ye of kt(se)){const ut=ye.kind===0?jo(O,ye.fieldPath,O.endAt):Ko(O,ye.fieldPath,O.endAt);K.push(ut.value),ee&&(ee=ut.inclusive)}return new Cn(K,ee)})(c,u),y=this.es(u,c,d),R=this.es(u,c,_),x=this.ts(u,c,h),k=this.ns(u.indexId,l,y,d.inclusive,R,_.inclusive,x);return m.forEach(k,(N=>n.Y(N,t.limit).next((O=>{O.forEach((se=>{const K=A.fromSegments(se.documentKey);a.has(K)||(a=a.add(K),o.push(K))}))}))))})).next((()=>o))}return m.resolve(null)}))}Zi(e){let t=this.Yi.get(e);return t||(e.filters.length===0?t=[e]:t=V_(B.create(e.filters,"and")).map((n=>Li(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt))),this.Yi.set(e,t),t)}ns(e,t,n,s,i,a,o){const u=(t!=null?t.length:1)*Math.max(n.length,i.length),c=u/(t!=null?t.length:1),l=[];for(let h=0;h<u;++h){const d=t?this.rs(t[h/c]):as,_=this.ss(e,d,n[h%c],s),y=this._s(e,d,i[h%c],a),R=o.map((x=>this.ss(e,d,x,!0)));l.push(...this.createRange(_,y,R))}return l}ss(e,t,n,s){const i=new Bt(e,A.empty(),t,n);return s?i:i.Li()}_s(e,t,n,s){const i=new Bt(e,A.empty(),t,n);return s?i.Li():i}Xi(e,t){const n=new yu(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let a=null;for(const o of i)n.Wi(o)&&(!a||o.fields.length>a.fields.length)&&(a=o);return a}))}getIndexType(e,t){let n=2;const s=this.Zi(t);return m.forEach(s,(i=>this.Xi(e,i).next((a=>{a?n!==0&&a.fields.length<(function(u){let c=new F($.comparator),l=!1;for(const h of u.filters)for(const d of h.getFlattenedFilters())d.field.isKeyField()||(d.op==="array-contains"||d.op==="array-contains-any"?l=!0:c=c.add(d.field));for(const h of u.orderBy)h.field.isKeyField()||(c=c.add(h.field));return c.size+(l?1:0)})(i)&&(n=1):n=0})))).next((()=>(function(a){return a.limit!==null})(t)&&s.length>1&&n===2?1:n))}us(e,t){const n=new Zn;for(const s of kt(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const a=n.Ci(s.kind);Ut.Ei.Yr(i,a)}return n.Di()}rs(e){const t=new Zn;return Ut.Ei.Yr(e,t.Ci(0)),t.Di()}cs(e,t){const n=new Zn;return Ut.Ei.Yr(vr(this.databaseId,t),n.Ci((function(i){const a=kt(i);return a.length===0?0:a[a.length-1].kind})(e))),n.Di()}ts(e,t,n){if(n===null)return[];let s=[];s.push(new Zn);let i=0;for(const a of kt(e)){const o=n[i++];for(const u of s)if(this.ls(t,a.fieldPath)&&wt(o))s=this.Es(s,a,o);else{const c=u.Ci(a.kind);Ut.Ei.Yr(o,c)}}return this.hs(s)}es(e,t,n){return this.ts(e,t,n.position)}hs(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].Di();return t}Es(e,t,n){const s=[...e],i=[];for(const a of n.arrayValue.values||[])for(const o of s){const u=new Zn;u.seed(o.Di()),Ut.Ei.Yr(a,u.Ci(t.kind)),i.push(u)}return i}ls(e,t){return!!e.filters.find((n=>n instanceof L&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in")))}getFieldIndexes(e,t){const n=er(e),s=ln(e);return(t?n.H(bi,IDBKeyRange.bound(t,t)):n.H()).next((i=>{const a=[];return m.forEach(i,(o=>s.get([o.indexId,this.uid]).next((u=>{a.push((function(l,h){const d=h?new yr(h.sequenceNumber,new Se(Zt(h.readTime),new A(qe(h.documentKey)),h.largestBatchId)):yr.empty(),_=l.fields.map((([y,R])=>new cs($.fromServerFormat(y),R)));return new Es(l.indexId,l.collectionGroup,_,d)})(o,u))})))).next((()=>a))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:S(n.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,n){const s=er(e),i=ln(e);return this.Ts(e).next((a=>s.H(bi,IDBKeyRange.bound(t,t)).next((o=>m.forEach(o,(u=>i.put(du(u.indexId,this.uid,a,n))))))))}updateIndexEntries(e,t){const n=new Map;return m.forEach(t,((s,i)=>{const a=n.get(s.collectionGroup);return(a?m.resolve(a):this.getFieldIndexes(e,s.collectionGroup)).next((o=>(n.set(s.collectionGroup,o),m.forEach(o,(u=>this.Ps(e,s,u).next((c=>{const l=this.Rs(i,u);return c.isEqual(l)?m.resolve():this.Is(e,i,u,c,l)})))))))}))}As(e,t,n,s){return cn(e).put(s.Bi(this.uid,this.cs(n,t.key),t.key))}Vs(e,t,n,s){return cn(e).delete(s.Ui(this.uid,this.cs(n,t.key),t.key))}Ps(e,t,n){const s=cn(e);let i=new F(ct);return s.ee({index:cc,range:IDBKeyRange.only([n.indexId,this.uid,gs(this.cs(n,t))])},((a,o)=>{i=i.add(new Bt(n.indexId,t,gu(o.arrayValue),gu(o.directionalValue)))})).next((()=>i))}Rs(e,t){let n=new F(ct);const s=this.us(t,e);if(s==null)return n;const i=Pi(t);if(i!=null){const a=e.data.field(i.fieldPath);if(wt(a))for(const o of a.arrayValue.values||[])n=n.add(new Bt(t.indexId,e.key,this.rs(o),s))}else n=n.add(new Bt(t.indexId,e.key,as,s));return n}Is(e,t,n,s,i){I(Tu,"Updating index entries for document '%s'",t.key);const a=[];return(function(u,c,l,h,d){const _=u.getIterator(),y=c.getIterator();let R=an(_),x=an(y);for(;R||x;){let k=!1,N=!1;if(R&&x){const O=l(R,x);O<0?N=!0:O>0&&(k=!0)}else R!=null?N=!0:k=!0;k?(h(x),x=an(y)):N?(d(R),R=an(_)):(R=an(_),x=an(y))}})(s,i,ct,(o=>{a.push(this.As(e,t,n,o))}),(o=>{a.push(this.Vs(e,t,n,o))})),m.waitFor(a)}Ts(e){let t=1;return ln(e).ee({index:uc,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((n,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,n){n=n.sort(((a,o)=>ct(a,o))).filter(((a,o,u)=>!o||ct(a,u[o-1])!==0));const s=[];s.push(e);for(const a of n){const o=ct(a,e),u=ct(a,t);if(o===0)s[0]=e.Li();else if(o>0&&u<0)s.push(a),s.push(a.Li());else if(u>0)break}s.push(t);const i=[];for(let a=0;a<s.length;a+=2){if(this.ds(s[a],s[a+1]))return[];const o=s[a].Ui(this.uid,as,A.empty()),u=s[a+1].Ui(this.uid,as,A.empty());i.push(IDBKeyRange.bound(o,u))}return i}ds(e,t){return ct(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(wu)}getMinOffset(e,t){return m.mapArray(this.Zi(t),(n=>this.Xi(e,n).next((s=>s||v(44426))))).next(wu)}}function Eu(r){return re(r,Er)}function cn(r){return re(r,cr)}function er(r){return re(r,ua)}function ln(r){return re(r,ur)}function wu(r){E(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;ia(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new Se(e.readTime,e.documentKey,t)}/**
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
 */function ql(r,e,t){const n=r.store(Le),s=r.store(En),i=[],a=IDBKeyRange.only(t.batchId);let o=0;const u=n.ee({range:a},((l,h,d)=>(o++,d.delete())));i.push(u.next((()=>{E(o===1,47070,{batchId:t.batchId})})));const c=[];for(const l of t.mutations){const h=ic(e,l.key.path,t.batchId);i.push(s.delete(h)),c.push(l.key)}return m.waitFor(i).next((()=>c))}function Os(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw v(14731);e=r.noDocument}return JSON.stringify(e).length}/**
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
 */class ui{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.fs={}}static jr(e,t,n,s){E(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new ui(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return lt(e).ee({index:qt,range:n},((s,i,a)=>{t=!1,a.done()})).next((()=>t))}addMutationBatch(e,t,n,s){const i=_n(e),a=lt(e);return a.add({}).next((o=>{E(typeof o=="number",49019);const u=new $a(o,t,n,s),c=(function(_,y,R){const x=R.baseMutations.map((N=>xr(_.zr,N))),k=R.mutations.map((N=>xr(_.zr,N)));return{userId:y,batchId:R.batchId,localWriteTimeMs:R.localWriteTime.toMillis(),baseMutations:x,mutations:k}})(this.serializer,this.userId,u),l=[];let h=new F(((d,_)=>S(d.canonicalString(),_.canonicalString())));for(const d of s){const _=ic(this.userId,d.key.path,o);h=h.add(d.key.path.popLast()),l.push(a.put(c)),l.push(i.put(_,od))}return h.forEach((d=>{l.push(this.indexManager.addToCollectionParentIndex(e,d))})),e.addOnCommittedListener((()=>{this.fs[o]=u.keys()})),m.waitFor(l).next((()=>u))}))}lookupMutationBatch(e,t){return lt(e).get(t).next((n=>n?(E(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),Ft(this.serializer,n)):null))}ps(e,t){return this.fs[t]?m.resolve(this.fs[t]):this.lookupMutationBatch(e,t).next((n=>{if(n){const s=n.keys();return this.fs[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return lt(e).ee({index:qt,range:s},((a,o,u)=>{o.userId===this.userId&&(E(o.batchId>=n,47524,{gs:n}),i=Ft(this.serializer,o)),u.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=Gt;return lt(e).ee({index:qt,range:t,reverse:!0},((s,i,a)=>{n=i.batchId,a.done()})).next((()=>n))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,Gt],[this.userId,Number.POSITIVE_INFINITY]);return lt(e).H(qt,t).next((n=>n.map((s=>Ft(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=ls(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return _n(e).ee({range:s},((a,o,u)=>{const[c,l,h]=a,d=qe(l);if(c===this.userId&&t.path.isEqual(d))return lt(e).get(h).next((_=>{if(!_)throw v(61480,{ys:a,batchId:h});E(_.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:_.userId,batchId:h}),i.push(Ft(this.serializer,_))}));u.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new F(S);const s=[];return t.forEach((i=>{const a=ls(this.userId,i.path),o=IDBKeyRange.lowerBound(a),u=_n(e).ee({range:o},((c,l,h)=>{const[d,_,y]=c,R=qe(_);d===this.userId&&i.path.isEqual(R)?n=n.add(y):h.done()}));s.push(u)})),m.waitFor(s).next((()=>this.ws(e,n)))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=ls(this.userId,n),a=IDBKeyRange.lowerBound(i);let o=new F(S);return _n(e).ee({range:a},((u,c,l)=>{const[h,d,_]=u,y=qe(d);h===this.userId&&n.isPrefixOf(y)?y.length===s&&(o=o.add(_)):l.done()})).next((()=>this.ws(e,o)))}ws(e,t){const n=[],s=[];return t.forEach((i=>{s.push(lt(e).get(i).next((a=>{if(a===null)throw v(35274,{batchId:i});E(a.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:a.userId,batchId:i}),n.push(Ft(this.serializer,a))})))})),m.waitFor(s).next((()=>n))}removeMutationBatch(e,t){return ql(e.le,this.userId,t).next((n=>(e.addOnCommittedListener((()=>{this.bs(t.batchId)})),m.forEach(n,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}bs(e){delete this.fs[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return m.resolve();const n=IDBKeyRange.lowerBound((function(a){return[a]})(this.userId)),s=[];return _n(e).ee({range:n},((i,a,o)=>{if(i[0]===this.userId){const u=qe(i[1]);s.push(u)}else o.done()})).next((()=>{E(s.length===0,56720,{vs:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return zl(e,this.userId,t)}Ss(e){return $l(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:Gt,lastStreamToken:""}))}}function zl(r,e,t){const n=ls(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return _n(r).ee({range:i,X:!0},((o,u,c)=>{const[l,h,d]=o;l===e&&h===s&&(a=!0),c.done()})).next((()=>a))}function lt(r){return re(r,Le)}function _n(r){return re(r,En)}function $l(r){return re(r,Ir)}/**
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
 */class it{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new it(0)}static Cs(){return new it(-1)}}/**
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
 */class x_{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Fs(e).next((t=>{const n=new it(t.highestTargetId);return t.highestTargetId=n.next(),this.Os(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Fs(e).next((t=>P.fromTimestamp(new U(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Fs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,n){return this.Fs(e).next((s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Os(e,s))))}addTargetData(e,t){return this.Ms(e,t).next((()=>this.Fs(e).next((n=>(n.targetCount+=1,this.Ns(t,n),this.Os(e,n))))))}updateTargetData(e,t){return this.Ms(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>hn(e).delete(t.targetId))).next((()=>this.Fs(e))).next((n=>(E(n.targetCount>0,8065),n.targetCount-=1,this.Os(e,n))))}removeTargets(e,t,n){let s=0;const i=[];return hn(e).ee(((a,o)=>{const u=ir(this.serializer,o);u.sequenceNumber<=t&&n.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))})).next((()=>m.waitFor(i))).next((()=>s))}forEachTarget(e,t){return hn(e).ee(((n,s)=>{const i=ir(this.serializer,s);t(i)}))}Fs(e){return Au(e).get(vs).next((t=>(E(t!==null,2888),t)))}Os(e,t){return Au(e).put(vs,t)}Ms(e,t){return hn(e).put(Ml(this.serializer,t))}Ns(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.Fs(e).next((t=>t.targetCount))}getTargetData(e,t){const n=ai(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return hn(e).ee({range:s,index:oc},((a,o,u)=>{const c=ir(this.serializer,o);za(t,c.target)&&(i=c,u.done())})).next((()=>i))}addMatchingKeys(e,t,n){const s=[],i=ft(e);return t.forEach((a=>{const o=_e(a.path);s.push(i.put({targetId:n,path:o})),s.push(this.referenceDelegate.addReference(e,n,a))})),m.waitFor(s)}removeMatchingKeys(e,t,n){const s=ft(e);return m.forEach(t,(i=>{const a=_e(i.path);return m.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(e,n,i)])}))}removeMatchingKeysForTargetId(e,t){const n=ft(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=ft(e);let i=C();return s.ee({range:n,X:!0},((a,o,u)=>{const c=qe(a[1]),l=new A(c);i=i.add(l)})).next((()=>i))}containsKey(e,t){const n=_e(t.path),s=IDBKeyRange.bound([n],[Ju(n)],!1,!0);let i=0;return ft(e).ee({index:oa,X:!0,range:s},(([a,o],u,c)=>{a!==0&&(i++,c.done())})).next((()=>i>0))}dt(e,t){return hn(e).get(t).next((n=>n?ir(this.serializer,n):null))}}function hn(r){return re(r,wn)}function Au(r){return re(r,Kt)}function ft(r){return re(r,An)}/**
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
 */class b_{constructor(e,t){this.db=e,this.garbageCollector=fl(this,t)}lr(e){const t=this.Ls(e);return this.db.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Er(e,t){return this.Bs(e,((n,s)=>t(s)))}addReference(e,t,n){return os(e,n)}removeReference(e,t,n){return os(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return os(e,t)}Us(e,t){return(function(s,i){let a=!1;return $l(s).te((o=>zl(s,o,i).next((u=>(u&&(a=!0),m.resolve(!u)))))).next((()=>a))})(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Bs(e,((a,o)=>{if(o<=t){const u=this.Us(e,a).next((c=>{if(!c)return i++,n.getEntry(e,a).next((()=>(n.removeEntry(a,P.min()),ft(e).delete((function(h){return[0,_e(h.path)]})(a)))))}));s.push(u)}})).next((()=>m.waitFor(s))).next((()=>n.apply(e))).next((()=>i))}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return os(e,t)}Bs(e,t){const n=ft(e);let s,i=Ie.ce;return n.ee({index:oa},(([a,o],{path:u,sequenceNumber:c})=>{a===0?(i!==Ie.ce&&t(new A(qe(s)),i),i=c,s=u):i=Ie.ce})).next((()=>{i!==Ie.ce&&t(new A(qe(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function os(r,e){return ft(r).put((function(n,s){return{targetId:0,path:_e(n.path),sequenceNumber:s}})(e,r.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function Gl(r,e){var n;let t=e;for(const s of r.stages)t=S_({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function ci(r,e){return Gl(r,[e]).length>0}function Kl(r,e){return H(r)?ci(r,e):Xs(r,e)}function S_(r,e,t){if(e instanceof jr)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&`/${o.key.getCollectionPath().canonicalString()}`===i.Vr))})(0,e,t);if(e instanceof Wr)return(function(s,i,a){return a.filter((o=>{const u=pr(b(i.condition).evaluate(s,o));return u!==void 0&&ke(u,we)}))})(r,e,t);if(e instanceof Qr)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&o.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof ni)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()))})(0,0,t);if(e instanceof ri)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&i.mr.has(o.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Vt)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof $e)return(function(s,i,a){const o=i.orderings.map((u=>({ks:b(u.expr),direction:u.direction})));return[...a].sort(((u,c)=>{for(const{ks:l,direction:h}of o){const d=pr(l.evaluate(s,u)),_=pr(l.evaluate(s,c)),y=pe(d??Ke,_??Ke);if(y!==0)return h==="ascending"?y:-y}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function Qi(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof $e)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=pr(b(s.expr).evaluate({serializer:r.serializer},t)),a=pr(b(s.expr).evaluate({serializer:r.serializer},n)),o=pe(i||Ke,a||Ke);if(o!==0)return s.direction==="ascending"?o:-o}return 0}}function Ii(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof Vt)return{limit:t.limit}}}/**
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
 */class jl{constructor(){this.changes=new ot((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,j.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?m.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class C_{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return ht(e).put(n)}removeEntry(e,t,n){return ht(e).delete((function(i,a){const o=i.path.toArray();return[o.slice(0,o.length-2),o[o.length-2],Ns(a),o[o.length-1]]})(t,n))}updateMetadata(e,t){return this.getMetadata(e).next((n=>(n.byteSize+=t,this.qs(e,n))))}getEntry(e,t){let n=j.newInvalidDocument(t);return ht(e).ee({index:hs,range:IDBKeyRange.only(tr(t))},((s,i)=>{n=this.$s(t,i)})).next((()=>n))}Ks(e,t){let n={size:0,document:j.newInvalidDocument(t)};return ht(e).ee({index:hs,range:IDBKeyRange.only(tr(t))},((s,i)=>{n={document:this.$s(t,i),size:Os(i)}})).next((()=>n))}getEntries(e,t){let n=te();return this.Ws(e,t,((s,i)=>{const a=this.$s(s,i);n=n.insert(s,a)})).next((()=>n))}getAllEntries(e){let t=te();return ht(e).ee(((n,s)=>{const i=this.$s(A.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}Qs(e,t){let n=te(),s=new q(A.comparator);return this.Ws(e,t,((i,a)=>{const o=this.$s(i,a);n=n.insert(i,o),s=s.insert(i,Os(a))})).next((()=>({documents:n,Gs:s})))}Ws(e,t,n){if(t.isEmpty())return m.resolve();let s=new F(Ru);t.forEach((u=>s=s.add(u)));const i=IDBKeyRange.bound(tr(s.first()),tr(s.last())),a=s.getIterator();let o=a.getNext();return ht(e).ee({index:hs,range:i},((u,c,l)=>{const h=A.fromSegments([...c.prefixPath,c.collectionGroup,c.documentId]);for(;o&&Ru(o,h)<0;)n(o,null),o=a.getNext();o&&o.isEqual(h)&&(n(o,c),o=a.hasNext()?a.getNext():null),o?l.j(tr(o)):l.done()})).next((()=>{for(;o;)n(o,null),o=a.hasNext()?a.getNext():null}))}getDocumentsMatchingQuery(e,t,n,s,i){const a=H(t)?D.fromString(Hr(t)):t.path,o=[a.popLast().toArray(),a.lastSegment(),Ns(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],u=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return ht(e).H(IDBKeyRange.bound(o,u,!0)).next((c=>{i==null||i.incrementDocumentReadCount(c.length);let l=te();for(const h of c){const d=this.$s(A.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);d.isFoundDocument()&&(Kl(t,d)||s.has(d.key))&&(l=l.insert(d.key,d))}return l}))}getAllFromCollectionGroup(e,t,n,s){let i=te();const a=Vu(t,n),o=Vu(t,Se.max());return ht(e).ee({index:ac,range:IDBKeyRange.bound(a,o,!0)},((u,c,l)=>{const h=this.$s(A.fromSegments(c.prefixPath.concat(c.collectionGroup,c.documentId)),c);i=i.insert(h.key,h),i.size===s&&l.done()})).next((()=>i))}newChangeBuffer(e){return new D_(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return vu(e).get(xi).next((t=>(E(!!t,20021),t)))}qs(e,t){return vu(e).put(xi,t)}$s(e,t){if(t){const n=g_(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(P.min())))return n}return j.newInvalidDocument(e)}}function Ql(r){return new C_(r)}class D_ extends jl{constructor(e,t){super(),this.zs=e,this.trackRemovals=t,this.js=new ot((n=>n.toString()),((n,s)=>n.isEqual(s)))}applyChanges(e){const t=[];let n=0,s=new F(((i,a)=>S(i.canonicalString(),a.canonicalString())));return this.changes.forEach(((i,a)=>{const o=this.js.get(i);if(t.push(this.zs.removeEntry(e,i,o.readTime)),a.isValidDocument()){const u=lu(this.zs.serializer,a);s=s.add(i.path.popLast());const c=Os(u);n+=c-o.size,t.push(this.zs.addEntry(e,i,u))}else if(n-=o.size,this.trackRemovals){const u=lu(this.zs.serializer,a.convertToNoDocument(P.min()));t.push(this.zs.addEntry(e,i,u))}})),s.forEach((i=>{t.push(this.zs.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.zs.updateMetadata(e,n)),m.waitFor(t)}getFromCache(e,t){return this.zs.Ks(e,t).next((n=>(this.js.set(t,{size:n.size,readTime:n.document.readTime}),n.document)))}getAllFromCache(e,t){return this.zs.Qs(e,t).next((({documents:n,Gs:s})=>(s.forEach(((i,a)=>{this.js.set(i,{size:a,readTime:n.get(i).readTime})})),n)))}}function vu(r){return re(r,Tr)}function ht(r){return re(r,As)}function tr(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Vu(r,e){const t=e.documentKey.path.toArray();return[r,Ns(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Ru(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=S(t[i],n[i]),s)return s;return s=S(t.length,n.length),s||(s=S(t[t.length-2],n[n.length-2]),s||S(t[t.length-1],n[n.length-1]))}/**
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
 *//**
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
 */class N_{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Wl{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&hr(n.mutation,s,Te.empty(),U.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,C()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=C()){const s=De();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let a=Mt();return i.forEach(((o,u)=>{a=a.insert(o,u.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const n=De();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,C())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,o)=>{t.set(a,o)}))}))}computeViews(e,t,n,s){let i=te();const a=mr(),o=(function(){return mr()})();return t.forEach(((u,c)=>{const l=n.get(c.key);s.has(c.key)&&(l===void 0||l.mutation instanceof at)?i=i.insert(c.key,c):l!==void 0?(a.set(c.key,l.mutation.getFieldMask()),hr(l.mutation,c,l.mutation.getFieldMask(),U.now())):a.set(c.key,Te.empty())})),this.recalculateAndSaveOverlays(e,i).next((u=>(u.forEach(((c,l)=>a.set(c,l))),t.forEach(((c,l)=>o.set(c,new N_(l,a.get(c)??null)))),o)))}recalculateAndSaveOverlays(e,t){const n=mr();let s=new q(((a,o)=>a-o)),i=C();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const o of a)o.keys().forEach((u=>{const c=t.get(u);if(c===null)return;let l=n.get(u)||Te.empty();l=o.applyToLocalView(c,l),n.set(u,l);const h=(s.get(o.batchId)||C()).add(u);s=s.insert(o.batchId,h)}))})).next((()=>{const a=[],o=s.getReverseIterator();for(;o.hasNext();){const u=o.getNext(),c=u.key,l=u.value,h=Kc();l.forEach((d=>{if(!i.has(d)){const _=Sc(t.get(d),n.get(d));_!==null&&h.set(d,_),i=i.add(d)}})),a.push(this.documentOverlayCache.saveOverlays(e,c,h))}return m.waitFor(a)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return H(t)?this.getDocumentsMatchingPipeline(e,t,n,s):Jd(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Bc(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):m.resolve(De());let o=In,u=i;return a.next((c=>m.forEach(c,((l,h)=>(o<h.largestBatchId&&(o=h.largestBatchId),i.get(l)?m.resolve():this.remoteDocumentCache.getEntry(e,l).next((d=>{u=u.insert(l,d)}))))).next((()=>this.populateOverlays(e,c,i))).next((()=>this.computeViews(e,u,c,C()))).next((l=>({batchId:o,changes:Gc(l)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new A(t)).next((n=>{let s=Mt();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let a=Mt();return this.indexManager.getCollectionParents(e,i).next((o=>m.forEach(o,(u=>{const c=(function(h,d){return new zn(d,null,h.explicitOrderBy.slice(),h.filters.slice(),h.limit,h.limitType,h.startAt,h.endAt)})(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,n,s).next((l=>{l.forEach(((h,d)=>{a=a.insert(h,d)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(o=>Xs(t,o)))))}getDocumentsMatchingPipeline(e,t,n,s){if(Ze(t)==="collection_group"){const i=Oa(t);let a=Mt();return this.indexManager.getCollectionParents(e,i).next((o=>m.forEach(o,(u=>{const c=(function(h,d){const _=h.stages.map((y=>y instanceof Qr?new jr(d.canonicalString(),{}):y));return new me(h.serializer,_)})(t,u.child(i));return this.getDocumentsMatchingPipeline(e,c,n,s).next((l=>{l.forEach(((h,d)=>{a=a.insert(h,d)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((a=>{switch(i=a,Ze(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let o=C();for(const u of Cs(t))o=o.add(A.fromPath(u));return this.remoteDocumentCache.getEntries(e,o);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new T("invalid-argument",`Invalid pipeline source to execute offline: ${et(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(o=>ci(t,o)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,a)=>{const o=a.getKey();t.get(o)===null&&(t=t.insert(o,j.newInvalidDocument(o)))}));let s=Mt();return t.forEach(((i,a)=>{const o=e.get(i);o!==void 0&&hr(o.mutation,a,Te.empty(),U.now()),n(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,n){switch(Ze(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,D.fromString(Hr(t)),n);case"collection_group":throw new T("invalid-argument",`Unexpected collection group pipeline: ${et(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Cs(t).map((s=>A.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new T("invalid-argument",`Failed to get overlays for pipeline: ${et(t)}`)}}}/**
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
 */class k_{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return m.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:ce(s.createTime)}})(t)),m.resolve()}getNamedQuery(e,t){return m.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,(function(s){return{name:s.name,query:Fl(s.bundledQuery),readTime:ce(s.readTime)}})(t)),m.resolve()}}/**
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
 */class O_{constructor(){this.overlays=new q(A.comparator),this.Ys=new Map}getOverlay(e,t){return m.resolve(this.overlays.get(t))}getOverlays(e,t){const n=De();return m.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=De();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),m.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Hr(e,t,i)})),m.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ys.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ys.delete(n)),m.resolve()}getOverlaysForCollection(e,t,n){const s=De(),i=t.length+1,a=new A(t.child("")),o=this.overlays.getIteratorFrom(a);for(;o.hasNext();){const u=o.getNext().value,c=u.getKey();if(!t.isPrefixOf(c.path))break;c.path.length===i&&u.largestBatchId>n&&s.set(u.getKey(),u)}return m.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new q(((c,l)=>c-l));const a=this.overlays.getIterator();for(;a.hasNext();){const c=a.getNext().value;if(c.getKey().getCollectionGroup()===t&&c.largestBatchId>n){let l=i.get(c.largestBatchId);l===null&&(l=De(),i=i.insert(c.largestBatchId,l)),l.set(c.getKey(),c)}}const o=De(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((c,l)=>o.set(c,l))),!(o.size()>=s)););return m.resolve(o)}Hr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Ys.get(s.largestBatchId).delete(n.key);this.Ys.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new Ka(t,n));let i=this.Ys.get(t);i===void 0&&(i=C(),this.Ys.set(t,i)),this.Ys.set(t,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class L_{constructor(){this.sessionToken=Q.EMPTY_BYTE_STRING}getSessionToken(e){return m.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,m.resolve()}}/**
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
 */class Wa{constructor(){this.Zs=new F(ie.Xs),this.e_=new F(ie.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){const n=new ie(e,t);this.Zs=this.Zs.add(n),this.e_=this.e_.add(n)}n_(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.r_(new ie(e,t))}i_(e,t){e.forEach((n=>this.removeReference(n,t)))}s_(e){const t=new A(new D([])),n=new ie(t,e),s=new ie(t,e+1),i=[];return this.e_.forEachInRange([n,s],(a=>{this.r_(a),i.push(a.key)})),i}__(){this.Zs.forEach((e=>this.r_(e)))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){const t=new A(new D([])),n=new ie(t,e),s=new ie(t,e+1);let i=C();return this.e_.forEachInRange([n,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new ie(e,0),n=this.Zs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class ie{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return A.comparator(e.key,t.key)||S(e.a_,t.a_)}static t_(e,t){return S(e.a_,t.a_)||A.comparator(e.key,t.key)}}/**
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
 */class M_{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new F(ie.Xs)}checkEmpty(e){return m.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new $a(i,t,n,s);this.mutationQueue.push(a);for(const o of s)this.u_=this.u_.add(new ie(o.key,i)),this.indexManager.addToCollectionParentIndex(e,o.key.path.popLast());return m.resolve(a)}lookupMutationBatch(e,t){return m.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.l_(n),i=s<0?0:s;return m.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return m.resolve(this.mutationQueue.length===0?Gt:this.gs-1)}getAllMutationBatches(e){return m.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new ie(t,0),s=new ie(t,Number.POSITIVE_INFINITY),i=[];return this.u_.forEachInRange([n,s],(a=>{const o=this.c_(a.a_);i.push(o)})),m.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new F(S);return t.forEach((s=>{const i=new ie(s,0),a=new ie(s,Number.POSITIVE_INFINITY);this.u_.forEachInRange([i,a],(o=>{n=n.add(o.a_)}))})),m.resolve(this.E_(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;A.isDocumentKey(i)||(i=i.child(""));const a=new ie(new A(i),0);let o=new F(S);return this.u_.forEachWhile((u=>{const c=u.key.path;return!!n.isPrefixOf(c)&&(c.length===s&&(o=o.add(u.a_)),!0)}),a),m.resolve(this.E_(o))}E_(e){const t=[];return e.forEach((n=>{const s=this.c_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){E(this.h_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.u_;return m.forEach(t.mutations,(s=>{const i=new ie(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.u_=n}))}bs(e){}containsKey(e,t){const n=new ie(t,0),s=this.u_.firstAfterOrEqual(n);return m.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,m.resolve()}h_(e,t){return this.l_(e)}l_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}c_(e){const t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class F_{constructor(e){this.T_=e,this.docs=(function(){return new q(A.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,a=this.T_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return m.resolve(n?n.document.mutableCopy():j.newInvalidDocument(t))}getEntries(e,t){let n=te();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():j.newInvalidDocument(s))})),m.resolve(n)}getAllEntries(e){let t=te();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),m.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,a;H(t)?(i=D.fromString(Hr(t)),a=l=>ci(t,l)):(i=t.path,a=l=>Xs(t,l));let o=te();const u=new A(i.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(u);for(;c.hasNext();){const{key:l,value:{document:h}}=c.getNext();if(!i.isPrefixOf(l.path))break;l.path.length>i.length+1||ia(ec(h),n)<=0||(s.has(h.key)||a(h))&&(o=o.insert(h.key,h.mutableCopy()))}return m.resolve(o)}getAllFromCollectionGroup(e,t,n,s){v(9500)}P_(e,t){return m.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new U_(this)}getSize(e){return m.resolve(this.size)}}class U_ extends jl{constructor(e){super(),this.zs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.zs.addEntry(e,s)):this.zs.removeEntry(n)})),m.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
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
 */class B_{constructor(e){this.persistence=e,this.R_=new ot((t=>ai(t)),za),this.lastRemoteSnapshotVersion=P.min(),this.highestTargetId=0,this.I_=0,this.A_=new Wa,this.targetCount=0,this.V_=it.xs()}forEachTarget(e,t){return this.R_.forEach(((n,s)=>t(s))),m.resolve()}getLastRemoteSnapshotVersion(e){return m.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return m.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),m.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.I_&&(this.I_=t),m.resolve()}Ms(e){this.R_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.V_=new it(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,m.resolve()}updateTargetData(e,t){return this.Ms(t),m.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,m.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.R_.forEach(((a,o)=>{o.sequenceNumber<=t&&n.get(o.targetId)===null&&(this.R_.delete(a),i.push(this.removeMatchingKeysForTargetId(e,o.targetId)),s++)})),m.waitFor(i).next((()=>s))}getTargetCount(e){return m.resolve(this.targetCount)}getTargetData(e,t){const n=this.R_.get(t)||null;return m.resolve(n)}addMatchingKeys(e,t,n){return this.A_.n_(t,n),m.resolve()}removeMatchingKeys(e,t,n){this.A_.i_(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),m.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),m.resolve()}getMatchingKeysForTargetId(e,t){const n=this.A_.o_(t);return m.resolve(n)}containsKey(e,t){return m.resolve(this.A_.containsKey(t))}}/**
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
 */class Ha{constructor(e,t){this.d_={},this.overlays={},this.f_=new Ie(0),this.m_=!1,this.m_=!0,this.p_=new L_,this.referenceDelegate=e(this),this.g_=new B_(this),this.indexManager=new R_,this.remoteDocumentCache=(function(s){return new F_(s)})((n=>this.referenceDelegate.y_(n))),this.serializer=new Ll(t),this.w_=new k_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new O_,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.d_[e.toKey()];return n||(n=new M_(t,this.referenceDelegate),this.d_[e.toKey()]=n),n}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,n){I("MemoryPersistence","Starting transaction:",e);const s=new q_(this.f_.next());return this.referenceDelegate.b_(),n(s).next((i=>this.referenceDelegate.v_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}S_(e,t){return m.or(Object.values(this.d_).map((n=>()=>n.containsKey(e,t))))}}class q_ extends nc{constructor(e){super(),this.currentSequenceNumber=e}}class li{constructor(e){this.persistence=e,this.D_=new Wa,this.x_=null}static C_(e){return new li(e)}get F_(){if(this.x_)return this.x_;throw v(60996)}addReference(e,t,n){return this.D_.addReference(n,t),this.F_.delete(n.toString()),m.resolve()}removeReference(e,t,n){return this.D_.removeReference(n,t),this.F_.add(n.toString()),m.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),m.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach((s=>this.F_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.F_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}b_(){this.x_=new Set}v_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return m.forEach(this.F_,(n=>{const s=A.fromPath(n);return this.O_(e,s).next((i=>{i||t.removeEntry(s,P.min())}))})).next((()=>(this.x_=null,t.apply(e))))}updateLimboDocument(e,t){return this.O_(e,t).next((n=>{n?this.F_.delete(t.toString()):this.F_.add(t.toString())}))}y_(e){return 0}O_(e,t){return m.or([()=>m.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class Ls{constructor(e,t){this.persistence=e,this.M_=new ot((n=>_e(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=fl(this,t)}static C_(e,t){return new Ls(e,t)}b_(){}v_(e){return m.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){const t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}Er(e,t){return m.forEach(this.M_,((n,s)=>this.Us(e,n,s).next((i=>i?m.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.P_(e,(a=>this.Us(e,a,t).next((o=>{o||(n++,i.removeEntry(a,P.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),m.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),m.resolve()}removeReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),m.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),m.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ds(e.data.value)),t}Us(e,t,n){return m.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.M_.get(t);return m.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class z_{constructor(e){this.serializer=e}U(e,t,n,s){const i=new Gs("createOrUpgrade",t);n<1&&s>=1&&((function(u){u.createObjectStore(Br)})(e),(function(u){u.createObjectStore(Ir,{keyPath:ad}),u.createObjectStore(Le,{keyPath:Do,autoIncrement:!0}).createIndex(qt,No,{unique:!0}),u.createObjectStore(En)})(e),Pu(e),(function(u){u.createObjectStore(Ot)})(e));let a=m.resolve();return n<3&&s>=3&&(n!==0&&((function(u){u.deleteObjectStore(An),u.deleteObjectStore(wn),u.deleteObjectStore(Kt)})(e),Pu(e)),a=a.next((()=>(function(u){const c=u.store(Kt),l={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:P.min().toTimestamp(),targetCount:0};return c.put(vs,l)})(i)))),n<4&&s>=4&&(n!==0&&(a=a.next((()=>(function(u,c){return c.store(Le).H().next((h=>{u.deleteObjectStore(Le),u.createObjectStore(Le,{keyPath:Do,autoIncrement:!0}).createIndex(qt,No,{unique:!0});const d=c.store(Le),_=h.map((y=>d.put(y)));return m.waitFor(_)}))})(e,i)))),a=a.next((()=>{(function(u){u.createObjectStore(vn,{keyPath:_d})})(e)}))),n<5&&s>=5&&(a=a.next((()=>this.N_(i)))),n<6&&s>=6&&(a=a.next((()=>((function(u){u.createObjectStore(Tr)})(e),this.L_(i))))),n<7&&s>=7&&(a=a.next((()=>this.B_(i)))),n<8&&s>=8&&(a=a.next((()=>this.U_(e,i)))),n<9&&s>=9&&(a=a.next((()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)}))),n<10&&s>=10&&(a=a.next((()=>this.k_(i)))),n<11&&s>=11&&(a=a.next((()=>{(function(u){u.createObjectStore(Ks,{keyPath:pd})})(e),(function(u){u.createObjectStore(js,{keyPath:gd})})(e)}))),n<12&&s>=12&&(a=a.next((()=>{(function(u){const c=u.createObjectStore(Qs,{keyPath:vd});c.createIndex(Si,Vd,{unique:!1}),c.createIndex(lc,Rd,{unique:!1})})(e)}))),n<13&&s>=13&&(a=a.next((()=>(function(u){const c=u.createObjectStore(As,{keyPath:ud});c.createIndex(hs,cd),c.createIndex(ac,ld)})(e))).next((()=>this.q_(e,i))).next((()=>e.deleteObjectStore(Ot)))),n<14&&s>=14&&(a=a.next((()=>this.K_(e,i)))),n<15&&s>=15&&(a=a.next((()=>(function(u){u.createObjectStore(ua,{keyPath:yd,autoIncrement:!0}).createIndex(bi,Id,{unique:!1}),u.createObjectStore(ur,{keyPath:Td}).createIndex(uc,Ed,{unique:!1}),u.createObjectStore(cr,{keyPath:wd}).createIndex(cc,Ad,{unique:!1})})(e)))),n<16&&s>=16&&(a=a.next((()=>{t.objectStore(ur).clear()})).next((()=>{t.objectStore(cr).clear()}))),n<17&&s>=17&&(a=a.next((()=>{(function(u){u.createObjectStore(ca,{keyPath:Pd})})(e)}))),n<18&&s>=18&&Wu()&&(a=a.next((()=>{t.objectStore(ur).clear()})).next((()=>{t.objectStore(cr).clear()}))),a}L_(e){let t=0;return e.store(Ot).ee(((n,s)=>{t+=Os(s)})).next((()=>{const n={byteSize:t};return e.store(Tr).put(xi,n)}))}N_(e){const t=e.store(Ir),n=e.store(Le);return t.H().next((s=>m.forEach(s,(i=>{const a=IDBKeyRange.bound([i.userId,Gt],[i.userId,i.lastAcknowledgedBatchId]);return n.H(qt,a).next((o=>m.forEach(o,(u=>{E(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const c=Ft(this.serializer,u);return ql(e,i.userId,c).next((()=>{}))}))))}))))}B_(e){const t=e.store(An),n=e.store(Ot);return e.store(Kt).get(vs).next((s=>{const i=[];return n.ee(((a,o)=>{const u=new D(a),c=(function(h){return[0,_e(h)]})(u);i.push(t.get(c).next((l=>l?m.resolve():(h=>t.put({targetId:0,path:_e(h),sequenceNumber:s.highestListenSequenceNumber}))(u))))})).next((()=>m.waitFor(i)))}))}U_(e,t){e.createObjectStore(Er,{keyPath:md});const n=t.store(Er),s=new Qa,i=a=>{if(s.add(a)){const o=a.lastSegment(),u=a.popLast();return n.put({collectionId:o,parent:_e(u)})}};return t.store(Ot).ee({X:!0},((a,o)=>{const u=new D(a);return i(u.popLast())})).next((()=>t.store(En).ee({X:!0},(([a,o,u],c)=>{const l=qe(o);return i(l.popLast())}))))}k_(e){const t=e.store(wn);return t.ee(((n,s)=>{const i=ir(this.serializer,s),a=Ml(this.serializer,i);return t.put(a)}))}q_(e,t){const n=t.store(Ot),s=[];return n.ee(((i,a)=>{const o=t.store(As),u=(function(h){return h.document?new A(D.fromString(h.document.name).popFirst(5)):h.noDocument?A.fromSegments(h.noDocument.path):h.unknownDocument?A.fromSegments(h.unknownDocument.path):v(36783)})(a).path.toArray(),c={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(o.put(c))})).next((()=>m.waitFor(s)))}K_(e,t){const n=t.store(Le),s=Ql(this.serializer),i=new Ha(li.C_,this.serializer.zr);return n.H().next((a=>{const o=new Map;return a.forEach((u=>{let c=o.get(u.userId)??C();Ft(this.serializer,u).keys().forEach((l=>c=c.add(l))),o.set(u.userId,c)})),m.forEach(o,((u,c)=>{const l=new ae(c),h=oi.jr(this.serializer,l),d=i.getIndexManager(l),_=ui.jr(l,this.serializer,d,i.referenceDelegate);return new Wl(s,_,h,d).recalculateAndSaveOverlaysForDocumentKeys(new Ci(t,Ie.ce),u).next()}))}))}}function Pu(r){r.createObjectStore(An,{keyPath:dd}).createIndex(oa,fd,{unique:!0}),r.createObjectStore(wn,{keyPath:"targetId"}).createIndex(oc,hd,{unique:!0}),r.createObjectStore(Kt)}const dt="IndexedDbPersistence",Ti=18e5,Ei=5e3,wi="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",$_="main";class Ya{constructor(e,t,n,s,i,a,o,u,c,l,h=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.Tn=i,this.window=a,this.document=o,this.W_=c,this.Q_=l,this.G_=h,this.f_=null,this.m_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.z_=null,this.inForeground=!1,this.j_=null,this.H_=null,this.J_=Number.NEGATIVE_INFINITY,this.Y_=d=>Promise.resolve(),!Ya.C())throw new T(p.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new b_(this,s),this.Z_=t+$_,this.serializer=new Ll(u),this.X_=new pt(this.Z_,this.G_,new z_(this.serializer)),this.p_=new T_,this.g_=new x_(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Ql(this.serializer),this.w_=new I_,this.window&&this.window.localStorage?this.eo=this.window.localStorage:(this.eo=null,l===!1&&Y(dt,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.no().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new T(p.FAILED_PRECONDITION,wi);return this.ro(),this.io(),this.so(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.g_.getHighestSequenceNumber(e)))})).then((e=>{this.f_=new Ie(e,this.W_)})).then((()=>{this.m_=!0})).catch((e=>(this.X_&&this.X_.close(),Promise.reject(e))))}_o(e){return this.Y_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.X_.q((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Tn.enqueueAndForget((async()=>{this.started&&await this.no()})))}no(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>us(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.oo(e).next((t=>{t||(this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))))}))})).next((()=>this.ao(e))).next((t=>this.isPrimary&&!t?this.uo(e).next((()=>!1)):!!t&&this.co(e).next((()=>!0)))))).catch((e=>{if(St(e))return I(dt,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return I(dt,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.Tn.enqueueRetryable((()=>this.Y_(e))),this.isPrimary=e}))}oo(e){return nr(e).get(sn).next((t=>m.resolve(this.lo(t))))}Eo(e){return us(e).delete(this.clientId)}async ho(){if(this.isPrimary&&!this.To(this.J_,Ti)){this.J_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const n=re(t,vn);return n.H().next((s=>{const i=this.Po(s,Ti),a=s.filter((o=>i.indexOf(o)===-1));return m.forEach(a,(o=>n.delete(o.clientId))).next((()=>a))}))})).catch((()=>[]));if(this.eo)for(const t of e)this.eo.removeItem(this.Ro(t.clientId))}}so(){this.H_=this.Tn.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.no().then((()=>this.ho())).then((()=>this.so()))))}lo(e){return!!e&&e.ownerId===this.clientId}ao(e){return this.Q_?m.resolve(!0):nr(e).get(sn).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,Ei)&&!this.Io(t.ownerId)){if(this.lo(t)&&this.networkEnabled)return!0;if(!this.lo(t)){if(!t.allowTabSynchronization)throw new T(p.FAILED_PRECONDITION,wi);return!1}}return!(!this.networkEnabled||!this.inForeground)||us(e).H().next((n=>this.Po(n,Ei).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,o=this.networkEnabled===s.networkEnabled;if(i||a&&o)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&I(dt,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.m_=!1,this.Ao(),this.H_&&(this.H_.cancel(),this.H_=null),this.Vo(),this.fo(),await this.X_.runTransaction("shutdown","readwrite",[Br,vn],(e=>{const t=new Ci(e,Ie.ce);return this.uo(t).next((()=>this.Eo(t)))})),this.X_.close(),this.mo()}Po(e,t){return e.filter((n=>this.To(n.updateTimeMs,t)&&!this.Io(n.clientId)))}po(){return this.runTransaction("getActiveClients","readonly",(e=>us(e).H().next((t=>this.Po(t,Ti).map((n=>n.clientId))))))}get started(){return this.m_}getGlobalsCache(){return this.p_}getMutationQueue(e,t){return ui.jr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new P_(e,this.serializer.zr.databaseId)}getDocumentOverlayCache(e){return oi.jr(this.serializer,e)}getBundleCache(){return this.w_}runTransaction(e,t,n){I(dt,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(u){return u===18?Sd:u===17?mc:u===16?bd:u===15?la:u===14?fc:u===13?dc:u===12?xd:u===11?hc:void v(60245)})(this.G_);let a;return this.X_.runTransaction(e,s,i,(o=>(a=new Ci(o,this.f_?this.f_.next():Ie.ce),t==="readwrite-primary"?this.oo(a).next((u=>!!u||this.ao(a))).next((u=>{if(!u)throw Y(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))),new T(p.FAILED_PRECONDITION,tc);return n(a)})).next((u=>this.co(a).next((()=>u)))):this.yo(a).next((()=>n(a)))))).then((o=>(a.raiseOnCommittedEvent(),o)))}yo(e){return nr(e).get(sn).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,Ei)&&!this.Io(t.ownerId)&&!this.lo(t)&&!(this.Q_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new T(p.FAILED_PRECONDITION,wi)}))}co(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return nr(e).put(sn,t)}static C(){return pt.C()}uo(e){const t=nr(e);return t.get(sn).next((n=>this.lo(n)?(I(dt,"Releasing primary lease."),t.delete(sn)):m.resolve()))}To(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(Y(`Detected an update time that is in the future: ${e} > ${n}`),!1))}ro(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.j_=()=>{this.Tn.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.no())))},this.document.addEventListener("visibilitychange",this.j_),this.inForeground=this.document.visibilityState==="visible")}Vo(){this.j_&&(this.document.removeEventListener("visibilitychange",this.j_),this.j_=null)}io(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.z_=()=>{this.Ao();const t=/(?:Version|Mobile)\/1[456]/;Qu()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Tn.enterRestrictedMode(!0),this.Tn.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.z_))}fo(){this.z_&&(this.window.removeEventListener("pagehide",this.z_),this.z_=null)}Io(e){var t;try{const n=((t=this.eo)==null?void 0:t.getItem(this.Ro(e)))!==null;return I(dt,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return Y(dt,"Failed to get zombied client id.",n),!1}}Ao(){if(this.eo)try{this.eo.setItem(this.Ro(this.clientId),String(Date.now()))}catch(e){Y("Failed to set zombie client id.",e)}}mo(){if(this.eo)try{this.eo.removeItem(this.Ro(this.clientId))}catch{}}Ro(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function nr(r){return re(r,Br)}function us(r){return re(r,vn)}function Hl(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class Ja{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.wo=n,this.bo=s}static vo(e,t){let n=C(),s=C();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Ja(e,t.fromCache,n,s)}}/**
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
 */function G_(r,e){return A.comparator(r.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class K_{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class Yl{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(function(){return Qu()?8:rc(Ts())>0?6:4})()}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.Oo(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.Mo(e,t,s,n).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new K_;return this.No(e,t,a).next((o=>{if(i.result=o,this.Do)return this.Lo(e,t,a,o.size)}))})).next((()=>i.result))}Lo(e,t,n,s){return H(t)?m.resolve():n.documentReadCount<this.xo?(dn()<=Ye.DEBUG&&I("QueryEngine","SDK will not create cache indexes for query:",fr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),m.resolve()):(dn()<=Ye.DEBUG&&I("QueryEngine","Query:",fr(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Co*s?(dn()<=Ye.DEBUG&&I("QueryEngine","The SDK decides to create cache indexes for query:",fr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xe(t))):m.resolve())}Oo(e,t){if(H(t))return m.resolve(null);let n=t;if(Qo(n))return m.resolve(null);let s=xe(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=bs(n,null,"F"),s=xe(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const o=C(...a);return this.Fo.getDocuments(e,o).next((u=>this.indexManager.getMinOffset(e,s).next((c=>{const l=this.Bo(n,u);return this.Uo(n,l,o,c.readTime)?this.Oo(e,bs(n,null,"F")):this.ko(e,l,n,c)}))))})))))}Mo(e,t,n,s){return(H(t)?(function(a){for(const o of a.stages){if(o instanceof Vt||o instanceof uu)return!1;if(o instanceof Wr){if(o.condition instanceof Al&&o.condition._expr.name==="exists"&&o.condition._expr.params[0]instanceof tn&&o.condition._expr.params[0].fieldName===Be)continue;return!1}}return!0})(t):Qo(t))||s.isEqual(P.min())?m.resolve(null):this.Fo.getDocuments(e,n).next((i=>{const a=this.Bo(t,i);return this.Uo(t,a,n,s)?m.resolve(null):(dn()<=Ye.DEBUG&&I("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),cu(t)),this.ko(e,a,t,Zu(s,In)).next((o=>o)))}))}Bo(e,t){let n,s;return H(e)?(n=new F(G_),s=i=>ci(e,i)):(n=new F(Ta(e)),s=i=>Xs(e,i)),t.forEach(((i,a)=>{s(a)&&(n=n.add(a))})),n}Uo(e,t,n,s){if(H(e))return(function(o){return o.stages.some((u=>u instanceof Vt||u instanceof uu))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}No(e,t,n){return dn()<=Ye.DEBUG&&I("QueryEngine","Using full collection scan to execute query:",cu(t)),this.Fo.getDocumentsMatchingQuery(e,t,Se.min(),n)}ko(e,t,n,s){return this.Fo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
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
 */const Xa="LocalStore",j_=3e8;class Q_{constructor(e,t,n,s){this.persistence=e,this.qo=t,this.serializer=s,this.$o=new q(S),this.Ko=new ot((i=>ai(i)),za),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(n)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Wl(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.$o)))}}function Jl(r,e,t,n){return new Q_(r,e,t,n)}async function Xl(r,e){const t=V(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.Go(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const a=[],o=[];let u=C();for(const c of s){a.push(c.batchId);for(const l of c.mutations)u=u.add(l.key)}for(const c of i){o.push(c.batchId);for(const l of c.mutations)u=u.add(l.key)}return t.localDocuments.getDocuments(n,u).next((c=>({zo:c,removedBatchIds:a,addedBatchIds:o})))}))}))}function W_(r,e){const t=V(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Qo.newChangeBuffer({trackRemovals:!0});return(function(o,u,c,l){const h=c.batch,d=h.keys();let _=m.resolve();return d.forEach((y=>{_=_.next((()=>l.getEntry(u,y))).next((R=>{const x=c.docVersions.get(y);E(x!==null,48541),R.version.compareTo(x)<0&&(h.applyToRemoteDocument(R,c),R.isValidDocument()&&(R.setReadTime(c.commitVersion),l.addEntry(R)))}))})),_.next((()=>o.mutationQueue.removeMutationBatch(u,h)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(o){let u=C();for(let c=0;c<o.mutationResults.length;++c)o.mutationResults[c].transformResults.length>0&&(u=u.add(o.batch.mutations[c].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function Zl(r){const e=V(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.g_.getLastRemoteSnapshotVersion(t)))}function H_(r,e){const t=V(r),n=e.snapshotVersion;let s=t.$o;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.Qo.newChangeBuffer({trackRemovals:!0});s=t.$o;const o=[];e.targetChanges.forEach(((l,h)=>{const d=s.get(h);if(!d)return;o.push(t.g_.removeMatchingKeys(i,l.removedDocuments,h).next((()=>t.g_.addMatchingKeys(i,l.addedDocuments,h))));let _=d.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(h)!==null?_=_.withResumeToken(Q.EMPTY_BYTE_STRING,P.min()).withLastLimboFreeSnapshotVersion(P.min()):l.resumeToken.approximateByteSize()>0&&(_=_.withResumeToken(l.resumeToken,n)),s=s.insert(h,_),(function(R,x,k){return R.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-R.snapshotVersion.toMicroseconds()>=j_?!0:k.addedDocuments.size+k.modifiedDocuments.size+k.removedDocuments.size>0})(d,_,l)&&o.push(t.g_.updateTargetData(i,_))}));let u=te(),c=C();if(e.documentUpdates.forEach((l=>{e.resolvedLimboDocuments.has(l)&&o.push(t.persistence.referenceDelegate.updateLimboDocument(i,l))})),o.push(Y_(i,a,e.documentUpdates).next((l=>{u=l.jo,c=l.Ho}))),!n.isEqual(P.min())){const l=t.g_.getLastRemoteSnapshotVersion(i).next((h=>t.g_.setTargetsMetadata(i,i.currentSequenceNumber,n)));o.push(l)}return m.waitFor(o).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,u,c))).next((()=>u))})).then((i=>(t.$o=s,i)))}function Y_(r,e,t){let n=C(),s=C();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let a=te();return t.forEach(((o,u)=>{const c=i.get(o);u.isFoundDocument()!==c.isFoundDocument()&&(s=s.add(o)),u.isNoDocument()&&u.version.isEqual(P.min())?(e.removeEntry(o,u.readTime),a=a.insert(o,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),a=a.insert(o,u)):I(Xa,"Ignoring outdated watch update for ",o,". Current version:",c.version," Watch version:",u.version)})),{jo:a,Ho:s}}))}function J_(r,e){const t=V(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=Gt),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function Ms(r,e){const t=V(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.g_.getTargetData(n,e).next((i=>i?(s=i,m.resolve(s)):t.g_.allocateTargetId(n).next((a=>(s=new Ge(e,a,"TargetPurposeListen",n.currentSequenceNumber),t.g_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.$o.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.$o=t.$o.insert(n.targetId,n),t.Ko.set(e,n.targetId)),n}))}async function On(r,e,t){const n=V(r),s=n.$o.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(a=>n.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!St(a))throw a;I(Xa,`Failed to update sequence numbers for target ${e}: ${a}`)}n.$o=n.$o.remove(e),n.Ko.delete(s.target)}function Wi(r,e,t){const n=V(r);let s=P.min(),i=C();return n.persistence.runTransaction("Execute query","readwrite",(a=>(function(u,c,l){const h=V(u),d=h.Ko.get(l);return d!==void 0?m.resolve(h.$o.get(d)):h.g_.getTargetData(c,l)})(n,a,H(e)?e:xe(e)).next((o=>{if(o)return s=o.lastLimboFreeSnapshotVersion,n.g_.getMatchingKeysForTargetId(a,o.targetId).next((u=>{i=u}))})).next((()=>n.qo.getDocumentsMatchingQuery(a,e,t?s:P.min(),t?i:C()))).next((o=>(th(n,o),{documents:o,Jo:i})))))}function eh(r,e){const t=V(r),n=V(t.g_),s=t.$o.get(e);return s?Promise.resolve(s.target??null):t.persistence.runTransaction("Get target data","readonly",(i=>n.dt(i,e).next((a=>(a==null?void 0:a.target)??null))))}function Hi(r,e){const t=V(r),n=t.Wo.get(e)||P.min();return t.persistence.runTransaction("Get new document changes","readonly",(s=>t.Qo.getAllFromCollectionGroup(s,e,Zu(n,In),Number.MAX_SAFE_INTEGER))).then((s=>(th(t,s),s)))}function th(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Wo.get(s)||P.min();n.readTime.compareTo(i)>0&&r.Wo.set(s,n.readTime)}))}/**
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
 */const nh="firestore_clients";function xu(r,e){return`${nh}_${r}_${e}`}const rh="firestore_mutations";function bu(r,e,t){let n=`${rh}_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}const sh="firestore_targets";function Ai(r,e){return`${sh}_${r}_${e}`}/**
 * @license
 * Copyright 2018 Google LLC
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
 */const Ue="SharedClientState";class Fs{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static ea(e,t,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new T(s.error.code,s.error.message))),a?new Fs(e,t,s.state,i):(Y(Ue,`Failed to parse mutation state for ID '${t}': ${n}`),null)}ta(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class gr{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static ea(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new T(n.error.code,n.error.message))),i?new gr(e,n.state,s):(Y(Ue,`Failed to parse target state for ID '${e}': ${t}`),null)}ta(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Us{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static ea(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=Ea();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=sc(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new Us(e,i):(Y(Ue,`Failed to parse client data for instance '${e}': ${t}`),null)}}class Za{constructor(e,t){this.clientId=e,this.onlineState=t}static ea(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Za(t.clientId,t.onlineState):(Y(Ue,`Failed to parse online state: ${e}`),null)}}class Yi{constructor(){this.activeTargetIds=Ea()}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class vi{constructor(e,t,n,s,i){this.window=e,this.Tn=t,this.persistenceKey=n,this.ia=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.sa=this._a.bind(this),this.oa=new q(S),this.started=!1,this.aa=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.ua=xu(this.persistenceKey,this.ia),this.ca=(function(u){return`firestore_sequence_number_${u}`})(this.persistenceKey),this.oa=this.oa.insert(this.ia,new Yi),this.la=new RegExp(`^${nh}_${a}_([^_]*)$`),this.Ea=new RegExp(`^${rh}_${a}_(\\d+)(?:_(.*))?$`),this.ha=new RegExp(`^${sh}_${a}_(\\d+)$`),this.Ta=(function(u){return`firestore_online_state_${u}`})(this.persistenceKey),this.Pa=(function(u){return`firestore_bundle_loaded_v2_${u}`})(this.persistenceKey),this.window.addEventListener("storage",this.sa)}static C(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.po();for(const n of e){if(n===this.ia)continue;const s=this.getItem(xu(this.persistenceKey,n));if(s){const i=Us.ea(n,s);i&&(this.oa=this.oa.insert(i.clientId,i))}}this.Ra();const t=this.storage.getItem(this.Ta);if(t){const n=this.Ia(t);n&&this.Aa(n)}for(const n of this.aa)this._a(n);this.aa=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.ca,JSON.stringify(e))}getAllActiveQueryTargets(){return this.Va(this.oa)}isActiveQueryTarget(e){let t=!1;return this.oa.forEach(((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.da(e,"pending")}updateMutationState(e,t,n){this.da(e,t,n),this.fa(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(Ai(this.persistenceKey,e));if(s){const i=gr.ea(e,s);i&&(n=i.state)}}return t&&this.ma.na(e),this.Ra(),n}removeLocalQueryTarget(e){this.ma.ra(e),this.Ra()}isLocalQueryTarget(e){return this.ma.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Ai(this.persistenceKey,e))}updateQueryState(e,t,n){this.pa(e,t,n)}handleUserChange(e,t,n){t.forEach((s=>{this.fa(s)})),this.currentUser=e,n.forEach((s=>{this.addPendingMutation(s)}))}setOnlineState(e){this.ga(e)}notifyBundleLoaded(e){this.ya(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.sa),this.removeItem(this.ua),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return I(Ue,"READ",e,t),t}setItem(e,t){I(Ue,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){I(Ue,"REMOVE",e),this.storage.removeItem(e)}_a(e){const t=e;if(t.storageArea===this.storage){if(I(Ue,"EVENT",t.key,t.newValue),t.key===this.ua)return void Y("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Tn.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.la.test(t.key)){if(t.newValue==null){const n=this.wa(t.key);return this.ba(n,null)}{const n=this.va(t.key,t.newValue);if(n)return this.ba(n.clientId,n)}}else if(this.Ea.test(t.key)){if(t.newValue!==null){const n=this.Sa(t.key,t.newValue);if(n)return this.Da(n)}}else if(this.ha.test(t.key)){if(t.newValue!==null){const n=this.xa(t.key,t.newValue);if(n)return this.Ca(n)}}else if(t.key===this.Ta){if(t.newValue!==null){const n=this.Ia(t.newValue);if(n)return this.Aa(n)}}else if(t.key===this.ca){const n=(function(i){let a=Ie.ce;if(i!=null)try{const o=JSON.parse(i);E(typeof o=="number",30636,{Fa:i}),a=o}catch(o){Y(Ue,"Failed to read sequence number from WebStorage",o)}return a})(t.newValue);n!==Ie.ce&&this.sequenceNumberHandler(n)}else if(t.key===this.Pa){const n=this.Oa(t.newValue);await Promise.all(n.map((s=>this.syncEngine.Ma(s))))}}}else this.aa.push(t)}))}}get ma(){return this.oa.get(this.ia)}Ra(){this.setItem(this.ua,this.ma.ta())}da(e,t,n){const s=new Fs(this.currentUser,e,t,n),i=bu(this.persistenceKey,this.currentUser,e);this.setItem(i,s.ta())}fa(e){const t=bu(this.persistenceKey,this.currentUser,e);this.removeItem(t)}ga(e){const t={clientId:this.ia,onlineState:e};this.storage.setItem(this.Ta,JSON.stringify(t))}pa(e,t,n){const s=Ai(this.persistenceKey,e),i=new gr(e,t,n);this.setItem(s,i.ta())}ya(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Pa,t)}wa(e){const t=this.la.exec(e);return t?t[1]:null}va(e,t){const n=this.wa(e);return Us.ea(n,t)}Sa(e,t){const n=this.Ea.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return Fs.ea(new ae(i),s,t)}xa(e,t){const n=this.ha.exec(e),s=Number(n[1]);return gr.ea(s,t)}Ia(e){return Za.ea(e)}Oa(e){return JSON.parse(e)}async Da(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Na(e.batchId,e.state,e.error);I(Ue,`Ignoring mutation for non-active user ${e.user.uid}`)}Ca(e){return this.syncEngine.La(e.targetId,e.state,e.error)}ba(e,t){const n=t?this.oa.insert(e,t):this.oa.remove(e),s=this.Va(this.oa),i=this.Va(n),a=[],o=[];return i.forEach((u=>{s.has(u)||a.push(u)})),s.forEach((u=>{i.has(u)||o.push(u)})),this.syncEngine.Ba(a,o).then((()=>{this.oa=n}))}Aa(e){this.oa.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}Va(e){let t=Ea();return e.forEach(((n,s)=>{t=t.unionWith(s.activeTargetIds)})),t}}class ih{constructor(){this.Ua=new Yi,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,n){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new Yi,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function ah(){return typeof window<"u"?window:null}function ys(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class X_{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){this.qa===0&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve()))))}za(e){this.state==="Online"?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,e==="Online"&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ka?(Y(t),this.Ka=!1):I("OnlineStateTracker",t)}ja(){this.$a!==null&&(this.$a.cancel(),this.$a=null)}}/**
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
 */const We="RemoteStore";class Z_{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new it(1e3),this.eu=new it(1001),this.tu=new Set,this.nu=[],this.ru=i,this.ru.bt((a=>{n.enqueueAndForget((async()=>{rn(this)&&(I(We,"Restarting streams for network reachability change."),await(async function(u){const c=V(u);c.tu.add(4),await Jr(c),c.iu.set("Unknown"),c.tu.delete(4),await hi(c)})(this))}))})),this.iu=new X_(n,s)}}async function hi(r){if(rn(r))for(const e of r.nu)await e(!0)}async function Jr(r){for(const e of r.nu)await e(!1)}function Ji(r,e){return r.Ya.get(e)||void 0}function di(r,e){const t=V(r),n=Ji(t,e.targetId);if(n!==void 0&&t.Ja.has(n))return;const s=(function(o,u){const c=Ji(o,u);c!==void 0&&o.Za.delete(c);const l=(function(d,_){return _%2!=0?d.eu.next():d.Xa.next()})(o,u);return o.Ya.set(u,l),o.Za.set(l,u),l})(t,e.targetId);I(We,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new Ge(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ja.set(s,i),no(t)?to(t):Wn(t).Fn()&&eo(t,i)}function Ln(r,e){const t=V(r),n=Wn(t),s=Ji(t,e);I(We,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.Ja.delete(s),t.Ya.delete(e),t.Za.delete(s),n.Fn()&&oh(t,s),t.Ja.size===0&&(n.Fn()?n.Nn():rn(t)&&t.iu.set("Unknown"))}function eo(r,e){if(r.su.We(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(P.min())>0){const t=r.Za.get(e.targetId);if(t===void 0)return void I(We,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}Wn(r).jn(e)}function oh(r,e){r.su.We(e),Wn(r).Hn(e)}function to(r){r.su=new lf({getRemoteKeysForTarget:e=>{const t=r.Za.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):C()},dt:e=>r.Ja.get(e)||null,Tt:()=>r.datastore.serializer.databaseId}),Wn(r).start(),r.iu.Wa()}function no(r){return rn(r)&&!Wn(r).Cn()&&r.Ja.size>0}function rn(r){return V(r).tu.size===0}function uh(r){r.su=void 0}async function ep(r){r.iu.set("Online")}async function tp(r){r.Ja.forEach(((e,t)=>{eo(r,e)}))}async function np(r,e){uh(r),no(r)?(r.iu.za(e),to(r)):r.iu.set("Unknown")}async function rp(r,e,t){if(r.iu.set("Online"),e instanceof Qc&&e.state===2&&e.cause)try{await(async function(s,i){const a=i.cause;for(const o of i.targetIds){if(s.Ja.has(o)){const u=s.Za.get(o);u!==void 0&&(await s.remoteSyncer.rejectListen(u,a),s.Ya.delete(u),s.Za.delete(o)),s.Ja.delete(o)}s.su.removeTarget(o)}})(r,e)}catch(n){I(We,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Bs(r,n)}else if(e instanceof ms?r.su.et(e):e instanceof jc?r.su.ot(e):r.su.rt(e),!t.isEqual(P.min()))try{const n=await Zl(r.localStore);t.compareTo(n)>=0&&await(function(i,a){const o=i.su.Rt(a);o.targetChanges.forEach(((c,l)=>{if(c.resumeToken.approximateByteSize()>0){const h=i.Ja.get(l);h&&i.Ja.set(l,h.withResumeToken(c.resumeToken,a))}})),o.targetMismatches.forEach(((c,l)=>{const h=i.Ja.get(c);if(!h)return;i.Ja.set(c,h.withResumeToken(Q.EMPTY_BYTE_STRING,h.snapshotVersion)),oh(i,c);const d=new Ge(h.target,c,l,h.sequenceNumber);eo(i,d)}));const u=(function(l,h){const d=new Map;h.targetChanges.forEach(((y,R)=>{const x=l.Za.get(R);x!==void 0&&d.set(x,y)}));let _=new q(S);return h.targetMismatches.forEach(((y,R)=>{const x=l.Za.get(y);x!==void 0&&(_=_.insert(x,R))})),new $n(h.snapshotVersion,d,_,h.documentUpdates,h.augmentedDocumentUpdates,h.resolvedLimboDocuments)})(i,o);return i.remoteSyncer.applyRemoteEvent(u)})(r,t)}catch(n){I(We,"Failed to raise snapshot:",n),await Bs(r,n)}}async function Bs(r,e,t){if(!St(e))throw e;r.tu.add(1),await Jr(r),r.iu.set("Offline"),t||(t=()=>Zl(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{I(We,"Retrying IndexedDB access"),await t(),r.tu.delete(1),await hi(r)}))}function ch(r,e){return e().catch((t=>Bs(r,t,e)))}async function Qn(r){const e=V(r),t=Pt(e);let n=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:Gt;for(;sp(e);)try{const s=await J_(e.localStore,n);if(s===null){e.Ha.length===0&&t.Nn();break}n=s.batchId,ip(e,s)}catch(s){await Bs(e,s)}lh(e)&&hh(e)}function sp(r){return rn(r)&&r.Ha.length<10}function ip(r,e){r.Ha.push(e);const t=Pt(r);t.Fn()&&t.Jn&&t.Yn(e.mutations)}function lh(r){return rn(r)&&!Pt(r).Cn()&&r.Ha.length>0}function hh(r){Pt(r).start()}async function ap(r){Pt(r).er()}async function op(r){const e=Pt(r);for(const t of r.Ha)e.Yn(t.mutations)}async function up(r,e,t){const n=r.Ha.shift(),s=Ga.from(n,e,t);await ch(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Qn(r)}async function cp(r,e){e&&Pt(r).Jn&&await(async function(n,s){if((function(a){return qc(a)&&a!==p.ABORTED})(s.code)){const i=n.Ha.shift();Pt(n).Mn(),await ch(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Qn(n)}})(r,e),lh(r)&&hh(r)}async function Su(r,e){const t=V(r);t.asyncQueue.verifyOperationInProgress(),I(We,"RemoteStore received new credentials");const n=rn(t);t.tu.add(3),await Jr(t),n&&t.iu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.tu.delete(3),await hi(t)}async function Xi(r,e){const t=V(r);e?(t.tu.delete(2),await hi(t)):e||(t.tu.add(2),await Jr(t),t.iu.set("Unknown"))}function Wn(r){return r._u||(r._u=(function(t,n,s){const i=V(t);return i.nr(),new Sf(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:ep.bind(null,r),zt:tp.bind(null,r),Ht:np.bind(null,r),zn:rp.bind(null,r)}),r.nu.push((async e=>{e?(r._u.Mn(),no(r)?to(r):r.iu.set("Unknown")):(await r._u.stop(),uh(r))}))),r._u}function Pt(r){return r.ou||(r.ou=(function(t,n,s){const i=V(t);return i.nr(),new Cf(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:()=>Promise.resolve(),zt:ap.bind(null,r),Ht:cp.bind(null,r),Zn:op.bind(null,r),Xn:up.bind(null,r)}),r.nu.push((async e=>{e?(r.ou.Mn(),await Qn(r)):(await r.ou.stop(),r.Ha.length>0&&(I(We,`Stopping write stream with ${r.Ha.length} pending writes`),r.Ha=[]))}))),r.ou}/**
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
 */class ro{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Me,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const a=Date.now()+n,o=new ro(e,t,a,s,i);return o.start(n),o}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new T(p.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function so(r,e){if(Y("AsyncQueue",`${e}: ${r}`),St(r))return new T(p.UNAVAILABLE,`${e}: ${r}`);throw r}/**
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
 */class Qt{static emptySet(e){return new Qt(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||A.comparator(t.key,n.key):(t,n)=>A.comparator(t.key,n.key),this.keyedMap=Mt(),this.sortedSet=new q(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Qt)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new Qt;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class Cu{constructor(){this.au=new q(A.comparator)}track(e){const t=e.doc.key,n=this.au.get(t);n?e.type!==0&&n.type===3?this.au=this.au.insert(t,e):e.type===3&&n.type!==1?this.au=this.au.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.au=this.au.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.au=this.au.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.au=this.au.remove(t):e.type===1&&n.type===2?this.au=this.au.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.au=this.au.insert(t,{type:2,doc:e.doc}):v(63341,{ft:e,uu:n}):this.au=this.au.insert(t,e)}cu(){const e=[];return this.au.inorderTraversal(((t,n)=>{e.push(n)})),e}}class Mn{constructor(e,t,n,s,i,a,o,u,c){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=o,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,t,n,s,i){const a=[];return t.forEach((o=>{a.push({type:0,doc:o})})),new Mn(e,t,Qt.emptySet(t),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ii(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class lp{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some((e=>e.Tu()))}}class hp{constructor(){this.queries=Du(),this.onlineState="Unknown",this.Pu=new Set}terminate(){(function(t,n){const s=V(t),i=s.queries;s.queries=Du(),i.forEach(((a,o)=>{for(const u of o.Eu)u.onError(n)}))})(this,new T(p.ABORTED,"Firestore shutting down"))}}function Du(){return new ot((r=>Ol(r)),ii)}async function io(r,e){const t=V(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.hu()&&e.Tu()&&(n=2):(i=new lp,n=e.Tu()?0:1);try{switch(n){case 0:i.lu=await t.onListen(s,!0);break;case 1:i.lu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const o=so(a,`Initialization of query '${H(e.query)?et(e.query):fr(e.query)}' failed`);return void e.onError(o)}t.queries.set(s,i),i.Eu.push(e),e.Ru(t.onlineState),i.lu&&e.Iu(i.lu)&&oo(t)}async function ao(r,e){const t=V(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const a=i.Eu.indexOf(e);a>=0&&(i.Eu.splice(a,1),i.Eu.length===0?s=e.Tu()?0:1:!i.hu()&&e.Tu()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function dp(r,e){const t=V(r);let n=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const o of a.Eu)o.Iu(s)&&(n=!0);a.lu=s}}n&&oo(t)}function fp(r,e,t){const n=V(r),s=n.queries.get(e);if(s)for(const i of s.Eu)i.onError(t);n.queries.delete(e)}function oo(r){r.Pu.forEach((e=>{e.next()}))}var Zi;(function(r){r.Default="default",r.Cache="cache"})(Zi||(Zi={}));class uo{constructor(e,t,n){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=n||{}}Iu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new Mn(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){if(!e.fromCache||!this.Tu())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}fu(e){if(e.docChanges.length>0)return!0;const t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}pu(e){e=Mn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==Zi.Cache}}/**
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
 */class dh{constructor(e){this.key=e}}class fh{constructor(e){this.key=e}}class mp{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=C(),this.mutatedKeys=C(),this.Lu=H(e)?Qi(e):Ta(e),this.Bu=new Qt(this.Lu)}get Uu(){return this.Ou}ku(e,t){const n=t?t.qu:new Cu,s=t?t.Bu:this.Bu;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,o=!1;const[u,c]=this.$u(this.query,s);e.inorderTraversal(((h,d)=>{const _=s.get(h),y=Kl(this.query,d)?d:null,R=!!_&&this.mutatedKeys.has(_.key),x=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let k=!1;_&&y?_.data.isEqual(y.data)?R!==x&&(n.track({type:3,doc:y}),k=!0):this.Ku(_,y)||(n.track({type:2,doc:y}),k=!0,(u&&this.Lu(y,u)>0||c&&this.Lu(y,c)<0)&&(o=!0)):!_&&y?(n.track({type:0,doc:y}),k=!0):_&&!y&&(n.track({type:1,doc:_}),k=!0,(u||c)&&(o=!0)),k&&(y?(a=a.add(y),i=x?i.add(h):i.delete(h)):(a=a.delete(h),i=i.delete(h)))}));const l=this.Wu(this.query);if(l)if(H(this.query)){const h=[];a.forEach((y=>h.push(y)));const d=Gl(this.query,h);let _=new Qt(Qi(this.query));for(const y of d)_=_.add(y);a.forEach((y=>{_.has(y.key)||(i=i.delete(y.key),n.track({type:1,doc:y}))})),a=_}else{const h=this.Qu(this.query);for(;a.size>l;){const d=h==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),n.track({type:1,doc:d})}}return{Bu:a,qu:n,Uo:o,mutatedKeys:i}}Wu(e){var t;return H(e)?(t=Ii(e))==null?void 0:t.limit:e.limit||void 0}Qu(e){if(H(e)){const t=Ii(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){var n;if(H(e)){const s=(n=Ii(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.Wu(this.query)?t.last():null,e.limitType==="L"&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;const a=e.qu.cu();a.sort(((l,h)=>(function(_,y){const R=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return v(20277,{ft:x})}};return R(_)-R(y)})(l.type,h.type)||this.Lu(l.doc,h.doc))),this.Gu(n),s=s??!1;const o=t&&!s?this.zu():[],u=this.Nu.size===0&&this.current&&!s?1:0,c=u!==this.Mu;return this.Mu=u,a.length!==0||c?{snapshot:new Mn(this.query,e.Bu,i,a,e.mutatedKeys,u===0,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),ju:o}:{ju:o}}Ru(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new Cu,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach((t=>this.Ou=this.Ou.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ou=this.Ou.delete(t))),this.current=e.current)}zu(){if(!this.current)return[];const e=this.Nu;this.Nu=C(),this.Bu.forEach((n=>{this.Hu(n.key)&&(this.Nu=this.Nu.add(n.key))}));const t=[];return e.forEach((n=>{this.Nu.has(n)||t.push(new fh(n))})),this.Nu.forEach((n=>{e.has(n)||t.push(new dh(n))})),t}Ju(e){this.Ou=e.Jo,this.Nu=C();const t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return Mn.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,this.Mu===0,this.hasCachedResults)}}const Hn="SyncEngine";class _p{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class pp{constructor(e){this.key=e,this.Zu=!1}}class gp{constructor(e,t,n,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Xu={},this.ec=new ot((o=>Ol(o)),ii),this.tc=new Map,this.nc=new Set,this.rc=new q(A.comparator),this.sc=new Map,this._c=new Wa,this.oc={},this.ac=new Map,this.uc=it.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return this.cc===!0}}async function yp(r,e,t=!0){const n=fi(r);let s;const i=n.ec.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Yu()):s=await mh(n,e,t,!0),s}async function Ip(r,e){const t=fi(r);await mh(t,e,!0,!1)}async function mh(r,e,t,n){const s=await Ms(r.localStore,H(e)?e:xe(e)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,t);let o;return n&&(o=await co(r,e,i,a==="current",s.resumeToken)),r.isPrimaryClient&&t&&di(r.remoteStore,s),o}async function co(r,e,t,n,s){r.lc=(h,d,_)=>(async function(R,x,k,N){let O=x.view.ku(k);O.Uo&&(O=await Wi(R.localStore,x.query,!1).then((({documents:ye})=>x.view.ku(ye,O))));const se=N&&N.targetChanges.get(x.targetId),K=N&&N.targetMismatches.get(x.targetId)!=null,ee=x.view.applyChanges(O,R.isPrimaryClient,se,K);return ea(R,x.targetId,ee.ju),ee.snapshot})(r,h,d,_);const i=await Wi(r.localStore,e,!0),a=new mp(e,i.Jo),o=a.ku(i.documents),u=$r.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),c=a.applyChanges(o,r.isPrimaryClient,u);ea(r,t,c.ju);const l=new _p(e,t,a);return r.ec.set(e,l),r.tc.has(t)?r.tc.get(t).push(e):r.tc.set(t,[e]),c.snapshot}async function Tp(r,e,t){const n=V(r),s=n.ec.get(e),i=n.tc.get(s.targetId);if(i.length>1)return n.tc.set(s.targetId,i.filter((a=>!ii(a,e)))),void n.ec.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await On(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&Ln(n.remoteStore,s.targetId),Fn(n,s.targetId)})).catch(bt)):(Fn(n,s.targetId),await On(n.localStore,s.targetId,!0))}async function Ep(r,e){const t=V(r),n=t.ec.get(e),s=t.tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),Ln(t.remoteStore,n.targetId))}async function wp(r,e,t){const n=mo(r);try{const s=await(function(a,o){const u=V(a),c=U.now(),l=o.reduce(((_,y)=>_.add(y.key)),C());let h,d;return u.persistence.runTransaction("Locally write mutations","readwrite",(_=>{let y=te(),R=C();return u.Qo.getEntries(_,l).next((x=>{y=x,y.forEach(((k,N)=>{N.isValidDocument()||(R=R.add(k))}))})).next((()=>u.localDocuments.getOverlayedDocuments(_,y))).next((x=>{h=x;const k=[];for(const N of o){const O=zd(N,h.get(N.key).overlayedDocument);O!=null&&k.push(new at(N.key,O,vc(O.value.mapValue),W.exists(!0)))}return u.mutationQueue.addMutationBatch(_,c,k,o)})).next((x=>{d=x;const k=x.applyToLocalDocumentSet(h,R);return u.documentOverlayCache.saveOverlays(_,x.batchId,k)}))})).then((()=>({batchId:d.batchId,changes:Gc(h)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(a,o,u){let c=a.oc[a.currentUser.toKey()];c||(c=new q(S)),c=c.insert(o,u),a.oc[a.currentUser.toKey()]=c})(n,s.batchId,t),await Dt(n,s.changes),await Qn(n.remoteStore)}catch(s){const i=so(s,"Failed to persist write");t.reject(i)}}async function _h(r,e){const t=V(r);try{const n=await H_(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.sc.get(i);a&&(E(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Zu=!0:s.modifiedDocuments.size>0?E(a.Zu,14607):s.removedDocuments.size>0&&(E(a.Zu,42227),a.Zu=!1))})),await Dt(t,n,e)}catch(n){await bt(n)}}function Nu(r,e,t){const n=V(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.ec.forEach(((i,a)=>{const o=a.view.Ru(e);o.snapshot&&s.push(o.snapshot)})),(function(a,o){const u=V(a);u.onlineState=o;let c=!1;u.queries.forEach(((l,h)=>{for(const d of h.Eu)d.Ru(o)&&(c=!0)})),c&&oo(u)})(n.eventManager,e),s.length&&n.Xu.zn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function Ap(r,e,t){const n=V(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.sc.get(e),i=s&&s.key;if(i){let a=new q(A.comparator);a=a.insert(i,j.newNoDocument(i,P.min()));const o=C().add(i),u=new $n(P.min(),new Map,new q(S),a,te(),o);await _h(n,u),n.rc=n.rc.remove(i),n.sc.delete(e),fo(n)}else await On(n.localStore,e,!1).then((()=>Fn(n,e,t))).catch(bt)}async function vp(r,e){const t=V(r),n=e.batch.batchId;try{const s=await W_(t.localStore,e);ho(t,n,null),lo(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Dt(t,s)}catch(s){await bt(s)}}async function Vp(r,e,t){const n=V(r);try{const s=await(function(a,o){const u=V(a);return u.persistence.runTransaction("Reject batch","readwrite-primary",(c=>{let l;return u.mutationQueue.lookupMutationBatch(c,o).next((h=>(E(h!==null,37113),l=h.keys(),u.mutationQueue.removeMutationBatch(c,h)))).next((()=>u.mutationQueue.performConsistencyCheck(c))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(c,l,o))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,l))).next((()=>u.localDocuments.getDocuments(c,l)))}))})(n.localStore,e);ho(n,e,t),lo(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Dt(n,s)}catch(s){await bt(s)}}function lo(r,e){(r.ac.get(e)||[]).forEach((t=>{t.resolve()})),r.ac.delete(e)}function ho(r,e,t){const n=V(r);let s=n.oc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.oc[n.currentUser.toKey()]=s}}function Fn(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.tc.get(e))r.ec.delete(n),t&&r.Xu.Ec(n,t);r.tc.delete(e),r.isPrimaryClient&&r._c.s_(e).forEach((n=>{r._c.containsKey(n)||ph(r,n)}))}function ph(r,e){r.nc.delete(e.path.canonicalString());const t=r.rc.get(e);t!==null&&(Ln(r.remoteStore,t),r.rc=r.rc.remove(e),r.sc.delete(t),fo(r))}function ea(r,e,t){for(const n of t)n instanceof dh?(r._c.addReference(n.key,e),Rp(r,n)):n instanceof fh?(I(Hn,"Document no longer in limbo: "+n.key),r._c.removeReference(n.key,e),r._c.containsKey(n.key)||ph(r,n.key)):v(19791,{hc:n})}function Rp(r,e){const t=e.key,n=t.path.canonicalString();r.rc.get(t)||r.nc.has(n)||(I(Hn,"New document in limbo: "+t),r.nc.add(n),fo(r))}function fo(r){for(;r.nc.size>0&&r.rc.size<r.maxConcurrentLimboResolutions;){const e=r.nc.values().next().value;r.nc.delete(e);const t=new A(D.fromString(e)),n=r.uc.next();r.sc.set(n,new pp(t)),r.rc=r.rc.insert(t,n),di(r.remoteStore,new Ge(xe(zr(t.path)),n,"TargetPurposeLimboResolution",Ie.ce))}}async function Dt(r,e,t){const n=V(r),s=[],i=[],a=[];n.ec.isEmpty()||(n.ec.forEach(((o,u)=>{a.push(n.lc(u,e,t).then((c=>{var l;if((c||t)&&n.isPrimaryClient){const h=c?!c.fromCache:(l=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:l.current;n.sharedClientState.updateQueryState(u.targetId,h?"current":"not-current")}if(c){s.push(c);const h=Ja.vo(u.targetId,c);i.push(h)}})))})),await Promise.all(a),n.Xu.zn(s),await(async function(u,c){const l=V(u);try{await l.persistence.runTransaction("notifyLocalViewChanges","readwrite",(h=>m.forEach(c,(d=>m.forEach(d.wo,(_=>l.persistence.referenceDelegate.addReference(h,d.targetId,_))).next((()=>m.forEach(d.bo,(_=>l.persistence.referenceDelegate.removeReference(h,d.targetId,_)))))))))}catch(h){if(!St(h))throw h;I(Xa,"Failed to update sequence numbers: "+h)}for(const h of c){const d=h.targetId;if(!h.fromCache){const _=l.$o.get(d),y=_.snapshotVersion,R=_.withLastLimboFreeSnapshotVersion(y);l.$o=l.$o.insert(d,R)}}})(n.localStore,i))}async function Pp(r,e){const t=V(r);if(!t.currentUser.isEqual(e)){I(Hn,"User change. New user:",e.toKey());const n=await Xl(t.localStore,e);t.currentUser=e,(function(i,a){i.ac.forEach((o=>{o.forEach((u=>{u.reject(new T(p.CANCELLED,a))}))})),i.ac.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Dt(t,n.zo)}}function xp(r,e){const t=V(r),n=t.sc.get(e);if(n&&n.Zu)return C().add(n.key);{let s=C();const i=t.tc.get(e);if(!i)return s;for(const a of i??[]){const o=t.ec.get(a);s=s.unionWith(o.view.Uu)}return s}}async function bp(r,e){const t=V(r),n=await Wi(t.localStore,e.query,!0),s=e.view.Ju(n);return t.isPrimaryClient&&ea(t,e.targetId,s.ju),s}async function Sp(r,e){const t=V(r);return Hi(t.localStore,e).then((n=>Dt(t,n)))}async function Cp(r,e,t,n){const s=V(r),i=await(function(o,u){const c=V(o),l=V(c.mutationQueue);return c.persistence.runTransaction("Lookup mutation documents","readonly",(h=>l.ps(h,u).next((d=>d?c.localDocuments.getDocuments(h,d):m.resolve(null)))))})(s.localStore,e);i!==null?(t==="pending"?await Qn(s.remoteStore):t==="acknowledged"||t==="rejected"?(ho(s,e,n||null),lo(s,e),(function(o,u){V(V(o).mutationQueue).bs(u)})(s.localStore,e)):v(6720,"Unknown batchState",{Tc:t}),await Dt(s,i)):I(Hn,"Cannot apply mutation batch with id: "+e)}async function Dp(r,e){const t=V(r);if(fi(t),mo(t),e===!0&&t.cc!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await ku(t,n.toArray());t.cc=!0,await Xi(t.remoteStore,!0);for(const i of s)di(t.remoteStore,i)}else if(e===!1&&t.cc!==!1){const n=[];let s=Promise.resolve();t.tc.forEach(((i,a)=>{t.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then((()=>(Fn(t,a),On(t.localStore,a,!0)))),Ln(t.remoteStore,a)})),await s,await ku(t,n),(function(a){const o=V(a);o.sc.forEach(((u,c)=>{Ln(o.remoteStore,c)})),o._c.__(),o.sc=new Map,o.rc=new q(A.comparator)})(t),t.cc=!1,await Xi(t.remoteStore,!1)}}async function ku(r,e,t){const n=V(r),s=[],i=[];for(const a of e){let o;const u=n.tc.get(a);if(u&&u.length!==0){o=await Ms(n.localStore,H(u[0])?u[0]:xe(u[0]));for(const c of u){const l=n.ec.get(c),h=await bp(n,l);h.snapshot&&i.push(h.snapshot)}}else{const c=await eh(n.localStore,a);o=await Ms(n.localStore,c),await co(n,gh(c),a,!1,o.resumeToken)}s.push(o)}return n.Xu.zn(i),s}function gh(r){return Je(r)?r:Uc(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function Np(r){return(function(t){return V(V(t).persistence).po()})(V(r).localStore)}async function kp(r,e,t,n){const s=V(r);if(s.cc)return void I(Hn,"Ignoring unexpected query state notification.");const i=s.tc.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{let a;if(H(i[0]))switch(Ze(i[0])){case"collection_group":case"collection":a=await Hi(s.localStore,xl(i[0]));break;case"documents":a=await(function(c,l){const h=V(c),d=C(...Cs(l).map((_=>A.fromPath(_))));return h.persistence.runTransaction("Get documents for pipeline","readonly",(_=>h.Qo.getEntries(_,d))).then((_=>_))})(s.localStore,i[0]);break;default:Ne(""),a=Mt()}else a=await Hi(s.localStore,(function(c){return c.collectionGroup||(c.path.length%2==1?c.path.lastSegment():c.path.get(c.path.length-2))})(i[0]));const o=$n.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Q.EMPTY_BYTE_STRING);await Dt(s,a,o);break}case"rejected":await On(s.localStore,e,!0),Fn(s,e,n);break;default:v(64155,t)}}async function Op(r,e,t){const n=fi(r);if(n.cc){for(const s of e){if(n.tc.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){I(Hn,"Adding an already active target "+s);continue}const i=await eh(n.localStore,s),a=await Ms(n.localStore,i);await co(n,gh(i),a.targetId,!1,a.resumeToken),di(n.remoteStore,a)}for(const s of t)n.tc.has(s)&&await On(n.localStore,s,!1).then((()=>{Ln(n.remoteStore,s),Fn(n,s)})).catch(bt)}}function fi(r){const e=V(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=_h.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=xp.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Ap.bind(null,e),e.Xu.zn=dp.bind(null,e.eventManager),e.Xu.Ec=fp.bind(null,e.eventManager),e}function mo(r){const e=V(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=vp.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Vp.bind(null,e),e}class Or{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Zs(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){return Jl(this.persistence,new Yl,e.initialUser,this.serializer)}Ic(e){return new Ha(li.C_,this.serializer)}Rc(e){return new ih}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Or.provider={build:()=>new Or};class Lp extends Or{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){E(this.persistence.referenceDelegate instanceof Ls,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new dl(n,e.asyncQueue,t)}Ic(e){const t=this.cacheSizeBytes!==void 0?fe.withCacheSize(this.cacheSizeBytes):fe.DEFAULT;return new Ha((n=>Ls.C_(n,t)),this.serializer)}}class yh extends Or{constructor(e,t,n){super(),this.fc=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.fc.initialize(this,e),await mo(this.fc.syncEngine),await Qn(this.fc.remoteStore),await this.persistence._o((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Ac(e){return Jl(this.persistence,new Yl,e.initialUser,this.serializer)}Vc(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new dl(n,e.asyncQueue,t)}dc(e,t){const n=new rd(t,this.persistence);return new nd(e.asyncQueue,n)}Ic(e){const t=Hl(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?fe.withCacheSize(this.cacheSizeBytes):fe.DEFAULT;return new Ya(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,ah(),ys(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Rc(e){return new ih}}class Mp extends yh{constructor(e,t){super(e,t,!1),this.fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.fc.syncEngine;this.sharedClientState instanceof vi&&(this.sharedClientState.syncEngine={Na:Cp.bind(null,t),La:kp.bind(null,t),Ba:Op.bind(null,t),po:Np.bind(null,t),Ma:Sp.bind(null,t)},await this.sharedClientState.start()),await this.persistence._o((async n=>{await Dp(this.fc.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())}))}Rc(e){const t=ah();if(!vi.C(t))throw new T(p.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=Hl(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new vi(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Lr{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Nu(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=Pp.bind(null,this.syncEngine),await Xi(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new hp})()}createDatastore(e){const t=Zs(e.databaseInfo.databaseId),n=bf(e.databaseInfo);return kf(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,a,o){return new Z_(n,s,i,a,o)})(this.localStore,this.datastore,e.asyncQueue,(t=>Nu(this.syncEngine,t,0)),(function(){return eu.C()?new eu:new Vf})())}createSyncEngine(e,t){return(function(s,i,a,o,u,c,l){const h=new gp(s,i,a,o,u,c);return l&&(h.cc=!0),h})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=V(s);I(We,"RemoteStore shutting down."),i.tu.add(5),await Jr(i),i.ru.shutdown(),i.iu.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Lr.provider={build:()=>new Lr};/**
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
 *//**
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
 */class _o{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):Y("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */let Fp=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new T(p.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const a=V(s),o={documents:i.map((h=>kn(a.serializer,h)))},u=await a.$t("BatchGetDocuments",a.serializer.databaseId,D.emptyPath(),o,i.length),c=new Map;u.forEach((h=>{const d=pf(a.serializer,h);c.set(d.key.toString(),d)}));const l=[];return i.forEach((h=>{const d=c.get(h.toString());E(!!d,55234,{key:h}),l.push(d)})),l})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new qn(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=A.fromPath(n);this.mutations.push(new pa(s,this.precondition(s)))})),await(async function(n,s){const i=V(n),a={writes:s.map((o=>xr(i.serializer,o)))};await i.Bt("Commit",i.serializer.databaseId,D.emptyPath(),a)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw v(50498,{Oc:e.constructor.name});t=P.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new T(p.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(P.min())?W.exists(!1):W.updateTime(t):W.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(P.min()))throw new T(p.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return W.updateTime(t)}return W.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class Up{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.xn=new Va(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.xn.mn((async()=>{const e=new Fp(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!Ur(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!qc(t)}return!1}}/**
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
 */const xt="FirestoreClient";class Bp{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=ae.UNAUTHENTICATED,this.clientId=sa.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async a=>{I(xt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(n,(a=>(I(xt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Me;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=so(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function Vi(r,e){r.asyncQueue.verifyOperationInProgress(),I(xt,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await Xl(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function Ou(r,e){r.asyncQueue.verifyOperationInProgress();const t=await qp(r);I(xt,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Su(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Su(e.remoteStore,s))),r._onlineComponents=e}async function qp(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){I(xt,"Using user provided OfflineComponentProvider");try{await Vi(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===p.FAILED_PRECONDITION||s.code===p.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Ne("Error using user provided cache. Falling back to memory cache: "+t),await Vi(r,new Or)}}else I(xt,"Using default OfflineComponentProvider"),await Vi(r,new Lp(void 0));return r._offlineComponents}async function po(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(I(xt,"Using user provided OnlineComponentProvider"),await Ou(r,r._uninitializedComponentsProvider._online)):(I(xt,"Using default OnlineComponentProvider"),await Ou(r,new Lr))),r._onlineComponents}function zp(r){return po(r).then((e=>e.syncEngine))}function $p(r){return po(r).then((e=>e.datastore))}async function qs(r){const e=await po(r),t=e.eventManager;return t.onListen=yp.bind(null,e.syncEngine),t.onUnlisten=Tp.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=Ip.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Ep.bind(null,e.syncEngine),t}function Gp(r,e,t,n){const s=new _o(n),i=new uo(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>io(await qs(r),i))),()=>{s.gc(),r.asyncQueue.enqueueAndForget((async()=>ao(await qs(r),i)))}}function Ih(r,e,t={}){const n=new Me;return r.asyncQueue.enqueueAndForget((async()=>(function(i,a,o,u,c){const l=new _o({next:d=>{l.gc(),a.enqueueAndForget((()=>ao(i,h)));const _=d.docs.has(o);!_&&d.fromCache?c.reject(new T(p.UNAVAILABLE,"Failed to get document because the client is offline.")):_&&d.fromCache&&u&&u.source==="server"?c.reject(new T(p.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):c.resolve(d)},error:d=>c.reject(d)}),h=new uo(zr(o.path),l,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return io(i,h)})(await qs(r),r.asyncQueue,e,t,n))),n.promise}function Th(r,e,t={}){const n=new Me;return r.asyncQueue.enqueueAndForget((async()=>(function(i,a,o,u,c){const l=new _o({next:d=>{l.gc(),a.enqueueAndForget((()=>ao(i,h))),d.fromCache&&u.source==="server"?c.reject(new T(p.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(d)},error:d=>c.reject(d)}),h=new uo(o instanceof _r?p_(o):o,l,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return io(i,h)})(await qs(r),r.asyncQueue,e,t,n))),n.promise}function Kp(r,e){const t=new Me;return r.asyncQueue.enqueueAndForget((async()=>wp(await zp(r),e,t))),t.promise}function jp(r,e,t){const n=new Me;return r.asyncQueue.enqueueAndForget((async()=>{const s=await $p(r);new Up(r.asyncQueue,s,t,e,n).Nc()})),n.promise}/**
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
 */const Lu="AsyncQueue";class Mu{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new Va(this,"async_queue_retry"),this.jc=()=>{const n=ys();n&&I(Lu,"Visibility state changed to "+n.visibilityState),this.xn.gn()},this.Hc=e;const t=ys();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=ys();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Me;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!St(e))throw e;I(Lu,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Qc=!0,e().catch((n=>{throw this.Wc=n,this.Qc=!1,Y("INTERNAL UNHANDLED ERROR: ",Fu(n)),n})).then((n=>(this.Qc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=ro.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Wc&&v(47125,{el:Fu(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function Fu(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class Oe extends ti{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Mu,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Mu(e),this._firestoreClient=void 0,await e}}}function fg(r,e,t){t||(t=wr);const n=Gu(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(Ku(i,e))return s;throw new T(p.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new T(p.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<hl)throw new T(p.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&ta(e.host)&&ju(e.host),n.initialize({options:e,instanceIdentifier:t})}function mg(r,e){const t=typeof r=="object"?r:xh(),n=typeof r=="string"?r:wr,s=Gu(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=bh("firestore");i&&Uf(s,...i)}return s}function Nt(r){if(r._terminated)throw new T(p.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Qp(r),r._firestoreClient}function Qp(r){var n,s,i,a;const e=r._freezeSettings(),t=Lf(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new Bp(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(u){const c=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(c),_online:c}})(r._componentsProvider))}/**
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
 */class Eh{convertValue(e,t="none"){switch(Z(e)){case 0:return null;case 1:return e.booleanValue;case 2:return z(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(nt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw v(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Ct(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[Yt].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>z(a.doubleValue)));return new Ee(t)}convertGeoPoint(e){return new je(z(e.latitude),z(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=qr(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Vn(e));default:return null}}convertTimestamp(e){const t=tt(e);return new U(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=D.fromString(e);E(il(n),9688,{name:e});const s=new Ht(n.get(1),n.get(3)),i=new A(n.popFirst(5));return s.isEqual(t)||Y(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class Xr extends Eh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Re(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new G(this.firestore,null,t)}}const Uu="@firebase/firestore",Bu="4.16.0";/**
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
 */function qu(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}/**
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
 */class zs{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new G(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Wp(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(rt("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Wp extends zs{data(){return super.data()}}/**
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
 */function wh(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new T(p.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class go{}class yo extends go{}function _g(r,e,...t){let n=[];e instanceof go&&n.push(e),n=n.concat(t),(function(i){const a=i.filter((u=>u instanceof Yn)).length,o=i.filter((u=>u instanceof Zr)).length;if(a>1||a>0&&o>0)throw new T(p.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class Zr extends yo{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Zr(e,t,n)}_apply(e){const t=this._parse(e);return Ah(e._query,t),new He(e.firestore,e.converter,Mi(e._query,t))}_parse(e){const t=Gr(e.firestore);return(function(i,a,o,u,c,l,h){let d;if(c.isKeyField()){if(l==="array-contains"||l==="array-contains-any")throw new T(p.INVALID_ARGUMENT,`Invalid Query. You can't perform '${l}' queries on documentId().`);if(l==="in"||l==="not-in"){$u(h,l);const y=[];for(const R of h)y.push(zu(u,i,R));d={arrayValue:{values:y}}}else d=zu(u,i,h)}else l!=="in"&&l!=="not-in"&&l!=="array-contains-any"||$u(h,l),d=$f(o,a,h,l==="in"||l==="not-in");return L.create(c,l,d)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function pg(r,e,t){const n=e,s=rt("where",r);return Zr._create(s,n,t)}class Yn extends go{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Yn(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:B.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let a=s;const o=i.getFlattenedFilters();for(const u of o)Ah(a,u),a=Mi(a,u)})(e._query,t),new He(e.firestore,e.converter,Mi(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function gg(...r){return r.forEach((e=>vh("or",e))),Yn._create("or",r)}function yg(...r){return r.forEach((e=>vh("and",e))),Yn._create("and",r)}class Io extends yo{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Io(e,t)}_apply(e){const t=(function(s,i,a){if(s.startAt!==null)throw new T(p.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new T(p.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Pr(i,a)})(e._query,this._field,this._direction);return new He(e.firestore,e.converter,Zd(e._query,t))}}function Ig(r,e="asc"){const t=e,n=rt("orderBy",r);return Io._create(n,t)}class To extends yo{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new To(e,t,n)}_apply(e){return new He(e.firestore,e.converter,bs(e._query,this._limit,this._limitType))}}function Tg(r){return To._create("limit",r,"F")}function zu(r,e,t){if(typeof(t=be(t))=="string"){if(t==="")throw new T(p.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Bc(e)&&t.indexOf("/")!==-1)throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(D.fromString(t));if(!A.isDocumentKey(n))throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return vr(r,new A(n))}if(t instanceof G)return vr(r,t._key);throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${$s(t)}.`)}function $u(r,e){if(!Array.isArray(r)||r.length===0)throw new T(p.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Ah(r,e){const t=(function(s,i){for(const a of s)for(const o of a.getFlattenedFilters())if(i.indexOf(o.op)>=0)return o.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new T(p.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new T(p.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function vh(r,e){if(!(e instanceof Zr||e instanceof Yn))throw new T(p.INVALID_ARGUMENT,`Function ${r}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function Eo(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class Hp extends Eh{constructor(e){super(),this.firestore=e}convertBytes(e){return new Re(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new G(this.firestore,null,t)}}class Yp{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=Zp(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function Eg(r){return new Yp(r)}class Jp{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Lr.provider,this._offlineComponentProvider={build:t=>new yh(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class Xp{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Lr.provider,this._offlineComponentProvider={build:t=>new Mp(t,e==null?void 0:e.cacheSizeBytes)}}}function Zp(r){return new Jp(r==null?void 0:r.forceOwnership)}function wg(){return new Xp}class pn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class It extends zs{constructor(e,t,n,s,i,a){super(e,t,n,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Is(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(rt("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new T(p.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=It._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}It._jsonSchemaVersion="firestore/documentSnapshot/1.0",It._jsonSchema={type:X("string",It._jsonSchemaVersion),bundleSource:X("string","DocumentSnapshot"),bundleName:X("string"),bundle:X("string")};class Is extends It{data(e={}){return super.data(e)}}class Tt{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new pn(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new Is(this._firestore,this._userDataWriter,n.key,n,new pn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new T(p.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((o=>{H(s._snapshot.query)?Qi(s._snapshot.query):Ta(s.query._query);const u=new Is(s._firestore,s._userDataWriter,o.doc.key,o.doc,new pn(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);return o.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((o=>i||o.type!==3)).map((o=>{const u=new Is(s._firestore,s._userDataWriter,o.doc.key,o.doc,new pn(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);let c=-1,l=-1;return o.type!==0&&(c=a.indexOf(o.doc.key),a=a.delete(o.doc.key)),o.type!==1&&(a=a.add(o.doc),l=a.indexOf(o.doc.key)),{type:eg(o.type),doc:u,oldIndex:c,newIndex:l}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new T(p.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Tt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=sa.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function eg(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return v(61501,{type:r})}}/**
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
 */Tt._jsonSchemaVersion="firestore/querySnapshot/1.0",Tt._jsonSchema={type:X("string",Tt._jsonSchemaVersion),bundleSource:X("string","QuerySnapshot"),bundleName:X("string"),bundle:X("string")};const tg={maxAttempts:5};/**
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
 */class ng{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Gr(e)}set(e,t,n){this._verifyNotCommitted();const s=_t(e,this._firestore),i=Eo(s.converter,t,n),a=Pa(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(a.toMutation(s._key,W.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=_t(e,this._firestore);let a;return a=typeof(t=be(t))=="string"||t instanceof Gn?Sa(this._dataReader,"WriteBatch.update",i._key,t,n,s):ba(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,W.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=_t(e,this._firestore);return this._mutations=this._mutations.concat(new qn(t._key,W.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new T(p.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function _t(r,e){if((r=be(r)).firestore!==e)throw new T(p.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
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
 */class rg{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Gr(e)}get(e){const t=_t(e,this._firestore),n=new Hp(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return v(24041);const i=s[0];if(i.isFoundDocument())return new zs(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new zs(this._firestore,n,t._key,null,t.converter);throw v(18433,{doc:i})}))}set(e,t,n){const s=_t(e,this._firestore),i=Eo(s.converter,t,n),a=Pa(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,a),this}update(e,t,n,...s){const i=_t(e,this._firestore);let a;return a=typeof(t=be(t))=="string"||t instanceof Gn?Sa(this._dataReader,"Transaction.update",i._key,t,n,s):ba(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,a),this}delete(e){const t=_t(e,this._firestore);return this._transaction.delete(t._key),this}}/**
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
 */class sg extends rg{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=_t(e,this._firestore),n=new Xr(this._firestore);return super.get(e).then((s=>new It(this._firestore,n,t._key,s._document,new pn(!1,!1),t.converter)))}}function Ag(r,e,t){r=ne(r,Oe);const n={...tg,...t};(function(a){if(a.maxAttempts<1)throw new T(p.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=Nt(r);return jp(s,(i=>e(new sg(r,i))),n)}/**
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
 */function vg(r){r=ne(r,G);const e=ne(r.firestore,Oe),t=Nt(e);return Ih(t,r._key).then((n=>wo(e,r,n)))}function Vg(r){r=ne(r,G);const e=ne(r.firestore,Oe),t=Nt(e);return Ih(t,r._key,{source:"server"}).then((n=>wo(e,r,n)))}function Rg(r){r=ne(r,He);const e=ne(r.firestore,Oe),t=Nt(e),n=new Xr(e);return wh(r._query),Th(t,r._query).then((s=>new Tt(e,n,r,s)))}function Pg(r){r=ne(r,He);const e=ne(r.firestore,Oe),t=Nt(e),n=new Xr(e);return Th(t,r._query,{source:"server"}).then((s=>new Tt(e,n,r,s)))}function xg(r,e,t){r=ne(r,G);const n=ne(r.firestore,Oe),s=Eo(r.converter,e,t),i=Gr(n);return mi(n,[Pa(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,W.none())])}function bg(r,e,t,...n){r=ne(r,G);const s=ne(r.firestore,Oe),i=Gr(s);let a;return a=typeof(e=be(e))=="string"||e instanceof Gn?Sa(i,"updateDoc",r._key,e,t,n):ba(i,"updateDoc",r._key,e),mi(s,[a.toMutation(r._key,W.exists(!0))])}function Sg(r){return mi(ne(r.firestore,Oe),[new qn(r._key,W.none())])}function Cg(r,...e){var c,l,h;r=be(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||qu(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(qu(e[n])){const d=e[n];e[n]=(c=d.next)==null?void 0:c.bind(d),e[n+1]=(l=d.error)==null?void 0:l.bind(d),e[n+2]=(h=d.complete)==null?void 0:h.bind(d)}let i,a,o;if(r instanceof G)a=ne(r.firestore,Oe),o=zr(r._key.path),i={next:d=>{e[n]&&e[n](wo(a,r,d))},error:e[n+1],complete:e[n+2]};else{const d=ne(r,He);a=ne(d.firestore,Oe),o=d._query;const _=new Xr(a);i={next:y=>{e[n]&&e[n](new Tt(a,_,d,y))},error:e[n+1],complete:e[n+2]},wh(r._query)}const u=Nt(a);return Gp(u,o,s,i)}function mi(r,e){const t=Nt(r);return Kp(t,e)}function wo(r,e,t){const n=t.docs.get(e._key),s=new Xr(r);return new It(r,s,e._key,n,new pn(t.hasPendingWrites,t.fromCache),e.converter)}function Dg(r){return r=ne(r,Oe),Nt(r),new ng(r,(e=>mi(r,e)))}(function(e,t=!0){zh(qh),Uh(new Bh("firestore",((n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),o=new Oe(new Kh(n.getProvider("auth-internal")),new Wh(a,n.getProvider("app-check-internal")),kd(a,s),a);return i={useFetchStreams:t,...i},o._setSettings(i),o}),"PUBLIC").setMultipleInstances(!0)),vo(Uu,Bu,e),vo(Uu,Bu,"esm2020")})();export{wg as a,vg as b,Uf as c,cg as d,hg as e,Sg as f,mg as g,Pg as h,fg as i,ug as j,Rg as k,Dg as l,Vg as m,lg as n,Cg as o,Eg as p,_g as q,Ag as r,xg as s,Ig as t,bg as u,Tg as v,pg as w,gg as x,yg as y};
