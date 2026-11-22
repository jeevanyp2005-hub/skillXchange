import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    // Main login state
    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // Forgot password state
    const [forgotMode, setForgotMode] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetEmailError, setResetEmailError] = useState('')
    const [resetSent, setResetSent] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)

    // Read ?from= redirect
    const from = new URLSearchParams(window.location.search).get('from') || '/dashboard'

    const validate = () => {
        const errs = {}
        if (!form.email) errs.email = 'Email is required'
        else if (!validateEmail(form.email)) errs.email = 'Enter a valid email'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            await login(form.email, form.password)
            toast.success('Welcome back!')
            navigate(from, { replace: true })
        } catch (err) {
            const msg = err.message?.includes('Invalid login')
                ? 'Invalid email or password. Please try again.'
                : err.message || 'Login failed. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        if (!resetEmail) { setResetEmailError('Email is required'); return }
        if (!validateEmail(resetEmail)) { setResetEmailError('Enter a valid email address'); return }
        setResetEmailError('')
        setResetLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/dashboard`,
            })
            if (error) throw error
            setResetSent(true)
        } catch (err) {
            toast.error(err.message || 'Failed to send reset email. Please try again.')
        } finally {
            setResetLoading(false)
        }
    }

    // ── Forgot password — success screen ──
    if (forgotMode && resetSent) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="w-full max-w-md border border-slate-200 bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 border border-emerald-200 text-emerald-600 font-bold bg-emerald-50 rounded mb-4 animate-fade-in">
                        ✓
                    </div>
                    <h1 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Check Your Inbox</h1>
                    <p className="text-xs text-slate-600 mb-1">A password reset link was sent to:</p>
                    <p className="text-xs font-bold text-blue-600 mb-6">{resetEmail}</p>
                    <button
                        onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail('') }}
                        className="btn btn-primary w-full"
                    >
                        Return to Sign In
                    </button>
                </div>
            </div>
        )
    }

    // ── Forgot password — form ──
    if (forgotMode) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="w-full max-w-md border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center px-2.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2 font-mono">
                            Reset Password
                        </div>
                        <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Reset Password</h1>
                        <p className="text-[11.5px] text-slate-600 mt-1 uppercase font-medium">Enter email to recover access</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="reset-email" className="label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="reset-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={resetEmail}
                                    onChange={e => { setResetEmail(e.target.value); setResetEmailError('') }}
                                    className={`input pl-10 ${resetEmailError ? 'input-error' : ''}`}
                                />
                            </div>
                            {resetEmailError && <p className="error-text">{resetEmailError}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={resetLoading}
                            className="btn btn-primary w-full"
                        >
                            {resetLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <button
                        onClick={() => { setForgotMode(false); setResetEmail(''); setResetEmailError('') }}
                        className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mt-6 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Sign In
                    </button>
                </div>
            </div>
        )
    }

    // ── Normal login form ──
    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-md border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center px-2.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2 font-mono">
                        SkillXChange
                    </div>
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Welcome Back</h1>
                        <p className="text-[11.5px] text-slate-600 mt-1 uppercase font-medium">Enter your credentials to sign in</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="label">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="label mb-0">Password</label>
                            <button
                                type="button"
                                onClick={() => setForgotMode(true)}
                                className="text-[11px] text-blue-600 hover:underline font-bold"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="border-t border-slate-100 mt-6 pt-4 text-center">
                    <p className="text-[12.5px] text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:underline">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
