import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, Menu, Search, Wallet } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export type WorkerTab = "home" | "jobs" | "schedule" | "earnings" | "profile";

export function WorkerBottomNav({ activeTab }: { activeTab: WorkerTab }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Worker navigation"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 dark:bg-[#111928]/95 backdrop-blur-md border-t border-gray-100 dark:border-[#1E2A3B] py-3 px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={() => navigate("/worker")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "home"
              ? "text-[#087F7A] dark:text-[#00E5FF] font-semibold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <BriefcaseBusiness size={20} strokeWidth={activeTab === "home" ? 2.3 : 1.8} />
          <span className="text-[10px]">{t("Home")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/worker/job-requests")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "jobs"
              ? "text-[#087F7A] dark:text-[#00E5FF] font-semibold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <Search size={20} strokeWidth={activeTab === "jobs" ? 2.3 : 1.8} />
          <span className="text-[10px]">{t("Jobs")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/worker/availability")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "schedule"
              ? "text-[#087F7A] dark:text-[#00E5FF] font-semibold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <CalendarDays size={20} strokeWidth={activeTab === "schedule" ? 2.3 : 1.8} />
          <span className="text-[10px]">{t("Schedule")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/worker/earnings")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "earnings"
              ? "text-[#087F7A] dark:text-[#00E5FF] font-semibold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <Wallet size={20} strokeWidth={activeTab === "earnings" ? 2.3 : 1.8} />
          <span className="text-[10px]">{t("Earnings")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/worker/profile")}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === "profile"
              ? "text-[#087F7A] dark:text-[#00E5FF] font-semibold"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          <Menu size={20} strokeWidth={activeTab === "profile" ? 2.3 : 1.8} />
          <span className="text-[10px]">{t("Profile")}</span>
        </button>
      </div>
    </nav>
  );
}
