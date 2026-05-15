export interface IRButtonSendResult {
  acId: string;
  acName: string;
  buttonName: string;
  irCode?: string;           // Có thể undefined nếu không tìm thấy nút
  sent: boolean;
  message?: string;          // Thông báo lỗi (nếu có)
}

export interface SendIRButtonResponse {
  message: string;
  buttonName: string;
  results: IRButtonSendResult[];
}