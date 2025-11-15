import React from 'react';
import { Button } from 'primereact/button';
import { Product } from '@/lib/api/products.api';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

interface ProductGridViewProps {
    products: Product[];
    loading: boolean;
    first: number;
    rows: number;
    totalRecords: number;
    onPage: (first: number) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    formatCurrency: (value: number) => string;
}

export const ProductGridView: React.FC<ProductGridViewProps> = ({ products, loading, first, rows, totalRecords, onPage, onEdit, onDelete, formatCurrency }) => {
    if (loading) {
        return (
            <div className="col-12 text-center">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="col-12 text-center">
                <p className="text-600">No products found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid mt-3">
                {products.map((prod) => (
                    <div key={prod.id} className="col-12 md:col-6 lg:col-4 xl:col-3">
                        <div className="card shadow-2 border-round p-3">
                            <div className="text-center mb-3">
                                <img
                                    src={prod.photo || FALLBACK_IMAGE}
                                    alt={prod.productName}
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
                            <div className="mb-2">
                                <h3 className="text-xl font-semibold mb-2">{prod.productName}</h3>
                                <p className="text-600 text-sm mb-2">
                                    <strong>Category:</strong> {prod.category?.categoryName || 'N/A'}
                                </p>
                                <p className="text-600 text-sm mb-2">
                                    <strong>Price:</strong> {prod.price ? formatCurrency(prod.price) : 'N/A'}
                                </p>
                                <p className="text-600 text-sm mb-2">
                                    <strong>Stock:</strong> {prod.stockQuantity ?? 'N/A'}
                                </p>
                                <p className="text-500 text-sm line-height-3" style={{ minHeight: '3rem' }}>
                                    {prod.description || 'No description'}
                                </p>
                            </div>
                            <div className="flex justify-content-between align-items-center pt-2 border-top-1 surface-border">
                                <small className="text-500">{new Date(prod.createdAt).toLocaleDateString()}</small>
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" rounded text severity="success" onClick={() => onEdit(prod)} />
                                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => onDelete(prod)} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && products.length > 0 && (
                <div className="flex justify-content-between align-items-center mt-3 p-3">
                    <Button icon="pi pi-angle-left" onClick={() => onPage(Math.max(0, first - rows))} disabled={first === 0} text />
                    <span className="text-600">
                        Showing {first + 1} to {Math.min(first + rows, totalRecords)} of {totalRecords} products
                    </span>
                    <Button icon="pi pi-angle-right" onClick={() => onPage(first + rows)} disabled={first + rows >= totalRecords} text />
                </div>
            )}
        </>
    );
};
