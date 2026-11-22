import { useState, useEffect, useCallback, useRef } from 'react'
import { profileService } from '../services/profileService'
import { useAuth } from './useAuth'

// Module-level cache — survives page navigation, wiped on logout
const profileCache = new Map()

export function clearProfileCache() {
    profileCache.clear()
}

export function useProfile(userId = null) {
    const { user } = useAuth()
    const targetId = userId || user?.id
    const cached = targetId ? profileCache.get(targetId) : null
    const [profile, setProfile] = useState(cached ?? null)
    const [loading, setLoading] = useState(!cached) // instant if already cached
    const [error, setError] = useState(null)
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = true
        return () => { isMounted.current = false }
    }, [])

    const fetchProfile = useCallback(async (background = false) => {
        if (!targetId) { setLoading(false); return }
        if (!background) setLoading(true)
        try {
            setError(null)
            const data = await profileService.getProfile(targetId)
            if (!isMounted.current) return
            profileCache.set(targetId, data)
            setProfile(data)
        } catch (err) {
            if (isMounted.current) setError(err.message)
        } finally {
            if (isMounted.current && !background) setLoading(false)
            else if (isMounted.current) setLoading(false)
        }
    }, [targetId])

    useEffect(() => {
        if (!targetId) { setLoading(false); return }
        if (profileCache.has(targetId)) {
            // Show cached data instantly, silently revalidate in background
            fetchProfile(true)
        } else {
            fetchProfile(false)
        }
    }, [fetchProfile, targetId])

    const refresh = () => {
        profileCache.delete(targetId)
        fetchProfile(false)
    }

    return { profile, loading, error, refresh, setProfile }
}
