import React, { useState } from 'react';
import ProfilePreviewModal from './ProfilePreviewModal';

interface ClickableAvatarProps {
    userId: string;
    username?: string;
    photoURL: string;
    displayName: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showName?: boolean;
    nameClassName?: string;
    className?: string;
    onClick?: () => void; // Optional override
}

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({
    userId,
    username,
    photoURL,
    displayName,
    size = 'md',
    showName = false,
    nameClassName = '',
    className = '',
    onClick
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div
                className={`flex items-center gap-2 cursor-pointer group ${className}`}
                onClick={handleClick}
            >
                <div
                    className={`${sizeClasses[size]} rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md shrink-0`}
                >
                    <img
                        src={photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName || 'User'}`}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                </div>
                {showName && (
                    <span
                        className={`text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#006c55] dark:group-hover:text-emerald-400 transition-colors ${nameClassName}`}
                    >
                        {displayName}
                    </span>
                )}
            </div>

            <ProfilePreviewModal
                userId={userId}
                username={username}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default ClickableAvatar;
