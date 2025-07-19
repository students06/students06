const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في الخادم');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // المصادقة
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  // المستخدمين
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // الطلاب
  async getStudents() {
    return this.request('/students');
  }

  async createStudent(studentData: any) {
    return this.request('/students', {
      method: 'POST',
      body: studentData,
    });
  }

  async updateStudent(id: string, studentData: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: studentData,
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async transferStudent(studentId: string, newClassId: string | null) {
    return this.request(`/students/${studentId}/transfer`, {
      method: 'PUT',
      body: { newClassId },
    });
  }

  // الفصول
  async getClasses() {
    return this.request('/classes');
  }

  async createClass(classData: any) {
    return this.request('/classes', {
      method: 'POST',
      body: classData,
    });
  }

  async updateClass(id: string, classData: any) {
    return this.request(`/classes/${id}`, {
      method: 'PUT',
      body: classData,
    });
  }

  async deleteClass(id: string) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  // المعلمين
  async getTeachers() {
    return this.request('/teachers');
  }

  async createTeacher(teacherData: any) {
    return this.request('/teachers', {
      method: 'POST',
      body: teacherData,
    });
  }

  async updateTeacher(id: string, teacherData: any) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: teacherData,
    });
  }

  async deleteTeacher(id: string) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  // المواد
  async getSubjects() {
    return this.request('/subjects');
  }

  async createSubject(subjectData: any) {
    return this.request('/subjects', {
      method: 'POST',
      body: subjectData,
    });
  }

  async updateSubject(id: string, subjectData: any) {
    return this.request(`/subjects/${id}`, {
      method: 'PUT',
      body: subjectData,
    });
  }

  async deleteSubject(id: string) {
    return this.request(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }

  // الأماكن
  async getLocations() {
    return this.request('/locations');
  }

  async createLocation(locationData: any) {
    return this.request('/locations', {
      method: 'POST',
      body: locationData,
    });
  }

  async updateLocation(id: string, locationData: any) {
    return this.request(`/locations/${id}`, {
      method: 'PUT',
      body: locationData,
    });
  }

  async deleteLocation(id: string) {
    return this.request(`/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // الجلسات
  async getSessions() {
    return this.request('/sessions');
  }

  async createSession(sessionData: any) {
    return this.request('/sessions', {
      method: 'POST',
      body: sessionData,
    });
  }

  async updateSession(id: string, sessionData: any) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: sessionData,
    });
  }

  async deleteSession(id: string) {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleSessionStatus(id: string) {
    return this.request(`/sessions/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  // الحضور
  async getAttendance() {
    return this.request('/attendance');
  }

  async recordAttendance(attendanceData: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: attendanceData,
    });
  }

  async updateAttendance(id: string, attendanceData: any) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: attendanceData,
    });
  }

  async deleteAttendance(id: string) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // التقارير
  async getReports() {
    return this.request('/reports');
  }

  async createReport(reportData: any) {
    return this.request('/reports', {
      method: 'POST',
      body: reportData,
    });
  }

  async updateReport(id: string, reportData: any) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: reportData,
    });
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  async getPerformanceReport(filters: any) {
    return this.request('/reports/performance', {
      method: 'POST',
      body: filters,
    });
  }

  async getAttendanceReport(filters: any) {
    return this.request('/reports/attendance', {
      method: 'POST',
      body: filters,
    });
  }

  // الواتساب
  async initializeWhatsApp() {
    return this.request('/whatsapp/initialize', {
      method: 'POST',
    });
  }

  async getWhatsAppStatus() {
    return this.request('/whatsapp/status');
  }

  async sendSessionReport(sessionId: string) {
    return this.request('/whatsapp/send-session-report', {
      method: 'POST',
      body: { sessionId },
    });
  }

  // الإحصائيات
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // توليد الباركود
  async generateBarcode() {
    return this.request('/students/generate-barcode');
  }
}

export const apiService = new ApiService();