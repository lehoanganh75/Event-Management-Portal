import React from "react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { MapPin, Mail, Phone, MousePointer2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="w-full bg-[#245bb5] text-white pt-10 pb-4 font-sans">
      <div className="max-w-350 mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Cột 1: Thông tin chính & Bản đồ */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-start gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
              title="Quay về trang chủ"
            >
              <img
                src={logo_iuh}
                alt="IUH Logo"
                className="h-16 brightness-0 invert"
              />
            </div>

            <div className="space-y-3 text-sm">
              <h3 className="font-bold uppercase text-[#ffcc00]">
                Đại học Công nghiệp TP. Hồ Chí Minh
              </h3>
              <p className="flex items-start gap-2">
                <MapPin size={18} className="shrink-0 text-[#ffcc00]" />
                <span>
                  Địa chỉ: Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, Thành phố Hồ Chí
                  Minh
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Phone size={18} className="shrink-0 text-[#ffcc00]" />
                <span>
                  ĐT: 0283 8940 390, Tuyển sinh: 028 3985 1932 - 028 3895 5858
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Mail size={18} className="shrink-0 text-[#ffcc00]" />
                <span>Email: dhcn@iuh.edu.vn</span>
              </p>
            </div>

            {/* Google Map Embed Placeholder */}
            <div className="mt-4 rounded-lg overflow-hidden border-2 border-white/20 h-48 w-full bg-gray-200">
              <iframe
                title="IUH Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.85823798204!2d106.68427047583874!3d10.822484158348083!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e549310397%3A0x139598ef0168926d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1700000000000"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Cột 2 & 3: Các cơ sở và phân hiệu */}
          <div className="lg:col-span-8">
            <h3 className="text-lg font-bold italic mb-6 border-b border-white/20 pb-2">
              Các cơ sở và phân hiệu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 text-sm">
              {/* Nguyễn Văn Dung */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Nguyễn Văn Dung
                </h4>
                <p>
                  Địa chỉ: Số 10 Nguyễn Văn Dung, Phường An Nhơn, TP.HCM - ĐT:
                  0283.8940 390
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>

              {/* Phạm Văn Chiêu */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Phạm Văn Chiêu
                </h4>
                <p>
                  Địa chỉ: Số 20 Đường số 53, Phường An Hội Tây, TP.HCM - ĐT:
                  0283.8940 390
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>

              {/* Trung tâm VH-TT */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Trung tâm cung ứng dịch vụ VH-TT
                </h4>
                <p>
                  Địa chỉ: Số 5A Nguyễn Văn Lượng, phường An Hội Đông, TP.HCM -
                  ĐT: 0283.8940 390
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>

              {/* Nhơn Trạch */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Nhơn Trạch
                </h4>
                <p>Địa chỉ: xã Phước An, tỉnh Đồng Nai - ĐT: 0283.8940 390</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>

              {/* Thanh Hóa */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Thanh Hóa
                </h4>
                <p>
                  Địa chỉ: Phường Quảng Phú, tỉnh Thanh Hóa - ĐT: 02373.675.092
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>

              {/* Quảng Ngãi */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  Phân hiệu Quảng Ngãi
                </h4>
                <p>
                  Địa chỉ: Số 938 đường Quang Trung, phường Chánh Lộ, tỉnh Quảng
                  Ngãi - ĐT: (0255) 625 0075
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> Xem bản đồ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Số lượng truy cập & Copyright */}
        <div className="border-t border-white/20 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center text-[13px] opacity-90 gap-4">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <Users size={16} className="text-[#ffcc00]" /> Số lượng truy cập:{" "}
              <span className="font-bold tracking-wider">288,704,603</span>
            </span>
            <span className="flex items-center gap-1">
              <MousePointer2 size={16} className="text-[#ffcc00]" /> Đang
              online: <span className="font-bold">218</span>
            </span>
          </div>
          <div className="text-center md:text-right">
            © 2025 Đại học Công nghiệp TP.HCM - IUH
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
