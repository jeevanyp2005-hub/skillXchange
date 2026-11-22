import { supabase } from '../lib/supabaseClient'

export const profileService = {
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error && error.code !== 'PGRST116') throw error  // PGRST116 = no rows
        return data || null
    },

    async upsertProfile(userId, profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() }, { onConflict: 'id' })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getAllProfiles(search = '') {
        let query = supabase
            .from('profiles')
            .select(`
        *,
        skills (id, name, type, category)
      `)
            .order('created_at', { ascending: false })

        if (search) {
            query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%,location.ilike.%${search}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    async searchProfilesBySkill(skillName) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        skills!inner (id, name, type, category)
      `)
            .ilike('skills.name', `%${skillName}%`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },
}
