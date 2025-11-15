import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export interface DeleteDialogProps {
    visible: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    itemDetails?: React.ReactNode;
    multiple?: boolean;
    count?: number;
    itemNames?: string[];
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ visible, onHide, onConfirm, title = 'Confirm Deletion', message, itemName, itemDetails, multiple = false, count = 0, itemNames = [] }) => {
    const footer = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={onHide} />
            <Button label="Yes" icon="pi pi-check" text onClick={onConfirm} />
        </>
    );

    return (
        <Dialog visible={visible} style={{ width: '450px' }} header={title} modal footer={footer} onHide={onHide}>
            <div className="flex flex-column align-items-center justify-content-center p-4 pt-5">
                <i className="pi pi-exclamation-triangle mb-3" style={{ fontSize: '3rem', color: 'var(--red-500)' }} />
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">{message || (multiple ? 'Are you sure you want to delete the selected items?' : 'Are you sure you want to delete this item?')}</p>
                    {itemDetails && (
                        <div className="surface-100 border-round p-3 mb-3" style={{ width: '100%' }}>
                            {itemDetails}
                        </div>
                    )}
                    {multiple && count > 0 && !itemDetails && (
                        <div className="surface-100 border-round p-3 mb-3" style={{ width: '100%' }}>
                            <p className="m-0 mb-2">
                                <strong>Number of items to delete:</strong> {count}
                            </p>
                            {itemNames.length > 0 && (
                                <p className="m-0 text-sm text-600">
                                    {itemNames.slice(0, 3).map((name, idx) => (
                                        <span key={idx}>
                                            {name}
                                            {idx < Math.min(itemNames.length, 3) - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                    {itemNames.length > 3 && ` and ${itemNames.length - 3} more...`}
                                </p>
                            )}
                        </div>
                    )}
                    {itemName && !multiple && (
                        <div className="surface-100 border-round p-3 mb-3" style={{ width: '100%' }}>
                            <p className="m-0">
                                <strong>Item:</strong> {itemName}
                            </p>
                        </div>
                    )}
                    <p className="text-600 text-sm">This action cannot be undone.</p>
                </div>
            </div>
        </Dialog>
    );
};
