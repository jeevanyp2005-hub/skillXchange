import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { exchangeService } from '../services/exchangeService'
import RequestCard from '../components/RequestCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { ArrowLeftRight, Inbox, Send, Zap } from 'lucide-react'

const TABS = [
    { id: 'incoming', label: 'Incoming Logs', icon: Inbox },
    { id: 'outgoing', label: 'Outgoing Logs', icon: Send },
    { id: 'active', label: 'Active Links', icon: Zap },
]

export default function Requests() {
    const { user } = useAuth()
    const [tab, setTab] = useState('incoming')
    const [incoming, setIncoming] = useState([])
    const [outgoing, setOutgoing] = useState([])
    const [active, setActive] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchAll = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const [inc, out, act] = await Promise.all([
                exchangeService.getIncomingRequests(user.id),
                exchangeService.getOutgoingRequests(user.id),
                exchangeService.getActiveExchanges(user.id),
            ])
            setIncoming(inc)
            setOutgoing(out)
            setActive(act)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { fetchAll() }, [fetchAll])

    const pendingIncoming = incoming.filter(r => r.status === 'pending')

    const tabData = {
        incoming: { requests: incoming, emptyTitle: 'Incoming queue empty', emptyDesc: 'No exchange requests directed to your profile yet.' },
        outgoing: { requests: outgoing, emptyTitle: 'Outgoing queue empty', emptyDesc: 'You have not dispatched any exchange requests.' },
        active: { requests: active, emptyTitle: 'Active exchanges empty', emptyDesc: 'Accept a request to establish exchange channels.' },
    }

    const { requests, emptyTitle, emptyDesc } = tabData[tab]

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 mb-6">
                <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Exchange Manager</h1>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">Monitor incoming requests and manage active transaction links</p>
            </div>

            {/* Tab Bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const isActive = tab === id
                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                            {id === 'incoming' && pendingIncoming.length > 0 && (
                                <span className="border border-red-200 bg-red-50 text-red-600 text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                                    {pendingIncoming.length} new
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* List log content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : requests.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    {requests.map(req => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            type={tab === 'incoming' ? 'incoming' : tab === 'outgoing' ? 'outgoing' : (req.sender_id === user.id ? 'outgoing' : 'incoming')}
                            onUpdate={fetchAll}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={ArrowLeftRight}
                    title={emptyTitle}
                    description={emptyDesc}
                />
            )}
        </div>
    )
}
