'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { productsApi, Product } from '@/lib/api/products.api';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Toast } from 'primereact/toast';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function PublicDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(12);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    const fetchProducts = useCallback(async () => {
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

            const response = await productsApi.getAll(params);

            if (response.success && response.data) {
                setProducts(response.data.data);
                setTotalRecords(response.data.total);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.message || 'Failed to fetch products',
                    life: 3000
                });
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Failed to fetch products',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    }, [first, rows, globalFilter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    return (
        <div className="surface-ground min-h-screen">
            <Toast ref={toast} />

            {/* Header */}
            <div className="surface-card shadow-2 mb-4">
                <div className="p-4">
                    <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-900 m-0 mb-2">Product Catalog</h1>
                            <p className="text-600 mt-0 mb-0">Browse our collection of products</p>
                        </div>
                        <div className="w-full md:w-auto">
                            <span className="p-input-icon-left w-full md:w-20rem">
                                <i className="pi pi-search" />
                                <InputText
                                    value={globalFilter}
                                    onChange={(e) => {
                                        setGlobalFilter(e.target.value);
                                        setFirst(0);
                                    }}
                                    placeholder="Search products..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4">
                {loading ? (
                    <div className="text-center py-8">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                        <p className="text-600 mt-3">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="pi pi-box text-6xl text-400 mb-3"></i>
                        <p className="text-600 text-xl">No products found.</p>
                        {globalFilter && <p className="text-500 mt-2">Try adjusting your search terms.</p>}
                    </div>
                ) : (
                    <>
                        <div className="grid">
                            {products.map((product) => (
                                <div key={product.id} className="col-12 sm:col-6 md:col-4 lg:col-3">
                                    <div className="card shadow-2 border-round p-3 h-full flex flex-column">
                                        <div className="text-center mb-3">
                                            <img
                                                src={product.photo || FALLBACK_IMAGE}
                                                alt={product.productName}
                                                className="w-full border-round"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (target.src !== FALLBACK_IMAGE) {
                                                        target.src = FALLBACK_IMAGE;
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex-grow-1">
                                            <h3 className="text-xl font-semibold mb-2 text-900">{product.productName}</h3>
                                            {product.category && (
                                                <p className="text-600 text-sm mb-2">
                                                    <i className="pi pi-tag mr-2"></i>
                                                    {product.category.categoryName}
                                                </p>
                                            )}
                                            {product.price && <p className="text-primary font-bold text-2xl mb-2">{formatCurrency(product.price)}</p>}
                                            {product.description && (
                                                <p className="text-500 text-sm line-height-3 mb-3" style={{ minHeight: '3rem' }}>
                                                    {product.description.length > 100 ? `${product.description.substring(0, 100)}...` : product.description}
                                                </p>
                                            )}
                                            <div className="flex align-items-center gap-2 text-500 text-sm">
                                                <i className="pi pi-box"></i>
                                                <span>Stock: {product.stockQuantity ?? 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalRecords > rows && (
                            <div className="mt-4 mb-4">
                                <Paginator
                                    first={first}
                                    rows={rows}
                                    totalRecords={totalRecords}
                                    rowsPerPageOptions={[12, 24, 48]}
                                    onPageChange={onPageChange}
                                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
