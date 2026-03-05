import React, { useState } from "react";
import {
  Save, FileText, ArrowLeft, RefreshCw,
  Download, Maximize2, X, Star,
} from "lucide-react";
import { eventTemplateApi } from "../../api/eventTemplateApi";

const formatDate = (dateStr) => {
  if (!dateStr) return "....................";
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes().toString().padStart(2, "0")} ngày ${d.getDate()}/${
    d.getMonth() + 1}/${d.getFullYear()}`;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const formatPerson = (p) =>
  [p.title, p.name].filter(Boolean).join(" ") +
  (p.org || p.dept ? ` (${p.org || p.dept})` : "");

const esc = (s) => String(s || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const wRun = (text, { bold = false, italic = false, underline = false, size = 24 } = {}) => `
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      ${bold ? "<w:b/>" : ""}
      ${italic ? "<w:i/>" : ""}
      ${underline ? '<w:u w:val="single"/>' : ""}
      <w:sz w:val="${size}"/>
      <w:szCs w:val="${size}"/>
    </w:rPr>
    <w:t xml:space="preserve">${esc(text)}</w:t>
  </w:r>`;

const wPara = (runs, { align = "", indent = 0, spaceBefore = 0, spaceAfter = 80 } = {}) => `
  <w:p>
    <w:pPr>
      ${align ? `<w:jc w:val="${align}"/>` : ""}
      ${indent ? `<w:ind w:left="${indent}"/>` : ""}
      <w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}"/>
    </w:pPr>
    ${runs}
  </w:p>`;

const buildDocumentXml = (data) => {
  const eventType        = data.eventType        || "";
  const eventTypeOther   = data.eventTypeOther   || "";
  const eventTitle       = data.eventTitle       || data.title       || "";
  const eventTopic       = data.eventTopic       || "";
  const eventPurpose     = data.eventPurpose     || data.description || "";
  const startTime        = data.startTime        || "";
  const endTime          = data.endTime          || "";
  const location         = data.location         || "";
  const organizer        = data.organizer        || "";
  const organizerUnit    = data.organizerUnit    || "";
  const recipients       = data.recipients       || [];
  const customRecipients = data.customRecipients || [];
  const participants     = data.participants     || [];
  const presenters       = data.presenters       || [];
  const organizers       = data.organizers       || [];
  const attendees        = data.attendees        || [];
  const customFields     = data.customFields     || [];
  const notes            = data.notes            || "";

  const allRecipients    = [...recipients, ...customRecipients];
  const displayType      = eventType === "Khác" && eventTypeOther ? eventTypeOther : eventType;
  const displayOrganizer = organizerUnit ? `${organizer} – ${organizerUnit}` : organizer;
  const today            = new Date();

  let romanIdx = 0;
  const nextRoman = () => ROMAN[romanIdx++];

  const section = (title) => wPara(
    wRun(`${nextRoman()}. ${title}`, { bold: true, size: 24 }),
    { spaceBefore: 160, spaceAfter: 80 }
  );
  const line = (textRuns, indent = 720) => wPara(textRuns, { indent, spaceAfter: 60 });

  let body = "";

  body += wPara(
    wRun("BỘ GIÁO DỤC VÀ ĐÀO TẠO", { bold: true, size: 22 }) +
    `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:tab/></w:r>` +
    wRun("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { bold: true, size: 22 }),
    { spaceAfter: 0 }
  );
  body += wPara(
    wRun("TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP.HCM", { bold: true, size: 22 }) +
    `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:tab/></w:r>` +
    wRun("Độc lập - Tự do - Hạnh phúc", { bold: true, size: 22 }),
    { spaceAfter: 0 }
  );
  if (displayOrganizer) {
    body += wPara(wRun(displayOrganizer, { size: 22 }), { spaceAfter: 160 });
  }

  body += wPara(wRun("KẾ HOẠCH", { bold: true, size: 26 }), { align: "center", spaceBefore: 240, spaceAfter: 60 });
  if (displayType) {
    body += wPara(wRun(`(${displayType})`, { italic: true, size: 22 }), { align: "center", spaceAfter: 60 });
  }
  body += wPara(
    wRun(`V/v: ${eventTitle || "CHƯA CÓ TIÊU ĐỀ SỰ KIỆN"}`, { bold: true, underline: true, size: 24 }),
    { align: "center", spaceAfter: 60 }
  );
  if (eventTopic) {
    body += wPara(wRun(`Chủ đề: ${eventTopic}`, { italic: true, size: 22 }), { align: "center", spaceAfter: 200 });
  }

  body += section("MỤC ĐÍCH");
  body += line(wRun(eventPurpose || `Tổ chức ${displayType || "sự kiện"} nhằm nâng cao kiến thức và kỹ năng thực tế cho người tham dự.`));

  body += section("THỜI GIAN VÀ ĐỊA ĐIỂM");
  body += line(wRun("- Thời gian: ", { bold: true }) + wRun(`Từ ${formatDate(startTime)} đến ${formatDate(endTime)}.`));
  body += line(wRun("- Địa điểm: ", { bold: true }) + wRun(location || "...................."));

  body += section("ĐỐI TƯỢNG THAM DỰ");
  if (participants.length > 0) {
    body += line(wRun("- Thành phần: ", { bold: true }) + wRun(Array.isArray(participants) ? participants.join(", ") : participants));
  }
  if (attendees.length > 0) {
    body += line(wRun("- Danh sách tham dự:", { bold: true }));
    attendees.forEach((p) => {
      body += line(wRun(`+ ${formatPerson(p)}${p.email ? ` – ${p.email}` : ""}`), 1080);
    });
  }
  if (participants.length === 0 && attendees.length === 0) {
    body += line(wRun(`Toàn thể ${organizer || "đơn vị"} và các cá nhân quan tâm.`));
  }

  if (presenters.length > 0) {
    body += section("NGƯỜI TRÌNH BÀY");
    presenters.forEach((p) => { body += line(wRun(`- ${formatPerson(p)}${p.email ? ` – ${p.email}` : ""}`)); });
  }

  if (organizers.length > 0) {
    body += section("BAN TỔ CHỨC");
    organizers.forEach((p) => { body += line(wRun(`- ${formatPerson(p)}${p.email ? ` – ${p.email}` : ""}`)); });
  }

  if (customFields.length > 0) {
    body += section("THÔNG TIN BỔ SUNG");
    customFields.forEach((f) => {
      body += line(wRun(`- ${f.name}: `, { bold: true }) + wRun(f.description || "...................."));
    });
  }

  if (notes && notes !== eventPurpose) {
    body += section("GHI CHÚ");
    body += line(wRun(notes));
  }

  body += wPara("", { spaceBefore: 320, spaceAfter: 0 });
  body += wPara(
    wRun(`TP. Hồ Chí Minh, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`, { italic: true, size: 22 }),
    { align: "right", spaceAfter: 60 }
  );

  const recipientRows = allRecipients.map((r) =>
    `<w:tr><w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:borders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/></w:borders></w:tcPr>${wPara(wRun(`- ${r};`, { size: 22 }), { spaceAfter: 40 })}</w:tc><w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/><w:borders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/></w:borders></w:tcPr>${wPara("", { spaceAfter: 40 })}</w:tc></w:tr>`
  ).join("");

  const noBorder = `<w:borders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/></w:borders>`;
  body += `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9000" w:type="dxa"/>
      <w:tblBorders><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders>
    </w:tblPr>
    <w:tblGrid><w:gridCol w:w="4500"/><w:gridCol w:w="4500"/></w:tblGrid>
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>
        ${wPara(wRun("Nơi nhận:", { italic: true, underline: true, size: 22 }), { spaceAfter: 40 })}
      </w:tc>
      <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>
        ${wPara(wRun("TRƯỞNG KHOA", { bold: true, size: 24 }), { align: "center", spaceAfter: 40 })}
      </w:tc>
    </w:tr>
    ${recipientRows}
    ${organizer ? `<w:tr><w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>${wPara(wRun(`- Lưu VT, ${organizer}.`, { size: 22 }), { spaceAfter: 40 })}</w:tc><w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>${wPara("", { spaceAfter: 40 })}</w:tc></w:tr>` : ""}
    <w:tr>
      <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>${wPara("", { spaceBefore: 0, spaceAfter: 0 })}</w:tc>
      <w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/>${noBorder}</w:tcPr>
        ${wPara(wRun("(Ký và ghi rõ họ tên)", { italic: true, size: 20 }), { align: "center", spaceBefore: 960, spaceAfter: 0 })}
      </w:tc>
    </w:tr>
  </w:tbl>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:mv="urn:schemas-microsoft-com:mac:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="851" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
};

