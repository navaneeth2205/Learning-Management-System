import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiArrowLeft, HiLockClosed, HiMail } from 'react-icons/hi';
import { resetPasswordApi } from '../../features/auth/authApi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const presetEmail = useMemo(() => params.get('email') || '', [params]);

    const [email, setEmail] = useState(presetEmail);
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Enter a valid email address');
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError('Enter the 6-digit OTP sent to your email');
            return;
        }

        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await resetPasswordApi({ email: email.trim(), otp: otp.trim(), password });
            toast.success('Password reset successful. Please login.');
            navigate(ROUTES.LOGIN, { replace: true });
        } catch (requestError) {
            setError(requestError.message || 'Unable to reset password');
            toast.error(requestError.message || 'Unable to reset password');
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
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Reset password</h2>
                    <p className="text-text-secondary text-sm mb-6">Enter your email, the OTP from your inbox, and a new password.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Input
                            label="Email address"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            icon={<HiMail className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="OTP code"
                            type="text"
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            icon={<HiLockClosed className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="New password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            icon={<HiLockClosed className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="Confirm new password"
                            type="password"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            icon={<HiLockClosed className="w-4 h-4" />}
                            required
                        />

                        <Button type="submit" fullWidth loading={loading} size="lg">Update Password</Button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link to={ROUTES.LOGIN} className="text-sm text-text-secondary hover:text-text-primary flex items-center justify-center gap-1">
                            <HiArrowLeft className="w-4 h-4" /> Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
