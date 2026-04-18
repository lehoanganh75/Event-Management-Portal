import XLSX from 'xlsx-js-style';

export const exportEventsToExcel = (data, fileName = 'Danh_sach_su_kien') => {
  const headers = [
    "Tên sự kiện", "Chủ đề", "Địa điểm", "Chế độ", "Khoa", 
    "Chuyên ngành", "Bắt đầu", "Kết thúc", "Hạn đăng ký", 
    "Số lượng", "Trạng thái", "Ghi chú"
  ];

  const excelData = data.map((item) => [
    item.title || '',
    item.eventTopic || '',
    item.location || '',
    item.eventMode || '',
    item.faculty || '',
    item.major || '',
    item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : '',
    item.endTime ? new Date(item.endTime).toLocaleString('vi-VN') : '',
    item.registrationDeadline ? new Date(item.registrationDeadline).toLocaleString('vi-VN') : '',
    `${item.registeredCount || 0}/${item.maxParticipants || 0}`,
    item.status || '',
    item.notes || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!ws[address]) continue;
    ws[address].s = {
      fill: { fgColor: { rgb: "2563EB" } },
      font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
      alignment: { vertical: "center", horizontal: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } }
      }
    };
  }

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;
      ws[address].s = {
        alignment: { vertical: "center", horizontal: C === 0 ? "left" : "center" },
        font: { sz: 11 }
      };
    }
  }

  ws['!cols'] = [
    { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 25 }, 
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, 
    { wch: 15 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sự kiện");
  XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
};