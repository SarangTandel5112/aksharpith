'use client';
import { useState, useCallback } from 'react';
import { usersApi, User } from '@/lib/api/users.api';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.getAll();
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            // Fallback to placeholder data for development
            setUsers([
                { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers
    };
};
