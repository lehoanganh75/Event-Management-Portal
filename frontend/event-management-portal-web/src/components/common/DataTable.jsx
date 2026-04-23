import React from "react";
import { Loader2 } from "lucide-react";

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "Không tìm thấy dữ liệu",
  loadingMessage = "Đang tải dữ liệu...",
  onRowClick,
  rowClassName = ""
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm w-full">
      {loading ? (
        <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-medium italic">{loadingMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/80 border-b border-gray-200">
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`p-4 text-left font-bold text-slate-500 uppercase tracking-wider text-[12px] ${col.headerClassName || ""}`}
                    style={col.width ? { width: col.width } : {}}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data && data.length > 0 ? (
                data.map((row, rowIdx) => (
                  <tr 
                    key={row.id || rowIdx} 
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-blue-50/30 transition-colors group ${onRowClick ? "cursor-pointer" : ""} ${rowClassName}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={`p-4 text-slate-700 ${col.cellClassName || ""}`}
                      >
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-16 text-center text-slate-400 italic">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;
