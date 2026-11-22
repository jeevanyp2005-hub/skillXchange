import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import SkillBadge from './SkillBadge'

export default function ProfileCard({ profile }) {
    const offerSkills = profile.skills?.filter(s => s.type === 'offer') || []
    const wantSkills = profile.skills?.filter(s => s.type === 'want') || []

    const initials = profile.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??'

    return (
        <div className="card-hover block p-5 border border-slate-200 bg-white text-slate-600 rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="flex-shrink-0">
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="w-12 h-12 border border-slate-200 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 border border-slate-200 bg-slate-50 text-blue-600 flex items-center justify-center font-bold text-sm rounded-full">
                            {initials}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 truncate">
                        {profile.name || 'Anonymous User'}
                    </h3>
                    {profile.location && (
                        <p className="flex items-center gap-1 text-[12.5px] text-slate-600 mt-0.5">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-slate-500" />
                            <span className="truncate">{profile.location}</span>
                        </p>
                    )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {profile.github_url && (
                        <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-800 transition-colors"
                            title="GitHub"
                        >
                            GH
                        </a>
                    )}
                    {profile.linkedin_url && (
                        <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="LinkedIn"
                        >
                            LN
                        </a>
                    )}
                </div>
            </div>

            {/* Bio */}
            {profile.bio ? (
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {profile.bio}
                </p>
            ) : (
                <p className="text-xs text-slate-500 italic mb-4">No biography available</p>
            )}

            {/* Skills */}
            <div className="space-y-3">
                {offerSkills.length > 0 && (
                    <div>
                        <div className="text-[11.5px] font-semibold text-blue-600 tracking-wider mb-1.5 uppercase">
                            Can Teach
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {offerSkills.slice(0, 3).map(skill => (
                                <SkillBadge key={skill.id} skill={skill} size="sm" />
                            ))}
                            {offerSkills.length > 3 && (
                                <span className="border border-blue-100 bg-blue-50/50 text-[#2563eb] text-[11px] px-2 py-0.5 font-medium rounded-full">
                                    +{offerSkills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {wantSkills.length > 0 && (
                    <div>
                        <div className="text-[11.5px] font-semibold text-emerald-600 tracking-wider mb-1.5 uppercase">
                            Wants to Learn
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {wantSkills.slice(0, 3).map(skill => (
                                <SkillBadge key={skill.id} skill={{ ...skill, type: 'want' }} size="sm" />
                            ))}
                            {wantSkills.length > 3 && (
                                <span className="border border-emerald-100 bg-emerald-50/50 text-[#059669] text-[11px] px-2 py-0.5 font-medium rounded-full">
                                    +{wantSkills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
                <Link
                    to={`/users/${profile.id}`}
                    className="btn btn-sm w-full text-center block btn-secondary"
                >
                    View Profile
                </Link>
            </div>
        </div>
    )
}
