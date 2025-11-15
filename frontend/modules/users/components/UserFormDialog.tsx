import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { CreateUserDto } from '@/lib/api/users.api';
import { Role } from '@/lib/api/roles.api';

export interface UserFormDialogProps {
    visible: boolean;
    onHide: () => void;
    onSave: () => void;
    user: CreateUserDto;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
    onRoleChange: (roleId: number) => void;
    submitted: boolean;
    isEditing: boolean;
    roles: Role[];
    validationErrors?: Record<string, string[]>;
    getFieldError?: (field: string) => string | undefined;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ visible, onHide, onSave, user, onInputChange, onRoleChange, submitted, isEditing, roles, validationErrors = {}, getFieldError }) => {
    return (
        <Dialog
            visible={visible}
            style={{ width: '550px' }}
            header={isEditing ? 'Edit User' : 'New User'}
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
                <label htmlFor="username">Username</label>
                <InputText
                    id="username"
                    value={user.username}
                    onChange={(e) => onInputChange(e, 'username')}
                    required
                    autoFocus
                    className={classNames({
                        'p-invalid': (submitted && !user.username) || !!getFieldError?.('username')
                    })}
                />
                {(submitted && !user.username && <small className="p-invalid">Username is required.</small>) || (getFieldError?.('username') && <small className="p-invalid">{getFieldError('username')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="Firstname">First Name</label>
                <InputText
                    id="Firstname"
                    value={user.Firstname}
                    onChange={(e) => onInputChange(e, 'Firstname')}
                    required
                    className={classNames({
                        'p-invalid': (submitted && !user.Firstname) || getFieldError?.('Firstname')
                    })}
                />
                {(submitted && !user.Firstname && <small className="p-invalid">First Name is required.</small>) || (getFieldError?.('Firstname') && <small className="p-invalid">{getFieldError('Firstname')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="Middlename">Middle Name</label>
                <InputText id="Middlename" value={user.Middlename} onChange={(e) => onInputChange(e, 'Middlename')} />
            </div>
            <div className="field">
                <label htmlFor="Lastname">Last Name</label>
                <InputText
                    id="Lastname"
                    value={user.Lastname}
                    onChange={(e) => onInputChange(e, 'Lastname')}
                    required
                    className={classNames({
                        'p-invalid': (submitted && !user.Lastname) || getFieldError?.('Lastname')
                    })}
                />
                {(submitted && !user.Lastname && <small className="p-invalid">Last Name is required.</small>) || (getFieldError?.('Lastname') && <small className="p-invalid">{getFieldError('Lastname')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="email">Email</label>
                <InputText
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => onInputChange(e, 'email')}
                    required
                    className={classNames({
                        'p-invalid': (submitted && !user.email) || getFieldError?.('email')
                    })}
                />
                {(submitted && !user.email && <small className="p-invalid">Email is required.</small>) || (getFieldError?.('email') && <small className="p-invalid">{getFieldError('email')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="roleId">Role</label>
                <Dropdown
                    id="roleId"
                    value={user.roleId}
                    onChange={(e) => onRoleChange(e.value)}
                    options={roles}
                    optionLabel="roleName"
                    optionValue="id"
                    placeholder="Select a Role"
                    className={classNames({
                        'p-invalid': (submitted && !user.roleId) || getFieldError?.('roleId')
                    })}
                />
                {(submitted && !user.roleId && <small className="p-invalid">Role is required.</small>) || (getFieldError?.('roleId') && <small className="p-invalid">{getFieldError('roleId')}</small>)}
            </div>
            <div className="field">
                <label htmlFor="password">Password {isEditing && <small className="text-500">(Leave blank to keep current password)</small>}</label>
                <Password
                    id="password"
                    value={user.password}
                    onChange={(e) => onInputChange(e, 'password')}
                    toggleMask
                    required={!isEditing}
                    className={classNames({
                        'p-invalid': (submitted && !isEditing && !user.password) || getFieldError?.('password')
                    })}
                />
                {(submitted && !isEditing && !user.password && <small className="p-invalid">Password is required.</small>) ||
                    (getFieldError?.('password') && <small className="p-invalid">{getFieldError('password')}</small>) ||
                    (submitted && isEditing && user.password && user.password.length < 8 && <small className="p-invalid">Password must be at least 8 characters long.</small>)}
            </div>
        </Dialog>
    );
};
