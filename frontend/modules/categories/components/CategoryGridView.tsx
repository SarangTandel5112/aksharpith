import React from 'react';
import { Button } from 'primereact/button';
import { Category } from '@/lib/api/categories.api';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

interface CategoryGridViewProps {
    categories: Category[];
    loading: boolean;
    first: number;
    rows: number;
    totalRecords: number;
    onPage: (first: number) => void;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export const CategoryGridView: React.FC<CategoryGridViewProps> = ({ categories, loading, first, rows, totalRecords, onPage, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="col-12 text-center">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="col-12 text-center">
                <p className="text-500">No categories found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid mt-3">
                {categories.map((cat) => (
                    <div key={cat.id} className="col-12 md:col-6 lg:col-4 xl:col-3">
                        <div className="card shadow-2 border-round p-3">
                            <div className="text-center mb-3">
                                <img
                                    src={cat.photo || FALLBACK_IMAGE}
                                    alt={cat.categoryName}
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
                                <h3 className="text-xl font-semibold mb-2">{cat.categoryName}</h3>
                                <p className="text-600 text-sm line-height-3" style={{ minHeight: '3rem' }}>
                                    {cat.description || 'No description'}
                                </p>
                            </div>
                            <div className="flex justify-content-between align-items-center pt-2 border-top-1 surface-border">
                                <small className="text-500">{new Date(cat.createdAt).toLocaleDateString()}</small>
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" rounded text severity="success" onClick={() => onEdit(cat)} />
                                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => onDelete(cat)} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {totalRecords > 0 && (
                <div className="flex justify-content-between align-items-center mt-3 px-3">
                    <span className="text-sm text-500">
                        Showing {first + 1} to {Math.min(first + rows, totalRecords)} of {totalRecords} categories
                    </span>
                    <div className="flex gap-2">
                        <Button icon="pi pi-chevron-left" disabled={first === 0} onClick={() => onPage(Math.max(0, first - rows))} text />
                        <Button icon="pi pi-chevron-right" disabled={first + rows >= totalRecords} onClick={() => onPage(first + rows)} text />
                    </div>
                </div>
            )}
        </>
    );
};
