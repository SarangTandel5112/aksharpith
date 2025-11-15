import React from 'react';

interface DataTableColumnsProps {
    children: React.ReactNode;
}

/**
 * Wrapper component to ensure Column components are properly rendered as direct children of DataTable
 * This is needed because DataTable requires Column components to be direct children
 */
export const DataTableColumns: React.FC<DataTableColumnsProps> = ({ children }) => {
    // Extract and render columns directly
    return <>{children}</>;
};
