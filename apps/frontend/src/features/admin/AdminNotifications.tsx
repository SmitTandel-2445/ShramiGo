import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { HeaderThemeToggle } from "@/components/common/ThemeToggle";

type NotificationType =
  | "worker"
  | "booking"
  | "user"
  | "payment"
  | "alert"
  | "verification"
  | "cancelled";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

const notifications: Notification[] = [
  {
    id: 1,
    type: "worker",
    title: "New Worker Registration",
    message:
      "A new worker has registered and is waiting for profile verification.",
    time: "8 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "booking",
    title: "New Booking",
    message: "A new service booking has been created on the platform.",
    time: "20 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "verification",
    title: "Worker Verification Pending",
    message: "There are workers waiting for document and profile verification.",
    time: "45 min ago",
    unread: true,
  },
  {
    id: 4,
    type: "user",
    title: "New User Registered",
    message: "A new customer account has been successfully created.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 5,
    type: "payment",
    title: "Payment Update",
    message:
      "Platform revenue has been updated with recent completed bookings.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 6,
    type: "cancelled",
    title: "Booking Cancelled",
    message: "A customer has cancelled a previously scheduled service booking.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 7,
    type: "alert",
    title: "Platform Alert",
    message: "Review pending reports and unresolved service issues.",
    time: "2 days ago",
    unread: false,
  },
];

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "worker":
      return <UserPlus size={20} />;

    case "booking":
      return <CalendarCheck size={20} />;

    case "user":
      return <Users size={20} />;

    case "payment":
      return <Wallet size={20} />;

    case "alert":
      return <ShieldAlert size={20} />;

    case "verification":
      return <CheckCircle2 size={20} />;

    case "cancelled":
      return <XCircle size={20} />;

    default:
      return <Bell size={20} />;
  }
}

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case "worker":
      return "bg-teal-50 text-[#087F7A]";

    case "booking":
      return "bg-orange-50 text-[#FF5A00]";

    case "user":
      return "bg-blue-50 text-blue-600";

    case "payment":
      return "bg-green-50 text-green-600";

    case "alert":
      return "bg-red-50 text-red-600";

    case "verification":
      return "bg-purple-50 text-purple-600";

    case "cancelled":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-gray-50 text-gray-600";
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const [allRead, setAllRead] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => notification.unread && !allRead,
  ).length;

  const todayNotifications = notifications.filter((notification) =>
    ["8 min ago", "20 min ago", "45 min ago", "1 hour ago"].includes(
      notification.time,
    ),
  );

  const earlierNotifications = notifications.filter((notification) =>
    ["Yesterday", "2 days ago"].includes(notification.time),
  );

  return (
    <div className="min-h-screen bg-[#F3F7F6] px-4 py-6 sm:px-6 dark:bg-[#090e17]">
      <div className="mx-auto min-h-screen max-w-2xl overflow-hidden border border-gray-100 bg-white shadow-xl dark:border-[#24324a] dark:bg-[#111928] sm:min-h-[760px] sm:rounded-[28px]">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-5 pb-5 pt-6 backdrop-blur dark:border-[#24324a] dark:bg-[#111928]/95 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:bg-[#172235] dark:text-gray-200 dark:hover:bg-[#24324a]"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F7A]">
                      Inbox
                    </p>
                    <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      Notifications
                    </h1>
                  </div>

                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5A00] px-1.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Platform activity and alerts
                </p>
              </div>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#087F7A] dark:bg-[#172235] dark:text-cyan-300">
              <BellRing size={20} />
            </div>
            <HeaderThemeToggle />
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => setAllRead(true)}
              className="mt-4 rounded-lg bg-[#EAF7F5] px-3 py-2 text-xs font-semibold text-[#087F7A] transition hover:bg-[#DDF1EF]"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="px-4 py-5 sm:px-7">
          {/* Today */}
          {todayNotifications.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Today
              </h2>

              <div className="space-y-3">
                {todayNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={{
                      ...notification,
                      unread: allRead ? false : notification.unread,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Earlier */}
          {earlierNotifications.length > 0 && (
            <section className="mt-7">
              <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Earlier
              </h2>

              <div className="space-y-3">
                {earlierNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={{
                      ...notification,
                      unread: allRead ? false : notification.unread,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF7F5]">
                <Bell size={28} className="text-gray-300" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-gray-900">
                No notifications yet
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-5 text-gray-500">
                Platform activity, worker registrations, bookings and important
                alerts will appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="mt-6 rounded-xl bg-[#087F7A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066c68]"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="h-5 bg-white" />
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const navigate = useNavigate();

  const iconStyle = getNotificationStyle(notification.type);

  const handleClick = () => {
    switch (notification.type) {
      case "worker":
      case "verification":
        navigate("/admin/workers");
        break;

      case "booking":
      case "cancelled":
        navigate("/admin/bookings");
        break;

      case "user":
        navigate("/admin/users");
        break;

      case "payment":
        navigate("/admin/reports");
        break;

      case "alert":
        navigate("/admin/reports");
        break;

      default:
        break;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        notification.unread
          ? "border-[#BFE6E2] bg-[#F3FBFA] hover:border-[#087F7A]/40"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:border-[#24324a] dark:bg-[#111928] dark:hover:border-[#31415d] dark:hover:bg-[#172235]"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-bold leading-5 text-gray-900 dark:text-white">
            {notification.title}
          </h3>

          {notification.unread && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#087F7A]" />
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
          <Clock3 size={11} />
          {notification.time}
        </div>
      </div>
    </button>
  );
}
