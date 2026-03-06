'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Moon, RefreshCw, Dumbbell } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface WorkoutDay {
  day: string;
  muscle_group: string;
  is_rest: boolean;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  goal: string;
  created_at: string;
  days: WorkoutDay[];
}

const GOALS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'beginner_fitness', label: 'Beginner Fitness' },
];

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function WorkoutPlanContent() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('muscle_gain');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const todayName = DAY_NAMES[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/workout-plan');
      setPlan(res.data);
      const todayPlan = res.data?.days?.find((d: WorkoutDay) => d.day === todayName);
      if (todayPlan) setExpandedDay(todayName);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/api/workout-plan/generate', { goal: selectedGoal });
      setPlan(res.data);
      setExpandedDay(todayName);
    } catch {
      // Handle error
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plan</h1>
          {plan && (
            <button
              onClick={fetchPlan}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>

        {!plan ? (
          /* No Plan - Generate */
          <Card>
            <div className="text-center py-6">
              <Dumbbell size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Workout Plan Yet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Generate a personalized workout plan based on your fitness goal
              </p>

              <div className="max-w-xs mx-auto">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Select Your Goal</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full px-4 py-2.5 mb-4 rounded-xl border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500"
                >
                  {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                <Button className="w-full" loading={generating} onClick={handleGenerate}>
                  <Zap size={16} />
                  Generate My Plan
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Plan Header */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Current Plan</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                    {GOALS.find((g) => g.value === plan.goal)?.label ?? plan.goal}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Generated {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none"
                  >
                    {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  <Button variant="outline" size="sm" loading={generating} onClick={handleGenerate}>
                    <RefreshCw size={14} />
                    Regenerate
                  </Button>
                </div>
              </div>
            </Card>

            {/* Weekly Schedule */}
            <div className="flex flex-col gap-3">
              {(plan.days ?? []).map((day) => {
                const isToday = day.day === todayName;
                const isExpanded = expandedDay === day.day;

                return (
                  <Card
                    key={day.day}
                    className={cn(isToday && 'border-green-300 dark:border-green-700 ring-1 ring-green-200 dark:ring-green-900')}
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                          isToday ? 'bg-green-500 text-white' : day.is_rest ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        )}>
                          {day.day.slice(0, 3)}
                        </div>
                        <div>
                          <p className={cn('text-sm font-semibold', isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white')}>
                            {day.day} {isToday && '(Today)'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {day.is_rest ? '🛌 Rest Day' : day.muscle_group}
                          </p>
                        </div>
                      </div>
                      {!day.is_rest && (
                        <span className="text-xs text-gray-400">{day.exercises?.length ?? 0} exercises</span>
                      )}
                    </div>

                    {isExpanded && !day.is_rest && (day.exercises?.length ?? 0) > 0 && (
                      <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                        {day.exercises.map((ex, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-7 h-7 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400 shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ex.name}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                  {ex.sets} sets × {ex.reps}
                                </span>
                                <span className="text-xs text-gray-400">Rest: {ex.rest}</span>
                              </div>
                              {ex.notes && <p className="text-xs text-gray-400 mt-1 italic">{ex.notes}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isExpanded && day.is_rest && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                        <Moon size={24} className="text-gray-300 mx-auto mb-1" />
                        <p className="text-sm text-gray-400">Active recovery, stretching, or complete rest</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function WorkoutPlanPage() {
  return (
    <ProtectedRoute>
      <WorkoutPlanContent />
    </ProtectedRoute>
  );
}
