import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import {
  Mail, MailOpen, Inbox, CheckCircle, LogOut,
  Search, Trash2, Reply, MessageSquare, Menu, X,
  ChevronLeft, RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB441kQiyA0gQqn0SYzTyZRFGdV9yApr3w",
  authDomain: "adminportal-aa5be.firebaseapp.com",
  projectId: "adminportal-aa5be",
  storageBucket: "adminportal-aa5be.firebasestorage.app",
  messagingSenderId: "305884449303",
  appId: "1:305884449303:web:ab736564654f733bda2a52",
  measurementId: "G-DWRC9ND9NP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Avatar gradient generator ───────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'from-violet-600 to-indigo-400',
  'from-blue-600 to-cyan-400',
  'from-emerald-600 to-teal-400',
  'from-rose-600 to-pink-400',
  'from-amber-600 to-yellow-400',
  'from-fuchsia-600 to-purple-400',
];

const getGradient = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] || AVATAR_GRADIENTS[0];
};

// ─── Helper: format date safely ───────────────────────────────────────────────
const fmtShort = (ts) => {
  try { return ts ? format(ts.toDate(), 'dd MMM, HH:mm') : '—'; } catch { return '—'; }
};
const fmtLong = (ts) => {
  try { return ts ? format(ts.toDate(), 'PPP p') : '—'; } catch { return '—'; }
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const FilterBtn = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium
      ${active
        ? 'bg-emerald-400/10 text-emerald-400'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
  >
    <span className="opacity-70 flex-shrink-0">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge > 0 && (
      <span className="bg-emerald-400 text-[#021] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-[#0f2040] rounded-xl p-3 text-center border border-white/5">
    <div className={`text-2xl font-bold ${color} tabular-nums`}>{value}</div>
    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
  </div>
);

// ─── Login Screen ─────────────────────────────────────────────────────────────

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060d18] px-4"
      style={{ fontFamily: 'var(--font-display)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(52,211,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      {/* Glow orb */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#0d1b2e]/90 backdrop-blur-sm border border-emerald-500/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-[#021] font-bold text-2xl shadow-lg shadow-emerald-500/20 mb-4">
              O
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to manage your messages</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-emerald-400/60 focus:bg-white/[0.06] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-emerald-400/60 focus:bg-white/[0.06] transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shimmer-btn w-full text-white font-semibold py-3 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Secured by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

// ─── Message List Item ────────────────────────────────────────────────────────

const MessageItem = ({ msg, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3.5 rounded-xl cursor-pointer transition-all mb-1 border group
      ${!msg.read ? 'bg-emerald-400/[0.06]' : 'bg-transparent'}
      ${selected
        ? 'bg-emerald-400/10 border-emerald-400/25 shadow-sm'
        : 'border-transparent hover:bg-white/[0.04] hover:border-white/5'
      }`}
  >
    <div className="flex items-start gap-2.5">
      {/* Mini avatar */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradient(msg.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase`}>
        {msg.name?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm font-semibold truncate text-slate-200">{msg.name || 'Unknown'}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!msg.read && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full unread-dot" />}
            <span className="text-[10px] text-slate-600">{fmtShort(msg.createdAt)}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 mb-1 truncate">{msg.email}</div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{msg.message}</p>
      </div>
    </div>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ messages, filter, setFilter, searchTerm, setSearchTerm, selectedId, onSelect, stats, onClose, isMobile }) => {
  const filtered = messages.filter((m) => {
    const matchFilter = filter === 'all' ? true : filter === 'unread' ? !m.read : m.read;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <aside className="flex flex-col h-full bg-[#0d1b2e] overflow-hidden"
      style={{ fontFamily: 'var(--font-display)' }}>

      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/10">
          <span className="font-semibold text-sm text-slate-200">Inbox</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 border-b border-emerald-500/10">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Overview</p>
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total" value={stats.total} color="text-emerald-400" />
          <StatCard label="Unread" value={stats.unread} color="text-amber-400" />
          <StatCard label="Read" value={stats.read} color="text-slate-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-emerald-500/10 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Filter</p>
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} icon={<Inbox size={15} />} label="All Messages" />
        <FilterBtn active={filter === 'unread'} onClick={() => setFilter('unread')} icon={<Mail size={15} />} label="Unread" badge={stats.unread} />
        <FilterBtn active={filter === 'read'} onClick={() => setFilter('read')} icon={<CheckCircle size={15} />} label="Read" />
      </div>

      {/* Search */}
      <div className="p-4 border-b border-emerald-500/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={13} />
          <input
            type="text"
            placeholder="Search messages…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f2040] border border-white/5 rounded-lg py-2 pl-8 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-400/50 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600 gap-3">
            <MessageSquare size={28} className="opacity-30" />
            <span className="text-xs">{searchTerm ? 'No results found' : 'No messages yet'}</span>
          </div>
        ) : (
          filtered.map((m) => (
            <MessageItem
              key={m.id}
              msg={m}
              selected={selectedId === m.id}
              onClick={() => { onSelect(m); if (isMobile) onClose(); }}
            />
          ))
        )}
      </div>
    </aside>
  );
};

