'use client';
import { useState, useCallback } from 'react';
import { categoriesApi, Category, CategoryQueryParams } from '@/lib/api/categories.api';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async (params?: CategoryQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoriesApi.getAll(params);
            if (response.success && response.data) {
                setCategories(response.data.data);
                setTotal(response.data.total);
            }
            setLoading(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    return {
        categories,
        total,
        loading,
        error,
        fetchCategories
    };
};
