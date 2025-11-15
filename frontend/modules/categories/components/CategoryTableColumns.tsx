import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Category } from '@/lib/api/categories.api';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

interface CategoryTableColumnsProps {
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export const CategoryTableColumns: React.FC<CategoryTableColumnsProps> = ({ onEdit, onDelete }) => {
    const imageBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img
                    src={rowData.photo || FALLBACK_IMAGE}
                    alt={rowData.categoryName}
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

    const nameBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.categoryName}
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description || '-'}
            </>
        );
    };

    const dateBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className="p-column-title">Created</span>
                {new Date(rowData.createdAt).toLocaleDateString()}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Category) => {
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
            <Column header="Image" body={imageBodyTemplate} headerStyle={{ width: '8rem' }}></Column>
            <Column field="categoryName" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="description" header="Description" body={descriptionBodyTemplate} headerStyle={{ minWidth: '20rem' }}></Column>
            <Column field="createdAt" header="Created" body={dateBodyTemplate} sortable headerStyle={{ minWidth: '12rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
        </React.Fragment>
    );
};
