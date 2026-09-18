import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";

import {
  getWorker,
  type WorkerDetails,
} from "../../services/worker";

import {
  createBooking,
} from "../../services/bookings";

type BookingDate = {
  day: string;
  date: string;
  value: string;
};

const times = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "04:00 PM",
];

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDates(): BookingDate[] {
  const dates: BookingDate[] = [];

  for (let i = 0; i < 4; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    dates.push({
      day:
        i === 0
          ? "Today"
          : date.toLocaleDateString("en-US", {
              weekday: "short",
            }),
      date: String(date.getDate()),
      value: formatDateForApi(date),
    });
  }

  return dates;
}

function convertTimeToApi(time: string): string {
  const [timePart, period] = time.split(" ");
  let hours = Number(timePart.split(":")[0]);
  const minutes = Number(timePart.split(":")[1]);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
}

export default function BookService() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { id } = useParams();

  const [worker, setWorker] = useState<WorkerDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const dates = getDates();

  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState(() => {
    try {
      const savedUser = localStorage.getItem("shramigo_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.address || "";
      }
    } catch {
      // ignore
    }
    return "";
  });
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadWorker() {
      if (!id) {
        setError("Worker not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getWorker(Number(id));
        setWorker(data);

        // Pre-select service from route state, URL search params, or first service
        const stateServiceId = (location.state as { serviceId?: number } | null)?.serviceId;
        const queryServiceId = searchParams.get("service_id")
          ? Number(searchParams.get("service_id"))
          : null;

        const initialServiceId =
          stateServiceId ||
          queryServiceId ||
          data.services?.[0]?.service_id ||
          null;

        setSelectedServiceId(initialServiceId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load worker details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorker();
  }, [id, location.state, searchParams]);

  // If selectedServiceId is null or not found, fall back to worker's first service
  const selectedService =
    worker?.services?.find((s) => s.service_id === selectedServiceId) ??
    worker?.services?.[0] ??
    null;

  const workerPrice =
    selectedService?.price ?? (selectedService?.base_price ?? 0);

  const serviceCharge = 30;
  const subtotal = workerPrice * hours;
  const total = subtotal + serviceCharge;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Current location is not supported by this browser. Please enter your address manually.");
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
              latitude
            )}&lon=${encodeURIComponent(
              longitude
            )}&zoom=18&addressdetails=1&accept-language=en`
          );

          if (!response.ok) {
            throw new Error("Unable to find the address for your location.");
          }

          const data = await response.json();
          const addressParts = data.address ?? {};
          const line1 = [
            addressParts.house_number,
            addressParts.road,
          ].filter(Boolean).join(" ");

          const locality = [
            addressParts.neighbourhood,
            addressParts.suburb,
            addressParts.village || addressParts.town || addressParts.city,
          ].filter(Boolean).join(", ");

          const stateAndPin = [
            addressParts.state,
            addressParts.postcode,
          ].filter(Boolean).join(" - ");

          const formattedAddress = [
            line1,
            locality,
            stateAndPin,
            addressParts.country,
          ].filter(Boolean).join(", ");

          const finalAddress = formattedAddress || data.display_name;

          if (!finalAddress) {
            throw new Error("We could not determine a readable address. Please enter it manually.");
          }

          setAddress(finalAddress);
        } catch (reverseGeocodeError) {
          setError(
            reverseGeocodeError instanceof Error
              ? reverseGeocodeError.message
              : "Unable to convert your location into an address. Please enter it manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (geolocationError) => {
        let message = "Unable to access your current location. Please enter your address manually.";

        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          message = "Location permission was denied. Please allow location access in your browser and try again.";
        } else if (geolocationError.code === geolocationError.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable. Please try again or enter the address manually.";
        } else if (geolocationError.code === geolocationError.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const handleContinue = async () => {
    if (!worker) {
      return;
    }

    if (!address.trim()) {
      setError("Please enter your service address.");
      return;
    }

    const activeService =
      selectedService ?? (worker.services && worker.services[0]);

    if (!activeService) {
      setError("Select a service before continuing.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      const booking = await createBooking({
        worker_id: worker.id,
        service_id: activeService.service_id,
        booking_date: selectedDate,
        booking_time: convertTimeToApi(selectedTime),
        hours,
        service_address: address.trim(),
        description: description.trim() || undefined,
        payment_method: "cash",
      });

      navigate(`/customer/payment/${booking.id}`, {
        state: {
          booking,
          worker,
          selectedDate,
          selectedTime,
          hours,
          address: address.trim(),
          description: description.trim(),
          subtotal: booking.subtotal,
          serviceCharge: booking.service_charge,
          total: booking.total_amount,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#087F7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Loading worker details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !worker) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white">
          <header className="h-16 bg-white border-b border-gray-100">
            <div className="h-full px-5 flex items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ArrowLeft size={20} />
              </button>

              <h1 className="text-[17px] font-bold text-gray-900 ml-4">
                Book Service
              </h1>
            </div>
          </header>

          <div className="px-5 pt-10 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#087F7A] text-white text-sm font-semibold"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!worker) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white relative pb-[190px] shadow-sm">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="h-full px-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-800" />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900">
              Book Service
            </h1>

            <div className="w-10" />
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="px-5 pt-5 space-y-6">
          {/* ================= WORKER CARD ================= */}
          <section>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={
                    worker.profile.profile_image ||
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80"
                  }
                  alt={worker.name}
                  className="w-[68px] h-[68px] rounded-xl object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[16px] font-bold text-gray-900 truncate">
                      {worker.name}
                    </h2>

                    {worker.verified && (
                      <CheckCircle2
                        size={17}
                        className="text-[#087F7A] shrink-0"
                      />
                    )}
                  </div>

                  <p className="text-sm text-[#087F7A] font-medium mt-0.5">
                    {selectedService?.name ||
                      worker.skills?.[0]?.skill_name ||
                      "Professional Service"}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-gray-700">
                      ★ {worker.rating || 0}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({worker.reviews || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SELECT SERVICE (Fixes ₹0 issue) ================= */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-[#087F7A]" />
                <h3 className="text-[16px] font-bold text-gray-900">
                  Select Service
                </h3>
              </div>
              {worker.services?.length > 1 && (
                <span className="text-[11px] text-[#087F7A] font-semibold">
                  {worker.services.length} available
                </span>
              )}
            </div>

            {worker.services && worker.services.length > 0 ? (
              <div className="space-y-2">
                {worker.services.map((service) => {
                  const isSelected =
                    (selectedService?.service_id ?? selectedServiceId) ===
                    service.service_id;
                  return (
                    <button
                      key={service.service_id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.service_id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#087F7A] bg-teal-50/70 shadow-sm ring-1 ring-[#087F7A]"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-[#087F7A] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <BriefcaseBusiness size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {service.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {service.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF5A00]">
                          ₹{service.price}/hr
                        </p>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#087F7A] flex items-center gap-0.5 justify-end">
                            <CheckCircle2 size={12} /> Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-xs text-gray-600">
                  Standard service rate: ₹150/hr
                </p>
              </div>
            )}
          </section>

          {/* ================= DATE ================= */}
          <section>
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#FF5A00]" />
              <h3 className="text-[16px] font-bold text-gray-900">
                Select Date
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {dates.map((item) => {
                const isSelected = selectedDate === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedDate(item.value)}
                    className={`rounded-xl py-3 border transition active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#FF5A00] border-[#FF5A00] text-white shadow-sm"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-[11px] font-medium">{item.day}</p>
                    <p className="text-[19px] font-bold mt-0.5">{item.date}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ================= TIME ================= */}
          <section>
            <div className="flex items-center gap-2">
              <Clock3 size={19} className="text-[#FF5A00]" />
              <h3 className="text-[16px] font-bold text-gray-900">
                Select Time
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-3">
              {times.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#087F7A] border-[#087F7A] text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ================= DURATION ================= */}
          <section>
            <h3 className="text-[16px] font-bold text-gray-900">
              Service Duration
            </h3>

            <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Number of hours
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  ₹{workerPrice} per hour
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setHours((current) => Math.max(1, current - 1))}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 text-gray-700 hover:bg-gray-200 transition"
                >
                  <Minus size={15} />
                </button>

                <span className="w-6 text-center text-sm font-bold text-gray-900">
                  {hours}
                </span>

                <button
                  type="button"
                  onClick={() => setHours((current) => current + 1)}
                  className="w-9 h-9 rounded-xl bg-[#FFF1E9] text-[#FF5A00] flex items-center justify-center active:scale-95 hover:bg-[#ffe5d6] transition"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </section>

          {/* ================= ADDRESS ================= */}
          <section>
            <div className="flex items-center gap-2">
              <MapPin size={19} className="text-[#FF5A00]" />
              <h3 className="text-[16px] font-bold text-gray-900">
                Service Address
              </h3>
            </div>

            <div className="relative mt-3">
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter your complete service address (e.g. Navrangpura, Near Stadium, Ahmedabad)"
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none focus:border-[#087F7A] focus:ring-1 focus:ring-[#087F7A]"
              />
            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locationLoading}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F7A] disabled:opacity-60 disabled:cursor-not-allowed hover:underline"
            >
              <LocateFixed size={14} />
              {locationLoading ? "Getting your location..." : "Use current location"}
            </button>
          </section>

          {/* ================= REQUIREMENT ================= */}
          <section>
            <h3 className="text-[16px] font-bold text-gray-900">
              Describe Your Requirement
              <span className="ml-1 text-xs font-normal text-gray-400">
                (Optional)
              </span>
            </h3>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell the worker what you need help with..."
              rows={2}
              className="w-full mt-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none focus:border-[#087F7A] focus:ring-1 focus:ring-[#087F7A]"
            />
          </section>

          {/* ================= ERROR ================= */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* ================= TRUST BADGE ================= */}
          <section>
            <div className="rounded-xl bg-[#EAF7F5] border border-[#D5EFEB] p-3.5 flex items-start gap-3">
              <ShieldCheck
                size={21}
                className="text-[#087F7A] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Safe & Secure Booking
                </p>
                <p className="text-xs text-gray-500 leading-5 mt-0.5">
                  Your payment is protected until the service is completed to your satisfaction.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ================= BOTTOM SUMMARY & ACTION (Fixes Disabled Button) ================= */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-md">
          <div className="max-w-[430px] mx-auto px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Estimated Total
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{total}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">
                  {hours} hour{hours > 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  ₹{workerPrice}/hr + ₹{serviceCharge} service
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={
                !address.trim() ||
                bookingLoading ||
                !selectedService ||
                workerPrice <= 0
              }
              className="w-full h-12 mt-3 rounded-xl bg-[#FF5A00] text-white text-sm font-bold shadow-lg shadow-orange-100 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] transition flex items-center justify-center gap-2 hover:bg-[#e04f00]"
            >
              {bookingLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Booking...
                </>
              ) : (
                "Continue to Payment"
              )}
            </button>

            {!address.trim() && (
              <p className="text-center text-[10px] text-gray-400 mt-1.5">
                Enter your service address above to continue
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}