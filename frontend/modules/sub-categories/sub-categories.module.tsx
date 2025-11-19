'use client';
import React, { useRef, useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { subCategoriesApi, SubCategory, CreateSubCategoryDto } from '@/lib/api/sub-categories.api';
import { categoriesApi, Category } from '@/lib/api/categories.api';
import { useCrudData, useDialog, useForm } from '@/hooks';
import { DeleteDialog, DataTableHeader, CrudToolbar } from '@/components/crud';
import { SubCategoryFormDialog, SubCategoryGridView } from './components';
import { ValidationError } from '@/lib/api/errors';

const FALLBACK_IMAGE =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

const SubCategoriesModule: React.FC = () => {
    const emptySubCategory: CreateSubCategoryDto = {
        subCategoryName: '',
        categoryId: 0,
        description: '',
        photo: '',
        displayOrder: 0,
        isActive: true
    };

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // State for categories dropdown
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);

    // CRUD Data Management (Single Responsibility)
    const {
        data: subCategories,
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
        deleteItems,
        fetchData
    } = useCrudData<SubCategory>({
        api: subCategoriesApi,
        toast,
        sortBy: 'createdAt',
        order: 'DESC',
        additionalParams: selectedCategoryFilter ? { categoryId: selectedCategoryFilter } : undefined
    });

    // Dialog Management (Single Responsibility)
    const subCategoryDialog = useDialog(false);
    const deleteSubCategoryDialog = useDialog(false);
    const deleteSubCategoriesDialog = useDialog(false);

    // Form Management (Single Responsibility)
    const {
        formData: subCategory,
        setFormData,
        updateField,
        reset: resetForm,
        submitted,
        setSubmitted,
        setValidationErrors,
        getFieldError
    } = useForm<CreateSubCategoryDto>(emptySubCategory);
    const [editingSubCategoryId, setEditingSubCategoryId] = useState<number | null>(null);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState<SubCategory | null>(null);
    const [selectedSubCategories, setSelectedSubCategories] = useState<SubCategory[] | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApi.getAll({ page: 1, limit: 1000 });
                if (response.success && response.data) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Note: useCrudData hook automatically resets to first page when additionalParams change

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
            subCategoryName: 'subCategoryName',
            categoryId: 'categoryId',
            description: 'description',
            displayOrder: 'displayOrder',
            createdAt: 'createdAt',
            isActive: 'isActive'
        };

        const backendField = fieldMapping[event.sortField] || event.sortField;

        // Only set sort if field is sortable on backend
        const sortableFields = ['subCategoryName', 'categoryId', 'description', 'displayOrder', 'createdAt', 'updatedAt', 'isActive'];
        if (sortableFields.includes(backendField)) {
            setSortBy(backendField);
            setOrder(event.sortOrder === 1 ? 'ASC' : 'DESC');
        }
    };

    const openNew = () => {
        resetForm();
        setEditingSubCategoryId(null);
        subCategoryDialog.open();
    };

    const editSubCategory = (subCategoryData: SubCategory) => {
        setFormData({
            subCategoryName: subCategoryData.subCategoryName,
            categoryId: subCategoryData.categoryId,
            description: subCategoryData.description || '',
            photo: subCategoryData.photo || '',
            displayOrder: subCategoryData.displayOrder,
            isActive: subCategoryData.isActive
        });
        setEditingSubCategoryId(subCategoryData.id);
        subCategoryDialog.open();
    };

    const saveSubCategory = async () => {
        setSubmitted(true);

        if (subCategory.subCategoryName && subCategory.subCategoryName.trim() && subCategory.categoryId) {
            try {
                const updateData: Partial<SubCategory> = {
                    subCategoryName: subCategory.subCategoryName,
                    categoryId: subCategory.categoryId,
                    description: subCategory.description || undefined,
                    photo: subCategory.photo || undefined,
                    displayOrder: subCategory.displayOrder,
                    isActive: subCategory.isActive
                };

                const success = editingSubCategoryId
                    ? await updateItem(editingSubCategoryId, updateData)
                    : await createItem(subCategory);

                if (success) {
                    subCategoryDialog.close();
                    resetForm();
                    setEditingSubCategoryId(null);
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
                        detail: error.message || 'Failed to save sub-category',
                        life: 3000
                    });
                }
            }
        }
    };

    const confirmDeleteSubCategory = (subCategoryData: SubCategory) => {
        setEditingSubCategoryId(subCategoryData.id);
        setSubCategoryToDelete(subCategoryData);
        deleteSubCategoryDialog.open();
    };

    const handleDeleteSubCategory = async () => {
        if (editingSubCategoryId) {
            const success = await deleteItem(editingSubCategoryId);
            if (success) {
                deleteSubCategoryDialog.close();
                setEditingSubCategoryId(null);
                setSubCategoryToDelete(null);
            }
        }
    };

    const confirmDeleteSelected = () => {
        deleteSubCategoriesDialog.open();
    };

    const handleDeleteSelected = async () => {
        if (selectedSubCategories && selectedSubCategories.length > 0) {
            const ids = selectedSubCategories.map((subCat) => subCat.id);
            const success = await deleteItems(ids);
            if (success) {
                deleteSubCategoriesDialog.close();
                setSelectedSubCategories(null);
            }
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        updateField(name as keyof CreateSubCategoryDto, val);
    };

    const onDropdownChange = (name: string, value: any) => {
        updateField(name as keyof CreateSubCategoryDto, value);
    };

    const onNumberChange = (name: string, value: number | null) => {
        updateField(name as keyof CreateSubCategoryDto, value ?? 0);
    };

    const onCheckboxChange = (name: string, value: boolean) => {
        updateField(name as keyof CreateSubCategoryDto, value);
    };

    const categoryFilterTemplate = (
        <div className="flex align-items-center gap-2">
            <label htmlFor="categoryFilter" className="font-semibold">
                Filter by Category:
            </label>
            <Dropdown
                id="categoryFilter"
                value={selectedCategoryFilter}
                options={categories}
                onChange={(e) => setSelectedCategoryFilter(e.value)}
                optionLabel="categoryName"
                optionValue="id"
                placeholder="All Categories"
                showClear
                className="w-full md:w-20rem"
            />
        </div>
    );

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
                        canDelete={!!selectedSubCategories && selectedSubCategories.length > 0}
                        rightContent={rightToolbarContent}
                    />

                    <div className="mb-3">{categoryFilterTemplate}</div>

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
                                value={subCategories}
                                selection={selectedSubCategories}
                                onSelectionChange={(e) => setSelectedSubCategories(e.value as SubCategory[])}
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
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sub-categories"
                                emptyMessage="No sub-categories found."
                                header={
                                    <DataTableHeader
                                        title="Manage Sub-Categories"
                                        globalFilter={globalFilter}
                                        onGlobalFilterChange={setGlobalFilter}
                                    />
                                }
                                responsiveLayout="scroll"
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                                <Column
                                    header="Image"
                                    body={(rowData: SubCategory) => (
                                        <img
                                            src={rowData.photo || FALLBACK_IMAGE}
                                            alt={rowData.subCategoryName}
                                            className="shadow-2 border-round"
                                            style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== FALLBACK_IMAGE) {
                                                    target.src = FALLBACK_IMAGE;
                                                }
                                            }}
                                        />
                                    )}
                                    headerStyle={{ width: '8rem' }}
                                ></Column>
                                <Column
                                    field="subCategoryName"
                                    header="Name"
                                    sortable
                                    body={(rowData: SubCategory) => rowData.subCategoryName}
                                    headerStyle={{ minWidth: '15rem' }}
                                ></Column>
                                <Column
                                    field="categoryId"
                                    header="Category"
                                    sortable
                                    body={(rowData: SubCategory) => rowData.category?.categoryName || '-'}
                                    headerStyle={{ minWidth: '12rem' }}
                                ></Column>
                                <Column
                                    field="displayOrder"
                                    header="Order"
                                    sortable
                                    body={(rowData: SubCategory) => rowData.displayOrder}
                                    headerStyle={{ minWidth: '8rem' }}
                                ></Column>
                                <Column
                                    field="description"
                                    header="Description"
                                    sortable
                                    body={(rowData: SubCategory) => rowData.description || '-'}
                                    headerStyle={{ minWidth: '20rem' }}
                                ></Column>
                                <Column
                                    field="isActive"
                                    header="Status"
                                    sortable
                                    body={(rowData: SubCategory) => (
                                        <Tag value={rowData.isActive ? 'Active' : 'Inactive'} severity={rowData.isActive ? 'success' : 'danger'} />
                                    )}
                                    headerStyle={{ minWidth: '8rem' }}
                                ></Column>
                                <Column
                                    field="createdAt"
                                    header="Created Date"
                                    sortable
                                    body={(rowData: SubCategory) => new Date(rowData.createdAt).toLocaleDateString()}
                                    headerStyle={{ minWidth: '12rem' }}
                                ></Column>
                                <Column
                                    body={(rowData: SubCategory) => (
                                        <>
                                            <Button
                                                icon="pi pi-pencil"
                                                rounded
                                                severity="success"
                                                className="mr-2"
                                                onClick={() => editSubCategory(rowData)}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                rounded
                                                severity="warning"
                                                onClick={() => confirmDeleteSubCategory(rowData)}
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
                                title="Manage Sub-Categories"
                                globalFilter={globalFilter}
                                onGlobalFilterChange={setGlobalFilter}
                            />
                            <SubCategoryGridView
                                subCategories={subCategories}
                                loading={loading}
                                first={first}
                                rows={rows}
                                totalRecords={totalRecords}
                                onPage={setFirst}
                                onEdit={editSubCategory}
                                onDelete={confirmDeleteSubCategory}
                            />
                        </div>
                    )}

                    <SubCategoryFormDialog
                        visible={subCategoryDialog.visible}
                        onHide={subCategoryDialog.close}
                        onSave={saveSubCategory}
                        subCategory={subCategory}
                        categories={categories}
                        onInputChange={onInputChange}
                        onDropdownChange={onDropdownChange}
                        onNumberChange={onNumberChange}
                        onCheckboxChange={onCheckboxChange}
                        submitted={submitted}
                        isEditing={!!editingSubCategoryId}
                        getFieldError={getFieldError}
                    />

                    <DeleteDialog
                        visible={deleteSubCategoryDialog.visible}
                        onHide={deleteSubCategoryDialog.close}
                        onConfirm={handleDeleteSubCategory}
                        itemDetails={
                            subCategoryToDelete && (
                                <>
                                    <p className="m-0 mb-2">
                                        <strong>Name:</strong> {subCategoryToDelete.subCategoryName}
                                    </p>
                                    {subCategoryToDelete.category && (
                                        <p className="m-0 mb-2">
                                            <strong>Category:</strong> {subCategoryToDelete.category.categoryName}
                                        </p>
                                    )}
                                    {subCategoryToDelete.description && (
                                        <p className="m-0">
                                            <strong>Description:</strong> {subCategoryToDelete.description}
                                        </p>
                                    )}
                                </>
                            )
                        }
                    />

                    <DeleteDialog
                        visible={deleteSubCategoriesDialog.visible}
                        onHide={deleteSubCategoriesDialog.close}
                        onConfirm={handleDeleteSelected}
                        multiple
                        count={selectedSubCategories?.length || 0}
                        itemNames={selectedSubCategories?.map((subCat) => subCat.subCategoryName) || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default SubCategoriesModule;
