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
import { createCourse } from '../../services/instructorApi';
import toast from 'react-hot-toast';

export default function CreateCourse() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const toastId = toast.loading('Publishing your course...');
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('category', formData.category);
            payload.append('description', formData.description);
            if (formData.thumbnail) payload.append('thumbnail', formData.thumbnail);

            await createCourse(payload);
            toast.success('Course published successfully!', { id: toastId });
            navigate(ROUTES.INSTRUCTOR_COURSES);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to publish course', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                options={[
                                    { label: 'Web Development', value: 'Web Development' },
                                    { label: 'Data Science', value: 'Data Science' },
                                    { label: 'Design', value: 'Design' },
                                    { label: 'Cloud Computing', value: 'Cloud Computing' },
                                    { label: 'Business', value: 'Business' },
                                    { label: 'Security', value: 'Security' }
                                ]}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Difficulty"
                                value={formData.difficulty}
                                onChange={(val) => setFormData({ ...formData, difficulty: val })}
                                options={[
                                    { label: 'Beginner', value: 'beginner' },
                                    { label: 'Intermediate', value: 'intermediate' },
                                    { label: 'Advanced', value: 'advanced' }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                            <textarea
                                className="w-full rounded-lg border border-surface-border p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none min-h-[120px]"
                                placeholder="Describe what students will learn..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Course Thumbnail</label>
                            <input
                                type="file"
                                id="thumbnail-upload"
                                className="hidden"
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                            />
                            <label 
                                htmlFor="thumbnail-upload"
                                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-violet-400 transition-colors cursor-pointer group block"
                            >
                                <HiUpload className="w-12 h-12 text-slate-300 mx-auto mb-2 group-hover:text-violet-500 transition-colors" />
                                <p className="text-sm text-text-secondary">
                                    {formData.thumbnail ? formData.thumbnail.name : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                            </label>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text-primary">Curriculum Builder</h3>
                            <Button size="sm" variant="outline" icon={<HiPlus />}>Add Module</Button>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                            <HiAcademicCap className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                            <p className="text-sm text-indigo-900 font-bold">Curriculum builder is live!</p>
                            <p className="text-xs text-indigo-700 mt-1">Add modules and lessons after publishing the basic course info.</p>
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
                            <div className="flex justify-between items-center text-sm pt-2 border-t border-surface-border">
                                <span className="text-text-secondary italic">Estimated students reached</span>
                                <span className="text-violet-600 font-bold font-mono">1.2k+</span>
                            </div>
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
                        disabled={isSubmitting}
                    >
                        Back
                    </Button>
                    <div className="flex gap-3">
                        {step < 3 ? (
                            <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 text-white" iconRight={<HiChevronRight />}>Next Step</Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                className="bg-violet-600 hover:bg-violet-700 text-white px-8" 
                                icon={<HiCheck />}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Course'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
