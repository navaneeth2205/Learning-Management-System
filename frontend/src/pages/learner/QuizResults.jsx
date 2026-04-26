import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineRefresh } from 'react-icons/hi';
import { fetchQuizById, fetchQuizAttemptResult } from '../../services/learnerApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import QuestionCard from '../../components/quiz/QuestionCard';

export default function QuizResults() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [counter, setCounter] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            fetchQuizById(id),
            fetchQuizAttemptResult(id).catch(() => null),
        ]).then(([quizRes, resultRes]) => {
            if (quizRes.status === 'fulfilled') setQuiz(quizRes.value);
            if (resultRes.status === 'fulfilled' && resultRes.value) setResult(resultRes.value);
            setLoading(false);
        });
    }, [id]);

    const score = result?.score ?? 0;
    const attemptsLeft = (quiz?.maxAttempts ?? 1) - (quiz?.attemptsUsed ?? 0);
    const canRetry = attemptsLeft > 0;

    useEffect(() => {
        const duration = 1200;
        const startObj = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startObj;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCounter(Math.round(easeOut * score));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [score]);

    if (loading) return <div className="p-10 font-bold text-slate-500">Loading results...</div>;
    if (!quiz) return <div className="p-10 font-bold text-rose-500">Quiz not found</div>;

    const ringColor = (result?.passed) ? '#10b981' : '#ef4444';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (counter / 100) * circumference;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-24">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center sticky top-6">
                        <div className="relative w-40 h-40 mb-6">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" className="stroke-slate-100" strokeWidth="8" fill="none" />
                                <circle
                                    cx="60" cy="60" r="54"
                                    stroke={ringColor} strokeWidth="8" fill="none"
                                    strokeLinecap="round"
                                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.1s linear' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-4xl font-black text-slate-800">{counter}%</span>
                            </div>
                        </div>

                        <div className="animate-in zoom-in duration-500 ease-out mb-2">
                            <Badge color={result.passed ? 'green' : 'red'} className="shadow-sm py-1.5 px-3 text-xs tracking-widest">{result.passed ? "PASSED" : "FAILED"}</Badge>
                        </div>

                        <p className="font-medium text-slate-600 mb-1 leading-snug text-center">You scored {result.earnedPoints} / {result.totalPoints} points</p>
                        <p className="text-xs text-slate-400">Completed in {result.timeTaken}</p>
                        <p className="text-xs text-slate-400 mt-1">Submitted: {result.submittedAt}</p>

                        <div className="w-full grid grid-cols-3 gap-3 mt-8 border-t border-slate-100 pt-6">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Correct</p>
                                <p className="font-black text-slate-800 text-lg">{result.answers.filter(a => a.correct).length} / {quiz.questions.length}</p>
                            </div>
                            <div className="text-center border-l border-r border-slate-100">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Points</p>
                                <p className="font-black text-slate-800 text-lg">{result.earnedPoints}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Rank</p>
                                <p className="font-black flex-1 text-slate-800 text-sm mt-1.5">Top 18%</p>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-3 mt-8">
                            <Button fullWidth onClick={() => navigate('/learner/quizzes')}>Continue to Next Lesson</Button>
                            <Button 
                                fullWidth 
                                variant="outline" 
                                icon={<HiOutlineRefresh />} 
                                disabled={!canRetry}
                                onClick={() => navigate(`/learner/quiz/${id}/attempt`)}
                                className={!canRetry ? "opacity-50 grayscale cursor-not-allowed" : ""}
                            >
                                {canRetry ? "Retry for Higher Score" : "Attempts Exhausted"}
                            </Button>
                            <Button fullWidth variant="ghost" onClick={() => navigate('/learner/quizzes')}>Back to Quizzes</Button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm h-full">
                        <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-slate-100 pb-4">Review Your Answers</h3>
                        <div className="space-y-12">
                            {quiz.questions.map((q, i) => {
                                const ans = result.answers.find(a => a.questionId === q.id);
                                return (
                                    <div key={q.id} className="animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'both' }}>
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${ans?.correct ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ans?.correct ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {ans?.correct ? 'Correct' : 'Incorrect'} ({ans?.points || 0} pts)
                                                </div>
                                                <QuestionCard question={q} mode="review" selectedAnswer={ans?.selected} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
