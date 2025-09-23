// src/api.ts

import ApiResponse from "../resources/IApiResponse";
import { http } from "../utils/http";
import endpoint from "../constants/endpoint";
import {  IUploadAdminDocument, IUploadAdminDocumentRequest, IDocumentData } from "../components/types";



// This is a placeholder for your API functions. Implement as needed.
export const getUploadedDocuments = async () => {
    // Implementation
  };
  
  export const checkStatusOfTrainingDocument = async () => {
    // Implementation
  };


  // Function to get pre-signed URL for uploading documents
export const getPreSignedUrl = (data: {
  fileFormat: string;
}): Promise<ApiResponse> => {
  return http.post(`${endpoint.docSathi.GET_PRESIGNED_URL}`, data);
};
  
  // export const getPreSignedUrl = async (params: { fileFormat: string }) => {
  //   // Implementation
  //   console.log("params", params);
  //   return { data: { success: true, data: { uploadUrl: '', fileUrl: '' } } }; // Example
  // };
  
  // export const uploadAdminDocuments = async (data: { FileData: any[]; documentFormat: string }) => {
  //   // Implementation

  //   return { data: { success: true } }; // Example
  // };
// Helper function to transform data to backend format
const transformToBackendFormat = (data: IUploadAdminDocument): IUploadAdminDocumentRequest => {
  return {
    FileData: data.FileData || null,
    WebsiteUrl: data.WebsiteUrl || null,
    YoutubeUrl: data.YoutubeUrl || null,
    type: data.type || null,
    documentFormat: data.documentFormat || null
  };
};

export const uploadAdminDocuments = (
  data: IUploadAdminDocument,
): Promise<ApiResponse> => {
  const backendData = transformToBackendFormat(data);
  return http.post(`${endpoint.docSathi.UPLOAD_DOCUMENTS}`, backendData);
};

// Helper functions for different upload types
export const uploadDocument = (fileData: IDocumentData, documentFormat: string): Promise<ApiResponse> => {
  return uploadAdminDocuments({
    FileData: fileData,
    documentFormat: documentFormat
  });
};

export const uploadWebsiteUrl = (websiteUrl: string, type?: string): Promise<ApiResponse> => {
  return uploadAdminDocuments({
    WebsiteUrl: websiteUrl,
    type: type
  });
};

export const uploadYoutubeUrl = (youtubeUrl: string, type?: string): Promise<ApiResponse> => {
  return uploadAdminDocuments({
    YoutubeUrl: youtubeUrl,
    type: type
  });
};