// ─── Message Detail ───────────────────────────────────────────────────────────

const MessageDetail = ({ msg, onDelete, onBack }) => {
  if (!msg) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 p-8">
        <MailOpen size={52} className="opacity-20" />
        <p className="text-sm text-slate-500">Select a message to read it</p>
      </div>
    );
  }

  return (
    <div className="slide-in max-w-3xl mx-auto p-6 md:p-10"
      style={{ fontFamily: 'var(--font-display)' }}>
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back to inbox
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-emerald-500/10 mb-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(msg.name)} flex items-center justify-center text-white font-bold text-2xl uppercase flex-shrink-0 shadow-lg`}>
          {msg.name?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-white">{msg.name || 'Unknown Sender'}</h1>
          <a href={`mailto:${msg.email}`} className="text-sm text-emerald-400 hover:underline break-all">
            {msg.email}
          </a>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={`mailto:${msg.email}?subject=Re: Your message`}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
          >
            <Reply size={14} /> Reply
          </a>
          <button
            onClick={() => onDelete(msg.id)}
            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[11px] text-slate-600 uppercase tracking-wider">Received</span>
        <span className="text-[11px] text-slate-400">{fmtLong(msg.createdAt)}</span>
        {!msg.read && (
          <span className="ml-2 text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            New
          </span>
        )}
      </div>

      {/* Message body */}
      <div className="bg-[#0d1b2e] border border-emerald-500/10 rounded-2xl p-6 md:p-8 text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
        {msg.message}
      </div>
    </div>
  );
};

// ─── Main AdminPortal ─────────────────────────────────────────────────────────

const AdminPortal = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // Firestore listener (only when logged in)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const openMessage = useCallback(async (msg) => {
    setSelectedId(msg.id);
    setMobileView('detail');
    if (!msg.read) {
      await updateDoc(doc(db, 'messages', msg.id), { read: true });
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    await deleteDoc(doc(db, 'messages', id));
    if (selectedId === id) {
      setSelectedId(null);
      setMobileView('list');
    }
  }, [selectedId]);

  const handleBack = () => {
    setMobileView('list');
    setSelectedId(null);
  };

  const stats = {
    total: messages.length,
    unread: messages.filter((m) => !m.read).length,
    read: messages.filter((m) => m.read).length,
  };

  const selectedMsg = messages.find((m) => m.id === selectedId);

  // Auth loading state
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#060d18] flex items-center justify-center">
        <RefreshCw size={20} className="text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#060d18] text-slate-200 overflow-hidden"
      style={{ fontFamily: 'var(--font-display)' }}>

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-[#0d1b2e] border-b border-emerald-500/10 flex items-center px-4 md:px-6 justify-between z-20">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-200 transition-colors mr-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-[#021] font-bold text-sm shadow-md shadow-emerald-900/40">
            O
          </div>
          <span className="font-semibold text-sm text-slate-200 hidden sm:block">Message Inbox</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[200px]">{user.email}</span>
          <button
            onClick={() => signOut(auth)}
            className="text-xs font-semibold border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-400/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── Mobile Sidebar Overlay ─────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar (desktop: always visible, mobile: slide-in drawer) ── */}
        <div className={`
          absolute md:relative inset-y-0 left-0 z-40 md:z-auto
          w-[300px] md:w-[280px] flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:border-r md:border-emerald-500/10
        `}>
          <Sidebar
            messages={messages}
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedId={selectedId}
            onSelect={openMessage}
            stats={stats}
            onClose={() => setSidebarOpen(false)}
            isMobile={sidebarOpen}
          />
        </div>

        {/* ── Main Panel ─────────────────────────────────────────────────── */}
        {/* Desktop: always show detail panel beside sidebar */}
        <main className="hidden md:block flex-1 overflow-y-auto custom-scrollbar">
          <MessageDetail
            msg={selectedMsg}
            onDelete={handleDelete}
            onBack={handleBack}
          />
        </main>

        {/* Mobile: toggle between list and detail */}
        <main className="md:hidden flex-1 overflow-y-auto custom-scrollbar">
          {mobileView === 'list' ? (
            <div className="h-full">
              <Sidebar
                messages={messages}
                filter={filter}
                setFilter={setFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedId={selectedId}
                onSelect={openMessage}
                stats={stats}
                onClose={() => {}}
                isMobile={false}
              />
            </div>
          ) : (
            <MessageDetail
              msg={selectedMsg}
              onDelete={handleDelete}
              onBack={handleBack}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
