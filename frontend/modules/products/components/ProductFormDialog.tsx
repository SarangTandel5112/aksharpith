import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { classNames } from 'primereact/utils';
import { CreateProductDto } from '@/lib/api/products.api';
import { Category } from '@/lib/api/categories.api';

export interface ProductFormDialogProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    product: CreateProductDto & { imageUrl?: string };
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => void;
    onInputNumberChange: (e: InputNumberValueChangeEvent, name: string) => void;
    onImageUpload: (event: FileUploadHandlerEvent) => void;
    onCategoryChange: (categoryId: number) => void;
    onImageUrlChange: (url: string) => void;
    submitted: boolean;
    isEditing: boolean;
    categories: Category[];
    uploading: boolean;
    imageUrl: string;
    fileUploadRef: React.RefObject<FileUpload>;
    validationErrors?: Record<string, string[]>;
    getFieldError?: (field: string) => string | undefined;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
    visible,
    onHide,
    onSave,
    product,
    onInputChange,
    onInputNumberChange,
    onImageUpload,
    onCategoryChange,
    onImageUrlChange,
    submitted,
    isEditing,
    categories,
    uploading,
    imageUrl,
    fileUploadRef,
    validationErrors = {},
    getFieldError
}) => {
    return (
        <Dialog
            visible={visible}
            style={{ width: '600px' }}
            header={isEditing ? 'Edit Product' : 'New Product'}
            modal
            className="p-fluid"
            footer={
                <>
                    <Button label="Cancel" icon="pi pi-times" text onClick={onHide} />
                    <Button label="Save" icon="pi pi-check" text onClick={onSave} />
                </>
            }
            onHide={onHide}
        >
            <div className="field">
                <label htmlFor="photo">Product Photo URL</label>
                <InputText
                    id="photo"
                    value={product.photo || ''}
                    onChange={(e) => onInputChange(e, 'photo')}
                    placeholder="Enter image URL"
                    className={classNames({
                        'p-invalid': getFieldError?.('photo')
                    })}
                />
                {getFieldError?.('photo') && <small className="p-invalid">{getFieldError('photo')}</small>}
                {!getFieldError?.('photo') && <small className="text-500">Enter a valid image URL or leave blank for default image</small>}
            </div>
            <div className="field">
                <label htmlFor="image">Or Upload Image to S3</label>
                {imageUrl && (
                    <div className="mb-3">
                        <img src={imageUrl} alt="Product" width="200" className="block shadow-2" style={{ borderRadius: '8px', margin: '0 auto' }} />
                    </div>
                )}
                <FileUpload ref={fileUploadRef} mode="basic" accept="image/*" maxFileSize={5000000} chooseLabel="Upload Image to S3" className="w-full" customUpload uploadHandler={onImageUpload} disabled={uploading} />
                {uploading && <small className="text-600">Uploading to S3...</small>}
                {imageUrl && (
                    <div className="mt-2">
                        <InputText id="imageUrl" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} placeholder="Or enter S3 image URL" className="w-full" />
                    </div>
                )}
            </div>
            <div className="field">
                <label htmlFor="productName">Product Name</label>
                <InputText
                    id="productName"
                    value={product.productName || ''}
                    onChange={(e) => onInputChange(e, 'productName')}
                    required
                    autoFocus
                    className={classNames({
                        'p-invalid': (submitted && !product.productName) || getFieldError?.('productName')
                    })}
                />
                {(submitted && !product.productName && <small className="p-invalid">Product name is required.</small>) || (getFieldError?.('productName') && <small className="p-invalid">{getFieldError('productName')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                    id="description"
                    value={product.description || ''}
                    onChange={(e) => onInputChange(e, 'description')}
                    rows={4}
                    placeholder="Enter product description"
                    className={classNames({
                        'p-invalid': getFieldError?.('description')
                    })}
                />
                {getFieldError?.('description') && <small className="p-invalid">{getFieldError('description')}</small>}
            </div>
            <div className="field">
                <label htmlFor="category">Category</label>
                <Dropdown
                    id="category"
                    value={product.categoryId}
                    options={categories}
                    onChange={(e) => onCategoryChange(e.value)}
                    optionLabel="categoryName"
                    optionValue="id"
                    placeholder="Select a category"
                    className={classNames({
                        'p-invalid': (submitted && !product.categoryId) || getFieldError?.('categoryId')
                    })}
                />
                {(submitted && !product.categoryId && <small className="p-invalid">Category is required.</small>) || (getFieldError?.('categoryId') && <small className="p-invalid">{getFieldError('categoryId')}</small>)}
            </div>
            <div className="formgrid grid">
                <div className="field col">
                    <label htmlFor="price">Price</label>
                    <InputNumber
                        id="price"
                        value={product.price || 0}
                        onValueChange={(e) => onInputNumberChange(e, 'price')}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        prefix="$"
                        className={classNames({
                            'p-invalid': getFieldError?.('price')
                        })}
                    />
                    {getFieldError?.('price') && <small className="p-invalid">{getFieldError('price')}</small>}
                </div>
                <div className="field col">
                    <label htmlFor="stockQuantity">Stock Quantity</label>
                    <InputNumber
                        id="stockQuantity"
                        value={product.stockQuantity || 0}
                        onValueChange={(e) => onInputNumberChange(e, 'stockQuantity')}
                        min={0}
                        className={classNames({
                            'p-invalid': getFieldError?.('stockQuantity')
                        })}
                    />
                    {getFieldError?.('stockQuantity') && <small className="p-invalid">{getFieldError('stockQuantity')}</small>}
                </div>
            </div>
        </Dialog>
    );
};
