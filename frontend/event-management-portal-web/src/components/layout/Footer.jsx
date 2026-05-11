import React from "react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import { MapPin, Mail, Phone, MousePointer2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteStats, formatCount } from "../../hooks/useSiteStats";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const navigate = useNavigate();
  const { totalVisits, online } = useSiteStats();
  const { t } = useLanguage();

  const openMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
    );
  };

  return (
    <footer className="w-full bg-[#245bb5] text-white pt-10 pb-4 font-sans">
      <div className="max-w-350 mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Cột 1: Thông tin chính & Bản đồ */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="flex items-start gap-3 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
              title={t('back_to_home')}
            >
              <img
                src={logo_iuh}
                alt="IUH Logo"
                className="h-16 brightness-0 invert"
              />
            </div>

            <div className="space-y-3 text-sm">
              <h3 className="font-bold uppercase text-[#ffcc00]">
                {t('iuh_full_name')}
              </h3>
              <p className="flex items-start gap-2">
                <MapPin size={18} className="shrink-0 text-[#ffcc00]" />
                <span>
                  {t('address_label')}: {t('main_campus_addr')}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <Phone size={18} className="shrink-0 text-[#ffcc00]" />
                <span>
                  {t('phone_label')}: 0283 8940 390, {t('admission_label')}: 028 3985 1932 - 028 3895 5858
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
              {t('branches_label')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 text-sm">
              {/* Nguyễn Văn Dung */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_nv_dung')}
                </h4>
                <p>
                  {t('address_label')}: {t('branch_nv_dung_addr')} - {t('phone_label')}:
                  0283.8940 390
                </p>
                <button
                  onClick={() =>
                    openMap(
                      "Số 10 Nguyễn Văn Dung, Phường 6, Gò Vấp, Thành phố Hồ Chí Minh",
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>

              {/* Phạm Văn Chiêu */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_pv_chieu')}
                </h4>
                <p>
                  {t('address_label')}: {t('branch_pv_chieu_addr')} - {t('phone_label')}:
                  0283.8940 390
                </p>
                <button
                  onClick={() =>
                    openMap(
                      "20 Đường số 53, Phường 14, Gò Vấp, Thành phố Hồ Chí Minh",
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>

              {/* Trung tâm VH-TT */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_vhtt')}
                </h4>
                <p>
                  {t('address_label')}: {t('branch_vhtt_addr')} -
                  {t('phone_label')}: 0283.8940 390
                </p>
                <button
                  onClick={() =>
                    openMap(
                      "5A Nguyễn Văn Lượng, Phường 16, Gò Vấp, Thành phố Hồ Chí Minh",
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>

              {/* Nhơn Trạch */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_nhon_trach')}
                </h4>
                <p>{t('address_label')}: {t('branch_nhon_trach_addr')} - {t('phone_label')}: 0283.8940 390</p>
                <button
                  onClick={() =>
                    openMap("Đại học Công nghiệp TP.HCM cơ sở Nhơn Trạch")
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>

              {/* Thanh Hóa */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_thanh_hoa')}
                </h4>
                <p>
                  {t('address_label')}: {t('branch_thanh_hoa_addr')} - {t('phone_label')}: 02373.675.092
                </p>
                <button
                  onClick={() =>
                    openMap("5 ĐL Nam Sông Mã, Quảng Phú, Thanh Hóa, Vietnam")
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>

              {/* Quảng Ngãi */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-[#ffcc00]">
                  {t('branch_quang_ngai')}
                </h4>
                <p>
                  {t('address_label')}: {t('branch_quang_ngai_addr')} - {t('phone_label')}: (0255) 625 0075
                </p>
                <button
                  onClick={() =>
                    openMap("447 Hải Thượng Lãn Ông, Quảng Phú, TP. Thanh Hóa")
                  }
                  className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all"
                >
                  <MapPin size={14} /> {t('view_map')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center text-[13px] opacity-90 gap-4">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <Users size={16} className="text-[#ffcc00]" /> {t('visit_count')}:{" "}
              <span className="font-bold tracking-wider tabular-nums">
                {formatCount(totalVisits)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <MousePointer2 size={16} className="text-[#ffcc00]" /> {t('online_count')}:{" "}
              <span className="font-bold tabular-nums">{formatCount(online)}</span>
            </span>
          </div>
          <div className="text-center md:text-right">
            {t('copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
