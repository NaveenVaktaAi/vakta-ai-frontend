// src/constants.ts
export const MAX_FILE_SIZE_MB = 15 * 1024 * 1024; // 15 MB in bytes
export const MAX_FILES = 5;

export const ALLOWED_TYPE: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
};

export const DOCUMENT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'doc', label: 'DOC' },
  { value: 'txt', label: 'TXT' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'xls', label: 'XLS' },
];