import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfileBasic {
    uid: string;
    displayName: string;
    photoURL: string;
    username: string;
}

export const useUserProfile = (userId: string | undefined) => {
    const [profile, setProfile] = useState<UserProfileBasic | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            return;
        }

        setLoading(true);

        // Using onSnapshot for real-time updates if the user changes their photo while looking at the feed
        // This might be slightly more expensive but ensures consistency.
        // If cost is a major concern, we could switch to getDoc (one-time fetch).
        const unsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
            setLoading(false);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile({
                    uid: userId,
                    displayName: data.displayName || data.fullName || 'Usuário',
                    photoURL: data.photoURL || '',
                    username: data.username || ''
                });
            } else {
                setProfile(null);
            }
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    return { profile, loading };
};
