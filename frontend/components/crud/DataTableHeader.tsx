import React from 'react';
import { InputText } from 'primereact/inputtext';

export interface DataTableHeaderProps {
    title: string;
    globalFilter: string;
    onGlobalFilterChange: (value: string) => void;
    placeholder?: string;
}

export const DataTableHeader: React.FC<DataTableHeaderProps> = ({ title, globalFilter, onGlobalFilterChange, placeholder = 'Search...' }) => {
    return (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">{title}</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => onGlobalFilterChange(e.currentTarget.value)} placeholder={placeholder} />
            </span>
        </div>
    );
};
