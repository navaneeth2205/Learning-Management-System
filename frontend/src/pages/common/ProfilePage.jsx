import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    HiUser, HiKey, HiBell, HiShieldCheck,
    HiGlobeAlt, HiCreditCard, HiPencilAlt,
    HiClock, HiCamera, HiCheckCircle, HiMail,
    HiDeviceMobile, HiSpeakerphone, HiSparkles,
    HiX, HiUpload, HiUserAdd, HiServer, HiWifi, HiDatabase
} from 'react-icons/hi';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import clsx from 'clsx';

/* ─── Font settings ────────────────────────────────────────── */
const sora = { fontFamily: "'Sora', sans-serif" };
const mono = { fontFamily: "'DM Mono', monospace" };

export default function ProfilePage() {
    const { user } = useSelector(s => s.auth);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [backupData, setBackupData] = useState(null);

    // Form State
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Alex Johnson',
        email: user?.email || 'learner@demo.com',
        focus: 'Fullstack Development',
        timezone: 'UTC+5:30 (India)',
        bio: "I'm a passionate learner focused on mastering modern web architectures and AI integration."
    });
    const [passwords, setPasswords] = useState({ current: '', new: '', verify: '' });

    const tabs = [
        { key: 'profile', label: 'Personal Info', icon: <HiUser /> },
        { key: 'security', label: 'Security', icon: <HiKey /> },
        { key: 'notifications', label: 'Notifications', icon: <HiBell /> },
    ];

    const roleSettings = {
        learner: [
            { id: '1', title: 'Assignment deadlines', desc: 'Upcoming due dates', icon: <HiClock className="w-5 h-5" />, initial: true },
            { id: '2', title: 'Grade released', desc: 'Alerts when graded', icon: <HiCheckCircle className="w-5 h-5" />, initial: true },
            { id: '3', title: 'Replies in discussion', desc: 'Forum threads', icon: <HiSpeakerphone className="w-5 h-5" />, initial: false },
            { id: '4', title: 'New messages', desc: 'Direct messages', icon: <HiMail className="w-5 h-5" />, initial: true },
            { id: '5', title: 'Mentions (@you)', desc: 'Tagged in comments', icon: <HiSparkles className="w-5 h-5" />, initial: true },
            { id: '6', title: 'Low performance warning', desc: 'Academic alerts', icon: <HiBell className="w-5 h-5" />, initial: true },
        ],
        instructor: [
            { id: '7', title: 'Student doubts/questions', desc: 'New Q&A', icon: <HiUser className="w-5 h-5" />, initial: true },
            { id: '8', title: 'New assignment submissions', desc: 'Ready to grade', icon: <HiUpload className="w-5 h-5" />, initial: true },
            { id: '9', title: 'Pending grading reminders', desc: 'Overdue grading', icon: <HiClock className="w-5 h-5" />, initial: true },
            { id: '10', title: 'Messages from students', desc: 'Direct messages', icon: <HiMail className="w-5 h-5" />, initial: true },
            { id: '11', title: 'Mentions', desc: 'Tagged in comments', icon: <HiSparkles className="w-5 h-5" />, initial: true },
        ],
        admin: [
            { id: '12', title: 'New user registration', desc: 'Signups', icon: <HiUserAdd className="w-5 h-5" />, initial: true },
            { id: '13', title: 'Server status / downtime', desc: 'Infrastructure', icon: <HiServer className="w-5 h-5" />, initial: true },
            { id: '14', title: 'API issues', desc: 'Service health', icon: <HiWifi className="w-5 h-5" />, initial: true },
            { id: '15', title: 'Storage usage alerts', desc: 'Capacity warnings', icon: <HiDatabase className="w-5 h-5" />, initial: true },
            { id: '16', title: 'Data breach warnings', desc: 'Security critical', icon: <HiShieldCheck className="w-5 h-5" />, initial: true },
        ]
    };

    const activeRole = (user?.role || 'learner').toLowerCase();
    const notificationsToRender = roleSettings[activeRole] || roleSettings.learner;

    const handleEdit = () => {
        setBackupData({ ...profileData });
        setIsEditing(true);
    };

    const handleDiscard = () => {
        if (backupData) {
            setProfileData(backupData);
        }
        setIsEditing(false);
        toast('Changes discarded', { icon: '↩️' });
    };

    const handleSave = () => {
        setIsSaving(true);
        toast.promise(
            new Promise(res => setTimeout(res, 1200)),
            {
                loading: 'Applying updates...',
                success: () => {
                    setIsSaving(false);
                    setIsEditing(false);
                    return 'Profile updated successfully!';
                },
                error: 'Failed to update profile.'
            }
        );
    };

    const handleUpdatePassword = () => {
        const { current, new: newP, verify } = passwords;
        if (!current || !newP || !verify) {
            toast.error('All password fields are required');
            return;
        }
        if (newP !== verify) {
            toast.error('New passwords do not match');
            return;
        }
        if (newP.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsUpdatingPassword(true);
        toast.promise(
            new Promise((res, rej) => {
                setTimeout(() => {
                    if (current === 'error') rej();
                    else res();
                }, 1500);
            }),
            {
                loading: 'Securing account...',
                success: () => {
                    setIsUpdatingPassword(false);
                    setPasswords({ current: '', new: '', verify: '' });
                    return 'Password updated successfully!';
                },
                error: 'Incorrect current password.'
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8" style={sora}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Header ───────────────────────────────────── */}
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Account Settings</h1>
                    <p className="text-sm text-slate-400 font-medium">Manage your profile, security, and learning preferences.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* ── Sidebar Nav ────────────────────────────── */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 text-center space-y-4">
                                <div className="relative inline-block">
                                    <Avatar name={profileData.name} size="xl" className="ring-4 ring-slate-50 shadow-sm" />
                                    <button
                                        onClick={() => toast.success('Image selector opened (simulated)')}
                                        className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-lg border-2 border-white hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <HiCamera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight transition-all">{profileData.name}</h3>
                                    <Badge color="blue" variant="soft" className="mt-1 font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                                        {user?.role || 'LEARNER'} ACCESS
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-2 space-y-1">
                                {tabs.map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => { setActiveTab(t.key); setIsEditing(false); }}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                            activeTab === t.key
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                        )}
                                    >
                                        <span className="w-5 h-5">{t.icon}</span>
                                        <span className="tracking-tight">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ── Content Area ───────────────────────────── */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-indigo-100/20 p-6 md:p-8">

                            {/* TAB: PERSONAL INFO */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Public Profile</h2>
                                        {!isEditing ? (
                                            <Button
                                                onClick={handleEdit}
                                                variant="outline" size="sm" className="rounded-lg" icon={<HiPencilAlt />}
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <button
                                                onClick={handleDiscard}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <HiX className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <EditableGroup
                                                label="Full Name"
                                                value={profileData.name}
                                                isEditing={isEditing}
                                                onChange={(val) => setProfileData({ ...profileData, name: val })}
                                            />
                                            <EditableGroup
                                                label="Email Address"
                                                value={profileData.email}
                                                isEditing={isEditing}
                                                onChange={(val) => setProfileData({ ...profileData, email: val })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <EditableGroup
                                                label="Learning Focus"
                                                value={profileData.focus}
                                                isEditing={isEditing}
                                                onChange={(val) => setProfileData({ ...profileData, focus: val })}
                                            />
                                            <EditableGroup
                                                label="Timezone"
                                                value={profileData.timezone}
                                                isEditing={isEditing}
                                                onChange={(val) => setProfileData({ ...profileData, timezone: val })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Learning Bio</label>
                                        {isEditing ? (
                                            <textarea
                                                className="w-full bg-indigo-50/10 border border-indigo-100 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:outline-none transition-all min-h-[100px]"
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            />
                                        ) : (
                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-500">
                                                {profileData.bio}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <button
                                                onClick={handleDiscard}
                                                disabled={isSaving}
                                                className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                            >
                                                Discard
                                            </button>
                                            <Button
                                                onClick={handleSave}
                                                loading={isSaving}
                                                size="sm" className="rounded-xl px-6 py-3 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100"
                                            >
                                                Save Settings
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-50 pb-4">Security</h2>
                                    <div className="space-y-3">
                                        <SecurityAction
                                            icon={<HiKey />}
                                            title="2FA"
                                            desc="Secure your account with extra verification."
                                            active={true}
                                        />
                                        <SecurityAction
                                            icon={<HiShieldCheck />}
                                            title="Devices"
                                            desc="2 active sessions in Mumbai, IN."
                                            btnText="Sign out others"
                                        />
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Password</h3>
                                        <div className="space-y-4">
                                            <Input
                                                label="Current Password" type="password" className="rounded-xl"
                                                value={passwords.current}
                                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="New Password" type="password" className="rounded-xl"
                                                    value={passwords.new}
                                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                />
                                                <Input
                                                    label="Verify Password" type="password" className="rounded-xl"
                                                    value={passwords.verify}
                                                    onChange={e => setPasswords({ ...passwords, verify: e.target.value })}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleUpdatePassword}
                                                loading={isUpdatingPassword}
                                                size="sm" className="rounded-xl w-full py-3 font-black uppercase tracking-widest text-[10px]"
                                            >
                                                Update Password
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: NOTIFICATIONS */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-8">
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-50 pb-4">Notifications</h2>
                                    <div className="space-y-4 divide-y divide-slate-50">
                                        {notificationsToRender.map(n => (
                                            <NotificationRow
                                                key={n.id}
                                                icon={n.icon}
                                                title={n.title}
                                                desc={n.desc}
                                                initial={n.initial}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

/* ─── Shared Components ───────────────────────────────────── */

function EditableGroup({ label, value, isEditing, onChange }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            {isEditing ? (
                <input
                    className="w-full bg-indigo-50/10 border border-indigo-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:outline-none transition-all"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                    {value}
                </div>
            )}
        </div>
    );
}

function SecurityAction({ icon, title, desc, active, btnText }) {
    const handleClick = () => {
        if (btnText) toast.success(`${btnText} triggered successfully.`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-sm transition-all"
        >
            <div className="flex gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{desc}</p>
                </div>
            </div>
            {active ? <Badge color="green" variant="glass" className="font-black text-[7px] uppercase tracking-widest">ACTIVE</Badge> :
                btnText && <div className="text-[9px] font-black text-indigo-600 uppercase transition-all">{btnText}</div>}
        </div>
    );
}

function NotificationRow({ icon, title, desc, initial }) {
    const [enabled, setEnabled] = useState(initial);
    return (
        <div className="flex items-center justify-between py-4 group first:pt-0">
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-indigo-500 shadow-sm transition-all">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{desc}</p>
                </div>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={clsx(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center shadow-inner ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                    enabled ? "bg-indigo-600" : "bg-slate-200"
                )}
            >
                <div className={clsx(
                    "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm shadow-slate-900/10",
                    enabled ? "translate-x-6" : "translate-x-0"
                )} />
            </button>
        </div>
    );
}
