"use client";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        setIsAdmin(u.email === ADMIN_EMAIL);
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUsageCount(snap.data().count || 0);
        } else {
          await setDoc(ref, { count: 0 });
        }
      }
    });
    return () => unsub();
  }, []);

  async function loginGoogle() {
    setAuthLoading("google");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      setError(e.message);
    }
    setAuthLoading("");
  }

  async function loginEmail() {
    setAuthLoading("email");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setAuthLoading("");
  }

  async function generate() {
    if (!url) return setError("YouTube линк оруулна уу!");
    if (!isAdmin && usageCount >= 3) return setError("Үнэгүй 3 удаа дууслаа! Admin эрх шаардлагатай.");
    setGenerating(true);
    setError("");
    setResult("");
    try {
      const ref = doc(db, "users", user.uid);
      if (!isAdmin) {
        await updateDoc(ref, { count: increment(1) });
        setUsageCount((c) => c + 1);
      }
      setResult(`✅ "${url}" - Shorts үүсгэж байна...\n\nЭнэ функц удахгүй бэлэн болно!`);
    } catch (e: any) {
      setError(e.message);
    }
    setGenerating(false);
  }

  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#0a0a0a",color:"white"}}>Уншиж байна...</div>;

  if (!user) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a0a0a",color:"white",fontFamily:"sans-serif"}}>
      <div style={{fontSize:48,marginBottom:8}}>🎬</div>
      <h1 style={{fontSize:28,fontWeight:"bold",marginBottom:4}}>ShortsStudio</h1>
      <p style={{color:"#888",marginBottom:32}}>Бүртгэл үүсгэх</p>
      <div style={{background:"#111",padding:32,borderRadius:16,width:340}}>
        <button onClick={loginGoogle} disabled={authLoading==="google"} style={{width:"100%",padding:"12px",background:"white",color:"black",border:"none",borderRadius:8,cursor:"pointer",marginBottom:16,fontWeight:"bold"}}>
          {authLoading==="google" ? "..." : "G  Google-ээр нэвтрэх"}
        </button>
        <div style={{color:"#555",textAlign:"center",marginBottom:16}}>эсвэл и-мэйлээр</div>
        <input placeholder="И-мэйл" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #333",background:"#222",color:"white",marginBottom:8,boxSizing:"border-box"}}/>
        <input placeholder="Нууц үг" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #333",background:"#222",color:"white",marginBottom:8,boxSizing:"border-box"}}/>
        {error && <div style={{color:"#ff4444",marginBottom:8,fontSize:13}}>{error}</div>}
        <button onClick={loginEmail} disabled={!!authLoading} style={{width:"100%",padding:12,background:"#e53",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>
          {mode==="login" ? "Нэвтрэх →" : "Бүртгүүлэх →"}
        </button>
        <p style={{textAlign:"center",marginTop:12,color:"#888",fontSize:13}}>
          {mode==="login" ? "Бүртгэлгүй юу? " : "Бүртгэлтэй юу? "}
          <span onClick={()=>setMode(mode==="login"?"register":"login")} style={{color:"#e53",cursor:"pointer"}}>{mode==="login"?"Бүртгүүлэх":"Нэвтрэх"}</span>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"white",fontFamily:"sans-serif",padding:24}}>
      <div style={{maxWidth:700,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:28}}>🎬</span>
            <span style={{fontSize:20,fontWeight:"bold"}}>ShortsStudio</span>
            {isAdmin && <span style={{background:"#e53",padding:"2px 8px",borderRadius:4,fontSize:12}}>ADMIN</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{color:"#888",fontSize:13}}>{user.email}</span>
            <button onClick={()=>signOut(auth)} style={{padding:"6px 12px",background:"#222",color:"white",border:"1px solid #333",borderRadius:6,cursor:"pointer"}}>Гарах</button>
          </div>
        </div>

        <div style={{background:"#111",borderRadius:16,padding:24,marginBottom:16}}>
          <h2 style={{fontSize:20,marginBottom:16}}>Shorts Generator</h2>
          {!isAdmin && (
            <div style={{background:"#1a1a1a",borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:"#aaa"}}>
              Үнэгүй ашиглалт: <strong style={{color:usageCount>=3?"#ff4444":"#4caf50"}}>{usageCount}/3</strong>
              {usageCount>=3 && <span style={{color:"#ff4444"}}> — Дууслаа!</span>}
            </div>
          )}
          <input
            placeholder="YouTube линк оруулна уу..."
            value={url}
            onChange={e=>setUrl(e.target.value)}
            style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #333",background:"#222",color:"white",marginBottom:12,boxSizing:"border-box",fontSize:15}}
          />
          {error && <div style={{color:"#ff4444",marginBottom:12,fontSize:13}}>{error}</div>}
          <button
            onClick={generate}
            disabled={generating || (!isAdmin && usageCount>=3)}
            style={{width:"100%",padding:14,background:(!isAdmin&&usageCount>=3)?"#333":"#e53",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:"bold",fontSize:16}}
          >
            {generating ? "Үүсгэж байна..." : "Shorts үүсгэх 🚀"}
          </button>
        </div>

        {result && (
          <div style={{background:"#111",borderRadius:16,padding:24}}>
            <h3 style={{marginBottom:12}}>Үр дүн:</h3>
            <pre style={{color:"#4caf50",whiteSpace:"pre-wrap"}}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
