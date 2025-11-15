import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Product } from '@/lib/api/products.api';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

interface ProductTableColumnsProps {
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    formatCurrency: (value: number) => string;
}

export const ProductTableColumns: React.FC<ProductTableColumnsProps> = ({ onEdit, onDelete, formatCurrency }) => {
    const imageBodyTemplate = (rowData: Product) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img
                    src={rowData.photo || FALLBACK_IMAGE}
                    alt={rowData.productName}
                    className="shadow-2 border-round"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                            target.src = FALLBACK_IMAGE;
                        }
                    }}
                />
            </>
        );
    };

    const nameBodyTemplate = (rowData: Product) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.productName}
            </>
        );
    };

    const categoryBodyTemplate = (rowData: Product) => {
        return (
            <>
                <span className="p-column-title">Category</span>
                {rowData.category?.categoryName || 'N/A'}
            </>
        );
    };

    const priceBodyTemplate = (rowData: Product) => {
        return (
            <>
                <span className="p-column-title">Price</span>
                {rowData.price ? formatCurrency(rowData.price) : 'N/A'}
            </>
        );
    };

    const stockBodyTemplate = (rowData: Product) => {
        return (
            <>
                <span className="p-column-title">Stock</span>
                {rowData.stockQuantity ?? 'N/A'}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Product) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => onEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => onDelete(rowData)} />
            </>
        );
    };

    return (
        <React.Fragment>
            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
            <Column header="Image" body={imageBodyTemplate} style={{ width: '120px' }}></Column>
            <Column field="productName" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column header="Category" sortable body={categoryBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
            <Column field="price" header="Price" body={priceBodyTemplate} sortable></Column>
            <Column field="stockQuantity" header="Stock" body={stockBodyTemplate} sortable></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
        </React.Fragment>
    );
};
