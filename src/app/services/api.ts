// src/api.ts

import ApiResponse from "../resources/IApiResponse";
import { http } from "../utils/http";
import endpoint from "../constants/endpoint";
import {  IUploadAdminDocument } from "../components/types";



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
  export const uploadAdminDocuments = (
    data: IUploadAdminDocument,
  ): Promise<ApiResponse> => {
    return http.post(`${endpoint.docSathi.UPLOAD_DOCUMENTS}`, data);
  };