import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';
import { CreateSubCategoryDto } from '@/lib/api/sub-categories.api';
import { Category } from '@/lib/api/categories.api';

export interface SubCategoryFormDialogProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    subCategory: CreateSubCategoryDto;
    categories: Category[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => void;
    onDropdownChange: (name: string, value: any) => void;
    onNumberChange: (name: string, value: number | null) => void;
    onCheckboxChange: (name: string, value: boolean) => void;
    submitted: boolean;
    isEditing: boolean;
    validationErrors?: Record<string, string[]>;
    getFieldError?: (field: string) => string | undefined;
}

export const SubCategoryFormDialog: React.FC<SubCategoryFormDialogProps> = ({
    visible,
    onHide,
    onSave,
    subCategory,
    categories,
    onInputChange,
    onDropdownChange,
    onNumberChange,
    onCheckboxChange,
    submitted,
    isEditing,
    validationErrors = {},
    getFieldError
}) => {
    return (
        <Dialog
            visible={visible}
            style={{ width: '450px' }}
            header={isEditing ? 'Edit Sub-Category' : 'New Sub-Category'}
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
                <label htmlFor="subCategoryName">Name</label>
                <InputText
                    id="subCategoryName"
                    value={subCategory.subCategoryName}
                    onChange={(e) => onInputChange(e, 'subCategoryName')}
                    required
                    autoFocus
                    className={classNames({
                        'p-invalid': (submitted && !subCategory.subCategoryName) || getFieldError?.('subCategoryName')
                    })}
                />
                {(submitted && !subCategory.subCategoryName && <small className="p-invalid">Name is required.</small>) ||
                    (getFieldError?.('subCategoryName') && <small className="p-invalid">{getFieldError('subCategoryName')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="categoryId">Category</label>
                <Dropdown
                    id="categoryId"
                    value={subCategory.categoryId}
                    options={categories}
                    onChange={(e) => onDropdownChange('categoryId', e.value)}
                    optionLabel="categoryName"
                    optionValue="id"
                    placeholder="Select a category"
                    className={classNames({
                        'p-invalid': (submitted && !subCategory.categoryId) || getFieldError?.('categoryId')
                    })}
                />
                {(submitted && !subCategory.categoryId && <small className="p-invalid">Category is required.</small>) ||
                    (getFieldError?.('categoryId') && <small className="p-invalid">{getFieldError('categoryId')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                    id="description"
                    value={subCategory.description || ''}
                    onChange={(e) => onInputChange(e, 'description')}
                    rows={3}
                    cols={20}
                    className={classNames({
                        'p-invalid': getFieldError?.('description')
                    })}
                />
                {getFieldError?.('description') && <small className="p-invalid">{getFieldError('description')}</small>}
            </div>
            <div className="field">
                <label htmlFor="photo">Photo S3 Key</label>
                <InputText
                    id="photo"
                    value={subCategory.photo || ''}
                    onChange={(e) => onInputChange(e, 'photo')}
                    placeholder="Enter S3 key for image"
                    className={classNames({
                        'p-invalid': getFieldError?.('photo')
                    })}
                />
                {getFieldError?.('photo') && <small className="p-invalid">{getFieldError('photo')}</small>}
                {!getFieldError?.('photo') && <small className="text-500">Enter S3 key or leave blank for default image</small>}
            </div>
            <div className="field">
                <label htmlFor="displayOrder">Display Order</label>
                <InputNumber
                    id="displayOrder"
                    value={subCategory.displayOrder ?? 0}
                    onValueChange={(e) => onNumberChange('displayOrder', e.value)}
                    showButtons
                    min={0}
                    className={classNames({
                        'p-invalid': getFieldError?.('displayOrder')
                    })}
                />
                {getFieldError?.('displayOrder') && <small className="p-invalid">{getFieldError('displayOrder')}</small>}
            </div>
            <div className="field-checkbox">
                <Checkbox
                    inputId="isActive"
                    checked={subCategory.isActive ?? true}
                    onChange={(e) => onCheckboxChange('isActive', e.checked ?? true)}
                />
                <label htmlFor="isActive" className="ml-2">
                    Active
                </label>
            </div>
        </Dialog>
    );
};
