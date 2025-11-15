/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';


const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-home',
                    to: '/admin'
                }
            ]
        },
        {
            label: 'Management',
            items: [
                {
                    label: 'Users',
                    icon: 'pi pi-fw pi-users',
                    to: '/admin/users'
                }, 
                {
                    label: 'Categories',
                    icon: 'pi pi-fw pi-tags',
                    to: '/admin/categories'
                },
                {
                    label: 'Products',
                    icon: 'pi pi-fw pi-box',
                    to: '/admin/products'
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
