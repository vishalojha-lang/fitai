'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { today } from '@/lib/utils';

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

interface Measurement {
  id: string;
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

interface WorkoutFreq {
  week: string;
  count: number;
}

function ProgressContent() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [workoutFreq, setWorkoutFreq] = useState<WorkoutFreq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    weight: '',
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, wRes] = await Promise.all([
        api.get('/api/progress/measurements'),
        api.get('/api/progress/workout-frequency'),
      ]);
      setMeasurements(mRes.data?.measurements ?? []);
      setWorkoutFreq(wRes.data?.frequency ?? []);
    } catch {
      setMeasurements([]);
      setWorkoutFreq([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight && !form.chest && !form.waist && !form.arms && !form.thighs) {
      setFormError('Please enter at least one measurement');
      return;
    }
    setFormError('');
    setSubmitLoading(true);
    try {
      await api.post('/api/progress/measurements', {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        chest: form.chest ? Number(form.chest) : undefined,
        waist: form.waist ? Number(form.waist) : undefined,
        arms: form.arms ? Number(form.arms) : undefined,
        thighs: form.thighs ? Number(form.thighs) : undefined,
      });
      setForm({ date: today(), weight: '', chest: '', waist: '', arms: '', thighs: '', notes: '' });
      await fetchData();
    } catch {
      // Handle error
    } finally {
      setSubmitLoading(false);
    }
  };

  const weightData = measurements
    .filter((m) => m.weight)
    .map((m) => ({ date: m.date.slice(5), weight: m.weight }))
    .reverse();

  const latest = measurements[0];
  const first = measurements[measurements.length - 1];

  const statDiff = (key: keyof Measurement) => {
    if (!latest || !first || latest === first) return null;
    const l = latest[key] as number | undefined;
    const f = first[key] as number | undefined;
    if (!l || !f) return null;
    const diff = l - f;
    return { diff: diff.toFixed(1), positive: diff > 0 };
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>

        {/* Latest Stats */}
        {latest && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Weight', key: 'weight' as const, unit: 'kg' },
              { label: 'Waist', key: 'waist' as const, unit: 'cm' },
              { label: 'Chest', key: 'chest' as const, unit: 'cm' },
              { label: 'Arms', key: 'arms' as const, unit: 'cm' },
            ].map(({ label, key, unit }) => {
              const val = latest[key] as number | undefined;
              const diff = statDiff(key);
              if (!val) return null;
              return (
                <Card key={key}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {val}<span className="text-sm font-normal text-gray-400"> {unit}</span>
                  </p>
                  {diff && (
                    <p className={`text-xs mt-1 ${diff.positive ? 'text-red-400' : 'text-green-500'}`}>
                      {diff.positive ? '▲' : '▼'} {Math.abs(Number(diff.diff))} {unit} from start
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Weight Chart */}
        {weightData.length >= 2 && (
          <Card>
            <CardHeader>
              <CardTitle>⚖️ Weight Trend</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Workout Frequency Chart */}
        {workoutFreq.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📅 Weekly Workouts</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={workoutFreq}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Log Measurement Form */}
        <Card>
          <CardHeader>
            <CardTitle>Log Measurements</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Weight (kg)" type="number" placeholder="70" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              <Input label="Chest (cm)" type="number" placeholder="95" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
              <Input label="Waist (cm)" type="number" placeholder="80" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
              <Input label="Arms (cm)" type="number" placeholder="35" value={form.arms} onChange={(e) => setForm({ ...form, arms: e.target.value })} />
              <Input label="Thighs (cm)" type="number" placeholder="55" value={form.thighs} onChange={(e) => setForm({ ...form, thighs: e.target.value })} className="col-span-2" />
            </div>
            <Input label="Notes" placeholder="How are you feeling?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <Button type="submit" loading={submitLoading} className="w-full">
              <Plus size={16} /> Save Measurements
            </Button>
          </form>
        </Card>

        {/* History Table */}
        {measurements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Measurement History</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Weight</th>
                    <th className="text-right py-2">Waist</th>
                    <th className="text-right py-2">Chest</th>
                    <th className="text-right py-2">Arms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {measurements.slice(0, 10).map((m) => (
                    <tr key={m.id} className="text-gray-700 dark:text-gray-300">
                      <td className="py-2">{m.date}</td>
                      <td className="py-2 text-right">{m.weight ? `${m.weight}kg` : '-'}</td>
                      <td className="py-2 text-right">{m.waist ? `${m.waist}cm` : '-'}</td>
                      <td className="py-2 text-right">{m.chest ? `${m.chest}cm` : '-'}</td>
                      <td className="py-2 text-right">{m.arms ? `${m.arms}cm` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {measurements.length === 0 && (
          <Card>
            <div className="text-center py-10">
              <TrendingUp size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No measurements logged yet</p>
              <p className="text-xs text-gray-300 mt-1">Start tracking to see your progress charts</p>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}
