import { SPORTS } from "../../constants/sportOptions";

export default function SportChoices({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (sports: string[]) => void;
}) {
  const toggleSport = (sport: string) => {
    if (selected.includes(sport)) {
      onChange(selected.filter((item) => item !== sport));
      return;
    }
    onChange([...selected, sport]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SPORTS.map((sport) => {
        const active = selected.includes(sport);
        return (
          <button
            key={sport}
            type="button"
            onClick={() => toggleSport(sport)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
              active
                ? "bg-[#111315] text-white border-[#111315]"
                : "bg-background border-border text-foreground hover:bg-muted"
            }`}
          >
            {sport}
          </button>
        );
      })}
    </div>
  );
}
