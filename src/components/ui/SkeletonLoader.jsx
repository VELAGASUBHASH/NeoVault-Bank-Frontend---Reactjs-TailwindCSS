export function SkeletonCard() {
    return (
        <div className="glass-card p-5 space-y-3">
            <div className="shimmer h-4 w-24 rounded-lg" />
            <div className="shimmer h-8 w-40 rounded-lg" />
            <div className="shimmer h-3 w-32 rounded-lg" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="shimmer h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="shimmer h-4 w-3/4 rounded-lg" />
                        <div className="shimmer h-3 w-1/2 rounded-lg" />
                    </div>
                    <div className="shimmer h-4 w-20 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonText({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`shimmer h-4 rounded-lg ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
            ))}
        </div>
    );
}