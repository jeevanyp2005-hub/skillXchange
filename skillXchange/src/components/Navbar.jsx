import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LayoutDashboard, Users, User, ArrowLeftRight, Menu, X, LogOut } from 'lucide-react'
import { exchangeService } from '../services/exchangeService'
import toast from 'react-hot-toast'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    // Fetch pending incoming request count for badge
    useEffect(() => {
        if (!user) { setPendingCount(0); return }
        exchangeService.getPendingIncomingCount(user.id)
            .then(setPendingCount)
            .catch(() => {})
    }, [user])

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/browse', label: 'Browse', icon: Users },
        { to: '/requests', label: 'Requests', icon: ArrowLeftRight, badge: pendingCount },
        { to: '/profile', label: 'Profile', icon: User },
    ]

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
            toast.success('Logged out successfully')
        } catch (err) {
            toast.error('Failed to log out')
        }
    }

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 font-sans">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="border border-blue-200 bg-blue-50 rounded px-2 py-0.5 text-blue-600 font-mono font-bold text-xs">
                            SX
                        </div>
                        <span className="font-bold text-sm tracking-wide text-slate-800">
                            Skill<span className="text-blue-600">X</span>Change
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    {user && (
                        <nav className="hidden md:flex items-center h-full">
                            {navItems.map(({ to, label, icon: Icon, badge }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 h-14 text-xs font-bold border-l border-slate-100 transition-colors ${isActive
                                            ? 'bg-blue-50/50 text-blue-600 border-b-2 border-blue-600'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{label}</span>
                                    {badge > 0 && (
                                        <span className="bg-[#ef4444] text-white text-[11px] font-bold px-1.5 py-0.5 rounded border border-white ml-1">
                                            {badge}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex btn btn-sm btn-ghost text-slate-600 hover:text-red-600"
                                    title="Log out"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>LOGOUT</span>
                                </button>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="md:hidden border border-slate-200 p-1.5 rounded text-slate-600 hover:bg-slate-50 hover:text-slate-900 relative"
                                    aria-label="Toggle menu"
                                >
                                    {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                    {pendingCount > 0 && !menuOpen && (
                                        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn btn-sm">LOG_IN</Link>
                                <Link to="/register" className="btn btn-sm btn-primary">SIGN_UP</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {user && menuOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white pb-2">
                        <nav className="flex flex-col">
                            {navItems.map(({ to, label, icon: Icon, badge }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-2.5 text-xs font-bold border-b border-slate-100 transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                    {badge > 0 && (
                                        <span className="ml-auto bg-[#ef4444] text-white text-[11px] font-bold px-1.5 py-0.5 rounded border border-white">
                                            {badge}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#ef4444] hover:bg-[#ef4444]/10"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>LOGOUT</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
