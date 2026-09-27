import { useEffect, useState } from "react";
import { venueOwnerApi } from "../api/venueOwner.api";

export type TabKey = "overview" | "slots" | "bookings" | "profile";

interface DashboardTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function DashboardTabs({
  activeTab,
  onTabChange,
}: DashboardTabsProps) {
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const res = await venueOwnerApi.getMyBookingRequests();

        if (res.success) {
          const pending = (res.data || []).filter(
            (request) => request.status === "pending",
          );
          setPendingBookingsCount(pending.length);
        }
      } catch {
        setPendingBookingsCount(0);
      }
    };

    loadPendingCount();
  }, [activeTab]);

  const baseClasses =
    "px-5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer";
  const activeClasses = "bg-primary text-primary-foreground";
  const inactiveClasses =
    "text-muted-foreground hover:text-foreground hover:bg-muted";

  function tabClass(tab: TabKey): string {
    if (activeTab === tab) {
      return `${baseClasses} ${activeClasses}`;
    }
    return `${baseClasses} ${inactiveClasses}`;
  }

  return (
    <div className="flex border-b border-border gap-2 pb-1">
      <button type="button" onClick={() => onTabChange("overview")} className={tabClass("overview")}>
        Overview
      </button>

      <button type="button" onClick={() => onTabChange("slots")} className={tabClass("slots")}>
        Slots & Schedule
      </button>

      <button
        type="button"
        onClick={() => onTabChange("bookings")}
        className={`${tabClass("bookings")} relative`}
      >
        Booking Requests
        {pendingBookingsCount > 0 ? (
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-foreground text-background font-bold">
            {pendingBookingsCount}
          </span>
        ) : null}
      </button>

      <button type="button" onClick={() => onTabChange("profile")} className={tabClass("profile")}>
        Venue Profile
      </button>
    </div>
  );
}