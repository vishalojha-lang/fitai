'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, ClipboardList } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { today } from '@/lib/utils';

interface SetRow {
  weight: string;
  reps: string;
}

interface ExerciseLog {
  id: string;
  name: string;
  sets: Array<{ weight: number; reps: number }>;
  date: string;
}

interface ExerciseForm {
  name: string;
  sets: SetRow[];
}

function WorkoutLogContent() {
  const [date, setDate] = useState(today());
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm] = useState<ExerciseForm>({
    name: '',
    sets: [{ weight: '', reps: '' }],
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; sets?: string }>({});

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/workout-log?date=${date}`);
      setExercises(res.data?.exercises ?? []);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const addSet = () => setForm((f) => ({ ...f, sets: [...f.sets, { weight: '', reps: '' }] }));
  const removeSet = (i: number) => setForm((f) => ({ ...f, sets: f.sets.filter((_, idx) => idx !== i) }));
  const updateSet = (i: number, field: keyof SetRow, value: string) => {
    setForm((f) => {
      const sets = [...f.sets];
      sets[i] = { ...sets[i], [field]: value };
      return { ...f, sets };
    });
  };

  const validate = () => {
    const e: { name?: string; sets?: string } = {};
    if (!form.name.trim()) e.name = 'Exercise name is required';
    if (form.sets.length === 0) e.sets = 'Add at least one set';
    const invalidSet = form.sets.some((s) => !s.reps || isNaN(Number(s.reps)));
    if (invalidSet) e.sets = 'All sets must have valid reps';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      await api.post('/api/workout-log', {
        name: form.name,
        date,
        sets: form.sets.map((s) => ({
          weight: Number(s.weight) || 0,
          reps: Number(s.reps),
        })),
      });
      setModalOpen(false);
      setForm({ name: '', sets: [{ weight: '', reps: '' }] });
      await fetchExercises();
    } catch {
      // Handle error
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/workout-log/${id}`);
      setExercises((ex) => ex.filter((e) => e.id !== id));
    } catch {
      // Handle error
    }
  };

  const openModal = () => {
    setForm({ name: '', sets: [{ weight: '', reps: '' }] });
    setFormErrors({});
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Log</h1>
          <Button size="sm" onClick={openModal}>
            <Plus size={16} /> Log Exercise
          </Button>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Exercise List */}
        {loading ? <PageLoader /> : (
          <div className="flex flex-col gap-3">
            {exercises.length === 0 ? (
              <Card>
                <div className="text-center py-10">
                  <ClipboardList size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No exercises logged for this day</p>
                  <Button size="sm" className="mt-4" onClick={openModal}>
                    <Plus size={14} /> Log Your First Exercise
                  </Button>
                </div>
              </Card>
            ) : (
              exercises.map((ex) => (
                <Card key={ex.id}>
                  <CardHeader>
                    <CardTitle>{ex.name}</CardTitle>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 size={14} />
                    </button>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wide">
                          <th className="text-left pb-2">Set</th>
                          <th className="text-right pb-2">Weight</th>
                          <th className="text-right pb-2">Reps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {ex.sets.map((set, i) => (
                          <tr key={i} className="text-gray-700 dark:text-gray-300">
                            <td className="py-1.5 font-medium text-gray-400">{i + 1}</td>
                            <td className="py-1.5 text-right font-semibold">{set.weight > 0 ? `${set.weight} kg` : 'BW'}</td>
                            <td className="py-1.5 text-right text-green-600 font-semibold">{set.reps}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 flex gap-4 text-xs text-gray-400">
                    <span>{ex.sets.length} sets</span>
                    <span>Total reps: {ex.sets.reduce((s, set) => s + set.reps, 0)}</span>
                    {ex.sets.some((s) => s.weight > 0) && (
                      <span>Max: {Math.max(...ex.sets.map((s) => s.weight))} kg</span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Log Exercise Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Exercise">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Exercise Name"
              placeholder="e.g. Bench Press"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={formErrors.name}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sets</label>
                <button
                  type="button"
                  onClick={addSet}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  <Plus size={12} /> Add Set
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 px-1">
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Weight (kg)</span>
                  <span className="col-span-5">Reps</span>
                  <span className="col-span-1" />
                </div>
                {form.sets.map((set, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-xs text-gray-400 text-center">{i + 1}</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => updateSet(i, 'weight', e.target.value)}
                      className="col-span-5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500"
                    />
                    <input
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => updateSet(i, 'reps', e.target.value)}
                      className="col-span-5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500"
                    />
                    {form.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(i)}
                        className="col-span-1 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formErrors.sets && <p className="text-xs text-red-500 mt-1">{formErrors.sets}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitLoading} className="flex-1">
                Save Exercise
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default function WorkoutLogPage() {
  return (
    <ProtectedRoute>
      <WorkoutLogContent />
    </ProtectedRoute>
  );
}
