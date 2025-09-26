// src/types.ts
export interface IDocumentData {
  signedUrl: string;
  fileNameTime: string;
}

export interface IWebsiteUrl {
  url: string;
}

export interface IYoutubeUrl {
  url: string;
}

export interface IUploadAdminDocument {
  FileData?: IDocumentData;
  WebsiteUrl?: string;
  YoutubeUrl?: string;
  type?: string;
  documentFormat?: string;
}

// Backend request format interface - matches your Pydantic model
export interface IUploadAdminDocumentRequest {
  FileData?: IDocumentData | null;
  WebsiteUrl?: string | null;
  YoutubeUrl?: string | null;
  type?: string | null;
  documentFormat?: string | null;
}

  
  export interface ApiResponse {
    data?: {
      success: boolean;
      message?: string;
      data?: {
        message?: string;
      };
    };
  }
  
  export interface FormErrors {
    imageSizeError: string;
    documentFormatError: string;
    websiteUrlError: string;
    youtubeUrlError: string;
  }
  
  export interface DeleteDocDetail {
    docName: string;
    docId: string;
    index: number;
  } 