import { Globe, Check } from "lucide-react";
import { useLanguage, type Language } from "../../context/LanguageContext";

export function InlineLanguagePills({ className = "" }: { className?: string }) {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {supportedLanguages.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`h-9 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              isSelected
                ? "bg-[#087F7A] text-white shadow-sm shadow-teal-500/30 scale-[1.02]"
                : "bg-gray-50 dark:bg-[#172235] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#24324A] hover:bg-gray-100 dark:hover:bg-[#1D2B42]"
            }`}
          >
            <span>{lang.nativeLabel}</span>
            {isSelected && <Check size={12} strokeWidth={3} className="ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}

export function ProfileLanguageSetting() {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  return (
    <div className="border-t border-gray-100 dark:border-[#24324A] px-4 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F7F5] dark:bg-[#087F7A]/20 text-[#087F7A] dark:text-[#00E5FF]">
          <Globe size={19} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-[#F8FAFC]">
            {t("Language / भाषा / ભાષા")}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#94A3B8]">
            {t("Choose your preferred language")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {supportedLanguages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`h-10 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                isSelected
                  ? "border-[#087F7A] bg-[#087F7A] text-white shadow-sm shadow-[#087F7A]/30 scale-[1.02]"
                  : "border-gray-200 dark:border-[#24324A] bg-white dark:bg-[#111928] text-gray-700 dark:text-[#E2E8F0] hover:bg-gray-50 dark:hover:bg-[#172235]"
              }`}
            >
              <span className="font-bold">{lang.nativeLabel}</span>
              <span className={`text-[9px] ${isSelected ? "text-teal-100" : "text-gray-400 dark:text-[#8192A8]"}`}>
                {lang.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
