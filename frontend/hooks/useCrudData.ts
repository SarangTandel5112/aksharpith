import { useState, useCallback, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

export interface CrudApi<T, CreateDto, UpdateDto> {
    getAll: (params?: any) => Promise<{ success: boolean; data?: { data: T[]; total: number }; message?: string }>;
    create: (data: CreateDto) => Promise<{ success: boolean; data?: T; message?: string }>;
    update: (id: number, data: UpdateDto) => Promise<{ success: boolean; data?: T; message?: string }>;
    delete: (id: number) => Promise<{ success: boolean; message?: string }>;
}

export interface UseCrudDataOptions<T> {
    api: CrudApi<T, any, any>;
    toast?: React.RefObject<Toast>;
    initialPage?: number;
    initialRows?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

export interface UseCrudDataReturn<T> {
    data: T[];
    loading: boolean;
    totalRecords: number;
    first: number;
    rows: number;
    globalFilter: string;
    sortBy: string | undefined;
    order: 'ASC' | 'DESC';
    setFirst: (value: number) => void;
    setRows: (value: number) => void;
    setGlobalFilter: (value: string) => void;
    setSortBy: (value: string | undefined) => void;
    setOrder: (value: 'ASC' | 'DESC') => void;
    fetchData: () => Promise<void>;
    createItem: (item: any) => Promise<boolean>;
    updateItem: (id: number, item: any) => Promise<boolean>;
    deleteItem: (id: number) => Promise<boolean>;
    deleteItems: (ids: number[]) => Promise<boolean>;
}

export function useCrudData<T>(options: UseCrudDataOptions<T>): UseCrudDataReturn<T> {
    const { api, toast, initialPage = 0, initialRows = 10, sortBy: initialSortBy, order: initialOrder } = options;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(initialPage);
    const [rows, setRows] = useState(initialRows);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
    const [order, setOrder] = useState<'ASC' | 'DESC'>(initialOrder || 'DESC');
    const prevSortRef = useRef<{ sortBy?: string; order?: string }>({ sortBy: initialSortBy, order: initialOrder || 'DESC' });

    // Reset to first page when sort changes (but not on initial load)
    useEffect(() => {
        if (sortBy !== undefined && (sortBy !== prevSortRef.current.sortBy || order !== prevSortRef.current.order)) {
            setFirst(0);
            prevSortRef.current = { sortBy, order };
        }
    }, [sortBy, order]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const page = Math.floor(first / rows) + 1;
            const params: any = {
                page,
                limit: rows
            };
            if (globalFilter && globalFilter.trim() !== '') {
                params.search = globalFilter;
            }
            if (sortBy) {
                params.sortBy = sortBy;
                params.order = order || 'DESC';
            }

            const response = await api.getAll(params);

            if (response.success && response.data) {
                setData(response.data.data);
                setTotalRecords(response.data.total);
            } else {
                toast?.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.message || 'Failed to fetch data',
                    life: 3000
                });
            }
        } catch (error: any) {
            toast?.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to fetch data',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    }, [api, first, rows, globalFilter, sortBy, order, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createItem = useCallback(
        async (item: any): Promise<boolean> => {
            try {
                const response = await api.create(item);
                if (response.success) {
                    await fetchData();
                    toast?.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Item Created',
                        life: 3000
                    });
                    return true;
                } else {
                    toast?.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to create item',
                        life: 3000
                    });
                    return false;
                }
            } catch (error: any) {
                toast?.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to create item',
                    life: 3000
                });
                return false;
            }
        },
        [api, fetchData, toast]
    );

    const updateItem = useCallback(
        async (id: number, item: any): Promise<boolean> => {
            try {
                const response = await api.update(id, item);
                if (response.success) {
                    await fetchData();
                    toast?.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Item Updated',
                        life: 3000
                    });
                    return true;
                } else {
                    toast?.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to update item',
                        life: 3000
                    });
                    return false;
                }
            } catch (error: any) {
                toast?.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to update item',
                    life: 3000
                });
                return false;
            }
        },
        [api, fetchData, toast]
    );

    const deleteItem = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                const response = await api.delete(id);
                if (response.success) {
                    await fetchData();
                    toast?.current?.show({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Item Deleted',
                        life: 3000
                    });
                    return true;
                } else {
                    toast?.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.message || 'Failed to delete item',
                        life: 3000
                    });
                    return false;
                }
            } catch (error: any) {
                toast?.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to delete item',
                    life: 3000
                });
                return false;
            }
        },
        [api, fetchData, toast]
    );

    const deleteItems = useCallback(
        async (ids: number[]): Promise<boolean> => {
            try {
                await Promise.all(ids.map((id) => api.delete(id)));
                await fetchData();
                toast?.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Items Deleted',
                    life: 3000
                });
                return true;
            } catch (error: any) {
                toast?.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to delete items',
                    life: 3000
                });
                return false;
            }
        },
        [api, fetchData, toast]
    );

    return {
        data,
        loading,
        totalRecords,
        first,
        rows,
        globalFilter,
        sortBy,
        order,
        setFirst,
        setRows,
        setGlobalFilter,
        setSortBy,
        setOrder,
        fetchData,
        createItem,
        updateItem,
        deleteItem,
        deleteItems
    };
}
