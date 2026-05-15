import React from "react";
import logo_iuh from "../../assets/images/logo_iuh.png";
import {
  MapPin,
  Mail,
  Phone,
  MousePointer2,
  Users,
  ArrowUpRight,
} from "lucide-react";
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
      "_blank"
    );
  };

  const branches = [
    {
      title: t("branch_nv_dung"),
      address: t("branch_nv_dung_addr"),
      map: "Số 10 Nguyễn Văn Dung, Phường 6, Gò Vấp, Thành phố Hồ Chí Minh",
      phone: "0283.8940 390",
    },
    {
      title: t("branch_pv_chieu"),
      address: t("branch_pv_chieu_addr"),
      map: "20 Đường số 53, Phường 14, Gò Vấp, Thành phố Hồ Chí Minh",
      phone: "0283.8940 390",
    },
    {
      title: t("branch_vhtt"),
      address: t("branch_vhtt_addr"),
      map: "5A Nguyễn Văn Lượng, Phường 16, Gò Vấp, Thành phố Hồ Chí Minh",
      phone: "0283.8940 390",
    },
    {
      title: t("branch_nhon_trach"),
      address: t("branch_nhon_trach_addr"),
      map: "Đại học Công nghiệp TP.HCM cơ sở Nhơn Trạch",
      phone: "0283.8940 390",
    },
    {
      title: t("branch_thanh_hoa"),
      address: t("branch_thanh_hoa_addr"),
      map: "5 ĐL Nam Sông Mã, Quảng Phú, Thanh Hóa, Vietnam",
      phone: "02373.675.092",
    },
    {
      title: t("branch_quang_ngai"),
      address: t("branch_quang_ngai_addr"),
      map: "447 Hải Thượng Lãn Ông, Quảng Phú, TP. Thanh Hóa",
      phone: "(0255) 625 0075",
    },
  ];

  return (
    <footer className="bg-[#1e3a8a] text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">

        {/* TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-white/10">

          {/* LEFT */}
          <div className="lg:col-span-4">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-4 cursor-pointer mb-6"
            >
              <img
                src={logo_iuh}
                alt="IUH Logo"
                className="h-14 brightness-0 invert"
              />

              <div>

              </div>
            </div>

            <div className="space-y-4 text-sm text-blue-50/90">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-amber-300 shrink-0" />
                <p>
                  {t("address_label")}: {t("main_campus_addr")}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-amber-300 shrink-0" />
                <p>
                  0283 8940 390 <br />
                  028 3985 1932
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-amber-300 shrink-0" />
                <p>dhcn@iuh.edu.vn</p>
              </div>
            </div>

            {/* MAP */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <iframe
                title="IUH Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.730335043166!2d106.68533807573024!3d10.83158095797305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752857444c5c2d%3A0x6b45a0b72a6b284!2sIndustrial%20University%20of%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1715655000000!5m2!1sen!2s"
                className="w-full h-56 border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h3 className="text-2xl font-black tracking-tight">
                {t("branches_label")}
              </h3>

              <div className="w-16 h-[3px] bg-amber-400 rounded-full mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {branches.map((branch, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300"
                >
                  <h4 className="text-base font-bold text-amber-300 mb-2">
                    {branch.title}
                  </h4>

                  <p className="text-sm text-blue-100/80 leading-relaxed mb-4">
                    {branch.address}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-white/70">
                      {branch.phone}
                    </span>

                    <button
                      onClick={() => openMap(branch.map)}
                      className="flex items-center gap-1 text-xs font-bold text-white hover:text-amber-300 transition-colors"
                    >
                      <MapPin size={14} />
                      {t("view_map")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-blue-100/70">

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-amber-300" />
              <span>
                {t("visit_count")}:{" "}
                <span className="font-bold text-white">
                  {formatCount(totalVisits)}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

              <MousePointer2 size={16} className="text-amber-300" />

              <span>
                {t("online_count")}:{" "}
                <span className="font-bold text-white">
                  {formatCount(online)}
                </span>
              </span>
            </div>
          </div>

          <div className="text-center md:text-right">
            {t("copyright")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
