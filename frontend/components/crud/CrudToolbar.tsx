import React from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

export interface CrudToolbarProps {
    onNew: () => void;
    onDelete: () => void;
    onExport?: () => void;
    canDelete?: boolean;
    rightContent?: React.ReactNode;
}

export const CrudToolbar: React.FC<CrudToolbarProps> = ({ onNew, onDelete, onExport, canDelete = false, rightContent }) => {
    const leftTemplate = (
        <div className="my-2">
            <Button label="New" icon="pi pi-plus" severity="success" className="mr-2" onClick={onNew} />
            <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={onDelete} disabled={!canDelete} />
        </div>
    );

    const rightTemplate = rightContent || (onExport ? <Button label="Export" icon="pi pi-upload" severity="help" onClick={onExport} /> : null);

    return <Toolbar className="mb-4" left={leftTemplate} right={rightTemplate} />;
};
