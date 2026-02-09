import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Building2,
  Share2,
  Heart,
  Timer,
  Target,
  CheckCircle,
  Award,
  Download,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

// Mock data - trong thực tế bạn sẽ fetch từ API
const mockPosts = [
  {
    id: 1,
    title: "Hội thảo Khoa học: AI và Machine Learning trong Công nghiệp 4.0",
    description:
      "Hội thảo về ứng dụng AI và ML trong các ngành công nghiệp hiện đại",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    eventDate: "15/12/2025",
    eventTime: "08:00 - 11:30",
    registeredCount: 450,
    maxParticipants: 500,
    status: "upcoming",
    type: "workshop",
    organizer: "cntt",
    location: "hoi-truong-a",
    hasPoints: true,
    fee: "free",
    duration: "2-4h",
    target: "all",
    tags: ["AI", "MachineLearning"],
    fullDescription: `
      Hội thảo khoa học về AI và Machine Learning trong Công nghiệp 4.0 là sự kiện quan trọng 
      nhằm cập nhật những xu hướng mới nhất trong lĩnh vực trí tuệ nhân tạo và học máy.
      
      Nội dung chính:
      - Giới thiệu tổng quan về AI và ML
      - Ứng dụng thực tế trong các ngành công nghiệp
      - Thảo luận và Q&A với chuyên gia
      - Workshop thực hành
    `,
    speakers: [
      {
        name: "TS. Nguyễn Văn A",
        title: "Giảng viên Khoa CNTT",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      {
        name: "ThS. Trần Thị B",
        title: "Chuyên gia AI",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
    ],
    agenda: [
      { time: "08:00 - 08:30", activity: "Đăng ký và check-in" },
      { time: "08:30 - 09:00", activity: "Khai mạc và giới thiệu" },
      { time: "09:00 - 10:30", activity: "Phần trình bày chính" },
      { time: "10:30 - 11:00", activity: "Q&A" },
      { time: "11:00 - 11:30", activity: "Bế mạc" },
    ],
  },
  {
    id: 2,
    title: "Ngày Hội Việc Làm IUH Career Fair 2025",
    description: "Sự kiện kết nối sinh viên với các doanh nghiệp hàng đầu",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    eventDate: "20/12/2025",
    eventTime: "07:30 - 16:30",
    registeredCount: 1850,
    maxParticipants: 2000,
    status: "ongoing",
    type: "career",
    organizer: "ctsv",
    location: "san-van-dong",
    hasPoints: true,
    fee: "free",
    duration: "full-day",
    target: "all",
    tags: ["TìmViệc", "CareerFair"],
    fullDescription: `
      Ngày hội việc làm IUH Career Fair 2025 quy tụ hơn 50 doanh nghiệp hàng đầu
      tại Việt Nam và quốc tế, tạo cơ hội kết nối và tìm kiếm việc làm cho sinh viên.
    `,
    speakers: [],
    agenda: [],
  },
  {
    id: 3,
    title: "Workshop: Kỹ năng phỏng vấn cho sinh viên",
    description: "Hướng dẫn cách chuẩn bị và vượt qua phỏng vấn xin việc",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    eventDate: "01/12/2025",
    eventTime: "14:00 - 17:00",
    registeredCount: 200,
    maxParticipants: 200,
    status: "completed",
    type: "workshop",
    organizer: "ctsv",
    location: "online",
    hasPoints: true,
    fee: "free",
    duration: "2-4h",
    target: "year-4",
    tags: ["KỹNăngMềm"],
    fullDescription: `
      Workshop trang bị kỹ năng phỏng vấn chuyên nghiệp cho sinh viên sắp tốt nghiệp.
    `,
    speakers: [],
    agenda: [],
  },
];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Scroll to top khi vào trang
    window.scrollTo(0, 0);

    // Fetch event data - trong thực tế sẽ gọi API
    const foundEvent = mockPosts.find((e) => e.id === parseInt(id));
    setEvent(foundEvent);
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  const availableSlots = event.maxParticipants - event.registeredCount;
  const availabilityPercent = (availableSlots / event.maxParticipants) * 100;
  const registrationPercent =
    (event.registeredCount / event.maxParticipants) * 100;

  // Map location names
  const locationMap = {
    "hoi-truong-a": "Hội trường A",
    "hoi-truong-b": "Hội trường B",
    "san-van-dong": "Sân vận động",
    online: "Online",
    "ngoai-truong": "Ngoài trường",
  };

  // Map organizer names
  const organizerMap = {
    cntt: "Khoa CNTT",
    ctsv: "Phòng CTSV",
    "kinh-te": "Khoa Kinh tế",
    "doan-hoi": "Đoàn - Hội",
    club: "CLB sinh viên",
  };

  // Map event types
  const typeMap = {
    seminar: "Hội thảo",
    sport: "Thi đấu thể thao",
    culture: "Văn nghệ",
    career: "Tuyển dụng",
    workshop: "Workshop",
    charity: "Từ thiện",
    networking: "Giao lưu",
  };

  // Map duration
  const durationMap = {
    "under-2h": "Dưới 2 giờ",
    "2-4h": "2-4 giờ",
    "half-day": "Nửa ngày",
    "full-day": "Cả ngày",
    "multi-day": "Nhiều ngày",
  };

  // Map target audience
  const targetMap = {
    all: "Tất cả sinh viên",
    "year-1": "Sinh viên năm 1",
    "year-2-3": "Sinh viên năm 2-3",
    "year-4": "Sinh viên năm 4",
    "cntt-only": "Chỉ khoa CNTT",
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      {/* Hero Section */}
      <div className="relative h-96 bg-linear-to-b from-gray-900 to-gray-800">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition font-semibold text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === "upcoming"
                    ? "bg-blue-500"
                    : event.status === "ongoing"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              >
                {event.status === "upcoming"
                  ? "Sắp diễn ra"
                  : event.status === "ongoing"
                  ? "Đang diễn ra"
                  : "Đã kết thúc"}
              </span>
              {event.hasPoints && (
                <span className="px-3 py-1 rounded-full bg-purple-500 text-sm font-semibold">
                  Có điểm RL
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-gray-700/80 text-sm font-semibold">
                {typeMap[event.type]}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {event.title}
            </h1>
            <p className="text-lg text-gray-200">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Cards */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thông tin sự kiện
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Ngày diễn ra
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.eventDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Thời gian
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.eventTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Địa điểm
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {locationMap[event.location]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Đơn vị tổ chức
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {organizerMap[event.organizer]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Timer className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Thời lượng
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {durationMap[event.duration]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Đối tượng
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {targetMap[event.target]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Phí tham gia
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.fee === "free" ? "Miễn phí" : "Có phí"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Điểm rèn luyện
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {event.hasPoints ? "Có" : "Không"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.fullDescription || event.description}
                </p>
              </div>
            </div>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chương trình
                </h2>
                <div className="space-y-3">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="shrink-0">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-700">
                          {item.time}
                        </p>
                        <p className="text-gray-700">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Diễn giả
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">
                          {speaker.name}
                        </p>
                        <p className="text-sm text-gray-600">{speaker.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chủ đề
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Registration Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Registration Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      Đã đăng ký
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {event.registeredCount} / {event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        availabilityPercent > 20
                          ? "bg-green-500"
                          : availabilityPercent > 0
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${registrationPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {availabilityPercent === 0 ? (
                      <span className="text-red-600 font-semibold">
                        Đã hết chỗ
                      </span>
                    ) : availabilityPercent <= 20 ? (
                      <span className="text-orange-600 font-semibold">
                        Chỉ còn {availableSlots} chỗ
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Còn {availableSlots} chỗ
                      </span>
                    )}
                  </p>
                </div>

                {event.status !== "completed" && (
                  <>
                    {isRegistered ? (
                      <button
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-3"
                        disabled
                      >
                        <CheckCircle className="w-5 h-5" />
                        Đã đăng ký
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsRegistered(true)}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={availabilityPercent === 0}
                      >
                        {availabilityPercent === 0
                          ? "Đã hết chỗ"
                          : "Đăng ký tham gia"}
                      </button>
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 border-2 border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="flex-1 border-2 border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="flex-1 border-2 border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
                    <Download className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lưu ý
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Vui lòng đến đúng giờ</li>
                  <li>• Mang theo thẻ sinh viên</li>
                  <li>• Trang phục lịch sự</li>
                  {event.hasPoints && <li>• Sẽ được điểm rèn luyện</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetail;