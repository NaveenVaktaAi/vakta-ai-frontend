'use client';

// src/DocumentUploadForm.tsx

import {
  getUploadedDocuments,
  checkStatusOfTrainingDocument,
  uploadAdminDocuments,
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
  const [textFile, setTextFile] = useState<File[]>([]);
  const [documentFormat, setDocumentFormat] = useState<string>('');
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
  });

  // Fetch data function (implement based on your needs)
  const fetchData = (refresh: boolean = false) => {
    // Implement your data fetching logic, e.g., using getUploadedDocuments or checkStatusOfTrainingDocument
    console.log('Fetching data...', refresh);
  };

  // Send documents to API
  const sendDocuments = async (FileData: IDocumentData[]): Promise<ApiResponse> => {
    const res = await uploadAdminDocuments({
      FileData: FileData,
      documentFormat: documentFormat,
      
    });
    if (res?.data?.success) {
      setIsTrainingInProgress(true);
      fetchData(true);
      setDocumentFormat('');
    }
    return res;
  };

  // Handle file selection
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const newErrors: FormErrors = {
      imageSizeError: '',
      documentFormatError: '',
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

  // Upload documents
  const uploadDocuments = async () => {
    const newErrors: FormErrors = {
      imageSizeError: '',
      documentFormatError: '',
    };

    // Validation
    if (documentFormat === '') {
      newErrors.documentFormatError = 'Select the document format';
    }

    if (textFile.length === 0) {
      newErrors.imageSizeError = 'Select a file to upload';
    } else {
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
        newErrors.imageSizeError = fileErrors.join(' ');
      } else {
        newErrors.imageSizeError = '';
      }
    }

    setError(newErrors);

    // Check if there are any errors
    if (newErrors.imageSizeError || newErrors.documentFormatError) {
      return;
    }

    // Proceed with upload
    if (textFile.length > 0 && documentFormat) {
      setLoader(true);
      let successCount = 0;
      const failedFiles = new Set<string>();

      // Process each valid file
      for (const file of textFile) {
        try {
          const response = await helperInstance.uploadFileOnS3(file);
          if (Array.isArray(response) && response.length > 0) {
          
            const res = await sendDocuments(response);
            if (res?.data?.success) {
              successCount++;
              setTextFile((prevFiles) => prevFiles.filter((f) => f !== file));
            } else {
              failedFiles.add(file.name);
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
          "Document uploaded successfully"
        );
      }

      if (failedFiles.size > 0) {
        toastMessageError(
          `${[...failedFiles].join(', ')} Failed to upload`
        );
      }

      setLoader(false);
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Documents</h2>

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

      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          onClick={uploadDocuments}
          disabled={loader || isTrainingInProgress}
          className={`px-6 py-2 rounded-md text-white font-medium ${
            loader || isTrainingInProgress
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loader ? 'Uploading...' : 'Upload Documents'}
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