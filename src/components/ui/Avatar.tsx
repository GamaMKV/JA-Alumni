"use client";

import Image from 'next/image';

interface AvatarProps {
    url?: string | null;
    firstName?: string;
    lastName?: string;
    size?: number;
    className?: string;
}

export default function Avatar({ url, firstName, lastName, size = 40, className = '' }: AvatarProps) {
    const getInitials = () => {
        const f = firstName ? firstName[0] : '';
        const l = lastName ? lastName[0] : '';
        return (f + l).toUpperCase() || 'JA';
    };

    if (url) {
        return (
            <div
                className={`relative overflow-hidden rounded-full border border-slate-200 ${className}`}
                style={{ width: size, height: size }}
            >
                <Image
                    src={url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes={`${size}px`}
                />
            </div>
        );
    }

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-semibold border border-[var(--color-primary-200)] ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {getInitials()}
        </div>
    );
}
