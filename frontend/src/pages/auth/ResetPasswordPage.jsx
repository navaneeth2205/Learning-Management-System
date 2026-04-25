import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiArrowLeft, HiLockClosed } from 'react-icons/hi';
import { resetPasswordApi } from '../../features/auth/authApi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const token = useMemo(() => params.get('token') || '', [params]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) {
            setError('Reset token is missing from the link');
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
            await resetPasswordApi({ token, password });
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
                    <p className="text-text-secondary text-sm mb-6">Enter a new password for your account.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-sm text-red-600">{error}</p>}

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
