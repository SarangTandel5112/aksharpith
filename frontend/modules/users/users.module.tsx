'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { User, usersApi, CreateUserDto } from '@/lib/api/users.api';
import { Role, rolesApi } from '@/lib/api/roles.api';
import { useCrudData, useDialog, useForm } from '@/hooks';
import { DeleteDialog, DataTableHeader, CrudToolbar } from '@/components/crud';
import { UserFormDialog, UserTableColumns } from './components';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ValidationError } from '@/lib/api/errors';

const UsersModule: React.FC = () => {
    const emptyUser: CreateUserDto = {
        username: '',
        Firstname: '',
        Middlename: '',
        Lastname: '',
        email: '',
        password: '',
        roleId: 1
    };

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // CRUD Data Management (Single Responsibility)
    const {
        data: users,
        loading,
        totalRecords,
        first,
        rows,
        globalFilter,
        sortBy,
        order,
        setFirst,
        setRows,
        setGlobalFilter,
        setSortBy,
        setOrder,
        createItem,
        updateItem,
        deleteItem,
        deleteItems
    } = useCrudData<User>({
        api: usersApi,
        toast
    });

    // Dialog Management (Single Responsibility)
    const userDialog = useDialog(false);
    const deleteUserDialog = useDialog(false);
    const deleteUsersDialog = useDialog(false);

    // Form Management (Single Responsibility)
    const { formData: user, setFormData, updateField, reset: resetForm, submitted, setSubmitted, setValidationErrors, getFieldError } = useForm<CreateUserDto>(emptyUser);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[] | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);

    // Fetch roles on mount (Single Responsibility)
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await rolesApi.getAll();
                if (response.success && response.data) {
                    setRoles(response.data);
                }
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to fetch roles',
                    life: 3000
                });
            }
        };
        fetchRoles();
    }, []);

    const onPage = (event: any) => {
        if (event.first !== undefined && event.first !== first) {
            setFirst(event.first);
        }
        if (event.rows !== undefined && event.rows !== rows) {
            setRows(event.rows);
        }
    };

    const onSort = (event: any) => {
        // Map frontend field names to backend field names
        const fieldMapping: Record<string, string> = {
            username: 'username',
            email: 'email',
            createdAt: 'createdAt'
        };

        const backendField = fieldMapping[event.sortField] || event.sortField;

        // Only set sort if field is sortable on backend
        const sortableFields = ['username', 'email', 'createdAt'];
        if (sortableFields.includes(backendField)) {
            setSortBy(backendField);
            setOrder(event.sortOrder === 1 ? 'ASC' : 'DESC');
        }
    };

    const openNew = () => {
        resetForm();
        setEditingUserId(null);
        userDialog.open();
    };

    const editUser = (userData: User) => {
        setFormData({
            username: userData.username,
            Firstname: userData.Firstname,
            Middlename: userData.Middlename || '',
            Lastname: userData.Lastname,
            email: userData.email,
            password: '',
            roleId: userData.roleId
        });
        setEditingUserId(userData.id);
        userDialog.open();
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user.username.trim() && user.Firstname.trim() && user.Lastname.trim() && user.email.trim()) {
            try {
                if (editingUserId) {
                    const updateData: Partial<User> & { password?: string } = {
                        username: user.username,
                        Firstname: user.Firstname,
                        Middlename: user.Middlename,
                        Lastname: user.Lastname,
                        email: user.email,
                        roleId: user.roleId
                    };

                    if (user.password && user.password.trim()) {
                        if (user.password.length < 8) {
                            toast.current?.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Password must be at least 8 characters',
                                life: 3000
                            });
                            return;
                        }
                        updateData.password = user.password;
                    }

                    const success = await updateItem(editingUserId, updateData);
                    if (success) {
                        userDialog.close();
                        resetForm();
                        setEditingUserId(null);
                    }
                } else {
                    if (!user.password || user.password.length < 8) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Password must be at least 8 characters',
                            life: 3000
                        });
                        return;
                    }
                    const success = await createItem(user);
                    if (success) {
                        userDialog.close();
                        resetForm();
                        setEditingUserId(null);
                    }
                }
            } catch (error: any) {
                if (error instanceof ValidationError) {
                    // Set validation errors for form fields
                    setValidationErrors(error.errors);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Validation Error',
                        detail: error.message || 'Please fix the validation errors',
                        life: 3000
                    });
                } else {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to save user',
                        life: 3000
                    });
                }
            }
        }
    };

    const confirmDeleteUser = (userData: User) => {
        setEditingUserId(userData.id);
        setUserToDelete(userData);
        deleteUserDialog.open();
    };

    const handleDeleteUser = async () => {
        if (editingUserId) {
            const success = await deleteItem(editingUserId);
            if (success) {
                deleteUserDialog.close();
                setEditingUserId(null);
                setUserToDelete(null);
            }
        }
    };

    const confirmDeleteSelected = () => {
        deleteUsersDialog.open();
    };

    const handleDeleteSelected = async () => {
        if (selectedUsers && selectedUsers.length > 0) {
            const ids = selectedUsers.map((u) => u.id);
            const success = await deleteItems(ids);
            if (success) {
                deleteUsersDialog.close();
                setSelectedUsers(null);
            }
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        updateField(name as keyof CreateUserDto, val);
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <CrudToolbar onNew={openNew} onDelete={confirmDeleteSelected} onExport={exportCSV} canDelete={!!selectedUsers && selectedUsers.length > 0} />

                    <div style={{ position: 'relative' }}>
                        {loading && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                    borderRadius: '4px'
                                }}
                            >
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                            </div>
                        )}
                        <DataTable
                            ref={dt}
                            value={users}
                            selection={selectedUsers}
                            onSelectionChange={(e) => setSelectedUsers(e.value as User[])}
                            dataKey="id"
                            lazy
                            paginator
                            first={first}
                            rows={rows}
                            totalRecords={totalRecords}
                            onPage={onPage}
                            onSort={onSort}
                            sortField={sortBy}
                            sortOrder={order === 'ASC' ? 1 : order === 'DESC' ? -1 : 0}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                            emptyMessage="No users found."
                            header={<DataTableHeader title="Manage Users" globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                            <Column field="username" header="Username" sortable body={(rowData: User) => rowData.username} headerStyle={{ minWidth: '12rem' }}></Column>
                            <Column field="name" header="Name" body={(rowData: User) => `${rowData.Firstname}${rowData.Middlename ? ' ' + rowData.Middlename : ''} ${rowData.Lastname}`} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="email" header="Email" sortable body={(rowData: User) => rowData.email} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="role.roleName" header="Role" body={(rowData: User) => rowData.role?.roleName || 'N/A'} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="createdAt" header="Created Date" sortable body={(rowData: User) => new Date(rowData.createdAt).toLocaleDateString()} headerStyle={{ minWidth: '12rem' }}></Column>
                            <Column
                                body={(rowData: User) => (
                                    <>
                                        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editUser(rowData)} />
                                        <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteUser(rowData)} />
                                    </>
                                )}
                                headerStyle={{ minWidth: '10rem' }}
                            ></Column>
                        </DataTable>
                    </div>

                    <UserFormDialog
                        visible={userDialog.visible}
                        onHide={userDialog.close}
                        onSave={saveUser}
                        user={user}
                        onInputChange={onInputChange}
                        onRoleChange={(roleId) => updateField('roleId', roleId)}
                        submitted={submitted}
                        isEditing={!!editingUserId}
                        roles={roles}
                        getFieldError={getFieldError}
                    />

                    <DeleteDialog
                        visible={deleteUserDialog.visible}
                        onHide={deleteUserDialog.close}
                        onConfirm={handleDeleteUser}
                        itemDetails={
                            userToDelete && (
                                <>
                                    <p className="m-0 mb-2">
                                        <strong>Username:</strong> {userToDelete.username}
                                    </p>
                                    <p className="m-0 mb-2">
                                        <strong>Name:</strong> {userToDelete.Firstname} {userToDelete.Middlename ? userToDelete.Middlename + ' ' : ''}
                                        {userToDelete.Lastname}
                                    </p>
                                    <p className="m-0">
                                        <strong>Email:</strong> {userToDelete.email}
                                    </p>
                                </>
                            )
                        }
                    />

                    <DeleteDialog visible={deleteUsersDialog.visible} onHide={deleteUsersDialog.close} onConfirm={handleDeleteSelected} multiple count={selectedUsers?.length || 0} itemNames={selectedUsers?.map((u) => u.username) || []} />
                </div>
            </div>
        </div>
    );
};

export default UsersModule;
