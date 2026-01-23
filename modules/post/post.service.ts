import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    Timestamp,
    startAfter,
    DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Post, Author } from '../../types';
import { ConnectionService } from '../connection/connection.service';

const POSTS_COLLECTION = 'posts';
const FEED_LIMIT = 50;

export const PostService = {
    /**
     * Creates a new post with the given content and author.
     */
    async createPost(
        content: string,
        tags: string[],
        images: string[],
        author: Author,
        externalLink?: { url: string; title: string } | null,
        attachmentFile?: { name: string; size: string; url: string } | null
    ): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
                content,
                tags,
                images,
                externalLink: externalLink || null,
                attachmentFile: attachmentFile || null,
                author: {
                    id: author.id,
                    name: author.name,
                    username: author.username,
                    avatar: author.avatar,
                    verified: author.verified || false,
                    university: author.university || '',
                },
                likes: 0,
                replies: 0,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    /**
     * Fetches the feed posts (User's own posts + Connections' posts).
     * Note: Firestore 'in' query supports up to 30 items. 
     * For MVP, we limit the feed construction to the first 29 connections.
     */
    async getFeedPosts(currentUserUid: string): Promise<Post[]> {
        try {
            // 1. Get connections
            const connections = await ConnectionService.getConnections(currentUserUid);

            // 2. Extract IDs (limit to 29 connections + current user to satisfy 'in' limit of 30)
            const allowedAuthorIds = [currentUserUid, ...connections.map(c => c.id)].slice(0, 30);

            if (allowedAuthorIds.length === 0) return [];

            // 3. Query posts
            const q = query(
                collection(db, POSTS_COLLECTION),
                where('author.id', 'in', allowedAuthorIds),
                orderBy('createdAt', 'desc'),
                limit(FEED_LIMIT)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    author: data.author,
                    content: data.content,
                    timestamp: this.formatAccurateTimeAgo(data.createdAt),
                    likes: data.likes || 0,
                    replies: data.replies || 0,
                    images: data.images || [],
                    tags: data.tags || [],
                    externalLink: data.externalLink,
                    attachmentFile: data.attachmentFile,
                };
            });
        } catch (error) {
            console.error('Error fetching feed posts:', error);
            throw error;
        }
    },

    /**
     * Helper to format Timestamp to "15m atrás", "2h atrás", etc.
     */
    formatAccurateTimeAgo(timestamp: Timestamp): string {
        if (!timestamp) return 'agora';

        const now = new Date();
        const date = timestamp.toDate();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'agora';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d atrás`;

        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
};
