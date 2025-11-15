import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { User } from '@/lib/api/users.api';

interface UserTableColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export const UserTableColumns: React.FC<UserTableColumnsProps> = ({ onEdit, onDelete }) => {
    const usernameBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Username</span>
                {rowData.username}
            </>
        );
    };

    const nameBodyTemplate = (rowData: User) => {
        const fullName = `${rowData.Firstname}${rowData.Middlename ? ' ' + rowData.Middlename : ''} ${rowData.Lastname}`;
        return (
            <>
                <span className="p-column-title">Name</span>
                {fullName}
            </>
        );
    };

    const emailBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        );
    };

    const roleBodyTemplate = (rowData: User) => {
        return (
            <>
                <span className="p-column-title">Role</span>
                {rowData.role?.roleName || 'N/A'}
            </>
        );
    };

    const actionBodyTemplate = (rowData: User) => {
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
            <Column field="username" header="Username" sortable body={usernameBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
            <Column field="name" header="Name" body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="email" header="Email" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="role.roleName" header="Role" body={roleBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
        </React.Fragment>
    );
};
