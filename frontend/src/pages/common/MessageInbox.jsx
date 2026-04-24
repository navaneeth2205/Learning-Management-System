import { useState, useRef, useEffect } from 'react';
import {
    HiSearch, HiFilter, HiPlus, HiChat,
    HiDotsVertical, HiPaperClip, HiPaperAirplane,
    HiEmojiHappy, HiChevronLeft, HiCheckCircle, HiMicrophone,
    HiX, HiLockClosed, HiPhone, HiVideoCamera, HiBadgeCheck
} from 'react-icons/hi';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/* ─── Font settings ────────────────────────────────────────── */
const sora = { fontFamily: "'Sora', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

/* ─── Mock Data ────────────────────────────────────────────── */
const INITIAL_CHATS = [
    { id: 1, name: 'Dr. Michael Torres', role: 'Instructor', status: 'online', lastMsg: 'I reviewed your last assignment. The React logic is perfect!', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Sarah Miller', role: 'Student', status: 'offline', lastMsg: 'Hey! Want to join our design study group tomorrow at 2 PM?', time: '2:15 PM', unread: 0 },
    { id: 3, name: 'Alex Rodriguez', role: 'Career Coach', status: 'online', lastMsg: 'Your updated resume looks much stronger now. Great job!', time: 'Yesterday', unread: 0 },
    { id: 4, name: 'Skillery Support', role: 'Account Admin', status: 'online', lastMsg: 'Your certification for UI/UX Mastery has been verified.', time: 'Oct 20', unread: 0 },
];

const INITIAL_MESSAGES = {
    1: [
        { id: 1, text: 'Hi Alex, I saw your submission for the design system project.', type: 'received', time: '10:30 AM' },
        { id: 2, text: 'The way you handled the dark mode variant was really impressive.', type: 'received', time: '10:31 AM' },
        { id: 3, text: 'Thanks Dr. Torres! I spent a lot of time on the HSL color scaling.', type: 'sent', time: '10:45 AM' },
        { id: 4, text: 'It shows. One small tip: check the contrast for the success badge in high-brightness mode.', type: 'received', time: '11:00 AM' },
        { id: 5, text: 'I reviewed your last assignment. The React logic is perfect!', type: 'received', time: '11:05 AM' },
    ],
    2: [
        { id: 1, text: 'Hey! Want to join our design study group tomorrow at 2 PM?', type: 'received', time: '2:15 PM' },
    ],
    3: [
        { id: 1, text: 'Your updated resume looks much stronger now. Great job!', type: 'received', time: 'Yesterday' },
    ],
    4: [
        { id: 1, text: 'Your certification for UI/UX Mastery has been verified.', type: 'received', time: 'Oct 20' },
    ]
};

/* ══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function MessageInbox() {
    const [selectedId, setSelectedId] = useState(1);
    const [inputText, setInputText] = useState('');
    const [isStartingNew, setIsStartingNew] = useState(false);
    const [chats, setChats] = useState(INITIAL_CHATS);
    const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES);
    const [showOptions, setShowOptions] = useState(false);
    const scrollRef = useRef(null);
    const optionsRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeChat = chats.find(c => c.id === selectedId);
    const activeMessages = messagesMap[selectedId] || [];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }

        // Clear unread count for the selected chat
        setChats(prev => prev.map(c =>
            c.id === selectedId ? { ...c, unread: 0 } : c
        ));
    }, [activeMessages, selectedId]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: inputText,
            type: 'sent',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Update messages for current chat
        setMessagesMap(prev => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), newMsg]
        }));

        // Update last message in chat list
        setChats(prev => prev.map(c =>
            c.id === selectedId
                ? { ...c, lastMsg: inputText, time: 'Just now' }
                : c
        ));

        setInputText('');
    };

    const handleSelectContact = (contact) => {
        setSelectedId(contact.id);
        setIsStartingNew(false);
    };

    return (
        <div className="flex h-[calc(100vh-160px)] bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden" style={sora}>

            {/* ── Sidebar: Contact List ────────────────────────── */}
            <aside className="w-80 md:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">

                {/* Search & Actions */}
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Messages</h2>
                        {!isStartingNew ? (
                            <button
                                onClick={() => setIsStartingNew(true)}
                                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
                            >
                                <HiPlus className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={() => setIsStartingNew(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <HiX className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="relative group">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                        <input
                            placeholder="Find a contact..."
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder-slate-400"
                        />
                    </div>
                </div>

                {/* Feed / New Message Selection */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                    {isStartingNew ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                            <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Select Contact</p>
                            {chats.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => handleSelectContact(contact)}
                                    className="p-4 rounded-[24px] cursor-pointer flex items-center gap-4 bg-white border border-indigo-50 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                                >
                                    <Avatar name={contact.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black text-slate-900 truncate">{contact.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{contact.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedId(chat.id)}
                                className={clsx(
                                    "p-4 rounded-[24px] cursor-pointer flex items-center gap-4 transition-all duration-300 group focus:outline-none",
                                    selectedId === chat.id
                                        ? "bg-white shadow-xl shadow-indigo-100/20 ring-1 ring-slate-100"
                                        : "hover:bg-white hover:shadow-lg hover:shadow-slate-100"
                                )}
                            >
                                <div className="relative">
                                    <Avatar name={chat.name} size="md" className="ring-2 ring-slate-50 group-hover:ring-indigo-50 transition-all" />
                                    {chat.status === 'online' && !chat.isBlocked && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
                                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={clsx("text-sm font-black truncate", chat.unread > 0 ? "text-slate-900" : "text-slate-600")}>
                                            {chat.name}
                                        </h3>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest" style={mono}>{chat.time}</span>
                                    </div>
                                    <p className={clsx("text-xs truncate font-medium", chat.unread > 0 ? "text-indigo-600/80" : "text-slate-400")}>
                                        {chat.lastMsg}
                                    </p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-indigo-100">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* ── Main Chat Area ──────────────────────────────── */}
            <main className="flex-1 flex flex-col bg-white">
                {/* Header */}
                <header className="px-10 py-5 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Avatar name={activeChat?.name} size="md" className="ring-4 ring-white shadow-sm" />
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-1">
                                {activeChat?.name}
                                <HiBadgeCheck className="text-emerald-500 w-5 h-5 ml-0.5" />
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={clsx(
                                    "w-2 h-2 rounded-full",
                                    (activeChat?.status === 'online' && !activeChat?.isBlocked) ? "bg-emerald-500" : "bg-slate-300"
                                )} />
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{activeChat?.role}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative" ref={optionsRef}>
                        <button
                            onClick={() => toast.success(`Initiating voice call with ${activeChat?.name}...`)}
                            className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl hover:bg-indigo-50"
                        >
                            <HiPhone className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => toast.success(`Starting secure video call with ${activeChat?.name}...`)}
                            className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl hover:bg-indigo-50"
                        >
                            <HiVideoCamera className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl hover:bg-indigo-50"
                        >
                            <HiDotsVertical className="w-5 h-5" />
                        </button>

                        {/* Options Dropdown */}
                        {showOptions && (
                            <div className="absolute right-0 top-16 w-56 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-indigo-100/50 p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => {
                                        toast.success('Chat history cleared.');
                                        setMessagesMap(prev => ({ ...prev, [selectedId]: [] }));
                                        setShowOptions(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors uppercase tracking-widest"
                                >
                                    <HiX className="w-4 h-4 text-slate-400" /> Clear Chat
                                </button>
                                <button
                                    onClick={() => {
                                        setChats(prev => prev.map(c =>
                                            c.id === selectedId ? { ...c, isBlocked: !c.isBlocked } : c
                                        ));
                                        if (activeChat?.isBlocked) {
                                            toast.success(`${activeChat?.name} has been unblocked.`);
                                        } else {
                                            toast.error(`${activeChat?.name} has been blocked.`);
                                        }
                                        setShowOptions(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-2xl transition-colors uppercase tracking-widest",
                                        activeChat?.isBlocked ? "text-emerald-600 hover:bg-emerald-50" : "text-rose-500 hover:bg-rose-50"
                                    )}
                                >
                                    {activeChat?.isBlocked ? (
                                        <><HiCheckCircle className="w-4 h-4" /> Unblock User</>
                                    ) : (
                                        <><HiLockClosed className="w-4 h-4" /> Block User</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Messages Panel */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 custom-scrollbar scroll-smooth"
                >
                    {activeMessages.map((msg) => (
                        <div key={msg.id} className={clsx("flex flex-col group animate-in slide-in-from-bottom-2 duration-300", msg.type === 'sent' ? "items-end" : "items-start")}>
                            <div className={clsx(
                                "max-w-[75%] px-6 py-4 text-sm font-medium shadow-sm transition-all duration-300",
                                msg.type === 'sent'
                                    ? "bg-indigo-600 text-white rounded-[24px] rounded-tr-none shadow-indigo-100"
                                    : "bg-white border border-slate-100 text-slate-700 rounded-[24px] rounded-tl-none group-hover:shadow-md"
                            )}>
                                {msg.text}
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-1">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest" style={mono}>{msg.time}</span>
                                {msg.type === 'sent' && <HiCheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                            </div>
                        </div>
                    ))}
                    <div className="relative py-10">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100/50"></div></div>
                        <div className="relative flex justify-center">
                            <span className="bg-white/80 backdrop-blur-sm px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Secure end-to-end learning channel</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <footer className="p-8 border-t border-slate-50 bg-white">
                    {activeChat?.isBlocked ? (
                        <div className="max-w-4xl mx-auto p-6 bg-slate-50 border border-slate-100 rounded-[28px] text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-rose-500">
                                <HiLockClosed className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Chat Restricted</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">You have blocked this user. Unblock them to resume the conversation.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50/50 border border-slate-100 p-2 rounded-[28px] focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all">
                            <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><HiPaperClip className="w-6 h-6" /></button>
                            <input
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Share an insight or ask a question..."
                            />
                            <div className="flex items-center gap-1 pr-1">
                                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><HiMicrophone className="w-6 h-6" /></button>
                                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><HiEmojiHappy className="w-6 h-6" /></button>
                                <button
                                    onClick={handleSend}
                                    className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-orange-500 shadow-xl shadow-indigo-100 hover:shadow-orange-100 transition-all hover:scale-105 active:scale-95"
                                >
                                    <HiPaperAirplane className="w-6 h-6 rotate-90" />
                                </button>
                            </div>
                        </div>
                    )}
                </footer>
            </main>
        </div>
    );
}
