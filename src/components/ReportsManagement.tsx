import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { FileText, Download, Calendar, Users, TrendingUp, BarChart3, Filter, RefreshCw } from 'lucide-react';

export const ReportsManagement: React.FC = () => {
  const { students, classes, sessions, getPerformanceReport, getAttendanceReport, getDashboardStats } = useApp();
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const stats = getDashboardStats();

  const generateReport = async () => {
    console.log('📊 بدء إنشاء التقرير...');
    setLoading(true);
    try {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        classId: selectedClass || null,
        sessionId: selectedSession || null
      };

      console.log('🔍 فلاتر التقرير:', filters);
      console.log('📋 نوع التقرير:', selectedReport);
      let data;
      if (selectedReport === 'attendance') {
        console.log('📈 جلب تقرير الحضور...');
        data = await getAttendanceReport(filters);
      } else {
        console.log('📊 جلب تقرير الأداء...');
        data = await getPerformanceReport(filters);
      }
      
      console.log('✅ تم جلب البيانات:', data?.length || 0, 'سجل');
      if (data && data.length > 0) {
        console.log('📋 عينة من البيانات:', data.slice(0, 2));
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('حدث خطأ أثناء إنشاء التقرير');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // تحديث التقرير عند تغيير الفلاتر
  React.useEffect(() => {
    console.log('🔄 تحديث التقرير بسبب تغيير الفلاتر:', {
      selectedReport,
      dateRange,
      selectedClass,
      selectedSession
    });
    if (selectedReport && dateRange.startDate && dateRange.endDate) {
      generateReport();
    }
  }, [selectedReport, dateRange, selectedClass, selectedSession]);

  // فلترة الجلسات حسب الفصل المختار
  const filteredSessions = selectedClass 
    ? sessions.filter(s => s.classId === selectedClass)
    : sessions;

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedSession(''); // إعادة تعيين الجلسة عند تغيير الفصل
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="h-6 w-6 ml-2" />
          التقارير والإحصائيات
        </h1>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الجلسات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">نسبة الحضور</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">فصول منخفضة الحضور</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowAttendanceClasses.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* فلاتر التقارير */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 ml-2" />
          فلاتر التقارير
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع التقرير
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="attendance">تقرير الحضور</option>
              <option value="performance">تقرير الأداء</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الفصل
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الفصول</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* فلتر الجلسة للتقارير الأداء */}
        {selectedReport === 'performance' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الجلسة (اختياري)
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الجلسات</option>
              {filteredSessions.map(session => {
                const sessionClass = classes.find(c => c.id === session.classId);
                return (
                  <option key={session.id} value={session.id}>
                    {sessionClass?.name} - {new Date(session.startTime).toLocaleDateString('en-GB')} - {new Date(session.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* عرض التقرير */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedReport === 'attendance' ? 'تقرير الحضور' : 'تقرير الأداء والتقييمات'}
            {reportData.length > 0 && (
              <span className="text-sm font-normal text-gray-500 mr-2">
                ({reportData.length} سجل)
              </span>
            )}
          </h2>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              onClick={() => {
                const filename = selectedReport === 'attendance' ? 'attendance_report' : 'performance_report';
                exportToCSV(reportData, filename);
              }}
              disabled={reportData.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center disabled:opacity-50"
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'attendance' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفصل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الجلسات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حاضر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">غائب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متأخر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معذور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نسبة الحضور</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total_sessions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{row.present_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{row.absent_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{row.late_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{row.excused_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.attendance_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">كود الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفصل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعلم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المادة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الجلسة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تقييم المعلم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">درجة الاختبار</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشاركة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السلوك</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الواجب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التعليقات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.student_barcode || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.teacher_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.subject_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.session_date ? new Date(row.session_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.teacher_rating ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.teacher_rating >= 4 ? 'bg-green-100 text-green-800' :
                          row.teacher_rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.teacher_rating}/5
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.quiz_score ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.quiz_score >= 80 ? 'bg-green-100 text-green-800' :
                          row.quiz_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.quiz_score}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.participation ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.participation >= 4 ? 'bg-green-100 text-green-800' :
                          row.participation >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.participation}/5
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.behavior ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.behavior === 'ممتاز' ? 'bg-green-100 text-green-800' :
                          row.behavior === 'جيد جداً' || row.behavior === 'جيد' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.behavior}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.homework ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.homework === 'completed' ? 'bg-green-100 text-green-800' :
                          row.homework === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.homework === 'completed' ? 'مكتمل' : 
                           row.homework === 'partial' ? 'جزئي' : 'غير مكتمل'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={row.comments || ''}>
                      {row.comments || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {reportData.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-gray-500">
                {selectedReport === 'performance' 
                  ? 'لا توجد تقارير أداء للفترة المحددة'
                  : 'لا توجد بيانات حضور للفترة المحددة'
                }
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>الفترة المحددة: {dateRange.startDate} إلى {dateRange.endDate}</p>
                {selectedClass && <p>الفصل المختار: {classes.find(c => c.id === selectedClass)?.name}</p>}
                {selectedSession && <p>الجلسة المختارة: محددة</p>}
                <p className="mt-2 font-medium">نصائح:</p>
                <ul className="text-xs space-y-1">
                  <li>• تأكد من وجود تقييمات للطلاب في الجلسات</li>
                  <li>• جرب توسيع نطاق التاريخ</li>
                  <li>• تحقق من اختيار الفصل الصحيح</li>
                  <li>• تأكد من إضافة تقييمات في إدارة الجلسات</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        )}
      </div>
    </div>
  );
};