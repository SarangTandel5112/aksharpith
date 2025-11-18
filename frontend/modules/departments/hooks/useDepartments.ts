import { useState, useEffect } from 'react';
import { departmentsApi, Department, CreateDepartmentDto } from '@/lib/api/departments.api';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsApi.getAll(params);
      if (response.success && response.data) {
        setDepartments(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (data: CreateDepartmentDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsApi.create(data);
      if (response.success) {
        await fetchDepartments();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDepartment = async (id: number, data: Partial<Department>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsApi.update(id, data);
      if (response.success) {
        await fetchDepartments();
        return response.data;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsApi.delete(id);
      if (response.success) {
        await fetchDepartments();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    total,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
