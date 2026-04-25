import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiMail, HiArrowLeft } from 'react-icons/hi';
import { forgotPasswordApi } from '../../features/auth/authApi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError('Email is required'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }

        setError('');
        setLoading(true);

        try {
            await forgotPasswordApi({ email: email.trim() });
            setSent(true);
            toast.success('Reset link sent if your account exists');
        } catch (requestError) {
            setError(requestError.message || 'Unable to send reset link');
            toast.error(requestError.message || 'Unable to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-bg p-6">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                        <HiAcademicCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">EduVerse LMS</span>
                </div>
                <div className="bg-white rounded-2xl border border-surface-border shadow-card-lg p-8">
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiMail className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Check your inbox</h3>
                            <p className="text-text-secondary text-sm mb-6">We sent a password reset link to <strong>{email}</strong>. It will expire in 15 minutes.</p>
                            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center gap-1">
                                <HiArrowLeft className="w-4 h-4" /> Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">Forgot password?</h2>
                            <p className="text-text-secondary text-sm mb-6">Enter your email address and we'll send you a reset link.</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Email address" type="email" placeholder="your@email.com"
                                    value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                                    icon={<HiMail className="w-4 h-4" />} error={error} required />
                                <Button type="submit" fullWidth loading={loading} size="lg">Send Reset Link</Button>
                            </form>
                            <div className="mt-5 text-center">
                                <Link to={ROUTES.LOGIN} className="text-sm text-text-secondary hover:text-text-primary flex items-center justify-center gap-1">
                                    <HiArrowLeft className="w-4 h-4" /> Back to login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
