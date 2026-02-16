import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, ChevronDown, Gift, Award, Users, Target } from 'lucide-react';

// Dữ liệu mẫu cho 3 tab
const spinnerCampaigns = [
  { id: "#1", name: "Vòng quay Tết 2026", event: "Ngày hội Tết", time: "01/01/2026 - 15/01/2026", spins: "2.500", status: "Hoạt động" },
  { id: "#2", name: "Vòng quay Career Fair", event: "Career Fair 2025", time: "20/12/2025 - 20/01/2026", spins: "1.850", status: "Hoạt động" },
  { id: "#3", name: "Vòng quay Tech Expo", event: "Tech Expo 2025", time: "10/12/2025 - 10/01/2026", spins: "850", status: "Đang diễn ra" },
  { id: "#4", name: "Vòng quay Talkshow", event: "Talkshow Gen Z", time: "05/05/2025 - 05/05/2025", spins: "150", status: "Đã kết thúc" },
];

const prizes = [
  { id: "#P1", name: "iPhone 16 Pro Max", quantity: 5, type: "Vật phẩm", assigned: 3, remaining: 2, status: "Đang phân phối" },
  { id: "#P2", name: "Voucher 5 triệu", quantity: 20, type: "Voucher", assigned: 18, remaining: 2, status: "Hoạt động" },
  { id: "#P3", name: "Tai nghe Sony WH-1000XM5", quantity: 10, type: "Vật phẩm", assigned: 10, remaining: 0, status: "Hết hàng" },
];

const winners = [
  { id: "#W1", name: "Nguyễn Văn A", email: "vana@gmail.com", prize: "iPhone 16 Pro Max", date: "10/01/2026", campaign: "Vòng quay Tết 2026" },
  { id: "#W2", name: "Trần Thị B", email: "thib@gmail.com", prize: "Voucher 5 triệu", date: "05/01/2026", campaign: "Vòng quay Tết 2026" },
  { id: "#W3", name: "Lê Hoàng C", email: "hoangc@gmail.com", prize: "Tai nghe Sony", date: "25/12/2025", campaign: "Vòng quay Career Fair" },
];

const SpinnerManagement = () => {
  const [activeTab, setActiveTab] = useState('Chiến dịch vòng quay');

  const stats = [
    { title: "Tổng lượt quay", value: "5,350", change: "+20%", icon: Gift, color: "from-purple-500 to-purple-600" },
    { title: "Giải thưởng đã trao", value: "1,250", change: "+15%", icon: Award, color: "from-yellow-500 to-amber-600" },
    { title: "Giải còn lại", value: "281", change: "-5%", icon: Users, color: "from-teal-500 to-cyan-600" },
    { title: "Tỷ lệ trúng thưởng", value: "23%", change: "+2%", icon: Target, color: "from-blue-500 to-indigo-600" },
  ];

  const renderTable = (data, columns) => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {Object.values(item).map((value, i) => (
                  <td key={i} className="px-6 py-4 text-sm text-center text-gray-700">
                    {i === 0 ? <span className="font-medium text-gray-900">{value}</span> : value}
                  </td>
                ))}
                {columns.includes("Thao tác") && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition">
                        <Edit size={18} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Quản lý Vòng quay May mắn
        </h1>
        <p className="text-gray-600 text-lg">
          Quản lý chiến dịch vòng quay, giải thưởng và người trúng thưởng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`
              bg-linear-to-br ${stat.color} rounded-2xl p-6 shadow-lg text-white
              relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-4xl font-black mt-3 tracking-tight">{stat.value}</h3>
              </div>
              <stat.icon size={60} className="text-white/20 absolute -bottom-4 -right-4" strokeWidth={1} />
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
              <span className={stat.change.startsWith('-') ? 'text-red-200' : 'text-green-200'}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-10" aria-label="Tabs">
          {['Chiến dịch vòng quay', 'Quản lý giải thưởng', 'Danh sách trúng thưởng'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-4 pt-2 px-1 border-b-2 font-semibold text-base transition-all
                ${activeTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Chiến dịch vòng quay */}
        {activeTab === 'Chiến dịch vòng quay' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Chiến dịch vòng quay</h2>
              <button className="
                inline-flex items-center gap-2 px-6 py-3 
                bg-linear-to-r from-indigo-600 to-blue-700 
                hover:from-indigo-700 hover:to-blue-800 
                text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all
              ">
                <Plus size={18} />
                Tạo chiến dịch mới
              </button>
            </div>
            {renderTable(spinnerCampaigns, [
              "ID", "Tên chiến dịch", "Sự kiện", "Thời gian", "Lượt quay", "Trạng thái", "Thao tác"
            ])}
          </div>
        )}

        {/* Quản lý giải thưởng */}
        {activeTab === 'Quản lý giải thưởng' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Quản lý giải thưởng</h2>
              <button className="
                inline-flex items-center gap-2 px-6 py-3 
                bg-linear-to-r from-indigo-600 to-blue-700 
                hover:from-indigo-700 hover:to-blue-800 
                text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all
              ">
                <Plus size={18} />
                Thêm giải thưởng mới
              </button>
            </div>
            {renderTable(prizes, [
              "ID", "Tên giải thưởng", "Số lượng", "Loại", "Đã trao", "Còn lại", "Trạng thái", "Thao tác"
            ])}
          </div>
        )}

        {/* Danh sách trúng thưởng */}
        {activeTab === 'Danh sách trúng thưởng' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Danh sách trúng thưởng</h2>
            {renderTable(winners, [
              "ID", "Tên người trúng", "Email", "Giải thưởng", "Ngày trúng", "Chiến dịch"
            ])}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinnerManagement;