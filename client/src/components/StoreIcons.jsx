export function PlayStoreIcon({ size = 20, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M3.609 1.814L13.793 12 3.61 22.186a1.94 1.94 0 0 1-.61-1.428V3.242c0-.555.225-1.058.609-1.428z" fill="#00D2FF"/>
            <path d="M17.156 8.636l-3.363 3.364 3.363 3.364 3.821-2.184c.833-.476.833-1.258 0-1.734l-3.821-2.81z" fill="#FFD200"/>
            <path d="M13.793 12L3.609 1.814A1.927 1.927 0 0 1 4.707 1.5c.348 0 .695.093.998.266l11.451 6.544L13.793 12z" fill="#00F076"/>
            <path d="M13.793 12l3.363 3.364-11.451 6.544a1.99 1.99 0 0 1-.998.266 1.927 1.927 0 0 1-1.098-.314L13.793 12z" fill="#FF3A44"/>
        </svg>
    );
}

export function AppStoreIcon({ size = 20, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-1 .04-2.22.67-2.92 1.49-.63.73-1.18 1.9-1.03 3.02 1.12.09 2.29-.57 2.96-1.39z"/>
        </svg>
    );
}

export function StoreLogo({ platform, size = 20 }) {
    if (platform === 'PLAYSTORE') {
        return <PlayStoreIcon size={size} />;
    }
    return <AppStoreIcon size={size} />;
}
