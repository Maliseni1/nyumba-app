import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ImageUpload = ({ images, setImages }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (images.length + acceptedFiles.length > 5) {
            toast.error("You can upload a maximum of 5 images.");
            return;
        }
        // Add a preview URL to each new file
        const newImages = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setImages(prevImages => [...prevImages, ...newImages]);
    }, [images, setImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': []
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        onDropRejected: () => {
            toast.error("File is too large (max 5MB) or has an invalid type (only .jpg, .png).");
        }
    });

    const removeImage = (imageToRemove) => {
        // If it's a file object, revoke the object URL to prevent memory leaks
        if (imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        setImages(images.filter(image => image !== imageToRemove));
    };

    const renderPreviews = () => (
        images.map((image, index) => (
            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border-2 border-slate-700">
                <img
                    src={typeof image === 'string' ? image : image.preview}
                    alt={`preview ${index}`}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                        if (typeof image !== 'string') URL.revokeObjectURL(image.preview)
                    }}
                />
                <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                    <FaTrash size={12} />
                </button>
            </div>
        ))
    );

    return (
        <div className="space-y-4">
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors ${isDragActive ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-sky-600'}`}>
                <input {...getInputProps()} />
                <FaCloudUploadAlt className="mx-auto text-4xl text-slate-500 mb-2" />
                {
                    isDragActive ?
                        <p className="text-sky-400">Drop the files here ...</p> :
                        <p className="text-slate-400">Drag & drop images here, or click to select files (Max 5)</p>
                }
            </div>
            {images.length > 0 && (
                <div className="flex flex-wrap gap-4">
                    {renderPreviews()}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;