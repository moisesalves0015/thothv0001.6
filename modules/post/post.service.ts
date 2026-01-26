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
    DocumentSnapshot,
    deleteDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Post, Author } from '../../types';
import { ConnectionService } from '../connection/connection.service';

const POSTS_COLLECTION = 'posts';
const FEED_LIMIT = 50;
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

export const PostService = {
    /**
     * Creates a new post with the given content and author.
     * Salva o post na coleção 'posts' com metadados do autor desnormalizados para leitura rápida.
     */
    async createPost(
        content: string,
        tags: string[],
        images: string[],
        author: Author,
        externalLink?: { url: string; title: string } | null,
        attachmentFile?: { name: string; size: string; url: string } | null,
        postType: 'general' | 'study' | 'resource' | 'event' | 'question' = 'general'
    ): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
                content,
                tags,
                images,
                postType,
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
                likedBy: [],
                repostedBy: [],
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
     * Toggles like on a post
     */
    async toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            likedBy: isLiked ? arrayUnion(userId) : arrayRemove(userId),
            likes: increment(isLiked ? 1 : -1)
        });
    },

    /**
     * Updates a post content
     */
    async updatePost(postId: string, data: Partial<Post>): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    },

    /**
     * Deletes a post and all its reposts (cascade deletion)
     */
    async deletePost(postId: string): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId);

        try {
            // 1. Get post data to check relationships
            const postSnap = await getDoc(postRef);
            if (!postSnap.exists()) return;
            const postData = postSnap.data();

            // 2. If it's a repost, remove from original post's repostedBy list
            if (postData.originalPostId) {
                const originalRef = doc(db, POSTS_COLLECTION, postData.originalPostId);
                const originalSnap = await getDoc(originalRef);

                if (originalSnap.exists()) {
                    const originalData = originalSnap.data();
                    // Remove user from repostedBy array
                    const newRepostedBy = (originalData.repostedBy || []).filter((u: any) => u.uid !== postData.author.id);
                    await updateDoc(originalRef, { repostedBy: newRepostedBy });
                }
            }

            // 3. Delete the post itself
            await deleteDoc(postRef);

            // 4. Cascade delete: if it's an original post, delete all its reposts
            if (!postData.originalPostId) {
                const q = query(
                    collection(db, POSTS_COLLECTION),
                    where('originalPostId', '==', postId)
                );
                const snap = await getDocs(q);
                const batchDeletion = snap.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(batchDeletion);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    },

    /**
     * Toggles bookmark on a post for a user
     */
    async toggleBookmark(userId: string, post: Post, isBookmarked: boolean): Promise<void> {
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', post.id);
        if (isBookmarked) {
            // Garantir que salvamos um objeto limpo e serializável
            const bookmarkData = {
                id: post.id,
                content: post.content,
                author: post.author,
                timestamp: post.timestamp,
                images: post.images || [],
                postType: post.postType || 'general',
                externalLink: post.externalLink || null,
                attachmentFile: post.attachmentFile || null,
                tags: post.tags || [],
                // Campos essenciais para Repost
                originalPostId: post.originalPostId || null,
                repostedBy: post.repostedBy || [],
                originalAuthor: post.originalAuthor || null,
                originalTimestamp: post.originalTimestamp || null,
                bookmarkedAt: Timestamp.now()
            };
            await setDoc(bookmarkRef, bookmarkData);
        } else {
            await deleteDoc(bookmarkRef);
        }
    },

    async getBookmarkedPosts(userId: string): Promise<Post[]> {
        const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
        const q = query(bookmarksRef, orderBy('bookmarkedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Post));
    },

    /**
     * Checks if a specific post is bookmarked by a user
     */
    async isPostBookmarked(userId: string, postId: string): Promise<boolean> {
        const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
        const snap = await getDoc(bookmarkRef);
        return snap.exists();
    },

    /**
     * Reposts a post
     */
    async repost(originalPost: Post, currentUser: { id: string, name: string, username: string, avatar: string }): Promise<string> {
        // 1. Identificar o post raiz (de onde veio a informação original)
        const rootPostId = originalPost.originalPostId || originalPost.id;
        const rootAuthor = (originalPost as any).originalAuthor || originalPost.author;

        // 2. Create a new post that references the root
        const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
            content: originalPost.content,
            tags: originalPost.tags || [],
            images: originalPost.images || [],
            postType: originalPost.postType || 'general',
            externalLink: originalPost.externalLink || null,
            attachmentFile: originalPost.attachmentFile || null,
            originalPostId: rootPostId,
            repostedBy: [{ uid: currentUser.id, name: currentUser.name }],
            // O author agora é quem está repostando, mas guardamos a info do post original
            author: {
                id: currentUser.id,
                name: currentUser.name,
                username: currentUser.username,
                avatar: currentUser.avatar,
                verified: false,
            },
            originalAuthor: rootAuthor,
            originalTimestamp: (originalPost as any).originalTimestamp || originalPost.timestamp,
            likes: 0,
            likedBy: [],
            replies: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        // 3. Update the ROOT post's repost count
        const rootRef = doc(db, POSTS_COLLECTION, rootPostId);
        await updateDoc(rootRef, {
            repostedBy: arrayUnion({ uid: currentUser.id, name: currentUser.name })
        });

        return docRef.id;
    },

    /**
     * Fetches the feed posts (User's own posts + Connections' posts).
     * Nota Importante: O Firestore tem uma limitação de 30 itens na cláusula 'in'.
     * Para este MVP, limitamos a construção do feed às primeiras 29 conexões + o próprio usuário.
     * Para escalar, seria necessário uma abordagem de "Fan-out on write" ou um feed service dedicado.
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
                    likedBy: data.likedBy || [],
                    repostedBy: data.repostedBy || [],
                    originalPostId: data.originalPostId || null,
                    originalAuthor: data.originalAuthor || null, // Incluído para exibir autor correto em reposts
                    originalTimestamp: data.originalTimestamp || null, // Incluído para exibir data correta em reposts
                    replies: data.replies || 0,
                    images: data.images || [],
                    tags: data.tags || [],
                    externalLink: data.externalLink,
                    attachmentFile: data.attachmentFile,
                    postType: data.postType || 'general',
                };
            });
        } catch (error) {
            console.error('Error fetching feed posts:', error);
            throw error;
        }
    },

    /**
     * Helper to format Timestamp to "15m atrás", "2h atrás", etc.
     * Converte timestamps do Firestore para texto amigável relativo (ex: 5min ago).
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
