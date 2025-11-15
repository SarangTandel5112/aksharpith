'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { productsApi, Product, CreateProductDto, UpdateProductDto } from '@/lib/api/products.api';
import { categoriesApi, Category } from '@/lib/api/categories.api';
import { useCrudData, useDialog, useForm, useImageUpload } from '@/hooks';
import { DeleteDialog, DataTableHeader, CrudToolbar } from '@/components/crud';
import { ProductFormDialog, ProductTableColumns, ProductGridView } from './components';
import { ValidationError } from '@/lib/api/errors';

const ProductsModule: React.FC = () => {
    const emptyProduct: CreateProductDto = {
        productName: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        categoryId: 0,
        photo: ''
    };

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    // CRUD Data Management (Single Responsibility)
    const {
        data: products,
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
    } = useCrudData<Product>({
        api: productsApi,
        toast,
        sortBy: 'createdAt',
        order: 'DESC'
    });

    // Dialog Management (Single Responsibility)
    const productDialog = useDialog(false);
    const deleteProductDialog = useDialog(false);
    const deleteProductsDialog = useDialog(false);

    // Form Management (Single Responsibility)
    const { formData: product, setFormData, updateField, reset: resetForm, submitted, setSubmitted, setValidationErrors, getFieldError } = useForm<CreateProductDto & { imageUrl?: string }>({ ...emptyProduct, imageUrl: '' });
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<Product[] | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Image Upload Management (Single Responsibility)
    const { uploading, imageUrl, fileUploadRef, uploadImage, setImageUrl, clearImage } = useImageUpload(toast);

    // Fetch categories on mount (Single Responsibility)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApi.getAll({ limit: 100 });
                if (response.success && response.data) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
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
            productName: 'productName',
            price: 'price',
            stockQuantity: 'stockQuantity',
            description: 'description',
            createdAt: 'createdAt',
            category: 'categoryId' // Map category to categoryId for sorting
        };

        const backendField = fieldMapping[event.sortField] || event.sortField;

        // Only set sort if field is sortable on backend
        const sortableFields = ['productName', 'price', 'stockQuantity', 'description', 'categoryId', 'category', 'createdAt', 'updatedAt'];
        if (sortableFields.includes(backendField)) {
            setSortBy(backendField);
            setOrder(event.sortOrder === 1 ? 'ASC' : 'DESC');
        }
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const openNew = () => {
        resetForm();
        setEditingProductId(null);
        clearImage();
        productDialog.open();
    };

    const editProduct = (productData: Product) => {
        setFormData({
            productName: productData.productName,
            description: productData.description || '',
            price: productData.price || 0,
            stockQuantity: productData.stockQuantity || 0,
            categoryId: productData.categoryId,
            photo: productData.photo || '',
            imageUrl: productData.photo || ''
        });
        setImageUrl(productData.photo || '');
        setEditingProductId(productData.id);
        productDialog.open();
    };

    const handleImageUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];
        if (!file) return;

        try {
            const uploadedUrl = await uploadImage(file);
            updateField('photo', uploadedUrl);
            updateField('imageUrl', uploadedUrl);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Image uploaded successfully',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Failed to upload image',
                life: 3000
            });
        } finally {
            fileUploadRef.current?.clear();
        }
    };

    const saveProduct = async () => {
        setSubmitted(true);

        if (product.productName && product.productName.trim() && product.categoryId) {
            try {
                const updateData: UpdateProductDto = {
                    productName: product.productName,
                    description: product.description || undefined,
                    price: product.price || undefined,
                    stockQuantity: product.stockQuantity || undefined,
                    photo: product.photo || imageUrl || undefined,
                    categoryId: product.categoryId
                };

                const success = editingProductId ? await updateItem(editingProductId, updateData) : await createItem(updateData as CreateProductDto);

                if (success) {
                    productDialog.close();
                    resetForm();
                    clearImage();
                    setEditingProductId(null);
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
                        detail: error.message || 'Failed to save product',
                        life: 3000
                    });
                }
            }
        }
    };

    const confirmDeleteProduct = (productData: Product) => {
        setEditingProductId(productData.id);
        setProductToDelete(productData);
        deleteProductDialog.open();
    };

    const handleDeleteProduct = async () => {
        if (editingProductId) {
            const success = await deleteItem(editingProductId);
            if (success) {
                deleteProductDialog.close();
                setEditingProductId(null);
                setProductToDelete(null);
            }
        }
    };

    const confirmDeleteSelected = () => {
        deleteProductsDialog.open();
    };

    const handleDeleteSelected = async () => {
        if (selectedProducts && selectedProducts.length > 0) {
            const ids = selectedProducts.map((p) => p.id);
            const success = await deleteItems(ids);
            if (success) {
                deleteProductsDialog.close();
                setSelectedProducts(null);
            }
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        updateField(name as keyof CreateProductDto, val);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        updateField(name as keyof CreateProductDto, val);
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
                    <CrudToolbar onNew={openNew} onDelete={confirmDeleteSelected} onExport={exportCSV} canDelete={!!selectedProducts && selectedProducts.length > 0} rightContent={rightToolbarContent} />

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
                                value={products}
                                selection={selectedProducts}
                                onSelectionChange={(e) => setSelectedProducts(e.value as Product[])}
                                dataKey="id"
                                lazy
                                paginator
                                rows={rows}
                                first={first}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                onSort={onSort}
                                sortField={sortBy}
                                sortOrder={order === 'ASC' ? 1 : order === 'DESC' ? -1 : 0}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                                globalFilter={globalFilter}
                                emptyMessage="No products found."
                                header={<DataTableHeader title="Manage Products" globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />}
                                responsiveLayout="scroll"
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                                <Column
                                    header="Image"
                                    body={(rowData: Product) => {
                                        const FALLBACK_IMAGE =
                                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        return (
                                            <img
                                                src={rowData.photo || FALLBACK_IMAGE}
                                                alt={rowData.productName}
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
                                    style={{ width: '120px' }}
                                ></Column>
                                <Column field="productName" header="Name" sortable body={(rowData: Product) => rowData.productName} headerStyle={{ minWidth: '15rem' }}></Column>
                                <Column field="category" header="Category" sortable body={(rowData: Product) => rowData.category?.categoryName || 'N/A'} headerStyle={{ minWidth: '10rem' }}></Column>
                                <Column field="price" header="Price" sortable body={(rowData: Product) => (rowData.price ? formatCurrency(rowData.price) : 'N/A')}></Column>
                                <Column field="stockQuantity" header="Stock" sortable body={(rowData: Product) => rowData.stockQuantity ?? 'N/A'}></Column>
                                <Column field="description" header="Description" sortable body={(rowData: Product) => rowData.description || '-'} headerStyle={{ minWidth: '20rem' }}></Column>
                                <Column field="createdAt" header="Created Date" sortable body={(rowData: Product) => new Date(rowData.createdAt).toLocaleDateString()} headerStyle={{ minWidth: '12rem' }}></Column>
                                <Column
                                    body={(rowData: Product) => (
                                        <>
                                            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />
                                            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
                                        </>
                                    )}
                                    headerStyle={{ minWidth: '10rem' }}
                                ></Column>
                            </DataTable>
                        </div>
                    ) : (
                        <>
                            <DataTableHeader title="Manage Products" globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />
                            <ProductGridView products={products} loading={loading} first={first} rows={rows} totalRecords={totalRecords} onPage={setFirst} onEdit={editProduct} onDelete={confirmDeleteProduct} formatCurrency={formatCurrency} />
                        </>
                    )}

                    <ProductFormDialog
                        visible={productDialog.visible}
                        onHide={productDialog.close}
                        onSave={saveProduct}
                        product={product}
                        onInputChange={onInputChange}
                        onInputNumberChange={onInputNumberChange}
                        onImageUpload={handleImageUpload}
                        onCategoryChange={(categoryId) => updateField('categoryId', categoryId)}
                        onImageUrlChange={(url) => {
                            setImageUrl(url);
                            updateField('photo', url);
                        }}
                        submitted={submitted}
                        isEditing={!!editingProductId}
                        categories={categories}
                        uploading={uploading}
                        imageUrl={imageUrl}
                        fileUploadRef={fileUploadRef}
                        getFieldError={getFieldError}
                    />

                    <DeleteDialog
                        visible={deleteProductDialog.visible}
                        onHide={deleteProductDialog.close}
                        onConfirm={handleDeleteProduct}
                        itemDetails={
                            productToDelete && (
                                <>
                                    <p className="m-0 mb-2">
                                        <strong>Product Name:</strong> {productToDelete.productName}
                                    </p>
                                    {productToDelete.category && (
                                        <p className="m-0 mb-2">
                                            <strong>Category:</strong> {productToDelete.category.categoryName}
                                        </p>
                                    )}
                                    {productToDelete.price && (
                                        <p className="m-0">
                                            <strong>Price:</strong> {formatCurrency(productToDelete.price)}
                                        </p>
                                    )}
                                </>
                            )
                        }
                    />

                    <DeleteDialog
                        visible={deleteProductsDialog.visible}
                        onHide={deleteProductsDialog.close}
                        onConfirm={handleDeleteSelected}
                        multiple
                        count={selectedProducts?.length || 0}
                        itemNames={selectedProducts?.map((p) => p.productName) || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductsModule;
