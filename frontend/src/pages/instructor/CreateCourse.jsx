import { useState } from 'react';
import {
    HiChevronRight, HiChevronLeft, HiUpload, HiPlus,
    HiTrash, HiCheck, HiAcademicCap, HiDocumentText,
    HiVideoCamera, HiCog, HiDotsVertical
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import clsx from 'clsx';

export default function CreateCourse() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        difficulty: '',
        description: '',
        thumbnail: null,
    });

    const steps = [
        { n: 1, label: 'Basic Info', icon: HiDocumentText },
        { n: 2, label: 'Curriculum', icon: HiAcademicCap },
        { n: 3, label: 'Publish Settings', icon: HiCheck },
    ];

    const handleNext = () => setStep(s => Math.min(3, s + 1));
    const handleBack = () => setStep(s => Math.max(1, s - 1));

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-text-primary">Create New Course</h1>
                    <p className="text-text-secondary">Fill in the details to launch your enterprise course.</p>
                </div>
                <Button variant="ghost" onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}>Cancel</Button>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2" />
                {steps.map(s => (
                    <div key={s.n} className="flex flex-col items-center gap-2">
                        <div className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                            step === s.n ? "bg-violet-600 border-violet-600 text-white shadow-lg scale-110" :
                                step > s.n ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-400"
                        )}>
                            {step > s.n ? <HiCheck className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                        </div>
                        <span className={clsx("text-xs font-bold uppercase tracking-wider", step >= s.n ? "text-text-primary" : "text-text-muted")}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl border border-surface-border shadow-card p-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Course Title"
                                placeholder="e.g. Master React in 30 Days"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Select
                                label="Category"
                                placeholder="Select category"
                                options={[
                                    { label: 'Web Development', value: 'web' },
                                    { label: 'Data Science', value: 'ds' },
                                    { label: 'Design', value: 'design' },
                                    { label: 'Cloud Computing', value: 'cloud' },
                                    { label: 'Business', value: 'business' },
                                    { label: 'Security', value: 'security' }
                                ]}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Difficulty"
                                options={[
                                    { label: 'Beginner', value: 'begin' },
                                    { label: 'Intermediate', value: 'inter' },
                                    { label: 'Advanced', value: 'adv' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                            <textarea
                                className="w-full rounded-lg border border-surface-border p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none min-h-[120px]"
                                placeholder="Describe what students will learn..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Course Thumbnail</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-400 transition-colors cursor-pointer group">
                                <HiUpload className="w-12 h-12 text-slate-300 mx-auto mb-2 group-hover:text-violet-500 transition-colors" />
                                <p className="text-sm text-text-secondary">Click to upload or drag and drop</p>
                                <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-primary">Curriculum Builder</h3>
                            <Button size="sm" variant="outline" icon={<HiPlus />}>Add Module</Button>
                        </div>
                        <div className="space-y-4">
                            {/* Demo Module */}
                            <div className="border border-surface-border rounded-xl p-4 space-y-4">
                                <div className="flex items-center justify-between border-b border-surface-border pb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-surface-muted text-text-secondary px-2 py-1 rounded text-[10px] font-bold">M1</span>
                                        <input className="font-bold text-text-primary bg-transparent focus:outline-none" defaultValue="Introduction to the Course" />
                                    </div>
                                    <button className="text-red-400 hover:text-red-600"><HiTrash /></button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 bg-surface-muted/50 p-3 rounded-lg border-2 border-transparent hover:border-violet-200 transition-all cursor-move">
                                        <HiVideoCamera className="text-slate-400" />
                                        <span className="text-sm text-text-primary flex-1">1. Welcome and Setup</span>
                                        <HiDotsVertical className="text-slate-300" />
                                    </div>
                                    <div className="flex items-center gap-3 bg-surface-muted/50 p-3 rounded-lg border-2 border-transparent hover:border-violet-200 transition-all cursor-move">
                                        <HiVideoCamera className="text-slate-400" />
                                        <span className="text-sm text-text-primary flex-1">2. Core Concepts Overview</span>
                                        <HiDotsVertical className="text-slate-300" />
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-violet-600 flex items-center gap-1 hover:underline">
                                    <HiPlus className="w-3 h-3" /> Add Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 py-4">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <HiCheck className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary">Ready to Launch!</h3>
                            <p className="text-text-secondary max-w-sm">Review your details and publish your course to the EduVerse catalog.</p>
                        </div>

                        <div className="space-y-4 bg-surface-muted/30 p-6 rounded-2xl border border-surface-border">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Visibility</span>
                                <Badge color="green">Public</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-text-secondary">Draft Saved</span>
                                <span className="text-text-primary font-medium">Just now</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-surface-border">
                                <span className="text-text-secondary italic">Estimated students reached</span>
                                <span className="text-violet-600 font-bold font-mono">1.2k+</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <HiCog className="text-amber-500 w-6 h-6 flex-shrink-0" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                                By publishing, your course will undergo a quick automated moderation check before appearing in search results.
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-border">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className={clsx(step === 1 && "invisible")}
                        icon={<HiChevronLeft />}
                    >
                        Back
                    </Button>
                    <div className="flex gap-3">
                        {step < 3 ? (
                            <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 text-white" iconRight={<HiChevronRight />}>Next Step</Button>
                        ) : (
                            <Button onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)} className="bg-violet-600 hover:bg-violet-700 text-white px-8" icon={<HiCheck />}>Publish Course</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
