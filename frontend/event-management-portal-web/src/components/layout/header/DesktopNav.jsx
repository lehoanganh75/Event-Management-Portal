import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const DesktopNav = ({ setActiveSection, t }) => {
  const location = useLocation();

  const navItems = [
    { id: "home", label: t("home"), path: "/" },
    { id: "events", label: t("events"), path: "/events" },
    { id: "calendar", label: t("calendar"), path: "/calendar" },
    { id: "news", label: t("news"), path: "/news" },
  ];

  return (
    <nav className="hidden lg:flex items-center h-full gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => setActiveSection(item.id)}
            className="
              relative
              h-[72px]
              px-5
              flex items-center justify-center
              group
            "
          >
            {/* Text */}
            <span
              className={`
                relative
                inline-block
                text-[13px]
                font-medium
                tracking-[0.01em]
                transition-all duration-300
                ${isActive
                  ? "text-[#1E40AF]"
                  : "text-slate-600 group-hover:text-[#1E40AF]"
                }
              `}
            >
              {item.label}

              {/* Active underline */}
              {isActive && (
                <motion.span
                  layoutId="nav-line"
                  className="
                    absolute
                    left-0
                    bottom-[-8px]
                    w-full
                    h-[2.5px]
                    bg-[#1E40AF]
                    rounded-full
                  "
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              {/* Hover underline */}
              {!isActive && (
                <span
                  className="
                    absolute
                    left-0
                    bottom-[-8px]
                    w-0
                    h-[2px]
                    bg-[#1E40AF]
                    rounded-full
                    transition-all duration-300
                    group-hover:w-full
                  "
                />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DesktopNav;