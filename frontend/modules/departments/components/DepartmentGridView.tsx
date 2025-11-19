import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Department } from '@/lib/api/departments.api';

interface DepartmentGridViewProps {
    departments: Department[];
    loading: boolean;
    first: number;
    rows: number;
    totalRecords: number;
    onPage: (first: number) => void;
    onEdit: (department: Department) => void;
    onDelete: (department: Department) => void;
}

export const DepartmentGridView: React.FC<DepartmentGridViewProps> = ({
    departments,
    loading,
    first,
    rows,
    totalRecords,
    onPage,
    onEdit,
    onDelete
}) => {
    if (loading) {
        return (
            <div className="col-12 text-center">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            </div>
        );
    }

    if (departments.length === 0) {
        return (
            <div className="col-12 text-center">
                <p className="text-500">No departments found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid mt-3">
                {departments.map((dept) => (
                    <div key={dept.id} className="col-12 md:col-6 lg:col-4 xl:col-3">
                        <div className="card shadow-2 border-round p-3">
                            <div className="mb-3">
                                <div className="flex justify-content-between align-items-center mb-2">
                                    <h3 className="text-xl font-semibold m-0">{dept.departmentName}</h3>
                                    <Tag value={dept.isActive ? 'Active' : 'Inactive'} severity={dept.isActive ? 'success' : 'danger'} />
                                </div>
                                {dept.departmentCode && (
                                    <div className="mb-2">
                                        <span className="text-500 text-sm">Code: </span>
                                        <span className="font-semibold">{dept.departmentCode}</span>
                                    </div>
                                )}
                                <p className="text-600 text-sm line-height-3" style={{ minHeight: '3rem' }}>
                                    {dept.description || 'No description'}
                                </p>
                            </div>
                            <div className="flex justify-content-between align-items-center pt-2 border-top-1 surface-border">
                                <small className="text-500">{new Date(dept.createdAt).toLocaleDateString()}</small>
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" rounded text severity="success" onClick={() => onEdit(dept)} />
                                    <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => onDelete(dept)} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {totalRecords > 0 && (
                <div className="flex justify-content-between align-items-center mt-3 px-3">
                    <span className="text-sm text-500">
                        Showing {first + 1} to {Math.min(first + rows, totalRecords)} of {totalRecords} departments
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
