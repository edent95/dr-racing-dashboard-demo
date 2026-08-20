import{L as Ah,I as qt,a as Vh,g as De,F as vh,f as We,b as qu,h as zu,i as ea,p as $u,d as Rh,c as Ph,e as xh,j as bh,E as Sh,X as Ch,k as Dh,l as mi,W as Jr,m as Nh,n as Gu,o as gs,q as kh,s as Oh,t as Ku,M as Lh,u as To,_ as Mh,C as Fh,r as Eo,S as Uh}from"./vendor-firebase-DxtStbR8.js";import{R as ta}from"./vendor-re2js-C8U-Xn59.js";/**
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
 */class ie{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ie.UNAUTHENTICATED=new ie(null),ie.GOOGLE_CREDENTIALS=new ie("google-credentials-uid"),ie.FIRST_PARTY=new ie("first-party-uid"),ie.MOCK_USER=new ie("mock-user");/**
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
 */let Fn="12.15.0";function Bh(r){Fn=r}/**
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
 */const Qt=new Ah("@firebase/firestore");function hn(){return Qt.logLevel}function I(r,...e){if(Qt.logLevel<=We.DEBUG){const t=e.map(na);Qt.debug(`Firestore (${Fn}): ${r}`,...t)}}function Y(r,...e){if(Qt.logLevel<=We.ERROR){const t=e.map(na);Qt.error(`Firestore (${Fn}): ${r}`,...t)}}function Ne(r,...e){if(Qt.logLevel<=We.WARN){const t=e.map(na);Qt.warn(`Firestore (${Fn}): ${r}`,...t)}}function na(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function V(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,ju(r,n,t)}function ju(r,e,t){let n=`FIRESTORE (${Fn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw Y(n),new Error(n)}function E(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||ju(e,s,n)}function v(r,e){return r}/**
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
 */const p={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class T extends vh{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Le{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Qu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class qh{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(ie.UNAUTHENTICATED)))}shutdown(){}}class zh{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class $h{constructor(e){this.t=e,this.currentUser=ie.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){E(this.o===void 0,42304);let n=this.i;const s=u=>this.i!==n?(n=this.i,t(u)):Promise.resolve();let i=new Le;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Le,e.enqueueRetryable((()=>s(this.currentUser)))};const a=()=>{const u=i;e.enqueueRetryable((async()=>{await u.promise,await s(this.currentUser)}))},o=u=>{I("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit((u=>o(u))),setTimeout((()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?o(u):(I("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Le)}}),0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.i!==e?(I("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(E(typeof n.accessToken=="string",31837,{l:n}),new Qu(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return E(e===null||typeof e=="string",2055,{h:e}),new ie(e)}}class Gh{constructor(e,t,n){this.T=e,this.P=t,this.R=n,this.type="FirstParty",this.user=ie.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);const e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class Kh{constructor(e,t,n){this.T=e,this.P=t,this.R=n}getToken(){return Promise.resolve(new Gh(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable((()=>t(ie.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class wo{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class jh{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Vh(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){E(this.o===void 0,3512);const n=i=>{i.error!=null&&I("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.m;return this.m=i.token,I("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{I("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):I("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new wo(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(E(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new wo(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Qh(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class ra{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=Qh(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function S(r,e){return r<e?-1:r>e?1:0}function vi(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return _i(s)===_i(i)?S(s,i):_i(s)?1:-1}return S(r.length,e.length)}const Wh=55296,Hh=57343;function _i(r){const e=r.charCodeAt(0);return e>=Wh&&e<=Hh}function gn(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}function Wu(r){return r+"\0"}/**
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
 */const Ue="__name__";class Me{constructor(e,t,n){t===void 0?t=0:t>e.length&&V(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&V(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return Me.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Me?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=Me.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return S(e.length,t.length)}static compareSegments(e,t){const n=Me.isNumericId(e),s=Me.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?Me.extractNumericId(e).compare(Me.extractNumericId(t)):vi(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return qt.fromString(e.substring(4,e.length-2))}}class D extends Me{construct(e,t,n){return new D(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new T(p.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new D(t)}static emptyPath(){return new D([])}}const Yh=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class $ extends Me{construct(e,t,n){return new $(e,t,n)}static isValidIdentifier(e){return Yh.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),$.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Ue}static keyField(){return new $([Ue])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new T(p.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let a=!1;for(;s<e.length;){const o=e[s];if(o==="\\"){if(s+1===e.length)throw new T(p.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new T(p.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=u,s+=2}else o==="`"?(a=!a,s++):o!=="."||a?(n+=o,s++):(i(),s++)}if(i(),a)throw new T(p.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new $(t)}static emptyPath(){return new $([])}}/**
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
 */function Hu(r,e,t){if(!t)throw new T(p.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Jh(r,e,t,n){if(e===!0&&n===!0)throw new T(p.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Ao(r){if(!A.isDocumentKey(r))throw new T(p.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Vo(r){if(A.isDocumentKey(r))throw new T(p.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function Lr(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function Bs(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":V(12329,{type:typeof r})}function Pe(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new T(p.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Bs(r);throw new T(p.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
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
 */function X(r,e){const t={typeString:r};return e&&(t.value=e),t}function Mr(r,e){if(!Lr(r))throw new T(p.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const a=r[n];if(s&&typeof a!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&a!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new T(p.INVALID_ARGUMENT,t);return!0}/**
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
 */const vo=-62135596800,Ro=1e6;class U{static now(){return U.fromMillis(Date.now())}static fromDate(e){return U.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*Ro);return new U(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new T(p.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new T(p.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<vo)throw new T(p.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new T(p.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ro}_compareTo(e){return this.seconds===e.seconds?S(this.nanoseconds,e.nanoseconds):S(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:U._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Mr(e,U._jsonSchema))return new U(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-vo;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}U._jsonSchemaVersion="firestore/timestamp/1.0",U._jsonSchema={type:X("string",U._jsonSchemaVersion),seconds:X("number"),nanoseconds:X("number")};/**
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
 */const yn=-1;class ys{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function Ri(r){return r.fields.find((e=>e.kind===2))}function Dt(r){return r.fields.filter((e=>e.kind!==2))}ys.UNKNOWN_ID=-1;class as{constructor(e,t){this.fieldPath=e,this.kind=t}}class gr{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new gr(0,be.min())}}function Yu(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=P.fromTimestamp(n===1e9?new U(t+1,0):new U(t,n));return new be(s,A.empty(),e)}function Ju(r){return new be(r.readTime,r.key,yn)}class be{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new be(P.min(),A.empty(),yn)}static max(){return new be(P.max(),A.empty(),yn)}}function sa(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=A.comparator(r.documentKey,e.documentKey),t!==0?t:S(r.largestBatchId,e.largestBatchId))}/**
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
 */const Xu="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Zu{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function xt(r){if(r.code!==p.FAILED_PRECONDITION||r.message!==Xu)throw r;I("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class m{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&V(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new m(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof m?t:m.resolve(t)}catch(t){return m.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):m.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):m.reject(t)}static resolve(e){return new m(((t,n)=>{t(e)}))}static reject(e){return new m(((t,n)=>{n(e)}))}static waitFor(e){return new m(((t,n)=>{let s=0,i=0,a=!1;e.forEach((o=>{++s,o.next((()=>{++i,a&&i===s&&t()}),(u=>n(u)))})),a=!0,i===s&&t()}))}static or(e){let t=m.resolve(!1);for(const n of e)t=t.next((s=>s?m.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new m(((n,s)=>{const i=e.length,a=new Array(i);let o=0;for(let u=0;u<i;u++){const c=u;t(e[c]).next((l=>{a[c]=l,++o,o===i&&n(a)}),(l=>s(l)))}}))}static doWhile(e,t){return new m(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}/**
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
 */const Ve="SimpleDb";class qs{static open(e,t,n,s){try{return new qs(t,e.transaction(s,n))}catch(i){throw new ir(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.v=new Le,this.transaction.oncomplete=()=>{this.v.resolve()},this.transaction.onabort=()=>{t.error?this.v.reject(new ir(e,t.error)):this.v.resolve()},this.transaction.onerror=n=>{const s=ia(n.target.error);this.v.reject(new ir(e,s))}}get S(){return this.v.promise}abort(e){e&&this.v.reject(e),this.aborted||(I(Ve,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}D(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Zh(t)}}class pt{static delete(e){return I(Ve,"Removing database:",e),kt(kh().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!Oh())return!1;if(pt.F())return!0;const e=gs(),t=pt.O(e),n=0<t&&t<10,s=ec(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static M(e,t){return e.store(t)}static O(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.N=n,this.L=null,pt.O(gs())===12.2&&Y("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async B(e){return this.db||(I(Ve,"Opening database:",this.name),this.db=await new Promise(((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;t(a)},s.onblocked=()=>{n(new ir(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new T(p.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new T(p.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new ir(e,a))},s.onupgradeneeded=i=>{I(Ve,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.N.U(a,s.transaction,i.oldVersion,this.version).next((()=>{I(Ve,"Database upgrade to version "+this.version+" complete")}))}}))),this.k&&(this.db.onversionchange=t=>this.k(t)),this.db}q(e){this.k=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let a=0;for(;;){++a;try{this.db=await this.B(e);const o=qs.open(this.db,e,i?"readonly":"readwrite",n),u=s(o).next((c=>(o.D(),c))).catch((c=>(o.abort(c),m.reject(c)))).toPromise();return u.catch((()=>{})),await o.S,u}catch(o){const u=o,c=u.name!=="FirebaseError"&&a<3;if(I(Ve,"Transaction failed with error:",u.message,"Retrying:",c),this.close(),!c)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function ec(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class Xh{constructor(e){this.$=e,this.K=!1,this.W=null}get isDone(){return this.K}get G(){return this.W}set cursor(e){this.$=e}done(){this.K=!0}j(e){this.W=e}delete(){return kt(this.$.delete())}}class ir extends T{constructor(e,t){super(p.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function bt(r){return r.name==="IndexedDbTransactionError"}class Zh{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(I(Ve,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(I(Ve,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),kt(n)}add(e){return I(Ve,"ADD",this.store.name,e,e),kt(this.store.add(e))}get(e){return kt(this.store.get(e)).next((t=>(t===void 0&&(t=null),I(Ve,"GET",this.store.name,e,t),t)))}delete(e){return I(Ve,"DELETE",this.store.name,e),kt(this.store.delete(e))}count(){return I(Ve,"COUNT",this.store.name),kt(this.store.count())}H(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new m(((a,o)=>{i.onerror=u=>{o(u.target.error)},i.onsuccess=u=>{a(u.target.result)}}))}{const i=this.cursor(n),a=[];return this.J(i,((o,u)=>{a.push(u)})).next((()=>a))}}Y(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new m(((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}}))}Z(e,t){I(Ve,"DELETE ALL",this.store.name);const n=this.options(e,t);n.X=!1;const s=this.cursor(n);return this.J(s,((i,a,o)=>o.delete()))}ee(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.J(s,t)}te(e){const t=this.cursor({});return new m(((n,s)=>{t.onerror=i=>{const a=ia(i.target.error);s(a)},t.onsuccess=i=>{const a=i.target.result;a?e(a.primaryKey,a.value).next((o=>{o?a.continue():n()})):n()}}))}J(e,t){const n=[];return new m(((s,i)=>{e.onerror=a=>{i(a.target.error)},e.onsuccess=a=>{const o=a.target.result;if(!o)return void s();const u=new Xh(o),c=t(o.primaryKey,o.value,u);if(c instanceof m){const l=c.catch((h=>(u.done(),m.reject(h))));n.push(l)}u.isDone?s():u.G===null?o.continue():o.continue(u.G)}})).next((()=>m.waitFor(n)))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.X?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function kt(r){return new m(((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=ia(n.target.error);t(s)}}))}let Po=!1;function ia(r){const e=pt.O(gs());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new T("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Po||(Po=!0,setTimeout((()=>{throw n}),0)),n}}return r}const ar="IndexBackfiller";class ed{constructor(e,t){this.asyncQueue=e,this.ne=t,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}re(e){I(ar,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.ne.ie();I(ar,`Documents written: ${t}`)}catch(t){bt(t)?I(ar,"Ignoring IndexedDB error during index backfill: ",t):await xt(t)}await this.re(6e4)}))}}class td{constructor(e,t){this.localStore=e,this.persistence=t}async ie(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.se(t,e)))}se(e,t){const n=new Set;let s=t,i=!0;return m.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((a=>{if(a!==null&&!n.has(a))return I(ar,`Processing collection: ${a}`),this._e(e,a,s).next((o=>{s-=o,n.add(a)}));i=!1})))).next((()=>t-s))}_e(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next((i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(e,a).next((()=>this.oe(s,i))).next((o=>(I(ar,`Updating offset: ${o}`),this.localStore.indexManager.updateCollectionGroup(e,t,o)))).next((()=>a.size))}))))}oe(e,t){let n=e;return t.changes.forEach(((s,i)=>{const a=Ju(i);sa(a,n)>0&&(n=a)})),new be(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
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
 */class ye{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.ae(n),this.ue=n=>t.writeSequenceNumber(n))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}ye.ce=-1;/**
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
 */const zt=-1;function Fr(r){return r==null}function In(r){return r===0&&1/r==-1/0}function tc(r){return typeof r=="number"&&Number.isInteger(r)&&!In(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function nd(r){return typeof r=="string"}/**
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
 */const Is="";function me(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=xo(e)),e=rd(r.get(t),e);return xo(e)}function rd(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Is:t+="";break;default:t+=i}}return t}function xo(r){return r+Is+""}function Be(r){const e=r.length;if(E(e>=2,64408,{path:r}),e===2)return E(r.charAt(0)===Is&&r.charAt(1)==="",56145,{path:r}),D.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const a=r.indexOf(Is,i);switch((a<0||a>t)&&V(50515,{path:r}),r.charAt(a+1)){case"":const o=r.substring(i,a);let u;s.length===0?u=o:(s+=o,u=s,s=""),n.push(u);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:V(61167,{path:r})}i=a+2}return new D(n)}/**
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
 */const Nt="remoteDocuments",Ur="owner",rn="owner",yr="mutationQueues",sd="userId",Oe="mutations",bo="batchId",Ut="userMutationsIndex",So=["userId","batchId"];/**
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
 */function os(r,e){return[r,me(e)]}function nc(r,e,t){return[r,me(e),t]}const id={},Tn="documentMutations",Ts="remoteDocumentsV14",ad=["prefixPath","collectionGroup","readTime","documentId"],us="documentKeyIndex",od=["prefixPath","collectionGroup","documentId"],rc="collectionGroupIndex",ud=["collectionGroup","readTime","prefixPath","documentId"],Ir="remoteDocumentGlobal",Pi="remoteDocumentGlobalKey",En="targets",sc="queryTargetsIndex",cd=["canonicalId","targetId"],wn="targetDocuments",ld=["targetId","path"],aa="documentTargetsIndex",hd=["path","targetId"],Es="targetGlobalKey",$t="targetGlobal",Tr="collectionParents",dd=["collectionId","parent"],An="clientMetadata",fd="clientId",zs="bundles",md="bundleId",$s="namedQueries",_d="name",oa="indexConfiguration",pd="indexId",xi="collectionGroupIndex",gd="collectionGroup",or="indexState",yd=["indexId","uid"],ic="sequenceNumberIndex",Id=["uid","sequenceNumber"],ur="indexEntries",Td=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],ac="documentKeyIndex",Ed=["indexId","uid","orderedDocumentKey"],Gs="documentOverlays",wd=["userId","collectionPath","documentId"],bi="collectionPathOverlayIndex",Ad=["userId","collectionPath","largestBatchId"],oc="collectionGroupOverlayIndex",Vd=["userId","collectionGroup","largestBatchId"],ua="globals",vd="name",uc=[yr,Oe,Tn,Nt,En,Ur,$t,wn,An,Ir,Tr,zs,$s],Rd=[...uc,Gs],cc=[yr,Oe,Tn,Ts,En,Ur,$t,wn,An,Ir,Tr,zs,$s,Gs],lc=cc,ca=[...lc,oa,or,ur],Pd=ca,hc=[...ca,ua],xd=hc;/**
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
 */class Si extends Zu{constructor(e,t){super(),this.le=e,this.currentSequenceNumber=t}}function ne(r,e){const t=v(r);return pt.M(t.le,e)}/**
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
 */class q{constructor(e,t){this.comparator=e,this.root=t||ce.EMPTY}insert(e,t){return new q(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ce.BLACK,null,null))}remove(e){return new q(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ce.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Xr(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Xr(this.root,e,this.comparator,!1)}getReverseIterator(){return new Xr(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Xr(this.root,e,this.comparator,!0)}}class Xr{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ce{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??ce.RED,this.left=s??ce.EMPTY,this.right=i??ce.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new ce(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ce.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return ce.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ce.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ce.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw V(43730,{key:this.key,value:this.value});if(this.right.isRed())throw V(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw V(27949);return e+(this.isRed()?0:1)}}ce.EMPTY=null,ce.RED=!0,ce.BLACK=!1;ce.EMPTY=new class{constructor(){this.size=0}get key(){throw V(57766)}get value(){throw V(16141)}get color(){throw V(16727)}get left(){throw V(29726)}get right(){throw V(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new ce(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class F{constructor(e){this.comparator=e,this.data=new q(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Co(this.data.getIterator())}getIteratorFrom(e){return new Co(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof F)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new F(this.comparator);return t.data=e,t}}class Co{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function sn(r){return r.hasNext()?r.getNext():void 0}/**
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
 */class Ie{constructor(e){this.fields=e,e.sort($.comparator)}static empty(){return new Ie([])}unionWith(e){let t=new F($.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Ie(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return gn(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function ws(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function St(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function bd(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function dc(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
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
 */class fc extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class j{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new fc("Invalid base64 string: "+i):i}})(e);return new j(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i})(e);return new j(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return S(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}j.EMPTY_BYTE_STRING=new j("");const Sd=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ze(r){if(E(!!r,39018),typeof r=="string"){let e=0;const t=Sd.exec(r);if(E(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:z(r.seconds),nanos:z(r.nanos)}}function z(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function et(r){return typeof r=="string"?j.fromBase64String(r):j.fromUint8Array(r)}/**
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
 */const mc="server_timestamp",_c="__type__",pc="__previous_value__",gc="__local_write_time__";function Ks(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[_c])==null?void 0:n.stringValue)===mc}function Br(r){const e=r.mapValue.fields[pc];return Ks(e)?Br(e):e}function Vn(r){const e=Ze(r.mapValue.fields[gc].timestampValue);return new U(e.seconds,e.nanos)}/**
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
 */class Cd{constructor(e,t,n,s,i,a,o,u,c,l,h){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=o,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=l,this.apiKey=h}}const Er="(default)";class Wt{constructor(e,t){this.projectId=e,this.database=t||Er}static empty(){return new Wt("","")}get isDefaultDatabase(){return this.database===Er}isEqual(e){return e instanceof Wt&&e.projectId===this.projectId&&e.database===this.database}}function Dd(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new T(p.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Wt(r.options.projectId,e)}/**
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
 */const la="__type__",yc="__max__",mt={mapValue:{fields:{__type__:{stringValue:yc}}}},ha="__vector__",Ht="value",Ge={nullValue:"NULL_VALUE"},Ee={booleanValue:!0},oe={booleanValue:!1};function Z(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?Ks(r)?4:Ic(r)?9007199254740991:Yt(r)?10:11:V(28295,{value:r})}function ke(r,e,t){if(r===e)return!0;const n=Z(r);if(n!==Z(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Vn(r).isEqual(Vn(e));case 3:return(function(i,a){if(typeof i.timestampValue=="string"&&typeof a.timestampValue=="string"&&i.timestampValue.length===a.timestampValue.length)return i.timestampValue===a.timestampValue;const o=Ze(i.timestampValue),u=Ze(a.timestampValue);return o.seconds===u.seconds&&o.nanos===u.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,a){return et(i.bytesValue).isEqual(et(a.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,a){return z(i.geoPointValue.latitude)===z(a.geoPointValue.latitude)&&z(i.geoPointValue.longitude)===z(a.geoPointValue.longitude)})(r,e);case 2:return(function(i,a,o){if("integerValue"in i&&"integerValue"in a)return z(i.integerValue)===z(a.integerValue);let u,c;if("doubleValue"in i&&"doubleValue"in a)u=z(i.doubleValue),c=z(a.doubleValue);else{if(!(o!=null&&o.Ee))return!1;u=z(i.integerValue??i.doubleValue),c=z(a.integerValue??a.doubleValue)}return u===c?!!(o!=null&&o.he)||In(u)===In(c):!!(o===void 0||o.Te)&&isNaN(u)&&isNaN(c)})(r,e,t);case 9:return gn(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>ke(s,i,t)));case 10:case 11:return(function(i,a,o){const u=i.mapValue.fields||{},c=a.mapValue.fields||{};if(ws(u)!==ws(c))return!1;for(const l in u)if(u.hasOwnProperty(l)&&(c[l]===void 0||!ke(u[l],c[l],o)))return!1;return!0})(r,e,t);default:return V(52216,{left:r})}}function wr(r,e){return(r.values||[]).find((t=>ke(t,e)))!==void 0}function _e(r,e){if(r===e)return 0;const t=Z(r),n=Z(e);if(t!==n)return S(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return S(r.booleanValue,e.booleanValue);case 2:return(function(i,a){const o=z(i.integerValue||i.doubleValue),u=z(a.integerValue||a.doubleValue);return o<u?-1:o>u?1:o===u?0:isNaN(o)?isNaN(u)?0:-1:1})(r,e);case 3:return Do(r.timestampValue,e.timestampValue);case 4:return Do(Vn(r),Vn(e));case 5:return vi(r.stringValue,e.stringValue);case 6:return(function(i,a){const o=et(i),u=et(a);return o.compareTo(u)})(r.bytesValue,e.bytesValue);case 7:return(function(i,a){const o=i.split("/"),u=a.split("/");for(let c=0;c<o.length&&c<u.length;c++){const l=S(o[c],u[c]);if(l!==0)return l}return S(o.length,u.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,a){const o=S(z(i.latitude),z(a.latitude));return o!==0?o:S(z(i.longitude),z(a.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return No(r.arrayValue,e.arrayValue);case 10:return(function(i,a){var d,_,y,R;const o=i.fields||{},u=a.fields||{},c=(d=o[Ht])==null?void 0:d.arrayValue,l=(_=u[Ht])==null?void 0:_.arrayValue,h=S(((y=c==null?void 0:c.values)==null?void 0:y.length)||0,((R=l==null?void 0:l.values)==null?void 0:R.length)||0);return h!==0?h:No(c,l)})(r.mapValue,e.mapValue);case 11:return(function(i,a){if(i===mt.mapValue&&a===mt.mapValue)return 0;if(i===mt.mapValue)return 1;if(a===mt.mapValue)return-1;const o=i.fields||{},u=Object.keys(o),c=a.fields||{},l=Object.keys(c);u.sort(),l.sort();for(let h=0;h<u.length&&h<l.length;++h){const d=vi(u[h],l[h]);if(d!==0)return d;const _=_e(o[u[h]],c[l[h]]);if(_!==0)return _}return S(u.length,l.length)})(r.mapValue,e.mapValue);default:throw V(23264,{Pe:t})}}function Do(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return S(r,e);const t=Ze(r),n=Ze(e),s=S(t.seconds,n.seconds);return s!==0?s:S(t.nanos,n.nanos)}function No(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=_e(t[s],n[s]);if(i!==void 0&&i!==0)return i}return S(t.length,n.length)}function vn(r){return Ci(r)}function Ci(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=Ze(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return et(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return A.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=Ci(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${Ci(t.fields[a])}`;return s+"}"})(r.mapValue):V(61005,{value:r})}function cs(r){switch(Z(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Br(r);return e?16+cs(e):16;case 5:return 2*r.stringValue.length;case 6:return et(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+cs(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return St(n.fields,((i,a)=>{s+=i.length+cs(a)})),s})(r.mapValue);default:throw V(13486,{value:r})}}function Ar(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function qe(r){return!!r&&"integerValue"in r}function Bt(r){return!!r&&"doubleValue"in r}function Tt(r){return qe(r)||Bt(r)}function Et(r){return!!r&&"arrayValue"in r}function Re(r){return!!r&&"nullValue"in r}function we(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Gt(r){return!!r&&"mapValue"in r}function Yt(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[la])==null?void 0:n.stringValue)===ha}function Di(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[Ht])==null?void 0:t.arrayValue}function cr(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return St(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=cr(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=cr(r.arrayValue.values[t]);return e}return{...r}}function Ic(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===yc}const Tc={mapValue:{fields:{[la]:{stringValue:ha},[Ht]:{arrayValue:{}}}}};function Nd(r){return"nullValue"in r?Ge:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Ar(Wt.empty(),A.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Yt(r)?Tc:{mapValue:{}}:V(35942,{value:r})}function kd(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Ar(Wt.empty(),A.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?Tc:"mapValue"in r?Yt(r)?{mapValue:{}}:mt:V(61959,{value:r})}function ko(r,e){const t=_e(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function Oo(r,e){const t=_e(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
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
 */class ae{constructor(e){this.value=e}static empty(){return new ae({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!Gt(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=cr(t)}setAll(e){let t=$.emptyPath(),n={},s=[];e.forEach(((a,o)=>{if(!t.isImmediateParentOf(o)){const u=this.getFieldsMap(t);this.applyChanges(u,n,s),n={},s=[],t=o.popLast()}a?n[o.lastSegment()]=cr(a):s.push(o.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());Gt(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ke(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];Gt(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){St(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new ae(cr(this.value))}}function Ec(r){const e=[];return St(r.fields,((t,n)=>{const s=new $([t]);if(Gt(n)){const i=Ec(n.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)})),new Ie(e)}/**
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
 */function js(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:In(e)?"-0":e}}function da(r){return{integerValue:""+r}}function fa(r,e,t){return Number.isInteger(e)&&(t!=null&&t.preferIntegers)||tc(e)?da(e):js(r,e)}/**
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
 */class Qs{constructor(){this._=void 0}}function Od(r,e,t){return r instanceof Rn?(function(s,i){const a={fields:{[_c]:{stringValue:mc},[gc]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Ks(i)&&(i=Br(i)),i&&(a.fields[pc]=i),{mapValue:a}})(t,e):r instanceof Pn?Ac(r,e):r instanceof xn?Vc(r,e):r instanceof bn?(function(s,i){const a=wc(s,i),o=As(a)+As(s.Re);return qe(a)&&qe(s.Re)?da(o):js(s.serializer,o)})(r,e):r instanceof Vr?(function(s,i){return Lo(s,i,Math.min)})(r,e):r instanceof vr?(function(s,i){return Lo(s,i,Math.max)})(r,e):void 0}function Ld(r,e,t){return r instanceof Pn?Ac(r,e):r instanceof xn?Vc(r,e):t}function wc(r,e){return r instanceof bn?Tt(e)?e:{integerValue:0}:null}class Rn extends Qs{}class Pn extends Qs{constructor(e){super(),this.elements=e}}function Ac(r,e){const t=vc(e);for(const n of r.elements)t.some((s=>ke(s,n)))||t.push(n);return{arrayValue:{values:t}}}class xn extends Qs{constructor(e){super(),this.elements=e}}function Vc(r,e){let t=vc(e);for(const n of r.elements)t=t.filter((s=>!ke(s,n)));return{arrayValue:{values:t}}}class ma extends Qs{constructor(e,t){super(),this.serializer=e,this.Re=t}}class bn extends ma{}class Vr extends ma{}class vr extends ma{}function Lo(r,e,t){if(!Tt(e))return r.Re;const n=t(As(e),As(r.Re));return qe(e)&&qe(r.Re)?da(n):js(r.serializer,n)}function As(r){return z(r.integerValue||r.doubleValue)}function vc(r){return Et(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class Rc{constructor(e,t){this.field=e,this.transform=t}}function Md(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof Pn&&s instanceof Pn||n instanceof xn&&s instanceof xn?gn(n.elements,s.elements,ke):n instanceof bn&&s instanceof bn||n instanceof Vr&&s instanceof Vr||n instanceof vr&&s instanceof vr?ke(n.Re,s.Re):n instanceof Rn&&s instanceof Rn})(r.transform,e.transform)}class Fd{constructor(e,t){this.version=e,this.transformResults=t}}class W{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new W}static exists(e){return new W(void 0,e)}static updateTime(e){return new W(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ls(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class Ws{}function Pc(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Bn(r.key,W.none()):new Un(r.key,r.data,W.none());{const t=r.data,n=ae.empty();let s=new F($.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new it(r.key,n,new Ie(s.toArray()),W.none())}}function Ud(r,e,t){r instanceof Un?(function(s,i,a){const o=s.value.clone(),u=Fo(s.fieldTransforms,i,a.transformResults);o.setAll(u),i.convertToFoundDocument(a.version,o).setHasCommittedMutations()})(r,e,t):r instanceof it?(function(s,i,a){if(!ls(s.precondition,i))return void i.convertToUnknownDocument(a.version);const o=Fo(s.fieldTransforms,i,a.transformResults),u=i.data;u.setAll(xc(s)),u.setAll(o),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()})(r,e,t):(function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()})(0,e,t)}function lr(r,e,t,n){return r instanceof Un?(function(i,a,o,u){if(!ls(i.precondition,a))return o;const c=i.value.clone(),l=Uo(i.fieldTransforms,u,a);return c.setAll(l),a.convertToFoundDocument(a.version,c).setHasLocalMutations(),null})(r,e,t,n):r instanceof it?(function(i,a,o,u){if(!ls(i.precondition,a))return o;const c=Uo(i.fieldTransforms,u,a),l=a.data;return l.setAll(xc(i)),l.setAll(c),a.convertToFoundDocument(a.version,l).setHasLocalMutations(),o===null?null:o.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((h=>h.field)))})(r,e,t,n):(function(i,a,o){return ls(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):o})(r,e,t)}function Bd(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=wc(n.transform,s||null);i!=null&&(t===null&&(t=ae.empty()),t.set(n.field,i))}return t||null}function Mo(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&gn(n,s,((i,a)=>Md(i,a)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Un extends Ws{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class it extends Ws{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function xc(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function Fo(r,e,t){const n=new Map;E(r.length===t.length,32656,{Ie:t.length,Ae:r.length});for(let s=0;s<t.length;s++){const i=r[s],a=i.transform,o=e.data.field(i.field);n.set(i.field,Ld(a,o,t[s]))}return n}function Uo(r,e,t){const n=new Map;for(const s of r){const i=s.transform,a=t.data.field(s.field);n.set(s.field,Od(i,a,e))}return n}class Bn extends Ws{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class _a extends Ws{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Sn{constructor(e,t){this.position=e,this.inclusive=t}}function Bo(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],a=r.position[s];if(i.field.isKeyField()?n=A.comparator(A.fromName(a.referenceValue),t.key):n=_e(a,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function qo(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!ke(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class bc{}class L extends bc{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new qd(e,t,n):t==="array-contains"?new Gd(e,n):t==="in"?new Oc(e,n):t==="not-in"?new Kd(e,n):t==="array-contains-any"?new jd(e,n):new L(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new zd(e,n):new $d(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(_e(t,this.value)):t!==null&&Z(this.value)===Z(t)&&this.matchesComparison(_e(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return V(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class B extends bc{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new B(e,t)}matches(e){return Cn(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Ve!==null||(this.Ve=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function Cn(r){return r.op==="and"}function Ni(r){return r.op==="or"}function pa(r){return Sc(r)&&Cn(r)}function Sc(r){for(const e of r.filters)if(e instanceof B)return!1;return!0}function ki(r){if(r instanceof L)return r.field.canonicalString()+r.op.toString()+vn(r.value);if(pa(r))return r.filters.map((e=>ki(e))).join(",");{const e=r.filters.map((t=>ki(t))).join(",");return`${r.op}(${e})`}}function Cc(r,e){return r instanceof L?(function(n,s){return s instanceof L&&n.op===s.op&&n.field.isEqual(s.field)&&ke(n.value,s.value)})(r,e):r instanceof B?(function(n,s){return s instanceof B&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,a,o)=>i&&Cc(a,s.filters[o])),!0):!1})(r,e):void V(19439)}function Dc(r,e){const t=r.filters.concat(e);return B.create(t,r.op)}function Nc(r){return r instanceof L?(function(t){return`${t.field.canonicalString()} ${t.op} ${vn(t.value)}`})(r):r instanceof B?(function(t){return t.op.toString()+" {"+t.getFilters().map(Nc).join(" ,")+"}"})(r):"Filter"}class qd extends L{constructor(e,t,n){super(e,t,n),this.key=A.fromName(n.referenceValue)}matches(e){const t=A.comparator(e.key,this.key);return this.matchesComparison(t)}}class zd extends L{constructor(e,t){super(e,"in",t),this.keys=kc("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class $d extends L{constructor(e,t){super(e,"not-in",t),this.keys=kc("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function kc(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>A.fromName(n.referenceValue)))}class Gd extends L{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Et(t)&&wr(t.arrayValue,this.value)}}class Oc extends L{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&wr(this.value.arrayValue,t)}}class Kd extends L{constructor(e,t){super(e,"not-in",t)}matches(e){if(wr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!wr(this.value.arrayValue,t)}}class jd extends L{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Et(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>wr(this.value.arrayValue,n)))}}/**
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
 */class Rr{constructor(e,t="asc"){this.field=e,this.dir=t}}function Qd(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class K{constructor(e,t,n,s,i,a,o){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=o}static newInvalidDocument(e){return new K(e,0,P.min(),P.min(),P.min(),ae.empty(),0)}static newFoundDocument(e,t,n,s){return new K(e,1,t,P.min(),n,s,0)}static newNoDocument(e,t){return new K(e,2,t,P.min(),P.min(),ae.empty(),0)}static newUnknownDocument(e,t){return new K(e,3,t,P.min(),P.min(),ae.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(P.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ae.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ae.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=P.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof K&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new K(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Wd{constructor(e,t=null,n=[],s=[],i=null,a=null,o=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=o,this.de=null}}function Oi(r,e=null,t=[],n=[],s=null,i=null,a=null){return new Wd(r,e,t,n,s,i,a)}function Vs(r){const e=v(r);if(e.de===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>ki(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Fr(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>vn(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>vn(n))).join(",")),e.de=t}return e.de}function ga(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!Qd(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!Cc(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!qo(r.startAt,e.startAt)&&qo(r.endAt,e.endAt)}function He(r){return!!r.isCorePipeline}function ya(r){return!!r.path&&A.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function vs(r,e){return r.filters.filter((t=>t instanceof L&&t.field.isEqual(e)))}function zo(r,e,t){let n=Ge,s=!0;for(const i of vs(r,e)){let a=Ge,o=!0;switch(i.op){case"<":case"<=":a=Nd(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,o=!1;break;case"!=":case"not-in":a=Ge}ko({value:n,inclusive:s},{value:a,inclusive:o})<0&&(n=a,s=o)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];ko({value:n,inclusive:s},{value:a,inclusive:t.inclusive})<0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}function $o(r,e,t){let n=mt,s=!0;for(const i of vs(r,e)){let a=mt,o=!0;switch(i.op){case">=":case">":a=kd(i.value),o=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,o=!1;break;case"!=":case"not-in":a=mt}Oo({value:n,inclusive:s},{value:a,inclusive:o})>0&&(n=a,s=o)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const a=t.position[i];Oo({value:n,inclusive:s},{value:a,inclusive:t.inclusive})>0&&(n=a,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
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
 */class qn{constructor(e,t=null,n=[],s=[],i=null,a="F",o=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=o,this.endAt=u,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function Lc(r,e,t,n,s,i,a,o){return new qn(r,e,t,n,s,i,a,o)}function qr(r){return new qn(r)}function Go(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function Hd(r){return A.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Mc(r){return r.collectionGroup!==null}function hr(r){const e=v(r);if(e.fe===null){e.fe=[];const t=new Set;for(const i of e.explicitOrderBy)e.fe.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let o=new F($.comparator);return a.filters.forEach((u=>{u.getFlattenedFilters().forEach((c=>{c.isInequality()&&(o=o.add(c.field))}))})),o})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.fe.push(new Rr(i,n))})),t.has($.keyField().canonicalString())||e.fe.push(new Rr($.keyField(),n))}return e.fe}function xe(r){const e=v(r);return e.me||(e.me=Yd(e,hr(r))),e.me}function Yd(r,e){if(r.limitType==="F")return Oi(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new Rr(s.field,i)}));const t=r.endAt?new Sn(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Sn(r.startAt.position,r.startAt.inclusive):null;return Oi(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function Li(r,e){const t=r.filters.concat([e]);return new qn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Jd(r,e){const t=r.explicitOrderBy.concat([e]);return new qn(r.path,r.collectionGroup,t,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}function Rs(r,e,t){return new qn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function Xd(r,e){return ga(xe(r),xe(e))&&r.limitType===e.limitType}function dr(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>Nc(s))).join(", ")}]`),Fr(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(a){return`${a.field.canonicalString()} (${a.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>vn(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>vn(s))).join(",")),`Target(${n})`})(xe(r))}; limitType=${r.limitType})`}function Hs(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):A.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of hr(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(a,o,u){const c=Bo(a,o,u);return a.inclusive?c<=0:c<0})(n.startAt,hr(n),s)||n.endAt&&!(function(a,o,u){const c=Bo(a,o,u);return a.inclusive?c>=0:c>0})(n.endAt,hr(n),s))})(r,e)}function Ia(r){return(e,t)=>{let n=!1;for(const s of hr(r)){const i=Zd(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function Zd(r,e,t){const n=r.field.isKeyField()?A.comparator(e.key,t.key):(function(i,a,o){const u=a.data.field(i),c=o.data.field(i);return u!==null&&c!==null?_e(u,c):V(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return V(19790,{direction:r.dir})}}/**
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
 */class ef{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var J,M;function Fc(r){switch(r){case p.OK:return V(64938);case p.CANCELLED:case p.UNKNOWN:case p.DEADLINE_EXCEEDED:case p.RESOURCE_EXHAUSTED:case p.INTERNAL:case p.UNAVAILABLE:case p.UNAUTHENTICATED:return!1;case p.INVALID_ARGUMENT:case p.NOT_FOUND:case p.ALREADY_EXISTS:case p.PERMISSION_DENIED:case p.FAILED_PRECONDITION:case p.ABORTED:case p.OUT_OF_RANGE:case p.UNIMPLEMENTED:case p.DATA_LOSS:return!0;default:return V(15467,{code:r})}}function Uc(r){if(r===void 0)return Y("GRPC error has no .code"),p.UNKNOWN;switch(r){case J.OK:return p.OK;case J.CANCELLED:return p.CANCELLED;case J.UNKNOWN:return p.UNKNOWN;case J.DEADLINE_EXCEEDED:return p.DEADLINE_EXCEEDED;case J.RESOURCE_EXHAUSTED:return p.RESOURCE_EXHAUSTED;case J.INTERNAL:return p.INTERNAL;case J.UNAVAILABLE:return p.UNAVAILABLE;case J.UNAUTHENTICATED:return p.UNAUTHENTICATED;case J.INVALID_ARGUMENT:return p.INVALID_ARGUMENT;case J.NOT_FOUND:return p.NOT_FOUND;case J.ALREADY_EXISTS:return p.ALREADY_EXISTS;case J.PERMISSION_DENIED:return p.PERMISSION_DENIED;case J.FAILED_PRECONDITION:return p.FAILED_PRECONDITION;case J.ABORTED:return p.ABORTED;case J.OUT_OF_RANGE:return p.OUT_OF_RANGE;case J.UNIMPLEMENTED:return p.UNIMPLEMENTED;case J.DATA_LOSS:return p.DATA_LOSS;default:return V(39323,{code:r})}}(M=J||(J={}))[M.OK=0]="OK",M[M.CANCELLED=1]="CANCELLED",M[M.UNKNOWN=2]="UNKNOWN",M[M.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",M[M.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",M[M.NOT_FOUND=5]="NOT_FOUND",M[M.ALREADY_EXISTS=6]="ALREADY_EXISTS",M[M.PERMISSION_DENIED=7]="PERMISSION_DENIED",M[M.UNAUTHENTICATED=16]="UNAUTHENTICATED",M[M.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",M[M.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",M[M.ABORTED=10]="ABORTED",M[M.OUT_OF_RANGE=11]="OUT_OF_RANGE",M[M.UNIMPLEMENTED=12]="UNIMPLEMENTED",M[M.INTERNAL=13]="INTERNAL",M[M.UNAVAILABLE=14]="UNAVAILABLE",M[M.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class at{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){St(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return dc(this.inner)}size(){return this.innerSize}}/**
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
 */const tf=new q(A.comparator);function te(){return tf}const Bc=new q(A.comparator);function Ot(...r){let e=Bc;for(const t of r)e=e.insert(t.key,t);return e}function qc(r){let e=Bc;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function Ce(){return fr()}function zc(){return fr()}function fr(){return new at((r=>r.toString()),((r,e)=>r.isEqual(e)))}const nf=new q(A.comparator),rf=new F(A.comparator);function C(...r){let e=rf;for(const t of r)e=e.add(t);return e}const sf=new F(S);function Ta(){return sf}/**
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
 */function af(){return new TextEncoder}/**
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
 */const of=new qt([4294967295,4294967295],0);function Ko(r){const e=af().encode(r),t=new Lh;return t.update(e),new Uint8Array(t.digest())}function jo(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new qt([t,n],0),new qt([s,i],0)]}class Ea{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new nr(`Invalid padding: ${t}`);if(n<0)throw new nr(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new nr(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new nr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=qt.fromNumber(this.ge)}we(e,t,n){let s=e.add(t.multiply(qt.fromNumber(n)));return s.compare(of)===1&&(s=new qt([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=Ko(e),[n,s]=jo(t);for(let i=0;i<this.hashCount;i++){const a=this.we(n,s,i);if(!this.be(a))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Ea(i,s,t);return n.forEach((o=>a.insert(o))),a}insert(e){if(this.ge===0)return;const t=Ko(e),[n,s]=jo(t);for(let i=0;i<this.hashCount;i++){const a=this.we(n,s,i);this.ve(a)}}ve(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class nr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class zn{constructor(e,t,n,s,i,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,zr.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new zn(P.min(),s,new q(S),te(),te(),C())}}class zr{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new zr(n,t,C(),C(),C())}}/**
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
 */class hs{constructor(e,t,n,s){this.Se=e,this.removedTargetIds=t,this.key=n,this.De=s}}class $c{constructor(e,t){this.targetId=e,this.xe=t}}class Gc{constructor(e,t,n=j.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class Qo{constructor(e){this.targetId=e,this.Ce=0,this.Fe=Wo(),this.Oe=j.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return this.Ce!==0}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=C(),t=C(),n=C();return this.Fe.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:V(38017,{changeType:i})}})),new zr(this.Oe,this.Me,e,t,n)}qe(){this.Ne=!1,this.Fe=Wo()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,E(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}const Yn="WatchChangeAggregator";class uf{constructor(e){this.ze=e,this.je=new Map,this.He=te(),this.Je=Zr(),this.Ye=te(),this.Ze=Zr(),this.Xe=new q(S)}et(e){for(const t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(const t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,(t=>{const n=this.je.get(t);if(n)switch(e.state){case 0:this.it(t)&&n.Ue(e.resumeToken);break;case 1:n.Qe(),n.Le||n.qe(),n.Ue(e.resumeToken);break;case 2:n.Qe(),n.Le||this.removeTarget(t);break;case 3:this.it(t)&&(n.Ge(),n.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),n.Ue(e.resumeToken));break;default:V(56790,{state:e.state})}else I(Yn,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach(((n,s)=>{this.it(s)&&t(s)}))}_t(e){var t;return He(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:ya(e)}ot(e){const t=e.targetId,n=e.xe.count,s=this.ut(t);if(s){const i=s.target;if(this._t(i))if(n===0){const a=new A(He(i)?D.fromString(i.getPipelineDocuments()[0]):i.path);this.nt(t,a,K.newNoDocument(a,P.min()))}else E(n===1,20013,"Single document existence filter with count: "+n);else{const a=this.ct(t);if(a!==n){const o=this.lt(e),u=o?this.Et(o,e,a):1;if(u!==0){this.st(t);const c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Xe=this.Xe.insert(t,c)}}}}}lt(e){const t=e.xe.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let a,o;try{a=et(n).toUint8Array()}catch(u){if(u instanceof fc)return Ne("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{o=new Ea(a,s,i)}catch(u){return Ne(u instanceof nr?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return o.ge===0?null:o}Et(e,t,n){return t.xe.count===n-this.Pt(e,t.targetId)?0:2}Pt(e,t){const n=this.ze.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const a=this.ze.Tt(),o=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(o)||(this.nt(t,i,null),s++)})),s}Rt(e){const t=new Map;this.je.forEach(((i,a)=>{const o=this.ut(a);if(o){if(i.current&&this._t(o.target)){const u=He(o.target)?D.fromString(o.target.getPipelineDocuments()[0]):o.target.path,c=new A(u);this.It(c).has(a)||this.At(a,c)||this.nt(a,c,K.newNoDocument(c,e))}i.Be&&(t.set(a,i.ke()),i.qe())}}));let n=C();this.Ze.forEach(((i,a)=>{let o=!0;a.forEachWhile((u=>{const c=this.ut(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(o=!1,!1)})),o&&(n=n.add(i))})),this.He.forEach(((i,a)=>a.setReadTime(e))),this.Ye.forEach(((i,a)=>a.setReadTime(e)));const s=new zn(e,t,this.Xe,this.He,this.Ye,n);return this.He=te(),this.Je=Zr(),this.Ye=te(),this.Ze=Zr(),this.Xe=new q(S),s}tt(e,t){const n=this.je.get(e);if(!n||!this.it(e))return void I(Yn,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.At(e,t.key)?2:0;n.$e(t.key,s),He(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,n){const s=this.je.get(e);s&&this.it(e)?(this.At(e,t)?s.$e(t,1):s.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),n&&(He(this.ut(e).target)&&this.ut(e).target.getPipelineFlavor()!=="exact"?this.Ye=this.Ye.insert(t,n):this.He=this.He.insert(t,n))):I(Yn,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){const t=this.je.get(e);if(!t)return 0;const n=t.ke();return this.ze.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}We(e){let t=this.je.get(e);t||(I(Yn,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Qo(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new F(S),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new F(S),this.Je=this.Je.insert(e,t)),t}it(e){const t=this.ut(e)!==null;return t||I(Yn,"Detected inactive target",e),t}ut(e){const t=this.je.get(e);return t===void 0||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new Qo(e)),this.ze.getRemoteKeysForTarget(e).forEach((t=>{this.nt(e,t,null)}))}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function Zr(){return new q(A.comparator)}function Wo(){return new q(A.comparator)}const cf={asc:"ASCENDING",desc:"DESCENDING"},lf={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},hf={and:"AND",or:"OR"};class df{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Mi(r,e){return r.useProto3Json||Fr(e)?e:{value:e}}function Dn(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function wa(r){const e=Ze(r);return new U(e.seconds,e.nanos)}function Kc(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function ds(r,e){return Dn(r,e.toTimestamp())}function ue(r){return E(!!r,49232),P.fromTimestamp(wa(r))}function Aa(r,e){return Fi(r,e).canonicalString()}function Fi(r,e){const t=(function(s){return new D(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function jc(r){const e=D.fromString(r);return E(nl(e),10190,{key:e.toString()}),e}function Nn(r,e){return Aa(r.databaseId,e.path)}function Ye(r,e){const t=jc(e);if(t.get(1)!==r.databaseId.projectId)throw new T(p.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new T(p.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new A(Hc(t))}function Qc(r,e){return Aa(r.databaseId,e)}function Wc(r){const e=jc(r);return e.length===4?D.emptyPath():Hc(e)}function Ui(r){return new D(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function Hc(r){return E(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function Ho(r,e,t){return{name:Nn(r,e),fields:t.value.mapValue.fields}}function ff(r,e,t){const n=Ye(r,e.name),s=ue(e.updateTime),i=e.createTime?ue(e.createTime):P.min(),a=new ae({mapValue:{fields:e.fields}}),o=K.newFoundDocument(n,s,i,a);return t&&o.setHasCommittedMutations(),t?o.setHasCommittedMutations():o}function mf(r,e){return"found"in e?(function(n,s){E(!!s.found,43571),s.found.name,s.found.updateTime;const i=Ye(n,s.found.name),a=ue(s.found.updateTime),o=s.found.createTime?ue(s.found.createTime):P.min(),u=new ae({mapValue:{fields:s.found.fields}});return K.newFoundDocument(i,a,o,u)})(r,e):"missing"in e?(function(n,s){E(!!s.missing,3894),E(!!s.readTime,22933);const i=Ye(n,s.missing),a=ue(s.readTime);return K.newNoDocument(i,a)})(r,e):V(7234,{result:e})}function _f(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:V(39313,{state:c})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(c,l){return c.useProto3Json?(E(l===void 0||typeof l=="string",58123),j.fromBase64String(l||"")):(E(l===void 0||l instanceof Buffer||l instanceof Uint8Array,16193),j.fromUint8Array(l||new Uint8Array))})(r,e.targetChange.resumeToken),a=e.targetChange.cause,o=a&&(function(c){const l=c.code===void 0?p.UNKNOWN:Uc(c.code);return new T(l,c.message||"")})(a);t=new Gc(n,s,i,o||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=Ye(r,n.document.name),i=ue(n.document.updateTime),a=n.document.createTime?ue(n.document.createTime):P.min(),o=new ae({mapValue:{fields:n.document.fields}}),u=K.newFoundDocument(s,i,a,o),c=n.targetIds||[],l=n.removedTargetIds||[];t=new hs(c,l,u.key,u)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=Ye(r,n.document),i=n.readTime?ue(n.readTime):P.min(),a=K.newNoDocument(s,i),o=n.removedTargetIds||[];t=new hs([],o,a.key,a)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=Ye(r,n.document),i=n.removedTargetIds||[];t=new hs([],i,s,null)}else{if(!("filter"in e))return V(11601,{ft:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new ef(s,i),o=n.targetId;t=new $c(o,a)}}return t}function Pr(r,e){let t;if(e instanceof Un)t={update:Ho(r,e.key,e.value)};else if(e instanceof Bn)t={delete:Nn(r,e.key)};else if(e instanceof it)t={update:Ho(r,e.key,e.data),updateMask:Ef(e.fieldMask)};else{if(!(e instanceof _a))return V(16599,{gt:e.type});t={verify:Nn(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,a){const o=a.transform;if(o instanceof Rn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(o instanceof Pn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:o.elements}};if(o instanceof xn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:o.elements}};if(o instanceof bn)return{fieldPath:a.field.canonicalString(),increment:o.Re};if(o instanceof Vr)return{fieldPath:a.field.canonicalString(),minimum:o.Re};if(o instanceof vr)return{fieldPath:a.field.canonicalString(),maximum:o.Re};throw V(20930,{transform:a.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:ds(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:V(27497)})(r,e.precondition)),t}function Bi(r,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?W.updateTime(ue(i.updateTime)):i.exists!==void 0?W.exists(i.exists):W.none()})(e.currentDocument):W.none(),n=e.updateTransforms?e.updateTransforms.map((s=>(function(a,o){let u=null;if("setToServerValue"in o)E(o.setToServerValue==="REQUEST_TIME",16630,{proto:o}),u=new Rn;else if("appendMissingElements"in o){const l=o.appendMissingElements.values||[];u=new Pn(l)}else if("removeAllFromArray"in o){const l=o.removeAllFromArray.values||[];u=new xn(l)}else"increment"in o?u=new bn(a,o.increment):"minimum"in o?u=new Vr(a,o.minimum):"maximum"in o?u=new vr(a,o.maximum):V(16584,{proto:o});const c=$.fromServerFormat(o.fieldPath);return new Rc(c,u)})(r,s))):[];if(e.update){e.update.name;const s=Ye(r,e.update.name),i=new ae({mapValue:{fields:e.update.fields}});if(e.updateMask){const a=(function(u){const c=u.fieldPaths||[];return new Ie(c.map((l=>$.fromServerFormat(l))))})(e.updateMask);return new it(s,i,a,t,n)}return new Un(s,i,t,n)}if(e.delete){const s=Ye(r,e.delete);return new Bn(s,t)}if(e.verify){const s=Ye(r,e.verify);return new _a(s,t)}return V(1463,{proto:e})}function pf(r,e){return r&&r.length>0?(E(e!==void 0,14353),r.map((t=>(function(s,i){let a=s.updateTime?ue(s.updateTime):ue(i);return a.isEqual(P.min())&&(a=ue(i)),new Fd(a,s.transformResults||[])})(t,e)))):[]}function Yc(r,e){return{documents:[Qc(r,e.path)]}}function Jc(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=Qc(r,s);const i=(function(c){if(c.length!==0)return tl(B.create(c,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const a=(function(c){if(c.length!==0)return c.map((l=>(function(d){return{field:dn(d.field),direction:yf(d.dir)}})(l)))})(e.orderBy);a&&(t.structuredQuery.orderBy=a);const o=Mi(r,e.limit);return o!==null&&(t.structuredQuery.limit=o),e.startAt&&(t.structuredQuery.startAt=(function(c){return{before:c.inclusive,values:c.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(c){return{before:!c.inclusive,values:c.position}})(e.endAt)),{yt:t,parent:s}}function Xc(r){let e=Wc(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){E(n===1,65062);const l=t.from[0];l.allDescendants?s=l.collectionId:e=e.child(l.collectionId)}let i=[];t.where&&(i=(function(h){const d=el(h);return d instanceof B&&pa(d)?d.getFilters():[d]})(t.where));let a=[];t.orderBy&&(a=(function(h){return h.map((d=>(function(y){return new Rr(fn(y.field),(function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(y.direction))})(d)))})(t.orderBy));let o=null;t.limit&&(o=(function(h){let d;return d=typeof h=="object"?h.value:h,Fr(d)?null:d})(t.limit));let u=null;t.startAt&&(u=(function(h){const d=!!h.before,_=h.values||[];return new Sn(_,d)})(t.startAt));let c=null;return t.endAt&&(c=(function(h){const d=!h.before,_=h.values||[];return new Sn(_,d)})(t.endAt)),Lc(e,s,a,i,o,"F",u,c)}function gf(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return V(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Zc(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function el(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=fn(t.unaryFilter.field);return L.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=fn(t.unaryFilter.field);return L.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=fn(t.unaryFilter.field);return L.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=fn(t.unaryFilter.field);return L.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return V(61313);default:return V(60726)}})(r):r.fieldFilter!==void 0?(function(t){return L.create(fn(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return V(58110);default:return V(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return B.create(t.compositeFilter.filters.map((n=>el(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return V(1026)}})(t.compositeFilter.op))})(r):V(30097,{filter:r})}function yf(r){return cf[r]}function If(r){return lf[r]}function Tf(r){return hf[r]}function dn(r){return{fieldPath:r.canonicalString()}}function fn(r){return $.fromServerFormat(r.fieldPath)}function tl(r){return r instanceof L?(function(t){if(t.op==="=="){if(we(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NAN"}};if(Re(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(we(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NOT_NAN"}};if(Re(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:dn(t.field),op:If(t.op),value:t.value}}})(r):r instanceof B?(function(t){const n=t.getFilters().map((s=>tl(s)));return n.length===1?n[0]:{compositeFilter:{op:Tf(t.op),filters:n}}})(r):V(54877,{filter:r})}function Ef(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function nl(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function rl(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function xr(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function sl(r){return{stringValue:r}}/**
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
 */function Ys(r){return new df(r,!0)}/**
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
 */class ve{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ve(j.fromBase64String(e))}catch(t){throw new T(p.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new ve(j.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:ve._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Mr(e,ve._jsonSchema))return ve.fromBase64String(e.bytes)}}ve._jsonSchemaVersion="firestore/bytes/1.0",ve._jsonSchema={type:X("string",ve._jsonSchemaVersion),bytes:X("string")};/**
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
 */class $r{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new T(p.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new $(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function wf(){return new $r(Ue)}/**
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
 */class Js{constructor(e){this._methodName=e}}/**
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
 */class Ke{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new T(p.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new T(p.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return S(this._lat,e._lat)||S(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Ke._jsonSchemaVersion}}static fromJSON(e){if(Mr(e,Ke._jsonSchema))return new Ke(e.latitude,e.longitude)}}function il(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */Ke._jsonSchemaVersion="firestore/geoPoint/1.0",Ke._jsonSchema={type:X("string",Ke._jsonSchemaVersion),latitude:X("number"),longitude:X("number")};class Af{bt(e){}shutdown(){}}/**
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
 */const Yo="ConnectivityMonitor";class Jo{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){I(Yo,"Network connectivity changed: AVAILABLE");for(const e of this.Ct)e(0)}xt(){I(Yo,"Network connectivity changed: UNAVAILABLE");for(const e of this.Ct)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let es=null;function qi(){return es===null?es=(function(){return 268435456+Math.round(2147483648*Math.random())})():es++,"0x"+es.toString(16)}/**
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
 */const pi="RestConnection",Vf={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class vf{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${n}/databases/${s}`,this.Lt=this.databaseId.database===Er?`project_id=${n}`:`project_id=${n}&database_id=${s}`}Bt(e,t,n,s,i){const a=qi(),o=this.Ut(e,t.toUriEncodedString());I(pi,`Sending RPC '${e}' ${a}:`,o,n);const u={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(u,s,i);const{host:c}=new URL(o),l=ea(c);return this.qt(e,o,u,n,l).then((h=>(I(pi,`Received RPC '${e}' ${a}: `,h),h)),(h=>{throw Ne(pi,`RPC '${e}' ${a} failed with error: `,h,"url: ",o,"request:",n),h}))}$t(e,t,n,s,i,a){return this.Bt(e,t,n,s,i)}kt(e,t,n){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Fn})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s))}Ut(e,t){const n=Vf[e];let s=`${this.Mt}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class Rf{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
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
 */const he="WebChannelConnection",Jn=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class pn extends vf{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!pn.sn){const e=bh();Jn(e,Sh.STAT_EVENT,(t=>{t.stat===To.PROXY?I(he,"STAT_EVENT: detected buffering proxy"):t.stat===To.NOPROXY&&I(he,"STAT_EVENT: detected no buffering proxy")})),pn.sn=!0}}qt(e,t,n,s,i){const a=qi();return new Promise(((o,u)=>{const c=new Ch;c.setWithCredentials(!0),c.listenOnce(Dh.COMPLETE,(()=>{try{switch(c.getLastErrorCode()){case mi.NO_ERROR:const h=c.getResponseJson();I(he,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(h)),o(h);break;case mi.TIMEOUT:I(he,`RPC '${e}' ${a} timed out`),u(new T(p.DEADLINE_EXCEEDED,"Request time out"));break;case mi.HTTP_ERROR:const d=c.getStatus();if(I(he,`RPC '${e}' ${a} failed with status:`,d,"response text:",c.getResponseText()),d>0){let _=c.getResponseJson();Array.isArray(_)&&(_=_[0]);const y=_==null?void 0:_.error;if(y&&y.status&&y.message){const R=(function(k){const N=k.toLowerCase().replace(/_/g,"-");return Object.values(p).indexOf(N)>=0?N:p.UNKNOWN})(y.status);u(new T(R,y.message))}else u(new T(p.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new T(p.UNAVAILABLE,"Connection failed."));break;default:V(9055,{_n:e,streamId:a,an:c.getLastErrorCode(),un:c.getLastError()})}}finally{I(he,`RPC '${e}' ${a} completed.`)}}));const l=JSON.stringify(s);I(he,`RPC '${e}' ${a} sending request:`,s),c.send(t,"POST",l,n,15)}))}cn(e,t,n){const s=qi(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),o={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(o.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(o.useFetchStreams=!0),this.kt(o.initMessageHeaders,t,n),o.encodeInitMessageHeaders=!0;const c=i.join("");I(he,`Creating RPC '${e}' stream ${s}: ${c}`,o);const l=a.createWebChannel(c,o);this.En(l);let h=!1,d=!1;const _=new Rf({Kt:y=>{d?I(he,`Not sending because RPC '${e}' stream ${s} is closed:`,y):(h||(I(he,`Opening RPC '${e}' stream ${s} transport.`),l.open(),h=!0),I(he,`RPC '${e}' stream ${s} sending:`,y),l.send(y))},Wt:()=>l.close()});return Jn(l,Jr.EventType.OPEN,(()=>{d||(I(he,`RPC '${e}' stream ${s} transport opened.`),_.Zt())})),Jn(l,Jr.EventType.CLOSE,(()=>{d||(d=!0,I(he,`RPC '${e}' stream ${s} transport closed`),_.en(),this.hn(l))})),Jn(l,Jr.EventType.ERROR,(y=>{d||(d=!0,Ne(he,`RPC '${e}' stream ${s} transport errored. Name:`,y.name,"Message:",y.message),_.en(new T(p.UNAVAILABLE,"The operation could not be completed")))})),Jn(l,Jr.EventType.MESSAGE,(y=>{var R;if(!d){const x=y.data[0];E(!!x,16349);const k=x,N=(k==null?void 0:k.error)||((R=k[0])==null?void 0:R.error);if(N){I(he,`RPC '${e}' stream ${s} received error:`,N);const O=N.status;let re=(function(ge){const ut=J[ge];if(ut!==void 0)return Uc(ut)})(O),G=N.message;O==="NOT_FOUND"&&G.includes("database")&&G.includes("does not exist")&&G.includes(this.databaseId.database)&&Ne(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),re===void 0&&(re=p.INTERNAL,G="Unknown error status: "+O+" with message "+N.message),d=!0,_.en(new T(re,G)),l.close()}else I(he,`RPC '${e}' stream ${s} received:`,x),_.tn(x)}})),pn.rn(),setTimeout((()=>{_.Xt()}),0),_}terminate(){this.nn.forEach((e=>e.close())),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter((t=>t===e))}kt(e,t,n){super.kt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Nh()}}/**
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
 */function Pf(r){return new pn(r)}pn.sn=!1;class Va{constructor(e,t,n=1e3,s=1.5,i=6e4){this.Tn=e,this.timerId=t,this.Pn=n,this.Rn=s,this.In=i,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();const t=Math.floor(this.An+this.pn()),n=Math.max(0,Date.now()-this.dn),s=Math.max(0,t-n);s>0&&I("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,s,(()=>(this.dn=Date.now(),e()))),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){this.Vn!==null&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){this.Vn!==null&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
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
 */const Xo="PersistentStream";class al{constructor(e,t,n,s,i,a,o,u){this.Tn=e,this.yn=n,this.wn=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=o,this.listener=u,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new Va(e,t)}Cn(){return this.state===1||this.state===5||this.Fn()}Fn(){return this.state===2||this.state===3}start(){this.Dn=0,this.state!==4?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&this.vn===null&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,(()=>this.Ln())))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,e!==4?this.xn.reset():t&&t.code===p.RESOURCE_EXHAUSTED?(Y(t.toString()),Y("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===p.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;const e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.bn===t&&this.Kn(n,s)}),(n=>{e((()=>{const s=new T(p.UNKNOWN,"Fetching auth token failed: "+n.message);return this.Wn(s)}))}))}Kn(e,t){const n=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt((()=>{n((()=>this.listener.Qt()))})),this.stream.zt((()=>{n((()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,(()=>(this.Fn()&&(this.state=3),Promise.resolve()))),this.listener.zt())))})),this.stream.Ht((s=>{n((()=>this.Wn(s)))})),this.stream.onMessage((s=>{n((()=>++this.Dn==1?this.Gn(s):this.onNext(s)))}))}On(){this.state=5,this.xn.mn((async()=>{this.state=0,this.start()}))}Wn(e){return I(Xo,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget((()=>this.bn===e?t():(I(Xo,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class xf extends al{constructor(e,t,n,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();const t=_f(this.serializer,e),n=(function(i){if(!("targetChange"in i))return P.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?P.min():a.readTime?ue(a.readTime):P.min()})(e);return this.listener.zn(t,n)}jn(e){const t={};t.database=Ui(this.serializer),t.addTarget=(function(i,a){let o;const u=a.target;if(o=He(u)?{pipelineQuery:Zc(i,u)}:ya(u)?{documents:Yc(i,u)}:{query:Jc(i,u).yt},o.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){o.resumeToken=Kc(i,a.resumeToken);const c=Mi(i,a.expectedCount);c!==null&&(o.expectedCount=c)}else if(a.snapshotVersion.compareTo(P.min())>0){o.readTime=Dn(i,a.snapshotVersion.toTimestamp());const c=Mi(i,a.expectedCount);c!==null&&(o.expectedCount=c)}return o})(this.serializer,e);const n=gf(this.serializer,e);n&&(t.labels=n),this.Bn(t)}Hn(e){const t={};t.database=Ui(this.serializer),t.removeTarget=e,this.Bn(t)}}class bf extends al{constructor(e,t,n,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,a),this.serializer=i}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return E(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,E(!e.writeResults||e.writeResults.length===0,55816),this.listener.Zn()}onNext(e){E(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();const t=pf(e.writeResults,e.commitTime),n=ue(e.commitTime);return this.listener.Xn(n,t)}er(){const e={};e.database=Ui(this.serializer),this.Bn(e)}Yn(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>Pr(this.serializer,n)))};this.Bn(t)}}/**
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
 */class Sf{}class Cf extends Sf{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.tr=!1}nr(){if(this.tr)throw new T(p.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,n,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,a])=>this.connection.Bt(e,Fi(t,n),s,i,a))).catch((i=>{throw i.name==="FirebaseError"?(i.code===p.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new T(p.UNKNOWN,i.toString())}))}$t(e,t,n,s,i){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([a,o])=>this.connection.$t(e,Fi(t,n),s,a,o,i))).catch((a=>{throw a.name==="FirebaseError"?(a.code===p.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new T(p.UNKNOWN,a.toString())}))}terminate(){this.tr=!0,this.connection.terminate()}}function Df(r,e,t,n){return new Cf(r,e,t,n)}/**
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
 */const Nf="ComponentProvider",Zo=new Map;function kf(r,e,t,n,s){return new Cd(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,il(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n)}/**
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
 */const eu={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ol=41943040;class de{static withCacheSize(e){return new de(e,de.DEFAULT_COLLECTION_PERCENTILE,de.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}de.DEFAULT_COLLECTION_PERCENTILE=10,de.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,de.DEFAULT=new de(ol,de.DEFAULT_COLLECTION_PERCENTILE,de.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),de.DISABLED=new de(-1,0,0);/**
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
 */const tu="LruGarbageCollector",ul=1048576;function nu([r,e],[t,n]){const s=S(r,t);return s===0?S(e,n):s}class Of{constructor(e){this.rr=e,this.buffer=new F(nu),this.ir=0}sr(){return++this.ir}_r(e){const t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();nu(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class cl{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return this.ar!==null}ur(e){I(tu,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){bt(t)?I(tu,"Ignoring IndexedDB error during garbage collection: ",t):await xt(t)}await this.ur(3e5)}))}}class Lf{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return m.resolve(ye.ce);const n=new Of(t);return this.cr.forEachTarget(e,(s=>n._r(s.sequenceNumber))).next((()=>this.cr.Er(e,(s=>n._r(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.cr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(I("LruGarbageCollector","Garbage collection skipped; disabled"),m.resolve(eu)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(I("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),eu):this.hr(e,t)))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let n,s,i,a,o,u,c;const l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((h=>(h>this.params.maximumSequenceNumbersToCollect?(I("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${h}`),s=this.params.maximumSequenceNumbersToCollect):s=h,a=Date.now(),this.nthSequenceNumber(e,s)))).next((h=>(n=h,o=Date.now(),this.removeTargets(e,n,t)))).next((h=>(i=h,u=Date.now(),this.removeOrphanedDocuments(e,n)))).next((h=>(c=Date.now(),hn()<=We.DEBUG&&I("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-l}ms
	Determined least recently used ${s} in `+(o-a)+`ms
	Removed ${i} targets in `+(u-o)+`ms
	Removed ${h} documents in `+(c-u)+`ms
Total Duration: ${c-l}ms`),m.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:h}))))}}function ll(r,e){return new Lf(r,e)}/**
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
 */const hl="firestore.googleapis.com",ru=!0;class su{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new T(p.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=hl,this.ssl=ru}else this.host=e.host,this.ssl=e.ssl??ru;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=ol;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<ul)throw new T(p.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Jh("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=il(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new T(p.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Xs{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new su({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new T(p.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new T(p.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new su(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new qh;switch(n.type){case"firstParty":return new Kh(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new T(p.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=Zo.get(t);n&&(I(Nf,"Removing Datastore"),Zo.delete(t),n.terminate())})(this),Promise.resolve()}}function Mf(r,e,t,n={}){var c;r=Pe(r,Xs);const s=ea(e),i=r._getSettings(),a={...i,emulatorOptions:r._getEmulatorOptions()},o=`${e}:${t}`;s&&$u(`https://${o}`),i.host!==hl&&i.host!==o&&Ne("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...i,host:o,ssl:s,emulatorOptions:n};if(!zu(u,a)&&(r._setSettings(u),n.mockUserToken)){let l,h;if(typeof n.mockUserToken=="string")l=n.mockUserToken,h=ie.MOCK_USER;else{l=xh(n.mockUserToken,(c=r._app)==null?void 0:c.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new T(p.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");h=new ie(d)}r._authCredentials=new zh(new Qu(l,h))}}/**
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
 */class ot{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new ot(this.firestore,e,this._query)}}class Q{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gt(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Q(this.firestore,e,this._key)}toJSON(){return{type:Q._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(Mr(t,Q._jsonSchema))return new Q(e,n||null,new A(D.fromString(t.referencePath)))}}Q._jsonSchemaVersion="firestore/documentReference/1.0",Q._jsonSchema={type:X("string",Q._jsonSchemaVersion),referencePath:X("string")};class gt extends ot{constructor(e,t,n){super(e,t,qr(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Q(this.firestore,null,new A(e))}withConverter(e){return new gt(this.firestore,e,this._path)}}function ug(r,e,...t){if(r=De(r),Hu("collection","path",e),r instanceof Xs){const n=D.fromString(e,...t);return Vo(n),new gt(r,null,n)}{if(!(r instanceof Q||r instanceof gt))throw new T(p.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(D.fromString(e,...t));return Vo(n),new gt(r.firestore,null,n)}}function cg(r,e,...t){if(r=De(r),arguments.length===1&&(e=ra.newId()),Hu("doc","path",e),r instanceof Xs){const n=D.fromString(e,...t);return Ao(n),new Q(r,null,new A(n))}{if(!(r instanceof Q||r instanceof gt))throw new T(p.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(D.fromString(e,...t));return Ao(n),new Q(r.firestore,r instanceof gt?r.converter:null,new A(n))}}/**
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
 */class Te{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Te._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Mr(e,Te._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Te(e.vectorValues);throw new T(p.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Te._jsonSchemaVersion="firestore/vectorValue/1.0",Te._jsonSchema={type:X("string",Te._jsonSchemaVersion),vectorValues:X("object")};/**
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
 */const Ff=/^__.*__$/;class Uf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new it(e,this.data,this.fieldMask,t,this.fieldTransforms):new Un(e,this.data,t,this.fieldTransforms)}}class dl{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new it(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function fl(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw V(40011,{dataSource:r})}}class va{constructor(e,t,n,s,i,a){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new va({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Ps(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(fl(this.dataSource)&&Ff.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class Bf{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Ys(e)}createContext(e,t,n,s=!1){return new va({dataSource:e,methodName:t,targetDoc:n,path:$.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Zs(r){const e=r._freezeSettings(),t=Ys(r._databaseId);return new Bf(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Ra(r,e,t,n,s,i={}){const a=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);xa("Data must be an object, but it was:",a,n);const o=pl(n,a);let u,c;if(i.merge)u=new Ie(a.fieldMask),c=a.fieldTransforms;else if(i.mergeFields){const l=[];for(const h of i.mergeFields){const d=tt(e,h,t);if(!a.contains(d))throw new T(p.INVALID_ARGUMENT,`Field '${d}' is specified in your field mask but missing from your input data.`);Il(l,d)||l.push(d)}u=new Ie(l),c=a.fieldTransforms.filter((h=>u.covers(h.field)))}else u=null,c=a.fieldTransforms;return new Uf(new ae(o),u,c)}class ei extends Js{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof ei}}class Pa extends Js{_toFieldTransform(e){return new Rc(e.path,new Rn)}isEqual(e){return e instanceof Pa}}function ml(r,e,t,n){const s=r.createContext(1,e,t);xa("Data must be an object, but it was:",s,n);const i=[],a=ae.empty();St(n,((u,c)=>{const l=yl(e,u,t);c=De(c);const h=s.childContextForFieldPath(l);if(c instanceof ei)i.push(l);else{const d=wt(c,h);d!=null&&(i.push(l),a.set(l,d))}}));const o=new Ie(i);return new dl(a,o,s.fieldTransforms)}function _l(r,e,t,n,s,i){const a=r.createContext(1,e,t),o=[tt(e,n,t)],u=[s];if(i.length%2!=0)throw new T(p.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)o.push(tt(e,i[d])),u.push(i[d+1]);const c=[],l=ae.empty();for(let d=o.length-1;d>=0;--d)if(!Il(c,o[d])){const _=o[d];let y=u[d];y=De(y);const R=a.childContextForFieldPath(_);if(y instanceof ei)c.push(_);else{const x=wt(y,R);x!=null&&(c.push(_),l.set(_,x))}}const h=new Ie(c);return new dl(l,h,a.fieldTransforms)}function qf(r,e,t,n=!1){return wt(t,r.createContext(n?4:3,e))}function wt(r,e,t){if(gl(r=De(r)))return xa("Unsupported field value:",e,r),pl(r,e);if(r instanceof Js)return(function(s,i){if(!fl(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const a=s._toFieldTransform(i);a&&i.fieldTransforms.push(a)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const a=[];let o=0;for(const u of s){let c=wt(u,i.childContextForArray(o));c==null&&(c={nullValue:"NULL_VALUE"}),a.push(c),o++}return{arrayValue:{values:a}}})(r,e)}return(function(s,i,a){if((s=De(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return fa(i.serializer,s,a);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const o=U.fromDate(s);return{timestampValue:Dn(i.serializer,o)}}if(s instanceof U){const o=new U(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Dn(i.serializer,o)}}if(s instanceof Ke)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof ve)return{bytesValue:Kc(i.serializer,s._byteString)};if(s instanceof Q){const o=i.databaseId,u=s.firestore._databaseId;if(!u.isEqual(o))throw i.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:Aa(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof Te)return(function(u,c){const l=u instanceof Te?u.toArray():u;return{mapValue:{fields:{[la]:{stringValue:ha},[Ht]:{arrayValue:{values:l.map((d=>{if(typeof d!="number")throw c.createError("VectorValues must only contain numeric values.");return js(c.serializer,d)}))}}}}}})(s,i);if(rl(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Bs(s)}`)})(r,e,t)}function pl(r,e){const t={};return dc(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):St(r,((n,s)=>{const i=wt(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function gl(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof U||r instanceof Ke||r instanceof ve||r instanceof Q||r instanceof Js||r instanceof Te||rl(r))}function xa(r,e,t){if(!gl(t)||!Lr(t)){const n=Bs(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function tt(r,e,t){if((e=De(e))instanceof $r)return e._internalPath;if(typeof e=="string")return yl(r,e);throw Ps("Field path arguments must be of type string or ",r,!1,void 0,t)}const zf=new RegExp("[~\\*/\\[\\]]");function yl(r,e,t){if(e.search(zf)>=0)throw Ps(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new $r(...e.split("."))._internalPath}catch{throw Ps(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Ps(r,e,t,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let o=`Function ${e}() called with invalid data`;t&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${n}`),a&&(u+=` in document ${s}`),u+=")"),new T(p.INVALID_ARGUMENT,o+r+u)}function Il(r,e){return r.some((t=>t.isEqual(e)))}function Tl(r){return typeof r._readUserData=="function"}/**
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
 */class pe{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=ae.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const a=e[s];let o;i.nestedOptions&&Lr(a)?o={mapValue:{fields:new pe(i.nestedOptions).getOptionsProto(t,a)}}:a&&(o=wt(a,t)??void 0),o&&n.set($.fromServerFormat(i.serverName),o)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(bd(n,((a,o)=>[$.fromServerFormat(o),a!==void 0?wt(a,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function $f(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Lr(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}function lg(){return new Pa("serverTimestamp")}function Gf(r){return new Te(r)}/**
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
 */function w(r){let e;return r instanceof Zt?r:(e=Lr(r)?Hf(r):r instanceof Array?Yf(r):El(r,void 0),e)}function gi(r){if(r instanceof Zt)return r;if(r instanceof Te)return br(r);if(Array.isArray(r))return br(Gf(r));throw new Error("Unsupported value: "+typeof r)}function ba(r){return nd(r)?fs(r):w(r)}class Zt{constructor(){this._protoValueType="ProtoValue"}add(e){return new g("add",[this,w(e)],"add")}asBoolean(){if(this instanceof At)return this;if(this instanceof tn)return new Al(this);if(this instanceof en)return new Wf(this);if(this instanceof g)return new wl(this);throw new T("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new g("subtract",[this,w(e)],"subtract")}multiply(e){return new g("multiply",[this,w(e)],"multiply")}divide(e){return new g("divide",[this,w(e)],"divide")}mod(e){return new g("mod",[this,w(e)],"mod")}equal(e){return new g("equal",[this,w(e)],"equal").asBoolean()}notEqual(e){return new g("not_equal",[this,w(e)],"notEqual").asBoolean()}lessThan(e){return new g("less_than",[this,w(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new g("less_than_or_equal",[this,w(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new g("greater_than",[this,w(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new g("greater_than_or_equal",[this,w(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>w(s)));return new g("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new g("array_contains",[this,w(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new rr(e.map(w),"arrayContainsAll"):e;return new g("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new rr(e.map(w),"arrayContainsAny"):e;return new g("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new g("array_reverse",[this])}arrayLength(){return new g("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new rr(e.map(w),"equalAny"):e;return new g("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new rr(e.map(w),"notEqualAny"):e;return new g("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new g("exists",[this],"exists").asBoolean()}charLength(){return new g("char_length",[this],"charLength")}like(e){return new g("like",[this,w(e)],"like").asBoolean()}regexContains(e){return new g("regex_contains",[this,w(e)],"regexContains").asBoolean()}regexFind(e){return new g("regex_find",[this,w(e)],"regexFind")}regexFindAll(e){return new g("regex_find_all",[this,w(e)],"regexFindAll")}regexMatch(e){return new g("regex_match",[this,w(e)],"regexMatch").asBoolean()}stringContains(e){return new g("string_contains",[this,w(e)],"stringContains").asBoolean()}startsWith(e){return new g("starts_with",[this,w(e)],"startsWith").asBoolean()}endsWith(e){return new g("ends_with",[this,w(e)],"endsWith").asBoolean()}toLower(){return new g("to_lower",[this],"toLower")}toUpper(){return new g("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(w(e)),new g("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(w(e)),new g("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(w(e)),new g("rtrim",t,"rtrim")}type(){return new g("type",[this])}isType(e){return new g("is_type",[this,br(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(w);return new g("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new g("string_index_of",[this,w(e)],"stringIndexOf")}stringRepeat(e){return new g("string_repeat",[this,w(e)],"stringRepeat")}stringReplaceAll(e,t){return new g("string_replace_all",[this,w(e),w(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new g("string_replace_one",[this,w(e),w(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(w);return new g("concat",[this,...n],"concat")}reverse(){return new g("reverse",[this],"reverse")}arrayFilter(e,t){return new g("array_filter",[this,w(e),t],"arrayFilter")}arrayTransform(e,t){return new g("array_transform",[this,w(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new g("array_transform",[this,w(e),w(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,w(e)];return t!==void 0&&n.push(w(t)),new g("array_slice",n,"arraySlice")}arrayFirst(){return new g("array_first",[this],"arrayFirst")}arrayFirstN(e){return new g("array_first_n",[this,w(e)],"arrayFirstN")}arrayLast(){return new g("array_last",[this],"arrayLast")}arrayLastN(e){return new g("array_last_n",[this,w(e)],"arrayLastN")}arrayMaximum(){return new g("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new g("maximum_n",[this,w(e)],"arrayMaximumN")}arrayMinimum(){return new g("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new g("minimum_n",[this,w(e)],"arrayMinimumN")}arrayIndexOf(e){return new g("array_index_of",[this,w(e),w("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new g("array_index_of",[this,w(e),w("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new g("array_index_of_all",[this,w(e)],"arrayIndexOfAll")}byteLength(){return new g("byte_length",[this],"byteLength")}ceil(){return new g("ceil",[this])}floor(){return new g("floor",[this])}abs(){return new g("abs",[this])}exp(){return new g("exp",[this])}mapGet(e){return new g("map_get",[this,br(e)],"mapGet")}mapSet(e,t,...n){const s=[this,w(e),w(t),...n.map(w)];return new g("map_set",s,"mapSet")}mapKeys(){return new g("map_keys",[this],"mapKeys")}mapValues(){return new g("map_values",[this],"mapValues")}mapEntries(){return new g("map_entries",[this],"mapEntries")}getField(e){return new g("get_field",[this,w(e)],"get_field")}count(){return Ae._create("count",[this],"count")}sum(){return Ae._create("sum",[this],"sum")}average(){return Ae._create("average",[this],"average")}minimum(){return Ae._create("minimum",[this],"minimum")}maximum(){return Ae._create("maximum",[this],"maximum")}first(){return Ae._create("first",[this],"first")}last(){return Ae._create("last",[this],"last")}arrayAgg(){return Ae._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Ae._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Ae._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new g("maximum",[this,...n.map(w)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new g("minimum",[this,...n.map(w)],"minimum")}vectorLength(){return new g("vector_length",[this],"vectorLength")}cosineDistance(e){return new g("cosine_distance",[this,gi(e)],"cosineDistance")}dotProduct(e){return new g("dot_product",[this,gi(e)],"dotProduct")}euclideanDistance(e){return new g("euclidean_distance",[this,gi(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new g("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new g("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new g("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new g("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new g("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new g("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new g("timestamp_add",[this,w(e),w(t)],"timestampAdd")}timestampSubtract(e,t){return new g("timestamp_subtract",[this,w(e),w(t)],"timestampSubtract")}timestampDiff(e,t){return new g("timestamp_diff",[this,ba(e),w(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,w(e)];return t&&n.push(w(t)),new g("timestamp_extract",n,"timestampExtract")}documentId(){return new g("document_id",[this],"documentId")}parent(){return new g("parent",[this],"parent")}substring(e,t){const n=w(e);return new g("substring",t===void 0?[this,n]:[this,n,w(t)],"substring")}arrayGet(e){return new g("array_get",[this,w(e)],"arrayGet")}isError(){return new g("is_error",[this],"isError").asBoolean()}ifError(e){const t=new g("if_error",[this,w(e)],"ifError");return e instanceof At?t.asBoolean():t}isAbsent(){return new g("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new g("map_remove",[this,w(e)],"mapRemove")}mapMerge(e,...t){const n=w(e),s=t.map(w);return new g("map_merge",[this,n,...s],"mapMerge")}pow(e){return new g("pow",[this,w(e)])}trunc(e){return e===void 0?new g("trunc",[this]):new g("trunc",[this,w(e)],"trunc")}round(e){return e===void 0?new g("round",[this]):new g("round",[this,w(e)],"round")}collectionId(){return new g("collection_id",[this])}length(){return new g("length",[this])}ln(){return new g("ln",[this])}sqrt(){return new g("sqrt",[this])}stringReverse(){return new g("string_reverse",[this])}ifAbsent(e){return new g("if_absent",[this,w(e)],"ifAbsent")}ifNull(e){return new g("if_null",[this,w(e)],"ifNull")}coalesce(e,...t){return new g("coalesce",[this,w(e),...t.map(w)],"coalesce")}join(e){return new g("join",[this,w(e)],"join")}log10(){return new g("log10",[this])}arraySum(){return new g("sum",[this])}split(e){return new g("split",[this,w(e)])}timestampTruncate(e,t){const n=[this,w(e)];return t&&n.push(w(t)),new g("timestamp_trunc",n)}ascending(){return Jf(this)}descending(){return Xf(this)}as(e){return new jf(this,e,"as")}}class Ae{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new Ae(e,t);return s._methodName=n,s}as(e){return new Kf(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class Kf{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class jf{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class rr extends Zt{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map((t=>t._toProto(e)))}}}_readUserData(e){this.Rr.forEach((t=>t._readUserData(e)))}}class en extends Zt{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new g("geo_distance",[this,w(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function fs(r){return Qf(r,"field")}function Qf(r,e){return new en(typeof r=="string"?Ue===r?wf()._internalPath:tt("field",r):r._internalPath,e)}class tn extends Zt{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new tn(e,void 0);return t._protoValue=e,t}_toProto(e){return E(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,$f(this._protoValue)||(this._protoValue=wt(this.value,e))}}function br(r,e){return El(r,"constant")}function El(r,e){const t=new tn(r,e);return typeof r=="boolean"?new Al(t):t}class g extends Zt{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new pe({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class At extends Zt{get _methodName(){return this._expr._methodName}countIf(){return Ae._create("count_if",[this],"countIf")}not(){return new g("not",[this],"not").asBoolean()}conditional(e,t){return new g("conditional",[this,e,t],"conditional")}ifError(e){const t=w(e),n=new g("if_error",[this,t],"ifError");return t instanceof At?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class wl extends At{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Al extends At{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Wf extends At{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function Hf(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(br(n)),t.push(w(s))}return new g("map",t,"map")}function Yf(r){return(function(t,n){return new g("array",t.map((s=>w(s))),n)})(r,"array")}function Jf(r){return new Sa(ba(r),"ascending","ascending")}function Xf(r){return new Sa(ba(r),"descending","descending")}class Sa{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:sl(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class Se{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Vl extends Se{get _name(){return"add_fields"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[xr(e,this.fields)]}}_readUserData(e){super._readUserData(e),vt(this.fields,e)}}class vl extends Se{get _name(){return"aggregate"}get _optionsUtil(){return new pe({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[xr(e,this.accumulators),xr(e,this.groups)]}}_readUserData(e){super._readUserData(e),vt(this.groups,e),vt(this.accumulators,e)}}class Rl extends Se{get _name(){return"distinct"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[xr(e,this.groups)]}}_readUserData(e){super._readUserData(e),vt(this.groups,e)}}class Gr extends Se{get _name(){return"collection"}get _optionsUtil(){return new pe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class Kr extends Se{get _name(){return"collection_group"}get _optionsUtil(){return new pe({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class ti extends Se{get _name(){return"database"}get _optionsUtil(){return new pe({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class ni extends Se{get _name(){return"documents"}get _optionsUtil(){return new pe({})}constructor(e,t){if(super(t),!e||e.length===0)throw new T(p.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new T(p.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=n,this.mr=s}_toProto(e){return{...super._toProto(e),args:this.dr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class jr extends Se{get _name(){return"where"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),vt(this.condition,e)}}class Vt extends Se{get _name(){return"limit"}get _optionsUtil(){return new pe({})}constructor(e,t){E(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[fa(e,this.limit)]}}}class iu extends Se{get _name(){return"offset"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[fa(e,this.offset)]}}}class Zf extends Se{get _name(){return"select"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[xr(e,this.selections)]}}_readUserData(e){super._readUserData(e),vt(this.selections,e)}}class ze extends Se{get _name(){return"sort"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),vt(this.orderings,e)}}class Ca extends Se{get _name(){return"replace_with"}get _optionsUtil(){return new pe({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),sl(Ca.pr)]}}_readUserData(e){super._readUserData(e),vt(this.map,e)}}Ca.pr="full_replace";function vt(r,e){return Tl(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}// Copyright 2024 Google LLC* @license
class fe{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Qr(this)}getPipelineCollectionGroup(){return Da(this)}getPipelineCollectionId(){return Pl(this)}getPipelineDocuments(){return xs(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==Rl.name&&s._name!==vl.name||(n="keyless"),s._name===Zf.name&&n==="exact"&&(n="augmented"),s._name===Vl.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return Je(this)}}function Je(r){const e=r.stages[0];return e instanceof Gr||e instanceof Kr||e instanceof ti||e instanceof ni?e._name:"unknown"}function Qr(r){if(Je(r)==="collection")return r.stages[0].Vr}function Da(r){if(Je(r)==="collection_group")return r.stages[0].collectionId}function Pl(r){switch(Je(r)){case"collection":return D.fromString(Qr(r)).lastSegment();case"collection_group":return Da(r);default:return}}function xs(r){if(Je(r)==="documents")return r.stages[0].dr}class mr{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}wr(e,t){const n=this.userDataReader.createContext(3,e);return Tl(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.wr("where",e),t.push(new jr(e,{})),new mr(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new Vt(e,{})),new mr(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new ze(this.wr("sort",e.orderings),{})):n.push(new ze(this.wr("sort",[e,...t]),{})),new mr(this._db,this.userDataReader,this._userDataWriter,n)}br(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class f{constructor(e,t){this.type=e,this.value=t}static vr(){return new f("ERROR",void 0)}static Sr(){return new f("UNSET",void 0)}static Dr(){return new f("NULL",Ge)}static newValue(e){return Re(e)?new f("NULL",Ge):(function(n){return!!n&&"booleanValue"in n})(e)?new f("BOOLEAN",e):qe(e)?new f("INT",e):Bt(e)?new f("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new f("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new f("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new f("BYTES",e):e.referenceValue?new f("REFERENCE",e):e.geoPointValue?new f("GEO_POINT",e):Et(e)?new f("ARRAY",e):Yt(e)?new f("VECTOR",e):Gt(e)?new f("MAP",e):new f("ERROR",void 0)}Cr(){return this.type==="ERROR"||this.type==="UNSET"}Fr(){return this.type==="NULL"}}function _r(r){if(!r.Cr())return r.value}function xl(r){return r instanceof At?r._expr:r}function b(r){if((r=xl(r))instanceof en)return new em(r);if(r instanceof tn)return new tm(r);if(r instanceof rr)return new nm(r);if(r instanceof g){if(r.name==="add")return new im(r);if(r.name==="subtract")return new am(r);if(r.name==="multiply")return new om(r);if(r.name==="divide")return new um(r);if(r.name==="mod")return new cm(r);if(r.name==="and")return new lm(r);if(r.name==="equal")return new wm(r);if(r.name==="not_equal")return new Am(r);if(r.name==="less_than")return new Vm(r);if(r.name==="less_than_or_equal")return new vm(r);if(r.name==="greater_than")return new Rm(r);if(r.name==="greater_than_or_equal")return new Pm(r);if(r.name==="array_concat")return new xm(r);if(r.name==="array_reverse")return new bm(r);if(r.name==="array_contains")return new Sm(r);if(r.name==="array_contains_all")return new Cm(r);if(r.name==="array_contains_any")return new Dm(r);if(r.name==="array_length")return new Nm(r);if(r.name==="array_element")return new km(r);if(r.name==="equal_any")return new bl(r);if(r.name==="not_equal_any")return new dm(r);if(r.name==="is_nan")return new fm(r);if(r.name==="is_not_nan")return new mm(r);if(r.name==="is_null")return new _m(r);if(r.name==="is_not_null")return new pm(r);if(r.name==="is_error")return new gm(r);if(r.name==="exists")return new ym(r);if(r.name==="not")return new ri(r);if(r.name==="or")return new hm(r);if(r.name==="xor")return new Na(r);if(r.name==="conditional")return new Im(r);if(r.name==="maximum")return new Tm(r);if(r.name==="minimum")return new Em(r);if(r.name==="reverse")return new Om(r);if(r.name==="replace_first")return new Lm(r);if(r.name==="replace_all")return new Mm(r);if(r.name==="char_length")return new Fm(r);if(r.name==="byte_length")return new Um(r);if(r.name==="like")return new Bm(r);if(r.name==="regex_contains")return new qm(r);if(r.name==="regex_match")return new zm(r);if(r.name==="string_contains")return new $m(r);if(r.name==="starts_with")return new Gm(r);if(r.name==="ends_with")return new Km(r);if(r.name==="to_lower")return new jm(r);if(r.name==="to_upper")return new Qm(r);if(r.name==="trim")return new Wm(r);if(r.name==="string_concat")return new Hm(r);if(r.name==="map_get")return new Ym(r);if(r.name==="cosine_distance")return new Jm(r);if(r.name==="dot_product")return new Xm(r);if(r.name==="euclidean_distance")return new Zm(r);if(r.name==="vector_length")return new e_(r);if(r.name==="unix_micros_to_timestamp")return new i_(r);if(r.name==="timestamp_to_unix_micros")return new u_(r);if(r.name==="unix_millis_to_timestamp")return new a_(r);if(r.name==="timestamp_to_unix_millis")return new c_(r);if(r.name==="unix_seconds_to_timestamp")return new o_(r);if(r.name==="timestamp_to_unix_seconds")return new l_(r);if(r.name==="timestamp_add")return new h_(r);if(r.name==="timestamp_subtract")return new d_(r)}throw new Error(`Unknown Expr : ${r}`)}class em{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===Ue)return f.newValue({referenceValue:Nn(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return f.newValue({timestampValue:ds(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return f.newValue({timestampValue:ds(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?Ks(n)?f.newValue((function(i,a){if(i.serverTimestampBehavior==="estimate")return{timestampValue:ds(i.serializer,P.fromTimestamp(Vn(a)))};if(i.serverTimestampBehavior==="previous"){const o=Br(a);if(o)return o}return{nullValue:"NULL_VALUE"}})(e,n)):f.newValue(n):f.Sr()}}class tm{constructor(e){this.expr=e}evaluate(e,t){return f.newValue(this.expr._getValue())}}class nm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.Rr.map((s=>b(s).evaluate(e,t)));return n.some((s=>s.Cr()))?f.vr():f.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function le(r){return Bt(r)?Number(r.doubleValue):Number(r.integerValue)}function je(r){return BigInt(r.integerValue)}const rm=BigInt("0x7fffffffffffffff"),sm=-BigInt("0x8000000000000000");class Wr{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length>=2,24778);const n=b(this.expr.params[0]).evaluate(e,t),s=b(this.expr.params[1]).evaluate(e,t);let i=this.Or(n,s);for(const a of this.expr.params.slice(2)){const o=b(a).evaluate(e,t);i=this.Or(i,o)}return i}Or(e,t){if(e.Cr()||t.Cr())return f.vr();if(e.Fr()||t.Fr())return f.Dr();const n=e.value,s=t.value;if(!Bt(n)&&!qe(n)||!Bt(s)&&!qe(s))return f.vr();if(Bt(n)||Bt(s)){const i=this.Mr(n,s);return i?f.newValue(i):f.vr()}if(qe(n)&&qe(s)){const i=this.Nr(n,s);return i===void 0?f.vr():typeof i=="number"?f.newValue({doubleValue:i}):i<sm||i>rm?f.vr():f.newValue({integerValue:`${i}`})}return f.vr()}}function nt(r,e){return Z(r)!==Z(e)?"TYPE_MISMATCH":we(r)||we(e)?"NOT_EQ":Re(r)&&Re(e)?"EQ":Re(r)||Re(e)?"NULL":Et(r)&&Et(e)?(function(n,s){var a,o,u;if(((a=n.values)==null?void 0:a.length)!==((o=s.values)==null?void 0:o.length))return"NOT_EQ";let i=!1;for(let c=0;c<(((u=n.values)==null?void 0:u.length)??0);c++){const l=n.values[c],h=s.values[c];switch(nt(l,h)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:V(44609,{Lr:l,Br:h})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):Yt(r)&&Yt(e)||Gt(r)&&Gt(e)?(function(n,s){const i=n.fields||{},a=s.fields||{};if(ws(i)!==ws(a))return"NOT_EQ";let o=!1;for(const u in i)if(i.hasOwnProperty(u)){if(a[u]===void 0)return"NOT_EQ";switch(nt(i[u],a[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":o=!0}}return o?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return ke(n,s,{Te:!1,Ee:!0,he:!0})})(r,e)?"EQ":"NOT_EQ"}class im extends Wr{Nr(e,t){return je(e)+je(t)}Mr(e,t){return{doubleValue:le(e)+le(t)}}}class am extends Wr{constructor(e){super(e),this.expr=e}Nr(e,t){return je(e)-je(t)}Mr(e,t){return{doubleValue:le(e)-le(t)}}}class om extends Wr{constructor(e){super(e),this.expr=e}Nr(e,t){return je(e)*je(t)}Mr(e,t){return{doubleValue:le(e)*le(t)}}}class um extends Wr{constructor(e){super(e),this.expr=e}Nr(e,t){const n=je(t);if(n!==BigInt(0))return je(e)/n}Mr(e,t){const n=le(t);return n===0?{doubleValue:In(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:le(e)/n}}}class cm extends Wr{constructor(e){super(e),this.expr=e}Nr(e,t){const n=je(t);if(n!==BigInt(0))return je(e)%n}Mr(e,t){const n=le(t);if(n!==0)return{doubleValue:le(e)%n}}}class lm{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":if(!((i=o.value)!=null&&i.booleanValue))return f.newValue(oe);break;case"NULL":s=!0;break;default:n=!0}}return n?f.vr():s?f.Dr():f.newValue(Ee)}}class ri{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,9634);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return f.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return f.Dr();default:return f.vr()}}}class hm{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":if((i=o.value)!=null&&i.booleanValue)return f.newValue(Ee);break;case"NULL":s=!0;break;default:n=!0}}return n?f.vr():s?f.Dr():f.newValue(oe)}}class Na{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const a of this.expr.params){const o=b(a).evaluate(e,t);switch(o.type){case"BOOLEAN":n=Na.xor(n,!!((i=o.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return f.vr()}}return s?f.Dr():f.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class bl{constructor(e){this.expr=e}evaluate(e,t){var a,o;E(this.expr.params.length===2,55094);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();for(const u of((o=(a=i.value)==null?void 0:a.arrayValue)==null?void 0:o.values)??[])switch(Re(s.value)&&Re(u)?"EQ":nt(s.value,u)){case"EQ":return f.newValue(Ee);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:V(44608,{value:s.value,candidate:u})}return n?f.Dr():f.newValue(oe)}}class dm{constructor(e){this.expr=e}evaluate(e,t){return new ri(new g("not",[new g("equal_any",this.expr.params)])).evaluate(e,t)}}class fm{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,23322);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return f.newValue(oe);case"DOUBLE":return f.newValue({booleanValue:isNaN(le(n.value))});case"NULL":return f.Dr();default:return f.vr()}}}class mm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,50406),new ri(new g("not",[new g("is_nan",this.expr.params)])).evaluate(e,t)}}class _m{constructor(e){this.expr=e}evaluate(e,t){switch(E(this.expr.params.length===1,23123),b(this.expr.params[0]).evaluate(e,t).type){case"NULL":return f.newValue(Ee);case"UNSET":case"ERROR":return f.vr();default:return f.newValue(oe)}}}class pm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,23167),new ri(new g("not",[new g("is_null",this.expr.params)])).evaluate(e,t)}}class gm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===1,5228),b(this.expr.params[0]).evaluate(e,t).type==="ERROR"?f.newValue(Ee):f.newValue(oe)}}class ym{constructor(e){this.expr=e}evaluate(e,t){switch(E(this.expr.params.length===1,6877),b(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return f.vr();case"UNSET":return f.newValue(oe);default:return f.newValue(Ee)}}}class Im{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===3,11706);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?b(this.expr.params[1]).evaluate(e,t):b(this.expr.params[2]).evaluate(e,t);case"NULL":return b(this.expr.params[2]).evaluate(e,t);default:return f.vr()}}}class Tm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>b(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_e(i.value,s.value)>0?i:s}return s===void 0?f.Dr():s}}class Em{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>b(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_e(i.value,s.value)<0?i:s}return s===void 0?f.Dr():s}}class $n{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return f.vr()}const s=b(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return f.vr()}return this.Ur(n,s)}}class wm extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return f.newValue(Ee);if(e.Fr()||t.Fr()||we(e.value)||we(t.value)||Z(e.value)!==Z(t.value))return f.newValue(oe);switch(nt(e.value,t.value)){case"EQ":return f.newValue(Ee);case"NOT_EQ":return f.newValue(oe);case"NULL":return f.Dr();default:V(44615,{left:e,right:t})}}}class Am extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){switch(nt(e.value,t.value)){case"EQ":return f.newValue(oe);case"NOT_EQ":case"TYPE_MISMATCH":return f.newValue(Ee);case"NULL":return f.Dr();default:V(44614,{left:e,right:t})}}}class Vm extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||we(e.value)||we(t.value)?f.newValue(oe):f.newValue({booleanValue:_e(e.value,t.value)<0})}}class vm extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||we(e.value)||we(t.value)?f.newValue(oe):nt(e.value,t.value)==="EQ"?f.newValue(Ee):f.newValue({booleanValue:_e(e.value,t.value)<0})}}class Rm extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||we(e.value)||we(t.value)?f.newValue(oe):f.newValue({booleanValue:_e(e.value,t.value)>0})}}class Pm extends $n{constructor(e){super(e),this.expr=e}Ur(e,t){return Z(e.value)!==Z(t.value)||we(e.value)||we(t.value)?f.newValue(oe):nt(e.value,t.value)==="EQ"?f.newValue(Ee):f.newValue({booleanValue:_e(e.value,t.value)>0})}}class xm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class bm{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,216);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return f.newValue({arrayValue:{values:[...i].reverse()}})}default:return f.vr()}}}class Sm{constructor(e){this.expr=e}evaluate(e,t){return E(this.expr.params.length===2,52884),new bl(new g("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Cm{constructor(e){this.expr=e}evaluate(e,t){var u,c,l,h;E(this.expr.params.length===2,1392);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=((c=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:c.values)??[],o=((h=(l=s.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[];for(const d of a){let _=!1;n=!1;for(const y of o){switch(Re(d)&&Re(y)?"EQ":nt(d,y)){case"EQ":_=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:V(44613,{value:y,search:d})}if(_)break}if(!_)return f.newValue(oe)}return f.newValue(Ee)}}class Dm{constructor(e){this.expr=e}evaluate(e,t){var u,c,l,h;E(this.expr.params.length===2,2680);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=((c=(u=i.value)==null?void 0:u.arrayValue)==null?void 0:c.values)??[],o=((h=(l=s.value)==null?void 0:l.arrayValue)==null?void 0:h.values)??[];for(const d of o)for(const _ of a)switch(Re(d)&&Re(_)?"EQ":nt(d,_)){case"EQ":return f.newValue(Ee);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:V(44608,{value:d,search:_})}return n?f.Dr():f.newValue(oe)}}class Nm{constructor(e){this.expr=e}evaluate(e,t){var s,i,a;E(this.expr.params.length===1,38605);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"ARRAY":return f.newValue({integerValue:`${((a=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:a.length)??0}`});default:return f.vr()}}}class km{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Om{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,1508);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"BYTES":{const a=(s=n.value)==null?void 0:s.bytesValue;if(typeof a=="string"){const o=j.fromBase64String(a).toUint8Array();return o.reverse(),f.newValue({bytesValue:j.fromUint8Array(o).toBase64()})}return f.newValue({bytesValue:new Uint8Array(a).reverse()})}case"STRING":{const a=(i=n.value)==null?void 0:i.stringValue,o=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(a),u=Array.from(o,(c=>c.segment)).reverse();return f.newValue({stringValue:u.join("")})}default:return f.vr()}}}class Lm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Mm{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class Fm{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,19400);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return f.Dr();case"STRING":{const s=(function(a){let o=0;for(let u=0;u<a.length;u++){const c=a.codePointAt(u);if(c===void 0)return;if(c<=65535)if(c>=55296&&c<=57343)if(c<=56319){const l=a.codePointAt(u+1);l!==void 0&&l>=56320&&l<=57343?(o+=1,u++):o+=1}else o+=1;else o+=1;else{if(!(c<=1114111))return;o+=1,u++}}return o})(n.value.stringValue);return s===void 0?f.vr():f.newValue({integerValue:s})}default:return f.vr()}}}class Um{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,8486);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const a=(s=n.value)==null?void 0:s.bytesValue;return typeof a=="string"?f.newValue({integerValue:j.fromBase64String(a).toUint8Array().length}):f.newValue({integerValue:new Uint8Array(a).length})}case"STRING":{const a=(function(u){let c=0;for(let l=0;l<u.length;l++){const h=u.codePointAt(l);if(h===void 0)return;if(h>=55296&&h<=57343){if(!(h<=56319))return;{const d=u.codePointAt(l+1);if(d===void 0||!(d>=56320&&d<=57343))return;c+=4,l++}}else if(h<=127)c+=1;else if(h<=2047)c+=2;else if(h<=65535)c+=3;else{if(!(h<=1114111))return;c+=4,l++}}return c})((i=n.value)==null?void 0:i.stringValue);return a===void 0?f.vr():f.newValue({integerValue:a})}case"NULL":return f.Dr();default:return f.vr()}}}class Gn{constructor(e){this.expr=e}evaluate(e,t){var a,o;E(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return f.vr()}return n?f.Dr():this.kr((a=s.value)==null?void 0:a.stringValue,(o=i.value)==null?void 0:o.stringValue)}}class Bm extends Gn{kr(e,t){try{const n=(function(a){let o="";for(let u=0;u<a.length;u++){const c=a.charAt(u);switch(c){case"_":o+=".";break;case"%":o+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":o+="\\"+c;break;default:o+=c}}return"^"+o+"$"})(t),s=ta.compile(n);return f.newValue({booleanValue:s.matches(e)})}catch(n){return Ne(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),f.vr()}}}class qm extends Gn{kr(e,t){try{const n=ta.compile(t);return f.newValue({booleanValue:n.matcher(e).find()})}catch{return Ne(`Invalid regex pattern found in regex_contains: ${t}, returning error`),f.vr()}}}class zm extends Gn{kr(e,t){try{return f.newValue({booleanValue:ta.compile(t).matches(e)})}catch{return Ne(`Invalid regex pattern found in regex_match: ${t}, returning error`),f.vr()}}}class $m extends Gn{kr(e,t){return f.newValue({booleanValue:e.includes(t)})}}class Gm extends Gn{kr(e,t){return f.newValue({booleanValue:e.startsWith(t)})}}class Km extends Gn{kr(e,t){return f.newValue({booleanValue:e.endsWith(t)})}}class jm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,29079);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return f.Dr();default:return f.vr()}}}class Qm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,60487);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return f.Dr();default:return f.vr()}}}class Wm{constructor(e){this.expr=e}evaluate(e,t){var s,i;E(this.expr.params.length===1,28544);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return f.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return f.Dr();default:return f.vr()}}}class Hm{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((a=>b(a).evaluate(e,t)));let s="",i=!1;for(const a of n)switch(a.type){case"STRING":s+=a.value.stringValue;break;case"NULL":i=!0;break;default:return f.vr()}return i?f.Dr():f.newValue({stringValue:s})}}class Ym{constructor(e){this.expr=e}evaluate(e,t){var a,o,u,c;E(this.expr.params.length===2,4483);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return f.Sr();case"MAP":break;default:return f.vr()}const s=b(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return f.vr();const i=(c=(o=(a=n.value)==null?void 0:a.mapValue)==null?void 0:o.fields)==null?void 0:c[(u=s.value)==null?void 0:u.stringValue];return i===void 0?f.Sr():f.newValue(i)}}class ka{constructor(e){this.expr=e}evaluate(e,t){var c,l;E(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const a=Di(s.value),o=Di(i.value);if(a===void 0||o===void 0||((c=a.values)==null?void 0:c.length)!==((l=o.values)==null?void 0:l.length))return f.vr();const u=this.qr(a,o);return u===void 0||isNaN(u)?f.vr():f.newValue({doubleValue:u})}}class Jm extends ka{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,a=0,o=0;for(let c=0;c<n.length;c++){if(!Tt(n[c])||!Tt(s[c]))return;const l=le(n[c]),h=le(s[c]);i+=l*h,a+=l*l,o+=h*h}const u=Math.sqrt(a)*Math.sqrt(o);if(u!==0)return 1-Math.max(-1,Math.min(1,i/u))}}class Xm extends ka{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let a=0;a<n.length;a++){if(!Tt(n[a])||!Tt(s[a]))return;i+=le(n[a])*le(s[a])}return i}}class Zm extends ka{qr(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let a=0;a<n.length;a++){if(!Tt(n[a])||!Tt(s[a]))return;const o=le(n[a]),u=le(s[a]);i+=Math.pow(o-u,2)}return Math.sqrt(i)}}class e_{constructor(e){this.expr=e}evaluate(e,t){var s;E(this.expr.params.length===1,39044);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=Di(n.value);return f.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return f.Dr();default:return f.vr()}}}const Sr=BigInt(-62135596800),Cr=BigInt(253402300799),bs=BigInt(1e3),yt=BigInt(1e6),t_=Sr*bs,n_=Cr*bs+BigInt(999),r_=Sr*yt,s_=Cr*yt+BigInt(999999);function Oa(r){return r>=r_&&r<=s_}function Sl(r){return r>=Sr&&r<=Cr}function Dr(r,e){const t=BigInt(r);return!(t<Sr||t>Cr)&&!(e<0||e>=1e9)&&(t!==Sr||e===0)&&!(t===Cr&&e>999999999)}function Cl(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function La(r){return BigInt(r.seconds)*yt+BigInt(Math.trunc(r.nanoseconds/1e3))}class Ma{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return f.Dr();default:return f.vr()}}}class i_ extends Ma{toTimestamp(e){if(!Oa(e))return f.vr();let t=Number(e/yt),n=Number(e%yt*BigInt(1e3));const s=Cl(t,n);return t=s.seconds,n=s.nanos,Dr(t,n)?f.newValue({timestampValue:{seconds:t,nanos:n}}):f.vr()}}class a_ extends Ma{toTimestamp(e){if(!(function(a){return a>=t_&&a<=n_})(e))return f.vr();let t=Number(e/bs),n=Number(e%bs*BigInt(1e6));const s=Cl(t,n);return t=s.seconds,n=s.nanos,Dr(t,n)?f.newValue({timestampValue:{seconds:t,nanos:n}}):f.vr()}}class o_ extends Ma{toTimestamp(e){if(!Sl(e))return f.vr();const t=Number(e);return f.newValue({timestampValue:{seconds:t,nanos:0}})}}class Fa{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=b(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return f.Dr();default:return f.vr()}const s=wa(n.value.timestampValue);return Dr(s.seconds,s.nanoseconds)?this.$r(s):f.vr()}}class u_ extends Fa{$r(e){const t=La(e);return Oa(t)?f.newValue({integerValue:`${t.toString()}`}):f.vr()}}class c_ extends Fa{$r(e){const t=La(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?f.newValue({integerValue:n.toString()}):f.newValue({integerValue:(n-BigInt(1)).toString()})}}class l_ extends Fa{$r(e){const t=BigInt(e.seconds);return Sl(t)?f.newValue({integerValue:t.toString()}):f.vr()}}class Dl{constructor(e){this.expr=e}evaluate(e,t){E(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=b(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return f.vr()}const i=b(this.expr.params[1]).evaluate(e,t);let a;switch(i.type){case"STRING":if(a=(function(N){switch(N){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),a===void 0)return f.vr();break;case"NULL":n=!0;break;default:return f.vr()}const o=b(this.expr.params[2]).evaluate(e,t);switch(o.type){case"INT":break;case"NULL":n=!0;break;default:return f.vr()}if(n)return f.Dr();const u=BigInt(o.value.integerValue);let c;try{switch(a){case"microsecond":c=u;break;case"millisecond":c=u*BigInt(1e3);break;case"second":c=u*BigInt(1e6);break;case"minute":c=u*BigInt(6e7);break;case"hour":c=u*BigInt(36e8);break;case"day":c=u*BigInt(864e8);break;default:return f.vr()}if(a!=="microsecond"&&u!==BigInt(0)&&c/u!==BigInt(this.Kr(a)))return f.vr()}catch(k){return Ne(`Error during timestamp arithmetic: ${k}`),f.vr()}const l=wa(s.value.timestampValue);if(!Dr(l.seconds,l.nanoseconds))return f.vr();const h=La(l),d=this.Wr(h,c);if(!Oa(d))return f.vr();const _=Number(d/yt),y=d%yt,R=Number((y<0?y+yt:y)*BigInt(1e3)),x=y<0?_-1:_;return Dr(x,R)?f.newValue({timestampValue:{seconds:x,nanos:R}}):f.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class h_ extends Dl{Wr(e,t){return e+t}}class d_ extends Dl{Wr(e,t){return e-t}}function Nr(r){if((r=xl(r))instanceof en)return`fld(${r.fieldName})`;if(r instanceof tn)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof Q?`ref(${t.path})`:t instanceof Te?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof g)return`fn(${r.name},[${r.params.map(Nr).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.Rr.map(Nr).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function f_(r){if(r instanceof Vl)return`${r._name}(${ts(r.fields)})`;if(r instanceof vl){let e=`${r._name}(${ts(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${ts(r.groups)})`),e}if(r instanceof Rl)return`${r._name}(${ts(r.groups)})`;if(r instanceof Gr)return`${r._name}(${r.Vr})`;if(r instanceof Kr)return`${r._name}(${r.collectionId})`;if(r instanceof ti)return`${r._name}()`;if(r instanceof ni)return`${r._name}(${r.dr.sort()})`;if(r instanceof jr)return`${r._name}(${Nr(r.condition)})`;if(r instanceof Vt)return`${r._name}(${r.limit})`;if(r instanceof ze)return`${r._name}(${(function(t){return t.map((n=>`${Nr(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function ts(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${Nr(t)}`)).join(",")}`}function Xe(r){return r.stages.map((e=>f_(e))).join("|")}function Nl(r,e){return Xe(r)===Xe(e)}function H(r){return r instanceof fe}function au(r){return H(r)?Xe(r):dr(r)}function kl(r){return H(r)?Xe(r):(function(t){return`${Vs(xe(t))}|lt:${t.limitType}`})(r)}function si(r,e){return r instanceof fe&&e instanceof fe?Nl(r,e):!(r instanceof fe&&!(e instanceof fe)||!(r instanceof fe)&&e instanceof fe)&&Xd(r,e)}function ii(r){return He(r)?Xe(r):Vs(r)}function Ua(r,e){return r instanceof fe&&e instanceof fe?Nl(r,e):!(r instanceof fe&&!(e instanceof fe)||!(r instanceof fe)&&e instanceof fe)&&ga(r,e)}function m_(r,e){const t=(function(s){let i=!1;const a=[];for(const o of s)if(o instanceof ze)if(i=!0,o.orderings.some((u=>u.expr instanceof en&&u.expr.fieldName===Ue)))a.push(o);else{const u=o.orderings.map((c=>c));u.push(fs(Ue).ascending()),a.push(new ze(u,{}))}else o instanceof Vt&&(i||(a.push(new ze([fs(Ue).ascending()],{})),i=!0)),a.push(o);return i||a.push(new ze([fs(Ue).ascending()],{})),a})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new fe(r.userDataReader.serializer,t,e)}/**
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
 */class Ba{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&Ud(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=lr(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=lr(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=zc();return this.mutations.forEach((s=>{const i=e.get(s.key),a=i.overlayedDocument;let o=this.applyToLocalView(a,i.mutatedFields);o=t.has(s.key)?null:o;const u=Pc(a,o);u!==null&&n.set(s.key,u),a.isValidDocument()||a.convertToNoDocument(P.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),C())}isEqual(e){return this.batchId===e.batchId&&gn(this.mutations,e.mutations,((t,n)=>Mo(t,n)))&&gn(this.baseMutations,e.baseMutations,((t,n)=>Mo(t,n)))}}class qa{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){E(e.mutations.length===n.length,58842,{Qr:e.mutations.length,Gr:n.length});let s=(function(){return nf})();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new qa(e,t,n,s)}}/**
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
 */class za{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class $e{constructor(e,t,n,s,i=P.min(),a=P.min(),o=j.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=o,this.expectedCount=u}withSequenceNumber(e){return new $e(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new $e(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new $e(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new $e(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class Ol{constructor(e){this.zr=e}}function __(r,e){let t;if(e.document)t=ff(r.zr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=A.fromSegments(e.noDocument.path),s=Xt(e.noDocument.readTime);t=K.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return V(56709);{const n=A.fromSegments(e.unknownDocument.path),s=Xt(e.unknownDocument.version);t=K.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime((function(s){const i=new U(s[0],s[1]);return P.fromTimestamp(i)})(e.readTime)),t}function ou(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ss(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=(function(i,a){return{name:Nn(i,a.key),fields:a.data.value.mapValue.fields,updateTime:Dn(i,a.version.toTimestamp()),createTime:Dn(i,a.createTime.toTimestamp())}})(r.zr,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:Jt(e.version)};else{if(!e.isUnknownDocument())return V(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:Jt(e.version)}}return n}function Ss(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function Jt(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Xt(r){const e=new U(r.seconds,r.nanoseconds);return P.fromTimestamp(e)}function Lt(r,e){const t=(e.baseMutations||[]).map((i=>Bi(r.zr,i)));for(let i=0;i<e.mutations.length-1;++i){const a=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const o=e.mutations[i+1];a.updateTransforms=o.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map((i=>Bi(r.zr,i))),s=U.fromMillis(e.localWriteTimeMs);return new Ba(e.batchId,s,t,n)}function sr(r,e){const t=Xt(e.readTime),n=e.lastLimboFreeSnapshotVersion!==void 0?Xt(e.lastLimboFreeSnapshotVersion):P.min();let s;return s=(function(a){return a.structuredPipeline!==void 0})(e.query)?(function(a,o){var l,h;const u=a.structuredPipeline;E((((l=u==null?void 0:u.pipeline)==null?void 0:l.stages)??[]).length>0,1845);const c=(h=u==null?void 0:u.pipeline)==null?void 0:h.stages.map(p_);return new fe(o,c)})(e.query,r.zr):(function(a){return a.documents!==void 0})(e.query)?(function(a){const o=a.documents.length;return E(o===1,1966,{count:o}),xe(qr(Wc(a.documents[0])))})(e.query):(function(a){return xe(Xc(a))})(e.query),new $e(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,j.fromBase64String(e.resumeToken))}function Ll(r,e){const t=Jt(e.snapshotVersion),n=Jt(e.lastLimboFreeSnapshotVersion);let s;s=He(e.target)?Zc(r.zr,e.target):ya(e.target)?Yc(r.zr,e.target):Jc(r.zr,e.target).yt;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:ii(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Ml(r){const e=Xc({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Rs(e,e.limit,"L"):e}function ns(r,e){return new za(e.largestBatchId,Bi(r.zr,e.overlayMutation))}function uu(r,e){const t=e.path.lastSegment();return[r,me(e.path.popLast()),t]}function cu(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:Jt(n.readTime),documentKey:me(n.documentKey.path),largestBatchId:n.largestBatchId}}function p_(r){switch(r.name){case"collection":return new Gr(r.args[0].referenceValue,{});case"collection_group":return new Kr(r.args[1].stringValue,{});case"database":return new ti({});case"documents":return new ni(r.args.map((e=>e.referenceValue)),{});case"where":return new jr(zi(r.args[0]),{});case"limit":{const e=r.args[0].integerValue??r.args[0].doubleValue;return new Vt(typeof e=="number"?e:Number(e),{})}case"sort":return new ze(r.args.map((e=>(function(n){var i,a;const s=(i=n.mapValue)==null?void 0:i.fields;return new Sa(zi(s.expression),(a=s.direction)==null?void 0:a.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${r.name} not supported.`)}}function zi(r){return r.fieldReferenceValue?new en(tt("_exprFromProto",r.fieldReferenceValue),"_exprFromProto"):r.functionValue?(function(t){var n;return new g(t.functionValue.name,((n=t.functionValue.args)==null?void 0:n.map(zi))||[])})(r):tn._fromProto(r)}class g_{getBundleMetadata(e,t){return lu(e).get(t).next((n=>{if(n)return(function(i){return{id:i.bundleId,createTime:Xt(i.createTime),version:i.version}})(n)}))}saveBundleMetadata(e,t){return lu(e).put((function(s){return{bundleId:s.id,createTime:Jt(ue(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return hu(e).get(t).next((n=>{if(n)return(function(i){return{name:i.name,query:Ml(i.bundledQuery),readTime:Xt(i.readTime)}})(n)}))}saveNamedQuery(e,t){return hu(e).put((function(s){return{name:s.name,readTime:Jt(ue(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function lu(r){return ne(r,zs)}function hu(r){return ne(r,$s)}/**
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
 */class ai{constructor(e,t){this.serializer=e,this.userId=t}static jr(e,t){const n=t.uid||"";return new ai(e,n)}getOverlay(e,t){return an(e).get(uu(this.userId,t)).next((n=>n?ns(this.serializer,n):null))}getOverlays(e,t){const n=Ce();return m.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Ce();return an(e).ee(((s,i)=>{const a=ns(this.serializer,i);a.largestBatchId>t&&n.set(a.getKey(),a)})).next((()=>n))}saveOverlays(e,t,n){const s=[];return n.forEach(((i,a)=>{const o=new za(t,a);s.push(this.Hr(e,o))})),m.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach((a=>s.add(me(a.getCollectionPath()))));const i=[];return s.forEach((a=>{const o=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(an(e).Z(bi,o))})),m.waitFor(i)}getOverlaysForCollection(e,t,n){const s=Ce(),i=me(t),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return an(e).H(bi,a).next((o=>{for(const u of o){const c=ns(this.serializer,u);s.set(c.getKey(),c)}return s}))}getOverlaysForCollectionGroup(e,t,n,s){const i=Ce();let a;const o=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return an(e).ee({index:oc,range:o},((u,c,l)=>{const h=ns(this.serializer,c);i.size()<s||h.largestBatchId===a?(i.set(h.getKey(),h),a=h.largestBatchId):l.done()})).next((()=>i))}Hr(e,t){return an(e).put((function(s,i,a){const[o,u,c]=uu(i,a.mutation.key);return{userId:i,collectionPath:u,documentId:c,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:Pr(s.zr,a.mutation)}})(this.serializer,this.userId,t))}}function an(r){return ne(r,Gs)}/**
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
 */class y_{Jr(e){return ne(e,ua)}getSessionToken(e){return this.Jr(e).get("sessionToken").next((t=>{const n=t==null?void 0:t.value;return n?j.fromUint8Array(n):j.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Jr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class Mt{constructor(){}Yr(e,t){this.Zr(e,t),t.Xr()}Zr(e,t){if("nullValue"in e)this.ei(t,5);else if("booleanValue"in e)this.ei(t,10),t.ti(e.booleanValue?1:0);else if("integerValue"in e)this.ei(t,15),t.ti(z(e.integerValue));else if("doubleValue"in e){const n=z(e.doubleValue);isNaN(n)?this.ei(t,13):(this.ei(t,15),In(n)?t.ti(0):t.ti(n))}else if("timestampValue"in e){let n=e.timestampValue;this.ei(t,20),typeof n=="string"&&(n=Ze(n)),t.ni(`${n.seconds||""}`),t.ti(n.nanos||0)}else if("stringValue"in e)this.ri(e.stringValue,t),this.ii(t);else if("bytesValue"in e)this.ei(t,30),t.si(et(e.bytesValue)),this.ii(t);else if("referenceValue"in e)this._i(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.ei(t,45),t.ti(n.latitude||0),t.ti(n.longitude||0)}else"mapValue"in e?Ic(e)?this.ei(t,Number.MAX_SAFE_INTEGER):Yt(e)?this.oi(e.mapValue,t):(this.ai(e.mapValue,t),this.ii(t)):"arrayValue"in e?(this.ui(e.arrayValue,t),this.ii(t)):V(19022,{ci:e})}ri(e,t){this.ei(t,25),this.li(e,t)}li(e,t){t.ni(e)}ai(e,t){const n=e.fields||{};this.ei(t,55);for(const s of Object.keys(n))this.ri(s,t),this.Zr(n[s],t)}oi(e,t){var a,o;const n=e.fields||{};this.ei(t,53);const s=Ht,i=((o=(a=n[s].arrayValue)==null?void 0:a.values)==null?void 0:o.length)||0;this.ei(t,15),t.ti(z(i)),this.ri(s,t),this.Zr(n[s],t)}ui(e,t){const n=e.values||[];this.ei(t,50);for(const s of n)this.Zr(s,t)}_i(e,t){this.ei(t,37),A.fromName(e).path.forEach((n=>{this.ei(t,60),this.li(n,t)}))}ei(e,t){e.ti(t)}ii(e){e.ti(2)}}Mt.Ei=new Mt;/**
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
 */const on=255;function I_(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function du(r){const e=64-(function(n){let s=0;for(let i=0;i<8;++i){const a=I_(255&n[i]);if(s+=a,a!==8)break}return s})(r);return Math.ceil(e/8)}class T_{constructor(){this.buffer=new Uint8Array(1024),this.position=0}hi(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ti(n.value),n=t.next();this.Pi()}Ri(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ii(n.value),n=t.next();this.Ai()}Vi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ti(n);else if(n<2048)this.Ti(960|n>>>6),this.Ti(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ti(480|n>>>12),this.Ti(128|63&n>>>6),this.Ti(128|63&n);else{const s=t.codePointAt(0);this.Ti(240|s>>>18),this.Ti(128|63&s>>>12),this.Ti(128|63&s>>>6),this.Ti(128|63&s)}}this.Pi()}di(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ii(n);else if(n<2048)this.Ii(960|n>>>6),this.Ii(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ii(480|n>>>12),this.Ii(128|63&n>>>6),this.Ii(128|63&n);else{const s=t.codePointAt(0);this.Ii(240|s>>>18),this.Ii(128|63&s>>>12),this.Ii(128|63&s>>>6),this.Ii(128|63&s)}}this.Ai()}fi(e){const t=this.mi(e),n=du(t);this.pi(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}gi(e){const t=this.mi(e),n=du(t);this.pi(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}yi(){this.wi(on),this.wi(255)}bi(){this.Si(on),this.Si(255)}reset(){this.position=0}seed(e){this.pi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Di(){return this.buffer.slice(0,this.position)}mi(e){const t=(function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)})(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ti(e){const t=255&e;t===0?(this.wi(0),this.wi(255)):t===on?(this.wi(on),this.wi(0)):this.wi(t)}Ii(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===on?(this.Si(on),this.Si(0)):this.Si(e)}Pi(){this.wi(0),this.wi(1)}Ai(){this.Si(0),this.Si(1)}wi(e){this.pi(1),this.buffer[this.position++]=e}Si(e){this.pi(1),this.buffer[this.position++]=~e}pi(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class E_{constructor(e){this.xi=e}si(e){this.xi.hi(e)}ni(e){this.xi.Vi(e)}ti(e){this.xi.fi(e)}Xr(){this.xi.yi()}}class w_{constructor(e){this.xi=e}si(e){this.xi.Ri(e)}ni(e){this.xi.di(e)}ti(e){this.xi.gi(e)}Xr(){this.xi.bi()}}class Xn{constructor(){this.xi=new T_,this.ascending=new E_(this.xi),this.descending=new w_(this.xi)}seed(e){this.xi.seed(e)}Ci(e){return e===0?this.ascending:this.descending}Di(){return this.xi.Di()}reset(){this.xi.reset()}}/**
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
 */class Ft{constructor(e,t,n,s){this.Fi=e,this.Oi=t,this.Mi=n,this.Ni=s}Li(){const e=this.Ni.length,t=e===0||this.Ni[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.Ni,0),t!==e?n.set([0],this.Ni.length):++n[n.length-1],new Ft(this.Fi,this.Oi,this.Mi,n)}Bi(e,t,n){return{indexId:this.Fi,uid:e,arrayValue:ms(this.Mi),directionalValue:ms(this.Ni),orderedDocumentKey:ms(t),documentKey:n.path.toArray()}}Ui(e,t,n){const s=this.Bi(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function ct(r,e){let t=r.Fi-e.Fi;return t!==0?t:(t=fu(r.Mi,e.Mi),t!==0?t:(t=fu(r.Ni,e.Ni),t!==0?t:A.comparator(r.Oi,e.Oi)))}function fu(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function ms(r){return Ku()?(function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n})(r):r}function mu(r){return typeof r!="string"?r:(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(r)}class _u{constructor(e){this.ki=new F(((t,n)=>$.comparator(t.field,n.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.qi=e.orderBy,this.$i=[];for(const t of e.filters){const n=t;n.isInequality()?this.ki=this.ki.add(n):this.$i.push(n)}}get Ki(){return this.ki.size>1}Wi(e){if(E(e.collectionGroup===this.collectionId,49279),this.Ki)return!1;const t=Ri(e);if(t!==void 0&&!this.Qi(t))return!1;const n=Dt(e);let s=new Set,i=0,a=0;for(;i<n.length&&this.Qi(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.ki.size>0){const o=this.ki.getIterator().getNext();if(!s.has(o.field.canonicalString())){const u=n[i];if(!this.Gi(o,u)||!this.zi(this.qi[a++],u))return!1}++i}for(;i<n.length;++i){const o=n[i];if(a>=this.qi.length||!this.zi(this.qi[a++],o))return!1}return!0}ji(){if(this.Ki)return null;let e=new F($.comparator);const t=[];for(const n of this.$i)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new as(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new as(n.field,0))}for(const n of this.qi)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new as(n.field,n.dir==="asc"?0:1)));return new ys(ys.UNKNOWN_ID,this.collectionId,t,gr.empty())}Qi(e){for(const t of this.$i)if(this.Gi(t,e))return!0;return!1}Gi(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}zi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function Fl(r){var t,n;if(E(r instanceof L||r instanceof B,20012),r instanceof L){if(r instanceof Oc){const s=((n=(t=r.value.arrayValue)==null?void 0:t.values)==null?void 0:n.map((i=>L.create(r.field,"==",i))))||[];return B.create(s,"or")}return r}const e=r.filters.map((s=>Fl(s)));return B.create(e,r.op)}function A_(r){if(r.getFilters().length===0)return[];const e=Ki(Fl(r));return E(Ul(e),7391),$i(e)||Gi(e)?[e]:e.getFilters()}function $i(r){return r instanceof L}function Gi(r){return r instanceof B&&pa(r)}function Ul(r){return $i(r)||Gi(r)||(function(t){if(t instanceof B&&Ni(t)){for(const n of t.getFilters())if(!$i(n)&&!Gi(n))return!1;return!0}return!1})(r)}function Ki(r){if(E(r instanceof L||r instanceof B,34018),r instanceof L)return r;if(r.filters.length===1)return Ki(r.filters[0]);const e=r.filters.map((n=>Ki(n)));let t=B.create(e,r.op);return t=Cs(t),Ul(t)?t:(E(t instanceof B,64498),E(Cn(t),40251),E(t.filters.length>1,57927),t.filters.reduce(((n,s)=>$a(n,s))))}function $a(r,e){let t;return E(r instanceof L||r instanceof B,38388),E(e instanceof L||e instanceof B,25473),t=r instanceof L?e instanceof L?(function(s,i){return B.create([s,i],"and")})(r,e):pu(r,e):e instanceof L?pu(e,r):(function(s,i){if(E(s.filters.length>0&&i.filters.length>0,48005),Cn(s)&&Cn(i))return Dc(s,i.getFilters());const a=Ni(s)?s:i,o=Ni(s)?i:s,u=a.filters.map((c=>$a(c,o)));return B.create(u,"or")})(r,e),Cs(t)}function pu(r,e){if(Cn(e))return Dc(e,r.getFilters());{const t=e.filters.map((n=>$a(r,n)));return B.create(t,"or")}}function Cs(r){if(E(r instanceof L||r instanceof B,11850),r instanceof L)return r;const e=r.getFilters();if(e.length===1)return Cs(e[0]);if(Sc(r))return r;const t=e.map((s=>Cs(s))),n=[];return t.forEach((s=>{s instanceof L?n.push(s):s instanceof B&&(s.op===r.op?n.push(...s.filters):n.push(s))})),n.length===1?n[0]:B.create(n,r.op)}/**
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
 */class V_{constructor(){this.Hi=new Ga}addToCollectionParentIndex(e,t){return this.Hi.add(t),m.resolve()}getCollectionParents(e,t){return m.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return m.resolve()}deleteFieldIndex(e,t){return m.resolve()}deleteAllFieldIndexes(e){return m.resolve()}createTargetIndexes(e,t){return m.resolve()}getDocumentsMatchingTarget(e,t){return m.resolve(null)}getIndexType(e,t){return m.resolve(0)}getFieldIndexes(e,t){return m.resolve([])}getNextCollectionGroupToUpdate(e){return m.resolve(null)}getMinOffset(e,t){return m.resolve(be.min())}getMinOffsetFromCollectionGroup(e,t){return m.resolve(be.min())}updateCollectionGroup(e,t,n){return m.resolve()}updateIndexEntries(e,t){return m.resolve()}}class Ga{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new F(D.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new F(D.comparator)).toArray()}}/**
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
 */const gu="IndexedDbIndexManager",rs=new Uint8Array(0);class v_{constructor(e,t){this.databaseId=t,this.Ji=new Ga,this.Yi=new at((n=>Vs(n)),((n,s)=>ga(n,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Ji.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Ji.add(t)}));const i={collectionId:n,parent:me(s)};return yu(e).put(i)}return m.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[Wu(t),""],!1,!0);return yu(e).H(s).next((i=>{for(const a of i){if(a.collectionId!==t)break;n.push(Be(a.parent))}return n}))}addFieldIndex(e,t){const n=Zn(e),s=(function(o){return{indexId:o.indexId,collectionGroup:o.collectionGroup,fields:o.fields.map((u=>[u.fieldPath.canonicalString(),u.kind]))}})(t);delete s.indexId;const i=n.add(s);if(t.indexState){const a=cn(e);return i.next((o=>{a.put(cu(o,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const n=Zn(e),s=cn(e),i=un(e);return n.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=Zn(e),n=un(e),s=cn(e);return t.Z().next((()=>n.Z())).next((()=>s.Z()))}createTargetIndexes(e,t){return m.forEach(this.Zi(t),(n=>this.getIndexType(e,n).next((s=>{if(s===0||s===1){const i=new _u(n).ji();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const n=un(e);let s=!0;const i=new Map;return m.forEach(this.Zi(t),(a=>this.Xi(e,a).next((o=>{s&&(s=!!o),i.set(a,o)})))).next((()=>{if(s){let a=C();const o=[];return m.forEach(i,((u,c)=>{I(gu,`Using index ${(function(O){return`id=${O.indexId}|cg=${O.collectionGroup}|f=${O.fields.map((re=>`${re.fieldPath}:${re.kind}`)).join(",")}`})(u)} to execute ${Vs(t)}`);const l=(function(O,re){const G=Ri(re);if(G===void 0)return null;for(const ee of vs(O,G.fieldPath))switch(ee.op){case"array-contains-any":return ee.value.arrayValue.values||[];case"array-contains":return[ee.value]}return null})(c,u),h=(function(O,re){const G=new Map;for(const ee of Dt(re))for(const ge of vs(O,ee.fieldPath))switch(ge.op){case"==":case"in":G.set(ee.fieldPath.canonicalString(),ge.value);break;case"not-in":case"!=":return G.set(ee.fieldPath.canonicalString(),ge.value),Array.from(G.values())}return null})(c,u),d=(function(O,re){const G=[];let ee=!0;for(const ge of Dt(re)){const ut=ge.kind===0?zo(O,ge.fieldPath,O.startAt):$o(O,ge.fieldPath,O.startAt);G.push(ut.value),ee&&(ee=ut.inclusive)}return new Sn(G,ee)})(c,u),_=(function(O,re){const G=[];let ee=!0;for(const ge of Dt(re)){const ut=ge.kind===0?$o(O,ge.fieldPath,O.endAt):zo(O,ge.fieldPath,O.endAt);G.push(ut.value),ee&&(ee=ut.inclusive)}return new Sn(G,ee)})(c,u),y=this.es(u,c,d),R=this.es(u,c,_),x=this.ts(u,c,h),k=this.ns(u.indexId,l,y,d.inclusive,R,_.inclusive,x);return m.forEach(k,(N=>n.Y(N,t.limit).next((O=>{O.forEach((re=>{const G=A.fromSegments(re.documentKey);a.has(G)||(a=a.add(G),o.push(G))}))}))))})).next((()=>o))}return m.resolve(null)}))}Zi(e){let t=this.Yi.get(e);return t||(e.filters.length===0?t=[e]:t=A_(B.create(e.filters,"and")).map((n=>Oi(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt))),this.Yi.set(e,t),t)}ns(e,t,n,s,i,a,o){const u=(t!=null?t.length:1)*Math.max(n.length,i.length),c=u/(t!=null?t.length:1),l=[];for(let h=0;h<u;++h){const d=t?this.rs(t[h/c]):rs,_=this.ss(e,d,n[h%c],s),y=this._s(e,d,i[h%c],a),R=o.map((x=>this.ss(e,d,x,!0)));l.push(...this.createRange(_,y,R))}return l}ss(e,t,n,s){const i=new Ft(e,A.empty(),t,n);return s?i:i.Li()}_s(e,t,n,s){const i=new Ft(e,A.empty(),t,n);return s?i.Li():i}Xi(e,t){const n=new _u(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let a=null;for(const o of i)n.Wi(o)&&(!a||o.fields.length>a.fields.length)&&(a=o);return a}))}getIndexType(e,t){let n=2;const s=this.Zi(t);return m.forEach(s,(i=>this.Xi(e,i).next((a=>{a?n!==0&&a.fields.length<(function(u){let c=new F($.comparator),l=!1;for(const h of u.filters)for(const d of h.getFlattenedFilters())d.field.isKeyField()||(d.op==="array-contains"||d.op==="array-contains-any"?l=!0:c=c.add(d.field));for(const h of u.orderBy)h.field.isKeyField()||(c=c.add(h.field));return c.size+(l?1:0)})(i)&&(n=1):n=0})))).next((()=>(function(a){return a.limit!==null})(t)&&s.length>1&&n===2?1:n))}us(e,t){const n=new Xn;for(const s of Dt(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const a=n.Ci(s.kind);Mt.Ei.Yr(i,a)}return n.Di()}rs(e){const t=new Xn;return Mt.Ei.Yr(e,t.Ci(0)),t.Di()}cs(e,t){const n=new Xn;return Mt.Ei.Yr(Ar(this.databaseId,t),n.Ci((function(i){const a=Dt(i);return a.length===0?0:a[a.length-1].kind})(e))),n.Di()}ts(e,t,n){if(n===null)return[];let s=[];s.push(new Xn);let i=0;for(const a of Dt(e)){const o=n[i++];for(const u of s)if(this.ls(t,a.fieldPath)&&Et(o))s=this.Es(s,a,o);else{const c=u.Ci(a.kind);Mt.Ei.Yr(o,c)}}return this.hs(s)}es(e,t,n){return this.ts(e,t,n.position)}hs(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].Di();return t}Es(e,t,n){const s=[...e],i=[];for(const a of n.arrayValue.values||[])for(const o of s){const u=new Xn;u.seed(o.Di()),Mt.Ei.Yr(a,u.Ci(t.kind)),i.push(u)}return i}ls(e,t){return!!e.filters.find((n=>n instanceof L&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in")))}getFieldIndexes(e,t){const n=Zn(e),s=cn(e);return(t?n.H(xi,IDBKeyRange.bound(t,t)):n.H()).next((i=>{const a=[];return m.forEach(i,(o=>s.get([o.indexId,this.uid]).next((u=>{a.push((function(l,h){const d=h?new gr(h.sequenceNumber,new be(Xt(h.readTime),new A(Be(h.documentKey)),h.largestBatchId)):gr.empty(),_=l.fields.map((([y,R])=>new as($.fromServerFormat(y),R)));return new ys(l.indexId,l.collectionGroup,_,d)})(o,u))})))).next((()=>a))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:S(n.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,n){const s=Zn(e),i=cn(e);return this.Ts(e).next((a=>s.H(xi,IDBKeyRange.bound(t,t)).next((o=>m.forEach(o,(u=>i.put(cu(u.indexId,this.uid,a,n))))))))}updateIndexEntries(e,t){const n=new Map;return m.forEach(t,((s,i)=>{const a=n.get(s.collectionGroup);return(a?m.resolve(a):this.getFieldIndexes(e,s.collectionGroup)).next((o=>(n.set(s.collectionGroup,o),m.forEach(o,(u=>this.Ps(e,s,u).next((c=>{const l=this.Rs(i,u);return c.isEqual(l)?m.resolve():this.Is(e,i,u,c,l)})))))))}))}As(e,t,n,s){return un(e).put(s.Bi(this.uid,this.cs(n,t.key),t.key))}Vs(e,t,n,s){return un(e).delete(s.Ui(this.uid,this.cs(n,t.key),t.key))}Ps(e,t,n){const s=un(e);let i=new F(ct);return s.ee({index:ac,range:IDBKeyRange.only([n.indexId,this.uid,ms(this.cs(n,t))])},((a,o)=>{i=i.add(new Ft(n.indexId,t,mu(o.arrayValue),mu(o.directionalValue)))})).next((()=>i))}Rs(e,t){let n=new F(ct);const s=this.us(t,e);if(s==null)return n;const i=Ri(t);if(i!=null){const a=e.data.field(i.fieldPath);if(Et(a))for(const o of a.arrayValue.values||[])n=n.add(new Ft(t.indexId,e.key,this.rs(o),s))}else n=n.add(new Ft(t.indexId,e.key,rs,s));return n}Is(e,t,n,s,i){I(gu,"Updating index entries for document '%s'",t.key);const a=[];return(function(u,c,l,h,d){const _=u.getIterator(),y=c.getIterator();let R=sn(_),x=sn(y);for(;R||x;){let k=!1,N=!1;if(R&&x){const O=l(R,x);O<0?N=!0:O>0&&(k=!0)}else R!=null?N=!0:k=!0;k?(h(x),x=sn(y)):N?(d(R),R=sn(_)):(R=sn(_),x=sn(y))}})(s,i,ct,(o=>{a.push(this.As(e,t,n,o))}),(o=>{a.push(this.Vs(e,t,n,o))})),m.waitFor(a)}Ts(e){let t=1;return cn(e).ee({index:ic,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((n,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,n){n=n.sort(((a,o)=>ct(a,o))).filter(((a,o,u)=>!o||ct(a,u[o-1])!==0));const s=[];s.push(e);for(const a of n){const o=ct(a,e),u=ct(a,t);if(o===0)s[0]=e.Li();else if(o>0&&u<0)s.push(a),s.push(a.Li());else if(u>0)break}s.push(t);const i=[];for(let a=0;a<s.length;a+=2){if(this.ds(s[a],s[a+1]))return[];const o=s[a].Ui(this.uid,rs,A.empty()),u=s[a+1].Ui(this.uid,rs,A.empty());i.push(IDBKeyRange.bound(o,u))}return i}ds(e,t){return ct(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Iu)}getMinOffset(e,t){return m.mapArray(this.Zi(t),(n=>this.Xi(e,n).next((s=>s||V(44426))))).next(Iu)}}function yu(r){return ne(r,Tr)}function un(r){return ne(r,ur)}function Zn(r){return ne(r,oa)}function cn(r){return ne(r,or)}function Iu(r){E(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;sa(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new be(e.readTime,e.documentKey,t)}/**
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
 */function Bl(r,e,t){const n=r.store(Oe),s=r.store(Tn),i=[],a=IDBKeyRange.only(t.batchId);let o=0;const u=n.ee({range:a},((l,h,d)=>(o++,d.delete())));i.push(u.next((()=>{E(o===1,47070,{batchId:t.batchId})})));const c=[];for(const l of t.mutations){const h=nc(e,l.key.path,t.batchId);i.push(s.delete(h)),c.push(l.key)}return m.waitFor(i).next((()=>c))}function Ds(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw V(14731);e=r.noDocument}return JSON.stringify(e).length}/**
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
 */class oi{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.fs={}}static jr(e,t,n,s){E(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new oi(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return lt(e).ee({index:Ut,range:n},((s,i,a)=>{t=!1,a.done()})).next((()=>t))}addMutationBatch(e,t,n,s){const i=mn(e),a=lt(e);return a.add({}).next((o=>{E(typeof o=="number",49019);const u=new Ba(o,t,n,s),c=(function(_,y,R){const x=R.baseMutations.map((N=>Pr(_.zr,N))),k=R.mutations.map((N=>Pr(_.zr,N)));return{userId:y,batchId:R.batchId,localWriteTimeMs:R.localWriteTime.toMillis(),baseMutations:x,mutations:k}})(this.serializer,this.userId,u),l=[];let h=new F(((d,_)=>S(d.canonicalString(),_.canonicalString())));for(const d of s){const _=nc(this.userId,d.key.path,o);h=h.add(d.key.path.popLast()),l.push(a.put(c)),l.push(i.put(_,id))}return h.forEach((d=>{l.push(this.indexManager.addToCollectionParentIndex(e,d))})),e.addOnCommittedListener((()=>{this.fs[o]=u.keys()})),m.waitFor(l).next((()=>u))}))}lookupMutationBatch(e,t){return lt(e).get(t).next((n=>n?(E(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),Lt(this.serializer,n)):null))}ps(e,t){return this.fs[t]?m.resolve(this.fs[t]):this.lookupMutationBatch(e,t).next((n=>{if(n){const s=n.keys();return this.fs[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return lt(e).ee({index:Ut,range:s},((a,o,u)=>{o.userId===this.userId&&(E(o.batchId>=n,47524,{gs:n}),i=Lt(this.serializer,o)),u.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=zt;return lt(e).ee({index:Ut,range:t,reverse:!0},((s,i,a)=>{n=i.batchId,a.done()})).next((()=>n))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,zt],[this.userId,Number.POSITIVE_INFINITY]);return lt(e).H(Ut,t).next((n=>n.map((s=>Lt(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=os(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return mn(e).ee({range:s},((a,o,u)=>{const[c,l,h]=a,d=Be(l);if(c===this.userId&&t.path.isEqual(d))return lt(e).get(h).next((_=>{if(!_)throw V(61480,{ys:a,batchId:h});E(_.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:_.userId,batchId:h}),i.push(Lt(this.serializer,_))}));u.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new F(S);const s=[];return t.forEach((i=>{const a=os(this.userId,i.path),o=IDBKeyRange.lowerBound(a),u=mn(e).ee({range:o},((c,l,h)=>{const[d,_,y]=c,R=Be(_);d===this.userId&&i.path.isEqual(R)?n=n.add(y):h.done()}));s.push(u)})),m.waitFor(s).next((()=>this.ws(e,n)))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=os(this.userId,n),a=IDBKeyRange.lowerBound(i);let o=new F(S);return mn(e).ee({range:a},((u,c,l)=>{const[h,d,_]=u,y=Be(d);h===this.userId&&n.isPrefixOf(y)?y.length===s&&(o=o.add(_)):l.done()})).next((()=>this.ws(e,o)))}ws(e,t){const n=[],s=[];return t.forEach((i=>{s.push(lt(e).get(i).next((a=>{if(a===null)throw V(35274,{batchId:i});E(a.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:a.userId,batchId:i}),n.push(Lt(this.serializer,a))})))})),m.waitFor(s).next((()=>n))}removeMutationBatch(e,t){return Bl(e.le,this.userId,t).next((n=>(e.addOnCommittedListener((()=>{this.bs(t.batchId)})),m.forEach(n,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}bs(e){delete this.fs[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return m.resolve();const n=IDBKeyRange.lowerBound((function(a){return[a]})(this.userId)),s=[];return mn(e).ee({range:n},((i,a,o)=>{if(i[0]===this.userId){const u=Be(i[1]);s.push(u)}else o.done()})).next((()=>{E(s.length===0,56720,{vs:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return ql(e,this.userId,t)}Ss(e){return zl(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:zt,lastStreamToken:""}))}}function ql(r,e,t){const n=os(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return mn(r).ee({range:i,X:!0},((o,u,c)=>{const[l,h,d]=o;l===e&&h===s&&(a=!0),c.done()})).next((()=>a))}function lt(r){return ne(r,Oe)}function mn(r){return ne(r,Tn)}function zl(r){return ne(r,yr)}/**
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
 */class rt{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new rt(0)}static Cs(){return new rt(-1)}}/**
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
 */class R_{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.Fs(e).next((t=>{const n=new rt(t.highestTargetId);return t.highestTargetId=n.next(),this.Os(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.Fs(e).next((t=>P.fromTimestamp(new U(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.Fs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,n){return this.Fs(e).next((s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Os(e,s))))}addTargetData(e,t){return this.Ms(e,t).next((()=>this.Fs(e).next((n=>(n.targetCount+=1,this.Ns(t,n),this.Os(e,n))))))}updateTargetData(e,t){return this.Ms(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>ln(e).delete(t.targetId))).next((()=>this.Fs(e))).next((n=>(E(n.targetCount>0,8065),n.targetCount-=1,this.Os(e,n))))}removeTargets(e,t,n){let s=0;const i=[];return ln(e).ee(((a,o)=>{const u=sr(this.serializer,o);u.sequenceNumber<=t&&n.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))})).next((()=>m.waitFor(i))).next((()=>s))}forEachTarget(e,t){return ln(e).ee(((n,s)=>{const i=sr(this.serializer,s);t(i)}))}Fs(e){return Tu(e).get(Es).next((t=>(E(t!==null,2888),t)))}Os(e,t){return Tu(e).put(Es,t)}Ms(e,t){return ln(e).put(Ll(this.serializer,t))}Ns(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.Fs(e).next((t=>t.targetCount))}getTargetData(e,t){const n=ii(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return ln(e).ee({range:s,index:sc},((a,o,u)=>{const c=sr(this.serializer,o);Ua(t,c.target)&&(i=c,u.done())})).next((()=>i))}addMatchingKeys(e,t,n){const s=[],i=ft(e);return t.forEach((a=>{const o=me(a.path);s.push(i.put({targetId:n,path:o})),s.push(this.referenceDelegate.addReference(e,n,a))})),m.waitFor(s)}removeMatchingKeys(e,t,n){const s=ft(e);return m.forEach(t,(i=>{const a=me(i.path);return m.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(e,n,i)])}))}removeMatchingKeysForTargetId(e,t){const n=ft(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=ft(e);let i=C();return s.ee({range:n,X:!0},((a,o,u)=>{const c=Be(a[1]),l=new A(c);i=i.add(l)})).next((()=>i))}containsKey(e,t){const n=me(t.path),s=IDBKeyRange.bound([n],[Wu(n)],!1,!0);let i=0;return ft(e).ee({index:aa,X:!0,range:s},(([a,o],u,c)=>{a!==0&&(i++,c.done())})).next((()=>i>0))}dt(e,t){return ln(e).get(t).next((n=>n?sr(this.serializer,n):null))}}function ln(r){return ne(r,En)}function Tu(r){return ne(r,$t)}function ft(r){return ne(r,wn)}/**
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
 */class P_{constructor(e,t){this.db=e,this.garbageCollector=ll(this,t)}lr(e){const t=this.Ls(e);return this.db.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Er(e,t){return this.Bs(e,((n,s)=>t(s)))}addReference(e,t,n){return ss(e,n)}removeReference(e,t,n){return ss(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return ss(e,t)}Us(e,t){return(function(s,i){let a=!1;return zl(s).te((o=>ql(s,o,i).next((u=>(u&&(a=!0),m.resolve(!u)))))).next((()=>a))})(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Bs(e,((a,o)=>{if(o<=t){const u=this.Us(e,a).next((c=>{if(!c)return i++,n.getEntry(e,a).next((()=>(n.removeEntry(a,P.min()),ft(e).delete((function(h){return[0,me(h.path)]})(a)))))}));s.push(u)}})).next((()=>m.waitFor(s))).next((()=>n.apply(e))).next((()=>i))}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return ss(e,t)}Bs(e,t){const n=ft(e);let s,i=ye.ce;return n.ee({index:aa},(([a,o],{path:u,sequenceNumber:c})=>{a===0?(i!==ye.ce&&t(new A(Be(s)),i),i=c,s=u):i=ye.ce})).next((()=>{i!==ye.ce&&t(new A(Be(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function ss(r,e){return ft(r).put((function(n,s){return{targetId:0,path:me(n.path),sequenceNumber:s}})(e,r.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function $l(r,e){var n;let t=e;for(const s of r.stages)t=x_({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function ui(r,e){return $l(r,[e]).length>0}function Gl(r,e){return H(r)?ui(r,e):Hs(r,e)}function x_(r,e,t){if(e instanceof Gr)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&`/${o.key.getCollectionPath().canonicalString()}`===i.Vr))})(0,e,t);if(e instanceof jr)return(function(s,i,a){return a.filter((o=>{const u=_r(b(i.condition).evaluate(s,o));return u!==void 0&&ke(u,Ee)}))})(r,e,t);if(e instanceof Kr)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&o.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof ti)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()))})(0,0,t);if(e instanceof ni)return(function(s,i,a){return a.filter((o=>o.isFoundDocument()&&i.mr.has(o.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Vt)return(function(s,i,a){return a.slice(0,i.limit)})(0,e,t);if(e instanceof ze)return(function(s,i,a){const o=i.orderings.map((u=>({ks:b(u.expr),direction:u.direction})));return[...a].sort(((u,c)=>{for(const{ks:l,direction:h}of o){const d=_r(l.evaluate(s,u)),_=_r(l.evaluate(s,c)),y=_e(d??Ge,_??Ge);if(y!==0)return h==="ascending"?y:-y}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function ji(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof ze)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=_r(b(s.expr).evaluate({serializer:r.serializer},t)),a=_r(b(s.expr).evaluate({serializer:r.serializer},n)),o=_e(i||Ge,a||Ge);if(o!==0)return s.direction==="ascending"?o:-o}return 0}}function yi(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof Vt)return{limit:t.limit}}}/**
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
 */class Kl{constructor(){this.changes=new at((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,K.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?m.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class b_{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return ht(e).put(n)}removeEntry(e,t,n){return ht(e).delete((function(i,a){const o=i.path.toArray();return[o.slice(0,o.length-2),o[o.length-2],Ss(a),o[o.length-1]]})(t,n))}updateMetadata(e,t){return this.getMetadata(e).next((n=>(n.byteSize+=t,this.qs(e,n))))}getEntry(e,t){let n=K.newInvalidDocument(t);return ht(e).ee({index:us,range:IDBKeyRange.only(er(t))},((s,i)=>{n=this.$s(t,i)})).next((()=>n))}Ks(e,t){let n={size:0,document:K.newInvalidDocument(t)};return ht(e).ee({index:us,range:IDBKeyRange.only(er(t))},((s,i)=>{n={document:this.$s(t,i),size:Ds(i)}})).next((()=>n))}getEntries(e,t){let n=te();return this.Ws(e,t,((s,i)=>{const a=this.$s(s,i);n=n.insert(s,a)})).next((()=>n))}getAllEntries(e){let t=te();return ht(e).ee(((n,s)=>{const i=this.$s(A.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}Qs(e,t){let n=te(),s=new q(A.comparator);return this.Ws(e,t,((i,a)=>{const o=this.$s(i,a);n=n.insert(i,o),s=s.insert(i,Ds(a))})).next((()=>({documents:n,Gs:s})))}Ws(e,t,n){if(t.isEmpty())return m.resolve();let s=new F(Au);t.forEach((u=>s=s.add(u)));const i=IDBKeyRange.bound(er(s.first()),er(s.last())),a=s.getIterator();let o=a.getNext();return ht(e).ee({index:us,range:i},((u,c,l)=>{const h=A.fromSegments([...c.prefixPath,c.collectionGroup,c.documentId]);for(;o&&Au(o,h)<0;)n(o,null),o=a.getNext();o&&o.isEqual(h)&&(n(o,c),o=a.hasNext()?a.getNext():null),o?l.j(er(o)):l.done()})).next((()=>{for(;o;)n(o,null),o=a.hasNext()?a.getNext():null}))}getDocumentsMatchingQuery(e,t,n,s,i){const a=H(t)?D.fromString(Qr(t)):t.path,o=[a.popLast().toArray(),a.lastSegment(),Ss(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],u=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return ht(e).H(IDBKeyRange.bound(o,u,!0)).next((c=>{i==null||i.incrementDocumentReadCount(c.length);let l=te();for(const h of c){const d=this.$s(A.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);d.isFoundDocument()&&(Gl(t,d)||s.has(d.key))&&(l=l.insert(d.key,d))}return l}))}getAllFromCollectionGroup(e,t,n,s){let i=te();const a=wu(t,n),o=wu(t,be.max());return ht(e).ee({index:rc,range:IDBKeyRange.bound(a,o,!0)},((u,c,l)=>{const h=this.$s(A.fromSegments(c.prefixPath.concat(c.collectionGroup,c.documentId)),c);i=i.insert(h.key,h),i.size===s&&l.done()})).next((()=>i))}newChangeBuffer(e){return new S_(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return Eu(e).get(Pi).next((t=>(E(!!t,20021),t)))}qs(e,t){return Eu(e).put(Pi,t)}$s(e,t){if(t){const n=__(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(P.min())))return n}return K.newInvalidDocument(e)}}function jl(r){return new b_(r)}class S_ extends Kl{constructor(e,t){super(),this.zs=e,this.trackRemovals=t,this.js=new at((n=>n.toString()),((n,s)=>n.isEqual(s)))}applyChanges(e){const t=[];let n=0,s=new F(((i,a)=>S(i.canonicalString(),a.canonicalString())));return this.changes.forEach(((i,a)=>{const o=this.js.get(i);if(t.push(this.zs.removeEntry(e,i,o.readTime)),a.isValidDocument()){const u=ou(this.zs.serializer,a);s=s.add(i.path.popLast());const c=Ds(u);n+=c-o.size,t.push(this.zs.addEntry(e,i,u))}else if(n-=o.size,this.trackRemovals){const u=ou(this.zs.serializer,a.convertToNoDocument(P.min()));t.push(this.zs.addEntry(e,i,u))}})),s.forEach((i=>{t.push(this.zs.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.zs.updateMetadata(e,n)),m.waitFor(t)}getFromCache(e,t){return this.zs.Ks(e,t).next((n=>(this.js.set(t,{size:n.size,readTime:n.document.readTime}),n.document)))}getAllFromCache(e,t){return this.zs.Qs(e,t).next((({documents:n,Gs:s})=>(s.forEach(((i,a)=>{this.js.set(i,{size:a,readTime:n.get(i).readTime})})),n)))}}function Eu(r){return ne(r,Ir)}function ht(r){return ne(r,Ts)}function er(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function wu(r,e){const t=e.documentKey.path.toArray();return[r,Ss(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Au(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=S(t[i],n[i]),s)return s;return s=S(t.length,n.length),s||(s=S(t[t.length-2],n[n.length-2]),s||S(t[t.length-1],n[n.length-1]))}/**
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
 */class C_{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class Ql{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&lr(n.mutation,s,Ie.empty(),U.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,C()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=C()){const s=Ce();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let a=Ot();return i.forEach(((o,u)=>{a=a.insert(o,u.overlayedDocument)})),a}))))}getOverlayedDocuments(e,t){const n=Ce();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,C())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((a,o)=>{t.set(a,o)}))}))}computeViews(e,t,n,s){let i=te();const a=fr(),o=(function(){return fr()})();return t.forEach(((u,c)=>{const l=n.get(c.key);s.has(c.key)&&(l===void 0||l.mutation instanceof it)?i=i.insert(c.key,c):l!==void 0?(a.set(c.key,l.mutation.getFieldMask()),lr(l.mutation,c,l.mutation.getFieldMask(),U.now())):a.set(c.key,Ie.empty())})),this.recalculateAndSaveOverlays(e,i).next((u=>(u.forEach(((c,l)=>a.set(c,l))),t.forEach(((c,l)=>o.set(c,new C_(l,a.get(c)??null)))),o)))}recalculateAndSaveOverlays(e,t){const n=fr();let s=new q(((a,o)=>a-o)),i=C();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((a=>{for(const o of a)o.keys().forEach((u=>{const c=t.get(u);if(c===null)return;let l=n.get(u)||Ie.empty();l=o.applyToLocalView(c,l),n.set(u,l);const h=(s.get(o.batchId)||C()).add(u);s=s.insert(o.batchId,h)}))})).next((()=>{const a=[],o=s.getReverseIterator();for(;o.hasNext();){const u=o.getNext(),c=u.key,l=u.value,h=zc();l.forEach((d=>{if(!i.has(d)){const _=Pc(t.get(d),n.get(d));_!==null&&h.set(d,_),i=i.add(d)}})),a.push(this.documentOverlayCache.saveOverlays(e,c,h))}return m.waitFor(a)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return H(t)?this.getDocumentsMatchingPipeline(e,t,n,s):Hd(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Mc(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):m.resolve(Ce());let o=yn,u=i;return a.next((c=>m.forEach(c,((l,h)=>(o<h.largestBatchId&&(o=h.largestBatchId),i.get(l)?m.resolve():this.remoteDocumentCache.getEntry(e,l).next((d=>{u=u.insert(l,d)}))))).next((()=>this.populateOverlays(e,c,i))).next((()=>this.computeViews(e,u,c,C()))).next((l=>({batchId:o,changes:qc(l)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new A(t)).next((n=>{let s=Ot();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let a=Ot();return this.indexManager.getCollectionParents(e,i).next((o=>m.forEach(o,(u=>{const c=(function(h,d){return new qn(d,null,h.explicitOrderBy.slice(),h.filters.slice(),h.limit,h.limitType,h.startAt,h.endAt)})(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,c,n,s).next((l=>{l.forEach(((h,d)=>{a=a.insert(h,d)}))}))})).next((()=>a))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((a=>this.retrieveMatchingLocalDocuments(i,a,(o=>Hs(t,o)))))}getDocumentsMatchingPipeline(e,t,n,s){if(Je(t)==="collection_group"){const i=Da(t);let a=Ot();return this.indexManager.getCollectionParents(e,i).next((o=>m.forEach(o,(u=>{const c=(function(h,d){const _=h.stages.map((y=>y instanceof Kr?new Gr(d.canonicalString(),{}):y));return new fe(h.serializer,_)})(t,u.child(i));return this.getDocumentsMatchingPipeline(e,c,n,s).next((l=>{l.forEach(((h,d)=>{a=a.insert(h,d)}))}))})).next((()=>a))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((a=>{switch(i=a,Je(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let o=C();for(const u of xs(t))o=o.add(A.fromPath(u));return this.remoteDocumentCache.getEntries(e,o);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new T("invalid-argument",`Invalid pipeline source to execute offline: ${Xe(t)}`)}})).next((a=>this.retrieveMatchingLocalDocuments(i,a,(o=>ui(t,o)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,a)=>{const o=a.getKey();t.get(o)===null&&(t=t.insert(o,K.newInvalidDocument(o)))}));let s=Ot();return t.forEach(((i,a)=>{const o=e.get(i);o!==void 0&&lr(o.mutation,a,Ie.empty(),U.now()),n(a)&&(s=s.insert(i,a))})),s}getOverlaysForPipeline(e,t,n){switch(Je(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,D.fromString(Qr(t)),n);case"collection_group":throw new T("invalid-argument",`Unexpected collection group pipeline: ${Xe(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,xs(t).map((s=>A.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new T("invalid-argument",`Failed to get overlays for pipeline: ${Xe(t)}`)}}}/**
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
 */class D_{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return m.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:ue(s.createTime)}})(t)),m.resolve()}getNamedQuery(e,t){return m.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,(function(s){return{name:s.name,query:Ml(s.bundledQuery),readTime:ue(s.readTime)}})(t)),m.resolve()}}/**
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
 */class N_{constructor(){this.overlays=new q(A.comparator),this.Ys=new Map}getOverlay(e,t){return m.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Ce();return m.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Ce();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),m.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Hr(e,t,i)})),m.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ys.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ys.delete(n)),m.resolve()}getOverlaysForCollection(e,t,n){const s=Ce(),i=t.length+1,a=new A(t.child("")),o=this.overlays.getIteratorFrom(a);for(;o.hasNext();){const u=o.getNext().value,c=u.getKey();if(!t.isPrefixOf(c.path))break;c.path.length===i&&u.largestBatchId>n&&s.set(u.getKey(),u)}return m.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new q(((c,l)=>c-l));const a=this.overlays.getIterator();for(;a.hasNext();){const c=a.getNext().value;if(c.getKey().getCollectionGroup()===t&&c.largestBatchId>n){let l=i.get(c.largestBatchId);l===null&&(l=Ce(),i=i.insert(c.largestBatchId,l)),l.set(c.getKey(),c)}}const o=Ce(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach(((c,l)=>o.set(c,l))),!(o.size()>=s)););return m.resolve(o)}Hr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Ys.get(s.largestBatchId).delete(n.key);this.Ys.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new za(t,n));let i=this.Ys.get(t);i===void 0&&(i=C(),this.Ys.set(t,i)),this.Ys.set(t,i.add(n.key))}}/**
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
 */class k_{constructor(){this.sessionToken=j.EMPTY_BYTE_STRING}getSessionToken(e){return m.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,m.resolve()}}/**
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
 */class Ka{constructor(){this.Zs=new F(se.Xs),this.e_=new F(se.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){const n=new se(e,t);this.Zs=this.Zs.add(n),this.e_=this.e_.add(n)}n_(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.r_(new se(e,t))}i_(e,t){e.forEach((n=>this.removeReference(n,t)))}s_(e){const t=new A(new D([])),n=new se(t,e),s=new se(t,e+1),i=[];return this.e_.forEachInRange([n,s],(a=>{this.r_(a),i.push(a.key)})),i}__(){this.Zs.forEach((e=>this.r_(e)))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){const t=new A(new D([])),n=new se(t,e),s=new se(t,e+1);let i=C();return this.e_.forEachInRange([n,s],(a=>{i=i.add(a.key)})),i}containsKey(e){const t=new se(e,0),n=this.Zs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class se{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return A.comparator(e.key,t.key)||S(e.a_,t.a_)}static t_(e,t){return S(e.a_,t.a_)||A.comparator(e.key,t.key)}}/**
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
 */class O_{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new F(se.Xs)}checkEmpty(e){return m.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Ba(i,t,n,s);this.mutationQueue.push(a);for(const o of s)this.u_=this.u_.add(new se(o.key,i)),this.indexManager.addToCollectionParentIndex(e,o.key.path.popLast());return m.resolve(a)}lookupMutationBatch(e,t){return m.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.l_(n),i=s<0?0:s;return m.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return m.resolve(this.mutationQueue.length===0?zt:this.gs-1)}getAllMutationBatches(e){return m.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new se(t,0),s=new se(t,Number.POSITIVE_INFINITY),i=[];return this.u_.forEachInRange([n,s],(a=>{const o=this.c_(a.a_);i.push(o)})),m.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new F(S);return t.forEach((s=>{const i=new se(s,0),a=new se(s,Number.POSITIVE_INFINITY);this.u_.forEachInRange([i,a],(o=>{n=n.add(o.a_)}))})),m.resolve(this.E_(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;A.isDocumentKey(i)||(i=i.child(""));const a=new se(new A(i),0);let o=new F(S);return this.u_.forEachWhile((u=>{const c=u.key.path;return!!n.isPrefixOf(c)&&(c.length===s&&(o=o.add(u.a_)),!0)}),a),m.resolve(this.E_(o))}E_(e){const t=[];return e.forEach((n=>{const s=this.c_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){E(this.h_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.u_;return m.forEach(t.mutations,(s=>{const i=new se(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.u_=n}))}bs(e){}containsKey(e,t){const n=new se(t,0),s=this.u_.firstAfterOrEqual(n);return m.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,m.resolve()}h_(e,t){return this.l_(e)}l_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}c_(e){const t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class L_{constructor(e){this.T_=e,this.docs=(function(){return new q(A.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,a=this.T_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return m.resolve(n?n.document.mutableCopy():K.newInvalidDocument(t))}getEntries(e,t){let n=te();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():K.newInvalidDocument(s))})),m.resolve(n)}getAllEntries(e){let t=te();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),m.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,a;H(t)?(i=D.fromString(Qr(t)),a=l=>ui(t,l)):(i=t.path,a=l=>Hs(t,l));let o=te();const u=new A(i.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(u);for(;c.hasNext();){const{key:l,value:{document:h}}=c.getNext();if(!i.isPrefixOf(l.path))break;l.path.length>i.length+1||sa(Ju(h),n)<=0||(s.has(h.key)||a(h))&&(o=o.insert(h.key,h.mutableCopy()))}return m.resolve(o)}getAllFromCollectionGroup(e,t,n,s){V(9500)}P_(e,t){return m.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new M_(this)}getSize(e){return m.resolve(this.size)}}class M_ extends Kl{constructor(e){super(),this.zs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.zs.addEntry(e,s)):this.zs.removeEntry(n)})),m.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
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
 */class F_{constructor(e){this.persistence=e,this.R_=new at((t=>ii(t)),Ua),this.lastRemoteSnapshotVersion=P.min(),this.highestTargetId=0,this.I_=0,this.A_=new Ka,this.targetCount=0,this.V_=rt.xs()}forEachTarget(e,t){return this.R_.forEach(((n,s)=>t(s))),m.resolve()}getLastRemoteSnapshotVersion(e){return m.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return m.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),m.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.I_&&(this.I_=t),m.resolve()}Ms(e){this.R_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.V_=new rt(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,m.resolve()}updateTargetData(e,t){return this.Ms(t),m.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,m.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.R_.forEach(((a,o)=>{o.sequenceNumber<=t&&n.get(o.targetId)===null&&(this.R_.delete(a),i.push(this.removeMatchingKeysForTargetId(e,o.targetId)),s++)})),m.waitFor(i).next((()=>s))}getTargetCount(e){return m.resolve(this.targetCount)}getTargetData(e,t){const n=this.R_.get(t)||null;return m.resolve(n)}addMatchingKeys(e,t,n){return this.A_.n_(t,n),m.resolve()}removeMatchingKeys(e,t,n){this.A_.i_(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((a=>{i.push(s.markPotentiallyOrphaned(e,a))})),m.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),m.resolve()}getMatchingKeysForTargetId(e,t){const n=this.A_.o_(t);return m.resolve(n)}containsKey(e,t){return m.resolve(this.A_.containsKey(t))}}/**
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
 */class ja{constructor(e,t){this.d_={},this.overlays={},this.f_=new ye(0),this.m_=!1,this.m_=!0,this.p_=new k_,this.referenceDelegate=e(this),this.g_=new F_(this),this.indexManager=new V_,this.remoteDocumentCache=(function(s){return new L_(s)})((n=>this.referenceDelegate.y_(n))),this.serializer=new Ol(t),this.w_=new D_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new N_,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.d_[e.toKey()];return n||(n=new O_(t,this.referenceDelegate),this.d_[e.toKey()]=n),n}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,n){I("MemoryPersistence","Starting transaction:",e);const s=new U_(this.f_.next());return this.referenceDelegate.b_(),n(s).next((i=>this.referenceDelegate.v_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}S_(e,t){return m.or(Object.values(this.d_).map((n=>()=>n.containsKey(e,t))))}}class U_ extends Zu{constructor(e){super(),this.currentSequenceNumber=e}}class ci{constructor(e){this.persistence=e,this.D_=new Ka,this.x_=null}static C_(e){return new ci(e)}get F_(){if(this.x_)return this.x_;throw V(60996)}addReference(e,t,n){return this.D_.addReference(n,t),this.F_.delete(n.toString()),m.resolve()}removeReference(e,t,n){return this.D_.removeReference(n,t),this.F_.add(n.toString()),m.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),m.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach((s=>this.F_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.F_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}b_(){this.x_=new Set}v_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return m.forEach(this.F_,(n=>{const s=A.fromPath(n);return this.O_(e,s).next((i=>{i||t.removeEntry(s,P.min())}))})).next((()=>(this.x_=null,t.apply(e))))}updateLimboDocument(e,t){return this.O_(e,t).next((n=>{n?this.F_.delete(t.toString()):this.F_.add(t.toString())}))}y_(e){return 0}O_(e,t){return m.or([()=>m.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class Ns{constructor(e,t){this.persistence=e,this.M_=new at((n=>me(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=ll(this,t)}static C_(e,t){return new Ns(e,t)}b_(){}v_(e){return m.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){const t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}Ls(e){let t=0;return this.Er(e,(n=>{t++})).next((()=>t))}Er(e,t){return m.forEach(this.M_,((n,s)=>this.Us(e,n,s).next((i=>i?m.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.P_(e,(a=>this.Us(e,a,t).next((o=>{o||(n++,i.removeEntry(a,P.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),m.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),m.resolve()}removeReference(e,t,n){return this.M_.set(n,e.currentSequenceNumber),m.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),m.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=cs(e.data.value)),t}Us(e,t,n){return m.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.M_.get(t);return m.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class B_{constructor(e){this.serializer=e}U(e,t,n,s){const i=new qs("createOrUpgrade",t);n<1&&s>=1&&((function(u){u.createObjectStore(Ur)})(e),(function(u){u.createObjectStore(yr,{keyPath:sd}),u.createObjectStore(Oe,{keyPath:bo,autoIncrement:!0}).createIndex(Ut,So,{unique:!0}),u.createObjectStore(Tn)})(e),Vu(e),(function(u){u.createObjectStore(Nt)})(e));let a=m.resolve();return n<3&&s>=3&&(n!==0&&((function(u){u.deleteObjectStore(wn),u.deleteObjectStore(En),u.deleteObjectStore($t)})(e),Vu(e)),a=a.next((()=>(function(u){const c=u.store($t),l={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:P.min().toTimestamp(),targetCount:0};return c.put(Es,l)})(i)))),n<4&&s>=4&&(n!==0&&(a=a.next((()=>(function(u,c){return c.store(Oe).H().next((h=>{u.deleteObjectStore(Oe),u.createObjectStore(Oe,{keyPath:bo,autoIncrement:!0}).createIndex(Ut,So,{unique:!0});const d=c.store(Oe),_=h.map((y=>d.put(y)));return m.waitFor(_)}))})(e,i)))),a=a.next((()=>{(function(u){u.createObjectStore(An,{keyPath:fd})})(e)}))),n<5&&s>=5&&(a=a.next((()=>this.N_(i)))),n<6&&s>=6&&(a=a.next((()=>((function(u){u.createObjectStore(Ir)})(e),this.L_(i))))),n<7&&s>=7&&(a=a.next((()=>this.B_(i)))),n<8&&s>=8&&(a=a.next((()=>this.U_(e,i)))),n<9&&s>=9&&(a=a.next((()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)}))),n<10&&s>=10&&(a=a.next((()=>this.k_(i)))),n<11&&s>=11&&(a=a.next((()=>{(function(u){u.createObjectStore(zs,{keyPath:md})})(e),(function(u){u.createObjectStore($s,{keyPath:_d})})(e)}))),n<12&&s>=12&&(a=a.next((()=>{(function(u){const c=u.createObjectStore(Gs,{keyPath:wd});c.createIndex(bi,Ad,{unique:!1}),c.createIndex(oc,Vd,{unique:!1})})(e)}))),n<13&&s>=13&&(a=a.next((()=>(function(u){const c=u.createObjectStore(Ts,{keyPath:ad});c.createIndex(us,od),c.createIndex(rc,ud)})(e))).next((()=>this.q_(e,i))).next((()=>e.deleteObjectStore(Nt)))),n<14&&s>=14&&(a=a.next((()=>this.K_(e,i)))),n<15&&s>=15&&(a=a.next((()=>(function(u){u.createObjectStore(oa,{keyPath:pd,autoIncrement:!0}).createIndex(xi,gd,{unique:!1}),u.createObjectStore(or,{keyPath:yd}).createIndex(ic,Id,{unique:!1}),u.createObjectStore(ur,{keyPath:Td}).createIndex(ac,Ed,{unique:!1})})(e)))),n<16&&s>=16&&(a=a.next((()=>{t.objectStore(or).clear()})).next((()=>{t.objectStore(ur).clear()}))),n<17&&s>=17&&(a=a.next((()=>{(function(u){u.createObjectStore(ua,{keyPath:vd})})(e)}))),n<18&&s>=18&&Ku()&&(a=a.next((()=>{t.objectStore(or).clear()})).next((()=>{t.objectStore(ur).clear()}))),a}L_(e){let t=0;return e.store(Nt).ee(((n,s)=>{t+=Ds(s)})).next((()=>{const n={byteSize:t};return e.store(Ir).put(Pi,n)}))}N_(e){const t=e.store(yr),n=e.store(Oe);return t.H().next((s=>m.forEach(s,(i=>{const a=IDBKeyRange.bound([i.userId,zt],[i.userId,i.lastAcknowledgedBatchId]);return n.H(Ut,a).next((o=>m.forEach(o,(u=>{E(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const c=Lt(this.serializer,u);return Bl(e,i.userId,c).next((()=>{}))}))))}))))}B_(e){const t=e.store(wn),n=e.store(Nt);return e.store($t).get(Es).next((s=>{const i=[];return n.ee(((a,o)=>{const u=new D(a),c=(function(h){return[0,me(h)]})(u);i.push(t.get(c).next((l=>l?m.resolve():(h=>t.put({targetId:0,path:me(h),sequenceNumber:s.highestListenSequenceNumber}))(u))))})).next((()=>m.waitFor(i)))}))}U_(e,t){e.createObjectStore(Tr,{keyPath:dd});const n=t.store(Tr),s=new Ga,i=a=>{if(s.add(a)){const o=a.lastSegment(),u=a.popLast();return n.put({collectionId:o,parent:me(u)})}};return t.store(Nt).ee({X:!0},((a,o)=>{const u=new D(a);return i(u.popLast())})).next((()=>t.store(Tn).ee({X:!0},(([a,o,u],c)=>{const l=Be(o);return i(l.popLast())}))))}k_(e){const t=e.store(En);return t.ee(((n,s)=>{const i=sr(this.serializer,s),a=Ll(this.serializer,i);return t.put(a)}))}q_(e,t){const n=t.store(Nt),s=[];return n.ee(((i,a)=>{const o=t.store(Ts),u=(function(h){return h.document?new A(D.fromString(h.document.name).popFirst(5)):h.noDocument?A.fromSegments(h.noDocument.path):h.unknownDocument?A.fromSegments(h.unknownDocument.path):V(36783)})(a).path.toArray(),c={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(o.put(c))})).next((()=>m.waitFor(s)))}K_(e,t){const n=t.store(Oe),s=jl(this.serializer),i=new ja(ci.C_,this.serializer.zr);return n.H().next((a=>{const o=new Map;return a.forEach((u=>{let c=o.get(u.userId)??C();Lt(this.serializer,u).keys().forEach((l=>c=c.add(l))),o.set(u.userId,c)})),m.forEach(o,((u,c)=>{const l=new ie(c),h=ai.jr(this.serializer,l),d=i.getIndexManager(l),_=oi.jr(l,this.serializer,d,i.referenceDelegate);return new Ql(s,_,h,d).recalculateAndSaveOverlaysForDocumentKeys(new Si(t,ye.ce),u).next()}))}))}}function Vu(r){r.createObjectStore(wn,{keyPath:ld}).createIndex(aa,hd,{unique:!0}),r.createObjectStore(En,{keyPath:"targetId"}).createIndex(sc,cd,{unique:!0}),r.createObjectStore($t)}const dt="IndexedDbPersistence",Ii=18e5,Ti=5e3,Ei="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",q_="main";class Qa{constructor(e,t,n,s,i,a,o,u,c,l,h=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.Tn=i,this.window=a,this.document=o,this.W_=c,this.Q_=l,this.G_=h,this.f_=null,this.m_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.z_=null,this.inForeground=!1,this.j_=null,this.H_=null,this.J_=Number.NEGATIVE_INFINITY,this.Y_=d=>Promise.resolve(),!Qa.C())throw new T(p.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new P_(this,s),this.Z_=t+q_,this.serializer=new Ol(u),this.X_=new pt(this.Z_,this.G_,new B_(this.serializer)),this.p_=new y_,this.g_=new R_(this.referenceDelegate,this.serializer),this.remoteDocumentCache=jl(this.serializer),this.w_=new g_,this.window&&this.window.localStorage?this.eo=this.window.localStorage:(this.eo=null,l===!1&&Y(dt,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.no().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new T(p.FAILED_PRECONDITION,Ei);return this.ro(),this.io(),this.so(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.g_.getHighestSequenceNumber(e)))})).then((e=>{this.f_=new ye(e,this.W_)})).then((()=>{this.m_=!0})).catch((e=>(this.X_&&this.X_.close(),Promise.reject(e))))}_o(e){return this.Y_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.X_.q((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Tn.enqueueAndForget((async()=>{this.started&&await this.no()})))}no(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>is(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.oo(e).next((t=>{t||(this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))))}))})).next((()=>this.ao(e))).next((t=>this.isPrimary&&!t?this.uo(e).next((()=>!1)):!!t&&this.co(e).next((()=>!0)))))).catch((e=>{if(bt(e))return I(dt,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return I(dt,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.Tn.enqueueRetryable((()=>this.Y_(e))),this.isPrimary=e}))}oo(e){return tr(e).get(rn).next((t=>m.resolve(this.lo(t))))}Eo(e){return is(e).delete(this.clientId)}async ho(){if(this.isPrimary&&!this.To(this.J_,Ii)){this.J_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const n=ne(t,An);return n.H().next((s=>{const i=this.Po(s,Ii),a=s.filter((o=>i.indexOf(o)===-1));return m.forEach(a,(o=>n.delete(o.clientId))).next((()=>a))}))})).catch((()=>[]));if(this.eo)for(const t of e)this.eo.removeItem(this.Ro(t.clientId))}}so(){this.H_=this.Tn.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.no().then((()=>this.ho())).then((()=>this.so()))))}lo(e){return!!e&&e.ownerId===this.clientId}ao(e){return this.Q_?m.resolve(!0):tr(e).get(rn).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,Ti)&&!this.Io(t.ownerId)){if(this.lo(t)&&this.networkEnabled)return!0;if(!this.lo(t)){if(!t.allowTabSynchronization)throw new T(p.FAILED_PRECONDITION,Ei);return!1}}return!(!this.networkEnabled||!this.inForeground)||is(e).H().next((n=>this.Po(n,Ti).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,o=this.networkEnabled===s.networkEnabled;if(i||a&&o)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&I(dt,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.m_=!1,this.Ao(),this.H_&&(this.H_.cancel(),this.H_=null),this.Vo(),this.fo(),await this.X_.runTransaction("shutdown","readwrite",[Ur,An],(e=>{const t=new Si(e,ye.ce);return this.uo(t).next((()=>this.Eo(t)))})),this.X_.close(),this.mo()}Po(e,t){return e.filter((n=>this.To(n.updateTimeMs,t)&&!this.Io(n.clientId)))}po(){return this.runTransaction("getActiveClients","readonly",(e=>is(e).H().next((t=>this.Po(t,Ii).map((n=>n.clientId))))))}get started(){return this.m_}getGlobalsCache(){return this.p_}getMutationQueue(e,t){return oi.jr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new v_(e,this.serializer.zr.databaseId)}getDocumentOverlayCache(e){return ai.jr(this.serializer,e)}getBundleCache(){return this.w_}runTransaction(e,t,n){I(dt,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(u){return u===18?xd:u===17?hc:u===16?Pd:u===15?ca:u===14?lc:u===13?cc:u===12?Rd:u===11?uc:void V(60245)})(this.G_);let a;return this.X_.runTransaction(e,s,i,(o=>(a=new Si(o,this.f_?this.f_.next():ye.ce),t==="readwrite-primary"?this.oo(a).next((u=>!!u||this.ao(a))).next((u=>{if(!u)throw Y(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Tn.enqueueRetryable((()=>this.Y_(!1))),new T(p.FAILED_PRECONDITION,Xu);return n(a)})).next((u=>this.co(a).next((()=>u)))):this.yo(a).next((()=>n(a)))))).then((o=>(a.raiseOnCommittedEvent(),o)))}yo(e){return tr(e).get(rn).next((t=>{if(t!==null&&this.To(t.leaseTimestampMs,Ti)&&!this.Io(t.ownerId)&&!this.lo(t)&&!(this.Q_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new T(p.FAILED_PRECONDITION,Ei)}))}co(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return tr(e).put(rn,t)}static C(){return pt.C()}uo(e){const t=tr(e);return t.get(rn).next((n=>this.lo(n)?(I(dt,"Releasing primary lease."),t.delete(rn)):m.resolve()))}To(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(Y(`Detected an update time that is in the future: ${e} > ${n}`),!1))}ro(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.j_=()=>{this.Tn.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.no())))},this.document.addEventListener("visibilitychange",this.j_),this.inForeground=this.document.visibilityState==="visible")}Vo(){this.j_&&(this.document.removeEventListener("visibilitychange",this.j_),this.j_=null)}io(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.z_=()=>{this.Ao();const t=/(?:Version|Mobile)\/1[456]/;Gu()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Tn.enterRestrictedMode(!0),this.Tn.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.z_))}fo(){this.z_&&(this.window.removeEventListener("pagehide",this.z_),this.z_=null)}Io(e){var t;try{const n=((t=this.eo)==null?void 0:t.getItem(this.Ro(e)))!==null;return I(dt,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return Y(dt,"Failed to get zombied client id.",n),!1}}Ao(){if(this.eo)try{this.eo.setItem(this.Ro(this.clientId),String(Date.now()))}catch(e){Y("Failed to set zombie client id.",e)}}mo(){if(this.eo)try{this.eo.removeItem(this.Ro(this.clientId))}catch{}}Ro(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function tr(r){return ne(r,Ur)}function is(r){return ne(r,An)}function Wl(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class Wa{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.wo=n,this.bo=s}static vo(e,t){let n=C(),s=C();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Wa(e,t.fromCache,n,s)}}/**
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
 */function z_(r,e){return A.comparator(r.key,e.key)}/**
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
 */class $_{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class Hl{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(function(){return Gu()?8:ec(gs())>0?6:4})()}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.Oo(e,t).next((a=>{i.result=a})).next((()=>{if(!i.result)return this.Mo(e,t,s,n).next((a=>{i.result=a}))})).next((()=>{if(i.result)return;const a=new $_;return this.No(e,t,a).next((o=>{if(i.result=o,this.Do)return this.Lo(e,t,a,o.size)}))})).next((()=>i.result))}Lo(e,t,n,s){return H(t)?m.resolve():n.documentReadCount<this.xo?(hn()<=We.DEBUG&&I("QueryEngine","SDK will not create cache indexes for query:",dr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),m.resolve()):(hn()<=We.DEBUG&&I("QueryEngine","Query:",dr(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Co*s?(hn()<=We.DEBUG&&I("QueryEngine","The SDK decides to create cache indexes for query:",dr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,xe(t))):m.resolve())}Oo(e,t){if(H(t))return m.resolve(null);let n=t;if(Go(n))return m.resolve(null);let s=xe(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=Rs(n,null,"F"),s=xe(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((a=>{const o=C(...a);return this.Fo.getDocuments(e,o).next((u=>this.indexManager.getMinOffset(e,s).next((c=>{const l=this.Bo(n,u);return this.Uo(n,l,o,c.readTime)?this.Oo(e,Rs(n,null,"F")):this.ko(e,l,n,c)}))))})))))}Mo(e,t,n,s){return(H(t)?(function(a){for(const o of a.stages){if(o instanceof Vt||o instanceof iu)return!1;if(o instanceof jr){if(o.condition instanceof wl&&o.condition._expr.name==="exists"&&o.condition._expr.params[0]instanceof en&&o.condition._expr.params[0].fieldName===Ue)continue;return!1}}return!0})(t):Go(t))||s.isEqual(P.min())?m.resolve(null):this.Fo.getDocuments(e,n).next((i=>{const a=this.Bo(t,i);return this.Uo(t,a,n,s)?m.resolve(null):(hn()<=We.DEBUG&&I("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),au(t)),this.ko(e,a,t,Yu(s,yn)).next((o=>o)))}))}Bo(e,t){let n,s;return H(e)?(n=new F(z_),s=i=>ui(e,i)):(n=new F(Ia(e)),s=i=>Hs(e,i)),t.forEach(((i,a)=>{s(a)&&(n=n.add(a))})),n}Uo(e,t,n,s){if(H(e))return(function(o){return o.stages.some((u=>u instanceof Vt||u instanceof iu))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}No(e,t,n){return hn()<=We.DEBUG&&I("QueryEngine","Using full collection scan to execute query:",au(t)),this.Fo.getDocumentsMatchingQuery(e,t,be.min(),n)}ko(e,t,n,s){return this.Fo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((a=>{i=i.insert(a.key,a)})),i)))}}/**
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
 */const Ha="LocalStore",G_=3e8;class K_{constructor(e,t,n,s){this.persistence=e,this.qo=t,this.serializer=s,this.$o=new q(S),this.Ko=new at((i=>ii(i)),Ua),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(n)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Ql(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.$o)))}}function Yl(r,e,t,n){return new K_(r,e,t,n)}async function Jl(r,e){const t=v(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.Go(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const a=[],o=[];let u=C();for(const c of s){a.push(c.batchId);for(const l of c.mutations)u=u.add(l.key)}for(const c of i){o.push(c.batchId);for(const l of c.mutations)u=u.add(l.key)}return t.localDocuments.getDocuments(n,u).next((c=>({zo:c,removedBatchIds:a,addedBatchIds:o})))}))}))}function j_(r,e){const t=v(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Qo.newChangeBuffer({trackRemovals:!0});return(function(o,u,c,l){const h=c.batch,d=h.keys();let _=m.resolve();return d.forEach((y=>{_=_.next((()=>l.getEntry(u,y))).next((R=>{const x=c.docVersions.get(y);E(x!==null,48541),R.version.compareTo(x)<0&&(h.applyToRemoteDocument(R,c),R.isValidDocument()&&(R.setReadTime(c.commitVersion),l.addEntry(R)))}))})),_.next((()=>o.mutationQueue.removeMutationBatch(u,h)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(o){let u=C();for(let c=0;c<o.mutationResults.length;++c)o.mutationResults[c].transformResults.length>0&&(u=u.add(o.batch.mutations[c].key));return u})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function Xl(r){const e=v(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.g_.getLastRemoteSnapshotVersion(t)))}function Q_(r,e){const t=v(r),n=e.snapshotVersion;let s=t.$o;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const a=t.Qo.newChangeBuffer({trackRemovals:!0});s=t.$o;const o=[];e.targetChanges.forEach(((l,h)=>{const d=s.get(h);if(!d)return;o.push(t.g_.removeMatchingKeys(i,l.removedDocuments,h).next((()=>t.g_.addMatchingKeys(i,l.addedDocuments,h))));let _=d.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(h)!==null?_=_.withResumeToken(j.EMPTY_BYTE_STRING,P.min()).withLastLimboFreeSnapshotVersion(P.min()):l.resumeToken.approximateByteSize()>0&&(_=_.withResumeToken(l.resumeToken,n)),s=s.insert(h,_),(function(R,x,k){return R.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-R.snapshotVersion.toMicroseconds()>=G_?!0:k.addedDocuments.size+k.modifiedDocuments.size+k.removedDocuments.size>0})(d,_,l)&&o.push(t.g_.updateTargetData(i,_))}));let u=te(),c=C();if(e.documentUpdates.forEach((l=>{e.resolvedLimboDocuments.has(l)&&o.push(t.persistence.referenceDelegate.updateLimboDocument(i,l))})),o.push(W_(i,a,e.documentUpdates).next((l=>{u=l.jo,c=l.Ho}))),!n.isEqual(P.min())){const l=t.g_.getLastRemoteSnapshotVersion(i).next((h=>t.g_.setTargetsMetadata(i,i.currentSequenceNumber,n)));o.push(l)}return m.waitFor(o).next((()=>a.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,u,c))).next((()=>u))})).then((i=>(t.$o=s,i)))}function W_(r,e,t){let n=C(),s=C();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let a=te();return t.forEach(((o,u)=>{const c=i.get(o);u.isFoundDocument()!==c.isFoundDocument()&&(s=s.add(o)),u.isNoDocument()&&u.version.isEqual(P.min())?(e.removeEntry(o,u.readTime),a=a.insert(o,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),a=a.insert(o,u)):I(Ha,"Ignoring outdated watch update for ",o,". Current version:",c.version," Watch version:",u.version)})),{jo:a,Ho:s}}))}function H_(r,e){const t=v(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=zt),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function ks(r,e){const t=v(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.g_.getTargetData(n,e).next((i=>i?(s=i,m.resolve(s)):t.g_.allocateTargetId(n).next((a=>(s=new $e(e,a,"TargetPurposeListen",n.currentSequenceNumber),t.g_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.$o.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.$o=t.$o.insert(n.targetId,n),t.Ko.set(e,n.targetId)),n}))}async function kn(r,e,t){const n=v(r),s=n.$o.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(a=>n.persistence.referenceDelegate.removeTarget(a,s)))}catch(a){if(!bt(a))throw a;I(Ha,`Failed to update sequence numbers for target ${e}: ${a}`)}n.$o=n.$o.remove(e),n.Ko.delete(s.target)}function Qi(r,e,t){const n=v(r);let s=P.min(),i=C();return n.persistence.runTransaction("Execute query","readwrite",(a=>(function(u,c,l){const h=v(u),d=h.Ko.get(l);return d!==void 0?m.resolve(h.$o.get(d)):h.g_.getTargetData(c,l)})(n,a,H(e)?e:xe(e)).next((o=>{if(o)return s=o.lastLimboFreeSnapshotVersion,n.g_.getMatchingKeysForTargetId(a,o.targetId).next((u=>{i=u}))})).next((()=>n.qo.getDocumentsMatchingQuery(a,e,t?s:P.min(),t?i:C()))).next((o=>(eh(n,o),{documents:o,Jo:i})))))}function Zl(r,e){const t=v(r),n=v(t.g_),s=t.$o.get(e);return s?Promise.resolve(s.target??null):t.persistence.runTransaction("Get target data","readonly",(i=>n.dt(i,e).next((a=>(a==null?void 0:a.target)??null))))}function Wi(r,e){const t=v(r),n=t.Wo.get(e)||P.min();return t.persistence.runTransaction("Get new document changes","readonly",(s=>t.Qo.getAllFromCollectionGroup(s,e,Yu(n,yn),Number.MAX_SAFE_INTEGER))).then((s=>(eh(t,s),s)))}function eh(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Wo.get(s)||P.min();n.readTime.compareTo(i)>0&&r.Wo.set(s,n.readTime)}))}/**
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
 */const th="firestore_clients";function vu(r,e){return`${th}_${r}_${e}`}const nh="firestore_mutations";function Ru(r,e,t){let n=`${nh}_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}const rh="firestore_targets";function wi(r,e){return`${rh}_${r}_${e}`}/**
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
 */const Fe="SharedClientState";class Os{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static ea(e,t,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new T(s.error.code,s.error.message))),a?new Os(e,t,s.state,i):(Y(Fe,`Failed to parse mutation state for ID '${t}': ${n}`),null)}ta(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class pr{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static ea(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new T(n.error.code,n.error.message))),i?new pr(e,n.state,s):(Y(Fe,`Failed to parse target state for ID '${e}': ${t}`),null)}ta(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Ls{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static ea(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=Ta();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=tc(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new Ls(e,i):(Y(Fe,`Failed to parse client data for instance '${e}': ${t}`),null)}}class Ya{constructor(e,t){this.clientId=e,this.onlineState=t}static ea(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Ya(t.clientId,t.onlineState):(Y(Fe,`Failed to parse online state: ${e}`),null)}}class Hi{constructor(){this.activeTargetIds=Ta()}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Ai{constructor(e,t,n,s,i){this.window=e,this.Tn=t,this.persistenceKey=n,this.ia=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.sa=this._a.bind(this),this.oa=new q(S),this.started=!1,this.aa=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.ua=vu(this.persistenceKey,this.ia),this.ca=(function(u){return`firestore_sequence_number_${u}`})(this.persistenceKey),this.oa=this.oa.insert(this.ia,new Hi),this.la=new RegExp(`^${th}_${a}_([^_]*)$`),this.Ea=new RegExp(`^${nh}_${a}_(\\d+)(?:_(.*))?$`),this.ha=new RegExp(`^${rh}_${a}_(\\d+)$`),this.Ta=(function(u){return`firestore_online_state_${u}`})(this.persistenceKey),this.Pa=(function(u){return`firestore_bundle_loaded_v2_${u}`})(this.persistenceKey),this.window.addEventListener("storage",this.sa)}static C(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.po();for(const n of e){if(n===this.ia)continue;const s=this.getItem(vu(this.persistenceKey,n));if(s){const i=Ls.ea(n,s);i&&(this.oa=this.oa.insert(i.clientId,i))}}this.Ra();const t=this.storage.getItem(this.Ta);if(t){const n=this.Ia(t);n&&this.Aa(n)}for(const n of this.aa)this._a(n);this.aa=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.ca,JSON.stringify(e))}getAllActiveQueryTargets(){return this.Va(this.oa)}isActiveQueryTarget(e){let t=!1;return this.oa.forEach(((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.da(e,"pending")}updateMutationState(e,t,n){this.da(e,t,n),this.fa(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(wi(this.persistenceKey,e));if(s){const i=pr.ea(e,s);i&&(n=i.state)}}return t&&this.ma.na(e),this.Ra(),n}removeLocalQueryTarget(e){this.ma.ra(e),this.Ra()}isLocalQueryTarget(e){return this.ma.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(wi(this.persistenceKey,e))}updateQueryState(e,t,n){this.pa(e,t,n)}handleUserChange(e,t,n){t.forEach((s=>{this.fa(s)})),this.currentUser=e,n.forEach((s=>{this.addPendingMutation(s)}))}setOnlineState(e){this.ga(e)}notifyBundleLoaded(e){this.ya(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.sa),this.removeItem(this.ua),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return I(Fe,"READ",e,t),t}setItem(e,t){I(Fe,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){I(Fe,"REMOVE",e),this.storage.removeItem(e)}_a(e){const t=e;if(t.storageArea===this.storage){if(I(Fe,"EVENT",t.key,t.newValue),t.key===this.ua)return void Y("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Tn.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.la.test(t.key)){if(t.newValue==null){const n=this.wa(t.key);return this.ba(n,null)}{const n=this.va(t.key,t.newValue);if(n)return this.ba(n.clientId,n)}}else if(this.Ea.test(t.key)){if(t.newValue!==null){const n=this.Sa(t.key,t.newValue);if(n)return this.Da(n)}}else if(this.ha.test(t.key)){if(t.newValue!==null){const n=this.xa(t.key,t.newValue);if(n)return this.Ca(n)}}else if(t.key===this.Ta){if(t.newValue!==null){const n=this.Ia(t.newValue);if(n)return this.Aa(n)}}else if(t.key===this.ca){const n=(function(i){let a=ye.ce;if(i!=null)try{const o=JSON.parse(i);E(typeof o=="number",30636,{Fa:i}),a=o}catch(o){Y(Fe,"Failed to read sequence number from WebStorage",o)}return a})(t.newValue);n!==ye.ce&&this.sequenceNumberHandler(n)}else if(t.key===this.Pa){const n=this.Oa(t.newValue);await Promise.all(n.map((s=>this.syncEngine.Ma(s))))}}}else this.aa.push(t)}))}}get ma(){return this.oa.get(this.ia)}Ra(){this.setItem(this.ua,this.ma.ta())}da(e,t,n){const s=new Os(this.currentUser,e,t,n),i=Ru(this.persistenceKey,this.currentUser,e);this.setItem(i,s.ta())}fa(e){const t=Ru(this.persistenceKey,this.currentUser,e);this.removeItem(t)}ga(e){const t={clientId:this.ia,onlineState:e};this.storage.setItem(this.Ta,JSON.stringify(t))}pa(e,t,n){const s=wi(this.persistenceKey,e),i=new pr(e,t,n);this.setItem(s,i.ta())}ya(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Pa,t)}wa(e){const t=this.la.exec(e);return t?t[1]:null}va(e,t){const n=this.wa(e);return Ls.ea(n,t)}Sa(e,t){const n=this.Ea.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return Os.ea(new ie(i),s,t)}xa(e,t){const n=this.ha.exec(e),s=Number(n[1]);return pr.ea(s,t)}Ia(e){return Ya.ea(e)}Oa(e){return JSON.parse(e)}async Da(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Na(e.batchId,e.state,e.error);I(Fe,`Ignoring mutation for non-active user ${e.user.uid}`)}Ca(e){return this.syncEngine.La(e.targetId,e.state,e.error)}ba(e,t){const n=t?this.oa.insert(e,t):this.oa.remove(e),s=this.Va(this.oa),i=this.Va(n),a=[],o=[];return i.forEach((u=>{s.has(u)||a.push(u)})),s.forEach((u=>{i.has(u)||o.push(u)})),this.syncEngine.Ba(a,o).then((()=>{this.oa=n}))}Aa(e){this.oa.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}Va(e){let t=Ta();return e.forEach(((n,s)=>{t=t.unionWith(s.activeTargetIds)})),t}}class sh{constructor(){this.Ua=new Hi,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,n){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new Hi,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function ih(){return typeof window<"u"?window:null}function _s(){return typeof document<"u"?document:null}/**
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
 */class Y_{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){this.qa===0&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve()))))}za(e){this.state==="Online"?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,e==="Online"&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){const t=`Could not reach Cloud Firestore backend. ${e}
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
 */const Qe="RemoteStore";class J_{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new rt(1e3),this.eu=new rt(1001),this.tu=new Set,this.nu=[],this.ru=i,this.ru.bt((a=>{n.enqueueAndForget((async()=>{nn(this)&&(I(Qe,"Restarting streams for network reachability change."),await(async function(u){const c=v(u);c.tu.add(4),await Hr(c),c.iu.set("Unknown"),c.tu.delete(4),await li(c)})(this))}))})),this.iu=new Y_(n,s)}}async function li(r){if(nn(r))for(const e of r.nu)await e(!0)}async function Hr(r){for(const e of r.nu)await e(!1)}function Yi(r,e){return r.Ya.get(e)||void 0}function hi(r,e){const t=v(r),n=Yi(t,e.targetId);if(n!==void 0&&t.Ja.has(n))return;const s=(function(o,u){const c=Yi(o,u);c!==void 0&&o.Za.delete(c);const l=(function(d,_){return _%2!=0?d.eu.next():d.Xa.next()})(o,u);return o.Ya.set(u,l),o.Za.set(l,u),l})(t,e.targetId);I(Qe,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new $e(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ja.set(s,i),Za(t)?Xa(t):jn(t).Fn()&&Ja(t,i)}function On(r,e){const t=v(r),n=jn(t),s=Yi(t,e);I(Qe,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.Ja.delete(s),t.Ya.delete(e),t.Za.delete(s),n.Fn()&&ah(t,s),t.Ja.size===0&&(n.Fn()?n.Nn():nn(t)&&t.iu.set("Unknown"))}function Ja(r,e){if(r.su.We(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(P.min())>0){const t=r.Za.get(e.targetId);if(t===void 0)return void I(Qe,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}jn(r).jn(e)}function ah(r,e){r.su.We(e),jn(r).Hn(e)}function Xa(r){r.su=new uf({getRemoteKeysForTarget:e=>{const t=r.Za.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):C()},dt:e=>r.Ja.get(e)||null,Tt:()=>r.datastore.serializer.databaseId}),jn(r).start(),r.iu.Wa()}function Za(r){return nn(r)&&!jn(r).Cn()&&r.Ja.size>0}function nn(r){return v(r).tu.size===0}function oh(r){r.su=void 0}async function X_(r){r.iu.set("Online")}async function Z_(r){r.Ja.forEach(((e,t)=>{Ja(r,e)}))}async function ep(r,e){oh(r),Za(r)?(r.iu.za(e),Xa(r)):r.iu.set("Unknown")}async function tp(r,e,t){if(r.iu.set("Online"),e instanceof Gc&&e.state===2&&e.cause)try{await(async function(s,i){const a=i.cause;for(const o of i.targetIds){if(s.Ja.has(o)){const u=s.Za.get(o);u!==void 0&&(await s.remoteSyncer.rejectListen(u,a),s.Ya.delete(u),s.Za.delete(o)),s.Ja.delete(o)}s.su.removeTarget(o)}})(r,e)}catch(n){I(Qe,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Ms(r,n)}else if(e instanceof hs?r.su.et(e):e instanceof $c?r.su.ot(e):r.su.rt(e),!t.isEqual(P.min()))try{const n=await Xl(r.localStore);t.compareTo(n)>=0&&await(function(i,a){const o=i.su.Rt(a);o.targetChanges.forEach(((c,l)=>{if(c.resumeToken.approximateByteSize()>0){const h=i.Ja.get(l);h&&i.Ja.set(l,h.withResumeToken(c.resumeToken,a))}})),o.targetMismatches.forEach(((c,l)=>{const h=i.Ja.get(c);if(!h)return;i.Ja.set(c,h.withResumeToken(j.EMPTY_BYTE_STRING,h.snapshotVersion)),ah(i,c);const d=new $e(h.target,c,l,h.sequenceNumber);Ja(i,d)}));const u=(function(l,h){const d=new Map;h.targetChanges.forEach(((y,R)=>{const x=l.Za.get(R);x!==void 0&&d.set(x,y)}));let _=new q(S);return h.targetMismatches.forEach(((y,R)=>{const x=l.Za.get(y);x!==void 0&&(_=_.insert(x,R))})),new zn(h.snapshotVersion,d,_,h.documentUpdates,h.augmentedDocumentUpdates,h.resolvedLimboDocuments)})(i,o);return i.remoteSyncer.applyRemoteEvent(u)})(r,t)}catch(n){I(Qe,"Failed to raise snapshot:",n),await Ms(r,n)}}async function Ms(r,e,t){if(!bt(e))throw e;r.tu.add(1),await Hr(r),r.iu.set("Offline"),t||(t=()=>Xl(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{I(Qe,"Retrying IndexedDB access"),await t(),r.tu.delete(1),await li(r)}))}function uh(r,e){return e().catch((t=>Ms(r,t,e)))}async function Kn(r){const e=v(r),t=Rt(e);let n=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:zt;for(;np(e);)try{const s=await H_(e.localStore,n);if(s===null){e.Ha.length===0&&t.Nn();break}n=s.batchId,rp(e,s)}catch(s){await Ms(e,s)}ch(e)&&lh(e)}function np(r){return nn(r)&&r.Ha.length<10}function rp(r,e){r.Ha.push(e);const t=Rt(r);t.Fn()&&t.Jn&&t.Yn(e.mutations)}function ch(r){return nn(r)&&!Rt(r).Cn()&&r.Ha.length>0}function lh(r){Rt(r).start()}async function sp(r){Rt(r).er()}async function ip(r){const e=Rt(r);for(const t of r.Ha)e.Yn(t.mutations)}async function ap(r,e,t){const n=r.Ha.shift(),s=qa.from(n,e,t);await uh(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Kn(r)}async function op(r,e){e&&Rt(r).Jn&&await(async function(n,s){if((function(a){return Fc(a)&&a!==p.ABORTED})(s.code)){const i=n.Ha.shift();Rt(n).Mn(),await uh(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Kn(n)}})(r,e),ch(r)&&lh(r)}async function Pu(r,e){const t=v(r);t.asyncQueue.verifyOperationInProgress(),I(Qe,"RemoteStore received new credentials");const n=nn(t);t.tu.add(3),await Hr(t),n&&t.iu.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.tu.delete(3),await li(t)}async function Ji(r,e){const t=v(r);e?(t.tu.delete(2),await li(t)):e||(t.tu.add(2),await Hr(t),t.iu.set("Unknown"))}function jn(r){return r._u||(r._u=(function(t,n,s){const i=v(t);return i.nr(),new xf(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:X_.bind(null,r),zt:Z_.bind(null,r),Ht:ep.bind(null,r),zn:tp.bind(null,r)}),r.nu.push((async e=>{e?(r._u.Mn(),Za(r)?Xa(r):r.iu.set("Unknown")):(await r._u.stop(),oh(r))}))),r._u}function Rt(r){return r.ou||(r.ou=(function(t,n,s){const i=v(t);return i.nr(),new bf(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{Qt:()=>Promise.resolve(),zt:sp.bind(null,r),Ht:op.bind(null,r),Zn:ip.bind(null,r),Xn:ap.bind(null,r)}),r.nu.push((async e=>{e?(r.ou.Mn(),await Kn(r)):(await r.ou.stop(),r.Ha.length>0&&(I(Qe,`Stopping write stream with ${r.Ha.length} pending writes`),r.Ha=[]))}))),r.ou}/**
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
 */class eo{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Le,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((a=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const a=Date.now()+n,o=new eo(e,t,a,s,i);return o.start(n),o}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new T(p.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function to(r,e){if(Y("AsyncQueue",`${e}: ${r}`),bt(r))return new T(p.UNAVAILABLE,`${e}: ${r}`);throw r}/**
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
 */class Kt{static emptySet(e){return new Kt(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||A.comparator(t.key,n.key):(t,n)=>A.comparator(t.key,n.key),this.keyedMap=Ot(),this.sortedSet=new q(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Kt)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new Kt;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class xu{constructor(){this.au=new q(A.comparator)}track(e){const t=e.doc.key,n=this.au.get(t);n?e.type!==0&&n.type===3?this.au=this.au.insert(t,e):e.type===3&&n.type!==1?this.au=this.au.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.au=this.au.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.au=this.au.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.au=this.au.remove(t):e.type===1&&n.type===2?this.au=this.au.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.au=this.au.insert(t,{type:2,doc:e.doc}):V(63341,{ft:e,uu:n}):this.au=this.au.insert(t,e)}cu(){const e=[];return this.au.inorderTraversal(((t,n)=>{e.push(n)})),e}}class Ln{constructor(e,t,n,s,i,a,o,u,c){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=o,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,t,n,s,i){const a=[];return t.forEach((o=>{a.push({type:0,doc:o})})),new Ln(e,t,Kt.emptySet(t),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&si(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class up{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some((e=>e.Tu()))}}class cp{constructor(){this.queries=bu(),this.onlineState="Unknown",this.Pu=new Set}terminate(){(function(t,n){const s=v(t),i=s.queries;s.queries=bu(),i.forEach(((a,o)=>{for(const u of o.Eu)u.onError(n)}))})(this,new T(p.ABORTED,"Firestore shutting down"))}}function bu(){return new at((r=>kl(r)),si)}async function no(r,e){const t=v(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.hu()&&e.Tu()&&(n=2):(i=new up,n=e.Tu()?0:1);try{switch(n){case 0:i.lu=await t.onListen(s,!0);break;case 1:i.lu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const o=to(a,`Initialization of query '${H(e.query)?Xe(e.query):dr(e.query)}' failed`);return void e.onError(o)}t.queries.set(s,i),i.Eu.push(e),e.Ru(t.onlineState),i.lu&&e.Iu(i.lu)&&so(t)}async function ro(r,e){const t=v(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const a=i.Eu.indexOf(e);a>=0&&(i.Eu.splice(a,1),i.Eu.length===0?s=e.Tu()?0:1:!i.hu()&&e.Tu()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function lp(r,e){const t=v(r);let n=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const o of a.Eu)o.Iu(s)&&(n=!0);a.lu=s}}n&&so(t)}function hp(r,e,t){const n=v(r),s=n.queries.get(e);if(s)for(const i of s.Eu)i.onError(t);n.queries.delete(e)}function so(r){r.Pu.forEach((e=>{e.next()}))}var Xi;(function(r){r.Default="default",r.Cache="cache"})(Xi||(Xi={}));class io{constructor(e,t,n){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=n||{}}Iu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new Ln(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){if(!e.fromCache||!this.Tu())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}fu(e){if(e.docChanges.length>0)return!0;const t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}pu(e){e=Ln.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==Xi.Cache}}/**
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
 */class hh{constructor(e){this.key=e}}class dh{constructor(e){this.key=e}}class dp{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=C(),this.mutatedKeys=C(),this.Lu=H(e)?ji(e):Ia(e),this.Bu=new Kt(this.Lu)}get Uu(){return this.Ou}ku(e,t){const n=t?t.qu:new xu,s=t?t.Bu:this.Bu;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,o=!1;const[u,c]=this.$u(this.query,s);e.inorderTraversal(((h,d)=>{const _=s.get(h),y=Gl(this.query,d)?d:null,R=!!_&&this.mutatedKeys.has(_.key),x=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let k=!1;_&&y?_.data.isEqual(y.data)?R!==x&&(n.track({type:3,doc:y}),k=!0):this.Ku(_,y)||(n.track({type:2,doc:y}),k=!0,(u&&this.Lu(y,u)>0||c&&this.Lu(y,c)<0)&&(o=!0)):!_&&y?(n.track({type:0,doc:y}),k=!0):_&&!y&&(n.track({type:1,doc:_}),k=!0,(u||c)&&(o=!0)),k&&(y?(a=a.add(y),i=x?i.add(h):i.delete(h)):(a=a.delete(h),i=i.delete(h)))}));const l=this.Wu(this.query);if(l)if(H(this.query)){const h=[];a.forEach((y=>h.push(y)));const d=$l(this.query,h);let _=new Kt(ji(this.query));for(const y of d)_=_.add(y);a.forEach((y=>{_.has(y.key)||(i=i.delete(y.key),n.track({type:1,doc:y}))})),a=_}else{const h=this.Qu(this.query);for(;a.size>l;){const d=h==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),n.track({type:1,doc:d})}}return{Bu:a,qu:n,Uo:o,mutatedKeys:i}}Wu(e){var t;return H(e)?(t=yi(e))==null?void 0:t.limit:e.limit||void 0}Qu(e){if(H(e)){const t=yi(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){var n;if(H(e)){const s=(n=yi(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.Wu(this.query)?t.last():null,e.limitType==="L"&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;const a=e.qu.cu();a.sort(((l,h)=>(function(_,y){const R=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return V(20277,{ft:x})}};return R(_)-R(y)})(l.type,h.type)||this.Lu(l.doc,h.doc))),this.Gu(n),s=s??!1;const o=t&&!s?this.zu():[],u=this.Nu.size===0&&this.current&&!s?1:0,c=u!==this.Mu;return this.Mu=u,a.length!==0||c?{snapshot:new Ln(this.query,e.Bu,i,a,e.mutatedKeys,u===0,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),ju:o}:{ju:o}}Ru(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new xu,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach((t=>this.Ou=this.Ou.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ou=this.Ou.delete(t))),this.current=e.current)}zu(){if(!this.current)return[];const e=this.Nu;this.Nu=C(),this.Bu.forEach((n=>{this.Hu(n.key)&&(this.Nu=this.Nu.add(n.key))}));const t=[];return e.forEach((n=>{this.Nu.has(n)||t.push(new dh(n))})),this.Nu.forEach((n=>{e.has(n)||t.push(new hh(n))})),t}Ju(e){this.Ou=e.Jo,this.Nu=C();const t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return Ln.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,this.Mu===0,this.hasCachedResults)}}const Qn="SyncEngine";class fp{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class mp{constructor(e){this.key=e,this.Zu=!1}}class _p{constructor(e,t,n,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Xu={},this.ec=new at((o=>kl(o)),si),this.tc=new Map,this.nc=new Set,this.rc=new q(A.comparator),this.sc=new Map,this._c=new Ka,this.oc={},this.ac=new Map,this.uc=rt.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return this.cc===!0}}async function pp(r,e,t=!0){const n=di(r);let s;const i=n.ec.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Yu()):s=await fh(n,e,t,!0),s}async function gp(r,e){const t=di(r);await fh(t,e,!0,!1)}async function fh(r,e,t,n){const s=await ks(r.localStore,H(e)?e:xe(e)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,t);let o;return n&&(o=await ao(r,e,i,a==="current",s.resumeToken)),r.isPrimaryClient&&t&&hi(r.remoteStore,s),o}async function ao(r,e,t,n,s){r.lc=(h,d,_)=>(async function(R,x,k,N){let O=x.view.ku(k);O.Uo&&(O=await Qi(R.localStore,x.query,!1).then((({documents:ge})=>x.view.ku(ge,O))));const re=N&&N.targetChanges.get(x.targetId),G=N&&N.targetMismatches.get(x.targetId)!=null,ee=x.view.applyChanges(O,R.isPrimaryClient,re,G);return Zi(R,x.targetId,ee.ju),ee.snapshot})(r,h,d,_);const i=await Qi(r.localStore,e,!0),a=new dp(e,i.Jo),o=a.ku(i.documents),u=zr.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),c=a.applyChanges(o,r.isPrimaryClient,u);Zi(r,t,c.ju);const l=new fp(e,t,a);return r.ec.set(e,l),r.tc.has(t)?r.tc.get(t).push(e):r.tc.set(t,[e]),c.snapshot}async function yp(r,e,t){const n=v(r),s=n.ec.get(e),i=n.tc.get(s.targetId);if(i.length>1)return n.tc.set(s.targetId,i.filter((a=>!si(a,e)))),void n.ec.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await kn(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&On(n.remoteStore,s.targetId),Mn(n,s.targetId)})).catch(xt)):(Mn(n,s.targetId),await kn(n.localStore,s.targetId,!0))}async function Ip(r,e){const t=v(r),n=t.ec.get(e),s=t.tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),On(t.remoteStore,n.targetId))}async function Tp(r,e,t){const n=lo(r);try{const s=await(function(a,o){const u=v(a),c=U.now(),l=o.reduce(((_,y)=>_.add(y.key)),C());let h,d;return u.persistence.runTransaction("Locally write mutations","readwrite",(_=>{let y=te(),R=C();return u.Qo.getEntries(_,l).next((x=>{y=x,y.forEach(((k,N)=>{N.isValidDocument()||(R=R.add(k))}))})).next((()=>u.localDocuments.getOverlayedDocuments(_,y))).next((x=>{h=x;const k=[];for(const N of o){const O=Bd(N,h.get(N.key).overlayedDocument);O!=null&&k.push(new it(N.key,O,Ec(O.value.mapValue),W.exists(!0)))}return u.mutationQueue.addMutationBatch(_,c,k,o)})).next((x=>{d=x;const k=x.applyToLocalDocumentSet(h,R);return u.documentOverlayCache.saveOverlays(_,x.batchId,k)}))})).then((()=>({batchId:d.batchId,changes:qc(h)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(a,o,u){let c=a.oc[a.currentUser.toKey()];c||(c=new q(S)),c=c.insert(o,u),a.oc[a.currentUser.toKey()]=c})(n,s.batchId,t),await Ct(n,s.changes),await Kn(n.remoteStore)}catch(s){const i=to(s,"Failed to persist write");t.reject(i)}}async function mh(r,e){const t=v(r);try{const n=await Q_(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const a=t.sc.get(i);a&&(E(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.Zu=!0:s.modifiedDocuments.size>0?E(a.Zu,14607):s.removedDocuments.size>0&&(E(a.Zu,42227),a.Zu=!1))})),await Ct(t,n,e)}catch(n){await xt(n)}}function Su(r,e,t){const n=v(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.ec.forEach(((i,a)=>{const o=a.view.Ru(e);o.snapshot&&s.push(o.snapshot)})),(function(a,o){const u=v(a);u.onlineState=o;let c=!1;u.queries.forEach(((l,h)=>{for(const d of h.Eu)d.Ru(o)&&(c=!0)})),c&&so(u)})(n.eventManager,e),s.length&&n.Xu.zn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function Ep(r,e,t){const n=v(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.sc.get(e),i=s&&s.key;if(i){let a=new q(A.comparator);a=a.insert(i,K.newNoDocument(i,P.min()));const o=C().add(i),u=new zn(P.min(),new Map,new q(S),a,te(),o);await mh(n,u),n.rc=n.rc.remove(i),n.sc.delete(e),co(n)}else await kn(n.localStore,e,!1).then((()=>Mn(n,e,t))).catch(xt)}async function wp(r,e){const t=v(r),n=e.batch.batchId;try{const s=await j_(t.localStore,e);uo(t,n,null),oo(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Ct(t,s)}catch(s){await xt(s)}}async function Ap(r,e,t){const n=v(r);try{const s=await(function(a,o){const u=v(a);return u.persistence.runTransaction("Reject batch","readwrite-primary",(c=>{let l;return u.mutationQueue.lookupMutationBatch(c,o).next((h=>(E(h!==null,37113),l=h.keys(),u.mutationQueue.removeMutationBatch(c,h)))).next((()=>u.mutationQueue.performConsistencyCheck(c))).next((()=>u.documentOverlayCache.removeOverlaysForBatchId(c,l,o))).next((()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(c,l))).next((()=>u.localDocuments.getDocuments(c,l)))}))})(n.localStore,e);uo(n,e,t),oo(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Ct(n,s)}catch(s){await xt(s)}}function oo(r,e){(r.ac.get(e)||[]).forEach((t=>{t.resolve()})),r.ac.delete(e)}function uo(r,e,t){const n=v(r);let s=n.oc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.oc[n.currentUser.toKey()]=s}}function Mn(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.tc.get(e))r.ec.delete(n),t&&r.Xu.Ec(n,t);r.tc.delete(e),r.isPrimaryClient&&r._c.s_(e).forEach((n=>{r._c.containsKey(n)||_h(r,n)}))}function _h(r,e){r.nc.delete(e.path.canonicalString());const t=r.rc.get(e);t!==null&&(On(r.remoteStore,t),r.rc=r.rc.remove(e),r.sc.delete(t),co(r))}function Zi(r,e,t){for(const n of t)n instanceof hh?(r._c.addReference(n.key,e),Vp(r,n)):n instanceof dh?(I(Qn,"Document no longer in limbo: "+n.key),r._c.removeReference(n.key,e),r._c.containsKey(n.key)||_h(r,n.key)):V(19791,{hc:n})}function Vp(r,e){const t=e.key,n=t.path.canonicalString();r.rc.get(t)||r.nc.has(n)||(I(Qn,"New document in limbo: "+t),r.nc.add(n),co(r))}function co(r){for(;r.nc.size>0&&r.rc.size<r.maxConcurrentLimboResolutions;){const e=r.nc.values().next().value;r.nc.delete(e);const t=new A(D.fromString(e)),n=r.uc.next();r.sc.set(n,new mp(t)),r.rc=r.rc.insert(t,n),hi(r.remoteStore,new $e(xe(qr(t.path)),n,"TargetPurposeLimboResolution",ye.ce))}}async function Ct(r,e,t){const n=v(r),s=[],i=[],a=[];n.ec.isEmpty()||(n.ec.forEach(((o,u)=>{a.push(n.lc(u,e,t).then((c=>{var l;if((c||t)&&n.isPrimaryClient){const h=c?!c.fromCache:(l=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:l.current;n.sharedClientState.updateQueryState(u.targetId,h?"current":"not-current")}if(c){s.push(c);const h=Wa.vo(u.targetId,c);i.push(h)}})))})),await Promise.all(a),n.Xu.zn(s),await(async function(u,c){const l=v(u);try{await l.persistence.runTransaction("notifyLocalViewChanges","readwrite",(h=>m.forEach(c,(d=>m.forEach(d.wo,(_=>l.persistence.referenceDelegate.addReference(h,d.targetId,_))).next((()=>m.forEach(d.bo,(_=>l.persistence.referenceDelegate.removeReference(h,d.targetId,_)))))))))}catch(h){if(!bt(h))throw h;I(Ha,"Failed to update sequence numbers: "+h)}for(const h of c){const d=h.targetId;if(!h.fromCache){const _=l.$o.get(d),y=_.snapshotVersion,R=_.withLastLimboFreeSnapshotVersion(y);l.$o=l.$o.insert(d,R)}}})(n.localStore,i))}async function vp(r,e){const t=v(r);if(!t.currentUser.isEqual(e)){I(Qn,"User change. New user:",e.toKey());const n=await Jl(t.localStore,e);t.currentUser=e,(function(i,a){i.ac.forEach((o=>{o.forEach((u=>{u.reject(new T(p.CANCELLED,a))}))})),i.ac.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Ct(t,n.zo)}}function Rp(r,e){const t=v(r),n=t.sc.get(e);if(n&&n.Zu)return C().add(n.key);{let s=C();const i=t.tc.get(e);if(!i)return s;for(const a of i??[]){const o=t.ec.get(a);s=s.unionWith(o.view.Uu)}return s}}async function Pp(r,e){const t=v(r),n=await Qi(t.localStore,e.query,!0),s=e.view.Ju(n);return t.isPrimaryClient&&Zi(t,e.targetId,s.ju),s}async function xp(r,e){const t=v(r);return Wi(t.localStore,e).then((n=>Ct(t,n)))}async function bp(r,e,t,n){const s=v(r),i=await(function(o,u){const c=v(o),l=v(c.mutationQueue);return c.persistence.runTransaction("Lookup mutation documents","readonly",(h=>l.ps(h,u).next((d=>d?c.localDocuments.getDocuments(h,d):m.resolve(null)))))})(s.localStore,e);i!==null?(t==="pending"?await Kn(s.remoteStore):t==="acknowledged"||t==="rejected"?(uo(s,e,n||null),oo(s,e),(function(o,u){v(v(o).mutationQueue).bs(u)})(s.localStore,e)):V(6720,"Unknown batchState",{Tc:t}),await Ct(s,i)):I(Qn,"Cannot apply mutation batch with id: "+e)}async function Sp(r,e){const t=v(r);if(di(t),lo(t),e===!0&&t.cc!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await Cu(t,n.toArray());t.cc=!0,await Ji(t.remoteStore,!0);for(const i of s)hi(t.remoteStore,i)}else if(e===!1&&t.cc!==!1){const n=[];let s=Promise.resolve();t.tc.forEach(((i,a)=>{t.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then((()=>(Mn(t,a),kn(t.localStore,a,!0)))),On(t.remoteStore,a)})),await s,await Cu(t,n),(function(a){const o=v(a);o.sc.forEach(((u,c)=>{On(o.remoteStore,c)})),o._c.__(),o.sc=new Map,o.rc=new q(A.comparator)})(t),t.cc=!1,await Ji(t.remoteStore,!1)}}async function Cu(r,e,t){const n=v(r),s=[],i=[];for(const a of e){let o;const u=n.tc.get(a);if(u&&u.length!==0){o=await ks(n.localStore,H(u[0])?u[0]:xe(u[0]));for(const c of u){const l=n.ec.get(c),h=await Pp(n,l);h.snapshot&&i.push(h.snapshot)}}else{const c=await Zl(n.localStore,a);o=await ks(n.localStore,c),await ao(n,ph(c),a,!1,o.resumeToken)}s.push(o)}return n.Xu.zn(i),s}function ph(r){return He(r)?r:Lc(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function Cp(r){return(function(t){return v(v(t).persistence).po()})(v(r).localStore)}async function Dp(r,e,t,n){const s=v(r);if(s.cc)return void I(Qn,"Ignoring unexpected query state notification.");const i=s.tc.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{let a;if(H(i[0]))switch(Je(i[0])){case"collection_group":case"collection":a=await Wi(s.localStore,Pl(i[0]));break;case"documents":a=await(function(c,l){const h=v(c),d=C(...xs(l).map((_=>A.fromPath(_))));return h.persistence.runTransaction("Get documents for pipeline","readonly",(_=>h.Qo.getEntries(_,d))).then((_=>_))})(s.localStore,i[0]);break;default:Ne(""),a=Ot()}else a=await Wi(s.localStore,(function(c){return c.collectionGroup||(c.path.length%2==1?c.path.lastSegment():c.path.get(c.path.length-2))})(i[0]));const o=zn.createSynthesizedRemoteEventForCurrentChange(e,t==="current",j.EMPTY_BYTE_STRING);await Ct(s,a,o);break}case"rejected":await kn(s.localStore,e,!0),Mn(s,e,n);break;default:V(64155,t)}}async function Np(r,e,t){const n=di(r);if(n.cc){for(const s of e){if(n.tc.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){I(Qn,"Adding an already active target "+s);continue}const i=await Zl(n.localStore,s),a=await ks(n.localStore,i);await ao(n,ph(i),a.targetId,!1,a.resumeToken),hi(n.remoteStore,a)}for(const s of t)n.tc.has(s)&&await kn(n.localStore,s,!1).then((()=>{On(n.remoteStore,s),Mn(n,s)})).catch(xt)}}function di(r){const e=v(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=mh.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Rp.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Ep.bind(null,e),e.Xu.zn=lp.bind(null,e.eventManager),e.Xu.Ec=hp.bind(null,e.eventManager),e}function lo(r){const e=v(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=wp.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Ap.bind(null,e),e}class kr{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ys(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){return Yl(this.persistence,new Hl,e.initialUser,this.serializer)}Ic(e){return new ja(ci.C_,this.serializer)}Rc(e){return new sh}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}kr.provider={build:()=>new kr};class kp extends kr{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){E(this.persistence.referenceDelegate instanceof Ns,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new cl(n,e.asyncQueue,t)}Ic(e){const t=this.cacheSizeBytes!==void 0?de.withCacheSize(this.cacheSizeBytes):de.DEFAULT;return new ja((n=>Ns.C_(n,t)),this.serializer)}}class gh extends kr{constructor(e,t,n){super(),this.fc=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.fc.initialize(this,e),await lo(this.fc.syncEngine),await Kn(this.fc.remoteStore),await this.persistence._o((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Ac(e){return Yl(this.persistence,new Hl,e.initialUser,this.serializer)}Vc(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new cl(n,e.asyncQueue,t)}dc(e,t){const n=new td(t,this.persistence);return new ed(e.asyncQueue,n)}Ic(e){const t=Wl(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?de.withCacheSize(this.cacheSizeBytes):de.DEFAULT;return new Qa(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,ih(),_s(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Rc(e){return new sh}}class Op extends gh{constructor(e,t){super(e,t,!1),this.fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.fc.syncEngine;this.sharedClientState instanceof Ai&&(this.sharedClientState.syncEngine={Na:bp.bind(null,t),La:Dp.bind(null,t),Ba:Np.bind(null,t),po:Cp.bind(null,t),Ma:xp.bind(null,t)},await this.sharedClientState.start()),await this.persistence._o((async n=>{await Sp(this.fc.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())}))}Rc(e){const t=ih();if(!Ai.C(t))throw new T(p.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=Wl(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Ai(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Or{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Su(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=vp.bind(null,this.syncEngine),await Ji(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new cp})()}createDatastore(e){const t=Ys(e.databaseInfo.databaseId),n=Pf(e.databaseInfo);return Df(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,a,o){return new J_(n,s,i,a,o)})(this.localStore,this.datastore,e.asyncQueue,(t=>Su(this.syncEngine,t,0)),(function(){return Jo.C()?new Jo:new Af})())}createSyncEngine(e,t){return(function(s,i,a,o,u,c,l){const h=new _p(s,i,a,o,u,c);return l&&(h.cc=!0),h})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=v(s);I(Qe,"RemoteStore shutting down."),i.tu.add(5),await Hr(i),i.ru.shutdown(),i.iu.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Or.provider={build:()=>new Or};/**
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
 */class ho{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):Y("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */let Lp=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new T(p.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const a=v(s),o={documents:i.map((h=>Nn(a.serializer,h)))},u=await a.$t("BatchGetDocuments",a.serializer.databaseId,D.emptyPath(),o,i.length),c=new Map;u.forEach((h=>{const d=mf(a.serializer,h);c.set(d.key.toString(),d)}));const l=[];return i.forEach((h=>{const d=c.get(h.toString());E(!!d,55234,{key:h}),l.push(d)})),l})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new Bn(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=A.fromPath(n);this.mutations.push(new _a(s,this.precondition(s)))})),await(async function(n,s){const i=v(n),a={writes:s.map((o=>Pr(i.serializer,o)))};await i.Bt("Commit",i.serializer.databaseId,D.emptyPath(),a)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw V(50498,{Oc:e.constructor.name});t=P.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new T(p.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(P.min())?W.exists(!1):W.updateTime(t):W.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(P.min()))throw new T(p.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return W.updateTime(t)}return W.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class Mp{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.xn=new Va(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.xn.mn((async()=>{const e=new Lp(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!Fr(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Fc(t)}return!1}}/**
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
 */const Pt="FirestoreClient";class Fp{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=ie.UNAUTHENTICATED,this.clientId=ra.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async a=>{I(Pt,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a})),this.appCheckCredentials.start(n,(a=>(I(Pt,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Le;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=to(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function Vi(r,e){r.asyncQueue.verifyOperationInProgress(),I(Pt,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await Jl(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function Du(r,e){r.asyncQueue.verifyOperationInProgress();const t=await Up(r);I(Pt,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Pu(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Pu(e.remoteStore,s))),r._onlineComponents=e}async function Up(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){I(Pt,"Using user provided OfflineComponentProvider");try{await Vi(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===p.FAILED_PRECONDITION||s.code===p.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Ne("Error using user provided cache. Falling back to memory cache: "+t),await Vi(r,new kr)}}else I(Pt,"Using default OfflineComponentProvider"),await Vi(r,new kp(void 0));return r._offlineComponents}async function fo(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(I(Pt,"Using user provided OnlineComponentProvider"),await Du(r,r._uninitializedComponentsProvider._online)):(I(Pt,"Using default OnlineComponentProvider"),await Du(r,new Or))),r._onlineComponents}function Bp(r){return fo(r).then((e=>e.syncEngine))}function qp(r){return fo(r).then((e=>e.datastore))}async function Fs(r){const e=await fo(r),t=e.eventManager;return t.onListen=pp.bind(null,e.syncEngine),t.onUnlisten=yp.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gp.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Ip.bind(null,e.syncEngine),t}function zp(r,e,t,n){const s=new ho(n),i=new io(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>no(await Fs(r),i))),()=>{s.gc(),r.asyncQueue.enqueueAndForget((async()=>ro(await Fs(r),i)))}}function $p(r,e,t={}){const n=new Le;return r.asyncQueue.enqueueAndForget((async()=>(function(i,a,o,u,c){const l=new ho({next:d=>{l.gc(),a.enqueueAndForget((()=>ro(i,h)));const _=d.docs.has(o);!_&&d.fromCache?c.reject(new T(p.UNAVAILABLE,"Failed to get document because the client is offline.")):_&&d.fromCache&&u&&u.source==="server"?c.reject(new T(p.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):c.resolve(d)},error:d=>c.reject(d)}),h=new io(qr(o.path),l,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return no(i,h)})(await Fs(r),r.asyncQueue,e,t,n))),n.promise}function Gp(r,e,t={}){const n=new Le;return r.asyncQueue.enqueueAndForget((async()=>(function(i,a,o,u,c){const l=new ho({next:d=>{l.gc(),a.enqueueAndForget((()=>ro(i,h))),d.fromCache&&u.source==="server"?c.reject(new T(p.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(d)},error:d=>c.reject(d)}),h=new io(o instanceof mr?m_(o):o,l,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return no(i,h)})(await Fs(r),r.asyncQueue,e,t,n))),n.promise}function Kp(r,e){const t=new Le;return r.asyncQueue.enqueueAndForget((async()=>Tp(await Bp(r),e,t))),t.promise}function jp(r,e,t){const n=new Le;return r.asyncQueue.enqueueAndForget((async()=>{const s=await qp(r);new Mp(r.asyncQueue,s,t,e,n).Nc()})),n.promise}/**
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
 */const Nu="AsyncQueue";class ku{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new Va(this,"async_queue_retry"),this.jc=()=>{const n=_s();n&&I(Nu,"Visibility state changed to "+n.visibilityState),this.xn.gn()},this.Hc=e;const t=_s();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=_s();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Le;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!bt(e))throw e;I(Nu,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Qc=!0,e().catch((n=>{throw this.Wc=n,this.Qc=!1,Y("INTERNAL UNHANDLED ERROR: ",Ou(n)),n})).then((n=>(this.Qc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=eo.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Wc&&V(47125,{el:Ou(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function Ou(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class st extends Xs{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new ku,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ku(e),this._firestoreClient=void 0,await e}}}function dg(r,e,t){t||(t=Er);const n=qu(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(zu(i,e))return s;throw new T(p.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new T(p.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<ul)throw new T(p.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&ea(e.host)&&$u(e.host),n.initialize({options:e,instanceIdentifier:t})}function fg(r,e){const t=typeof r=="object"?r:Rh(),n=typeof r=="string"?r:Er,s=qu(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=Ph("firestore");i&&Mf(s,...i)}return s}function Wn(r){if(r._terminated)throw new T(p.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Qp(r),r._firestoreClient}function Qp(r){var n,s,i,a;const e=r._freezeSettings(),t=kf(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((a=e.localCache)!=null&&a._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new Fp(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(u){const c=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(c),_online:c}})(r._componentsProvider))}/**
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
 */class yh{convertValue(e,t="none"){switch(Z(e)){case 0:return null;case 1:return e.booleanValue;case 2:return z(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(et(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw V(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return St(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[Ht].arrayValue)==null?void 0:s.values)==null?void 0:i.map((a=>z(a.doubleValue)));return new Te(t)}convertGeoPoint(e){return new Ke(z(e.latitude),z(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Br(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Vn(e));default:return null}}convertTimestamp(e){const t=Ze(e);return new U(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=D.fromString(e);E(nl(n),9688,{name:e});const s=new Wt(n.get(1),n.get(3)),i=new A(n.popFirst(5));return s.isEqual(t)||Y(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class fi extends yh{constructor(e){super(),this.firestore=e}convertBytes(e){return new ve(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Q(this.firestore,null,t)}}const Lu="@firebase/firestore",Mu="4.16.0";/**
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
 */function Fu(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}/**
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
 */class Us{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Q(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Wp(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(tt("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Wp extends Us{data(){return super.data()}}/**
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
 */function Ih(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new T(p.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class mo{}class _o extends mo{}function mg(r,e,...t){let n=[];e instanceof mo&&n.push(e),n=n.concat(t),(function(i){const a=i.filter((u=>u instanceof Hn)).length,o=i.filter((u=>u instanceof Yr)).length;if(a>1||a>0&&o>0)throw new T(p.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class Yr extends _o{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Yr(e,t,n)}_apply(e){const t=this._parse(e);return Th(e._query,t),new ot(e.firestore,e.converter,Li(e._query,t))}_parse(e){const t=Zs(e.firestore);return(function(i,a,o,u,c,l,h){let d;if(c.isKeyField()){if(l==="array-contains"||l==="array-contains-any")throw new T(p.INVALID_ARGUMENT,`Invalid Query. You can't perform '${l}' queries on documentId().`);if(l==="in"||l==="not-in"){Bu(h,l);const y=[];for(const R of h)y.push(Uu(u,i,R));d={arrayValue:{values:y}}}else d=Uu(u,i,h)}else l!=="in"&&l!=="not-in"&&l!=="array-contains-any"||Bu(h,l),d=qf(o,a,h,l==="in"||l==="not-in");return L.create(c,l,d)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function _g(r,e,t){const n=e,s=tt("where",r);return Yr._create(s,n,t)}class Hn extends mo{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Hn(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:B.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let a=s;const o=i.getFlattenedFilters();for(const u of o)Th(a,u),a=Li(a,u)})(e._query,t),new ot(e.firestore,e.converter,Li(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function pg(...r){return r.forEach((e=>Eh("or",e))),Hn._create("or",r)}function gg(...r){return r.forEach((e=>Eh("and",e))),Hn._create("and",r)}class po extends _o{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new po(e,t)}_apply(e){const t=(function(s,i,a){if(s.startAt!==null)throw new T(p.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new T(p.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Rr(i,a)})(e._query,this._field,this._direction);return new ot(e.firestore,e.converter,Jd(e._query,t))}}function yg(r,e="asc"){const t=e,n=tt("orderBy",r);return po._create(n,t)}class go extends _o{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new go(e,t,n)}_apply(e){return new ot(e.firestore,e.converter,Rs(e._query,this._limit,this._limitType))}}function Ig(r){return go._create("limit",r,"F")}function Uu(r,e,t){if(typeof(t=De(t))=="string"){if(t==="")throw new T(p.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Mc(e)&&t.indexOf("/")!==-1)throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(D.fromString(t));if(!A.isDocumentKey(n))throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Ar(r,new A(n))}if(t instanceof Q)return Ar(r,t._key);throw new T(p.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Bs(t)}.`)}function Bu(r,e){if(!Array.isArray(r)||r.length===0)throw new T(p.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Th(r,e){const t=(function(s,i){for(const a of s)for(const o of a.getFlattenedFilters())if(i.indexOf(o.op)>=0)return o.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new T(p.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new T(p.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function Eh(r,e){if(!(e instanceof Yr||e instanceof Hn))throw new T(p.INVALID_ARGUMENT,`Function ${r}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function yo(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class Hp extends yh{constructor(e){super(),this.firestore=e}convertBytes(e){return new ve(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Q(this.firestore,null,t)}}class Yp{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=Zp(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function Tg(r){return new Yp(r)}class Jp{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Or.provider,this._offlineComponentProvider={build:t=>new gh(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class Xp{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Or.provider,this._offlineComponentProvider={build:t=>new Op(t,e==null?void 0:e.cacheSizeBytes)}}}function Zp(r){return new Jp(r==null?void 0:r.forceOwnership)}function Eg(){return new Xp}class _n{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class It extends Us{constructor(e,t,n,s,i,a){super(e,t,n,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new ps(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(tt("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new T(p.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=It._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}It._jsonSchemaVersion="firestore/documentSnapshot/1.0",It._jsonSchema={type:X("string",It._jsonSchemaVersion),bundleSource:X("string","DocumentSnapshot"),bundleName:X("string"),bundle:X("string")};class ps extends It{data(e={}){return super.data(e)}}class jt{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new _n(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new ps(this._firestore,this._userDataWriter,n.key,n,new _n(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new T(p.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map((o=>{H(s._snapshot.query)?ji(s._snapshot.query):Ia(s.query._query);const u=new ps(s._firestore,s._userDataWriter,o.doc.key,o.doc,new _n(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);return o.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}}))}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((o=>i||o.type!==3)).map((o=>{const u=new ps(s._firestore,s._userDataWriter,o.doc.key,o.doc,new _n(s._snapshot.mutatedKeys.has(o.doc.key),s._snapshot.fromCache),s.query.converter);let c=-1,l=-1;return o.type!==0&&(c=a.indexOf(o.doc.key),a=a.delete(o.doc.key)),o.type!==1&&(a=a.add(o.doc),l=a.indexOf(o.doc.key)),{type:eg(o.type),doc:u,oldIndex:c,newIndex:l}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new T(p.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=jt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=ra.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function eg(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return V(61501,{type:r})}}/**
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
 */jt._jsonSchemaVersion="firestore/querySnapshot/1.0",jt._jsonSchema={type:X("string",jt._jsonSchemaVersion),bundleSource:X("string","QuerySnapshot"),bundleName:X("string"),bundle:X("string")};const tg={maxAttempts:5};/**
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
 */class ng{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Zs(e)}set(e,t,n){this._verifyNotCommitted();const s=_t(e,this._firestore),i=yo(s.converter,t,n),a=Ra(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(a.toMutation(s._key,W.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=_t(e,this._firestore);let a;return a=typeof(t=De(t))=="string"||t instanceof $r?_l(this._dataReader,"WriteBatch.update",i._key,t,n,s):ml(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,W.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=_t(e,this._firestore);return this._mutations=this._mutations.concat(new Bn(t._key,W.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new T(p.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function _t(r,e){if((r=De(r)).firestore!==e)throw new T(p.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
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
 */class rg{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Zs(e)}get(e){const t=_t(e,this._firestore),n=new Hp(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return V(24041);const i=s[0];if(i.isFoundDocument())return new Us(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new Us(this._firestore,n,t._key,null,t.converter);throw V(18433,{doc:i})}))}set(e,t,n){const s=_t(e,this._firestore),i=yo(s.converter,t,n),a=Ra(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,a),this}update(e,t,n,...s){const i=_t(e,this._firestore);let a;return a=typeof(t=De(t))=="string"||t instanceof $r?_l(this._dataReader,"Transaction.update",i._key,t,n,s):ml(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,a),this}delete(e){const t=_t(e,this._firestore);return this._transaction.delete(t._key),this}}/**
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
 */class sg extends rg{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=_t(e,this._firestore),n=new fi(this._firestore);return super.get(e).then((s=>new It(this._firestore,n,t._key,s._document,new _n(!1,!1),t.converter)))}}function wg(r,e,t){r=Pe(r,st);const n={...tg,...t};(function(a){if(a.maxAttempts<1)throw new T(p.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=Wn(r);return jp(s,(i=>e(new sg(r,i))),n)}/**
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
 */function Ag(r){r=Pe(r,Q);const e=Pe(r.firestore,st),t=Wn(e);return $p(t,r._key).then((n=>wh(e,r,n)))}function Vg(r){r=Pe(r,ot);const e=Pe(r.firestore,st),t=Wn(e),n=new fi(e);return Ih(r._query),Gp(t,r._query).then((s=>new jt(e,n,r,s)))}function vg(r,e,t){r=Pe(r,Q);const n=Pe(r.firestore,st),s=yo(r.converter,e,t),i=Zs(n);return Io(n,[Ra(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,W.none())])}function Rg(r){return Io(Pe(r.firestore,st),[new Bn(r._key,W.none())])}function Pg(r,...e){var c,l,h;r=De(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||Fu(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Fu(e[n])){const d=e[n];e[n]=(c=d.next)==null?void 0:c.bind(d),e[n+1]=(l=d.error)==null?void 0:l.bind(d),e[n+2]=(h=d.complete)==null?void 0:h.bind(d)}let i,a,o;if(r instanceof Q)a=Pe(r.firestore,st),o=qr(r._key.path),i={next:d=>{e[n]&&e[n](wh(a,r,d))},error:e[n+1],complete:e[n+2]};else{const d=Pe(r,ot);a=Pe(d.firestore,st),o=d._query;const _=new fi(a);i={next:y=>{e[n]&&e[n](new jt(a,_,d,y))},error:e[n+1],complete:e[n+2]},Ih(r._query)}const u=Wn(a);return zp(u,o,s,i)}function Io(r,e){const t=Wn(r);return Kp(t,e)}function wh(r,e,t){const n=t.docs.get(e._key),s=new fi(r);return new It(r,s,e._key,n,new _n(t.hasPendingWrites,t.fromCache),e.converter)}function xg(r){return r=Pe(r,st),Wn(r),new ng(r,(e=>Io(r,e)))}(function(e,t=!0){Bh(Uh),Mh(new Fh("firestore",((n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),o=new st(new $h(n.getProvider("auth-internal")),new jh(a,n.getProvider("app-check-internal")),Dd(a,s),a);return i={useFetchStreams:t,...i},o._setSettings(i),o}),"PUBLIC").setMultipleInstances(!0)),Eo(Lu,Mu,e),Eo(Lu,Mu,"esm2020")})();export{Eg as a,Ag as b,Rg as c,cg as d,ug as e,pg as f,fg as g,gg as h,dg as i,Vg as j,yg as k,Ig as l,lg as m,xg as n,Pg as o,Tg as p,mg as q,wg as r,vg as s,_g as w};
