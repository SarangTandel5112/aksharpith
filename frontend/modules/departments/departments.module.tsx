'use client';
import React, { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { departmentsApi, Department, CreateDepartmentDto } from '@/lib/api/departments.api';
import { useCrudData, useDialog, useForm } from '@/hooks';
import { DeleteDialog, DataTableHeader, CrudToolbar } from '@/components/crud';
import { DepartmentFormDialog, DepartmentGridView } from './components';
import { ValidationError } from '@/lib/api/errors';

const DepartmentsModule: React.FC = () => {
    const emptyDepartment: CreateDepartmentDto = {
        departmentName: '',
        departmentCode: '',
        description: '',
        isActive: true
    };

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // CRUD Data Management (Single Responsibility)
    const {
        data: departments,
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
    } = useCrudData<Department>({
        api: departmentsApi,
        toast,
        sortBy: 'createdAt',
        order: 'DESC'
    });

    // Dialog Management (Single Responsibility)
    const departmentDialog = useDialog(false);
    const deleteDepartmentDialog = useDialog(false);
    const deleteDepartmentsDialog = useDialog(false);

    // Form Management (Single Responsibility)
    const {
        formData: department,
        setFormData,
        updateField,
        reset: resetForm,
        submitted,
        setSubmitted,
        setValidationErrors,
        getFieldError
    } = useForm<CreateDepartmentDto>(emptyDepartment);
    const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<Department[] | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
            departmentName: 'departmentName',
            departmentCode: 'departmentCode',
            description: 'description',
            createdAt: 'createdAt',
            isActive: 'isActive'
        };

        const backendField = fieldMapping[event.sortField] || event.sortField;

        // Only set sort if field is sortable on backend
        const sortableFields = ['departmentName', 'departmentCode', 'description', 'createdAt', 'updatedAt', 'isActive'];
        if (sortableFields.includes(backendField)) {
            setSortBy(backendField);
            setOrder(event.sortOrder === 1 ? 'ASC' : 'DESC');
        }
    };

    const openNew = () => {
        resetForm();
        setEditingDepartmentId(null);
        departmentDialog.open();
    };

    const editDepartment = (departmentData: Department) => {
        setFormData({
            departmentName: departmentData.departmentName,
            departmentCode: departmentData.departmentCode || '',
            description: departmentData.description || '',
            isActive: departmentData.isActive
        });
        setEditingDepartmentId(departmentData.id);
        departmentDialog.open();
    };

    const saveDepartment = async () => {
        setSubmitted(true);

        if (department.departmentName && department.departmentName.trim()) {
            try {
                const updateData: Partial<Department> = {
                    departmentName: department.departmentName,
                    departmentCode: department.departmentCode || undefined,
                    description: department.description || undefined,
                    isActive: department.isActive
                };

                const success = editingDepartmentId
                    ? await updateItem(editingDepartmentId, updateData)
                    : await createItem(department);

                if (success) {
                    departmentDialog.close();
                    resetForm();
                    setEditingDepartmentId(null);
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
                        detail: error.message || 'Failed to save department',
                        life: 3000
                    });
                }
            }
        }
    };

    const confirmDeleteDepartment = (departmentData: Department) => {
        setEditingDepartmentId(departmentData.id);
        setDepartmentToDelete(departmentData);
        deleteDepartmentDialog.open();
    };

    const handleDeleteDepartment = async () => {
        if (editingDepartmentId) {
            const success = await deleteItem(editingDepartmentId);
            if (success) {
                deleteDepartmentDialog.close();
                setEditingDepartmentId(null);
                setDepartmentToDelete(null);
            }
        }
    };

    const confirmDeleteSelected = () => {
        deleteDepartmentsDialog.open();
    };

    const handleDeleteSelected = async () => {
        if (selectedDepartments && selectedDepartments.length > 0) {
            const ids = selectedDepartments.map((dept) => dept.id);
            const success = await deleteItems(ids);
            if (success) {
                deleteDepartmentsDialog.close();
                setSelectedDepartments(null);
            }
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        updateField(name as keyof CreateDepartmentDto, val);
    };

    const onCheckboxChange = (name: string, value: boolean) => {
        updateField(name as keyof CreateDepartmentDto, value);
    };

    const rightToolbarContent = (
        <div className="flex gap-2">
            <Button
                icon="pi pi-th-large"
                severity={viewMode === 'grid' ? undefined : 'secondary'}
                onClick={() => setViewMode('grid')}
                tooltip="Grid View"
                tooltipOptions={{ position: 'bottom' }}
            />
            <Button
                icon="pi pi-list"
                severity={viewMode === 'list' ? undefined : 'secondary'}
                onClick={() => setViewMode('list')}
                tooltip="List View"
                tooltipOptions={{ position: 'bottom' }}
            />
            <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <CrudToolbar
                        onNew={openNew}
                        onDelete={confirmDeleteSelected}
                        onExport={exportCSV}
                        canDelete={!!selectedDepartments && selectedDepartments.length > 0}
                        rightContent={rightToolbarContent}
                    />

                    {viewMode === 'list' ? (
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
                                value={departments}
                                selection={selectedDepartments}
                                onSelectionChange={(e) => setSelectedDepartments(e.value as Department[])}
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
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} departments"
                                emptyMessage="No departments found."
                                header={
                                    <DataTableHeader
                                        title="Manage Departments"
                                        globalFilter={globalFilter}
                                        onGlobalFilterChange={setGlobalFilter}
                                    />
                                }
                                responsiveLayout="scroll"
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                                <Column
                                    field="departmentName"
                                    header="Name"
                                    sortable
                                    body={(rowData: Department) => rowData.departmentName}
                                    headerStyle={{ minWidth: '15rem' }}
                                ></Column>
                                <Column
                                    field="departmentCode"
                                    header="Code"
                                    sortable
                                    body={(rowData: Department) => rowData.departmentCode || '-'}
                                    headerStyle={{ minWidth: '10rem' }}
                                ></Column>
                                <Column
                                    field="description"
                                    header="Description"
                                    sortable
                                    body={(rowData: Department) => rowData.description || '-'}
                                    headerStyle={{ minWidth: '20rem' }}
                                ></Column>
                                <Column
                                    field="isActive"
                                    header="Status"
                                    sortable
                                    body={(rowData: Department) => (
                                        <Tag value={rowData.isActive ? 'Active' : 'Inactive'} severity={rowData.isActive ? 'success' : 'danger'} />
                                    )}
                                    headerStyle={{ minWidth: '8rem' }}
                                ></Column>
                                <Column
                                    field="createdAt"
                                    header="Created Date"
                                    sortable
                                    body={(rowData: Department) => new Date(rowData.createdAt).toLocaleDateString()}
                                    headerStyle={{ minWidth: '12rem' }}
                                ></Column>
                                <Column
                                    body={(rowData: Department) => (
                                        <>
                                            <Button
                                                icon="pi pi-pencil"
                                                rounded
                                                severity="success"
                                                className="mr-2"
                                                onClick={() => editDepartment(rowData)}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                rounded
                                                severity="warning"
                                                onClick={() => confirmDeleteDepartment(rowData)}
                                            />
                                        </>
                                    )}
                                    headerStyle={{ minWidth: '10rem' }}
                                ></Column>
                            </DataTable>
                        </div>
                    ) : (
                        <div>
                            <DataTableHeader
                                title="Manage Departments"
                                globalFilter={globalFilter}
                                onGlobalFilterChange={setGlobalFilter}
                            />
                            <DepartmentGridView
                                departments={departments}
                                loading={loading}
                                first={first}
                                rows={rows}
                                totalRecords={totalRecords}
                                onPage={setFirst}
                                onEdit={editDepartment}
                                onDelete={confirmDeleteDepartment}
                            />
                        </div>
                    )}

                    <DepartmentFormDialog
                        visible={departmentDialog.visible}
                        onHide={departmentDialog.close}
                        onSave={saveDepartment}
                        department={department}
                        onInputChange={onInputChange}
                        onCheckboxChange={onCheckboxChange}
                        submitted={submitted}
                        isEditing={!!editingDepartmentId}
                        getFieldError={getFieldError}
                    />

                    <DeleteDialog
                        visible={deleteDepartmentDialog.visible}
                        onHide={deleteDepartmentDialog.close}
                        onConfirm={handleDeleteDepartment}
                        itemDetails={
                            departmentToDelete && (
                                <>
                                    <p className="m-0 mb-2">
                                        <strong>Name:</strong> {departmentToDelete.departmentName}
                                    </p>
                                    {departmentToDelete.departmentCode && (
                                        <p className="m-0 mb-2">
                                            <strong>Code:</strong> {departmentToDelete.departmentCode}
                                        </p>
                                    )}
                                    {departmentToDelete.description && (
                                        <p className="m-0">
                                            <strong>Description:</strong> {departmentToDelete.description}
                                        </p>
                                    )}
                                </>
                            )
                        }
                    />

                    <DeleteDialog
                        visible={deleteDepartmentsDialog.visible}
                        onHide={deleteDepartmentsDialog.close}
                        onConfirm={handleDeleteSelected}
                        multiple
                        count={selectedDepartments?.length || 0}
                        itemNames={selectedDepartments?.map((dept) => dept.departmentName) || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default DepartmentsModule;
