import { firebaseConfig } from "./firebase-config.js";
const $=id=>document.getElementById(id),say=t=>{const e=$("cs");if(e)e.textContent=t;const f=$("cs2");if(f)f.textContent=t};
const hora=()=>new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"});
const msg=x=>({"auth/invalid-email":"Correo no válido.","auth/weak-password":"La contraseña debe tener al menos 6 caracteres.","auth/email-already-in-use":"Ese correo ya tiene cuenta: usa Entrar.","auth/invalid-credential":"Correo o contraseña incorrectos.","auth/missing-password":"Escribe la contraseña.","auth/operation-not-allowed":"Falta activar Correo/contraseña en Firebase Authentication.","auth/network-request-failed":"Sin conexión."}[x.code]||("No se pudo: "+(x.code||x.message)));
(async()=>{
 if(!firebaseConfig||!firebaseConfig.apiKey){say("La nube aún no está configurada: puedes usar la app solo en este dispositivo.");return}
 try{
  const B="https://www.gstatic.com/firebasejs/12.11.0/";
  const [{initializeApp},A,F]=await Promise.all([import(B+"firebase-app.js"),import(B+"firebase-auth.js"),import(B+"firebase-firestore.js")]);
  const app=initializeApp(firebaseConfig),auth=A.getAuth(app);
  let db;try{db=F.initializeFirestore(app,{localCache:F.persistentLocalCache()})}catch(e){db=F.getFirestore(app)}
  let ref=null,unsub=null,timer=null,linked=localStorage.getItem("kronos-v1-linked")==="1";
  const link=()=>{linked=true;try{localStorage.setItem("kronos-v1-linked","1")}catch(e){}};
  async function push(){if(!ref)return;try{if(!window.getU())window.bump();await F.setDoc(ref,{u:window.getU(),data:JSON.stringify(window.getState()),at:Date.now()});say("Sincronizado "+hora())}catch(e){say("No se pudo guardar en la nube ("+(e.code||e.message)+"). Se reintenta al reconectar.")}}
  window.cloudPush=()=>{if(!ref)return;clearTimeout(timer);timer=setTimeout(push,800)};
  addEventListener("online",()=>window.cloudPush());
  window.kSignOut=()=>A.signOut(auth);
  A.onAuthStateChanged(auth,user=>{
   if(unsub){unsub();unsub=null}ref=null;
   if(window.kUser)window.kUser(user);
   if(!user){say("Entra para sincronizar entre tus dispositivos");return}
   ref=F.doc(db,"users",user.uid);say("Conectando…");
   unsub=F.onSnapshot(ref,snap=>{
    if(snap.metadata.hasPendingWrites)return;
    if(!snap.exists()){if(window.hasLocal())push();else say("Conectado");link();return}
    const d=snap.data(),cu=d.u||0,lu=window.getU();
    if(cu===lu){say("Sincronizado "+hora());link();return}
    if(cu>lu){
     if(!linked&&lu===0&&window.hasLocal()&&!confirm("Ya hay datos guardados en tu nube.\nAceptar = usar los de la nube en este aparato.\nCancelar = subir los de este aparato y reemplazar la nube.")){window.bump();push();link();return}
     try{window.applyState(JSON.parse(d.data),cu);say("Datos descargados "+hora())}catch(e){say("No se pudieron leer los datos de la nube")}
    }else push();
    link();
   },err=>say("Error de nube: "+(err.code==="permission-denied"?"revisa las reglas de Firestore":(err.code||err.message))));
  });
  const cred=()=>[$("ce").value.trim(),$("cp").value];
  $("cr").onclick=async()=>{const [e,p]=cred();try{await A.createUserWithEmailAndPassword(auth,e,p)}catch(x){alert(msg(x))}};
  $("cl").onclick=async()=>{const [e,p]=cred();try{await A.signInWithEmailAndPassword(auth,e,p)}catch(x){alert(msg(x))}};
 }catch(e){say("No se pudo cargar la nube: "+(e.message||e))}
})();
