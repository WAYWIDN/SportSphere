export type TabKey = "slots" | "requests" | "profile";

interface DashboardTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingRequestsCount: number;
}

export default function DashboardTabs({
  activeTab,
  onTabChange,
  pendingRequestsCount,
}: DashboardTabsProps) {
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
      <button type="button" onClick={() => onTabChange("slots")} className={tabClass("slots")}>
        My Slots &amp; Schedule
      </button>

      <button
        type="button"
        onClick={() => onTabChange("requests")}
        className={`${tabClass("requests")} relative`}
      >
        Session Requests
        {pendingRequestsCount > 0 ? (
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-foreground text-background font-bold">
            {pendingRequestsCount}
          </span>
        ) : null}
      </button>

      <button type="button" onClick={() => onTabChange("profile")} className={tabClass("profile")}>
        Coach Profile
      </button>
    </div>
  );
}
