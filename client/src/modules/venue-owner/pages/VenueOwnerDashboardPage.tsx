import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import AccessDeniedCard from "../components/AccessDeniedCard";
import DashboardTabs from "../components/DashboardTabs";
import VenueOverviewSection from "../components/VenueOverviewSection";
import VenueSlotsSection from "../components/VenueSlotsSection";
import VenueBookingRequestsSection from "../components/VenueBookingRequestsSection";
import VenueProfileForm from "../components/VenueProfileForm";
import type { TabKey } from "../components/DashboardTabs";

export default function VenueOwnerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (!user || user.role !== "venue-owner") {
    return <AccessDeniedCard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" ? <VenueOverviewSection onSwitchTab={setActiveTab} /> : null}

        {activeTab === "slots" ? <VenueSlotsSection /> : null}

        {activeTab === "bookings" ? <VenueBookingRequestsSection /> : null}

        {activeTab === "profile" ? <VenueProfileForm /> : null}
      </div>
    </div>
  );
}