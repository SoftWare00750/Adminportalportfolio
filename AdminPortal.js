import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, collection, query, orderBy, onSnapshot, 
  doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { 
  Mail, MailOpen, Inbox, CheckCircle, LogOut, 
  Search, Trash2, Reply, MessageSquare 
} from 'lucide-react';
import { format } from 'date-fns';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AdminPortal = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) startListening();
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener
  const startListening = () => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => signOut(auth);

  const openMessage = async (msg) => {
    setSelectedId(msg.id);
    if (!msg.read) {
      await updateDoc(doc(db, "messages", msg.id), { read: true });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    await deleteDoc(doc(db, "messages", id));
    if (selectedId === id) setSelectedId(null);
  };

  // Logic: Filtering & Searching
  const filteredMessages = messages.filter(m => {
    const matchesFilter = 
      filter === 'all' ? true : 
      filter === 'unread' ? !m.read : m.read;
    
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.read).length,
    read: messages.filter(m => m.read).length
  };

  const selectedMsg = messages.find(m => m.id === selectedId);

  // --- LOGIN UI ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060d18] font-sans">
        <div className="bg-[#0d1b2e] border border-emerald-500/10 p-10 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center text-[#021] font-bold text-xl mx-auto mb-4">O</div>
          <h1 className="text-2xl font-bold text-white text-center">Admin Portal</h1>
          <p className="text-slate-400 text-center text-sm mb-8">Sign in to view your messages</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-emerald-500/10 rounded-lg p-3 text-white outline-none focus:border-emerald-400 transition-colors" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-emerald-500/10 rounded-lg p-3 text-white outline-none focus:border-emerald-400 transition-colors" required />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-transform active:scale-95">Sign In</button>
            {loginError && <p className="text-red-400 text-xs text-center mt-2">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <div className="h-screen grid grid-cols-[280px_1fr] grid-rows-[56px_1fr] bg-[#060d18] text-slate-200 overflow-hidden">
      {/* Topbar */}
      <header className="col-span-2 bg-[#0d1b2e] border-b border-emerald-500/10 flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-[#021] font-bold text-sm">O</div>
          <span className="font-bold">Message Inbox</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">{user.email}</span>
          <button onClick={handleLogout} className="text-xs font-bold border border-emerald-500/10 px-4 py-1.5 rounded-md hover:text-emerald-400 hover:border-emerald-400 transition-all flex items-center gap-2">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="bg-[#0d1b2e] border-r border-emerald-500/10 flex flex-col overflow-hidden">
        {/* Stats */}
        <div className="p-4 border-b border-emerald-500/10">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Overview</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', val: stats.total, color: 'text-emerald-400' },
              { label: 'Unread', val: stats.unread, color: 'text-amber-400' },
              { label: 'Read', val: stats.read, color: 'text-slate-400' }
            ].map(s => (
              <div key={s.label} className="bg-[#0f2040] rounded-lg p-2 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-slate-500 uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-emerald-500/10 space-y-1">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Filter</h2>
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} icon={<Inbox size={16}/>} label="All Messages" />
          <FilterBtn active={filter === 'unread'} onClick={() => setFilter('unread')} icon={<Mail size={16}/>} label="Unread" badge={stats.unread} />
          <FilterBtn active={filter === 'read'} onClick={() => setFilter('read')} icon={<CheckCircle size={16}/>} label="Read" />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-emerald-500/10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input 
              type="text" placeholder="Search messages..." 
              className="w-full bg-[#0f2040] border border-emerald-500/10 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-emerald-400 transition-colors"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
              <MessageSquare size={32} className="mb-2 opacity-20" />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map(m => (
              <div 
                key={m.id} 
                onClick={() => openMessage(m)}
                className={`p-4 rounded-xl cursor-pointer transition-all mb-1 border border-transparent 
                  ${!m.read ? 'bg-emerald-400/5' : ''} 
                  ${selectedId === m.id ? 'bg-emerald-400/10 border-emerald-400/30' : 'hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold truncate pr-2">{m.name || 'Unknown'}</span>
                  {!m.read && <div className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5" />}
                </div>
                <div className="text-[11px] text-slate-500 mb-1">{m.email}</div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{m.message}</p>
                <div className="text-[10px] text-slate-500 mt-2">
                  {m.createdAt ? format(m.createdAt.toDate(), 'dd MMM, HH:mm') : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Detail Panel */}
      <main className="bg-[#060d18] overflow-y-auto p-10 custom-scrollbar">
        {!selectedMsg ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
            <MailOpen size={48} className="opacity-10" />
            <p>Select a message to read it</p>
          </div>
        ) : (
          <div className="max-w-3xl">
            <div className="flex items-start gap-4 pb-6 border-b border-emerald-500/10 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-bold text-xl uppercase">
                {selectedMsg.name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{selectedMsg.name}</h1>
                <a href={`mailto:${selectedMsg.email}`} className="text-sm text-emerald-400 hover:underline">{selectedMsg.email}</a>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selectedMsg.email}?subject=Re: Your message`} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Reply size={16} /> Reply
                </a>
                <button onClick={() => handleDelete(selectedMsg.id)} className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-8">
              Received: {selectedMsg.createdAt ? format(selectedMsg.createdAt.toDate(), 'PPP p') : '—'}
            </div>
            <div className="bg-[#0d1b2e] border border-emerald-500/10 rounded-xl p-8 text-slate-200 leading-loose whitespace-pre-wrap">
              {selectedMsg.message}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const FilterBtn = ({ active, onClick, icon, label, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
      ${active ? 'bg-emerald-400/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
  >
    <span className="opacity-70">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge > 0 && (
      <span className="bg-emerald-400 text-[#021] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]">
        {badge}
      </span>
    )}
  </button>
);

export default AdminPortal;