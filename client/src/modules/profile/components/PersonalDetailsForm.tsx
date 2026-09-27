import { User as UserIcon, Loader2, CheckCircle } from "lucide-react";

interface PersonalDetailsFormProps {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: "male" | "female" | "other" | "";
  age: number | "";
  address: string;
  city: string;
  state: string;
  saving: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onGenderChange: (value: "male" | "female" | "other" | "") => void;
  onAgeChange: (value: number | "") => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PersonalDetailsForm({
  email,
  firstName,
  lastName,
  phoneNumber,
  gender,
  age,
  address,
  city,
  state,
  saving,
  onFirstNameChange,
  onLastNameChange,
  onPhoneNumberChange,
  onGenderChange,
  onAgeChange,
  onAddressChange,
  onCityChange,
  onStateChange,
  onSubmit,
}: PersonalDetailsFormProps) {
  const inputClasses =
    "w-full px-4 py-3 rounded-2xl border border-input bg-background/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm transition";
  const labelClasses =
    "block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2";

  return (
    <div className="lg:col-span-2 bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-black/5 border border-border">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Personal Details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal information and contact details
          </p>
        </div>
        <UserIcon className="text-muted-foreground" size={20} />
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* First / Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="John"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Doe"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-2xl border border-input bg-muted/40 text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                maxLength={10}
                placeholder="+1 234 567 890"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Gender / Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Gender</label>
            <select
              value={gender}
              onChange={(e) => onGenderChange(e.target.value as any)}
              className={inputClasses}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Age</label>
            <input
              type="number"
              min={5}
              max={120}
              value={age}
              onChange={(e) => onAgeChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="25"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label className={labelClasses}>Street Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="123 Sport Street"
            className={inputClasses}
          />
        </div>

        {/* City / State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="New York"
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>State / Region</label>
            <input
              type="text"
              value={state}
              onChange={(e) => onStateChange(e.target.value)}
              placeholder="NY"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
