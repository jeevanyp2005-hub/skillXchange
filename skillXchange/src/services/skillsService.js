import { supabase } from '../lib/supabaseClient'

export const skillsService = {
    async getUserSkills(userId) {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    async addSkill(userId, skill) {
        // Check for duplicate
        const { data: existing } = await supabase
            .from('skills')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', skill.name.trim())
            .eq('type', skill.type)
            .single()

        if (existing) {
            throw new Error(`You already have "${skill.name}" in your ${skill.type === 'offer' ? 'offered' : 'wanted'} skills.`)
        }

        const { data, error } = await supabase
            .from('skills')
            .insert({
                user_id: userId,
                name: skill.name.trim(),
                type: skill.type,
                category: skill.category || 'General',
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateSkill(skillId, updates) {
        const { data, error } = await supabase
            .from('skills')
            .update(updates)
            .eq('id', skillId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteSkill(skillId) {
        const { error } = await supabase
            .from('skills')
            .delete()
            .eq('id', skillId)

        if (error) throw error
    },
}
