import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  IndianRupee,
  Loader2,
  MapPin,
  Menu,
  Search,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { getWorkerBookings, type Booking } from "../../services/bookings";
import { getWorkerAvailability } from "../../services/worker";
import { useLanguage } from "../../context/LanguageContext";
import { HeaderThemeToggle } from "../../components/common/ThemeToggle";
import { WorkerBottomNav } from "../../components/common/WorkerBottomNav";

interface StoredUser {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: "customer" | "worker" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [isAvailable, setIsAvailable] = useState(true);
  const [workerName, setWorkerName] = useState("Worker");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("shramigo_user");

    if (storedUser) {
      try {
        const user: StoredUser = JSON.parse(storedUser);
        if (user.role === "worker" && user.full_name) {
          setWorkerName(user.full_name);
        }
      } catch (error) {
        console.error("Failed to read logged-in worker:", error);
      }
    }

    async function loadData() {
      try {
        setLoading(true);
        const [bookingsData, availData] = await Promise.all([
          getWorkerBookings().catch(() => []),
          getWorkerAvailability().catch(() => []),
        ]);
        setBookings(bookingsData);
        if (availData.length > 0) {
          const hasAvailableDay = availData.some((a) => a.is_available);
          setIsAvailable(hasAvailableDay);
        }
      } catch (err) {
        console.error("Failed to load worker dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("Good morning");
    if (hour < 17) return t("Good afternoon");
    return t("Good evening");
  };

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculations
  const completedBookings = bookings.filter(
    (b) => b.status === "completed"
  );

  const completedPaidBookings = completedBookings.filter(
    (b) => b.payment_status === "paid"
  );

  const totalEarnings = completedPaidBookings.reduce(
    (sum, b) => sum + Number(b.worker_payout),
    0
  );

  const todayEarnings = completedPaidBookings
    .filter((b) => {
      const completionDate = b.completed_at ?? b.updated_at;
      return completionDate.startsWith(todayStr);
    })
    .reduce((sum, b) => sum + Number(b.worker_payout), 0);

  const completedTodayCount = completedBookings.filter((b) =>
    String(b.booking_date).startsWith(todayStr)
  ).length;

  const activeJobs = bookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "accepted" ||
      b.status === "on_the_way" ||
      b.status === "in_progress"
  );

  const displayJobs = activeJobs.length > 0 ? activeJobs : bookings.slice(0, 3);

  const formatEarning = (amount: number) => {
    const normalizedAmount = Number(amount);
    if (normalizedAmount >= 1000) {
      return `${(normalizedAmount / 1000).toFixed(1)}K`;
    }
    return normalizedAmount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#090E17] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8] dark:bg-[#090E17] relative">

        {/* Header */}
        <div className="bg-[#087F7A] px-5 pt-8 pb-7 rounded-b-[32px]">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <BrandLogo size="sm" />

              <div>
                <p className="text-white/60 text-xs">
                  {getGreeting()}
                </p>

                <h1 className="text-lg font-bold text-white">
                  {workerName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-white/15 p-1 rounded-xl">
                {(["en", "hi", "gu"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                      language === code
                        ? "bg-white text-[#087F7A] shadow-sm"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {code === "en" ? "EN" : code === "hi" ? "हिं" : "ગુજ"}
                  </button>
                ))}
              </div>

              <HeaderThemeToggle />

              <button
                type="button"
                onClick={() => navigate("/worker/notifications")}
                aria-label="Notifications"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white relative hover:bg-white/20 transition"
              >
                <Bell size={18} />
                <span className="w-2 h-2 rounded-full bg-[#FF5A00] absolute top-2.5 right-2.5" />
              </button>
            </div>

          </div>

          {/* Availability Toggle */}
          <div className="mt-6 bg-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isAvailable ? "bg-green-400" : "bg-gray-400"
                }`}
              />

              <div>
                <p className="text-white text-sm font-semibold">
                  {isAvailable ? t("You're Available") : t("You're Offline")}
                </p>

                <p className="text-white/60 text-[11px] mt-0.5">
                  {isAvailable
                    ? t("Customers can send you job requests")
                    : t("You won't receive new requests")}
                </p>
              </div>

            </div>

            <button
              type="button"
              aria-label="Toggle availability"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-11 h-6 rounded-full p-1 transition ${
                isAvailable ? "bg-[#FF5A00]" : "bg-white/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

          </div>
        </div>

        {/* Main */}
        <div className="px-5 pt-6 pb-28">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">

            <div className="bg-white dark:bg-[#111928] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A3B]">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-3">
                <BriefcaseBusiness
                  size={18}
                  className="text-[#FF5A00]"
                />
              </div>

              <p className="text-xl font-bold text-gray-900 dark:text-[#F8FAFC]">
                {loading ? "-" : bookings.length}
              </p>

              <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-1">
                {t("Total jobs")}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111928] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A3B]">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-3">
                <Wallet
                  size={18}
                  className="text-green-600"
                />
              </div>

              <p className="text-xl font-bold text-gray-900 dark:text-[#F8FAFC]">
                {loading ? "-" : formatEarning(totalEarnings)}
              </p>

              <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-1">
                {t("Earnings")}
              </p>
            </div>

            <div className="bg-white dark:bg-[#111928] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A3B]">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 flex items-center justify-center mb-3">
                <Star
                  size={18}
                  className="text-yellow-500"
                  fill="currentColor"
                />
              </div>

              <p className="text-xl font-bold text-gray-900 dark:text-[#F8FAFC]">
                {activeJobs.length}
              </p>

              <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-1">
                {t("Active")}
              </p>
            </div>

          </div>

          {/* Today's summary */}
          <div className="mt-6 bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-400 dark:text-[#8192A8]">
                  {t("Today's earnings")}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <IndianRupee
                    size={20}
                    className="text-gray-900 dark:text-[#F8FAFC]"
                  />

                  <span className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
                    {todayEarnings}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/50">
                <TrendingUp
                  size={13}
                  className="text-green-600 dark:text-green-400"
                />

                <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                  {completedTodayCount > 0 ? `+${completedTodayCount} done` : t("Active")}
                </span>
              </div>

            </div>

            <div className="h-px bg-gray-100 dark:bg-[#1E2A3B] my-4" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-[#94A3B8]">
                {t("Completed jobs today")}
              </span>

              <span className="font-semibold text-gray-900 dark:text-[#F8FAFC]">
                {completedTodayCount} {completedTodayCount === 1 ? t("job") : t("jobs")}
              </span>
            </div>

          </div>

          {/* Job requests */}
          <div className="mt-7">

            <div className="flex items-center justify-between mb-4">

              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC]">
                  {activeJobs.length > 0 ? t("Active job requests") : t("Recent job requests")}
                </h2>

                <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1">
                  {t("Jobs assigned to you")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/worker/job-requests")}
                className="text-xs font-semibold text-[#087F7A] dark:text-[#00E5FF] hover:underline"
              >
                {t("View all")}
              </button>

            </div>

            <div className="space-y-3">

              {loading ? (
                <div className="py-8 text-center bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B]">
                  <Loader2 size={24} className="animate-spin text-[#087F7A] mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-2">{t("Loading your jobs...")}</p>
                </div>
              ) : displayJobs.length === 0 ? (
                <div className="py-8 px-4 text-center bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B]">
                  <BriefcaseBusiness size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-[#94A3B8]">{t("No job requests yet.")}</p>
                  <p className="text-[11px] text-gray-400 dark:text-[#8192A8] mt-0.5">
                    {t("Make sure your availability is turned ON to receive bookings.")}
                  </p>
                </div>
              ) : (
                displayJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() =>
                      navigate(`/worker/job-details/${job.id}`)
                    }
                    className="w-full text-left bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4 hover:border-gray-200 dark:hover:border-gray-700 transition active:scale-[0.99]"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
                          <BriefcaseBusiness
                            size={19}
                            className="text-[#FF5A00]"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-[#F8FAFC]">
                            Booking #{job.id}
                          </h3>

                          <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1 capitalize">
                            {t("Status")}: <span className="font-semibold text-[#087F7A] dark:text-[#00E5FF]">{t(job.status.replace("_", " "))}</span>
                          </p>
                        </div>

                      </div>

                      <ChevronRight
                        size={18}
                        className="text-gray-400 shrink-0"
                      />

                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin
                          size={14}
                          className="text-gray-400 shrink-0"
                        />

                        <span className="text-[11px] text-gray-500 dark:text-[#94A3B8] truncate">
                          {job.service_address}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock3
                          size={14}
                          className="text-gray-400 shrink-0"
                        />

                        <span className="text-[11px] text-gray-500 dark:text-[#94A3B8]">
                          {String(job.booking_time).slice(0, 5)} · {job.hours} {t("hr")}
                        </span>
                      </div>

                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1E2A3B] flex items-center justify-between">

                      <span className="text-xs text-gray-500 dark:text-[#94A3B8]">
                        {job.payment_status === "paid" ? t("Earned") : t("Estimated earning")}
                      </span>

                      <span className="text-sm font-bold text-[#087F7A] dark:text-[#00E5FF]">
                        ₹{job.worker_payout}
                      </span>

                    </div>

                  </button>
                ))
              )}

            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-7">

            <h2 className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC] mb-4">
              {t("Quick Actions")}
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => navigate("/worker/availability")}
                className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4 text-left hover:border-gray-200 dark:hover:border-gray-700 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center mb-3">
                  <CalendarDays
                    size={20}
                    className="text-[#FF5A00]"
                  />
                </div>

                <p className="text-sm font-bold text-gray-900 dark:text-[#F8FAFC]">
                  {t("My Schedule")}
                </p>

                <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-1">
                  {t("Update working hours")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/worker/skills")}
                className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4 text-left hover:border-gray-200 dark:hover:border-gray-700 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-3">
                  <BriefcaseBusiness
                    size={20}
                    className="text-[#087F7A] dark:text-[#00E5FF]"
                  />
                </div>

                <p className="text-sm font-bold text-gray-900 dark:text-[#F8FAFC]">
                  {t("Skills & Services")}
                </p>

                <p className="text-[11px] text-gray-500 dark:text-[#94A3B8] mt-1">
                  {t("Manage categories")}
                </p>
              </button>

            </div>

          </div>

        </div>

        {/* Bottom Navigation */}
        <WorkerBottomNav activeTab="home" />

      </div>
    </div>
  );
}