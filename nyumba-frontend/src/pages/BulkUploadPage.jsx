import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { bulkUploadListings } from '../services/api';
import { FaUpload, FaDownload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const BulkUploadPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    // This is the CSV template content
    const csvTemplate = "title,description,price,location,bedrooms,bathrooms,propertyType\n" +
                        "Example House,A lovely 3-bedroom house in Roma.,15000,Roma, Lusaka,3,2,House\n" +
                        "Modern Apartment,2-bed flat in Avondale,12000,Avondale, Lusaka,2,1,Apartment\n" +
                        "Spacious Yard,Property in Ibex Hill,25000,Ibex Hill, Lusaka,4,3,House";

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'text/csv') {
            toast.error('Invalid file type. Please upload a .csv file.');
            setFile(null);
            e.target.value = null; // Clear the input
        } else {
            setFile(selectedFile);
            setUploadResult(null); // Clear previous results
        }
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'nyumba_bulk_upload_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a CSV file to upload.');
            return;
        }

        setLoading(true);
        setUploadResult(null);
        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const { data } = await bulkUploadListings(formData);
            setUploadResult(data);
            toast.success(data.message);
            sessionStorage.setItem('profileDataStale', 'true'); // Refresh profile/listings
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk upload failed.');
            setUploadResult({ error: 'Upload failed. Please try again.' });
        } finally {
            setLoading(false);
            setFile(null);
            document.getElementById('csv-upload-input').value = null; // Clear input
        }
    };

    return (
        <div className="pt-24 max-w-4xl mx-auto pb-12">
            <h1 className="text-4xl font-bold text-text-color mb-6">Bulk Listing Upload</h1>
            <p className="text-lg text-subtle-text-color mb-8">
                Upload multiple listings at once using our CSV template. This is a pro feature to help you get set up quickly.
            </p>

            {/* Step 1: Download Template */}
            <div className="bg-card-color p-6 rounded-lg border border-border-color mb-8">
                <h2 className="text-2xl font-bold text-text-color mb-4">Step 1: Get the Template</h2>
                <p className="text-subtle-text-color mb-4">
                    Download our CSV template file. Open it in Microsoft Excel, Google Sheets, or any spreadsheet editor.
                </p>
                <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-2 bg-accent-color text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover-color transition-colors"
                >
                    <FaDownload /> Download Template.csv
                </button>
                <div className="mt-4 text-subtle-text-color text-sm">
                    <p className="font-bold text-text-color">Required Columns:</p>
                    <ul className="list-disc list-inside">
                        <li><span className="font-mono text-text-color">title</span> (e.g., "Modern Apartment")</li>
                        <li><span className="font-mono text-text-color">price</span> (e.g., "15000" - no commas or currency)</li>
                        <li><span className="font-mono text-text-color">location</span> (e.g., "Avondale, Lusaka")</li>
                        <li><span className="font-mono text-text-color">bedrooms</span> (e.g., "2")</li>
                        <li><span className="font-mono text-text-color">bathrooms</span> (e.g., "1")</li>
                        <li><span className="font-mono text-text-color">propertyType</span> (Must be: House, Apartment, Land, or Commercial)</li>
                        <li><span className="font-mono text-text-color">description</span> (Optional, but recommended)</li>
                    </ul>
                    <p className="mt-2 text-yellow-400 font-medium">
                        <FaExclamationTriangle className="inline-block mr-1" /> This tool does not upload images. You must add images to each listing manually after creation.
                    </p>
                </div>
            </div>

            {/* Step 2: Upload File */}
            <div className="bg-card-color p-6 rounded-lg border border-border-color">
                <h2 className="text-2xl font-bold text-text-color mb-4">Step 2: Upload Your File</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="file"
                        id="csv-upload-input"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full text-sm text-subtle-text-color
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-accent-color/10 file:text-accent-color
                                   hover:file:bg-accent-color/20"
                    />
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full flex items-center justify-center gap-2 bg-accent-color text-white font-bold py-3 rounded-md hover:bg-accent-hover-color transition-colors disabled:bg-subtle-text-color"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                        {loading ? 'Processing... This may take a while.' : 'Upload and Create Listings'}
                    </button>
                </form>
            </div>

            {/* Step 3: Results */}
            {uploadResult && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-text-color mb-4">Upload Results</h2>
                    <div className="bg-card-color p-6 rounded-lg border border-border-color">
                        {uploadResult.successCount > 0 && (
                            <div className="flex items-center gap-3 p-4 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                                <FaCheckCircle className="w-6 h-6" />
                                <span className="font-bold">{uploadResult.successCount} listings created successfully!</span>
                            </div>
                        )}
                        {uploadResult.errorCount > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center gap-3 p-4 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                                    <FaExclamationTriangle className="w-6 h-6" />
                                    <span className="font-bold">{uploadResult.errorCount} listings failed to create.</span>
                                </div>
                                <ul className="list-disc list-inside mt-4 space-y-2 text-red-400 text-sm">
                                    {uploadResult.errors.map((err, index) => (
                                        <li key={index}>
                                            <span className="font-bold text-text-color">{err.rowTitle}:</span> {err.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUploadPage;