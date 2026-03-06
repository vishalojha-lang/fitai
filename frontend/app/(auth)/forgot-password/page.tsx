'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fit<span className="text-green-500">AI</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/login">
                <Button variant="primary" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Reset password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your email and we&apos;ll send you a reset link
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
