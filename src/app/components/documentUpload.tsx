'use client';

// src/DocumentUploadForm.tsx

import {
  getUploadedDocuments,
  checkStatusOfTrainingDocument,
  uploadDocument,
  uploadWebsiteUrl,
  uploadYoutubeUrl,
} from '../services/api';
import { IDocumentData, FormErrors, DeleteDocDetail } from './types';
import ApiResponse from '../resources/IApiResponse';
import {
  MAX_FILE_SIZE_MB,
  MAX_FILES,
  ALLOWED_TYPE,
  DOCUMENT_FORMATS,
} from './constants';
import { ChangeEvent, useState } from 'react';
import { toastMessageError, toastMessageSuccess } from '../utilities/commonToastMessage';
import helperInstance from './helper';


const DocumentUploadForm: React.FC = () => {
  // State management
  const [uploadType, setUploadType] = useState<'document' | 'website' | 'youtube'>('document');
  const [textFile, setTextFile] = useState<File[]>([]);
  const [documentFormat, setDocumentFormat] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [loader, setLoader] = useState<boolean>(false);
  const [isTrainingInProgress, setIsTrainingInProgress] = useState<boolean>(false);
  const [openAlertModel, setOpenAlertModel] = useState<boolean>(false);
  const [deleteDocDetail, setDeleteDocDetail] = useState<DeleteDocDetail>({
    docName: '',
    docId: '',
    index: 0,
  });
  const [error, setError] = useState<FormErrors>({
    imageSizeError: '',
    documentFormatError: '',
    websiteUrlError: '',
    youtubeUrlError: '',
  });

  // Fetch data function (implement based on your needs)
  const fetchData = (refresh: boolean = false) => {
    // Implement your data fetching logic, e.g., using getUploadedDocuments or checkStatusOfTrainingDocument
    console.log('Fetching data...', refresh);
  };

  // Send single document to API
  const sendDocument = async (FileData: IDocumentData): Promise<ApiResponse> => {
    const res = await uploadDocument(FileData, documentFormat);
    if (res?.data?.success) {
      setIsTrainingInProgress(true);
      fetchData(true);
      setDocumentFormat('');
    }
    return res;
  };

  // Send website URL to API
  const sendWebsiteUrl = async (): Promise<ApiResponse> => {
    const res = await uploadWebsiteUrl(websiteUrl, 'website');
    if (res?.data?.success) {
      setIsTrainingInProgress(true);
      fetchData(true);
      setWebsiteUrl('');
    }
    return res;
  };

  // Send YouTube URL to API
  const sendYoutubeUrl = async (): Promise<ApiResponse> => {
    const res = await uploadYoutubeUrl(youtubeUrl, 'youtube');
    if (res?.data?.success) {
      setIsTrainingInProgress(true);
      fetchData(true);
      setYoutubeUrl('');
    }
    return res;
  };

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  // Clear form errors
  const clearErrors = () => {
    setError({
      imageSizeError: '',
      documentFormatError: '',
      websiteUrlError: '',
      youtubeUrlError: '',
    });
  };

  // Handle upload type change
  const handleUploadTypeChange = (type: 'document' | 'website' | 'youtube') => {
    setUploadType(type);
    clearErrors();
    // Clear form data when switching types
    setTextFile([]);
    setDocumentFormat('');
    setWebsiteUrl('');
    setYoutubeUrl('');
  };

  // Handle file selection
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const newErrors: FormErrors = {
      imageSizeError: '',
      documentFormatError: '',
      websiteUrlError: '',
      youtubeUrlError: '',
    };

    if (files) {
      const fileErrors: string[] = [];
      const validFiles: File[] = [];
      const selectedFiles = Array.from(files);

      if (selectedFiles.length > MAX_FILES) {
        newErrors.imageSizeError = `You can only upload up to ${MAX_FILES} files.`;
      } else {
        selectedFiles.forEach((file) => {
          if (file.size > MAX_FILE_SIZE_MB) {
            fileErrors.push(`File "${file.name}" exceeds 15 MB.`);
          } else if (documentFormat && file.type !== ALLOWED_TYPE[documentFormat]) {
            fileErrors.push(
              `File "${file.name}" must be of type ${documentFormat.toUpperCase()}.`
            );
          } else {
            validFiles.push(file);
          }
        });

        if (fileErrors.length > 0) {
          newErrors.imageSizeError = fileErrors.join(' ');
        } else {
          newErrors.imageSizeError = '';
        }

        if (validFiles.length > 0) {
          setTextFile(validFiles);
        }
      }
    }

    setError(newErrors);
  };

  // Main upload function that handles all types
  const uploadContent = async () => {
    // Clear any existing errors
    clearErrors();

    // Validate based on upload type
    if (uploadType === 'document') {
      if (!documentFormat) {
        setError((prev) => ({ ...prev, documentFormatError: 'Please select a document format' }));
        return;
      }
      if (textFile.length === 0) {
        setError((prev) => ({ ...prev, imageSizeError: 'Please select at least one file' }));
        return;
      }
      
      // File validation for documents
      const fileErrors: string[] = [];
      textFile.forEach((file) => {
        if (file.size > MAX_FILE_SIZE_MB) {
          fileErrors.push(`File "${file.name}" exceeds 15 MB.`);
        } else if (documentFormat && file.type !== ALLOWED_TYPE[documentFormat]) {
          fileErrors.push(
            `File "${file.name}" must be of type ${documentFormat.toUpperCase()}.`
          );
        }
      });

      if (fileErrors.length > 0) {
        setError((prev) => ({ ...prev, imageSizeError: fileErrors.join(' ') }));
        return;
      }
    } else if (uploadType === 'website') {
      if (!websiteUrl.trim()) {
        setError((prev) => ({ ...prev, websiteUrlError: 'Please enter a website URL' }));
        return;
      }
      if (!isValidUrl(websiteUrl)) {
        setError((prev) => ({ ...prev, websiteUrlError: 'Please enter a valid URL' }));
        return;
      }
    } else if (uploadType === 'youtube') {
      if (!youtubeUrl.trim()) {
        setError((prev) => ({ ...prev, youtubeUrlError: 'Please enter a YouTube URL' }));
        return;
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        setError((prev) => ({ ...prev, youtubeUrlError: 'Please enter a valid YouTube URL' }));
        return;
      }
    }

    setLoader(true);

    try {
      if (uploadType === 'document') {
        await uploadDocuments();
      } else if (uploadType === 'website') {
        const res = await sendWebsiteUrl();
        if (res?.data?.success) {
          toastMessageSuccess('Website URL added successfully!');
        } else {
          toastMessageError('Failed to add website URL');
        }
      } else if (uploadType === 'youtube') {
        const res = await sendYoutubeUrl();
        if (res?.data?.success) {
          toastMessageSuccess('YouTube URL added successfully!');
        } else {
          toastMessageError('Failed to add YouTube URL');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toastMessageError('An error occurred during upload');
    } finally {
      setLoader(false);
    }
  };

  // Upload documents function (for document type only)
  const uploadDocuments = async () => {
    let successCount = 0;
    const failedFiles = new Set<string>();

    // Process each valid file
    for (const file of textFile) {
      try {
        const response = await helperInstance.uploadFileOnS3(file);
        if (Array.isArray(response) && response.length > 0) {
          // Since backend expects single document, send each document individually
          for (const documentData of response) {
            const res = await sendDocument(documentData);
            if (res?.data?.success) {
              successCount++;
            } else {
              failedFiles.add(file.name);
              break; // If one document fails, don't send others from the same file
            }
          }
          // Remove file from state only if all documents were sent successfully
          if (!failedFiles.has(file.name)) {
            setTextFile((prevFiles) => prevFiles.filter((f) => f !== file));
          }
        } else {
          failedFiles.add(file.name);
        }
      } catch (error) {
        console.error('Upload error:', error);
        failedFiles.add(file.name);
      }
    }

    // Show results
    if (successCount > 0) {
      toastMessageSuccess(
        `${successCount} document${successCount > 1 ? 's' : ''} uploaded successfully!`
      );
    }

    if (failedFiles.size > 0) {
      toastMessageError(
        `Failed to upload: ${Array.from(failedFiles).join(', ')}`
      );
    }
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    setTextFile((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Delete document (for confirmation)
  const deleteDocument = (docName: string, docId: string, index: number) => {
    setOpenAlertModel(true);
    setDeleteDocDetail({ docName: docName, docId: docId, index: index });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Content</h2>

      {/* Upload Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Upload Type *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadType"
              value="document"
              checked={uploadType === 'document'}
              onChange={() => handleUploadTypeChange('document')}
              className="mr-2"
            />
            <span className="text-sm">📄 Document</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadType"
              value="website"
              checked={uploadType === 'website'}
              onChange={() => handleUploadTypeChange('website')}
              className="mr-2"
            />
            <span className="text-sm">🌐 Website URL</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadType"
              value="youtube"
              checked={uploadType === 'youtube'}
              onChange={() => handleUploadTypeChange('youtube')}
              className="mr-2"
            />
            <span className="text-sm">📺 YouTube URL</span>
          </label>
        </div>
      </div>

      {/* Document Upload Section */}
      {uploadType === 'document' && (
        <>
          {/* Document Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Format *
        </label>
        <select
          value={documentFormat}
          onChange={(e) => setDocumentFormat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select document format</option>
          {DOCUMENT_FORMATS.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
        {error.documentFormatError && (
          <p className="text-red-500 text-sm mt-1">{error.documentFormatError}</p>
        )}
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Files * (Max 5 files, 15MB each)
        </label>
        <input
          type="file"
          multiple
          onChange={onFileChange}
          accept={documentFormat ? ALLOWED_TYPE[documentFormat] : ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error.imageSizeError && (
          <p className="text-red-500 text-sm mt-1">{error.imageSizeError}</p>
        )}
      </div>

      {/* Selected Files Display */}
      {textFile.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
          <div className="space-y-2">
            {textFile.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {/* Website URL Section */}
      {uploadType === 'website' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL *
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error.websiteUrlError && (
            <p className="text-red-500 text-sm mt-1">{error.websiteUrlError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid website URL to extract content from
          </p>
        </div>
      )}

      {/* YouTube URL Section */}
      {uploadType === 'youtube' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL *
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error.youtubeUrlError && (
            <p className="text-red-500 text-sm mt-1">{error.youtubeUrlError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid YouTube video URL to extract transcript
          </p>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={uploadContent}
          disabled={loader || isTrainingInProgress}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            loader || isTrainingInProgress
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loader ? 'Uploading...' : 
            uploadType === 'document' ? 'Upload Documents' :
            uploadType === 'website' ? 'Add Website URL' :
            'Add YouTube URL'
          }
        </button>
      </div>

      {/* Training Status */}
      {isTrainingInProgress && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-sm">Training is in progress. Please wait...</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openAlertModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteDocDetail.docName}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setOpenAlertModel(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implement delete logic here, e.g., call an API to delete the document
                  // For example: deleteAdminDocument(deleteDocDetail.docId);
                  // Then: removeFile(deleteDocDetail.index);
                  setOpenAlertModel(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadForm;