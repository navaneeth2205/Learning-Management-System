import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap, HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowLeft } from 'react-icons/hi';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function OtpVerifyPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const refs = Array.from({ length: 6 }, () => useRef());

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.join('').length < 6) { setError('Please enter all 6 digits'); return; }
        setLoading(true);
        setTimeout(() => { setVerified(true); setLoading(false); }, 1200);
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
                    {verified ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Verified!</h3>
                            <p className="text-text-secondary text-sm mb-6">Your email address has been successfully verified. You can now sign in.</p>
                            <Link to={ROUTES.LOGIN}>
                                <Button fullWidth>Continue to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-5">
                                <HiMail className="w-7 h-7 text-primary-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">Verify your email</h2>
                            <p className="text-text-secondary text-sm mb-6">We sent a 6-digit code to your email address. Enter it below to verify your account.</p>
                            <form onSubmit={handleSubmit}>
                                <div className="flex gap-2 mb-2">
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
                                <p className="text-sm text-text-secondary">Didn't receive the code? <button className="text-primary-600 font-medium">Resend</button></p>
                                <Link to={ROUTES.LOGIN} className="text-sm text-text-muted hover:text-text-secondary flex items-center justify-center gap-1">
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
