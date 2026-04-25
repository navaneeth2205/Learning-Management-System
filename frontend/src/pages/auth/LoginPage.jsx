import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiAcademicCap } from 'react-icons/hi';
import { loginFailure, loginStart, loginSuccess } from '../../features/auth/authSlice';
import { googleLoginApi, loginApi } from '../../features/auth/authApi';
import { setAuthToken } from '../../services/api';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const roleDashboards = {
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
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';

        return errs;
    };

    const navigateByRole = (role) => {
        const targetPath = roleDashboards[role] || ROUTES.LEARNER_DASHBOARD;
        navigate(targetPath, { replace: true });
    };

    const applyAuth = (data) => {
        setAuthToken(data.token);
        dispatch(loginSuccess(data));
        navigateByRole(data?.user?.role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();

        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        setErrors({});
        dispatch(loginStart());

        try {
            const data = await loginApi({
                email: form.email.trim(),
                password: form.password,
            });

            applyAuth(data);
            toast.success('Login successful');
        } catch (error) {
            dispatch(loginFailure(error.message || 'Login failed'));
            setErrors({ general: error.message || 'Login failed' });
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse?.credential;

        if (!idToken) {
            toast.error('Google sign-in did not return a token');
            return;
        }

        setLoading(true);
        dispatch(loginStart());

        try {
            const data = await googleLoginApi({
                idToken,
                role: ROLES.LEARNER,
            });

            applyAuth(data);
            toast.success('Signed in with Google successfully');
        } catch (error) {
            dispatch(loginFailure(error.message || 'Google sign-in failed'));
            setErrors({ general: error.message || 'Google sign-in failed' });
            toast.error(error.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-surface-bg overflow-hidden relative">
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-12 text-white relative overflow-hidden animate-gradient bg-gradient-to-tr from-primary-900 via-violet-900 to-primary-800">
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
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl lg:hidden" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl lg:hidden" />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-[2rem] shadow-primary-glow mb-4">
                            <HiAcademicCap className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-medium tracking-tight">Sign in with your credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className={`space-y-5 ${Object.keys(errors).length ? 'animate-shake' : ''}`}>
                        {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

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

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">or</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google sign-in failed')}
                                useOneTap={false}
                            />
                        </div>
                    </div>

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
