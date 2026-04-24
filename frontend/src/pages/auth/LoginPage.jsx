import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiAcademicCap } from 'react-icons/hi';
import { loginStart, loginSuccess, loginFailure } from '../../features/auth/authSlice';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DEMO_USERS = {
    learner: { id: 1, name: 'Alex Johnson', email: 'learner@demo.com', role: ROLES.LEARNER, avatar: null },
    instructor: { id: 3, name: 'Dr. Michael Torres', email: 'instructor@demo.com', role: ROLES.INSTRUCTOR, avatar: null },
    admin: { id: 5, name: 'Admin User', email: 'admin@demo.com', role: ROLES.ADMIN, avatar: null },
};

const ROLE_DASHBOARDS = {
    [ROLES.LEARNER]: ROUTES.LEARNER_DASHBOARD,
    [ROLES.INSTRUCTOR]: ROUTES.INSTRUCTOR_DASHBOARD,
    [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
};

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
        return errs;
    };

    const handleDemoLogin = (role) => {
        dispatch(loginStart());
        setTimeout(() => {
            dispatch(loginSuccess({ user: DEMO_USERS[role], token: `mock-token-${role}` }));
            navigate(ROLE_DASHBOARDS[role]);
        }, 600);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setErrors({});
        // Determine role from email for demo
        let role = ROLES.LEARNER;
        if (form.email.includes('instructor')) role = ROLES.INSTRUCTOR;
        if (form.email.includes('admin')) role = ROLES.ADMIN;
        setTimeout(() => {
            dispatch(loginSuccess({ user: { ...DEMO_USERS[role], email: form.email }, token: 'mock-token' }));
            navigate(ROLE_DASHBOARDS[role]);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen flex bg-surface-bg overflow-hidden relative">
            {/* Left Branding Panel: Animated Gradient Mesh */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-12 text-white relative overflow-hidden animate-gradient bg-gradient-to-tr from-primary-900 via-violet-900 to-primary-800">
                {/* Floating SVG Orbs */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-float" />
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary-400/10 rounded-full blur-[80px]" />

                <div className="relative z-10 max-w-md text-center lg:text-left">
                    <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-xl group">
                            <HiAcademicCap className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter">EduVerse</span>
                    </div>

                    <h1 className="text-5xl font-black leading-[1.1] mb-6 tracking-tight">
                        Experience the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-300">Future of Learning.</span>
                    </h1>
                    <p className="text-primary-100/70 text-lg mb-10 leading-relaxed font-medium">
                        Enterprise-grade platform built for scale, performance, and extraordinary learning experiences.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Courses', value: '12k+' },
                            { label: 'Learners', value: '485k+' },
                            { label: 'Instructors', value: '1.2k+' },
                            { label: 'Certificates', value: '98k+' },
                        ].map((s, i) => (
                            <div key={s.label} className={`bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors cursor-default group`}>
                                <div className="text-2xl font-black group-hover:scale-110 transition-transform origin-left">{s.value}</div>
                                <div className="text-primary-200/60 text-[10px] uppercase font-black tracking-widest">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Auth Panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Decorative background element for mobile */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl lg:hidden" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl lg:hidden" />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Brand header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[2rem] shadow-primary-glow mb-4">
                            <HiAcademicCap className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium tracking-tight">Sign in with your credentials to continue</p>
                    </div>

                    {/* Role Quick Selector: Animated Toggle */}
                    <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-200 flex relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        {['learner', 'instructor', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleDemoLogin(role)}
                                className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all relative z-10 text-slate-400 hover:text-slate-600"
                            >
                                {role}
                            </button>
                        ))}
                        {/* Note: In a real app, I'd add a sliding background div fixed to the active role */}
                    </div>

                    <form onSubmit={handleSubmit} className={`space-y-5 ${Object.keys(errors).length ? 'animate-shake' : ''}`}>
                        <div className="space-y-4">
                            <Input
                                label="Work Email"
                                type="email"
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                icon={<HiMail className="w-5 h-5" />}
                                error={errors.email}
                                className="hover:border-primary-400 focus-within:shadow-primary-glow"
                            />
                            <Input
                                label="Secure Password"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                icon={<HiLockClosed className="w-5 h-5" />}
                                iconRight={
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-300 hover:text-primary-600 transition-colors">
                                        {showPass ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                    </button>
                                }
                                error={errors.password}
                                className="hover:border-primary-400 focus-within:shadow-primary-glow"
                            />
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-500 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/20 transition-all cursor-pointer" />
                                <span className="group-hover:text-slate-700">Remember session</span>
                            </label>
                            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-black text-primary-600 hover:text-primary-700 tracking-tight uppercase">
                                Recover Access
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            size="lg"
                            className="bg-slate-900 border-none hover:bg-slate-800 text-white shadow-xl py-4 h-auto text-sm uppercase font-black tracking-widest active:scale-[0.98] transition-all"
                        >
                            Authorize & Enter
                        </Button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            New to the platform?{' '}
                            <Link to={ROUTES.SIGNUP} className="text-primary-600 hover:text-primary-700 transition-colors">Request Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

