import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { skillsService } from '../services/skillsService'
import { profileService } from '../services/profileService'
import SkillBadge from '../components/SkillBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Github, Linkedin, MapPin, Plus, Save, Link as LinkIcon, Image, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const SKILL_CATEGORIES = ['Programming', 'Design', 'Marketing', 'Music', 'Language', 'Business', 'Science', 'Other']

function validateUrl(url, required = false) {
    if (!url) return required ? 'This field is required' : ''
    try { new URL(url); return '' } catch { return 'Enter a valid URL (e.g. https://...)' }
}

const EMPTY_FORM = { name: '', bio: '', location: '', github_url: '', linkedin_url: '', website_url: '', twitter_url: '', avatar_url: '' }

export default function Profile() {
    const { user } = useAuth()
    const { profile, loading: profileLoading, refresh: refreshProfile } = useProfile()
    const [skills, setSkills] = useState([])
    const [skillsLoading, setSkillsLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const [form, setForm] = useState(EMPTY_FORM)
    const [formErrors, setFormErrors] = useState({})

    // Separate skill forms for each section
    const [offerForm, setOfferForm] = useState({ name: '', category: 'Programming' })
    const [offerError, setOfferError] = useState('')
    const [addingOffer, setAddingOffer] = useState(false)

    const [wantForm, setWantForm] = useState({ name: '', category: 'Programming' })
    const [wantError, setWantError] = useState('')
    const [addingWant, setAddingWant] = useState(false)

    // Sync form from profile
    useEffect(() => {
        if (profile && !editMode) {
            setForm({
                name: profile.name || '',
                bio: profile.bio || '',
                location: profile.location || '',
                github_url: profile.github_url || '',
                linkedin_url: profile.linkedin_url || '',
                website_url: profile.website_url || '',
                twitter_url: profile.twitter_url || '',
                avatar_url: profile.avatar_url || '',
            })
        }
    }, [profile, editMode])

    const fetchSkills = useCallback(async () => {
        if (!user) return
        try {
            const data = await skillsService.getUserSkills(user.id)
            setSkills(data)
        } catch (err) {
            console.error(err)
        } finally {
            setSkillsLoading(false)
        }
    }, [user])

    useEffect(() => { fetchSkills() }, [fetchSkills])

    const validateForm = () => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Name is required'
        if (!form.github_url) errs.github_url = 'GitHub profile URL is required'
        else { const e = validateUrl(form.github_url, true); if (e) errs.github_url = e }
        if (!form.linkedin_url) errs.linkedin_url = 'LinkedIn profile URL is required'
        else { const e = validateUrl(form.linkedin_url, true); if (e) errs.linkedin_url = e }
        if (form.website_url) { const e = validateUrl(form.website_url); if (e) errs.website_url = e }
        if (form.twitter_url) { const e = validateUrl(form.twitter_url); if (e) errs.twitter_url = e }
        if (form.avatar_url) { const e = validateUrl(form.avatar_url); if (e) errs.avatar_url = e }
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSaveProfile = async (e) => {
        e?.preventDefault()
        if (!validateForm()) return
        setSaving(true)
        try {
            await profileService.upsertProfile(user.id, form)
            await refreshProfile()
            setEditMode(false)
            setIsDirty(false)
            toast.success('Profile saved!')
        } catch (err) {
            toast.error(err.message || 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (isDirty) {
            if (!window.confirm('Discard unsaved changes?')) return
        }
        setForm({
            name: profile?.name || '',
            bio: profile?.bio || '',
            location: profile?.location || '',
            github_url: profile?.github_url || '',
            linkedin_url: profile?.linkedin_url || '',
            website_url: profile?.website_url || '',
            twitter_url: profile?.twitter_url || '',
            avatar_url: profile?.avatar_url || '',
        })
        setEditMode(false)
        setIsDirty(false)
        setFormErrors({})
    }

    const handleFieldChange = (name, value) => {
        setForm(f => ({ ...f, [name]: value }))
        setIsDirty(true)
    }

    const handleAddSkill = async (type, skillForm, setSkillForm, setError, setAdding) => {
        if (!skillForm.name.trim()) { setError('Skill name is required'); return }
        setError('')
        setAdding(true)
        try {
            const newSkill = await skillsService.addSkill(user.id, { ...skillForm, type })
            setSkills(prev => [newSkill, ...prev])
            setSkillForm({ name: '', category: 'Programming' })
            toast.success('Skill added!')
        } catch (err) {
            setError(err.message)
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteSkill = async (skillId) => {
        try {
            await skillsService.deleteSkill(skillId)
            setSkills(prev => prev.filter(s => s.id !== skillId))
            toast.success('Skill removed')
        } catch (err) {
            toast.error('Failed to remove skill')
        }
    }

    const offerSkills = skills.filter(s => s.type === 'offer')
    const wantSkills = skills.filter(s => s.type === 'want')

    if (profileLoading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>
    }

    const profileField = (icon, label, name, placeholder, required = false) => (
        <div key={name}>
            <label htmlFor={name} className="label">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
                {name === 'bio' ? (
                    <textarea
                        id={name}
                        rows={3}
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={e => handleFieldChange(name, e.target.value)}
                        disabled={!editMode}
                        className={`input pl-10 resize-none ${formErrors[name] ? 'input-error' : ''} disabled:bg-slate-50 disabled:text-slate-600`}
                    />
                ) : (
                    <input
                        id={name}
                        type="text"
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={e => handleFieldChange(name, e.target.value)}
                        disabled={!editMode}
                        className={`input pl-10 ${formErrors[name] ? 'input-error' : ''} disabled:bg-slate-50 disabled:text-slate-600`}
                    />
                )}
            </div>
            {formErrors[name] && <p className="error-text">{formErrors[name]}</p>}
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 font-sans">
            {/* Header / Config controls */}
            <div className="card">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h2 className="text-sm font-semibold text-slate-800">Profile Configuration</h2>
                    {!editMode ? (
                        <button onClick={() => setEditMode(true)} className="btn btn-sm btn-secondary">
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleCancel} className="btn btn-sm btn-ghost">Cancel</button>
                            <button onClick={handleSaveProfile} disabled={saving} className="btn btn-sm btn-primary">
                                <Save className="w-3.5 h-3.5" />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Avatar preview */}
                {form.avatar_url && (
                    <div className="flex justify-center mb-5">
                        <img
                            src={form.avatar_url}
                            alt="Avatar preview"
                            className="w-16 h-16 border border-slate-200 rounded-full object-cover"
                            onError={e => { e.target.style.display = 'none' }}
                        />
                    </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
                    {profileField(<User className="w-4 h-4" />, 'Full Name', 'name', 'Your name')}
                    {profileField(<MapPin className="w-4 h-4" />, 'Location', 'location', 'City, Country')}
                    {profileField(<User className="w-4 h-4" />, 'Biography', 'bio', 'Tell others about yourself')}
                    
                    <div className="divider my-4" />
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Social Credentials</p>
                    {profileField(<Github className="w-4 h-4" />, 'GitHub Profile Link', 'github_url', 'https://github.com/username', true)}
                    {profileField(<Linkedin className="w-4 h-4" />, 'LinkedIn Profile Link', 'linkedin_url', 'https://linkedin.com/in/username', true)}
                    {profileField(<Globe className="w-4 h-4" />, 'Personal Website', 'website_url', 'https://yoursite.com')}
                    {profileField(<LinkIcon className="w-4 h-4" />, 'Twitter / X Link', 'twitter_url', 'https://twitter.com/username')}
                    
                    <div className="divider my-4" />
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Avatar Settings</p>
                    {profileField(<Image className="w-4 h-4" />, 'Image Url', 'avatar_url', 'https://example.com/avatar.jpg')}
                </form>
            </div>

            {/* Skills Management */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* Skills I Know */}
                <div className="card">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <h2 className="text-xs uppercase font-bold text-slate-700">Skills I Know</h2>
                    </div>

                    {/* Add offer skill */}
                    <div className="border border-blue-100 bg-blue-50/10 p-3 rounded-lg mb-4 space-y-2">
                        <input
                            type="text"
                            placeholder="Add a skill you offer..."
                            value={offerForm.name}
                            onChange={e => { setOfferForm(f => ({ ...f, name: e.target.value })); setOfferError('') }}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('offer', offerForm, setOfferForm, setOfferError, setAddingOffer))}
                            className={`input ${offerError ? 'input-error' : ''}`}
                            maxLength={50}
                        />
                        <div className="flex gap-2">
                            <select
                                value={offerForm.category}
                                onChange={e => setOfferForm(f => ({ ...f, category: e.target.value }))}
                                className="input flex-1"
                            >
                                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                type="button"
                                disabled={addingOffer}
                                onClick={() => handleAddSkill('offer', offerForm, setOfferForm, setOfferError, setAddingOffer)}
                                className="btn btn-sm btn-secondary flex-shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </button>
                        </div>
                        {offerError && <p className="error-text">{offerError}</p>}
                    </div>

                    {/* Offer list */}
                    {skillsLoading ? <LoadingSpinner /> : (
                        offerSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {offerSkills.map(s => (
                                    <SkillBadge key={s.id} skill={s} onDelete={handleDeleteSkill} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 italic">No offered skills registered.</p>
                        )
                    )}
                </div>

                {/* Skills I Want to Learn */}
                <div className="card">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <h2 className="text-xs uppercase font-bold text-slate-700">Skills I Want to Learn</h2>
                    </div>

                    {/* Add want skill */}
                    <div className="border border-emerald-100 bg-emerald-50/10 p-3 rounded-lg mb-4 space-y-2">
                        <input
                            type="text"
                            placeholder="Add a skill you want to learn..."
                            value={wantForm.name}
                            onChange={e => { setWantForm(f => ({ ...f, name: e.target.value })); setWantError('') }}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('want', wantForm, setWantForm, setWantError, setAddingWant))}
                            className={`input ${wantError ? 'input-error' : ''}`}
                            maxLength={50}
                        />
                        <div className="flex gap-2">
                            <select
                                value={wantForm.category}
                                onChange={e => setWantForm(f => ({ ...f, category: e.target.value }))}
                                className="input flex-1"
                            >
                                {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button
                                type="button"
                                disabled={addingWant}
                                onClick={() => handleAddSkill('want', wantForm, setWantForm, setWantError, setAddingWant)}
                                className="btn btn-sm btn-secondary flex-shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add
                            </button>
                        </div>
                        {wantError && <p className="error-text">{wantError}</p>}
                    </div>

                    {/* Want list */}
                    {skillsLoading ? <LoadingSpinner /> : (
                        wantSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {wantSkills.map(s => (
                                    <SkillBadge key={s.id} skill={{ ...s, type: 'want' }} onDelete={handleDeleteSkill} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 italic">No wanted skills registered.</p>
                        )
                    )}
                </div>

            </div>
        </div>
    )
}
