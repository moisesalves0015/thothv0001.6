import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';

export const usePost = (postId: string | undefined) => {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!postId) {
            setPost(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(doc(db, 'posts', postId),
            (docSnap) => {
                setLoading(false);
                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as Post);
                    setError(null);
                } else {
                    setPost(null);
                    setError('Post not found');
                }
            },
            (err) => {
                console.error("Error fetching post:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [postId]);

    return { post, loading, error };
};
