import { useMemo, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiMail, HiArrowLeft } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { resendOtpApi, verifyOtpApi } from '../../features/auth/authApi';
import { clearPendingVerificationEmail, loginSuccess } from '../../features/auth/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AUTH_STORAGE_KEY = 'lms_auth';

export default function OtpVerifyPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const pendingEmail = useSelector((state) => state.auth.pendingVerificationEmail);

    const initialEmail = useMemo(() => location.state?.email || pendingEmail || '', [location.state?.email, pendingEmail]);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const refs = Array.from({ length: 6 }, () => useRef());

    const roleDashboards = {
        [ROLES.LEARNER]: ROUTES.LEARNER_DASHBOARD,
        [ROLES.INSTRUCTOR]: ROUTES.INSTRUCTOR_DASHBOARD,
        [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
    };

    const handleChange = (val, i) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[i] = val;
        setOtp(next);
        if (val && i < 5) refs[i + 1].current?.focus();
    };

    const handleKeyDown = (e, i) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (otp.join('').length < 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await verifyOtpApi({
                email: email.trim(),
                otp: otp.join(''),
            });

            try {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data?.user, token: data?.token }));
            } catch {
            }

            dispatch(loginSuccess(data));
            dispatch(clearPendingVerificationEmail());

            const targetPath = roleDashboards[data?.user?.role] || ROUTES.LEARNER_DASHBOARD;
            toast.success('Email verified successfully');
            navigate(targetPath, { replace: true });
        } catch (requestError) {
            setError(requestError.message || 'OTP verification failed');
            toast.error(requestError.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email.trim()) {
            setError('Enter your email first');
            return;
        }

        setError('');
        setResending(true);

        try {
            await resendOtpApi({ email: email.trim() });
            toast.success('A new OTP has been sent to your email');
        } catch (requestError) {
            setError(requestError.message || 'Unable to resend OTP');
            toast.error(requestError.message || 'Unable to resend OTP');
        } finally {
            setResending(false);
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
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                        <HiMail className="w-7 h-7 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Verify your email</h2>
                    <p className="text-text-secondary text-sm mb-6">We sent a 6-digit code to your email address. Enter it below to verify your account.</p>

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <div className="flex gap-2 mt-4 mb-2">
                            {otp.map((v, i) => (
                                <input key={i} ref={refs[i]} maxLength={1} value={v}
                                    onChange={e => handleChange(e.target.value, i)}
                                    onKeyDown={e => handleKeyDown(e, i)}
                                    className="flex-1 h-12 text-center text-lg font-bold rounded-lg border border-surface-border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                />
                            ))}
                        </div>

                        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                        <Button type="submit" fullWidth loading={loading} size="lg" className="mt-4">Verify Email</Button>
                    </form>

                    <div className="mt-5 text-center space-y-2">
                        <p className="text-sm text-text-secondary">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resending}
                                className="text-primary-600 font-medium disabled:opacity-60"
                            >
                                {resending ? 'Resending...' : 'Resend'}
                            </button>
                        </p>
                        <Link to={ROUTES.LOGIN} className="text-sm text-text-muted hover:text-text-secondary flex items-center justify-center gap-1">
                            <HiArrowLeft className="w-4 h-4" /> Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
