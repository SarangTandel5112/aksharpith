'use client';
import { useState, useCallback } from 'react';
import { productsApi, Product, ProductQueryParams } from '@/lib/api/products.api';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (params?: ProductQueryParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.getAll(params);
            if (response.success && response.data) {
                setProducts(response.data.data);
                setTotal(response.data.total);
            }
            setLoading(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    return {
        products,
        total,
        loading,
        error,
        fetchProducts
    };
};
