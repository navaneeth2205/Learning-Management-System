import { useState } from 'react';
import {
    HiAcademicCap, HiDownload, HiShare, HiExternalLink,
    HiCheckCircle, HiChevronRight, HiStar, HiLink,
    HiX, HiClipboardCheck
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Button from '../../components/ui/Button';

/* ─── Font helpers ─────────────────────────────────────────── */
const sora = { fontFamily: "'Sora', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

/* ─── Status config ────────────────────────────────────────── */
const CERT_GRADIENTS = [
    'from-indigo-600 to-violet-800',
    'from-fuchsia-600 to-purple-800',
    'from-blue-600 to-indigo-800',
];

const certificates = [
    {
        id: 1,
        title: 'Advanced React Architecture',
        issuedBy: 'EduVerse Academy',
        date: 'Oct 15, 2026',
        score: '96%',
        idCode: 'EV-2023-8842',
        gradient: CERT_GRADIENTS[0]
    },
    {
        id: 2,
        title: 'UI/UX Design Mastery',
        issuedBy: 'Design Institute',
        date: 'Sep 28, 2026',
        score: '92%',
        idCode: 'DI-9921-XCA',
        gradient: CERT_GRADIENTS[1]
    }
];

export default function CertificatesPage() {
    const navigate = useNavigate();
    const [shareSuccess, setShareSuccess] = useState(false);

    const handleShare = () => {
        const profileUrl = window.location.origin + "/learner/profile/public";
        navigator.clipboard.writeText(profileUrl).then(() => {
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 3000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers or non-HTTPS
            const textArea = document.createElement("textarea");
            textArea.value = profileUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 3000);
        });
    };

    return (
        <div className="p-6 md:p-8 space-y-10 max-w-6xl mx-auto" style={sora}>

            {/* ── Header ───────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Your Achievements</h1>
                    <p className="text-sm text-indigo-600 font-bold">
                        Official proof of your skills and knowledge across the platform.
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={handleShare}
                        className={clsx(
                            "flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100",
                            shareSuccess ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                    >
                        {shareSuccess ? (
                            <><HiClipboardCheck className="w-4 h-4" /> Profile Link Copied</>
                        ) : (
                            <><HiShare className="w-4 h-4" /> Share Profile</>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map(cert => (
                    <CertificateCard key={cert.id} cert={cert} />
                ))}

                {/* Coming Soon Card */}
                <div className="bg-white border-2 border-dashed border-slate-100 rounded-[40px] p-10 flex flex-col items-center justify-center text-center space-y-6 group hover:border-indigo-200 transition-all duration-500">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-indigo-50 transition-all">
                        <HiStar className="w-10 h-10 text-slate-200 group-hover:text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Next Milestone</h3>
                        <p className="text-[11px] text-slate-400 font-bold max-w-[180px] mx-auto uppercase tracking-widest leading-relaxed">
                            Complete "Cloud Architecture" to earn your next badge.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/learner/courses')}
                        className="bg-slate-50 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                        Browse Catalog
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Card Component ────────────────────────────────────────── */
function CertificateCard({ cert }) {
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleDownload = () => {
        setDownloading(true);

        // Simulate real file download trigger
        setTimeout(() => {
            const fileName = `${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`;
            const dummyContent = `Certificate of Completion\n\nTitle: ${cert.title}\nIssued By: ${cert.issuedBy}\nID: ${cert.idCode}\nDate: ${cert.date}\nScore: ${cert.score}`;
            const blob = new Blob([dummyContent], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setDownloading(false);
        }, 1500);
    };

    const handleCopyCode = () => {
        const credentialUrl = `https://eduverse.verify/${cert.idCode}`;
        navigator.clipboard.writeText(credentialUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = credentialUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col group">

            {/* Top Half: Premium Header */}
            <div className={`h-48 bg-gradient-to-br ${cert.gradient} relative p-8 flex flex-col justify-between overflow-hidden`}>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute -left-6 bottom-6 w-28 h-28 bg-black/5 rounded-full blur-2xl" />

                <div className="flex justify-between items-start relative z-10">
                    <div className="bg-amber-400 text-[9px] font-black text-slate-900 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" />
                        CERTIFIED
                    </div>
                    <HiAcademicCap className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>

                <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-black text-white leading-tight tracking-tight">
                        {cert.title}
                    </h3>
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]" style={mono}>
                        Issued on {cert.date}
                    </p>
                </div>
            </div>

            {/* Bottom Half: Info Grid */}
            <div className="p-8 space-y-8 flex-1 bg-white">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Issuer</p>
                        <p className="text-[11px] font-black text-slate-800">{cert.issuedBy}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Mastery</p>
                        <p className="text-[11px] font-black text-emerald-600" style={mono}>{cert.score}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Credential ID</p>
                        <p className="text-[10px] font-black text-slate-500" style={mono}>{cert.idCode}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Validation</p>
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <HiCheckCircle className="w-4 h-4" /> VERIFIED
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-50 w-full" />

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className={clsx(
                            "flex-1 text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.95] shadow-sm",
                            downloading
                                ? "bg-indigo-50 text-indigo-500 border border-indigo-100"
                                : "bg-slate-50 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100 text-slate-600 border border-slate-100"
                        )}
                    >
                        {downloading ? (
                            <><div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> Preparing...</>
                        ) : (
                            <><HiDownload className="w-4 h-4" /> Download PDF</>
                        )}
                    </button>
                    <button
                        onClick={handleCopyCode}
                        className={clsx(
                            "p-3 rounded-2xl border transition-all active:scale-[0.95] flex items-center justify-center",
                            copied
                                ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                                : "bg-slate-50 border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100"
                        )}
                    >
                        {copied ? <HiClipboardCheck className="w-5 h-5" /> : <HiLink className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
