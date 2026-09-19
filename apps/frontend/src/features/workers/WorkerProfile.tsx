import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Clock,
  Edit3,
  FileText,
  Globe,
  IndianRupee,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  Volume2,
  Wallet,
  X,
  Moon,
} from "lucide-react";
import { HeaderThemeToggle, InlineThemeToggle } from '@/components/common/ThemeToggle';
import { useLanguage, type Language } from '@/app/providers/LanguageContext';
import { ProfileLanguageSetting } from '@/components/common/LanguageSelector';
import { WorkerBottomNav } from '@/components/common/WorkerBottomNav';

import {
  getWorkerProfile,
  getWorkerSkills,
  getMyWorkerServices,
  updateWorkerProfile,
  deleteWorkerSkill,
  createWorkerSkill,
  updateWorkerService,
  type WorkerProfile,
  type WorkerSkill,
  type WorkerService,
} from '@/features/workers/services';
import { compressProfileImage } from '@/lib/profileImage';

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

interface WorkerAppSettings {
  language: string;
  soundAlerts: boolean;
  instantBooking: boolean;
  darkMode: boolean;
}

interface WorkerNotifPrefs {
  newJobs: boolean;
  bookingUpdates: boolean;
  paymentAlerts: boolean;
  welfareNews: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [skills, setSkills] = useState<WorkerSkill[]>([]);
  const [services, setServices] = useState<WorkerService[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAppSettingsModalOpen, setIsAppSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Form states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit general form
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    experience_years: 0,
    service_radius_km: 10,
    profile_image: "",
  });

  // Quick bio form
  const [bioInput, setBioInput] = useState("");

  // Location modal form
  const [locationForm, setLocationForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    service_radius_km: 10,
  });

  // Services pricing draft
  const [servicePriceDrafts, setServicePriceDrafts] = useState<Record<number, string>>({});
  const [newSkillInput, setNewSkillInput] = useState("");

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState<WorkerNotifPrefs>(() => {
    try {
      const saved = localStorage.getItem("shramigo_worker_notif_prefs");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      newJobs: true,
      bookingUpdates: true,
      paymentAlerts: true,
      welfareNews: true,
    };
  });

  // App settings
  const [appSettings, setAppSettings] = useState<WorkerAppSettings>(() => {
    try {
      const saved = localStorage.getItem("shramigo_worker_app_settings");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      language: "en",
      soundAlerts: true,
      instantBooking: true,
      darkMode: false,
    };
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("shramigo_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const [workerProfile, workerSkills, workerServices] = await Promise.all([
        getWorkerProfile(),
        getWorkerSkills(),
        getMyWorkerServices(),
      ]);

      setProfile(workerProfile);
      setSkills(workerSkills);
      setServices(workerServices);

      // Initialize drafts
      const drafts: Record<number, string> = {};
      for (const s of workerServices) {
        drafts[s.id] = s.custom_price !== null ? String(s.custom_price) : "";
      }
      setServicePriceDrafts(drafts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = () => {
    setEditForm({
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      pincode: profile?.pincode ?? "",
      bio: profile?.bio ?? "",
      experience_years: profile?.experience_years ?? 0,
      service_radius_km: profile?.service_radius_km ?? 10,
      profile_image: profile?.profile_image ?? "",
    });
    setEditError("");
    setSaveSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setEditError("");
      const updated = await updateWorkerProfile({
        full_name: editForm.full_name.trim(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        pincode: editForm.pincode.trim(),
        bio: editForm.bio.trim(),
        experience_years: Number(editForm.experience_years),
        service_radius_km: Number(editForm.service_radius_km) || 10,
        profile_image: editForm.profile_image || undefined,
      });
      setProfile(updated);
      if (user) {
        const updatedUser = {
          ...user,
          full_name: editForm.full_name.trim() || user.full_name,
          phone: editForm.phone.trim() || user.phone,
        };
        localStorage.setItem("shramigo_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
      }, 700);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const openLocationModal = () => {
    setLocationForm({
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      pincode: profile?.pincode ?? "",
      service_radius_km: profile?.service_radius_km ?? 10,
    });
    setEditError("");
    setSaveSuccess(false);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError("");
      const updated = await updateWorkerProfile({
        address: locationForm.address.trim(),
        city: locationForm.city.trim(),
        state: locationForm.state.trim(),
        pincode: locationForm.pincode.trim(),
        service_radius_km: Number(locationForm.service_radius_km) || 10,
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsLocationModalOpen(false);
        setSaveSuccess(false);
      }, 700);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to save location."
      );
    } finally {
      setSaving(false);
    }
  };

  const openAboutModal = () => {
    setBioInput(profile?.bio ?? "");
    setEditError("");
    setSaveSuccess(false);
    setIsAboutModalOpen(true);
  };

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError("");
      const updated = await updateWorkerProfile({
        bio: bioInput.trim(),
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsAboutModalOpen(false);
        setSaveSuccess(false);
      }, 700);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to save bio."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServicePrice = async (serviceId: number) => {
    try {
      setSaving(true);
      const rawPrice = servicePriceDrafts[serviceId] ?? "";
      const price = rawPrice === "" ? null : Number(rawPrice);
      if (price !== null && (!Number.isFinite(price) || price <= 0)) {
        throw new Error("Enter a valid price in rupees.");
      }
      await updateWorkerService(serviceId, {
        custom_price: price,
        is_active: true,
      });
      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not update service price."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      setSaving(true);
      await deleteWorkerSkill(skillId);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete skill."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    try {
      setSaving(true);
      const created = await createWorkerSkill({
        skill_name: newSkillInput.trim(),
        category: "General",
      });
      setSkills((prev) => [created, ...prev]);
      setNewSkillInput("");
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Could not add skill."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifPref = (key: keyof WorkerNotifPrefs) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("shramigo_worker_notif_prefs", JSON.stringify(next));
      return next;
    });
  };

  const updateAppSetting = <K extends keyof WorkerAppSettings>(
    key: K,
    value: WorkerAppSettings[K]
  ) => {
    if (key === "language") {
      setLanguage(value as Language);
    }
    setAppSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("shramigo_worker_app_settings", JSON.stringify(next));
      return next;
    });
  };

  const workerName = user?.full_name || "Worker";

  const skillText =
    skills.length > 0
      ? skills.map((skill) => skill.skill_name).join(", ")
      : "No skills added yet";

  const serviceArea =
    profile?.city || profile?.address
      ? `${[profile.city, profile.state].filter(Boolean).join(", ")}${
          profile.service_radius_km ? ` (${profile.service_radius_km} km radius)` : ""
        }`
      : "Service area not set";

  const experience =
    profile?.experience_years !== undefined && profile.experience_years > 0
      ? `${profile.experience_years} years`
      : "Not specified";

  const hourlyRate =
    services.length > 0
      ? services[0].custom_price !== null
        ? `₹${services[0].custom_price} / hr`
        : `From ₹${services[0].base_price} / hr`
      : "Not set";

  return (
    <div className="min-h-screen bg-[#F7F8F8] dark:bg-[#090E17] flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-[#F7F8F8] dark:bg-[#090E17] pb-28">
        {/* Header */}
        <div className="bg-[#087F7A] px-5 pt-7 pb-8 rounded-b-[32px] text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/worker")}
                aria-label="Back to dashboard"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <ArrowLeft size={19} />
              </button>

              <h1 className="text-xl font-bold">{t("My Profile")}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-white/15 p-1 rounded-xl">
                {(["en", "hi", "gu"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLanguage(code);
                      updateAppSetting("language", code);
                    }}
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
            </div>
          </div>

          {/* Profile Card */}
          <div className="mt-7 flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center overflow-hidden shadow-md">
                {profile?.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound size={38} className="text-[#087F7A]" />
                )}
              </div>

              <button
                type="button"
                onClick={openEditModal}
                aria-label="Edit profile photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FF5A00] border-2 border-[#087F7A] flex items-center justify-center hover:scale-105 transition"
              >
                <Edit3 size={12} className="text-white" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {loading ? "Loading..." : workerName}
                </h2>

                {user?.is_verified && (
                  <ShieldCheck size={17} className="text-white" />
                )}
              </div>

              <p className="text-sm text-white/70 mt-1">
                {skills.length > 0
                  ? `Professional ${skills[0].skill_name}`
                  : "Professional Worker"}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star size={13} fill="currentColor" />
                  <span className="text-xs font-semibold">4.9</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/70">120 reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-5 pt-5 pb-10 space-y-5">
          {/* Edit Profile Quick Button */}
          <button
            type="button"
            onClick={openEditModal}
            className="w-full h-11 rounded-xl bg-white dark:bg-[#111928] border border-[#FF5A00] text-[#FF5A00] text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-50/50 transition shadow-sm"
          >
            <Edit3 size={15} />
            {t("Edit Profile")}
          </button>

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Verification Badge */}
          <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                <ShieldCheck size={20} className="text-green-600" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-[#F8FAFC]">
                  {user?.is_verified ? t("Verified Worker") : t("Worker Verification")}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-[#8192A8] mt-0.5">
                  {user?.is_verified
                    ? t("Your profile has been verified by ShramiGo")
                    : t("Your profile is awaiting verification")}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  user?.is_verified
                    ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                    : "bg-orange-50 text-orange-500 dark:bg-orange-950/50 dark:text-orange-400"
                }`}
              >
                {user?.is_verified ? t("Verified") : t("Pending")}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate("/worker/job-requests")}
              className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-3 text-center hover:border-orange-200 transition shadow-sm"
            >
              <BriefcaseBusiness size={17} className="text-[#FF5A00] mx-auto" />
              <p className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC] mt-2">120</p>
              <p className="text-[9px] text-gray-400 dark:text-[#8192A8]">{t("Jobs done")}</p>
            </button>

            <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-3 text-center shadow-sm">
              <Star
                size={17}
                className="text-yellow-500 mx-auto"
                fill="currentColor"
              />
              <p className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC] mt-2">4.9</p>
              <p className="text-[9px] text-gray-400 dark:text-[#8192A8]">{t("Rating")}</p>
            </div>

            <button
              type="button"
              onClick={() => setIsPricingModalOpen(true)}
              className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-3 text-center hover:border-teal-200 transition shadow-sm"
            >
              <IndianRupee size={17} className="text-green-600 mx-auto" />
              <p className="text-lg font-bold text-gray-900 dark:text-[#F8FAFC] mt-2">
                {services.length}
              </p>
              <p className="text-[9px] text-gray-400 dark:text-[#8192A8]">{t("Services")}</p>
            </button>
          </div>

          {/* =========================================================
              ABOUT ME / BIO SECTION (Fixes user prompt)
             ========================================================= */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-[#F8FAFC]">{t("About Me")}</h2>
              <button
                type="button"
                onClick={openAboutModal}
                className="text-xs font-semibold text-[#087F7A] dark:text-[#00E5FF] flex items-center gap-1 hover:underline"
              >
                <Edit3 size={13} />
                {profile?.bio ? t("Edit") : t("Add Bio")}
              </button>
            </div>

            <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] p-4 shadow-sm">
              {profile?.bio ? (
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-gray-400 dark:text-[#8192A8]">
                    {t("No bio added yet. Tell customers about your background and experience.")}
                  </p>
                  <button
                    type="button"
                    onClick={openAboutModal}
                    className="mt-2.5 text-xs font-semibold text-[#087F7A] dark:text-[#00E5FF] bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1.5 rounded-xl hover:bg-teal-100 transition"
                  >
                    {t("+ Add Bio")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================
              PROFESSIONAL INFORMATION SECTION (Interactive rows)
             ========================================================= */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-[#F8FAFC] mb-2.5">
              {t("Professional information")}
            </h2>

            <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] overflow-hidden shadow-sm">
              {/* Skills */}
              <InteractiveRow
                icon={<BriefcaseBusiness size={17} />}
                title={t("Skills")}
                value={loading ? "Loading..." : skillText}
                iconClass="text-[#FF5A00] bg-orange-50 dark:bg-orange-950/40"
                onClick={() => setIsSkillsModalOpen(true)}
              />

              {/* Service Area */}
              <InteractiveRow
                icon={<MapPin size={17} />}
                title={t("Service area & radius")}
                value={loading ? "Loading..." : serviceArea}
                iconClass="text-[#087F7A] bg-teal-50 dark:bg-teal-950/40"
                onClick={openLocationModal}
              />

              {/* Services Offered */}
              <InteractiveRow
                icon={<Wallet size={17} />}
                title={t("Services offered")}
                value={
                  loading
                    ? "Loading..."
                    : services.length > 0
                    ? `${services.length} ${t("active services")}`
                    : t("No services added")
                }
                iconClass="text-green-600 bg-green-50 dark:bg-green-950/40"
                onClick={() => setIsPricingModalOpen(true)}
              />

              {/* Pricing */}
              <InteractiveRow
                icon={<IndianRupee size={17} />}
                title={t("Pricing & hourly charges")}
                value={loading ? "Loading..." : hourlyRate}
                iconClass="text-blue-600 bg-blue-50 dark:bg-blue-950/40"
                onClick={() => setIsPricingModalOpen(true)}
              />

              {/* Experience */}
              <InteractiveRow
                icon={<FileText size={17} />}
                title={t("Experience")}
                value={loading ? "Loading..." : experience}
                iconClass="text-purple-600 bg-purple-50 dark:bg-purple-950/40"
                onClick={openEditModal}
              />

              {/* Working Hours / Availability */}
              <InteractiveRow
                icon={<Clock size={17} />}
                title={t("Working hours & availability")}
                value={t("Manage working days and shifts")}
                iconClass="text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                last
                onClick={() => navigate("/worker/availability")}
              />
            </div>
          </div>

          {/* =========================================================
              MY SERVICES SECTION
             ========================================================= */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-[#F8FAFC]">{t("My Services")}</h2>

              <button
                type="button"
                onClick={() => navigate("/worker/skills")}
                className="text-xs font-semibold text-[#087F7A] dark:text-[#00E5FF] hover:underline"
              >
                {t("Manage skills →")}
              </button>
            </div>

            <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] overflow-hidden shadow-sm">
              {loading ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-gray-400 dark:text-[#8192A8]">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <BriefcaseBusiness size={24} className="mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                    {t("No services added")}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-[#8192A8] mt-1">
                    {t("Select your skills to add services and set custom charges.")}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/worker/skills")}
                    className="mt-3 text-xs font-semibold text-[#087F7A] dark:text-[#00E5FF] bg-teal-50 dark:bg-teal-950/40 px-4 py-2 rounded-xl hover:bg-teal-100 transition"
                  >
                    {t("Manage skills & services →")}
                  </button>
                </div>
              ) : (
                services.map((service, index) => (
                  <div
                    key={service.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      index !== services.length - 1
                        ? "border-b border-gray-100 dark:border-[#1E2A3B]"
                        : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#087F7A] dark:text-[#00E5FF] flex items-center justify-center">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {service.name}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-[#8192A8] mt-0.5">
                        {service.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        ₹{service.custom_price ?? service.base_price}/{t("hr")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsPricingModalOpen(true)}
                        className="text-[10px] text-[#087F7A] dark:text-[#00E5FF] font-medium hover:underline"
                      >
                        {t("Edit rate")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* =========================================================
              ACCOUNT & SETTINGS SECTION (Fully interactive)
             ========================================================= */}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-[#F8FAFC] mb-2.5">
              {t("Account & settings")}
            </h2>

            <div className="bg-white dark:bg-[#111928] rounded-2xl border border-gray-100 dark:border-[#1E2A3B] overflow-hidden shadow-sm">
              {/* Personal Information */}
              <SettingsRow
                icon={<UserRound size={17} />}
                title={t("Personal information")}
                subtitle={t("Name, phone and email")}
                onClick={openEditModal}
              />

              {/* Notifications */}
              <SettingsRow
                icon={<Bell size={17} />}
                title={t("Notifications")}
                subtitle={t("Manage notification preferences")}
                onClick={() => setIsNotificationsModalOpen(true)}
              />

              {/* App Settings */}
              <SettingsRow
                icon={<Settings size={17} />}
                title={t("App Settings")}
                subtitle={`${t("Language and preferences")} • ${language === "en" ? "English" : language === "hi" ? "हिंदी" : "ગુજરાતી"}`}
                onClick={() => setIsAppSettingsModalOpen(true)}
              />

              {/* Direct In-line Language Setting */}
              <ProfileLanguageSetting />

              {/* Help & Support */}
              <SettingsRow
                icon={<CircleHelp size={17} />}
                title={t("Help & support")}
                subtitle={t("Get help with ShramiGo")}
                onClick={() => setIsHelpModalOpen(true)}
                last
              />
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("shramigo_token");
              localStorage.removeItem("shramigo_user");
              navigate("/role-selection");
            }}
            className="w-full h-12 rounded-2xl bg-white dark:bg-[#111928] border border-red-100 dark:border-red-900/40 text-red-500 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-50/50 transition shadow-sm"
          >
            <LogOut size={17} />
            {t("Logout")}
          </button>

          <p className="text-center text-[10px] text-gray-400 dark:text-[#8192A8] pt-2">
            ShramiGo Worker • Version 1.0.4
          </p>
        </div>

        {/* Sticky Worker Navigation */}
        <WorkerBottomNav activeTab="profile" />

        {/* =========================================================
            MODAL 1: EDIT GENERAL PROFILE
           ========================================================= */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Edit Worker Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFA] p-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-[#087F7A] flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {editForm.profile_image ? (
                      <img
                        src={editForm.profile_image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      workerName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Profile photo
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      JPG, PNG or WEBP · compressed automatically
                    </p>
                    <label className="inline-flex mt-2 cursor-pointer rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50">
                      Choose photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const image = await compressProfileImage(file);
                            setEditForm((current) => ({
                              ...current,
                              profile_image: image,
                            }));
                            setEditError("");
                          } catch (err) {
                            setEditError(
                              err instanceof Error
                                ? err.message
                                : "Could not process image."
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((c) => ({ ...c, full_name: e.target.value }))
                    }
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((c) => ({ ...c, phone: e.target.value }))
                    }
                    required
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Email (Account ID)
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm((c) => ({ ...c, city: e.target.value }))
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={editForm.pincode}
                      onChange={(e) =>
                        setEditForm((c) => ({ ...c, pincode: e.target.value }))
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editForm.experience_years}
                    onChange={(e) =>
                      setEditForm((c) => ({
                        ...c,
                        experience_years: Number(e.target.value),
                      }))
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    About / Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((c) => ({ ...c, bio: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#FF5A00] resize-none"
                    placeholder="Tell customers about your skills and experience"
                  />
                </div>

                {editError && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] text-red-600">
                    {editError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-[11px] text-green-600">
                    Profile updated successfully!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-1/2 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 h-11 rounded-xl bg-[#FF5A00] text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#e04f00]"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 2: SERVICE AREA & LOCATION
           ========================================================= */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#087F7A]" />
                  <h3 className="text-base font-bold text-gray-900">
                    Service Area & Radius
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLocation} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={locationForm.address}
                    onChange={(e) =>
                      setLocationForm((c) => ({ ...c, address: e.target.value }))
                    }
                    placeholder="e.g. Navrangpura, Near Stadium"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={locationForm.city}
                      onChange={(e) =>
                        setLocationForm((c) => ({ ...c, city: e.target.value }))
                      }
                      placeholder="e.g. Ahmedabad"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={locationForm.state}
                      onChange={(e) =>
                        setLocationForm((c) => ({ ...c, state: e.target.value }))
                      }
                      placeholder="e.g. Gujarat"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={locationForm.pincode}
                      onChange={(e) =>
                        setLocationForm((c) => ({ ...c, pincode: e.target.value }))
                      }
                      placeholder="380001"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                      Service Radius (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={locationForm.service_radius_km}
                      onChange={(e) =>
                        setLocationForm((c) => ({
                          ...c,
                          service_radius_km: Number(e.target.value),
                        }))
                      }
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-400">
                  Customers within {locationForm.service_radius_km || 10} km of your location can discover and book your services.
                </p>

                {editError && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] text-red-600">
                    {editError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-[11px] text-green-600">
                    Location saved successfully!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-1/2 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 h-11 rounded-xl bg-[#087F7A] text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-[#066864]"
                  >
                    {saving ? "Saving..." : "Save Area"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 3: ABOUT ME / BIO
           ========================================================= */}
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  About Me / Bio
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveBio} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Describe your skills & work experience
                  </label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#087F7A] resize-none"
                    placeholder="e.g. Over 5 years of experience in AC and home appliance repairs. Specializing in rapid diagnostics, polite customer service, and genuine spare parts."
                  />
                </div>

                {editError && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] text-red-600">
                    {editError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-[11px] text-green-600">
                    Bio saved successfully!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAboutModalOpen(false)}
                    className="w-1/2 h-11 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 h-11 rounded-xl bg-[#087F7A] text-xs font-bold text-white flex items-center justify-center gap-2 hover:bg-[#066864]"
                  >
                    {saving ? "Saving..." : "Save Bio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 4: SERVICES & PRICING
           ========================================================= */}
        {isPricingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[420px] max-h-[85vh] flex flex-col rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Services & Pricing
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Worker-controlled hourly charges
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {services.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500">
                      No services currently active.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPricingModalOpen(false);
                        navigate("/worker/skills");
                      }}
                      className="mt-3 text-xs font-semibold text-[#087F7A] bg-teal-50 px-4 py-2 rounded-xl"
                    >
                      Add Services via Skills →
                    </button>
                  </div>
                ) : (
                  services.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Base: ₹{s.base_price}/hr
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <IndianRupee
                            size={14}
                            className="absolute left-3 top-3 text-gray-400"
                          />
                          <input
                            type="number"
                            min="1"
                            value={servicePriceDrafts[s.id] ?? ""}
                            onChange={(e) =>
                              setServicePriceDrafts((d) => ({
                                ...d,
                                [s.id]: e.target.value,
                              }))
                            }
                            placeholder={`Base ₹${s.base_price}`}
                            className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-900 outline-none focus:border-[#087F7A]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveServicePrice(s.id)}
                          disabled={saving}
                          className="h-9 px-3 rounded-lg bg-[#087F7A] text-white text-[11px] font-semibold hover:bg-[#066864] disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPricingModalOpen(false);
                    navigate("/worker/skills");
                  }}
                  className="w-full h-11 rounded-xl bg-orange-50 border border-[#FF5A00] text-[#FF5A00] text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus size={15} /> Add / Remove Services
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 5: SKILLS MANAGEMENT
           ========================================================= */}
        {isSkillsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] max-h-[85vh] flex flex-col rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                  Manage Skills
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSkillsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Add custom skill input */}
              <form onSubmit={handleAddSkill} className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Masonry, Inverter Repair"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#087F7A]"
                />
                <button
                  type="submit"
                  disabled={saving || !newSkillInput.trim()}
                  className="h-10 px-3.5 rounded-xl bg-[#087F7A] text-white text-xs font-bold disabled:opacity-50"
                >
                  Add
                </button>
              </form>

              {/* Skills list */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No skills added yet.
                  </p>
                ) : (
                  skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {skill.skill_name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {skill.category || "General"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.id)}
                        disabled={saving}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsSkillsModalOpen(false);
                    navigate("/worker/skills");
                  }}
                  className="w-full h-11 rounded-xl bg-[#FF5A00] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  Configure All Skills & Services →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 6: NOTIFICATIONS PREFERENCES
           ========================================================= */}
        {isNotificationsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-[#087F7A]" />
                  <h3 className="text-base font-bold text-gray-900">
                    Notifications
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotificationsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  {
                    key: "newJobs" as const,
                    title: "New Job Requests",
                    desc: "Instant alerts when customers book your service",
                  },
                  {
                    key: "bookingUpdates" as const,
                    title: "Booking Status Updates",
                    desc: "Notifications for schedule changes or cancellations",
                  },
                  {
                    key: "paymentAlerts" as const,
                    title: "Payment & Cash Reminders",
                    desc: "Updates on payout releases and cash collections",
                  },
                  {
                    key: "welfareNews" as const,
                    title: "Cooperative Welfare & News",
                    desc: "Platform bonuses, welfare funds, and policy updates",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="pr-3">
                      <p className="text-xs font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNotifPref(item.key)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                        notifPrefs[item.key] ? "bg-[#087F7A]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          notifPrefs[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsModalOpen(false);
                    navigate("/worker/notifications");
                  }}
                  className="w-full mt-2 h-11 rounded-xl bg-teal-50 text-[#087F7A] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-teal-100 transition"
                >
                  View Notification Inbox →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 7: APP SETTINGS
           ========================================================= */}
        {isAppSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-[#087F7A]" />
                  <h3 className="text-base font-bold text-gray-900">
                    App Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAppSettingsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                {/* Language selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-[#E2E8F0] mb-1.5 flex items-center gap-1.5">
                    <Globe size={14} className="text-[#087F7A] dark:text-[#00E5FF]" />
                    Language / भाषा / ભાષા
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: "en", label: "English", native: "English" },
                      { code: "hi", label: "Hindi", native: "हिंदी" },
                      { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
                    ].map((lang) => {
                      const isSelected = language === lang.code || appSettings.language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => updateAppSetting("language", lang.code)}
                          className={`h-11 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? "border-[#087F7A] bg-[#087F7A] text-white shadow-sm shadow-teal-500/30 scale-[1.02]"
                              : "border-gray-200 dark:border-[#24324A] bg-white dark:bg-[#111928] text-gray-700 dark:text-[#E2E8F0] hover:bg-gray-50 dark:hover:bg-[#172235]"
                          }`}
                        >
                          <span className="font-bold">{lang.native}</span>
                          <span
                            className={`text-[9px] ${
                              isSelected ? "text-teal-100" : "text-gray-400 dark:text-[#8192A8]"
                            }`}
                          >
                            {lang.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dark Mode Theme */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <Moon size={16} className="text-cyan-500" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Dark Mode Theme
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Cyber dark with neon accents
                      </p>
                    </div>
                  </div>
                  <InlineThemeToggle />
                </div>

                {/* Sound alerts */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <Volume2 size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Order Sound Alerts
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Play chime on incoming booking
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateAppSetting("soundAlerts", !appSettings.soundAlerts)
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                      appSettings.soundAlerts ? "bg-[#087F7A]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        appSettings.soundAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Instant job acceptance */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Nearby Direct Bookings
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Allow customers in your radius to book directly
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateAppSetting(
                        "instantBooking",
                        !appSettings.instantBooking
                      )
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                      appSettings.instantBooking ? "bg-[#087F7A]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        appSettings.instantBooking
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-gray-400">
                    ShramiGo Cooperative Worker Platform
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    App Build: 2026.09.07-rc1
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAppSettingsModalOpen(false)}
                  className="w-full h-11 rounded-xl bg-[#087F7A] text-white text-xs font-bold hover:bg-[#066864]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 8: HELP & SUPPORT
           ========================================================= */}
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CircleHelp size={18} className="text-[#087F7A]" />
                  <h3 className="text-base font-bold text-gray-900">
                    Worker Help & Support
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <p className="text-xs font-bold text-[#087F7A]">
                    24/7 ShramiGo Worker Helpline
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Direct assistance for ongoing jobs, customer disputes, or payment queries.
                  </p>
                  <a
                    href="tel:18001234567"
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-[#087F7A] text-white text-xs font-bold shadow-sm"
                  >
                    <Phone size={13} />
                    Call 1800-123-4567
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <p className="text-xs font-bold text-gray-800">
                    Email Support
                  </p>
                  <p className="text-[11px] text-gray-500">
                    worker-support@shramigo.in
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                  <p className="text-xs font-bold text-gray-800">
                    Cooperative Benefits & Welfare
                  </p>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Accident insurance cover up to ₹2 Lakhs, transparent fair pricing, and 0% commission deductions on your hard-earned labor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsHelpModalOpen(false);
                    navigate("/worker/welfare");
                  }}
                  className="w-full h-11 rounded-xl bg-orange-50 border border-[#FF5A00] text-[#FF5A00] text-xs font-bold flex items-center justify-center hover:bg-orange-100/50 transition"
                >
                  View Cooperative Welfare Portal →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// HELPER SUBCOMPONENTS
// =========================================================

function InteractiveRow({
  icon,
  title,
  value,
  iconClass,
  onClick,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconClass: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/70 dark:hover:bg-white/5 transition ${
        !last ? "border-b border-gray-100 dark:border-[#1E2A3B]" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass} shrink-0`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 dark:text-[#8192A8] font-medium">{title}</p>
        <p className="text-sm font-semibold text-gray-800 dark:text-[#F8FAFC] mt-0.5 truncate">
          {value}
        </p>
      </div>

      <ChevronRight size={17} className="text-gray-400 dark:text-[#8192A8] shrink-0" />
    </button>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onClick,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/70 dark:hover:bg-white/5 transition ${
        !last ? "border-b border-gray-100 dark:border-[#1E2A3B]" : ""
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#172235] text-gray-600 dark:text-[#00E5FF] flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-[#F8FAFC]">{title}</p>
        <p className="text-[10px] text-gray-400 dark:text-[#8192A8] mt-0.5 truncate">{subtitle}</p>
      </div>

      <ChevronRight size={17} className="text-gray-400 dark:text-[#8192A8] shrink-0" />
    </button>
  );
}