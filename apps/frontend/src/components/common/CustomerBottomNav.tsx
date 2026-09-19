import { useNavigate } from "react-router-dom";
import { CalendarDays, Home, Search, UserRound } from "lucide-react";
import { useLanguage } from '@/app/providers/LanguageContext';

export type CustomerTab = "home" | "search" | "bookings" | "profile";

export function CustomerBottomNav({ activeTab }: { activeTab: CustomerTab }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Customer navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 border-t border-[#E5E7EB] dark:border-[#24324a] bg-white/95 dark:bg-[#111928]/95 px-5 pb-5 pt-3 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-4">
        <button
          type="button"
          onClick={() => navigate("/customer")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "home" ? "text-[#FF5A00]" : "text-[#9CA3AF] hover:text-[#6B7280] dark:text-[#8192A8] dark:hover:text-white"
          }`}
        >
          <Home size={21} strokeWidth={activeTab === "home" ? 2.3 : 1.8} />
          <span className={`text-[11px] ${activeTab === "home" ? "font-semibold text-[#FF5A00]" : "font-medium"}`}>
            {t("Home")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/search")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "search" ? "text-[#FF5A00]" : "text-[#9CA3AF] hover:text-[#6B7280] dark:text-[#8192A8] dark:hover:text-white"
          }`}
        >
          <Search size={21} strokeWidth={activeTab === "search" ? 2.3 : 1.8} />
          <span className={`text-[11px] ${activeTab === "search" ? "font-semibold text-[#FF5A00]" : "font-medium"}`}>
            {t("Search")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/bookings")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "bookings" ? "text-[#FF5A00]" : "text-[#9CA3AF] hover:text-[#6B7280] dark:text-[#8192A8] dark:hover:text-white"
          }`}
        >
          <CalendarDays size={21} strokeWidth={activeTab === "bookings" ? 2.3 : 1.8} />
          <span className={`text-[11px] ${activeTab === "bookings" ? "font-semibold text-[#FF5A00]" : "font-medium"}`}>
            {t("Bookings")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/customer/profile")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "profile" ? "text-[#FF5A00]" : "text-[#9CA3AF] hover:text-[#6B7280] dark:text-[#8192A8] dark:hover:text-white"
          }`}
        >
          <UserRound size={21} strokeWidth={activeTab === "profile" ? 2.3 : 1.8} />
          <span className={`text-[11px] ${activeTab === "profile" ? "font-semibold text-[#FF5A00]" : "font-medium"}`}>
            {t("Profile")}
          </span>
        </button>
      </div>
    </nav>
  );
}
