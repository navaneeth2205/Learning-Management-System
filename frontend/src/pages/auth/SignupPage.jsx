import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiAcademicCap, HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import clsx from 'clsx';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: ROLES.LEARNER });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const roles = [
        { value: ROLES.LEARNER, label: 'Learner', desc: 'Access courses and track your progress' },
        { value: ROLES.INSTRUCTOR, label: 'Instructor', desc: 'Create and manage courses' },
    ];

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Full name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setTimeout(() => { navigate(ROUTES.OTP_VERIFY); setLoading(false); }, 1200);
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

                    <p className="text-center text-sm text-text-secondary mt-5">
                        Already have an account?{' '}
                        <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
