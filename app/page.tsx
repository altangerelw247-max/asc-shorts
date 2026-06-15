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
  const [showPass, setShowPass] = useState(false);

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
    if (!url) return setError("Please enter a YouTube link!");
    if (!isAdmin && usageCount >= 3) return setError("Free limit reached! Admin access required.");
    setGenerating(true);
    setError("");
    setResult("");
    try {
      const ref = doc(db, "users", user.uid);
      if (!isAdmin) {
        await updateDoc(ref, { count: increment(1) });
        setUsageCount((c) => c + 1);
      }
      setResult(`✅ "${url}" - Generating shorts...\n\nThis feature will be available soon!`);
    } catch (e: any) {
      setError(e.message);
    }
    setGenerating(false);
  }

  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#0a0a0a",color:"white"}}>Loading...</div>;

  if (!user) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a0a0a",color:"white",fontFamily:"sans-serif"}}>
      <div style={{fontSize:48,marginBottom:8}}>🎬</div>
      <h1 style={{fontSize:28,fontWeight:"bold",marginBottom:4}}>ShortsStudio</h1>
      <p style={{color:"#888",marginBottom:32}}>Create your account</p>
      <div style={{background:"#111",padding:32,borderRadius:16,width:340}}>
        <button onClick={loginGoogle} disabled={authLoading==="google"} style={{width:"100%",padding:"12px",background:"white",color:"black",border:"none",borderRadius:8,cursor:"pointer",marginBottom:16,fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.5 2.7 13.5l7.8 6C12.5 13 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/><path fill="#FBBC05" d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5l-7.8-6C1 16.5 0 20.1 0 24s1 7.5 2.7 10.5l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.8 6C6.7 42.5 14.7 48 24 48z"/></svg>
          {authLoading==="google" ? "..." : "Sign in with Google"}
        </button>
        <div style={{color:"#555",textAlign:"center",marginBottom:16}}>or with email</div>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"1px solid #333",background:"#222",color:"white",marginBottom:8,boxSizing:"border-box"}}/>
        <div style={{position:"relative",marginBottom:8}}>
          <input placeholder="Password" type={showPass ? "text" : "password"} value={pass} onChange={e=>setPass(e.target.value)} style={{width:"100%",padding:10,paddingRight:40,borderRadius:8,border:"1px solid #333",background:"#222",color:"white",boxSizing:"border-box"}}/>
          <span onClick={()=>setShowPass(!showPass)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",cursor:"pointer",fontSize:18}}>
            {showPass ? "🙈" : "👁️"}
          </span>
        </div>
        {error && <div style={{color:"#ff4444",marginBottom:8,fontSize:13}}>{error}</div>}
        <button onClick={loginEmail} disabled={!!authLoading} style={{width:"100%",padding:12,background:"#e53",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontWeight:"bold"}}>
          {mode==="login" ? "Sign In →" : "Sign Up →"}
        </button>
        <p style={{textAlign:"center",marginTop:12,color:"#888",fontSize:13}}>
          {mode==="login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={()=>setMode(mode==="login"?"register":"login")} style={{color:"#e53",cursor:"pointer"}}>{mode==="login"?"Sign Up":"Sign In"}</span>
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
            <button onClick={()=>signOut(auth)} style={{padding:"6px 12px",background:"#222",color:"white",border:"1px solid #333",borderRadius:6,cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>

        <div style={{background:"#111",borderRadius:16,padding:24,marginBottom:16}}>
          <h2 style={{fontSize:20,marginBottom:16}}>Shorts Generator</h2>
          {!isAdmin && (
            <div style={{background:"#1a1a1a",borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:"#aaa"}}>
              Free usage: <strong style={{color:usageCount>=3?"#ff4444":"#4caf50"}}>{usageCount}/3</strong>
              {usageCount>=3 && <span style={{color:"#ff4444"}}> — Limit reached!</span>}
            </div>
          )}
          <input
            placeholder="Enter YouTube link..."
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
            {generating ? "Generating..." : "Generate Shorts 🚀"}
          </button>
        </div>

        {result && (
          <div style={{background:"#111",borderRadius:16,padding:24}}>
            <h3 style={{marginBottom:12}}>Result:</h3>
            <pre style={{color:"#4caf50",whiteSpace:"pre-wrap"}}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
