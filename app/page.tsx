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
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
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
    if (!email || !pass) { setError("И-мэйл, нууц үг оруулна уу."); return; }
    setAuthLoading("email");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
    } catch (e: any) {
      setError(e.code === "auth/user-not-found" ? "Хэрэглэгч олдсонгүй." :
               e.code === "auth/wrong-password" ? "Нууц үг буруу." :
               e.code === "auth/email-already-in-use" ? "И-мэйл аль хэдийн бүртгэлтэй." :
               e.message);
    }
    setAuthLoading("");
  }

  async function logout() {
    await signOut(auth);
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#08080f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, border:"3px solid rgba(255,255,255,0.1)", borderTopColor:"#FF2D55", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#08080f", color:"#fff", fontFamily:"Inter,-apple-system,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#FF2D55,#FF6B35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>▶</div>
            <span style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em" }}>Shorts<span style={{color:"#FF2D55"}}>Studio</span></span>
          </div>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>{mode === "login" ? "Тавтай морил 👋" : "Бүртгэл үүсгэх"}</div>
        </div>

        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:28 }}>
          {/* Google */}
          <button onClick={loginGoogle} disabled={!!authLoading} style={{
            width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
            borderRadius:12, border:"1px solid rgba(0,0,0,0.12)", background:"#fff",
            color:"#1f1f1f", fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:10,
            opacity: authLoading && authLoading !== "google" ? 0.4 : 1,
          }}>
            {authLoading === "google" ? <Spinner dark/> : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
            {authLoading === "google" ? "Нэвтэрч байна..." : "Google-ээр нэвтрэх"}
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>эсвэл и-мэйлээр</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
          </div>

          {/* Email form */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <input value={email} onChange={e=>{setEmail(e.target.value);setError("");}}
              placeholder="И-мэйл хаяг" type="email"
              style={{ padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" as any }}/>
            <input value={pass} onChange={e=>{setPass(e.target.value);setError("");}}
              placeholder="Нууц үг" type="password"
              style={{ padding:"11px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#fff", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" as any }}/>
            {error && <div style={{ fontSize:11, color:"#FF2D55" }}>{error}</div>}
            <button onClick={loginEmail} disabled={!!authLoading} style={{
              padding:"12px", borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#FF2D55,#FF6B35)",
              color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
              boxShadow:"0 4px 16px rgba(255,45,85,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              {authLoading === "email" ? <><Spinner/> Түр хүлээнэ үү...</> : mode === "login" ? "Нэвтрэх →" : "Бүртгүүлэх →"}
            </button>
          </div>

          <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:"rgba(255,255,255,0.3)" }}>
            {mode === "login" ? "Бүртгэл байхгүй юу? " : "Аль хэдийн бүртгэлтэй юу? "}
            <span onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}}
              style={{ color:"#FF2D55", cursor:"pointer", fontWeight:600 }}>
              {mode === "login" ? "Бүртгүүлэх" : "Нэвтрэх"}
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.2)} *{-webkit-font-smoothing:antialiased}`}</style>
    </div>
  );

  // Logged in
  return (
    <div style={{ minHeight:"100vh", background:"#08080f", color:"#fff", fontFamily:"Inter,-apple-system,sans-serif" }}>
      <nav style={{ height:56, borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", padding:"0 24px", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:800, fontSize:16, letterSpacing:"-0.03em" }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#FF2D55,#FF6B35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>▶</div>
          Shorts<span style={{color:"#FF2D55"}}>Studio</span>
        </div>
        {isAdmin && (
          <div style={{ padding:"3px 10px", borderRadius:20, background:"rgba(255,45,85,0.15)", border:"1px solid rgba(255,45,85,0.3)", fontSize:10, fontWeight:700, color:"#FF2D55" }}>ADMIN</div>
        )}
        <div style={{ flex:1 }}/>
        <img src={user.photoURL || ""} style={{ width:30, height:30, borderRadius:"50%", background:"#333" }} onError={e=>(e.currentTarget.style.display="none")}/>
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{user.displayName || user.email}</span>
        <button onClick={logout} style={{ padding:"5px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer" }}>Гарах</button>
      </nav>

      <div style={{ maxWidth:600, margin:"60px auto", padding:"0 20px", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎬</div>
        <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>
          {isAdmin ? "👑 Admin хэрэглэгч" : "Тавтай морил!"}
        </h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginBottom:32 }}>
          {user.email}
        </p>

        {isAdmin && (
          <div style={{ padding:20, borderRadius:16, background:"rgba(255,45,85,0.08)", border:"1px solid rgba(255,45,85,0.2)", marginBottom:24, textAlign:"left" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#FF2D55", marginBottom:8 }}>♾️ Хязгааргүй эрх</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
              Та admin хэрэглэгч тул бүх боломжийг хязгааргүй ашиглах эрхтэй.
            </div>
          </div>
        )}

        <div style={{ padding:24, borderRadius:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>
            ✅ Firebase Authentication холбогдлоо<br/>
            ✅ Google нэвтрэлт ажиллаж байна<br/>
            ✅ И-мэйл/нууц үг нэвтрэлт ажиллаж байна<br/>
            🔜 Shorts generator удахгүй нэмэгдэнэ
          </div>
        </div>
      </div>
      <style>{`*{-webkit-font-smoothing:antialiased}`}</style>
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return <span style={{ width:14, height:14, border:`2px solid ${dark?"rgba(0,0,0,0.2)":"rgba(255,255,255,0.3)"}`, borderTopColor:dark?"#333":"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>;
}
