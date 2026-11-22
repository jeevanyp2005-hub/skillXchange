import { supabase } from '../lib/supabaseClient'

export const exchangeService = {
    async sendRequest({ senderId, receiverId, offeredSkillId, requestedSkillId, message }) {
        // Check if a pending request already exists between these users for same skills
        const { data: existing } = await supabase
            .from('exchange_requests')
            .select('id')
            .eq('sender_id', senderId)
            .eq('receiver_id', receiverId)
            .eq('offered_skill_id', offeredSkillId)
            .eq('requested_skill_id', requestedSkillId)
            .in('status', ['pending', 'accepted'])
            .single()

        if (existing) {
            throw new Error('You already have an active request with this user for these skills.')
        }

        const { data, error } = await supabase
            .from('exchange_requests')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                offered_skill_id: offeredSkillId,
                requested_skill_id: requestedSkillId,
                message: message || '',
                status: 'pending',
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getIncomingRequests(userId) {
        const { data, error } = await supabase
            .from('exchange_requests')
            .select(`
        *,
        sender:profiles!exchange_requests_sender_id_fkey (id, name, avatar_url, location),
        offered_skill:skills!exchange_requests_offered_skill_id_fkey (id, name, category),
        requested_skill:skills!exchange_requests_requested_skill_id_fkey (id, name, category)
      `)
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async getOutgoingRequests(userId) {
        const { data, error } = await supabase
            .from('exchange_requests')
            .select(`
        *,
        receiver:profiles!exchange_requests_receiver_id_fkey (id, name, avatar_url, location),
        offered_skill:skills!exchange_requests_offered_skill_id_fkey (id, name, category),
        requested_skill:skills!exchange_requests_requested_skill_id_fkey (id, name, category)
      `)
            .eq('sender_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async updateRequestStatus(requestId, status) {
        const { data, error } = await supabase
            .from('exchange_requests')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async withdrawRequest(requestId) {
        const { error } = await supabase
            .from('exchange_requests')
            .delete()
            .eq('id', requestId)
            .eq('status', 'pending') // safety guard: only delete if still pending

        if (error) throw error
    },

    async getPendingIncomingCount(userId) {
        const { count, error } = await supabase
            .from('exchange_requests')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('status', 'pending')

        if (error) return 0
        return count || 0
    },

    async getActiveExchanges(userId) {
        const { data, error } = await supabase
            .from('exchange_requests')
            .select(`
        *,
        sender:profiles!exchange_requests_sender_id_fkey (id, name, avatar_url),
        receiver:profiles!exchange_requests_receiver_id_fkey (id, name, avatar_url),
        offered_skill:skills!exchange_requests_offered_skill_id_fkey (id, name, category),
        requested_skill:skills!exchange_requests_requested_skill_id_fkey (id, name, category)
      `)
            .eq('status', 'accepted')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data || []
    },
}
