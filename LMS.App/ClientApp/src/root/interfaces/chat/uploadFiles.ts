
export interface FileUploadResult {
    push(fileUploadResult: FileUploadResult): unknown;
    fileName: string;
    fileType: number;
    fileUrl: string;
     
  }