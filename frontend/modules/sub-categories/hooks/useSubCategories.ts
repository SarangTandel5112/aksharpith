import { useState, useEffect } from 'react';
import { subCategoriesApi, SubCategory, CreateSubCategoryDto } from '@/lib/api/sub-categories.api';

export const useSubCategories = (categoryId?: number) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubCategories = async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = categoryId ? { ...params, categoryId } : params;
      const response = await subCategoriesApi.getAll(queryParams);
      if (response.success && response.data) {
        setSubCategories(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sub-categories');
    } finally {
      setLoading(false);
    }
  };

  const createSubCategory = async (data: CreateSubCategoryDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subCategoriesApi.create(data);
      if (response.success) {
        await fetchSubCategories();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create sub-category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubCategory = async (id: number, data: Partial<SubCategory>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subCategoriesApi.update(id, data);
      if (response.success) {
        await fetchSubCategories();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update sub-category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await subCategoriesApi.delete(id);
      if (response.success) {
        await fetchSubCategories();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete sub-category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [categoryId]);

  return {
    subCategories,
    total,
    loading,
    error,
    fetchSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
  };
};
