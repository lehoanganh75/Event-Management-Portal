import XLSX from 'xlsx-js-style';

export const exportDashboardToExcel = (dashboardData, fileName = 'Bao_cao_Dashboard') => {
  const {
    stats,
    topUsers,
    hotEvents,
    topLiked,
    topViewed
  } = dashboardData;

  // 1. Thống kê chung
  const generalHeaders = ["Tổng Quan", "Số Lượng"];
  const generalData = [
    ["Sự kiện", stats.events || 0],
    ["Bài post", stats.posts || 0],
    ["Kế hoạch", stats.plans || 0],
    ["Recap", stats.recaps || 0]
  ];

  // 2. Top người tạo sự kiện
  const topUserHeaders = ["Top người tạo sự kiện", "Số sự kiện"];
  const topUserData = topUsers.map(u => [u.name, u.events]);

  // 3. Sự kiện hot nhất
  const hotEventsHeaders = ["Sự kiện hot nhất"];
  const hotEventsData = hotEvents.map(e => [e.label]);

  // 4. Top bài được yêu thích
  const topLikedHeaders = ["Top bài được yêu thích", "Lượt thích"];
  const topLikedData = topLiked.map(p => [p.label, p.value]);

  // 5. Top bài được xem nhiều
  const topViewedHeaders = ["Top bài được xem nhiều", "Lượt xem"];
  const topViewedData = topViewed.map(p => [p.label, p.value]);

  // Merge tất cả thành 1 bảng với các khoảng trống ở giữa
  const allData = [
    generalHeaders,
    ...generalData,
    [], // Dòng trống
    topUserHeaders,
    ...topUserData,
    [],
    hotEventsHeaders,
    ...hotEventsData,
    [],
    topLikedHeaders,
    ...topLikedData,
    [],
    topViewedHeaders,
    ...topViewedData
  ];

  const ws = XLSX.utils.aoa_to_sheet(allData);
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Format styles
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;

      const cellValue = ws[address].v;

      // Header rows (Thống kê chung, Top người tạo, ...)
      if (
        cellValue === "Tổng Quan" || cellValue === "Số Lượng" ||
        cellValue === "Top người tạo sự kiện" || cellValue === "Số sự kiện" ||
        cellValue === "Sự kiện hot nhất" ||
        cellValue === "Top bài được yêu thích" || cellValue === "Lượt thích" ||
        cellValue === "Top bài được xem nhiều" || cellValue === "Lượt xem"
      ) {
        ws[address].s = {
          fill: { fgColor: { rgb: "2563EB" } },
          font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
          alignment: { vertical: "center", horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } }
          }
        };
      } else {
        // Data rows
        ws[address].s = {
          alignment: { vertical: "center", horizontal: C === 0 ? "left" : "center" },
          font: { sz: 11 }
        };
      }
    }
  }

  // Chỉnh độ rộng cột
  ws['!cols'] = [
    { wch: 45 }, { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
  XLSX.writeFile(wb, `${fileName}_${new Date().getTime()}.xlsx`);
};