const exportToWord = async (data) => {
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const eventTitle = data.eventTitle || data.title || "su_kien";
  const docXml = buildDocumentXml(data);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsMain = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  const zip = new window.JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.file("_rels/.rels", relsMain);
  zip.file("word/document.xml", docXml);
  zip.file("word/_rels/document.xml.rels", wordRels);

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `KH_${eventTitle.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const DocumentContent = ({ isModal = false, data = {} }) => {
  const eventType        = data.eventType        || "";
  const eventTypeOther   = data.eventTypeOther   || "";
  const eventTitle       = data.eventTitle       || data.title       || "";
  const eventTopic       = data.eventTopic       || "";
  const eventPurpose     = data.eventPurpose     || data.description || "";
  const startTime        = data.startTime        || "";
  const endTime          = data.endTime          || "";
  const location         = data.location         || "";
  const organizer        = data.organizer        || "";
  const organizerUnit    = data.organizerUnit    || "";
  const recipients       = data.recipients       || [];
  const customRecipients = data.customRecipients || [];
  const participants     = data.participants     || [];
  const presenters       = data.presenters       || [];
  const organizers       = data.organizers       || [];
  const attendees        = data.attendees        || [];
  const customFields     = data.customFields     || [];
  const notes            = data.notes            || "";

  const allRecipients    = [...recipients, ...customRecipients];
  const displayType      = eventType === "Khác" && eventTypeOther ? eventTypeOther : eventType;
  const displayOrganizer = organizerUnit ? `${organizer} – ${organizerUnit}` : organizer;

  let sectionIdx = 0;
  const nextRoman = () => ROMAN[sectionIdx++];
  const today = new Date();

  return (
    <div
      style={{ width: "794px", minHeight: "1123px" }}
      className={`bg-white font-serif text-black ${
        isModal ? "px-20 py-16 my-8 shadow-2xl rounded" : "px-16 py-12 shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded"
      }`}
    >
      <div className="flex justify-between text-[12px] font-bold mb-10 leading-snug">
        <div className="text-center uppercase">
          <p>Bộ Giáo dục và Đào tạo</p>
          <p className="font-black">Trường Đại học Công nghiệp TP.HCM</p>
          {displayOrganizer && <p className="font-semibold normal-case">{displayOrganizer}</p>}
          <div className="w-28 h-[1.5px] bg-black mx-auto mt-1" />
        </div>
        <div className="text-center uppercase">
          <p>Cộng hòa xã hội chủ nghĩa Việt Nam</p>
          <p className="font-black">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-36 h-[1.5px] bg-black mx-auto mt-1" />
        </div>
      </div>

      <div className="text-center mb-10">
        <h3 className="text-[17px] font-black uppercase tracking-widest">KẾ HOẠCH</h3>
        {displayType && (
          <p className="text-[12px] mt-0.5 text-slate-600 italic">({displayType})</p>
        )}
        <p className="font-bold text-[15px] mt-2 underline underline-offset-4">
          V/v: {eventTitle || "CHƯA CÓ TIÊU ĐỀ SỰ KIỆN"}
        </p>
        {eventTopic && (
          <p className="text-[12px] mt-1 italic text-slate-700">Chủ đề: {eventTopic}</p>
        )}
      </div>

      <div className="space-y-6 text-[14px] leading-[1.9]">
        <div>
          <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. MỤC ĐÍCH</p>
          <p className="text-justify ml-6">
            {eventPurpose || `Tổ chức ${displayType || "sự kiện"} nhằm nâng cao kiến thức và kỹ năng thực tế cho người tham dự.`}
          </p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. THỜI GIAN VÀ ĐỊA ĐIỂM</p>
          <p className="ml-6">- <span className="font-semibold">Thời gian:</span> Từ {formatDate(startTime)} đến {formatDate(endTime)}.</p>
          <p className="ml-6">- <span className="font-semibold">Địa điểm:</span> {location || "...................."}</p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. ĐỐI TƯỢNG THAM DỰ</p>
          {participants.length > 0 && (
            <p className="ml-6">- <span className="font-semibold">Thành phần:</span> {Array.isArray(participants) ? participants.join(", ") : participants}.</p>
          )}
          {attendees.length > 0 && (
            <div className="ml-6 mt-1">
              <p className="font-semibold">- Danh sách tham dự:</p>
              <ul className="ml-4 mt-0.5 space-y-0.5">
                {attendees.map((p, i) => (
                  <li key={i} className="text-[13px]">+ {formatPerson(p)}{p.email ? ` – ${p.email}` : ""}</li>
                ))}
              </ul>
            </div>
          )}
          {participants.length === 0 && attendees.length === 0 && (
            <p className="ml-6">Toàn thể {organizer || "đơn vị"} và các cá nhân quan tâm.</p>
          )}
        </div>

        {presenters.length > 0 && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. NGƯỜI TRÌNH BÀY</p>
            <ul className="ml-6 space-y-0.5">
              {presenters.map((p, i) => (<li key={i}>- {formatPerson(p)}{p.email ? ` – ${p.email}` : ""}</li>))}
            </ul>
          </div>
        )}

        {organizers.length > 0 && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. BAN TỔ CHỨC</p>
            <ul className="ml-6 space-y-0.5">
              {organizers.map((p, i) => (<li key={i}>- {formatPerson(p)}{p.email ? ` – ${p.email}` : ""}</li>))}
            </ul>
          </div>
        )}

        {customFields.length > 0 && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. THÔNG TIN BỔ SUNG</p>
            <ul className="ml-6 space-y-0.5">
              {customFields.map((f, i) => (
                <li key={i}>- <span className="font-semibold">{f.name}:</span> {f.description || "...................."}</li>
              ))}
            </ul>
          </div>
        )}

        {notes && notes !== eventPurpose && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">{nextRoman()}. GHI CHÚ</p>
            <p className="ml-6 text-justify">{notes}</p>
          </div>
        )}
      </div>

      <div className="mt-16 flex justify-between text-[12px]">
        <div className="w-[40%]">
          <p className="font-bold italic underline mb-1 text-[12px]">Nơi nhận:</p>
          {allRecipients.map((r, i) => (<p key={i}>- {r};</p>))}
          {organizer && <p>- Lưu VT, {organizer}.</p>}
        </div>
        <div className="text-center w-[45%]">
          <p className="italic mb-1 text-[12px]">TP. Hồ Chí Minh, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}</p>
          <p className="font-black uppercase text-[13px] mb-20">TRƯỞNG KHOA</p>
          <div className="border-t border-dashed border-slate-300 pt-1">
            <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SaveTemplateModal = ({ data, onClose }) => {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await eventTemplateApi.createTemplate({
        organizationId:       data.organizationId      || null,
        templateName:         name.trim(),
        templateType:         data.eventType !== "Khác" ? data.eventType || null : null,
        customTemplateType:   data.eventType === "Khác" ? data.eventTypeOther || null : null,
        description:          data.eventPurpose        || data.description    || null,
        defaultTitle:         data.eventTitle          || data.title          || null,
        defaultDescription:   data.eventTopic          || null,
        defaultLocation:      data.location            || null,
        defaultEventMode:     data.eventMode           || null,
        defaultMaxParticipants: data.maxParticipants   || 0,
        configData:           JSON.stringify(data),
        createdAt:            new Date().toISOString(),
        updatedAt:            new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      alert("Không thể lưu bản mẫu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {saved ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-lg font-bold text-emerald-700">Đã lưu bản mẫu!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Star size={22} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Lưu bản mẫu</h2>
                <p className="text-sm text-slate-500">Tái sử dụng nhanh cho lần sau</p>
              </div>
            </div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên bản mẫu</label>
            <input
              type="text"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 mb-6"
              placeholder="Ví dụ: Hội thảo KHOA CNTT, Seminar định kỳ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-400 transition-all"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving ? "Đang lưu..." : "Lưu mẫu"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const PreviewStep = ({ onEdit, onSave, onReset, onGoToStep2, data = {} }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportWord = async () => {
    setExporting(true);
    try {
      await exportToWord(data);
    } catch (e) {
      alert("Xuất file thất bại: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (onGoToStep2) {
      onGoToStep2();
    } else if (onReset) {
      onReset();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Xem trước văn bản</h1>
          <p className="text-slate-500 text-sm italic">Hệ thống đang mô phỏng định dạng in ấn thực tế</p>
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
        >
          <Maximize2 size={18} /> Phóng to toàn màn hình
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3 sticky top-6">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Công cụ quản lý
            </p>

            <button
              onClick={() => onSave && onSave(data)}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
            >
              <Save size={18} /> Lưu kế hoạch
            </button>

            <button
              onClick={handleExportWord}
              disabled={exporting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Đang xuất...
                </>
              ) : (
                <>
                  <Download size={18} /> Xuất file Word
                </>
              )}
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
            >
              <Star size={18} /> Lưu bản mẫu
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              onClick={onEdit}
              className="w-full bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-slate-400 hover:text-slate-800 transition-all"
            >
              <ArrowLeft size={18} /> Quay lại sửa
            </button>

            <button
              onClick={handleReset}
              className="w-full text-rose-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
            >
              <RefreshCw size={18} /> Làm mới nội dung
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-200/50 rounded-3xl p-8 border border-slate-200 overflow-hidden shadow-inner flex justify-center">
            <div className="scale-[0.75] origin-top transform-gpu">
              <DocumentContent data={data} />
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col">
          <div className="flex justify-between items-center px-8 py-4 border-b border-white/10 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg"><FileText size={20} /></div>
              <span className="font-bold text-lg">Chế độ xem tập trung (A4 Mode)</span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-white/10 p-2 rounded-full hover:bg-rose-500 transition-all"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-8 flex justify-center">
            <DocumentContent isModal data={data} />
          </div>
          <div className="p-6 bg-white/5 border-t border-white/10 flex justify-center gap-4 flex-shrink-0">
            <button
              onClick={handleExportWord}
              disabled={exporting}
              className="px-8 py-3 bg-blue-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-60"
            >
              <Download size={20} /> {exporting ? "Đang xuất..." : "Xuất Word"}
            </button>
            <button
              onClick={() => { setIsFullscreen(false); onSave && onSave(data); }}
              className="px-10 py-3 bg-emerald-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
            >
              <Save size={20} /> XÁC NHẬN LƯU
            </button>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <SaveTemplateModal data={data} onClose={() => setShowTemplateModal(false)} />
      )}
    </div>
  );
};

export default PreviewStep;