/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Button } from 'primereact/button';
import { authUtils } from '@/lib/auth';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: null,
        topbarmenubutton: null
    }));

    const handleLogout = () => {
        authUtils.logout();
    };

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>AksharPith</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <ul className="layout-topbar-menu">
                <li>
                    <Button label="Logout" icon="pi pi-sign-out" className="p-button-text p-button-secondary" onClick={handleLogout} />
                </li>
            </ul>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
