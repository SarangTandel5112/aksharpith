import { useState, useCallback } from 'react';

export interface UseDialogReturn {
    visible: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export function useDialog(initialState = false): UseDialogReturn {
    const [visible, setVisible] = useState(initialState);

    const open = useCallback(() => setVisible(true), []);
    const close = useCallback(() => setVisible(false), []);
    const toggle = useCallback(() => setVisible((prev) => !prev), []);

    return { visible, open, close, toggle };
}
