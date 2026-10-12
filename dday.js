{id:'dday',n:'D-DAY',e:'🪖',c:'Samen',g:'#43545b,#c14d35',min:1,max:8,bots:true,run(st,net){
 const W=Math.min(900,Math.max(640,Math.round((window.innerWidth||800)*1.35))),H=Math.round(W*9/16),TEAM=['Aanvallers','Verdedigers'],TC=[0x4ca7ef,0xef6558],TT=['#4ca7ef','#ef6558'];
 const CP=[{n:'Strand',x:0,z:27},{n:'Bunkers',x:0,z:106},{n:'Stad',x:0,z:170},{n:'Eindpositie',x:0,z:244}];
 const GUN=[
  {n:'Geweer',cap:30,res:150,rate:.15,reload:2.0,dmg:34,spread:.014,range:110},
  {n:'Machinepistool',cap:32,res:192,rate:.085,reload:1.7,dmg:21,spread:.055,range:70},
  {n:'Machinegeweer',cap:60,res:240,rate:.11,reload:3.1,dmg:24,spread:.075,range:95},
  {n:'Pistool',cap:12,res:72,rate:.29,reload:1.35,dmg:42,spread:.025,range:48},
  {n:'Handgranaat',cap:1,res:4,rate:1.0,reload:2.7,dmg:92,spread:0,range:0}
 ];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=t=>t*t*(3-2*t);
 const ground=z=>{if(z<52)return 0;if(z<88)return 9*smooth((z-52)/36);if(z<120)return 9;if(z<145)return 9*(1-smooth((z-120)/25));return 0};
 const style=document.createElement('style');style.textContent=`
 .ddframe{position:relative;width:min(960px,100%);margin:8px auto 0;overflow:hidden;border-radius:12px;background:#19222b;box-shadow:0 10px 34px #0006;touch-action:none}
 .ddframe canvas{display:block!important;width:100%!important;height:auto!important;touch-action:none}
 .ddhud{position:absolute;inset:0;pointer-events:none;color:#fff;font:600 13px/1.3 system-ui,sans-serif;text-shadow:0 1px 3px #000}
 .ddtop{position:absolute;left:2%;right:2%;top:2%;padding:8px 11px;border:1px solid #ffffff28;border-radius:9px;background:#101822c9;backdrop-filter:blur(5px)}
 .ddtoprow{display:flex;align-items:center;justify-content:space-between;gap:8px}
 .ddobjective{font-size:15px;font-weight:850;letter-spacing:.02em}.ddclock{font-variant-numeric:tabular-nums;font-size:17px;font-weight:900;color:#ffe3a0}
 .ddprogress{height:7px;margin-top:6px;border-radius:8px;background:#ffffff2c;overflow:hidden}.ddprogress i{display:block;width:0;height:100%;background:linear-gradient(90deg,#ffd166,#ffe79a);transition:width .12s}
 .ddcross{position:absolute;left:50%;top:50%;width:18px;height:18px;transform:translate(-50%,-50%);opacity:.9}
 .ddcross:before,.ddcross:after{content:'';position:absolute;background:#fff;box-shadow:0 1px 3px #000}.ddcross:before{width:2px;height:18px;left:8px}.ddcross:after{height:2px;width:18px;top:8px}
 .ddstatus{position:absolute;left:2%;bottom:2%;padding:7px 10px;border-radius:8px;background:#101822d9;font-weight:800}
 .ddcall{position:absolute;right:2%;bottom:2%;padding:7px 10px;border-radius:8px;background:#101822c9;text-align:right}
 .ddcontrols{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:9px auto 2px;max-width:960px}
 .ddcontrols .btn{touch-action:none;user-select:none;-webkit-user-select:none}
 .ddfire{background:#a82e24!important;min-width:100px;font-weight:900!important}
 .ddhint{text-align:center;max-width:960px;margin:7px auto}
 @media(max-width:600px){.ddobjective{font-size:12px}.ddclock{font-size:15px}.ddtop{padding:6px 8px}.ddstatus,.ddcall{font-size:11px;padding:5px 7px}.ddcontrols .btn{padding:9px 11px;min-width:52px}}
 `;document.head.append(style);
 const score=E('div','sc'),frame=E('div','ddframe'),hint=E('div','hint d dhint','WASD / pijltjes lopen · sleep op het beeld om te richten · F / klik / 🔥 schieten · R herladen · 1–5 wapens · G granaat · spatie sprint');
 st.prepend(score);st.append(frame,hint);
 const T=three(frame,W,H,{fov:74,far:390}),S=T.s,cam=T.cam,c=T.c,r=T.r;
 S.background=new THREE.Color(0x82919a);S.fog=new THREE.Fog(0x82919a,115,320);r.setClearColor(0x82919a);r.outputColorSpace=THREE.SRGBColorSpace;
 const mat=(color,roughness=.92,metalness=0,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,emissive});
 const boxG=new THREE.BoxGeometry(1,1,1),unitG=new THREE.CylinderGeometry(.28,.38,1.05,8),headG=new THREE.SphereGeometry(.24,10,8);
 const mats={sand:mat(0xb49b71),rock:mat(0x776f61),grass:mat(0x47533f),water:mat(0x365e70,.3,.1),concrete:mat(0x77786f),wood:mat(0x70533a),dark:mat(0x20262a),roof:mat(0x65473a),window:mat(0x18272b,.45),metal:mat(0x39464a,.46,.6),crate:mat(0x796246),barrel:mat(0x4f6058,.6,.25),olive:mat(0x535c49),flag:mat(0xf0c66d),ring:mat(0xe8cc71,.42,.15,0x322508)};
 const SUN=new THREE.DirectionalLight(0xffe3bd,2.2);SUN.position.set(-65,95,-25);S.add(SUN,new THREE.HemisphereLight(0xb4c9db,0x4d4737,1.35));
 const block=[];
 function mesh(geo,material,x,y,z,rx=0,ry=0,rz=0){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);S.add(o);return o}
 function putBox(x,y,z,w,h,d,material,collide=true){
  const o=mesh(boxG,material,x,y+h/2,z);o.scale.set(w,h,d);
  if(collide)block.push({x,z,w,d,h});return o
 }
 function terrainStrip(z0,z1,material,segments=40){
  const pos=[],ind=[],nx=8;
  for(let j=0;j<=segments;j++){const z=z0+(z1-z0)*j/segments,y=ground(z);for(let i=0;i<=nx;i++){pos.push(-82+164*i/nx,y,z)}}
  for(let j=0;j<segments;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,d=(j+1)*(nx+1)+i,e=d+1;ind.push(a,d,b,b,d,e)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(ind);geo.computeVertexNormals();const o=mesh(geo,material,0,0,0);o.material.side=THREE.DoubleSide;return o
 }
 const sea=mesh(new THREE.PlaneGeometry(500,260),mats.water,0,-1.35,-120,-Math.PI/2);
 terrainStrip(-30,52,mats.sand,20);terrainStrip(52,145,mats.rock,56);terrainStrip(145,278,mats.grass,42);
 // Transport ship, sea wall, and three landing craft on the approach to the beach.
 function makeShip(){
  const g=new THREE.Group();S.add(g);g.position.set(-25,0,-84);
  const hull=new THREE.Mesh(new THREE.BoxGeometry(29,4,55),mat(0x394943,.52,.25));hull.position.y=2;g.add(hull);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(27,.7,49),mat(0x686653));deck.position.y=4.1;g.add(deck);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(11,7,12),mats.concrete);bridge.position.set(0,8,-12);g.add(bridge);
  for(let i=-2;i<=2;i++){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,17,7),mats.metal);pole.position.set(i*3,11,11);g.add(pole)}
  return g
 }makeShip();
 const boats=[];
 for(let i=0;i<3;i++){const g=new THREE.Group();S.add(g);const hull=new THREE.Mesh(new THREE.BoxGeometry(6.3,1.2,10),mat(0x605b4a));hull.position.y=.55;g.add(hull);
  const bow=new THREE.Mesh(new THREE.BoxGeometry(4.8,1,2.2),mats.olive);bow.position.set(0,1.1,3);g.add(bow);
  const cargo=new THREE.Mesh(new THREE.BoxGeometry(4.1,1.4,4.2),mat(0x786d54));cargo.position.set(0,1.25,-1);g.add(cargo);
  boats.push(g)}
 // Connected beach-to-town landscape: barriers, craters, trench lines, bunkers, rope climb, and streets.
 function hedge(x,z,angle=0){const g=new THREE.Group();g.position.set(x,ground(z),z);g.rotation.y=angle;
  for(let a=-1;a<=1;a++){const beam=new THREE.Mesh(new THREE.BoxGeometry(.35,2.2,8),mats.metal);beam.position.set(a*1.8,1.15,0);beam.rotation.z=a===0?0:.75;g.add(beam)}
  S.add(g);block.push({x,z,w:5.5,d:2.4,h:2.2})}
 function crater(x,z,rad=3){
  const rim=mesh(new THREE.TorusGeometry(rad,.45,7,20),mat(0x76634b),x,ground(z)+.12,z,Math.PI/2);
  const pit=mesh(new THREE.CircleGeometry(rad*.78,18),mat(0x393a32),x,ground(z)+.08,z,-Math.PI/2);pit.rotation.x=-Math.PI/2
 }
 [[-16,4,0],[-8,18,.4],[14,7,-.45],[23,34,.2],[-25,39,-.3],[7,46,.1]].forEach(v=>hedge(...v));
 [[-23,14,3.8],[12,31,3],[29,48,4],[-36,51,3.5],[1,9,3]].forEach(v=>crater(...v));
 [[-11,2],[10,20],[-32,27],[31,12]].forEach(([x,z])=>putBox(x,ground(z),z,2.3,1.5,2.3,mats.crate));
 // Mountain ridges and the climb rope.
 for(let i=0;i<9;i++){const x=(i%2?1:-1)*(42+Math.random()*18),z=69+Math.random()*53;
  const m=mesh(new THREE.ConeGeometry(13+Math.random()*12,19+Math.random()*18,6),mat(i%2?0x696659:0x82745f),x,ground(z)+8,z);m.rotation.z=(Math.random()-.5)*.22}
 const ropeMat=new THREE.MeshStandardMaterial({color:0xd0ad67,roughness:.8});
 for(let x=-3;x<=3;x+=3){const rope=mesh(new THREE.CylinderGeometry(.075,.075,15,6),ropeMat,x,ground(73)+6.5,73);rope.rotation.x=-.22}
 for(let i=0;i<7;i++){const step=putBox(-5+i*1.5,ground(70+i*2)+.28,70+i*2,1.4,.55,1.3,mats.wood,false);step.rotation.x=-.22}
 // Fortified bunker pair faces seaward; the central approach stays open.
 function bunker(x,z,side){
  const y=ground(z);putBox(x,y,z-4,15,7,2.6,mats.concrete);putBox(x-7,y,z+1,2.5,7,8,mats.concrete);putBox(x+7,y,z+1,2.5,7,8,mats.concrete);
  putBox(x,y+7,z+1,17,2,8,mats.concrete);putBox(x,y,z+5,15,7,2,mats.concrete);
  putBox(x,y+4.5,z-5.2,4.7,.5,.4,mats.dark,false);
  putBox(x-3.3,y+3,z-5.3,1.5,1.1,.4,mats.dark,false);putBox(x+3.3,y+3,z-5.3,1.5,1.1,.4,mats.dark,false);
  const gun=putBox(x,y+4.1,z-6,2.2,.22,1.1,mats.metal,false);gun.rotation.x=.12;
  const slit=putBox(x,y+4.2,z-5.45,4.3,.24,.1,mats.dark,false);
  putBox(x+side*8,y,z+1,1.2,5,1.3,mats.dark,false);
 }
 bunker(-25,108,-1);bunker(25,108,1);
 for(let x=-40;x<=40;x+=8){if(Math.abs(x)<18)continue;putBox(x,ground(91),91,1.2,1.5,2.5,mats.wood)}
 // Town buildings leave three lanes between rows; windows and doors are non-colliding details.
 function house(x,z,w=12,d=10,color=0x8b806b){
  const y=ground(z),wall=mat(color),roof=mat(x%2?0x674b3d:0x554c43);
  putBox(x,y,z,w,6,d,wall);
  const top=mesh(new THREE.ConeGeometry(Math.max(w,d)*.75,4,4),roof,x,y+8,z);top.rotation.y=Math.PI/4;
  for(const side of [-1,1])for(const yy of [2.1,4.2])putBox(x+side*(w/2+.04),y+yy,z, .14,1.0,1.5,mats.window,false);
  putBox(x,y+1.2,z-d/2-.08,1.1,2.4,.15,mats.wood,false)
 }
 [[-29,151,13,12],[-12,160,10,10],[26,150,14,11],[12,176,12,11],[-29,185,12,12],[30,194,14,12],[-12,202,11,10],[12,216,12,11]].forEach((v,i)=>house(...v,i%2?0x98836b:0x877765));
 [[-18,145],[19,164],[-20,176],[20,188],[-18,212],[23,220]].forEach(([x,z])=>{putBox(x,ground(z),z,2,1.6,2,mats.crate)});
 // Capture markers on the continuous route.
 const zones=CP.map((p,i)=>{const y=ground(p.z),g=new THREE.Group();S.add(g);g.position.set(p.x,y+.08,p.z);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(9,.34,9,52),mats.ring);ring.rotation.x=-Math.PI/2;g.add(ring);
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(8.8,.2,.08,36),new THREE.MeshBasicMaterial({color:0x6f5a2e,transparent:true,opacity:.18,depthWrite:false}));disk.position.y=.04;g.add(disk);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,8,8),mat(0xd4bd83));pole.position.set(0,4,0);g.add(pole);
  const flag=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.7,.12),mat(0xc7aa68));flag.position.set(1.65,6.7,0);g.add(flag);
  const nameTex=document.createElement('canvas');nameTex.width=256;nameTex.height=72;const nx=nameTex.getContext('2d');nx.fillStyle='#17202ad9';nx.fillRect(3,5,250,62);nx.fillStyle='#fff';nx.font='bold 30px system-ui';nx.textAlign='center';nx.fillText((i+1)+' · '+p.n,128,47);
  const tx=new THREE.CanvasTexture(nameTex);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:false}));label.scale.set(8,2.2,1);label.position.set(0,10,0);g.add(label);
  return{g,ring,disk}
 });
 const cover=[];
 block.forEach(b=>{for(const s of [-1,1]){cover.push([b.x+s*(b.w/2+1),b.z],[b.x,b.z+s*(b.d/2+1)])}});
 function blocked(x,y,z){
  for(const b of block)if(y<ground(b.z)+b.h&&Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2)return true;
  return false
 }
 function clearRay(a,b){
  const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,n=Math.ceil(Math.hypot(dx,dy,dz)/2.2);
  for(let i=2;i<n;i++){const t=i/n;if(blocked(a.x+dx*t,a.y+dy*t,a.z+dz*t))return false}
  return true
 }
 function createAvatar(p){
  const g=new THREE.Group(),col=net.pcol(p)||'#889099',hex=parseInt(col.replace('#',''),16)||0x889099;
  const shirt=new THREE.Mesh(unitG,mat(hex,.82)),head=new THREE.Mesh(headG,mat(0xc3a886)),helmet=new THREE.Mesh(new THREE.SphereGeometry(.27,9,7,0,Math.PI*2,0,Math.PI/2),mat(p.team?0x4b5050:0x6c6a4d));
  shirt.position.y=.8;head.position.y=1.55;helmet.position.y=1.72;
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.48,.58,.24),mat(p.team?0x48433b:0x474b3d));pack.position.set(0,.86,-.28);
  const strap=new THREE.Mesh(new THREE.BoxGeometry(.68,.13,.34),mat(TC[p.team]));strap.position.set(0,1.12,0);
  const gun=new THREE.Mesh(new THREE.BoxGeometry(.13,.14,.8),mats.metal);gun.position.set(.28,.9,.44);
  g.add(shirt,head,helmet,pack,strap,gun);S.add(g);return g
 }
 const visual=new Map(),grenadeVisual=new Map(),tracerVisual=[];
 function makeGrenade(id){const o=mesh(new THREE.SphereGeometry(.2,8,7),mat(0x77845a,.7,.2),0,0,0);grenadeVisual.set(id,o);return o}
 function addTracer(p,to){
  const from=new THREE.Vector3(p.x,ground(p.z)+1.5,p.z),end=new THREE.Vector3(to[0],to[1],to[2]);
  const geo=new THREE.BufferGeometry().setFromPoints([from,end]),m=new THREE.LineBasicMaterial({color:net.pcol(p)||'#f4d17a',transparent:true,opacity:.9});
  const l=new THREE.Line(geo,m);S.add(l);tracerVisual.push({o:l,t:.13})
 }
 const HUD=E('div','ddhud',`<div class="ddtop"><div class="ddtoprow"><span class="ddobjective"></span><span class="ddclock"></span></div><div class="ddprogress"><i></i></div></div><div class="ddcross"></div><div class="ddstatus"></div><div class="ddcall"></div>`);
 frame.append(HUD);
 const objective=HUD.querySelector('.ddobjective'),clock=HUD.querySelector('.ddclock'),progress=HUD.querySelector('.ddprogress i'),status=HUD.querySelector('.ddstatus'),call=HUD.querySelector('.ddcall');
 const controls=E('div','ddcontrols',`<button type="button" class="btn ddfire">🔥 Vuur</button><button type="button" class="btn">↻ Wapen</button><button type="button" class="btn">⟳ Herladen</button><button type="button" class="btn">💣 Granaat</button>`);
 st.append(controls);const [fireBtn,cycleBtn,reloadBtn,grenBtn]=controls.querySelectorAll('button');
 const me=net.me.id,ps=new Map();let teamCounts=[0,0],localYaw=0,localPitch=0,joyX=0,joyY=0,fireTouch=0,lookId=-1,lookX=0,lookY=0,cmdReload=0,cmdGrenade=0,cmdWeapon=-1,sendClock=0,snapClock=0,uiClock=0,elapsed=0,terminal=0,reported=0,shotTraces=[],mouseHeld=0;
 const game={cp:0,prog:[0,0,0,0],time:600,elapsed:0,winner:-1,grenades:[],scores:[0,0],traces:[]};
 function spawn(team,index,first=true){
  if(team===0){const lane=(index%3)-1;return{x:lane*2,z:first?-69:-8,landing:first?9:0}}
  const cp=CP[Math.min(game.cp,3)];return{x:(index%4-1.5)*3,z:cp.z+10,landing:0}
 }
 function addPlayer(p,index){
  const team=teamCounts[0]<=teamCounts[1]?0:1;teamCounts[team]++;
  const at=spawn(team,index,true);
  const q={id:p.id,team,x:at.x,z:at.z,yaw:team?Math.PI:0,pitch:0,hp:100,alive:1,respawn:0,inv:2,landing:at.landing,weapon:0,ammo:GUN.map(w=>w.cap),reserve:GUN.map(w=>w.res),reload:0,reloadWeapon:0,cool:0,grenadeCool:0,kills:0,deaths:0,cp:0,input:{f:0,s:0,fire:0},model:null};
  ps.set(p.id,q);q.model=createAvatar({...p,team});return q
 }
 function syncRoster(){
  const current=new Set(net.players.map(p=>p.id));
  for(const [id,p]of ps)if(!current.has(id)){S.remove(p.model);ps.delete(id)}
  teamCounts=[0,0];
  net.players.forEach((p,i)=>{let q=ps.get(p.id);if(!q)q=addPlayer(p,i);else teamCounts[q.team]++;
   if(q.model){const sh=q.model.children[0];if(sh&&sh.material.color.getHexString()!==(net.pcol(p)||'#888888').slice(1).toLowerCase()){sh.material.color.set(net.pcol(p)||'#888888')}}
  })
 }
 // Always launch a full 4-v-4. Real players keep their seats; the host fills any
 // remaining places with ordinary NET bots, which use the same input validation.
 if(net.isHost)while(net.players.length<8)net.addBot();
 syncRoster();
 function selected(){return ps.get(me)}
 const inp=input(st,[['↑','ArrowUp'],['←','ArrowLeft'],['↓','ArrowDown'],['→','ArrowRight']],key=>{
  const k=String(key).toLowerCase();if(k==='r')cmdReload=1;else if(k==='g')cmdGrenade=1;else if('12345'.includes(k))cmdWeapon=+k-1
 });
 function axis(){
  const p=selected();if(!p)return;
  const f=(inp.has('ArrowUp')||inp.has('w')?1:0)-(inp.has('ArrowDown')||inp.has('s')?1:0)-joyY;
  const side=(inp.has('ArrowRight')||inp.has('d')?1:0)-(inp.has('ArrowLeft')||inp.has('a')?1:0)+joyX;
  return{f:clamp(f,-1,1),s:clamp(side,-1,1),fire:mouseHeld||fireTouch||inp.has('f')?1:0,sprint:inp.has(' ')?1:0}
 }
 function playerLook(e){
  if(lookId!==e.pointerId)return;
  const dx=e.clientX-lookX,dy=e.clientY-lookY;lookX=e.clientX;lookY=e.clientY;
  const p=selected();if(!p)return;p.yaw=(p.yaw-dx*.004+Math.PI*5)%(Math.PI*2);p.pitch=clamp(p.pitch-dy*.003,-1.15,1.15)
 }
 const canvasClick=()=>{if(!('ontouchstart'in window)&&document.pointerLockElement!==c&&c.requestPointerLock)try{c.requestPointerLock()}catch(e){}};
 const lockChange=()=>{if(document.pointerLockElement!==c)mouseHeld=0};
 const mouseLook=e=>{if(document.pointerLockElement!==c)return;const p=selected();if(p){p.yaw=(p.yaw-e.movementX*.0026+Math.PI*5)%(Math.PI*2);p.pitch=clamp(p.pitch-e.movementY*.0024,-1.15,1.15)}};
 const canvasDown=e=>{if(e.pointerType==='touch'){e.preventDefault();lookId=e.pointerId;lookX=e.clientX;lookY=e.clientY;try{c.setPointerCapture(e.pointerId)}catch(x){}}else if(e.button===0&&document.pointerLockElement===c)mouseHeld=1};
 const mouseUp=e=>{if(e.button===0)mouseHeld=0};
 c.addEventListener('click',canvasClick);
 document.addEventListener('pointerlockchange',lockChange);
 document.addEventListener('mousemove',mouseLook);
 c.addEventListener('pointerdown',canvasDown);
 c.addEventListener('pointermove',playerLook);
 const releaseLook=e=>{if(e.pointerId===lookId)lookId=-1;if(e.pointerType!=='touch'&&e.button===0)mouseHeld=0};
 c.addEventListener('pointerup',releaseLook);c.addEventListener('pointercancel',releaseLook);
 document.addEventListener('mouseup',mouseUp);
 const hold=(el,on,off)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture&&el.setPointerCapture(e.pointerId);on()});['pointerup','pointercancel','pointerleave'].forEach(t=>el.addEventListener(t,off))};
 hold(fireBtn,()=>fireTouch=1,()=>fireTouch=0);
 cycleBtn.onclick=()=>{const p=selected();if(p)cmdWeapon=(p.weapon+1)%GUN.length};
 reloadBtn.onclick=()=>cmdReload=1;grenBtn.onclick=()=>cmdGrenade=1;
 function moveStick(e){const rr=stick.getBoundingClientRect(),cx=rr.left+rr.width/2,cy=rr.top+rr.height/2;joyX=clamp((e.clientX-cx)/(rr.width*.34),-1,1);joyY=clamp((e.clientY-cy)/(rr.height*.34),-1,1)}
 const stick=E('button','btn','◉');stick.type='button';stick.setAttribute('aria-label','Beweegstick');stick.style.cssText='width:74px;height:54px;border-radius:28px;touch-action:none;font-size:24px';
 const joystick=E('div','ddcontrols');joystick.style.cssText='margin:2px auto 8px';joystick.append(stick);st.append(joystick);
 hold(stick,()=>{},()=>{joyX=joyY=0});stick.addEventListener('pointerdown',moveStick);stick.addEventListener('pointermove',e=>{if(e.buttons||e.pressure)moveStick(e)});
 function readInput(){
  const p=selected();if(!p)return;
  const a=axis()||{f:0,s:0,fire:0};a.f=Math.round(a.f*100)/100;a.s=Math.round(a.s*100)/100;
  if(net.isHost){p.input=a;if(cmdWeapon>=0)p.weapon=cmdWeapon;if(cmdReload){beginReload(p);cmdReload=0}if(cmdGrenade){throwGrenade(p);cmdGrenade=0}}
  else{
   const packet={k:'i',f:a.f,s:a.s,fire:a.fire,run:a.sprint,y:Math.round(p.yaw*1000),a:Math.round(p.pitch*1000)};
   if(cmdWeapon>=0){packet.w=cmdWeapon;cmdWeapon=-1}if(cmdReload){packet.r=1;cmdReload=0}if(cmdGrenade){packet.g=1;cmdGrenade=0}
   net.send(packet)
  }
 }
 function beginReload(p){
  if(!p.alive||p.reload>0)return;const wi=p.weapon;
  if(p.ammo[wi]>=GUN[wi].cap||p.reserve[wi]<=0)return;
  p.reloadWeapon=wi;p.reload=GUN[wi].reload
 }
 function damage(p,amount,by){
  if(!p.alive||p.inv>0||p.landing>0)return;
  p.hp=Math.max(0,p.hp-amount);
  if(p.hp===0){p.alive=0;p.respawn=5;p.deaths++;const attacker=ps.get(by);if(attacker){attacker.kills++;game.scores[attacker.team]++}}
 }
 function fire(p){
  if(!p.alive||p.landing>0||p.cool>0||p.reload>0)return;
  const wi=p.weapon,w=GUN[wi];if(p.ammo[wi]<=0){beginReload(p);return}
  p.ammo[wi]--;p.cool=w.rate;
  if(wi===4){const dx=Math.sin(p.yaw)*Math.cos(p.pitch),dz=Math.cos(p.yaw)*Math.cos(p.pitch),dy=Math.sin(p.pitch);
   game.grenades.push({id:(elapsed*1000|0)+'-'+p.id,x:p.x+dx*.9,y:ground(p.z)+1.45,z:p.z+dz*.9,vx:dx*14,vy:5.4+dy*7,vz:dz*14,team:p.team,owner:p.id,ttl:3.3});
   if(game.grenades.length>8)game.grenades.shift();return
  }
  const botSpread=net.isBot(p.id) ? .065 : 0,ox=p.x,oy=ground(p.z)+1.48,oz=p.z,shotYaw=p.yaw+(Math.random()-.5)*(w.spread+botSpread),shotPitch=clamp(p.pitch+(Math.random()-.5)*(w.spread+botSpread)*.7,-1.35,1.35),dx=Math.sin(shotYaw)*Math.cos(shotPitch),dy=Math.sin(shotPitch),dz=Math.cos(shotYaw)*Math.cos(shotPitch);
  let bestHit=null,bestT=w.range;
  for(const q of ps.values()){if(q.id===p.id||q.team===p.team||!q.alive||q.inv>0||q.landing>0)continue;
   const tx=q.x-ox,ty=ground(q.z)+1.2-oy,tz=q.z-oz,t=tx*dx+ty*dy+tz*dz;
   if(t<=0||t>=bestT)continue;const px=ox+dx*t,py=oy+dy*t,pz=oz+dz*t;
   if(Math.hypot(q.x-px,(ground(q.z)+1.05)-py,q.z-pz)>.72)continue;
   if(!clearRay({x:ox,y:oy,z:oz},{x:px,y:py,z:pz}))continue;
   bestHit=q;bestT=t
  }
  const end=[ox+dx*bestT,oy+dy*bestT,oz+dz*bestT];game.traces.push([net.players.findIndex(x=>x.id===p.id),Math.round(end[0]*10),Math.round(end[1]*10),Math.round(end[2]*10)]);
  if(game.traces.length>12)game.traces.shift();
  if(bestHit){const dist=Math.hypot(bestHit.x-p.x,bestHit.z-p.z),fall=clamp(1-dist/(w.range*1.4),.58,1),head=end[1]>ground(bestHit.z)+1.43?1.25:1;damage(bestHit,w.dmg*fall*head,p.id)}
 }
 function throwGrenade(p){if(!p.alive||p.landing>0||p.grenadeCool>0)return;p.weapon=4;if(p.ammo[4]<=0){beginReload(p);return}fire(p);p.grenadeCool=1.25}
 function detonate(g){
  for(const p of ps.values()){if(p.team===g.team||!p.alive)continue;const d=Math.hypot(p.x-g.x,p.z-g.z),dy=Math.abs(ground(p.z)+.85-g.y);
   if(d<9&&dy<8)damage(p,GUN[4].dmg*(1-d/10),g.owner)}
 }
 function updateAmmo(p,dt){
  if(p.cool>0)p.cool=Math.max(0,p.cool-dt);if(p.grenadeCool>0)p.grenadeCool=Math.max(0,p.grenadeCool-dt);
  if(p.inv>0)p.inv=Math.max(0,p.inv-dt);
  if(p.reload>0){p.reload-=dt;if(p.reload<=0){p.reload=0;const w=GUN[p.reloadWeapon],n=Math.min(w.cap-p.ammo[p.reloadWeapon],p.reserve[p.reloadWeapon]);p.ammo[p.reloadWeapon]+=n;p.reserve[p.reloadWeapon]-=n}}
  if(p.landing>0){
   p.landing=Math.max(0,p.landing-dt);const t=1-p.landing/9;const boat=(net.players.findIndex(x=>x.id===p.id)%3)-1;
   p.x=boat*8+(net.players.findIndex(x=>x.id===p.id)%2?-.9:.9);p.z=-72+t*61;return
  }
  if(!p.alive){p.respawn-=dt;if(p.respawn<=0){const at=spawn(p.team,net.players.findIndex(x=>x.id===p.id),false);p.x=at.x;p.z=at.z;p.hp=100;p.alive=1;p.inv=2;p.ammo=GUN.map(w=>w.cap);p.reserve=GUN.map(w=>w.res);p.reload=0}return}
  const a=p.input||{f:0,s:0},len=Math.hypot(a.f||0,a.s||0),norm=len>1?1/len:1,speed=a.sprint?8:6.2;
  const dx=(Math.sin(p.yaw)*(a.f||0)+Math.cos(p.yaw)*(a.s||0))*speed*dt*norm;
  const dz=(Math.cos(p.yaw)*(a.f||0)-Math.sin(p.yaw)*(a.s||0))*speed*dt*norm;
  let nx=p.x+dx,nz=p.z+dz;
  if(p.team===0&&game.cp<4)nz=Math.min(nz,CP[game.cp].z+10);
  if(Math.abs(nx)<77&&!blocked(nx,ground(nz)+.9,nz))p.x=nx;
  if(nz>-96&&nz<270&&!blocked(p.x,ground(nz)+.9,nz))p.z=nz;
  if(a.fire&&p.cool<=0)fire(p)
 }
 let botClock=0;const botSent=new Map();
 function simBots(dt){
  botClock+=dt;if(botClock<.14)return;const tick=botClock;botClock=0;
  for(const p of ps.values()){
   if(!net.isBot(p.id)||!p.alive||p.landing>0)continue;
   const foes=[...ps.values()].filter(q=>q.alive&&q.team!==p.team);
   let target=null,near=1e6;
   for(const q of foes){if(q.landing>0)continue;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<near&&d<94&&clearRay({x:p.x,y:ground(p.z)+1.45,z:p.z},{x:q.x,y:ground(q.z)+1.3,z:q.z})){target=q;near=d}}
   const cp=CP[Math.min(game.cp,3)],guardZ=cp.z+(p.team?8:-3);let goal={x:p.team?clamp((p.x<0?-1:1)*12,-18,18):cp.x,z:guardZ};
   if(target&&near<26){
    let choice=null,cs=1e9;
    for(const v of cover){if(blocked(v[0],ground(v[1])+.7,v[1]))continue;const d=Math.hypot(v[0]-p.x,v[1]-p.z);if(d>20)continue;
     const clear=clearRay({x:v[0],y:ground(v[1])+1,z:v[1]},{x:target.x,y:ground(target.z)+1,z:target.z});
     const value=d+(clear?7:0)+Math.abs(v[1]-guardZ)*.08;if(value<cs){cs=value;choice=v}}
    if(choice)goal={x:choice[0],z:choice[1]}
   }
   let aimYaw=p.yaw,aimPitch=0,fireNow=0;
   if(target){
    const ty=ground(target.z)+1.2-(ground(p.z)+1.48),dx=target.x-p.x,dz=target.z-p.z;
    aimYaw=Math.atan2(dx,dz);aimPitch=Math.atan2(ty,Math.hypot(dx,dz));
    const turn=clamp((Math.atan2(Math.sin(aimYaw-p.yaw),Math.cos(aimYaw-p.yaw))),-tick*2.5,tick*2.5);p.yaw+=turn;
    p.pitch+=clamp(aimPitch-p.pitch,-tick*1.6,tick*1.6);
    if(near<60&&Math.abs(Math.atan2(Math.sin(aimYaw-p.yaw),Math.cos(aimYaw-p.yaw)))<.13&&Math.abs(aimPitch-p.pitch)<.13)fireNow=1
   }else{
    const dx=goal.x-p.x,dz=goal.z-p.z;aimYaw=Math.atan2(dx,dz);
    p.yaw+=clamp(Math.atan2(Math.sin(aimYaw-p.yaw),Math.cos(aimYaw-p.yaw)),-tick*2.1,tick*2.1);
    p.pitch*=.9
   }
   const close=Math.hypot(goal.x-p.x,goal.z-p.z),front=Math.cos(p.yaw)*(goal.z-p.z)+Math.sin(p.yaw)*(goal.x-p.x);
   let forward=close>5&&front>0?1:0,side=0;
   if(target&&near<18)forward*=.32;
   if(blocked(p.x+Math.sin(p.yaw)*2,ground(p.z)+.8,p.z+Math.cos(p.yaw)*2)){forward=-.7;side=(p.id.charCodeAt(0)%2?1:-1)}
   const inpBot={f:forward,s:side,fire:fireNow,y:Math.round(p.yaw*1000),a:Math.round(p.pitch*1000)};
   const sig=[inpBot.f.toFixed(1),inpBot.s.toFixed(1),inpBot.fire,Math.round(inpBot.y/35),Math.round(inpBot.a/35)].join(':');
   if(botSent.get(p.id)!==sig){botSent.set(p.id,sig);net.botAct(p.id,{k:'i',...inpBot})}
  }
 }
 function capture(dt){
  if(game.cp>=4)return;
  const cp=CP[game.cp];let a=0,d=0;
  for(const p of ps.values())if(p.alive&&Math.hypot(p.x-cp.x,p.z-cp.z)<9){if(p.team===0)a++;else d++}
  if(a&&!d)game.prog[game.cp]=Math.min(1,game.prog[game.cp]+dt*(1+.2*(a-1))/17);
  if(game.prog[game.cp]>=1){for(const p of ps.values())if(p.team===0&&p.alive&&Math.hypot(p.x-cp.x,p.z-cp.z)<13)p.cp++;
   game.cp++;game.time+=300;if(game.cp===4)game.winner=0}
 }
 function hostStep(dt){
  if(game.winner>=0)return;
  elapsed+=dt;game.elapsed=elapsed;
  for(const p of ps.values()){
   updateAmmo(p,dt);
   if(p.id===me){const a=axis();p.input=a||{f:0,s:0,fire:0};if(cmdWeapon>=0){p.weapon=cmdWeapon;cmdWeapon=-1}if(cmdReload){beginReload(p);cmdReload=0}if(cmdGrenade){throwGrenade(p);cmdGrenade=0}}
  }
  simBots(dt);
  for(const g of game.grenades){g.ttl-=dt;g.vy-=9.8*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.z+=g.vz*dt;
   if(g.y<=ground(g.z)+.2||g.ttl<=0){g.y=ground(g.z)+.2;detonate(g);g.ttl=-1}}
  game.grenades=game.grenades.filter(g=>g.ttl>0);
  capture(dt);game.time-=dt;
  if(game.cp<4&&game.time<=0){game.time=0;game.winner=1}
 }
 function pack(){
  const players=net.players.map(n=>{const p=ps.get(n.id);if(!p)return[];
   return[Math.round(p.x*10),Math.round(p.z*10),Math.round(p.yaw*1000),Math.round(p.pitch*1000),Math.round(p.hp),p.weapon,...p.ammo,...p.reserve,p.alive?1:0,Math.round(p.respawn*10),p.kills,p.deaths,p.team,Math.round(p.inv*10),Math.round(p.landing*10),p.cp]
  });
  return{k:'s',p:players,cp:game.cp,pr:game.prog.map(x=>Math.round(x*1000)),tm:Math.round(game.time*10),el:Math.round(elapsed*10),win:game.winner,gr:game.grenades.map(g=>[g.id,Math.round(g.x*10),Math.round(g.y*10),Math.round(g.z*10),Math.round(g.vx*10),Math.round(g.vy*10),Math.round(g.vz*10),g.team,net.players.findIndex(p=>p.id===g.owner),Math.round(g.ttl*10)]),tr:game.traces.splice(0,12)}
 }
 function applySnap(d){
  if(!d||d.k!=='s')return;
  game.cp=d.cp|0;game.prog=(d.pr||[0,0,0,0]).map(x=>x/1000);game.time=(d.tm||0)/10;elapsed=(d.el||0)/10;game.winner=d.win;
  (d.p||[]).forEach((v,i)=>{const meta=net.players[i];if(!meta||!v)return;let p=ps.get(meta.id);if(!p)p=addPlayer(meta,i);
   p.x=v[0]/10;p.z=v[1]/10;p.yaw=v[2]/1000;p.pitch=v[3]/1000;p.hp=v[4];p.weapon=v[5];
   for(let j=0;j<5;j++){p.ammo[j]=v[6+j];p.reserve[j]=v[11+j]}
   p.alive=v[16];p.respawn=v[17]/10;p.kills=v[18];p.deaths=v[19];p.team=v[20];p.inv=v[21]/10;p.landing=v[22]/10;p.cp=v[23]||0
  });
  game.grenades=(d.gr||[]).map(g=>({id:g[0],x:g[1]/10,y:g[2]/10,z:g[3]/10,vx:g[4]/10,vy:g[5]/10,vz:g[6]/10,team:g[7],owner:net.players[g[8]]?.id||'',ttl:g[9]/10}));
  (d.tr||[]).forEach(v=>{const p=net.players[v[0]];if(p)addTracer(ps.get(p.id)||{x:0,z:0},[v[1]/10,v[2]/10,v[3]/10])});
  if(game.winner>=0)reportResult()
 }
 function reportResult(){
  if(reported)return;reported=1;terminal=1;
  const scores={};for(const p of ps.values())scores[p.id]=(p.team===game.winner?1000:0)+p.kills*10+p.cp*4;
  net.result({winner:null,scores,title:game.winner===0?'🟦 De aanvallers veroveren de eindpositie!':'🟥 De verdedigers houden stand!',text:game.winner===0?'Vier controlepunten veroverd · Aanvallers winnen':'De tijd is om · Verdedigers winnen',unit:' pt'})
 }
 const off=net.on((d,from)=>{
  if(!d||typeof d!=='object')return;
  if(net.isHost&&d.k==='i'){
   const p=ps.get(from);if(!p)return;
   p.input={f:clamp(+d.f||0,-1,1),s:clamp(+d.s||0,-1,1),fire:d.fire?1:0,sprint:d.run?1:0};
   if(Number.isFinite(+d.y))p.yaw=+d.y/1000;if(Number.isFinite(+d.a))p.pitch=clamp(+d.a/1000,-1.15,1.15);
   if(Number.isInteger(d.w)&&d.w>=0&&d.w<5)p.weapon=d.w;
   if(d.r)beginReload(p);if(d.g)throwGrenade(p)
  }else if(!net.isHost&&d.k==='s')applySnap(d)
 });
 const offP=net.onPlayers(()=>{syncRoster()});
 function resultBars(){
  score.replaceChildren();
  for(let team=0;team<2;team++){const b=E('span');b.style.color=TT[team];const members=net.players.filter(p=>ps.get(p.id)?.team===team);
   b.textContent=(team===0?'🟦 ':'🟥 ')+TEAM[team]+' '+members.length+(members.some(p=>p.id===me)?' · jij':'');score.append(b)}
  const mid=E('span');mid.textContent='   '+[...ps.values()].reduce((n,p)=>n+p.kills,0)+' treffers';score.append(mid)
 }
 function drawBoats(){
  const t=clamp(1-Math.max(0,9-elapsed)/9,0,1);
  boats.forEach((b,i)=>{b.position.set((i-1)*8,0,-72+t*61);b.rotation.y=.04*Math.sin(elapsed+i)})
 }
 function drawEntities(dt){
  for(const n of net.players){const p=ps.get(n.id);if(!p)continue;
   if(!p.model){p.model=createAvatar({...n,team:p.team})}
   p.model.visible=p.alive&&n.id!==me;
   p.model.position.set(p.x,ground(p.z),p.z);p.model.rotation.y=p.yaw;
   const head=p.model.children[1];if(head)head.material.color.set(p.team?0xb99779:0xc7aa88)
  }
  const alive=new Set();
  for(const g of game.grenades){alive.add(String(g.id));let o=grenadeVisual.get(String(g.id));if(!o)o=makeGrenade(String(g.id));o.position.set(g.x,g.y,g.z)}
  for(const [id,o]of grenadeVisual)if(!alive.has(id)){S.remove(o);o.geometry.dispose();o.material.dispose();grenadeVisual.delete(id)}
  for(let i=tracerVisual.length-1;i>=0;i--){const q=tracerVisual[i];q.t-=dt;q.o.material.opacity=clamp(q.t/.13,0,1);if(q.t<=0){S.remove(q.o);q.o.geometry.dispose();q.o.material.dispose();tracerVisual.splice(i,1)}}
  drawBoats()
 }
 function updateZones(){
  zones.forEach((z,i)=>{const done=i<game.cp,active=i===game.cp;const col=done?0x69d895:active?0xffdc75:0x9ca6a2;z.ring.material.color.setHex(col);z.ring.material.emissive.setHex(done?0x123922:active?0x44320a:0);
   z.disk.material.color.setHex(col);z.disk.material.opacity=active?.25:.12;
   z.g.position.y=ground(CP[i].z)+.08;
  });
  const idx=Math.min(game.cp,3),name=CP[idx].n;objective.textContent=game.cp>=4?'✅ Alle controlepunten veroverd':(game.prog[idx]>0?'Verover '+name+' · '+Math.round(game.prog[idx]*100)+'%':'Doel: '+name+' ('+(idx+1)+'/4)');
  const sec=Math.max(0,Math.ceil(game.time)),m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');clock.textContent='⏱ '+m+':'+s;
  progress.style.width=game.cp>=4?'100%':Math.round(game.prog[idx]*100)+'%';
 }
 const viewGun=new THREE.Group();cam.add(viewGun);S.add(cam);
 function rebuildGun(){
  while(viewGun.children.length){const o=viewGun.children.pop();if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()}
  const w=GUN[selected()?.weapon||0],tone=mat(0x30383a,.48,.68),wood=mat(0x756044);
  const barrel=new THREE.Mesh(new THREE.BoxGeometry(.095,.095,w.n==='Machinegeweer'?.86:.62),tone);barrel.position.set(.17,-.16,-.56);viewGun.add(barrel);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.23,.18,.34),w.n==='Pistool'?tone:wood);body.position.set(.17,-.25,-.28);viewGun.add(body);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.09,.22,.1),tone);grip.position.set(.18,-.42,-.22);viewGun.add(grip);
  if(w.n==='Machinegeweer'){const stock=new THREE.Mesh(new THREE.BoxGeometry(.24,.14,.27),wood);stock.position.set(.17,-.25,-.05);viewGun.add(stock)}
  viewGun.position.set(.18,-.2,-.16)
 }
 let lastWeap=-1;
 function draw(dt){
  const p=selected();
  if(p){
   cam.position.set(p.x,ground(p.z)+1.48,p.z);cam.rotation.order='YXZ';cam.rotation.set(-p.pitch,p.yaw+Math.PI,0,'YXZ');
   if(lastWeap!==p.weapon){lastWeap=p.weapon;rebuildGun()}
   const wiggle=p.alive?Math.sin(elapsed*10)*(Math.abs(p.input?.f||0)+Math.abs(p.input?.s||0))*.018:0;viewGun.position.y=-.2+wiggle
  }
  drawEntities(dt);r.render(S,cam)
 }
 function updatePanel(force){
  const p=selected();if(!p)return;
  const gun=GUN[p.weapon],isContest=game.cp<4&&[...ps.values()].some(q=>q.alive&&q.team!==p.team&&Math.hypot(q.x-CP[game.cp].x,q.z-CP[game.cp].z)<9);
  status.textContent=(p.team===0?'🟦 Aanvaller':'🟥 Verdediger')+' · ❤ '+p.hp+' · '+gun.n+' '+p.ammo[p.weapon]+'/'+p.reserve[p.weapon]+(p.reload>0?' · herladen…':'')+(p.landing>0?' · landingsboot':'')+(!p.alive?' · respawn '+Math.ceil(p.respawn)+'s':'');
  const own=net.players.filter(q=>ps.get(q.id)?.team===p.team).length,foe=net.players.filter(q=>ps.get(q.id)?.team!==p.team).length;
  call.textContent=(isContest?'⚔️ Punt betwist':'👥 '+own+' vs '+foe)+' · '+[...ps.values()].filter(q=>q.team===p.team).reduce((n,q)=>n+q.kills,0)+'–'+[...ps.values()].filter(q=>q.team!==p.team).reduce((n,q)=>n+q.kills,0);
  if(force)resultBars()
 }
 let loopTime=0;
 const stopLoop=loop(dt=>{
  loopTime+=dt;sendClock+=dt;snapClock+=dt;uiClock+=dt;
  if(!net.isHost&&sendClock>=.1){sendClock%=.1;readInput()}
  else if(net.isHost)readInput();
  if(net.isHost){
   hostStep(dt);
   if(snapClock>=.12){snapClock%=.12;const d=pack();applySnap({...d,k:'s'});net.send(d)}
  }
  if(uiClock>=.18){uiClock=0;updateZones();updatePanel(true)}
  draw(dt)
 });
 function teamOutput(){const players=[...ps.values()];if(!players.some(p=>p.team===0)||!players.some(p=>p.team===1))return;resultBars()}
 updateZones();teamOutput();updatePanel(true);
 function clean(){
  stopLoop();inp.stop();off();offP();
  document.removeEventListener('mousemove',mouseLook);document.removeEventListener('pointerlockchange',lockChange);document.removeEventListener('mouseup',mouseUp);
  c.removeEventListener('click',canvasClick);c.removeEventListener('pointerdown',canvasDown);c.removeEventListener('pointermove',playerLook);c.removeEventListener('pointerup',releaseLook);c.removeEventListener('pointercancel',releaseLook);
  if(document.pointerLockElement===c&&document.exitPointerLock)document.exitPointerLock();
  style.remove();T.dispose()
 }
 // Keep named event references so the browser listeners are removed on every replay.
 return clean
}},
