import React from "react";
import { formatDate } from "../../utils/dateUtils";

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

const formatPerson = (p) => {
  if (!p) return "";

  const title = p.title || "";
  const name = p.name || p.fullName || "";
  const role = p.role === "MEMBER" ? "" : p.role;
  const department = p.department || "";
  const organization = p.organization || p.org || "";

  const parts = [title, name, role, department, organization].filter(Boolean);
  return parts.join(" - ");
};

export const DocumentContent = ({ isModal = false, data = {} }) => {
  const {
    eventType = "",
    eventTitle = data.title || "",
    eventTopic = "",
    eventPurpose = data.description || "",
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
    createdByName = "Người lập kế hoạch",
    maxParticipants = 150,
    programItems = [],
  } = data;

  const allRecipients = [...recipients, ...customRecipients];
  const displayOrganizer = major ? `${faculty} – ${major}` : faculty;
  const today = new Date();

  return (
    <div
      style={{ width: "794px", minHeight: "1800px" }}
      className={`bg-white font-serif text-black leading-relaxed text-[14px] ${
        isModal
          ? "px-20 py-16 my-8 shadow-2xl rounded"
          : "px-16 py-12 shadow-[0_0_20px_rgba(0,0,0,0.1)] rounded mx-auto"
      }`}
    >
      <div className="mb-8">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-1/2 text-center uppercase font-bold text-[12px] align-top pr-4">
                <p>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM</p>
                <p>{faculty || "KHOA CÔNG NGHỆ THÔNG TIN"}</p>
                <p className="font-semibold">{major || ""}</p>
                <div className="w-32 h-[1.5px] bg-black mx-auto mt-2" />
              </td>

              <td className="w-1/2 text-center uppercase font-bold text-[12px] align-top pl-4">
                <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="font-black">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-40 h-[1.5px] bg-black mx-auto mt-2" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mb-10">
        <h3 className="text-[18px] font-black uppercase tracking-widest">
          KẾ HOẠCH
        </h3>
        <p className="text-[13px] mt-1 italic">
          V/v: {eventType ? `${eventTypeVi[eventType] || eventType}: ` : ""}
          {eventTitle || "CHƯA CÓ TIÊU ĐỀ SỰ KIỆN"}
        </p>
        {eventTopic && (
          <p className="text-[12px] mt-1 italic text-slate-700">
            Chủ đề: {eventTopic}
          </p>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <p className="font-black uppercase text-[13px] mb-1">1. MỤC ĐÍCH</p>
          <p className="ml-6 text-justify">
            -{" "}
            {eventPurpose ||
              "Tổ chức sự kiện nhằm nâng cao kiến thức và kỹ năng thực tế cho người tham dự."}
          </p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">
            2. THỜI GIAN VÀ ĐỊA ĐIỂM
          </p>
          <p className="ml-6">- Thời gian bắt đầu: {formatDate(startTime)}</p>
          {endTime && (
            <p className="ml-6">- Thời gian kết thúc: {formatDate(endTime)}</p>
          )}
          {registrationDeadline && (
            <p className="ml-6">
              - Hạn chót đăng ký: {formatDate(registrationDeadline)}
            </p>
          )}
          <p className="ml-6">
            - Địa điểm: {location || "...................."}
          </p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">
            3. ĐỐI TƯỢNG THAM GIA
          </p>
          <p className="ml-6">
            {participants.length > 0
              ? participants.join(", ")
              : "Sinh viên, Giảng viên, Cán bộ và các đối tượng liên quan."}
          </p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">
            4. SỐ LƯỢNG THAM GIA
          </p>
          <p className="ml-6">Tối đa: {maxParticipants} người tham gia</p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">
            5. ĐƠN VỊ TỔ CHỨC
          </p>
          <p className="ml-6">{displayOrganizer}</p>
        </div>

        <div>
          <p className="font-black uppercase text-[13px] mb-1">
            6. NỘI DUNG CHƯƠNG TRÌNH
          </p>
          {programItems.length > 0 ? (
            programItems.map((item, idx) => (
              <div key={idx} className="ml-6">
                <p>
                  Phần {idx + 1}. {item.title || "Chương trình"}
                </p>
                {item.presenter && (
                  <p className="ml-4">
                    Người chia sẻ: {item.presenter}{" "}
                    {item.presenterTitle ? `- ${item.presenterTitle}` : ""}
                  </p>
                )}
              </div>
            ))
          ) : (
            <>
              <p className="ml-6">Phần 1. Trình bày AI</p>
              <p className="ml-8">
                Người chia sẻ: {presenters[0]?.name || "Bùi Thanh Hùng"} - Giảng
                viên - Khoa Công Nghệ Thông Tin
              </p>
            </>
          )}
        </div>

        {organizers.length > 0 && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">
              7. BAN TỔ CHỨC
            </p>
            <ul className="ml-6 space-y-1">
              {organizers.map((p, i) => (
                <li key={i}>- {formatPerson(p)}</li>
              ))}
            </ul>
          </div>
        )}

        {attendees.length > 0 && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">
              8. THÀNH PHẦN THAM DỰ
            </p>
            <ul className="ml-6 space-y-1">
              {attendees.map((p, i) => (
                <li key={i}>
                  - {formatPerson(p)}
                  {p.email ? ` - ${p.email}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes && (
          <div>
            <p className="font-black uppercase text-[13px] mb-1">GHI CHÚ</p>
            <p className="ml-6 text-justify">{notes}</p>
          </div>
        )}
      </div>

      <div className="w-[48%] pr-6 py-6">
        <p className="font-bold italic underline mb-2 text-[12px]">Nơi nhận:</p>
        <div className="space-y-[2px] ml-4">
          {allRecipients.length > 0 &&
            allRecipients.map((r, i) => <p key={i}>- {r.trim()}.</p>)}
          {faculty && <p>- {faculty}.</p>}
        </div>
      </div>

      <div className="mt-20 flex justify-between items-start text-[12px] leading-relaxed">
        <div className="w-[100%] text-center">
          <div className="flex justify-end">
            <p className="italic mb-4 text-[12px]">
              Thành phố Hồ Chí Minh, ngày {today.getDate()} tháng{" "}
              {today.getMonth() + 1} năm {today.getFullYear()}
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <div className="w-1/2">
              <p className="font-black uppercase text-[13px] tracking-wide">
                KHOA CÔNG NGHỆ THÔNG TIN DUYỆT
              </p>
            </div>

            <div className="w-1/2 flex justify-center">
              <div className="text-center">
                <p className="font-black uppercase text-[13px] mb-12 tracking-wide">
                  NGƯỜI LẬP KẾ HOẠCH
                </p>
                <p className="italic font-bold text-[12px] mb-3">
                  (Ký và ghi rõ họ tên)
                </p>
                <p className="font-semibold text-[13px]">{createdByName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
