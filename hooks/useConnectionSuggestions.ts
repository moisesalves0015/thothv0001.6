import { useState, useCallback, useEffect } from 'react';
import { ConnectionService } from '../modules/connection/connection.service';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Author } from '../types';

export const useConnectionSuggestions = () => {
    const [suggestions, setSuggestions] = useState<Author[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<Author[]>([]);
    const [currentUserData, setCurrentUserData] = useState<Author | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'university' | 'course'>('all');

    const fetchSuggestions = useCallback(async (userId: string) => {
        try {
            const list = await ConnectionService.getSuggestions(userId);
            setSuggestions(list);
            setFilteredSuggestions(list);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    }, []);

    const loadUserData = useCallback(async (user: any) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                const userData: Author = {
                    id: user.uid,
                    name: data.fullName || user.displayName || "Usuário",
                    username: data.username || `@${user.email?.split('@')[0] || 'usuario'}`,
                    avatar: data.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                    university: data.university,
                    course: data.course,
                    stats: data.stats || { followers: 0, projects: 0 }
                };
                setCurrentUserData(userData);
                await fetchSuggestions(user.uid);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }, [fetchSuggestions]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadUserData(user);
                setLoading(false);
            }
        });

        return () => unsub();
    }, [loadUserData]);

    useEffect(() => {
        let filtered = suggestions;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query) ||
                user.university?.toLowerCase().includes(query) ||
                user.course?.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(user => {
                if (activeFilter === 'university') {
                    return user.university && user.university === currentUserData?.university;
                }
                if (activeFilter === 'course') {
                    return user.course && user.course === currentUserData?.course;
                }
                return true;
            });
        }

        setFilteredSuggestions(filtered);
    }, [suggestions, searchQuery, activeFilter, currentUserData]);

    const refresh = async () => {
        setRefreshing(true);
        if (auth.currentUser) {
            await fetchSuggestions(auth.currentUser.uid);
        }
        setTimeout(() => setRefreshing(false), 1000);
    };

    const removeSuggestion = (userId: string) => {
        setFilteredSuggestions(prev => prev.filter(user => user.id !== userId));
    };

    const getFilterCount = (type: 'university' | 'course') => {
        if (!currentUserData) return 0;

        return suggestions.filter(user => {
            if (type === 'university') {
                return user.university && user.university === currentUserData.university;
            }
            return user.course && user.course === currentUserData.course;
        }).length;
    };

    return {
        suggestions: filteredSuggestions,
        allSuggestionsCount: suggestions.length,
        currentUserData,
        loading,
        refreshing,
        searchQuery,
        setSearchQuery,
        isFilterOpen,
        setIsFilterOpen,
        activeFilter,
        setActiveFilter,
        refresh,
        removeSuggestion,
        getFilterCount
    };
};
