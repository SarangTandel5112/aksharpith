import { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';

export interface UseImageUploadReturn {
    uploading: boolean;
    imageUrl: string;
    fileUploadRef: React.RefObject<FileUpload>;
    uploadImage: (file: File) => Promise<string>;
    setImageUrl: (url: string) => void;
    clearImage: () => void;
}

export function useImageUpload(toast?: React.RefObject<Toast>): UseImageUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const fileUploadRef = useRef<FileUpload>(null);

    const uploadImage = async (file: File): Promise<string> => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            const url = data.url || data.imageUrl || '';
            setImageUrl(url);
            return url;
        } catch (error) {
            throw new Error('Failed to upload image to S3');
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setImageUrl('');
        fileUploadRef.current?.clear();
    };

    return {
        uploading,
        imageUrl,
        fileUploadRef,
        uploadImage,
        setImageUrl,
        clearImage
    };
}
