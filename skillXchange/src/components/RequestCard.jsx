import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, Trophy, Clock, MapPin, Trash2, ArrowRight } from 'lucide-react'
import { exchangeService } from '../services/exchangeService'
import toast from 'react-hot-toast'

const STATUS_TEXT_COLORS = {
    pending: 'text-amber-600 border-amber-200 bg-amber-50',
    accepted: 'text-blue-600 border-blue-200 bg-blue-50',
    rejected: 'text-red-600 border-red-200 bg-red-50',
    completed: 'text-emerald-600 border-emerald-200 bg-emerald-50',
}

const STATUS_LABELS = {
    pending: 'PENDING',
    accepted: 'ACTIVE',
    rejected: 'DECLINED',
    completed: 'COMPLETED',
}

export default function RequestCard({ request, type, onUpdate }) {
    const [loading, setLoading] = useState(false)
    const [confirmWithdraw, setConfirmWithdraw] = useState(false)

    // Auto-reset withdraw confirm after 4s
    useEffect(() => {
        if (!confirmWithdraw) return
        const t = setTimeout(() => setConfirmWithdraw(false), 4000)
        return () => clearTimeout(t)
    }, [confirmWithdraw])

    const otherUser = type === 'incoming' ? request.sender : request.receiver

    const initials = otherUser?.name
        ? otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??'

    const handleAction = async (status) => {
        setLoading(true)
        try {
            await exchangeService.updateRequestStatus(request.id, status)
            const messages = {
                accepted: 'Request accepted! 🎉',
                rejected: 'Request declined.',
                completed: 'Exchange marked as completed! 🏆',
            }
            toast.success(messages[status])
            onUpdate?.()
        } catch (err) {
            toast.error(err.message || 'Failed to update request')
        } finally {
            setLoading(false)
        }
    }

    const handleWithdraw = async () => {
        setLoading(true)
        try {
            await exchangeService.withdrawRequest(request.id)
            toast.success('Request withdrawn.')
            onUpdate?.()
        } catch (err) {
            toast.error(err.message || 'Failed to withdraw request')
        } finally {
            setLoading(false)
            setConfirmWithdraw(false)
        }
    }

    return (
        <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm font-sans text-slate-600">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
                <div className="flex items-center gap-2.5">
                    <Link to={`/users/${otherUser?.id}`} className="flex-shrink-0">
                        {otherUser?.avatar_url ? (
                            <img src={otherUser.avatar_url} alt={otherUser.name} className="w-10 h-10 border border-slate-200 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 border border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs rounded-full">
                                {initials}
                            </div>
                        )}
                    </Link>
                    <div>
                        <Link to={`/users/${otherUser?.id}`} className="font-semibold text-sm text-slate-800 hover:text-blue-600 transition-colors">
                            {otherUser?.name || 'Unknown User'}
                        </Link>
                        {otherUser?.location && (
                            <p className="flex items-center gap-1 text-[11.5px] text-slate-600 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {otherUser.location}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`border px-2.5 py-0.5 text-[11px] font-bold rounded-full tracking-wider ${STATUS_TEXT_COLORS[request.status]}`}>
                    {STATUS_LABELS[request.status]}
                </span>
            </div>

            {/* Skill Exchange flow info box */}
            <div className="border border-slate-100 bg-slate-50 p-3 rounded-lg mb-3.5 text-xs">
                <div className="grid grid-cols-5 items-center gap-2">
                    <div className="col-span-2 min-w-0">
                        <span className="text-[11px] text-slate-600 uppercase font-semibold block mb-0.5">
                            {type === 'incoming' ? 'They Offer' : 'You Offer'}
                        </span>
                        <span className="text-slate-800 font-semibold block truncate">
                            {request.offered_skill?.name}
                        </span>
                    </div>
                    <div className="text-center flex justify-center text-slate-500">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="col-span-2 min-w-0 text-right">
                        <span className="text-[11px] text-slate-600 uppercase font-semibold block mb-0.5">
                            {type === 'incoming' ? 'They Want' : 'You Want'}
                        </span>
                        <span className="text-slate-800 font-semibold block truncate">
                            {request.requested_skill?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Message */}
            {request.message && (
                <div className="text-xs text-slate-600 border-l-2 border-blue-500 pl-2.5 py-0.5 mb-3.5 italic bg-blue-50/30 rounded-r">
                    "{request.message}"
                </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-600 mb-4 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Sent on {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Actions — Incoming pending: Accept / Decline */}
            {type === 'incoming' && request.status === 'pending' && (
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                    <button
                        onClick={() => handleAction('accepted')}
                        disabled={loading}
                        className="flex-1 btn btn-sm btn-primary"
                    >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                    </button>
                    <button
                        onClick={() => handleAction('rejected')}
                        disabled={loading}
                        className="flex-1 btn btn-sm btn-danger"
                    >
                        <X className="w-3.5 h-3.5" />
                        Decline
                    </button>
                </div>
            )}

            {/* Actions — Outgoing pending: Withdraw (two-step confirm) */}
            {type === 'outgoing' && request.status === 'pending' && (
                <div className="border-t border-slate-100 pt-4">
                    {confirmWithdraw ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleWithdraw}
                                disabled={loading}
                                className="flex-1 btn btn-sm btn-danger"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {loading ? 'Saving...' : 'Confirm Withdraw'}
                            </button>
                            <button
                                onClick={() => setConfirmWithdraw(false)}
                                disabled={loading}
                                className="flex-1 btn btn-sm btn-ghost"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmWithdraw(true)}
                            disabled={loading}
                            className="w-full btn btn-sm btn-danger"
                        >
                            <X className="w-3.5 h-3.5" />
                            Withdraw Request
                        </button>
                    )}
                </div>
            )}

            {/* Actions — Mark as Completed */}
            {request.status === 'accepted' && (
                <div className="border-t border-slate-100 pt-4">
                    <button
                        onClick={() => handleAction('completed')}
                        disabled={loading}
                        className="w-full btn btn-sm btn-secondary"
                    >
                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                        Mark as Completed
                    </button>
                </div>
            )}
        </div>
    )
}
