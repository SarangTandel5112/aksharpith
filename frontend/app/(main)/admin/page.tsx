'use client';
import React from 'react';
import { Card } from 'primereact/card';
import Link from 'next/link';

const Dashboard = () => {
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card mb-4">
                    <h1 className="text-3xl font-bold text-900 m-0 mb-2">Dashboard</h1>
                    <p className="text-600 mt-0 mb-4">Welcome to Digital Catalogue Management</p>
                </div>
            </div>

            <div className="col-12 lg:col-4">
                <Link href="/admin/users" className="no-underline">
                    <Card className="cursor-pointer hover:shadow-4 transition-all transition-duration-200">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Users</span>
                                <div className="text-900 font-medium text-xl">Manage Users</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-users text-blue-500 text-xl" />
                            </div>
                        </div>
                        <span className="text-500">View and manage system users</span>
                    </Card>
                </Link>
            </div>

            <div className="col-12 lg:col-4">
                <Link href="/admin/categories" className="no-underline">
                    <Card className="cursor-pointer hover:shadow-4 transition-all transition-duration-200">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Categories</span>
                                <div className="text-900 font-medium text-xl">Manage Categories</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-tags text-orange-500 text-xl" />
                            </div>
                        </div>
                        <span className="text-500">Organize product categories</span>
                    </Card>
                </Link>
            </div>

            <div className="col-12 lg:col-4">
                <Link href="/admin/products" className="no-underline">
                    <Card className="cursor-pointer hover:shadow-4 transition-all transition-duration-200">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Products</span>
                                <div className="text-900 font-medium text-xl">Manage Products</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-box text-cyan-500 text-xl" />
                            </div>
                        </div>
                        <span className="text-500">Manage product inventory</span>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
