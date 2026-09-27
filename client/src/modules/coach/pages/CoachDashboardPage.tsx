import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import AccessDeniedCard from "../components/AccessDeniedCard";
import DashboardTabs from "../components/DashboardTabs";
import type { TabKey } from "../components/DashboardTabs";
import SlotListSection from "../components/SlotListSection";
import SessionRequestsSection from "../components/SessionRequestsSection";
import CoachProfileForm from "../components/CoachProfileForm";

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("slots");

  if (!user || user.role !== "coach") {
    return <AccessDeniedCard />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "slots" ? <SlotListSection /> : null}

        {activeTab === "requests" ? <SessionRequestsSection /> : null}

        {activeTab === "profile" ? <CoachProfileForm /> : null}
      </div>
    </div>
  );
}
