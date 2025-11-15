import React, { useState, useCallback } from 'react';

export interface UseFormReturn<T> {
    formData: T;
    submitted: boolean;
    validationErrors: Record<string, string[]>;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    reset: () => void;
    setSubmitted: (value: boolean) => void;
    setValidationErrors: (errors: Record<string, string[]>) => void;
    clearValidationErrors: () => void;
    getFieldError: (field: string) => string | undefined;
}

export function useForm<T>(initialData: T): UseFormReturn<T> {
    const [formData, setFormData] = useState<T>(initialData);
    const [submitted, setSubmitted] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    const updateField = useCallback(
        <K extends keyof T>(field: K, value: T[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            // Clear validation error for this field when user starts typing
            if (validationErrors[field as string]) {
                setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field as string];
                    return newErrors;
                });
            }
        },
        [validationErrors]
    );

    const reset = useCallback(() => {
        setFormData(initialData);
        setSubmitted(false);
        setValidationErrors({});
    }, [initialData]);

    const clearValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    const getFieldError = useCallback(
        (field: string): string | undefined => {
            const errors = validationErrors[field];
            return errors && errors.length > 0 ? errors[0] : undefined;
        },
        [validationErrors]
    );

    return {
        formData,
        submitted,
        validationErrors,
        setFormData,
        updateField,
        reset,
        setSubmitted,
        setValidationErrors,
        clearValidationErrors,
        getFieldError
    };
}
