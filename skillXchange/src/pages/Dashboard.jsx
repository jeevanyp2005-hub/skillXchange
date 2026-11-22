import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { skillsService } from '../services/skillsService'
import { exchangeService } from '../services/exchangeService'
import RequestCard from '../components/RequestCard'
import SkillBadge from '../components/SkillBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { User, Plus, ArrowLeftRight, Zap, MapPin, AlertCircle, CheckCircle2, Circle } from 'lucide-react'

export default function Dashboard() {
    const { user } = useAuth()
    const { profile, loading: profileLoading } = useProfile()
    const [skills, setSkills] = useState([])
    const [incoming, setIncoming] = useState([])
    const [outgoing, setOutgoing] = useState([])
    const [activeExchanges, setActiveExchanges] = useState([])
    const [dataLoading, setDataLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!user) return
        try {
            const [s, inc, out, active] = await Promise.all([
                skillsService.getUserSkills(user.id),
                exchangeService.getIncomingRequests(user.id),
                exchangeService.getOutgoingRequests(user.id),
                exchangeService.getActiveExchanges(user.id),
            ])
            setSkills(s)
            setIncoming(inc.filter(r => r.status === 'pending'))
            setOutgoing(out.filter(r => r.status === 'pending'))
            setActiveExchanges(active)
        } catch (err) {
            console.error('Dashboard fetch error:', err)
        } finally {
            setDataLoading(false)
        }
    }, [user])

    useEffect(() => { fetchData() }, [fetchData])

    const offerSkills = skills.filter(s => s.type === 'offer')
    const wantSkills = skills.filter(s => s.type === 'want')

    const initials = profile?.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || '?'

    if (profileLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    const profileIncomplete = !profile?.name || !profile?.github_url || !profile?.linkedin_url

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-sans">
            {/* Onboarding checklist — shown to brand-new users */}
            {!profile?.name && skills.length === 0 && incoming.length === 0 && (
                <div className="card">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">👋 Welcome to SkillXChange!</h3>
                    <p className="text-xs text-slate-650 mb-4">Complete these checklist items to activate your profile.</p>
                    <div className="space-y-3 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                        {[
                            { done: !!profile?.name, label: 'Complete your profile', sublabel: 'Add name, bio, and social links', link: '/profile' },
                            { done: skills.length > 0, label: 'Add your first skill', sublabel: 'List skills to teach or learn', link: '/profile' },
                            { done: false, label: 'Browse and connect', sublabel: 'Find peers matching desired skills', link: '/browse' },
                        ].map(({ done, label, sublabel, link }, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs py-2 border-b border-slate-100 last:border-b-0">
                                <span className={`flex-shrink-0 mt-0.5 ${done ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {done ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Circle className="w-4.5 h-4.5" />}
                                </span>
                                <div className="flex-1">
                                    <p className={`font-semibold ${done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{label}</p>
                                    <p className="text-[11.5px] text-slate-600 mt-0.5">{sublabel}</p>
                                </div>
                                {!done && (
                                    <Link to={link} className="text-xs text-blue-600 hover:underline font-bold">
                                        Configure →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile incomplete banner */}
            {profileIncomplete && (
                <div className="border border-amber-200 bg-amber-50 p-4 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-amber-700">Configure Profile Details</p>
                            <p className="text-[11.5px] text-amber-900/90 mt-0.5">Please add your name, GitHub, and LinkedIn to enable skill exchanges.</p>
                        </div>
                    </div>
                    <Link to="/profile" className="btn btn-sm btn-primary bg-amber-600 text-white border-amber-600 hover:bg-amber-500 flex-shrink-0">
                        Edit Profile
                    </Link>
                </div>
            )}

            {/* Profile Summary */}
            <div className="card">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0 self-center sm:self-start">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 border border-slate-200 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 border border-slate-200 bg-slate-100 text-blue-600 flex items-center justify-center font-bold text-lg rounded-full">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-slate-800 tracking-tight">{profile?.name || 'Administrator User'}</h2>
                        {profile?.location && (
                            <p className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {profile.location}
                            </p>
                        )}
                        {profile?.bio ? (
                            <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{profile.bio}</p>
                        ) : (
                            <p className="text-xs text-slate-500 italic mt-3">No biography recorded on profile yet.</p>
                        )}
                        <div className="flex items-center gap-4 mt-4 text-[12.5px] font-bold">
                            {profile?.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-md text-slate-600 hover:text-slate-800 transition-colors">
                                    GitHub Profile
                                </a>
                            )}
                            {profile?.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-md text-slate-600 hover:text-blue-600 transition-colors">
                                    LinkedIn Profile
                                </a>
                            )}
                        </div>
                    </div>
                    <Link to="/profile" className="btn btn-sm btn-secondary flex-shrink-0 w-full sm:w-auto text-center">
                        <User className="w-3.5 h-3.5" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Skills Offered', value: offerSkills.length, color: 'text-blue-600', border: 'border-blue-100 bg-blue-50/10' },
                    { label: 'Skills Wanted', value: wantSkills.length, color: 'text-emerald-600', border: 'border-emerald-100 bg-emerald-50/10' },
                    { label: 'Incoming Requests', value: incoming.length, color: 'text-amber-600', border: 'border-amber-100 bg-amber-50/10' },
                    { label: 'Active Exchanges', value: activeExchanges.length, color: 'text-purple-600', border: 'border-purple-100 bg-purple-50/10' },
                ].map(({ label, value, color, border }) => (
                    <div key={label} className={`border ${border} p-5 rounded-xl text-center shadow-sm`}>
                        <div className={`text-2xl font-semibold ${color} tracking-tight`}>
                            {value}
                        </div>
                        <p className="text-[11.5px] text-slate-600 font-semibold tracking-wider mt-1 uppercase">{label}</p>
                    </div>
                ))}
            </div>

            {/* Skills Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Offered */}
                <div className="card">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs uppercase font-bold text-slate-700 flex items-center gap-2">
                            🎓 Skills I Can Teach
                        </h3>
                        <Link to="/profile" className="btn btn-sm btn-secondary">
                            <Plus className="w-3 h-3" /> Add
                        </Link>
                    </div>
                    {offerSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {offerSkills.map(s => <SkillBadge key={s.id} skill={s} />)}
                        </div>
                    ) : (
                        <EmptyState icon={Zap} title="No skills offered yet" description="Add capabilities you can teach other users." />
                    )}
                </div>

                {/* Wanted */}
                <div className="card">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs uppercase font-bold text-slate-700 flex items-center gap-2">
                            📖 Skills I Want to Learn
                        </h3>
                        <Link to="/profile" className="btn btn-sm btn-secondary">
                            <Plus className="w-3 h-3" /> Add
                        </Link>
                    </div>
                    {wantSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {wantSkills.map(s => <SkillBadge key={s.id} skill={{ ...s, type: 'want' }} />)}
                        </div>
                    ) : (
                        <EmptyState icon={Plus} title="No skills wanted yet" description="Add skills you wish to learn." />
                    )}
                </div>
            </div>

            {/* Incoming Requests */}
            {incoming.length > 0 && (
                <div className="card">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs uppercase font-bold text-slate-700 flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4 text-amber-500" />
                            Incoming Requests Queue
                            <span className="border border-amber-200 bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">{incoming.length} new</span>
                        </h3>
                        <Link to="/requests" className="text-xs text-blue-600 hover:underline font-semibold">View All Logs</Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {incoming.slice(0, 2).map(req => (
                            <RequestCard key={req.id} request={req} type="incoming" onUpdate={fetchData} />
                        ))}
                    </div>
                </div>
            )}

            {/* Active Exchanges */}
            {activeExchanges.length > 0 && (
                <div className="card">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs uppercase font-bold text-slate-700 flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4 text-purple-500" />
                            Active Exchanges
                        </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {activeExchanges.map(req => (
                            <RequestCard key={req.id} request={req} type={req.sender_id === user.id ? 'outgoing' : 'incoming'} onUpdate={fetchData} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
