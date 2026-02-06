import { User } from 'lucide-react';

interface AvatarProps {
    url?: string | null;
    firstName?: string;
    lastName?: string;
    size?: number;
    className?: string;
}

export default function Avatar({ url, firstName, lastName, size = 40, className = '' }: AvatarProps) {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

    return (
        <div
            className={`avatar ${className}`}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                overflow: 'hidden',
                background: url ? 'transparent' : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: size * 0.4,
                flexShrink: 0,
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        >
            {url ? (
                <img
                    src={url}
                    alt={`${firstName} ${lastName}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                initials || <User size={size * 0.6} />
            )}
        </div>
    );
}
