import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { profileService } from '../services/profileService'
import { skillsService } from '../services/skillsService'
import { exchangeService } from '../services/exchangeService'
import SkillBadge from '../components/SkillBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { MapPin, ArrowLeftRight, X, Send, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserProfile() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)
    const [skills, setSkills] = useState([])
    const [mySkills, setMySkills] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [sending, setSending] = useState(false)

    const [reqForm, setReqForm] = useState({
        offeredSkillId: '',
        requestedSkillId: '',
        message: '',
    })
    const [reqErrors, setReqErrors] = useState({})

    useEffect(() => {
        if (id === user?.id) { navigate('/profile', { replace: true }); return }

        const fetchUserData = async () => {
            setLoading(true)
            try {
                const [p, s, my] = await Promise.all([
                    profileService.getProfile(id),
                    skillsService.getUserSkills(id),
                    skillsService.getUserSkills(user.id),
                ])
                if (!p) { navigate('/browse', { replace: true }); return }
                setProfile(p)
                setSkills(s)
                setMySkills(my)
            } catch (err) {
                console.error(err)
                navigate('/browse', { replace: true })
            } finally {
                setLoading(false)
            }
        }
        if (user?.id) fetchUserData()
    }, [id, user?.id, navigate])

    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setShowModal(false) }
        if (showModal) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [showModal])

    const offerSkills = skills.filter(s => s.type === 'offer')
    const wantSkills = skills.filter(s => s.type === 'want')
    const myOfferSkills = mySkills.filter(s => s.type === 'offer')

    const canExchange = myOfferSkills.length > 0
    const theyHaveSkills = offerSkills.length > 0

    const initials = profile?.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??'

    const validateReq = () => {
        const errs = {}
        if (!reqForm.offeredSkillId) errs.offeredSkillId = 'Select a skill you offer'
        if (!reqForm.requestedSkillId) errs.requestedSkillId = 'Select a skill you want from them'
        setReqErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSendRequest = async (e) => {
        e.preventDefault()
        if (!validateReq()) return
        setSending(true)
        try {
            await exchangeService.sendRequest({
                senderId: user.id,
                receiverId: id,
                offeredSkillId: reqForm.offeredSkillId,
                requestedSkillId: reqForm.requestedSkillId,
                message: reqForm.message,
            })
            toast.success('Request sent! 🎉')
            setShowModal(false)
            setReqForm({ offeredSkillId: '', requestedSkillId: '', message: '' })
        } catch (err) {
            toast.error(err.message || 'Failed to send request')
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>
    }

    if (!profile) return null

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 font-sans">
            {/* Header / Info card */}
            <div className="card">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0 self-center sm:self-start">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 border border-slate-200 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 border border-slate-200 bg-slate-100 text-blue-600 flex items-center justify-center font-bold text-lg rounded-full">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold text-slate-800 tracking-tight">{profile.name || 'Anonymous User'}</h1>
                        {profile.location && (
                            <p className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {profile.location}
                            </p>
                        )}
                        {profile.bio ? (
                            <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{profile.bio}</p>
                        ) : (
                            <p className="text-xs text-slate-500 italic mt-3">No biography recorded on profile yet.</p>
                        )}
                        {/* Social links */}
                        <div className="flex flex-wrap gap-3 mt-4 text-[12.5px] font-bold">
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                                    className="border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-md text-slate-600 hover:text-slate-800 transition-colors">
                                    GitHub
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                                    className="border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-md text-slate-600 hover:text-blue-600 transition-colors">
                                    LinkedIn
                                </a>
                            )}
                            {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                                    className="border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-md text-slate-600 hover:text-slate-850 transition-colors">
                                    Website
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Exchange Trigger */}
                    <div className="flex-shrink-0 relative group w-full sm:w-auto">
                        <button
                            onClick={() => canExchange && theyHaveSkills && setShowModal(true)}
                            disabled={!canExchange || !theyHaveSkills}
                            className={`w-full btn btn-sm ${canExchange && theyHaveSkills ? 'btn-primary' : 'btn-ghost border-slate-200 text-slate-600'}`}
                            aria-disabled={!canExchange || !theyHaveSkills}
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            Initiate Exchange
                        </button>
                        {/* Boxy help tooltip */}
                        {(!canExchange || !theyHaveSkills) && (
                            <div className="mt-2 border border-red-100 bg-red-50 text-red-600 text-[11.5px] p-2.5 rounded-lg leading-tight uppercase font-semibold">
                                {!canExchange
                                    ? "Add offered skills on your profile first to propose an exchange."
                                    : "This user has not listed any skills they can teach yet."}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="card">
                    <h3 className="text-xs uppercase font-bold text-slate-700 border-b border-slate-100 pb-2.5 mb-4">
                        🎓 Skills They Can Teach
                    </h3>
                    {offerSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {offerSkills.map(s => <SkillBadge key={s.id} skill={s} />)}
                        </div>
                    ) : (
                        <EmptyState icon={User} title="No skills offered" />
                    )}
                </div>
                <div className="card">
                    <h3 className="text-xs uppercase font-bold text-slate-700 border-b border-slate-100 pb-2.5 mb-4">
                        📖 Skills They Want to Learn
                    </h3>
                    {wantSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {wantSkills.map(s => <SkillBadge key={s.id} skill={{ ...s, type: 'want' }} />)}
                        </div>
                    ) : (
                        <EmptyState icon={User} title="No wanted skills" />
                    )}
                </div>
            </div>

            {/* Request Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 w-full max-w-md shadow-lg rounded-xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                            <h2 className="text-sm font-semibold text-slate-800">Send Exchange Request</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-900 font-bold text-sm">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSendRequest} className="p-5 space-y-4">
                            {/* Offered */}
                            <div>
                                <label className="label">Skill you will teach them</label>
                                <select
                                    value={reqForm.offeredSkillId}
                                    onChange={e => { setReqForm(f => ({ ...f, offeredSkillId: e.target.value })); setReqErrors(r => ({ ...r, offeredSkillId: '' })) }}
                                    className={`input ${reqErrors.offeredSkillId ? 'input-error' : ''}`}
                                >
                                    <option value="">Select a skill you offer...</option>
                                    {myOfferSkills.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                    ))}
                                </select>
                                {reqErrors.offeredSkillId && <p className="error-text">{reqErrors.offeredSkillId}</p>}
                                {myOfferSkills.length === 0 && (
                                    <p className="error-text">No offerings added. <Link to="/profile" className="underline" onClick={() => setShowModal(false)}>Configure profile.</Link></p>
                                )}
                            </div>

                            {/* Wanted */}
                            <div>
                                <label className="label">Skill you want to learn from them</label>
                                <select
                                    value={reqForm.requestedSkillId}
                                    onChange={e => { setReqForm(f => ({ ...f, requestedSkillId: e.target.value })); setReqErrors(r => ({ ...r, requestedSkillId: '' })) }}
                                    className={`input ${reqErrors.requestedSkillId ? 'input-error' : ''}`}
                                >
                                    <option value="">Select a skill they offer...</option>
                                    {offerSkills.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                    ))}
                                </select>
                                {reqErrors.requestedSkillId && <p className="error-text">{reqErrors.requestedSkillId}</p>}
                                {offerSkills.length === 0 && (
                                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-2 mt-1 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11.5px] text-amber-900/90 font-medium">This user specifies zero offered skills.</p>
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="label">Optional Message</label>
                                <textarea
                                    rows={3}
                                    placeholder="Introduce yourself and describe what you want to learn..."
                                    value={reqForm.message}
                                    onChange={e => setReqForm(f => ({ ...f, message: e.target.value }))}
                                    className="input resize-none"
                                    maxLength={500}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-sm btn-ghost">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={sending || offerSkills.length === 0}
                                    className="flex-1 btn btn-sm btn-primary"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {sending ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
