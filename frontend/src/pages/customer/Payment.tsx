import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  LockKeyhole,
  Smartphone,
  Wallet,
} from "lucide-react";

import {
  createPaymentOrder,
  getBooking,
  updateBookingPaymentMethod,
  verifyPayment,
} from "../../services/bookings";
import type { Booking } from "../../services/bookings";
import { getWorker } from "../../services/worker";
import type { WorkerDetails } from "../../services/worker";

export default function Payment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // BookService.tsx passes these via navigate state
  const state = location.state as {
    booking?: Booking;
    worker?: WorkerDetails;
    selectedDate?: string;
    selectedTime?: string;
    hours?: number;
    address?: string;
    subtotal?: number;
    serviceCharge?: number;
    total?: number;
  } | null;

  const [booking, setBooking] = useState<Booking | null>(state?.booking ?? null);
  const [worker, setWorker] = useState<WorkerDetails | null>(state?.worker ?? null);
  const [loadingBooking, setLoadingBooking] = useState(!state?.booking && !!id);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Load booking and worker if not in navigation state (e.g. on direct page reload)
  useEffect(() => {
    async function loadBookingDetails() {
      if (booking || !id) return;

      try {
        setLoadingBooking(true);
        setError("");
        const fetchedBooking = await getBooking(Number(id));
        setBooking(fetchedBooking);

        if (fetchedBooking.worker_id) {
          const fetchedWorker = await getWorker(fetchedBooking.worker_id);
          setWorker(fetchedWorker);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking details for payment."
        );
      } finally {
        setLoadingBooking(false);
      }
    }

    loadBookingDetails();
  }, [id, booking]);

  // Load Razorpay checkout script
  useEffect(() => {
    if (document.querySelector("script[data-razorpay-checkout]")) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  // Derive display values from real booking and worker data
  const workerName = worker?.name ?? "Service Provider";
  const workerImage =
    worker?.profile?.profile_image ??
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80";

  const matchedService =
    worker?.services?.find((s) => s.service_id === booking?.service_id) ??
    worker?.services?.[0];
  const serviceName = matchedService?.name ?? "Professional Service";

  const hours = state?.hours ?? booking?.hours ?? 1;
  const subtotal = state?.subtotal ?? booking?.subtotal ?? 0;
  const serviceCharge = state?.serviceCharge ?? booking?.service_charge ?? 30;
  const total = state?.total ?? booking?.total_amount ?? subtotal + serviceCharge;

  const selectedDate = state?.selectedDate ?? (booking ? String(booking.booking_date) : "—");
  const selectedTime = state?.selectedTime ?? (booking ? String(booking.booking_time) : "—");
  const bookingAddress = state?.address ?? booking?.service_address ?? "";

  // The real booking ID from the DB
  const bookingId = booking?.id ?? Number(id);

  const handlePayment = async () => {
    if (!bookingId) {
      setError("Booking ID is missing. Please go back and try again.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      let updatedBooking = booking;

      if (paymentMethod === "cash") {
        // Update booking payment method to cash (status will be cash_pending)
        updatedBooking = await updateBookingPaymentMethod(bookingId, "cash");
      } else {
        await updateBookingPaymentMethod(bookingId, "razorpay");
        const order = await createPaymentOrder(bookingId);
        if (!window.Razorpay) {
          throw new Error("Online payment checkout is unavailable. Please choose cash or try again later.");
        }
        await new Promise<void>((resolve, reject) => {
          const checkout = new window.Razorpay!({
            key: order.key_id,
            amount: Math.round(Number(order.amount) * 100),
            currency: order.currency,
            name: "ShramiGo",
            description: `Booking #${bookingId}`,
            order_id: order.order_id,
            handler: async (response) => {
              try {
                await verifyPayment(bookingId, response);
                resolve();
              } catch (verificationError) {
                reject(verificationError);
              }
            },
            modal: { ondismiss: () => reject(new Error("Payment checkout was cancelled.")) },
          });
          checkout.open();
        });
        updatedBooking = await getBooking(bookingId);
      }

      // Navigate to confirmation with real data
      navigate("/customer/booking-confirmation", {
        state: {
          booking: updatedBooking,
          worker,
          selectedDate,
          selectedTime,
          hours,
          address: bookingAddress,
          subtotal: updatedBooking?.subtotal ?? subtotal,
          serviceCharge: updatedBooking?.service_charge ?? serviceCharge,
          total: updatedBooking?.total_amount ?? total,
          paymentMethod,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment processing failed. Please try again."
      );
    } finally {
      setPaying(false);
    }
  };

  if (loadingBooking) {
    return (
      <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
        <main className="w-full max-w-[430px] min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#087F7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Loading booking details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex justify-center">
      <main className="w-full max-w-[430px] min-h-screen bg-white relative pb-36 shadow-sm">

        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="h-full px-5 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="text-[17px] font-bold text-gray-900">
              Payment
            </h1>

            <div className="w-10" />
          </div>
        </header>

        <div className="px-5 pt-5">

          {/* Booking Summary */}
          <section>
            <h2 className="text-[17px] font-bold text-gray-900">
              Booking Summary
            </h2>

            <div className="mt-3 rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={workerImage}
                  alt={workerName}
                  className="w-14 h-14 rounded-xl object-cover"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {workerName}
                  </p>

                  <p className="text-xs text-[#087F7A] font-semibold mt-1">
                    {serviceName}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {selectedDate} · {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="mt-7">
            <h2 className="text-[17px] font-bold text-gray-900">
              Choose Payment Method
            </h2>

            <div className="mt-3 space-y-3">
              {/* Cash on Completion */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition ${
                  paymentMethod === "cash"
                    ? "border-[#087F7A] bg-[#EAF7F5] ring-1 ring-[#087F7A]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <Banknote size={20} className="text-[#087F7A]" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      Cash on Service Completion
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#087F7A]/10 text-[#087F7A]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay with cash after service is delivered
                  </p>
                </div>

                <Radio selected={paymentMethod === "cash"} />
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition ${
                  paymentMethod === "upi"
                    ? "border-[#087F7A] bg-[#EAF7F5] ring-1 ring-[#087F7A]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <Smartphone size={20} className="text-[#087F7A]" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">UPI</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Google Pay, PhonePe, Paytm & more
                  </p>
                </div>

                <Radio selected={paymentMethod === "upi"} />
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition ${
                  paymentMethod === "card"
                    ? "border-[#087F7A] bg-[#EAF7F5] ring-1 ring-[#087F7A]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <CreditCard size={20} className="text-[#087F7A]" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Credit / Debit Card
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Visa, Mastercard, RuPay
                  </p>
                </div>

                <Radio selected={paymentMethod === "card"} />
              </button>

              {/* Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition ${
                  paymentMethod === "wallet"
                    ? "border-[#087F7A] bg-[#EAF7F5] ring-1 ring-[#087F7A]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                  <Wallet size={20} className="text-[#087F7A]" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Wallet
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay using your wallet balance
                  </p>
                </div>

                <Radio selected={paymentMethod === "wallet"} />
              </button>
            </div>

            {/* Payment Mode Notice */}
            {paymentMethod === "cash" ? (
              <div className="mt-4 rounded-xl bg-[#EAF7F5] border border-[#C6EBE6] p-3.5 flex items-start gap-2.5">
                <span className="text-base shrink-0">💵</span>
                <div>
                  <p className="text-xs font-bold text-[#087F7A]">
                    Cash Payment Selected
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-4">
                    No online transaction needed. Pay ₹{total} directly to {workerName} after you are completely satisfied with the service.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-teal-50/70 border border-teal-200 p-3.5 flex items-start gap-2.5">
                <span className="text-base shrink-0">🔒</span>
                <div>
                  <p className="text-xs font-bold text-teal-800">
                    Online Payment Checkout
                  </p>
                  <p className="text-[11px] text-teal-700 mt-0.5 leading-4">
                    Secure gateway checkout will open upon confirmation. If online payment is unavailable in your environment, switch to Cash on Service Completion anytime.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Price Breakdown */}
          <section className="mt-7">
            <h2 className="text-[17px] font-bold text-gray-900">
              Price Details
            </h2>

            <div className="mt-3 rounded-2xl bg-[#F8FAFA] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Service ({hours} hr{hours > 1 ? "s" : ""})
                </span>

                <span className="font-medium text-gray-900">
                  ₹{subtotal}
                </span>
              </div>

              <div className="flex justify-between text-sm mt-3">
                <span className="text-gray-500">Service charge</span>

                <span className="font-medium text-gray-900">
                  ₹{serviceCharge}
                </span>
              </div>

              <div className="border-t border-gray-200 my-4" />

              <div className="flex justify-between">
                <span className="font-bold text-gray-900">
                  Total Amount
                </span>

                <span className="font-bold text-[#FF5A00] text-lg">
                  ₹{total}
                </span>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Security */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <LockKeyhole size={15} />

            <p className="text-xs">
              Your payment is encrypted and secure
            </p>
          </div>
        </div>

        {/* Bottom Payment Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="max-w-[430px] mx-auto px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] text-gray-500">
                  Payable Amount
                </p>

                <p className="text-xl font-bold text-gray-900">
                  ₹{total}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#087F7A]">
                <LockKeyhole size={14} />
                Secure Payment
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={paying}
              className="w-full h-12 rounded-xl bg-[#FF5A00] text-white font-bold text-sm active:scale-[0.98] transition shadow-lg shadow-orange-100 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-[#e04f00]"
            >
              {paying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "cash" ? (
                `Confirm Booking (Pay ₹${total} Cash)`
              ) : (
                `Continue to secure payment (₹${total})`
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? "border-[#087F7A]" : "border-gray-300"
      }`}
    >
      {selected && (
        <div className="w-2.5 h-2.5 rounded-full bg-[#087F7A]" />
      )}
    </div>
  );
}