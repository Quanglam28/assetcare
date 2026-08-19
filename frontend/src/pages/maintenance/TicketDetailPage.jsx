import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { AssignTechnicianModal } from '../../components/maintenance/AssignTechnicianModal';
import { WaitingPartModal } from '../../components/maintenance/WaitingPartModal';
import { CompleteTicketModal } from '../../components/maintenance/CompleteTicketModal';
import { UserAcceptanceModal } from '../../components/maintenance/UserAcceptanceModal';
import { UserReopenModal } from '../../components/maintenance/UserReopenModal';
import { 
  Wrench, ArrowLeft, Laptop, MapPin, Building2, User, 
  Phone, Mail, Calendar, Clock, CheckCircle2, AlertTriangle, 
  FileText, ShieldCheck, ArrowRight, Layers, DollarSign,
  Play, RotateCcw, UserCheck, ShieldAlert, Sparkles, Star
} from 'lucide-react';
import { MAINTENANCE_STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/constants';

export const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [waitingPartModalOpen, setWaitingPartModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await maintenanceService.getRequestById(id);
      if (res?.success && res?.data) {
        setTicket(res.data);
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải thông tin phiếu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStartWork = async () => {
    try {
      await maintenanceService.startWork(ticket.id);
      setSuccess('Đã bắt đầu xử lý phiếu');
      fetchTicket();
    } catch (err) {
      setError(err?.message || 'Không thể bắt đầu xử lý');
    }
  };

  const handleResumeWork = async () => {
    try {
      await maintenanceService.resumeWork(ticket.id);
      setSuccess('Đã tiếp tục xử lý phiếu');
      fetchTicket();
    } catch (err) {
      setError(err?.message || 'Không thể tiếp tục xử lý');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy phiếu yêu cầu</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mt-3">
          Quay lại
        </Button>
      </div>
    );
  }

  const statusConf = MAINTENANCE_STATUS_CONFIG[ticket.status] || {
    label: ticket.status,
    bg: 'bg-slate-100 text-slate-700',
  };
  const prioConf = PRIORITY_CONFIG[ticket.priority] || {
    label: ticket.priority,
    bg: 'bg-slate-100 text-slate-700',
  };

  // Workflow steps status mapping
  const steps = [
    { 
      key: 'PENDING', 
      label: '1. Tiếp Nhận', 
      desc: 'Chờ phân công KTV',
      time: ticket.created_at,
    },
    { 
      key: 'ASSIGNED', 
      label: '2. Phân Công', 
      desc: ticket.technician_name ? `KTV: ${ticket.technician_name}` : 'Chưa phân công',
      time: ticket.assigned_at,
    },
    { 
      key: 'IN_PROGRESS', 
      label: '3. Đang Xử Lý', 
      desc: ticket.status === 'WAITING_PART' ? 'Tạm dừng chờ linh kiện' : 'KTV đang khắc phục',
      time: ticket.started_at,
    },
    { 
      key: 'COMPLETED', 
      label: '4. Sửa Xong', 
      desc: 'Chờ người dùng nghiệm thu',
      time: ticket.completed_at,
    },
    { 
      key: 'CLOSED', 
      label: '5. Đóng Phiếu', 
      desc: 'Nghiệm thu hoàn tất',
      time: ticket.closed_at,
    },
  ];

  const statusOrder = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PART', 'COMPLETED', 'CLOSED'];
  const currentStepIndex = statusOrder.indexOf(ticket.status);

  // Check role ownership
  const isReporter = ticket.reporter_id === user?.id;
  const isAssignedTech = isTechnician && ticket.technician_id === user?.id;
  const canOperateTech = isAssignedTech || isAdmin || isManager;
  const canAccept = isReporter || isAdmin || isManager;

  // Tính thời gian xử lý thực tế
  let processingDuration = 'N/A';
  if (ticket.started_at && ticket.completed_at) {
    const diffMs = new Date(ticket.completed_at) - new Date(ticket.started_at);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    processingDuration = diffHours > 0 ? `${diffHours} giờ ${diffMinutes} phút` : `${diffMinutes} phút`;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Quay lại danh sách phiếu
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
              {ticket.code}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConf.bg}`}>
              {statusConf.label}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${prioConf.bg}`}>
              Ưu tiên: {prioConf.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Gửi yêu cầu lúc: {new Date(ticket.created_at).toLocaleString('vi-VN')}
          </p>
        </div>

        {/* Workflow Actions Button Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manager assign */}
          {(isAdmin || isManager) && (ticket.status === 'PENDING' || ticket.status === 'ASSIGNED') && (
            <Button
              variant="outline"
              size="sm"
              icon={UserCheck}
              onClick={() => setAssignModalOpen(true)}
            >
              {ticket.status === 'PENDING' ? 'Phân Công KTV' : 'Đổi KTV Khác'}
            </Button>
          )}

          {/* Start Work (ASSIGNED hoặc REOPENED) */}
          {(ticket.status === 'ASSIGNED' || ticket.status === 'REOPENED') && canOperateTech && (
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={handleStartWork}
            >
              Bắt Đầu Xử Lý
            </Button>
          )}

          {/* In Progress actions */}
          {ticket.status === 'IN_PROGRESS' && canOperateTech && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Clock}
                onClick={() => setWaitingPartModalOpen(true)}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                Chờ Linh Kiện
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setCompleteModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Hoàn Tất Sửa Chữa
              </Button>
            </>
          )}

          {/* Waiting part actions */}
          {ticket.status === 'WAITING_PART' && canOperateTech && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Play}
                onClick={handleResumeWork}
                className="text-cyan-700 border-cyan-300 hover:bg-cyan-50"
              >
                Tiếp Tục Xử Lý
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setCompleteModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Hoàn Tất Sửa Chữa
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* MODULE 8: USER ACCEPTANCE INSPECTION BANNER (Khi COMPLETED) */}
      {ticket.status === 'COMPLETED' && canAccept && (
        <Card className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Nghiệm Thu & Xác Nhận Kết Quả Sửa Chữa
                </h3>
                <p className="text-xs text-emerald-800">
                  Kỹ thuật viên <strong>{ticket.technician_name}</strong> đã hoàn thành sửa chữa. Vui lòng kiểm tra thiết bị và lựa chọn:
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              Chờ Nghiệm Thu
            </span>
          </div>

          {/* Quick specs for acceptance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nguyên nhân:</span>
              <p className="font-semibold text-slate-800 line-clamp-2 mt-0.5">{ticket.root_cause || 'Chưa ghi'}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cách khắc phục:</span>
              <p className="font-semibold text-slate-800 line-clamp-2 mt-0.5">{ticket.resolution || 'Chưa ghi'}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời gian sửa chữa:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{processingDuration}</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chi phí / Linh kiện:</span>
              <p className="font-mono font-bold text-emerald-700 mt-0.5">
                {Number(ticket.actual_cost).toLocaleString('vi-VN')} đ ({ticket.parts?.length || 0} LK)
              </p>
            </div>
          </div>

          {/* 2 Clear Options */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={CheckCircle2}
              onClick={() => setAcceptModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 flex-1 sm:flex-none py-3"
            >
              1. "Đã Khắc Phục" (Nghiệm Thu & Đóng Phiếu)
            </Button>

            <Button
              variant="danger"
              size="lg"
              icon={RotateCcw}
              onClick={() => setReopenModalOpen(true)}
              className="font-bold shadow-lg shadow-rose-600/20 flex-1 sm:flex-none py-3"
            >
              2. "Chưa Khắc Phục" (Yêu Cầu Sửa Lại)
            </Button>
          </div>
        </Card>
      )}

      {/* Process Workflow Stepper with Timestamps */}
      <Card className="p-6 bg-white shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center justify-between">
          <span>Tiến Trình Xử Lý Sự Cố & Mốc Thời Gian (Activity Timeline)</span>
          <span className="text-[11px] font-mono text-brand-600 font-semibold lowercase">
            trạng thái: {ticket.status}
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isFinished = currentStepIndex >= idx;
            const isCurrent = ticket.status === step.key || (step.key === 'IN_PROGRESS' && ticket.status === 'WAITING_PART');

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-brand-50/80 border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                    : isFinished
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 opacity-60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  {isFinished ? (
                    <CheckCircle2 className={`w-5 h-5 ${isCurrent ? 'text-brand-600' : 'text-emerald-600'}`} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900">{step.label}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
                {step.time && (
                  <span className="text-[10px] font-mono text-slate-400 block mt-1.5 pt-1 border-t border-slate-200/60">
                    {new Date(step.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                    {new Date(step.time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Left Details & Right Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Description */}
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Nội Dung Báo Cáo Sự Cố
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {ticket.description}
            </div>

            {/* Resolution Note if completed */}
            {ticket.resolution && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Biện Pháp & Kết Quả Xử Lý Của Kỹ Thuật Viên:
                </h4>
                <p className="text-emerald-900 whitespace-pre-line leading-relaxed font-medium">
                  {ticket.resolution}
                </p>
                {ticket.root_cause && (
                  <p className="text-emerald-800 text-[11px] pt-1 border-t border-emerald-200">
                    <strong>Nguyên nhân gốc rễ (Root cause):</strong> {ticket.root_cause}
                  </p>
                )}
                {ticket.actual_cost > 0 && (
                  <p className="text-emerald-800 text-[11px] font-mono">
                    <strong>Tổng chi phí sửa chữa / thay thế:</strong> {Number(ticket.actual_cost).toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Attachments / Photos */}
          {ticket.attachments?.length > 0 && (
            <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Hình Ảnh Hiện Trường Sự Cố ({ticket.attachments.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1">
                    <img
                      src={att.file_path}
                      alt={att.file_name}
                      className="w-full h-44 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p className="text-[10px] text-slate-500 text-center py-1 truncate">{att.file_name}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Replaced Parts (Linh kiện thay thế) */}
          {ticket.parts?.length > 0 && (
            <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Linh Kiện & Phụ Tùng Đã Thay Thế
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-2">Tên Linh Kiện</th>
                      <th className="py-2">Mã LK</th>
                      <th className="py-2">Số Lượng</th>
                      <th className="py-2">Đơn Giá</th>
                      <th className="py-2 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ticket.parts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 font-semibold text-slate-800">{p.part_name}</td>
                        <td className="py-2.5 font-mono text-[11px] text-slate-500">{p.part_code || 'N/A'}</td>
                        <td className="py-2.5 font-mono">{p.quantity}</td>
                        <td className="py-2.5 font-mono">{Number(p.unit_price).toLocaleString('vi-VN')} đ</td>
                        <td className="py-2.5 font-mono font-bold text-right text-emerald-700">
                          {Number(p.total_price).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Process Timeline History */}
          <Card className="p-6 bg-white shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Nhật Ký Tiến Trình Xử Lý Toàn Diện (Timeline History)
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {ticket.histories?.map((h) => (
                <div key={h.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-white" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{h.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{h.notes}</p>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Thực hiện bởi: <strong>{h.actor_name}</strong> ({h.actor_role_name})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Device Specs & Contacts */}
        <div className="space-y-6">
          {/* Device Card */}
          <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-brand-600" />
                Thiết Bị Sự Cố
              </h4>
              <button
                type="button"
                onClick={() => navigate(`/devices/${ticket.device_id}`)}
                className="text-[11px] text-brand-600 font-semibold hover:underline"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tên thiết bị:</span>
                <p className="font-bold text-slate-900">{ticket.device_name}</p>
                <span className="font-mono text-[11px] text-slate-500">{ticket.device_code}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vị trí phòng học:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  {ticket.room_name} (Tầng {ticket.floor})
                </p>
                <span className="text-[11px] text-slate-500 block ml-4.5">{ticket.building_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Loại thiết bị:</span>
                <p className="font-medium text-slate-800">{ticket.device_type_name}</p>
              </div>
            </div>
          </Card>

          {/* Technician Assigned Card */}
          <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-brand-600" />
                Kỹ Thuật Viên Phụ Trách
              </h4>
              {(isAdmin || isManager) && (
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="text-[11px] text-brand-600 font-semibold hover:underline"
                >
                  {ticket.technician_name ? 'Đổi KTV' : 'Gán KTV'}
                </button>
              )}
            </div>

            {ticket.technician_name ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">{ticket.technician_name}</p>
                {ticket.technician_phone && (
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {ticket.technician_phone}
                  </div>
                )}
                {ticket.technician_email && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {ticket.technician_email}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2 space-y-2">
                <p className="italic">Phiếu đang chờ Ban Quản lý phân công Kỹ thuật viên tiếp nhận.</p>
                {(isAdmin || isManager) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAssignModalOpen(true)}
                    className="w-full text-xs"
                  >
                    Phân Công Ngay
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Reporter Card */}
          <Card className="p-5 bg-white shadow-sm border border-slate-200 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-brand-600" />
              Người Báo Sự Cố
            </h4>
            <p className="font-bold text-slate-900">{ticket.reporter_name}</p>
            <p className="text-slate-500 text-[11px]">Tài khoản: {ticket.reporter_username}</p>
            {ticket.reporter_phone && (
              <div className="flex items-center gap-1.5 font-mono text-slate-700 text-xs">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {ticket.reporter_phone}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AssignTechnicianModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        ticket={ticket}
        onSuccess={fetchTicket}
      />

      <WaitingPartModal
        isOpen={waitingPartModalOpen}
        onClose={() => setWaitingPartModalOpen(false)}
        ticket={ticket}
        onSuccess={fetchTicket}
      />

      <CompleteTicketModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        ticket={ticket}
        onSuccess={fetchTicket}
      />

      <UserAcceptanceModal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        ticket={ticket}
        onSuccess={fetchTicket}
      />

      <UserReopenModal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        ticket={ticket}
        onSuccess={fetchTicket}
      />
    </div>
  );
};
