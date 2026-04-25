import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { googleLoginApi, registerApi } from '../../features/auth/authApi';
import { loginSuccess, setPendingVerificationEmail } from '../../features/auth/authSlice';
import { setAuthToken } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import clsx from 'clsx';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: ROLES.LEARNER });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const roles = [
        { value: ROLES.LEARNER, label: 'Learner', desc: 'Access courses and track your progress' },
        { value: ROLES.INSTRUCTOR, label: 'Instructor', desc: 'Create and manage courses' },
    ];

    const roleDashboards = {
        [ROLES.LEARNER]: ROUTES.LEARNER_DASHBOARD,
        [ROLES.INSTRUCTOR]: ROUTES.INSTRUCTOR_DASHBOARD,
        [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Full name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setErrors({});
        setLoading(true);

        try {
            const data = await registerApi({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });

            dispatch(setPendingVerificationEmail(data?.email || form.email.trim()));
            toast.success('OTP sent to your email. Please verify your account.');
            navigate(ROUTES.OTP_VERIFY, {
                state: {
                    email: data?.email || form.email.trim(),
                },
            });
        } catch (error) {
            setErrors({ general: error.message || 'Registration failed' });
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse?.credential;

        if (!idToken) {
            toast.error('Google sign-up did not return a token');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const data = await googleLoginApi({
                idToken,
                role: form.role,
            });

            setAuthToken(data.token);
            dispatch(loginSuccess(data));
            const targetPath = roleDashboards[data?.user?.role] || ROUTES.LEARNER_DASHBOARD;
            toast.success('Signed up with Google successfully');
            navigate(targetPath, { replace: true });
        } catch (error) {
            setErrors({ general: error.message || 'Google sign-up failed' });
            toast.error(error.message || 'Google sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-bg p-6">
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                        <HiAcademicCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-text-primary">EduVerse LMS</span>
                </div>

                <div className="bg-white rounded-2xl border border-surface-border shadow-card-lg p-8">
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Create your account</h2>
                    <p className="text-text-secondary text-sm mb-6">Join thousands of learners and instructors on EduVerse.</p>

                    {/* Role selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-text-secondary mb-3">I want to join as</p>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                                    className={clsx(
                                        'p-4 rounded-xl border-2 text-left transition-all',
                                        form.role === r.value
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-surface-border hover:border-primary-300'
                                    )}
                                >
                                    <p className={clsx('font-semibold text-sm', form.role === r.value ? 'text-primary-700' : 'text-text-primary')}>{r.label}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}
                        <Input label="Full name" placeholder="John Doe" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            icon={<HiUser className="w-4 h-4" />} error={errors.name} required />
                        <Input label="Email address" type="email" placeholder="your@email.com" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            icon={<HiMail className="w-4 h-4" />} error={errors.email} required />
                        <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            icon={<HiLockClosed className="w-4 h-4" />}
                            iconRight={
                                <button type="button" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                                </button>
                            }
                            error={errors.password} required />
                        <Input label="Confirm password" type="password" placeholder="Repeat your password"
                            value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                            icon={<HiLockClosed className="w-4 h-4" />} error={errors.confirm} required />

                        <p className="text-xs text-text-muted">
                            By creating an account you agree to our{' '}
                            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
                            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
                        </p>
                        <Button type="submit" fullWidth loading={loading} size="lg">Create Account</Button>
                    </form>

                    <div className="space-y-3 mt-5">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">or</span>
                            <div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google sign-up failed')}
                                useOneTap={false}
                            />
                        </div>
                    </div>

                    <p className="text-center text-sm text-text-secondary mt-5">
                        Already have an account?{' '}
                        <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
