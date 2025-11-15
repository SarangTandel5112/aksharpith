import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { CreateCategoryDto } from '@/lib/api/categories.api';

export interface CategoryFormDialogProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    category: CreateCategoryDto;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => void;
    submitted: boolean;
    isEditing: boolean;
    validationErrors?: Record<string, string[]>;
    getFieldError?: (field: string) => string | undefined;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({ visible, onHide, onSave, category, onInputChange, submitted, isEditing, validationErrors = {}, getFieldError }) => {
    return (
        <Dialog
            visible={visible}
            style={{ width: '450px' }}
            header={isEditing ? 'Edit Category' : 'New Category'}
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
                <label htmlFor="categoryName">Name</label>
                <InputText
                    id="categoryName"
                    value={category.categoryName}
                    onChange={(e) => onInputChange(e, 'categoryName')}
                    required
                    autoFocus
                    className={classNames({
                        'p-invalid': (submitted && !category.categoryName) || getFieldError?.('categoryName')
                    })}
                />
                {(submitted && !category.categoryName && <small className="p-invalid">Name is required.</small>) || (getFieldError?.('categoryName') && <small className="p-invalid">{getFieldError('categoryName')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                    id="description"
                    value={category.description}
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
                <label htmlFor="photo">Photo URL</label>
                <InputText
                    id="photo"
                    value={category.photo}
                    onChange={(e) => onInputChange(e, 'photo')}
                    placeholder="Enter image URL"
                    className={classNames({
                        'p-invalid': getFieldError?.('photo')
                    })}
                />
                {getFieldError?.('photo') && <small className="p-invalid">{getFieldError('photo')}</small>}
                {!getFieldError?.('photo') && <small className="text-500">Enter a valid image URL or leave blank for default image</small>}
            </div>
        </Dialog>
    );
};
