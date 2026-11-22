import { useState } from 'react'
import { X } from 'lucide-react'

export default function SkillBadge({ skill, onDelete, size = 'md' }) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const isOffer = skill.type === 'offer'

    const typeClasses = isOffer ? 'badge-blue' : 'badge-green'

    const sizeClasses = size === 'sm'
        ? 'text-[11px] px-2.5 py-0.5 rounded-full'
        : 'text-xs px-3 py-1 rounded-full'

    const handleDeleteClick = () => {
        if (confirmDelete) {
            onDelete(skill.id)
            setConfirmDelete(false)
        } else {
            setConfirmDelete(true)
        }
    }

    if (confirmDelete && onDelete) {
        return (
            <span className="inline-flex items-center gap-2 border border-red-200 bg-red-50 text-red-600 px-3 py-1 text-xs font-sans rounded-full">
                <span>Remove {skill.name}?</span>
                <button
                    onClick={handleDeleteClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-full font-semibold text-[11px]"
                    title="Confirm remove"
                    aria-label={`Confirm remove ${skill.name}`}
                >
                    Confirm
                </button>
                <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-600 hover:text-slate-800 text-xs"
                    title="Cancel"
                    aria-label="Cancel remove"
                >
                    Cancel
                </button>
            </span>
        )
    }

    return (
        <span
            className={`badge items-center gap-1.5 transition-all ${typeClasses} ${sizeClasses}`}
        >
            <span className="opacity-70">{isOffer ? '🎓' : '📖'}</span>
            <span className="font-medium">{skill.name}</span>
            {onDelete && (
                <button
                    onClick={handleDeleteClick}
                    className="ml-1 text-slate-500 hover:text-red-600 rounded-full p-0.5 hover:bg-black/5 transition-colors"
                    title="Remove skill"
                    aria-label={`Remove ${skill.name}`}
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    )
}
