export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-7 h-7 border-2',
        lg: 'w-10 h-10 border-3',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizes[size]} rounded-full border-slate-200 border-t-blue-600 animate-spin`}
                role="status"
                aria-label="Loading"
            />
        </div>
    )
}
