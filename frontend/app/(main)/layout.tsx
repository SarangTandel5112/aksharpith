import { Metadata } from 'next';
import Layout from '@/layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'AksharPith Admin',
    description: 'AksharPith Admin Dashboard - Manage your business operations efficiently.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'AksharPith Admin',
        url: 'https://aksharpith.com/',
        description: 'AksharPith Admin Dashboard - Manage your business operations efficiently.',
        images: ['/favicon.ico'],
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
