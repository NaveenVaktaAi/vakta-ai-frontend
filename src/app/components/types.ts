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
  FileData: IDocumentData[];
  WebsiteUrls?: IWebsiteUrl[];
  YoutubeUrls?: IYoutubeUrl[];
  type?: string;
  documentFormat?: string;
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
  }
  
  export interface DeleteDocDetail {
    docName: string;
    docId: string;
    index: number;
  } 