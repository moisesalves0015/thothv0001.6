import { useState, useCallback, useEffect } from 'react';
import { Post } from '../types';
import { PostService } from '../modules/post/post.service';
import { auth } from '../firebase';

export const useFeed = (activeFilter: string) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            if (auth.currentUser) {
                let feedPosts: Post[] = [];
                if (activeFilter === 'bookmarks') {
                    feedPosts = await PostService.getBookmarkedPosts(auth.currentUser.uid);
                } else {
                    feedPosts = await PostService.getFeedPosts(auth.currentUser.uid);
                }
                setPosts(feedPosts);
            }
        } catch (error) {
            console.error("Error fetching feed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPosts();
    };

    return { posts, loading, refreshing, handleRefresh, fetchPosts, setPosts };
};
