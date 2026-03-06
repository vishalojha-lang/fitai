'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Trash2, Search, UtensilsCrossed } from 'lucide-react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { today } from '@/lib/utils';

const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  meal_type: string;
  date: string;
}

interface NutritionSummary {
  calories: { consumed: number; target: number };
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

function FoodContent() {
  const [activeTab, setActiveTab] = useState<'log' | 'search'>('log');
  const [date, setDate] = useState(today());
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [summary, setSummary] = useState<NutritionSummary>({
    calories: { consumed: 0, target: 2000 },
    protein: { consumed: 0, target: 150 },
    carbs: { consumed: 0, target: 250 },
    fat: { consumed: 0, target: 65 },
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<FoodItem>[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '', portion_size: '100g', meal_type: 'Breakfast',
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchFood = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, summaryRes] = await Promise.all([
        api.get(`/api/food?date=${date}`),
        api.get(`/api/food/summary?date=${date}`),
      ]);
      setFoodItems(itemsRes.data?.items ?? []);
      if (summaryRes.data) setSummary(summaryRes.data);
    } catch {
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchFood(); }, [fetchFood]);

  const validateForm = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Food name required';
    if (!form.calories || isNaN(Number(form.calories))) e.calories = 'Valid calories required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      await api.post('/api/food', {
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        date,
      });
      setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', portion_size: '100g', meal_type: 'Breakfast' });
      await fetchFood();
    } catch {
      // Handle error
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/food/${id}`);
      setFoodItems((items) => items.filter((i) => i.id !== id));
    } catch {
      // Handle error
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await api.get(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data?.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addFromSearch = async (item: Partial<FoodItem>) => {
    try {
      await api.post('/api/food', { ...item, date, meal_type: 'Breakfast' });
      await fetchFood();
      setSearchResults([]);
      setSearchQuery('');
    } catch {
      // Handle error
    }
  };

  const macroData = [
    { name: 'Protein', value: summary.protein.consumed },
    { name: 'Carbs', value: summary.carbs.consumed },
    { name: 'Fat', value: summary.fat.consumed },
  ].filter((d) => d.value > 0);

  const mealGroups = MEAL_TYPES.reduce<Record<string, FoodItem[]>>((acc, meal) => {
    acc[meal] = foodItems.filter((i) => i.meal_type.toLowerCase() === meal.toLowerCase());
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Tracker</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Daily Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Daily Summary</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2">Nutrient</th>
                  <th className="text-right pb-2">Consumed</th>
                  <th className="text-right pb-2">Target</th>
                  <th className="text-right pb-2">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { name: 'Calories', unit: 'kcal', data: summary.calories },
                  { name: 'Protein', unit: 'g', data: summary.protein },
                  { name: 'Carbs', unit: 'g', data: summary.carbs },
                  { name: 'Fat', unit: 'g', data: summary.fat },
                ].map(({ name, unit, data }) => (
                  <tr key={name} className="text-gray-700 dark:text-gray-300">
                    <td className="py-2 font-medium">{name}</td>
                    <td className="py-2 text-right text-green-600 font-semibold">{data.consumed}{unit}</td>
                    <td className="py-2 text-right text-gray-400">{data.target}{unit}</td>
                    <td className="py-2 text-right text-gray-500">{Math.max(data.target - data.consumed, 0)}{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {macroData.length > 0 && (
            <div className="mt-4 flex justify-center">
              <PieChart width={180} height={180}>
                <Pie data={macroData} cx={90} cy={90} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {macroData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}g`} />
              </PieChart>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['log', 'search'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                activeTab === tab ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab === 'log' ? '📝 Log Food' : '🔍 Search Food'}
            </button>
          ))}
        </div>

        {/* Log Food Tab */}
        {activeTab === 'log' && (
          <Card>
            <CardHeader><CardTitle>Log Food</CardTitle></CardHeader>
            <form onSubmit={handleLogFood} className="flex flex-col gap-3">
              <Input label="Food Name" placeholder="e.g. Grilled Chicken Breast" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Calories (kcal)" type="number" placeholder="250" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} error={formErrors.calories} />
                <Input label="Protein (g)" type="number" placeholder="30" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Carbs (g)" type="number" placeholder="20" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
                <Input label="Fat (g)" type="number" placeholder="8" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Portion Size" placeholder="100g" value={form.portion_size} onChange={(e) => setForm({ ...form, portion_size: e.target.value })} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meal Type</label>
                  <select
                    value={form.meal_type}
                    onChange={(e) => setForm({ ...form, meal_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500"
                  >
                    {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <Button type="submit" loading={submitLoading} className="w-full">
                <Plus size={16} /> Log Food
              </Button>
            </form>
          </Card>
        )}

        {/* Search Food Tab */}
        {activeTab === 'search' && (
          <Card>
            <CardHeader><CardTitle>Search Food</CardTitle></CardHeader>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} loading={searchLoading} variant="primary" size="md">
                <Search size={16} />
              </Button>
            </div>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {searchResults.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.calories} kcal · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g</p>
                    </div>
                    <Button size="sm" variant="primary" onClick={() => addFromSearch(item)}>
                      <Plus size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery && !searchLoading ? (
              <p className="text-sm text-center text-gray-400 py-4">No results found</p>
            ) : null}
          </Card>
        )}

        {/* Meal Breakdown */}
        {loading ? <PageLoader /> : (
          <div className="flex flex-col gap-3">
            {MEAL_TYPES.map((meal) => {
              const items = mealGroups[meal] ?? [];
              if (items.length === 0) return null;
              return (
                <Card key={meal}>
                  <CardHeader>
                    <CardTitle className="text-sm">{meal}</CardTitle>
                    <span className="text-xs text-gray-400">
                      {items.reduce((s, i) => s + i.calories, 0)} kcal
                    </span>
                  </CardHeader>
                  <div className="flex flex-col gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.portion_size} · {item.calories} kcal</p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {foodItems.length === 0 && !loading && (
              <div className="text-center py-10">
                <UtensilsCrossed size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No food logged for this day</p>
                <p className="text-xs text-gray-300 mt-1">Use &quot;Log Food&quot; to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function FoodPage() {
  return (
    <ProtectedRoute>
      <FoodContent />
    </ProtectedRoute>
  );
}
