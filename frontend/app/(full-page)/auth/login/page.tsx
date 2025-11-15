'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState, useEffect } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { authApi } from '@/lib/api/auth.api';
import { authUtils } from '@/lib/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    // Check if user is already authenticated
    useEffect(() => {
        if (authUtils.isAuthenticated()) {
            router.replace('/admin');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        setLoading(true);

        try {
            const response = await authApi.login({ email, password });

            if (response.success && response.data) {
                // Store tokens using authUtils
                authUtils.setToken(response.data.token);
                authUtils.setRefreshToken(response.data.refreshToken);

                // Store user info
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }

                // Redirect to dashboard
                router.push('/admin');
            } else {
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            // Handle error without redirecting
            let errorMessage = 'Login failed. Please check your credentials.';

            if (err instanceof Error) {
                // Don't show "Unauthorized - Please login again" message on login page
                if (err.message.includes('Unauthorized')) {
                    errorMessage = 'Invalid email or password. Please try again.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={containerClassName}>
            <div className="login-container">
                <div className="login-card">
                    {/* Logo and Header */}
                    <div className="login-header">
                        <div className="login-logo">
                            <i className="pi pi-book"></i>
                        </div>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Sign in to continue to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="mb-4">
                                <Message severity="error" text={error} className="w-full" />
                            </div>
                        )}

                        <div className="field mb-4">
                            <label htmlFor="email1" className="block text-900 font-medium mb-2">
                                Email Address
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-envelope"></i>
                                <InputText id="email1" type="email" placeholder="Enter your email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </span>
                        </div>

                        <div className="field mb-4">
                            <label htmlFor="password1" className="block text-900 font-medium mb-2">
                                Password
                            </label>
                            <span className="p-input-icon-left w-full">
                                <i className="pi pi-lock"></i>
                                <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" toggleMask className="w-full" inputClassName="w-full" required />
                            </span>
                        </div>

                        <div className="flex align-items-center justify-content-between mb-5 gap-3 flex-wrap">
                            <div className="flex align-items-center">
                                <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2" />
                                <label htmlFor="rememberme1" className="text-600 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <a className="font-medium no-underline cursor-pointer text-primary">Forgot password?</a>
                        </div>

                        <Button label="Sign In" className="w-full" type="submit" loading={loading} disabled={loading} />
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <span className="text-600">
                            Don't have an account? <a className="font-semibold text-primary no-underline cursor-pointer">Sign up</a>
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-container {
                    width: 100%;
                    max-width: 450px;
                    padding: 2rem;
                }

                .login-card {
                    background: var(--surface-card);
                    border-radius: 12px;
                    padding: 2.5rem;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--surface-border);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .login-logo {
                    width: 80px;
                    height: 80px;
                    border-radius: 12px;
                    background: var(--primary-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .login-logo i {
                    font-size: 2.5rem;
                    color: white;
                }

                .login-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-color);
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.02em;
                }

                .login-subtitle {
                    font-size: 1rem;
                    color: var(--text-color-secondary);
                    margin: 0;
                }

                .login-form {
                    margin-bottom: 1.5rem;
                }

                .login-footer {
                    text-align: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--surface-border);
                    font-size: 0.875rem;
                }

                .p-input-icon-left {
                    width: 100%;
                }

                .p-input-icon-left i {
                    left: 1rem;
                    color: var(--text-color-secondary);
                }

                .p-input-icon-left input {
                    padding-left: 3rem !important;
                }

                .p-password {
                    width: 100%;
                }

                .p-password .p-input-icon-left {
                    width: 100%;
                }

                .p-password input {
                    padding-left: 3rem !important;
                    padding-right: 3rem !important;
                }

                @media (max-width: 576px) {
                    .login-container {
                        padding: 1rem;
                    }

                    .login-card {
                        padding: 1.5rem;
                    }

                    .login-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
