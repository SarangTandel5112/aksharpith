'use client';
import { useState, useCallback } from 'react';
import { usersApi, User } from '@/lib/api/users.api';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.getAll();
            if (response.success && response.data) {
                setUsers(response.data.data);
                setTotal(response.data.total);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        total,
        loading,
        error,
        fetchUsers
    };
};
