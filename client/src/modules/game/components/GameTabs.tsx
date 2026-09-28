import { Globe, UserCheck } from "lucide-react";

export type GameTabKey = "explore" | "my-games";

interface GameTabsProps {
  activeTab: GameTabKey;
  onTabChange: (tab: GameTabKey) => void;
  myGamesCount?: number;
}

export default function GameTabs({
  activeTab,
  onTabChange,
  myGamesCount = 0,
}: GameTabsProps) {
  const baseClasses =
    "px-5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-2";
  const activeClasses = "bg-primary text-primary-foreground shadow-sm";
  const inactiveClasses =
    "text-muted-foreground hover:text-foreground hover:bg-muted";

  return (
    <div className="flex border-b border-border gap-2 pb-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => onTabChange("explore")}
        className={`${baseClasses} ${
          activeTab === "explore" ? activeClasses : inactiveClasses
        }`}
      >
        <Globe size={14} />
        Explore Games
      </button>

      <button
        type="button"
        onClick={() => onTabChange("my-games")}
        className={`${baseClasses} ${
          activeTab === "my-games" ? activeClasses : inactiveClasses
        }`}
      >
        <UserCheck size={14} />
        My Games
        {myGamesCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-foreground/20 text-current font-bold">
            {myGamesCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
