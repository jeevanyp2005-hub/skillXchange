import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Register() {
    const { register } = useAuth()

    const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [registered, setRegistered] = useState(false)

    const validate = () => {
        const errs = {}
        if (!form.email) errs.email = 'Email is required'
        else if (!validateEmail(form.email)) errs.email = 'Enter a valid email address'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
        else if (!/[A-Z]/.test(form.password)) errs.password = 'Include at least one uppercase letter'
        if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
        else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        setRegistered(true)
        try {
            await register(form.email, form.password)
        } catch (err) {
            setRegistered(false)
            const msg = err.message?.includes('already registered')
                ? 'This email is already in use. Try logging in instead.'
                : err.message || 'Registration failed. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    // ── Email confirmation screen ──
    if (registered) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
                <div className="w-full max-w-md border border-slate-200 bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 border border-emerald-200 text-emerald-600 font-bold bg-emerald-50 rounded mb-4 animate-fade-in">
                        ✓
                    </div>
                    <h1 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">Check Your Inbox</h1>
                    <p className="text-xs text-slate-600 mb-1">Confirmation link sent to:</p>
                    <p className="text-xs font-bold text-blue-600 mb-6">{form.email}</p>

                    <div className="border border-slate-100 bg-slate-50 p-4 text-left space-y-3 mb-6 text-xs text-slate-600 rounded-md">
                        <p className="font-bold text-slate-700 uppercase border-b border-slate-200 pb-1.5 mb-2">Instructions</p>
                        <div>
                            <span className="text-slate-800 font-bold mr-1">1.</span> Open your inbox (check spam folder as well).
                        </div>
                        <div>
                            <span className="text-slate-800 font-bold mr-1">2.</span> Open the confirmation email from <strong className="text-slate-800">SkillXChange</strong>.
                        </div>
                        <div>
                            <span className="text-slate-800 font-bold mr-1">3.</span> Click the activation link to complete registration.
                        </div>
                    </div>

                    <Link to="/login" className="btn btn-primary w-full">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="w-full max-w-md border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center px-2.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2 font-mono">
                        Sign Up
                    </div>
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Account</h1>
                    <p className="text-[11.5px] text-slate-600 mt-1 uppercase font-medium">Join a network of global learners</p>
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
                        <label htmlFor="password" className="label">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Min 8 chars, 1 uppercase"
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

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Re-enter password"
                                value={form.confirmPassword}
                                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                    </div>

                    <p className="text-[11.5px] text-slate-600 text-center uppercase font-medium">
                        Registration constitutes system agreement.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>

                <div className="border-t border-slate-100 mt-6 pt-4 text-center">
                    <p className="text-[12.5px] text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-blue-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
