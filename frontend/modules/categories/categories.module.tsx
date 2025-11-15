'use client';
import React, { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { categoriesApi, Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/categories.api';
import { useCrudData, useDialog, useForm } from '@/hooks';
import { DeleteDialog, DataTableHeader, CrudToolbar } from '@/components/crud';
import { CategoryFormDialog, CategoryTableColumns, CategoryGridView } from './components';
import { ValidationError } from '@/lib/api/errors';

const CategoriesModule: React.FC = () => {
    const emptyCategory: CreateCategoryDto = {
        categoryName: '',
        description: '',
        photo: ''
    };

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // CRUD Data Management (Single Responsibility)
    const {
        data: categories,
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
    } = useCrudData<Category>({
        api: categoriesApi,
        toast,
        sortBy: 'createdAt',
        order: 'DESC'
    });

    // Dialog Management (Single Responsibility)
    const categoryDialog = useDialog(false);
    const deleteCategoryDialog = useDialog(false);
    const deleteCategoriesDialog = useDialog(false);

    // Form Management (Single Responsibility)
    const { formData: category, setFormData, updateField, reset: resetForm, submitted, setSubmitted, setValidationErrors, getFieldError } = useForm<CreateCategoryDto>(emptyCategory);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Category[] | null>(null);
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
            categoryName: 'categoryName',
            description: 'description',
            createdAt: 'createdAt'
        };

        const backendField = fieldMapping[event.sortField] || event.sortField;

        // Only set sort if field is sortable on backend
        const sortableFields = ['categoryName', 'description', 'createdAt', 'updatedAt'];
        if (sortableFields.includes(backendField)) {
            setSortBy(backendField);
            setOrder(event.sortOrder === 1 ? 'ASC' : 'DESC');
        }
    };

    const openNew = () => {
        resetForm();
        setEditingCategoryId(null);
        categoryDialog.open();
    };

    const editCategory = (categoryData: Category) => {
        setFormData({
            categoryName: categoryData.categoryName,
            description: categoryData.description || '',
            photo: categoryData.photo || ''
        });
        setEditingCategoryId(categoryData.id);
        categoryDialog.open();
    };

    const saveCategory = async () => {
        setSubmitted(true);

        if (category.categoryName && category.categoryName.trim()) {
            try {
                const updateData: UpdateCategoryDto = {
                    categoryName: category.categoryName,
                    description: category.description || undefined,
                    photo: category.photo || undefined
                };

                const success = editingCategoryId ? await updateItem(editingCategoryId, updateData) : await createItem(category);

                if (success) {
                    categoryDialog.close();
                    resetForm();
                    setEditingCategoryId(null);
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
                        detail: error.message || 'Failed to save category',
                        life: 3000
                    });
                }
            }
        }
    };

    const confirmDeleteCategory = (categoryData: Category) => {
        setEditingCategoryId(categoryData.id);
        setCategoryToDelete(categoryData);
        deleteCategoryDialog.open();
    };

    const handleDeleteCategory = async () => {
        if (editingCategoryId) {
            const success = await deleteItem(editingCategoryId);
            if (success) {
                deleteCategoryDialog.close();
                setEditingCategoryId(null);
                setCategoryToDelete(null);
            }
        }
    };

    const confirmDeleteSelected = () => {
        deleteCategoriesDialog.open();
    };

    const handleDeleteSelected = async () => {
        if (selectedCategories && selectedCategories.length > 0) {
            const ids = selectedCategories.map((cat) => cat.id);
            const success = await deleteItems(ids);
            if (success) {
                deleteCategoriesDialog.close();
                setSelectedCategories(null);
            }
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        updateField(name as keyof CreateCategoryDto, val);
    };

    const rightToolbarContent = (
        <div className="flex gap-2">
            <Button icon="pi pi-th-large" severity={viewMode === 'grid' ? undefined : 'secondary'} onClick={() => setViewMode('grid')} tooltip="Grid View" tooltipOptions={{ position: 'bottom' }} />
            <Button icon="pi pi-list" severity={viewMode === 'list' ? undefined : 'secondary'} onClick={() => setViewMode('list')} tooltip="List View" tooltipOptions={{ position: 'bottom' }} />
            <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <CrudToolbar onNew={openNew} onDelete={confirmDeleteSelected} onExport={exportCSV} canDelete={!!selectedCategories && selectedCategories.length > 0} rightContent={rightToolbarContent} />

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
                                value={categories}
                                selection={selectedCategories}
                                onSelectionChange={(e) => setSelectedCategories(e.value as Category[])}
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
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                                emptyMessage="No categories found."
                                header={<DataTableHeader title="Manage Categories" globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />}
                                responsiveLayout="scroll"
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                                <Column
                                    header="Image"
                                    body={(rowData: Category) => {
                                        const FALLBACK_IMAGE =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        return (
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
                                        );
                                    }}
                                    headerStyle={{ width: '8rem' }}
                                ></Column>
                                <Column field="categoryName" header="Name" sortable body={(rowData: Category) => rowData.categoryName} headerStyle={{ minWidth: '15rem' }}></Column>
                                <Column field="description" header="Description" sortable body={(rowData: Category) => rowData.description || '-'} headerStyle={{ minWidth: '20rem' }}></Column>
                                <Column field="createdAt" header="Created Date" sortable body={(rowData: Category) => new Date(rowData.createdAt).toLocaleDateString()} headerStyle={{ minWidth: '12rem' }}></Column>
                                <Column
                                    body={(rowData: Category) => (
                                        <>
                                            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editCategory(rowData)} />
                                            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteCategory(rowData)} />
                                        </>
                                    )}
                                    headerStyle={{ minWidth: '10rem' }}
                                ></Column>
                            </DataTable>
                        </div>
                    ) : (
                        <div>
                            <DataTableHeader title="Manage Categories" globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />
                            <CategoryGridView categories={categories} loading={loading} first={first} rows={rows} totalRecords={totalRecords} onPage={setFirst} onEdit={editCategory} onDelete={confirmDeleteCategory} />
                        </div>
                    )}

                    <CategoryFormDialog
                        visible={categoryDialog.visible}
                        onHide={categoryDialog.close}
                        onSave={saveCategory}
                        category={category}
                        onInputChange={onInputChange}
                        submitted={submitted}
                        isEditing={!!editingCategoryId}
                        getFieldError={getFieldError}
                    />

                    <DeleteDialog
                        visible={deleteCategoryDialog.visible}
                        onHide={deleteCategoryDialog.close}
                        onConfirm={handleDeleteCategory}
                        itemDetails={
                            categoryToDelete && (
                                <>
                                    <p className="m-0 mb-2">
                                        <strong>Name:</strong> {categoryToDelete.categoryName}
                                    </p>
                                    {categoryToDelete.description && (
                                        <p className="m-0">
                                            <strong>Description:</strong> {categoryToDelete.description}
                                        </p>
                                    )}
                                </>
                            )
                        }
                    />

                    <DeleteDialog
                        visible={deleteCategoriesDialog.visible}
                        onHide={deleteCategoriesDialog.close}
                        onConfirm={handleDeleteSelected}
                        multiple
                        count={selectedCategories?.length || 0}
                        itemNames={selectedCategories?.map((cat) => cat.categoryName) || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoriesModule;
