import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { profileService } from '../services/profileService'
import ProfileCard from '../components/ProfileCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Search, Users } from 'lucide-react'

export default function Browse() {
    const { user } = useAuth()
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350)
        return () => clearTimeout(t)
    }, [search])

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const data = await profileService.getAllProfiles(debouncedSearch)
                // Filter out the current user from results
                setProfiles(data.filter(p => p.id !== user?.id))
            } catch (err) {
                console.error('Browse fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [debouncedSearch, user?.id])

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 mb-6">
                <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Discover Profiles</h1>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">Search for peers by name, skills, or location details</p>
            </div>

            {/* Search input line */}
            <div className="relative mb-6 max-w-lg">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by keywords..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input pl-10 pr-10"
                            id="browse-search"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 font-bold"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results count text logs */}
            {!loading && profiles.length > 0 && (
                <div className="text-[12.5px] text-slate-600 mb-4 font-semibold border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg w-fit uppercase">
                    Registry: {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'} loaded
                    {debouncedSearch && <span> matching "{debouncedSearch}"</span>}
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : profiles.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profiles.map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Users}
                    title={debouncedSearch ? 'No matching profiles' : 'Directory is empty'}
                    description={
                        debouncedSearch
                            ? `No database profiles matched "${debouncedSearch}". Re-evaluate search keywords.`
                            : 'No other user profiles are recorded on the platform yet.'
                    }
                />
            )}
        </div>
    )
}
