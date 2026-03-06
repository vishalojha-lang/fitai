'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, MessageSquare, Droplets, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { today } from '@/lib/utils';

interface DashboardData {
  calories_consumed: number;
  calories_target: number;
  protein_consumed: number;
  protein_target: number;
  water_intake: number;
  workout_completed: boolean;
  todays_workout: {
    name: string;
    exercises: string[];
  } | null;
  recent_activity: Array<{
    id: string;
    type: 'food' | 'workout';
    description: string;
    time: string;
  }>;
}

const defaultData: DashboardData = {
  calories_consumed: 0,
  calories_target: 2000,
  protein_consumed: 0,
  protein_target: 150,
  water_intake: 0,
  workout_completed: false,
  todays_workout: null,
  recent_activity: [],
};

function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [waterAmount, setWaterAmount] = useState(0);

  const firstName = user?.displayName?.split(' ')[0] ?? 'Athlete';

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`/api/dashboard?date=${today()}`);
      setData(res.data);
      setWaterAmount(res.data.water_intake ?? 0);
    } catch {
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const addWater = async () => {
    const newAmount = waterAmount + 250;
    setWaterAmount(newAmount);
    try {
      await api.post('/api/food/water', { amount: newAmount, date: today() });
    } catch {
      // Silent fail
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const caloriesRemaining = Math.max(data.calories_target - data.calories_consumed, 0);

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Daily Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>🔥 Calories</CardTitle>
              <span className="text-xs text-gray-400">{caloriesRemaining} kcal remaining</span>
            </CardHeader>
            <ProgressBar
              value={data.calories_consumed}
              max={data.calories_target}
              showValues
              color="green"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Consumed: {data.calories_consumed} kcal</span>
              <span>Target: {data.calories_target} kcal</span>
            </div>
          </Card>

          {/* Protein */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💪 Protein</CardTitle>
            </CardHeader>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data.protein_consumed}g
              <span className="text-sm font-normal text-gray-400">/{data.protein_target}g</span>
            </p>
            <ProgressBar value={data.protein_consumed} max={data.protein_target} size="sm" className="mt-2" />
          </Card>

          {/* Water */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">💧 Water</CardTitle>
            </CardHeader>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {waterAmount}
              <span className="text-sm font-normal text-gray-400">ml</span>
            </p>
            <ProgressBar value={waterAmount} max={2000} size="sm" color="blue" className="mt-2" />
            <button
              onClick={addWater}
              className="mt-2 w-full text-xs py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-1"
            >
              <Droplets size={12} />
              +250ml
            </button>
          </Card>

          {/* Workout Status */}
          <Card className="col-span-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.workout_completed ? 'bg-green-100 dark:bg-green-950' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {data.workout_completed
                  ? <CheckCircle2 size={20} className="text-green-500" />
                  : <Dumbbell size={20} className="text-gray-400" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.workout_completed ? 'Workout Complete! 🎉' : 'No workout logged yet'}
                </p>
                <p className="text-xs text-gray-400">
                  {data.workout_completed ? 'Great job today!' : 'Log your workout to track progress'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/food">
              <Button variant="secondary" size="sm" className="w-full flex-col h-16 gap-1.5">
                <Plus size={18} />
                <span className="text-xs">Log Food</span>
              </Button>
            </Link>
            <Link href="/workout-log">
              <Button variant="secondary" size="sm" className="w-full flex-col h-16 gap-1.5">
                <Dumbbell size={18} />
                <span className="text-xs">Workout</span>
              </Button>
            </Link>
            <Link href="/ai-coach">
              <Button variant="primary" size="sm" className="w-full flex-col h-16 gap-1.5">
                <MessageSquare size={18} />
                <span className="text-xs">AI Coach</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Workout Preview */}
        {data.todays_workout && (
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Workout</CardTitle>
              <Link href="/workout-plan" className="text-xs text-green-500 font-medium">View Plan</Link>
            </CardHeader>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{data.todays_workout.name}</h4>
            <div className="flex flex-wrap gap-1.5">
              {data.todays_workout.exercises.slice(0, 4).map((ex, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                  {ex}
                </span>
              ))}
              {data.todays_workout.exercises.length > 4 && (
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
                  +{data.todays_workout.exercises.length - 4} more
                </span>
              )}
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          {data.recent_activity.length === 0 ? (
            <div className="text-center py-6">
              <Clock size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No activity yet today</p>
              <p className="text-xs text-gray-400 mt-1">Start logging food or workouts!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.recent_activity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${item.type === 'food' ? 'bg-orange-100 dark:bg-orange-950' : 'bg-green-100 dark:bg-green-950'}`}>
                    {item.type === 'food' ? '🍽️' : '💪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
