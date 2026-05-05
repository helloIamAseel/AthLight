import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppDatePicker from "@/components/AppDatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import athlightLogo from "@/assets/athlight_logo_v2.png";

/* ── Data ── */

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  city: string;
  phoneNumber: string;
  nationality: string;
  sportType: string;
  clubAcademy: string;
  email: string;
  experienceYears: string;
  licenseStatus: string;
  specialtyOne: string;
  specialtyTwo: string;
  specialtyThree: string;
  specialtyFour: string;
  specialtyFive: string;
  biography: string;
  whatsapp: string;
  twitter: string;
};

const CITIES_BY_COUNTRY_CODE: Record<string, string[]> = {
  SA: ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran", "Taif", "Abha", "Tabuk", "Hail", "Yanbu", "Najran", "Jazan"],
  AE: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  EG: ["Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Port Said", "Suez"],
  KW: ["Kuwait City", "Salmiya", "Jahra"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
  BH: ["Manama", "Riffa", "Muharraq"],
  OM: ["Muscat", "Salalah", "Sohar", "Nizwa"],
  JO: ["Amman", "Irbid", "Zarqa", "Aqaba"],
  MA: ["Rabat", "Casablanca", "Marrakesh", "Tangier"],
  DZ: ["Algiers", "Oran", "Constantine", "Annaba"],
  IQ: ["Baghdad", "Basra", "Erbil", "Mosul"],
  SY: ["Damascus", "Aleppo", "Homs"],
  LB: ["Beirut", "Tripoli", "Sidon"],
  TN: ["Tunis", "Sfax", "Sousse"],
  LY: ["Tripoli", "Benghazi", "Misrata"],
  SD: ["Khartoum", "Omdurman", "Port Sudan"],
};

const phoneValidation: Record<string, { countryCode: string; minLength: number; maxLength: number; pattern: RegExp; example: string }> = {
  SA: { countryCode: "+966", minLength: 9, maxLength: 9, pattern: /^[5][0-9]{8}$/, example: "5X XXX XXXX" },
  AE: { countryCode: "+971", minLength: 9, maxLength: 9, pattern: /^[5][0-9]{8}$/, example: "5X XXX XXXX" },
  EG: { countryCode: "+20", minLength: 10, maxLength: 10, pattern: /^1[0-9]{9}$/, example: "1X XXX XXXX" },
  KW: { countryCode: "+965", minLength: 8, maxLength: 8, pattern: /^[569][0-9]{7}$/, example: "5XXX XXXX" },
  QA: { countryCode: "+974", minLength: 8, maxLength: 8, pattern: /^[3567][0-9]{7}$/, example: "3XXX XXXX" },
  BH: { countryCode: "+973", minLength: 8, maxLength: 8, pattern: /^[3679][0-9]{7}$/, example: "3XXX XXXX" },
  OM: { countryCode: "+968", minLength: 8, maxLength: 8, pattern: /^[79][0-9]{7}$/, example: "7XXX XXXX" },
  JO: { countryCode: "+962", minLength: 9, maxLength: 9, pattern: /^7[7-9][0-9]{7}$/, example: "7X XXX XXXX" },
  MA: { countryCode: "+212", minLength: 9, maxLength: 9, pattern: /^[67][0-9]{8}$/, example: "6XX XXX XXX" },
  DZ: { countryCode: "+213", minLength: 9, maxLength: 9, pattern: /^[567][0-9]{8}$/, example: "5XX XXX XXX" },
  IQ: { countryCode: "+964", minLength: 10, maxLength: 10, pattern: /^7[0-9]{9}$/, example: "7XX XXX XXXX" },
  SY: { countryCode: "+963", minLength: 9, maxLength: 9, pattern: /^9[0-9]{8}$/, example: "9XX XXX XXX" },
  LB: { countryCode: "+961", minLength: 8, maxLength: 8, pattern: /^[37][0-9]{7}$/, example: "3XXX XXXX" },
  TN: { countryCode: "+216", minLength: 8, maxLength: 8, pattern: /^[2459][0-9]{7}$/, example: "2XXX XXXX" },
  LY: { countryCode: "+218", minLength: 9, maxLength: 9, pattern: /^9[0-9]{8}$/, example: "9XX XXX XXX" },
  SD: { countryCode: "+249", minLength: 9, maxLength: 9, pattern: /^9[0-9]{8}$/, example: "9XX XXX XXX" },
};

const countries = [
  { code: "SA", label: "Saudi Arabia" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "EG", label: "Egypt" },
  { code: "KW", label: "Kuwait" },
  { code: "QA", label: "Qatar" },
  { code: "BH", label: "Bahrain" },
  { code: "OM", label: "Oman" },
  { code: "JO", label: "Jordan" },
  { code: "IQ", label: "Iraq" },
  { code: "SY", label: "Syria" },
  { code: "LB", label: "Lebanon" },
  { code: "TN", label: "Tunisia" },
  { code: "LY", label: "Libya" },
  { code: "MA", label: "Morocco" },
  { code: "DZ", label: "Algeria" },
  { code: "SD", label: "Sudan" },
];

const nationalities = [
  "Saudi", "Emirati", "Egyptian", "Kuwaiti", "Qatari", "Bahraini",
  "Omani", "Jordanian", "Iraqi", "Syrian", "Lebanese", "Tunisian",
  "Libyan", "Moroccan", "Algerian", "Sudanese",
];

/* ── Helpers ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <div className="h-0.5 w-4 rounded-full bg-secondary" />
      <h2 className="text-xs font-bold uppercase tracking-wider text-secondary">{children}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-sm font-medium text-card-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Main Component ── */

const initialData: FormData = {
  firstName: "Saad",
  middleName: "",
  lastName: "Al-Sharif",
  dateOfBirth: "",
  gender: "Male",
  country: "SA",
  city: "Riyadh",
  phoneNumber: "5XXXXXXXX",
  nationality: "Saudi",
  sportType: "Football",
  clubAcademy: "Al Hilal Academy",
  email: "saad@email.com",
  experienceYears: "10",
  licenseStatus: "Verified",
  specialtyOne: "Finishing",
  specialtyTwo: "Youth Development",
  specialtyThree: "Decision Making",
  specialtyFour: "Positioning",
  specialtyFive: "Tactical Awareness",
  biography: "Tactical coach focused on helping athletes improve decision-making, movement off the ball, and positioning under pressure.",
  whatsapp: "Available to agents",
  twitter: "@sa_ad129",
};

export default function CoachEditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({ ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState("");

  const requiredFields: (keyof FormData)[] = [
    "firstName", "lastName", "dateOfBirth", "gender", "country", "city",
    "phoneNumber", "nationality", "sportType", "clubAcademy", "email",
    "experienceYears", "licenseStatus", "specialtyOne", "specialtyTwo",
    "specialtyThree", "specialtyFour", "specialtyFive",
  ];

  const availableCities = formData.country ? (CITIES_BY_COUNTRY_CODE[formData.country] ?? []) : [];
  const selectedPhoneRule = phoneValidation[formData.country];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && value !== prev.country) {
        next.city = "";
        next.phoneNumber = "";
      }
      return next;
    });
    setErrors((prev) => {
      const updated = { ...prev, [field]: "" };
      if (field === "country") {
        updated.phoneNumber = "";
        updated.city = "";
      }
      return updated;
    });
    setSavedMessage("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = "This field is required";
    });
    if (formData.email.trim() && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = "An email address must contain a single @.";
    }
    if (formData.country && formData.phoneNumber.trim()) {
      const rule = phoneValidation[formData.country];
      if (rule && !rule.pattern.test(formData.phoneNumber)) {
        newErrors.phoneNumber = `Invalid format (e.g. ${rule.example})`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { setSavedMessage(""); return; }
    setSavedMessage("Changes saved successfully.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData({ ...initialData });
    setSavedMessage("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background bg-brand-gradient">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/coach-profile")}
            className="shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-muted/50 text-foreground/60 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <img src={athlightLogo} alt="AthLight" className="h-8 w-8 object-contain shrink-0 logo-glow" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight text-gradient-brand">Edit Profile</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Update your coach information, overview details, specialties, and contact info.</p>
          </div>
        </div>
      </header>

      {/* ── Success Banner ── */}
      {savedMessage && (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary">
            <Save className="h-4 w-4" />
            {savedMessage}
          </div>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSave} className="mx-auto max-w-3xl px-4 py-6 pb-32 space-y-6">

        {/* Personal Information */}
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 space-y-4">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="First Name" required error={errors.firstName}>
              <Input value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="First Name" />
            </Field>
            <Field label="Middle Name">
              <Input value={formData.middleName} onChange={(e) => handleChange("middleName", e.target.value)} placeholder="Middle Name" />
            </Field>
            <Field label="Last Name" required error={errors.lastName}>
              <Input value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Last Name" />
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth}>
              <AppDatePicker
                value={formData.dateOfBirth}
                onChange={(v) => handleChange("dateOfBirth", v)}
                placeholder="Select date of birth"
                maxDate={new Date()}
                error={!!errors.dateOfBirth}
              />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Country" required error={errors.country}>
              <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="City / Location" required error={errors.city}>
              <Select value={formData.city} onValueChange={(v) => handleChange("city", v)} disabled={!formData.country}>
                <SelectTrigger><SelectValue placeholder={formData.country ? "Select City" : "Select country first"} /></SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone Number" required error={errors.phoneNumber}>
              <div className="flex gap-2">
                {formData.country && selectedPhoneRule && (
                  <span className="flex shrink-0 items-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground">
                    {selectedPhoneRule.countryCode}
                  </span>
                )}
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder={formData.country && selectedPhoneRule ? selectedPhoneRule.example : "Select country first"}
                  disabled={!formData.country}
                  maxLength={selectedPhoneRule?.maxLength}
                />
              </div>
              {formData.country && !errors.phoneNumber && selectedPhoneRule && (
                <p className="mt-1 text-xs text-muted-foreground">{selectedPhoneRule.minLength} digits required</p>
              )}
            </Field>
            <Field label="Nationality" required error={errors.nationality}>
              <Select value={formData.nationality} onValueChange={(v) => handleChange("nationality", v)}>
                <SelectTrigger><SelectValue placeholder="Select Nationality" /></SelectTrigger>
                <SelectContent>
                  {nationalities.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        {/* Account & Contact Information */}
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 space-y-4">
          <SectionTitle>Account & Contact Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Enter your email" />
            </Field>
            <Field label="WhatsApp / Availability">
              <Input value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="WhatsApp status or contact note" />
            </Field>
            <Field label="Twitter / X">
              <Input value={formData.twitter} onChange={(e) => handleChange("twitter", e.target.value)} placeholder="@username" />
            </Field>
          </div>
        </div>

        {/* Coach Overview Information */}
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 space-y-4">
          <SectionTitle>Coach Overview Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Sport Type" required error={errors.sportType}>
              <Select value={formData.sportType} onValueChange={(v) => handleChange("sportType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Football", "Swimming", "Running", "Padel"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Club / Academy" required error={errors.clubAcademy}>
              <Input value={formData.clubAcademy} onChange={(e) => handleChange("clubAcademy", e.target.value)} placeholder="Enter club or academy" />
            </Field>
            <Field label="Years of Experience" required error={errors.experienceYears}>
              <Input value={formData.experienceYears} onChange={(e) => handleChange("experienceYears", e.target.value)} placeholder="e.g. 10" />
            </Field>
            <Field label="License Status" required error={errors.licenseStatus}>
              <Input
                value={formData.licenseStatus}
                disabled
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
              />
            </Field>
            <Field label="Specialty Tag 1" required error={errors.specialtyOne}>
              <Input value={formData.specialtyOne} onChange={(e) => handleChange("specialtyOne", e.target.value)} placeholder="e.g. Tactical Coach" />
            </Field>
            <Field label="Specialty Tag 2" error={errors.specialtyTwo}>
              <Input value={formData.specialtyTwo} onChange={(e) => handleChange("specialtyTwo", e.target.value)} placeholder="e.g. Finishing" />
            </Field>
            <Field label="Specialty Tag 3" error={errors.specialtyThree}>
              <Input value={formData.specialtyThree} onChange={(e) => handleChange("specialtyThree", e.target.value)} placeholder="e.g. Youth Development" />
            </Field>
            <Field label="Specialty Tag 4" error={errors.specialtyFour}>
              <Input value={formData.specialtyFour} onChange={(e) => handleChange("specialtyFour", e.target.value)} placeholder="e.g. Decision Making" />
            </Field>
            <Field label="Specialty Tag 5" error={errors.specialtyFive}>
              <Input value={formData.specialtyFive} onChange={(e) => handleChange("specialtyFive", e.target.value)} placeholder="e.g. Positioning" />
            </Field>
          </div>
        </div>

        {/* Overview Content */}
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 space-y-4">
          <SectionTitle>Overview Content</SectionTitle>
          <Field label="Coach Bio">
            <Textarea rows={4} value={formData.biography} onChange={(e) => handleChange("biography", e.target.value)} placeholder="Write the coach bio shown in the overview" />
          </Field>
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/40 bg-card/95 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/coach-profile")} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
            <Button type="submit" size="lg" className="gap-2 px-8">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
