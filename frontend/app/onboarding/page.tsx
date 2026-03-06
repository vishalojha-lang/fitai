'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const GOALS = [
  { value: 'fat_loss', label: 'Fat Loss', emoji: '🔥' },
  { value: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { value: 'strength_training', label: 'Strength Training', emoji: '🏋️' },
  { value: 'bodybuilding', label: 'Bodybuilding', emoji: '🏆' },
  { value: 'beginner_fitness', label: 'Beginner Fitness', emoji: '⭐' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise' },
];

const DIETS = [
  { value: 'no_preference', label: 'No Preference', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'paleo', label: 'Paleo', emoji: '🥩' },
];

interface FormData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  activity_level: string;
  diet_preference: string;
}

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    activity_level: '',
    diet_preference: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormData>>({});

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep = (s: number) => {
    const e: Partial<FormData> = {};
    if (s === 1) {
      if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 10 || Number(form.age) > 120)
        e.age = 'Enter a valid age (10-120)';
      if (!form.gender) e.gender = 'Please select your gender';
      if (!form.height || isNaN(Number(form.height)) || Number(form.height) < 50 || Number(form.height) > 300)
        e.height = 'Enter a valid height (50-300 cm)';
      if (!form.weight || isNaN(Number(form.weight)) || Number(form.weight) < 20 || Number(form.weight) > 500)
        e.weight = 'Enter a valid weight (20-500 kg)';
    } else if (s === 2) {
      if (!form.goal) e.goal = 'Please select a goal';
      if (!form.activity_level) e.activity_level = 'Please select your activity level';
    } else if (s === 3) {
      if (!form.diet_preference) e.diet_preference = 'Please select a diet preference';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/profile/onboarding', {
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
      });
      router.replace('/dashboard');
    } catch {
      // Proceed to dashboard even if backend not available
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Basic Info', 'Goals', 'Diet'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Let&apos;s personalize your experience
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Help us tailor FitAI to your needs, {user?.displayName?.split(' ')[0] ?? 'there'}!
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      done ? 'bg-green-500 text-white' : active ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    )}
                  >
                    {done ? <CheckCircle size={16} /> : n}
                  </div>
                  <span className={cn('text-xs font-medium', active ? 'text-green-500' : 'text-gray-400')}>{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mt-[-12px]', step > n ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700')} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Age"
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                  error={fieldErrors.age}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
                      fieldErrors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-700',
                      'focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900'
                    )}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {fieldErrors.gender && <p className="text-xs text-red-500">{fieldErrors.gender}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="175"
                  value={form.height}
                  onChange={(e) => set('height', e.target.value)}
                  error={fieldErrors.height}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  placeholder="70"
                  value={form.weight}
                  onChange={(e) => set('weight', e.target.value)}
                  error={fieldErrors.weight}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Fitness Goals</h2>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</p>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => set('goal', g.value)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                        form.goal === g.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className={cn('text-sm font-medium', form.goal === g.value ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300')}>
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
                {fieldErrors.goal && <p className="text-xs text-red-500 mt-1">{fieldErrors.goal}</p>}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Level</p>
                <div className="flex flex-col gap-2">
                  {ACTIVITY_LEVELS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => set('activity_level', a.value)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all',
                        form.activity_level === a.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <span className={cn('text-sm font-medium', form.activity_level === a.value ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300')}>
                        {a.label}
                      </span>
                      <span className="text-xs text-gray-400">{a.desc}</span>
                    </button>
                  ))}
                </div>
                {fieldErrors.activity_level && <p className="text-xs text-red-500 mt-1">{fieldErrors.activity_level}</p>}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dietary Preferences</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">This helps us suggest meals that fit your lifestyle.</p>
              <div className="grid grid-cols-1 gap-2">
                {DIETS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => set('diet_preference', d.value)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                      form.diet_preference === d.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl">{d.emoji}</span>
                    <span className={cn('text-sm font-medium', form.diet_preference === d.value ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300')}>
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
              {fieldErrors.diet_preference && <p className="text-xs text-red-500 mt-1">{fieldErrors.diet_preference}</p>}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" size="lg" onClick={back} className="flex-1">
              <ChevronLeft size={16} />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button size="lg" onClick={next} className="flex-1">
              Next
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button size="lg" loading={loading} onClick={handleSubmit} className="flex-1">
              Get Started!
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
