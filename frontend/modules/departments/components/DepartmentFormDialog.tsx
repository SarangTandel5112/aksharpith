import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';
import { CreateDepartmentDto } from '@/lib/api/departments.api';

export interface DepartmentFormDialogProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    department: CreateDepartmentDto;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => void;
    onCheckboxChange: (name: string, value: boolean) => void;
    submitted: boolean;
    isEditing: boolean;
    validationErrors?: Record<string, string[]>;
    getFieldError?: (field: string) => string | undefined;
}

export const DepartmentFormDialog: React.FC<DepartmentFormDialogProps> = ({
    visible,
    onHide,
    onSave,
    department,
    onInputChange,
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
            header={isEditing ? 'Edit Department' : 'New Department'}
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
                <label htmlFor="departmentName">Name</label>
                <InputText
                    id="departmentName"
                    value={department.departmentName}
                    onChange={(e) => onInputChange(e, 'departmentName')}
                    required
                    autoFocus
                    className={classNames({
                        'p-invalid': (submitted && !department.departmentName) || getFieldError?.('departmentName')
                    })}
                />
                {(submitted && !department.departmentName && <small className="p-invalid">Name is required.</small>) || (getFieldError?.('departmentName') && <small className="p-invalid">{getFieldError('departmentName')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="departmentCode">Department Code</label>
                <InputText
                    id="departmentCode"
                    value={department.departmentCode || ''}
                    onChange={(e) => onInputChange(e, 'departmentCode')}
                    maxLength={10}
                    placeholder="Max 10 characters"
                    className={classNames({
                        'p-invalid': getFieldError?.('departmentCode')
                    })}
                />
                {getFieldError?.('departmentCode') && <small className="p-invalid">{getFieldError('departmentCode')}</small>}
                {!getFieldError?.('departmentCode') && <small className="text-500">Optional unique code (max 10 characters)</small>}
            </div>
            <div className="field">
                <label htmlFor="description">Description</label>
                <InputTextarea
                    id="description"
                    value={department.description || ''}
                    onChange={(e) => onInputChange(e, 'description')}
                    rows={3}
                    cols={20}
                    className={classNames({
                        'p-invalid': getFieldError?.('description')
                    })}
                />
                {getFieldError?.('description') && <small className="p-invalid">{getFieldError('description')}</small>}
            </div>
            <div className="field-checkbox">
                <Checkbox
                    inputId="isActive"
                    checked={department.isActive ?? true}
                    onChange={(e) => onCheckboxChange('isActive', e.checked ?? true)}
                />
                <label htmlFor="isActive" className="ml-2">Active</label>
            </div>
        </Dialog>
    );
};
