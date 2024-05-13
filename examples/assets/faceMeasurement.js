var I=Object.defineProperty;var N=(d,l,e)=>l in d?I(d,l,{enumerable:!0,configurable:!0,writable:!0,value:e}):d[l]=e;var c=(d,l,e)=>(N(d,typeof l!="symbol"?l+"":l,e),e);import{M as v,c as E,d as S,e as T,I as _,T as j,C as D}from"./web-ifc-api-Glg4rFxW.js";import{S as K}from"./stats.min-GTpOrGrX.js";import{J as z,D as O,W as x,a as A}from"./import-wrapper-prod-DOkjDpKP.js";import{P as H}from"./index-Cla0sIX3.js";import{D as R}from"./types-BHr6GdIp.js";import{M as U}from"./mark-C0U8dImi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-CZFmkGMI.js";const y=class y extends z{constructor(e){super(e);c(this,"selection",[]);c(this,"preview",new v(new E,new S({side:2,depthTest:!1,transparent:!0,opacity:.25,color:"#BCF124"})));c(this,"selectionMaterial",new S({side:2,depthTest:!1,transparent:!0,color:"#BCF124",opacity:.75}));c(this,"world");c(this,"onDisposed",new O);c(this,"_enabled",!1);c(this,"_currentSelelection",null);c(this,"create",()=>{if(!this.world)throw new Error("No world given to the face measurement!");if(!this.enabled||!this._currentSelelection)return;const e=this.world.scene.three,n=new E,t=new v(n,this.selectionMaterial);n.setAttribute("position",this.preview.geometry.attributes.position),e.add(t),n.computeBoundingSphere();const{area:s,perimeter:o}=this._currentSelelection,r=this.newLabel(n,s);t.add(r.three),this.selection.push({area:s,perimeter:o,mesh:t,label:r})});c(this,"onMouseMove",()=>{if(!this.world)throw new Error("The face measurement needs a world to work!");if(!this.enabled){this.unselect();return}const t=this.components.get(x).get(this.world).castRay();if(!t||!t.object||t.faceIndex===void 0){this.unselect();return}const{object:s,faceIndex:o}=t;s instanceof v||s instanceof _?this.updateSelection(s,o,t.instanceId):this.unselect()});c(this,"onKeydown",e=>{});this.components.add(y.uuid,this),this.preview.frustumCulled=!1}set enabled(e){if(!this.world)throw new Error("No world given for the Face measurement!");this._enabled=e,this.setupEvents(e),e?this.world.scene.three.add(this.preview):(this.preview.removeFromParent(),this.cancelCreation()),this.setVisibility(e)}get enabled(){return this._enabled}dispose(){this.setupEvents(!1),this.deleteAll(),this.preview.removeFromParent(),this.preview.material.dispose(),this.preview.geometry.dispose(),this.selectionMaterial.dispose(),this.onDisposed.trigger(),this.onDisposed.reset(),this.components=null}delete(){if(!this.world)throw new Error("No world given to the face measurement!");const e=this.selection.map(a=>a.mesh),s=this.components.get(x).get(this.world).castRay(e);if(!s||!s.object)return;const o=this.selection.find(a=>a.mesh===s.object);if(!o)return;o.mesh.removeFromParent(),o.mesh.geometry.dispose(),o.label.dispose();const r=this.selection.indexOf(o);this.selection.splice(r,1)}deleteAll(){for(const e of this.selection)e.mesh.removeFromParent(),e.mesh.geometry.dispose(),e.label.dispose();this.selection=[]}endCreation(){}cancelCreation(){}get(){const e=[];for(const n of this.selection){const t=n.mesh.geometry,{area:s,perimeter:o}=n,r=t.attributes.position.array;e.push({position:r,area:s,perimeter:o})}return e}set(e){if(!this.world)throw new Error("No world given to the face measurement!");const n=this.world.scene.three;for(const t of e){const s=new E,o=new v(s,this.selectionMaterial);n.add(o);const r=new T(t.position,3);s.setAttribute("position",r),s.computeBoundingSphere();const{area:a,perimeter:h}=t,p=this.newLabel(s,a);o.add(p.three),this.selection.push({area:a,perimeter:h,mesh:o,label:p})}}setupEvents(e){if(!this.world)throw new Error("The face measurement needs a world to work!");if(!this.world.renderer)throw new Error("The world of the face measurement needs a renderer!");const t=this.world.renderer.three.domElement.parentElement;e?(t.addEventListener("click",this.create),t.addEventListener("mousemove",this.onMouseMove),window.addEventListener("keydown",this.onKeydown)):(t.removeEventListener("click",this.create),t.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("keydown",this.onKeydown))}setVisibility(e){if(!this.world)throw new Error("The face measurement needs a world to work!");const n=this.world.scene.three;for(const t of this.selection){const s=t.label.three;e?(n.add(t.mesh),t.mesh.add(s)):(t.mesh.removeFromParent(),s.removeFromParent())}}unselect(){this.preview.removeFromParent(),this._currentSelelection=null}updateSelection(e,n,t){if(!this.world)throw new Error("The face measurement needs a world to work!");this.world.scene.three.add(this.preview);const o=A.getFace(e,n,t);if(o===null){console.log("Hey!");return}const r=this.regenerateHighlight(e,o.indices,t);let a=0;for(const{distance:h}of o.edges)a+=h;this._currentSelelection={perimeter:a,area:r}}newLabel(e,n){if(!e.boundingSphere)throw new Error("Error computing area geometry");if(!this.world)throw new Error("The face measurement needs a world to work!");const{center:t}=e.boundingSphere,s=document.createElement("div");s.className=R;const o=Math.trunc(n*100)/100;s.textContent=o.toString();const r=new U(this.world,s);return r.three.position.copy(t),r}regenerateHighlight(e,n,t){const s=[],o=[];let r=0,a=0;const h=new j;for(const P of n){const{p1:f,p2:g,p3:b}=A.getVerticesAndNormal(e,P,t);s.push(f.x,f.y,f.z),s.push(g.x,g.y,g.z),s.push(b.x,b.y,b.z),h.set(f,g,b),a+=h.getArea(),o.push(r,r+1,r+2),r+=3}const p=new Float32Array(s),F=new T(p,3);return this.preview.geometry.setAttribute("position",F),this.preview.geometry.setIndex(o),a}};c(y,"uuid","30279548-1309-44f6-aa97-ce26eed73522");let C=y;const V=document.getElementById("container"),i=new(void 0),L=new(void 0)(i);L.setup();i.scene=L;const w=new H(i,V);i.renderer=w;const k=new(void 0)(i);i.camera=k;i.raycaster=new(void 0)(i);i.init();w.postproduction.enabled=!0;k.controls.setLookAt(10,10,10,0,0,0);const W=new(void 0)(i,new D(6710886)),G=w.postproduction.customEffects;G.excludedMeshes.push(W.get());const m=new C(i),J=new(void 0)(i),q=await fetch("../../../resources/small.frag"),Q=await q.arrayBuffer(),X=new Uint8Array(Q);J.load(X);let M;window.addEventListener("keydown",d=>{d.code==="KeyO"?m.delete():d.code==="KeyS"?(M=m.get(),m.deleteAll()):d.code==="KeyL"&&M&&m.set(M)});const B=new(void 0)(i,{name:"Main Toolbar",position:"bottom"});B.addChild(m.uiElement.get("main"));i.ui.addToolbar(B);const u=new K;u.showPanel(2);document.body.append(u.dom);u.dom.style.left="0px";w.onBeforeUpdate.add(()=>u.begin());w.onAfterUpdate.add(()=>u.end());
