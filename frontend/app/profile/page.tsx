'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Save, Sun, Moon, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/lib/api';

interface Profile {
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  goal?: string;
  activity_level?: string;
  diet_preference?: string;
  bmr?: number;
  tdee?: number;
  daily_calories?: number;
}

const GOALS = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'bodybuilding', label: 'Bodybuilding' },
  { value: 'beginner_fitness', label: 'Beginner Fitness' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extra_active', label: 'Extra Active' },
];

const DIETS = [
  { value: 'no_preference', label: 'No Preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

function ProfileContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({});
  const [form, setForm] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    goal: '',
    activity_level: '',
    diet_preference: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/profile');
        setProfile(res.data ?? {});
        const p = res.data ?? {};
        setForm({
          age: p.age?.toString() ?? '',
          height: p.height?.toString() ?? '',
          weight: p.weight?.toString() ?? '',
          gender: p.gender ?? '',
          goal: p.goal ?? '',
          activity_level: p.activity_level ?? '',
          diet_preference: p.diet_preference ?? '',
        });
      } catch {
        // Profile not found
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      await api.put('/api/profile', {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Handle error
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setLogoutLoading(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const selectClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900";

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

        {/* User Info Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {user?.displayName ?? 'FitAI User'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-500" />
            </div>
          </div>
        </Card>

        {/* Stats */}
        {(profile.bmr || profile.tdee || profile.daily_calories) && (
          <div className="grid grid-cols-3 gap-3">
            {profile.bmr && (
              <Card className="text-center p-3">
                <p className="text-xs text-gray-400 mb-1">BMR</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.bmr}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </Card>
            )}
            {profile.tdee && (
              <Card className="text-center p-3">
                <p className="text-xs text-gray-400 mb-1">TDEE</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.tdee}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </Card>
            )}
            {profile.daily_calories && (
              <Card className="text-center p-3">
                <p className="text-xs text-gray-400 mb-1">Daily Goal</p>
                <p className="text-lg font-bold text-green-500">{profile.daily_calories}</p>
                <p className="text-xs text-gray-400">kcal</p>
              </Card>
            )}
          </div>
        )}

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age"
                type="number"
                placeholder="25"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={selectClass}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Height (cm)" type="number" placeholder="175" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
              <Input label="Weight (kg)" type="number" placeholder="70" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fitness Goal</label>
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={selectClass}>
                <option value="">Select goal</option>
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Level</label>
              <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })} className={selectClass}>
                <option value="">Select level</option>
                {ACTIVITY_LEVELS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Diet Preference</label>
              <select value={form.diet_preference} onChange={(e) => setForm({ ...form, diet_preference: e.target.value })} className={selectClass}>
                <option value="">Select diet</option>
                {DIETS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            {saveSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">✓ Profile saved successfully!</p>
            )}

            <Button type="submit" loading={saveLoading} className="w-full">
              <Save size={16} /> Save Profile
            </Button>
          </form>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-400">Switch between light and dark theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          loading={logoutLoading}
          onClick={handleLogout}
        >
          <LogOut size={16} /> Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
