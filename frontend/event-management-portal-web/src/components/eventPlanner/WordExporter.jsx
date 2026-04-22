import { formatDate } from "../../utils/dateUtils";
import { notificationApi } from "../../api/notificationApi";

const eventTypeVi = {
  WORKSHOP: "Workshop",
  SEMINAR: "Hội thảo",
  TALKSHOW: "Talkshow",
  COMPETITION: "Cuộc thi",
  CONFERENCE: "Hội nghị",
  WEBINAR: "Hội thảo trực tuyến",
  CONCERT: "Buổi hòa nhạc",
  OTHER: "Khác",
};

const formatPerson = (p) =>
  [p.title, p.name].filter(Boolean).join(" ") +
  (p.org || p.dept ? ` - ${p.org || p.dept}` : "");

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const wRun = (
  text,
  { bold = false, italic = false, underline = false, size = 24 } = {},
) => `
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

const wPara = (
  runs,
  { align = "", indent = 0, spaceBefore = 0, spaceAfter = 80 } = {},
) => `
  <w:p>
    <w:pPr>
      ${align ? `<w:jc w:val="${align}"/>` : ""}
      ${indent ? `<w:ind w:left="${indent}"/>` : ""}
      <w:spacing w:before="${spaceBefore}" w:after="${spaceAfter}"/>
    </w:pPr>
    ${runs}
  </w:p>`;

const buildDocumentXml = (data) => {
  const {
    eventType = "",
    eventTitle = "",
    eventTopic = "",
    eventPurpose = "",
    startTime = "",
    endTime = "",
    registrationDeadline = "",
    location = "",
    faculty = "Khoa Công nghệ thông tin",
    major = "",
    recipients = [],
    customRecipients = [],
    participants = [],
    presenters = [],
    organizers = [],
    attendees = [],
    notes = "",
    maxParticipants = 150,
    programItems = [],
    createdByName = "Người lập kế hoạch",
  } = data;

  const allRecipients = [...recipients, ...customRecipients];
  const displayOrganizer = major
    ? `${faculty} – ${major}`
    : faculty;
  const today = new Date();

  let body = "";

  body += `
    <w:p>
      <w:pPr><w:spacing w:after="120"/></w:pPr>
    </w:p>

    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders>
          <w:top w:val="nil"/>
          <w:left w:val="nil"/>
          <w:bottom w:val="nil"/>
          <w:right w:val="nil"/>
          <w:insideH w:val="nil"/>
          <w:insideV w:val="nil"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4530"/>
        <w:gridCol w:w="4530"/>
      </w:tblGrid>
      <w:tr>
        <w:trPr><w:trHeight w:val="400" w:hRule="atLeast"/></w:trPr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4530" w:type="dxa"/><w:jc w:val="center"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr>
              <w:t>${esc(faculty || "KHOA CÔNG NGHỆ THÔNG TIN")}</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t>${esc(major || "")}</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:before="80"/></w:pPr>
            <w:r>
              <w:t xml:space="preserve">          </w:t> <!-- giả lập đường kẻ ngang -->
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4530" w:type="dxa"/><w:jc w:val="center"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t>Độc lập - Tự do - Hạnh phúc</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:before="80"/></w:pPr>
            <w:r>
              <w:t xml:space="preserve">          </w:t> <!-- giả lập kẻ ngang -->
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>

    <w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>
  `;

  body += wPara(wRun("KẾ HOẠCH", { bold: true, size: 32 }), {
    align: "center",
    spaceBefore: 120,
    spaceAfter: 60,
  });

  body += wPara(
    wRun(
      `V/v: ${eventTypeVi[eventType] || eventType ? eventTypeVi[eventType] || eventType + ": " : ""}${eventTitle || "CHƯA CÓ TIÊU ĐỀ SỰ KIỆN"}`,
      { bold: true, underline: true, size: 26 },
    ),
    { align: "center", spaceAfter: 80 },
  );

  if (eventTopic) {
    body += wPara(wRun(`Chủ đề: ${eventTopic}`, { italic: true, size: 22 }), {
      align: "center",
      spaceAfter: 240,
    });
  }

  const sectionTitle = (text, size = 26, before = 240) =>
    wPara(wRun(text, { bold: true, size }), {
      spaceBefore: before,
      spaceAfter: 80,
    });

  const indentedPara = (text, size = 22, indent = 360, after = 40) =>
    wPara(wRun(text, { size }), { indent, spaceAfter: after });

  body += sectionTitle("1. MỤC ĐÍCH", 26, 240);
  body += indentedPara(
    eventPurpose || "Chưa có mục đích được nhập...",
    22,
    360,
    120,
  );

  body += sectionTitle("2. THỜI GIAN VÀ ĐỊA ĐIỂM");
  body += indentedPara(`- Thời gian bắt đầu: ${formatDate(startTime)}`);
  if (endTime) body += indentedPara(`- Thời gian kết thúc: ${formatDate(endTime)}`);
  if (registrationDeadline)
    body += indentedPara(`- Hạn chót đăng ký: ${formatDate(registrationDeadline)}`);
  body += indentedPara(`- Địa điểm: ${location || "Chưa xác định"}`);

  body += sectionTitle("3. ĐỐI TƯỢNG THAM GIA");
  body += indentedPara(
    participants.length > 0
      ? participants.join(", ")
      : "Sinh viên, Giảng viên, Cán bộ và các đối tượng liên quan.",
  );

  body += sectionTitle("4. SỐ LƯỢNG THAM GIA");
  body += indentedPara(`Tối đa: ${maxParticipants} người tham gia`);

  body += sectionTitle("5. ĐƠN VỊ TỔ CHỨC");
  body += indentedPara(displayOrganizer);

  body += sectionTitle("6. NỘI DUNG CHƯƠNG TRÌNH");

  if (programItems.length > 0) {
    programItems.forEach((item, idx) => {
      body += indentedPara(
        `Phần ${idx + 1}. ${item.title || "Chương trình"}`,
        22,
        360,
        40,
      );
      if (item.presenter) {
        body += indentedPara(
          `Người chia sẻ: ${item.presenter}${item.presenterTitle ? ` - ${item.presenterTitle}` : ""}`,
          22,
          500,
        );
      }
      if (item.description) {
        body += indentedPara(`Nội dung: ${item.description}`, 22, 680, 80);
      }
    });
  } else {
    body += indentedPara("Phần 1. Trình bày AI");
    body += indentedPara(
      `Người chia sẻ: ${presenters[0]?.name || "Chưa xác định"} - Giảng viên - Khoa Công Nghệ Thông Tin`,
      22,
      500,
    );
  }

  let sectionNum = 7;
  if (organizers.length > 0) {
    body += sectionTitle(`${sectionNum}. BAN TỔ CHỨC`);
    organizers.forEach((p) =>
      body += indentedPara(`- ${formatPerson(p)}${p.email ? ` - ${p.email}` : ""}`)
    );
    sectionNum++;
  }

  if (attendees.length > 0) {
    body += sectionTitle(`${sectionNum}. THÀNH PHẦN THAM DỰ`);
    attendees.forEach((p) =>
      body += indentedPara(`- ${formatPerson(p)}${p.email ? ` - ${p.email}` : ""}`)
    );
    sectionNum++;
  }

  if (notes) {
    body += sectionTitle("GHI CHÚ");
    body += indentedPara(notes, 22, 360);
  }

  body += wPara(
    wRun("Nơi nhận:", { italic: true, underline: true, size: 22 }),
    { spaceBefore: 240, spaceAfter: 60 },
  );

  allRecipients.forEach((r) => {
    body += wPara(wRun(`- ${r.trim()}.`, { size: 22 }), {
      indent: 720,
      spaceAfter: 20,
    });
  });
  if (allRecipients.length === 0 && faculty) {
    body += wPara(wRun(`- ${faculty}.`, { size: 22 }), { indent: 720 });
  }

  body += wPara(
    wRun(
      `Thành phố Hồ Chí Minh, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`,
      { italic: true, size: 22 },
    ),
    { align: "right", spaceBefore: 480, spaceAfter: 240 },
  );

  // Bảng chữ ký 2 cột
  body += `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="0" w:type="auto"/>
        <w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4530"/>
        <w:gridCol w:w="4530"/>
      </w:tblGrid>
      <w:tr>
        <w:trPr><w:trHeight w:val="600" w:hRule="atLeast"/></w:trPr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4530" w:type="dxa"/><w:jc w:val="center"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
              <w:t>KHOA CÔNG NGHỆ THÔNG TIN DUYỆT</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:i/><w:sz w:val="20"/></w:rPr>
              <w:t>(Ký, ghi rõ họ tên và đóng dấu)</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:before="360"/></w:pPr>
            <w:r><w:t>................................................</w:t></w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4530" w:type="dxa"/><w:jc w:val="center"/></w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
              <w:t>NGƯỜI LẬP KẾ HOẠCH</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr><w:i/><w:sz w:val="20"/></w:rPr>
              <w:t>(Ký và ghi rõ họ tên)</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:before="360"/></w:pPr>
            <w:r>
              <w:rPr><w:sz w:val="22"/></w:rPr>
              <w:t>${esc(createdByName || "................................................")}</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  `;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1701"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
};

export const exportToWord = async (data, userProfileId) => {
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const type = data.eventType || "Sự kiện";
  const eventTitle = data.eventTitle || data.title || "ke_hoach";
  const docXml = buildDocumentXml(data);

  const zip = new window.JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.file("word/document.xml", docXml);
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Kế hoạch ${type}_${eventTitle.replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Gửi thông báo realtime/lưu lịch sử
  if (userProfileId) {
    try {
      await notificationApi.create.send({
        userProfileId: userProfileId,
        type: "GENERAL",
        title: "📄 Xuất file Word thành công",
        message: `Kế hoạch "${eventTitle}" đã được tải xuống máy của bạn.`,
        actionUrl: "#", // Có thể dẫn tới mục quản lý file nếu có
      });
    } catch (err) {
      console.error("Lỗi khi gửi thông báo xuất file:", err);
    }
  }
};