import api from './api';

export const reportService = {
  /**
   * Lấy dữ liệu xem trước bảng báo cáo
   */
  async previewReport(reportType, params = {}) {
    return api.get(`/reports/${reportType}/preview`, { params });
  },

  /**
   * Tải file báo cáo Excel (.xlsx) hoặc CSV
   */
  async downloadReport(reportType, format = 'xlsx', params = {}) {
    const queryParams = new URLSearchParams({
      ...params,
      format,
    }).toString();

    const url = `/reports/${reportType}/export?${queryParams}`;

    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Tạo liên kết tải file tự động (hỗ trợ cả raw blob và response wrapped)
    const rawData = response?.data || response;
    const blob = rawData instanceof Blob 
      ? rawData 
      : new Blob([rawData], {
          type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `BaoCao_${reportType}_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
