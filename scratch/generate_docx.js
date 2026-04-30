import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import fs from "fs";

const doc = new Document({
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                text: "KẾ HOẠCH TỔ CHỨC SỰ KIỆN",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Tên sự kiện: ", bold: true }),
                    new TextRun("Hội thảo Công nghệ AI trong Giáo dục 2026"),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Chủ đề: ", bold: true }),
                    new TextRun("Trí tuệ nhân tạo và Tương lai Giáo dục"),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Mục đích: ", bold: true }),
                    new TextRun("Chia sẻ kiến thức về ứng dụng AI trong giảng dạy, nghiên cứu và quản lý giáo dục. Thúc đẩy chuyển đổi số tại IUH."),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Thời gian: ", bold: true }),
                    new TextRun("08:00 - 15/05/2026"),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Địa điểm: ", bold: true }),
                    new TextRun("Hội trường E4, IUH"),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Quy mô: ", bold: true }),
                    new TextRun("200 sinh viên và giảng viên"),
                ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                text: "CHƯƠNG TRÌNH CHI TIẾT",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ text: "1. 08:00 - 08:30: Đón khách và ổn định chỗ ngồi." }),
            new Paragraph({ text: "2. 08:30 - 09:30: Keynote: Tầm nhìn AI 2030 trong giáo dục đại học." }),
            new Paragraph({ text: "3. 09:30 - 11:30: Workshop thực hành: Prompt Engineering cho giảng viên." }),
            new Paragraph({ text: "4. 11:30 - 12:00: Hỏi đáp và Bế mạc." }),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Mau_Tao_Su_Kien.docx", buffer);
    console.log("File created successfully: Mau_Tao_Su_Kien.docx");
});
