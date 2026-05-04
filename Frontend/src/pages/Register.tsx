import React, { useState, useCallback, type FormEvent } from "react";
import { getSportAgeRange } from "@/lib/sportAgeConfig";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import AthleteInformationStep from "@/components/AthleteInformationStep";
import ScoutInformationStep from "@/components/ScoutInformationStep";
import CreatePasswordStep from "@/components/CreatePasswordStep";
import OtpVerificationStep from "@/components/OtpVerificationStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppDatePicker from "@/components/AppDatePicker";
import { Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  country: string;
  city: string;
  phone: string;
  nationality: string;
  sportType: string;
  clubName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  position: string;
  preferredSide: string;
  heightCm: string;
  weightKg: string;
  injuryNotes: string;
}

const CITIES_BY_COUNTRY_CODE: Record<string, string[]> = {
  SA: [
    "Riyadh",
    "Jeddah",
    "Makkah",
    "Madinah",
    "Dammam",
    "Khobar",
    "Dhahran",
    "Taif",
    "Abha",
    "Tabuk",
    "Hail",
    "Yanbu",
    "Najran",
    "Jazan",
  ],
  AE: ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  EG: ["Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Port Said", "Suez"],
  KW: ["Kuwait City", "Salmiya", "Jahra"],
  QA: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
  BH: ["Manama", "Riffa", "Muharraq"],
  OM: ["Muscat", "Salalah", "Sohar", "Nizwa"],
  JO: ["Amman", "Irbid", "Zarqa", "Aqaba"],
  MA: ["Rabat", "Casablanca", "Marrakesh", "Tangier"],
  DZ: ["Algiers", "Oran", "Constantine", "Annaba"],
};

const phoneValidation: Record<
  string,
  { countryCode: string; minLength: number; maxLength: number; pattern: RegExp; example: string }
> = {
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
  { code: "MA", label: "Morocco" },
  { code: "DZ", label: "Algeria" },
];

const nationalities = [
  "Saudi",
  "Emirati",
  "Egyptian",
  "Kuwaiti",
  "Qatari",
  "Bahraini",
  "Omani",
  "Jordanian",
  "Moroccan",
  "Algerian",
];

const sportTypes = ["Football", "Running", "Padel", "Swimming"];

const STEPS = [
  { label: "General Details" },
  { label: "Role Specific" },
  { label: "OTP Verification" },
  { label: "Password" },
];

const RegistrationForm = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    country: "",
    city: "",
    phone: "",
    nationality: "",
    sportType: "",
    clubName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    position: "",
    preferredSide: "",
    heightCm: "",
    weightKg: "",
    injuryNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const availableCities = formData.country ? (CITIES_BY_COUNTRY_CODE[formData.country] ?? []) : [];

  const validateField = useCallback(
    (field: keyof FormData, data: FormData): string | undefined => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      switch (field) {
        case "firstName":
        case "lastName":
        case "gender":
        case "country":
        case "nationality":
        case "sportType":
        case "clubName":
        case "city":
          return !data[field] ? "Required" : undefined;
        case "birthDate": {
          if (!data.birthDate) return "Required";
          const birth = new Date(data.birthDate);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const md = today.getMonth() - birth.getMonth();
          if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
          if (role === "athlete") {
            const sportAgeRange = getSportAgeRange(data.sportType);
            if (age < sportAgeRange.min || age > sportAgeRange.max)
              return `Age must be between ${sportAgeRange.min} and ${sportAgeRange.max} for ${sportAgeRange.label}.`;
          } else {
            const minAge = 15;
            const maxAge = 75;
            if (age < minAge || age > maxAge) return `Age must be between ${minAge} and ${maxAge} years`;
          }
          return undefined;
        }
        case "phone": {
          if (!data.phone) return "Required";
          if (data.country && phoneValidation[data.country]) {
            const rules = phoneValidation[data.country];
            if (!rules.pattern.test(data.phone)) return `Invalid format (e.g. ${rules.example})`;
          }
          return undefined;
        }
        case "email":
          if (!data.email) return "Please enter your email address.";
          if (!data.email.includes("@")) return "An email address must contain a single @.";
          if (!emailPattern.test(data.email)) return "An email address must contain a single @.";
          return undefined;
        default:
          return undefined;
      }
    },
    [role],
  );

  const touch = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData) }));
  };

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && value !== prev.country) {
        next.city = "";
      }
      setTimeout(() => {
        setFormData((current) => {
          if (touched[field] || field === "birthDate" || field === "email" || field === "phone") {
            setErrors((prevErr) => {
              const updated = { ...prevErr, [field]: validateField(field, current) };
              if (field === "country") {
                updated.city = current.city ? undefined : touched.city ? "Required" : undefined;
              }
              // Revalidate birthDate when sport changes (age rules depend on sport)
              if (field === "sportType" && current.birthDate && touched.birthDate) {
                updated.birthDate = validateField("birthDate", current);
              }
              return updated;
            });
            setTouched((prev) => ({ ...prev, [field]: true }));
          }
          return current;
        });
      }, 0);
      return next;
    });
  };

  const validate = (): boolean => {
    const fields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "birthDate",
      "gender",
      "country",
      "nationality",
      "sportType",
      "clubName",
      "city",
      "phone",
      "email",
    ];
    const e: Partial<Record<keyof FormData, string>> = {};
    fields.forEach((f) => {
      const err = validateField(f, formData);
      if (err) e[f] = err;
    });
    const allTouched: Partial<Record<keyof FormData, boolean>> = {};
    fields.forEach((f) => {
      allTouched[f] = true;
    });
    setTouched((prev) => ({ ...prev, ...allTouched }));
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form before sending to backend
    if (!validate()) return;

    try {
      // Send general information to backend (Step 1)
      const res = await fetch("http://localhost:3000/api/auth/signup/general-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          email: formData.email,
          dateOfBirth: formData.birthDate,
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
          nationality: formData.nationality,
          phoneNumber: formData.phone,
          sport: formData.sportType,
          clubName: formData.clubName,
        }),
      });

      const data = await res.json();

      // Store draftId returned from backend
      setDraftId(data.data?.draftId || data.draftId);

      // Move to next step
      if (role === "athlete" || role === "scout") {
        setStep(2);
      } else {
        setStep(3);
      }
    } catch (error) {
      console.error("Error submitting general info:", error);
    }
  };

  const handleAthleteSubmit = async (athleteData: {
    position: string;
    preferredSide: string;
    heightCm: number;
    weightKg: number;
    injuryNotes: string;
  }) => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/signup/athlete-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: draftId,
          position: athleteData.position || undefined,
          preferredSide: athleteData.preferredSide || undefined,
          heightCm: athleteData.heightCm,
          weightKg: athleteData.weightKg,
          injuryNotes: athleteData.injuryNotes || "",
        }),
      });

      const data = await res.json();

     if (!res.ok) {
  console.error("Error:", data);

  const message = data?.error || "";

  const fieldErrors: Partial<Record<keyof FormData, string>> = {};

  if (message.includes("Height")) {
    fieldErrors.heightCm = "Height must be at least 100 cm";
  }

  if (message.includes("Weight")) {
    fieldErrors.weightKg = "Weight must be at least 30 kg";
  }

  if (message.toLowerCase().includes("position")) {
    fieldErrors.position = "Invalid football position selected";
  }

  if (message.toLowerCase().includes("preferred side")) {
    fieldErrors.preferredSide = "Preferred side is required";
  }

  setErrors((prev) => ({
    ...prev,
    ...fieldErrors,
  }));

  return;
}

      setErrors((prev) => ({
        ...prev,
        position: undefined,
        preferredSide: undefined,
        heightCm: undefined,
        weightKg: undefined,
        injuryNotes: undefined,
      }));
      setStep(3);
    } catch (error) {
      console.error("Error submitting athlete info:", error);
    }
  };

  return (
    <MainLayout backTo="/">
      <div className="mx-auto max-w-2xl">
        {/* Single header — no duplication */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Let's get you started</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Enter the details to get going</p>
        </div>

        {/* Modern Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div className="flex-1 max-w-16 mx-0.5 flex items-center">
                      <div
                        className={`h-[3px] w-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(152_52%_46%)]"
                            : step > i
                              ? "bg-gradient-to-r from-secondary/60 to-secondary/20"
                              : "bg-border/60"
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300 ${
                        isCompleted
                          ? "bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(152_52%_46%)] text-white shadow-lg shadow-secondary/25"
                          : isActive
                            ? "bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-secondary/30 ring-[3px] ring-secondary/20 ring-offset-2 ring-offset-background"
                            : "bg-muted/80 text-muted-foreground/60 border border-border/50"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4.5 w-4.5" strokeWidth={3} /> : stepNum}
                      {isActive && (
                        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-secondary" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] leading-tight text-center max-w-[72px] transition-colors duration-200 ${
                        isActive
                          ? "text-foreground font-bold"
                          : isCompleted
                            ? "text-secondary font-semibold"
                            : "text-muted-foreground/60 font-medium"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <SectionTitle>Personal Information</SectionTitle>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="First Name" required error={errors.firstName}>
                <Input
                  value={formData.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  onBlur={() => touch("firstName")}
                  placeholder="First Name"
                />
              </Field>
              <Field label="Middle Name">
                <Input
                  value={formData.middleName}
                  onChange={(e) => update("middleName", e.target.value)}
                  placeholder="Middle Name"
                />
              </Field>
              <Field label="Last Name" required error={errors.lastName}>
                <Input
                  value={formData.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  onBlur={() => touch("lastName")}
                  placeholder="Last Name"
                />
              </Field>
            </div>

            <Field label="Date of Birth" required error={errors.birthDate}>
              <AppDatePicker
                value={formData.birthDate}
                onChange={(v) => update("birthDate", v)}
                placeholder="Select date of birth"
                maxDate={new Date()}
                error={!!errors.birthDate}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Gender" required error={errors.gender}>
                <Select value={formData.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Country" required error={errors.country}>
                <Select value={formData.country} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="City" required error={errors.city}>
                <Select value={formData.city} onValueChange={(v) => update("city", v)} disabled={!formData.country}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.country ? "Select City" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Phone Number" required error={errors.phone}>
              <div className="flex gap-2">
                {formData.country && phoneValidation[formData.country] && (
                  <span className="flex shrink-0 items-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground">
                    {phoneValidation[formData.country].countryCode}
                  </span>
                )}
                <Input
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                  onBlur={() => touch("phone")}
                  placeholder={
                    formData.country && phoneValidation[formData.country]
                      ? phoneValidation[formData.country].example
                      : "Select country first"
                  }
                  disabled={!formData.country}
                  maxLength={
                    formData.country && phoneValidation[formData.country]
                      ? phoneValidation[formData.country].maxLength
                      : undefined
                  }
                />
              </div>
              {formData.country && !errors.phone && phoneValidation[formData.country] && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {phoneValidation[formData.country].minLength} digits required
                </p>
              )}
            </Field>

            <Field label="Nationality" required error={errors.nationality}>
              <Select value={formData.nationality} onValueChange={(v) => update("nationality", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Nationality" />
                </SelectTrigger>
                <SelectContent>
                  {nationalities.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Sport Type" required error={errors.sportType}>
                <Select value={formData.sportType} onValueChange={(v) => update("sportType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sport Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Club Name" required error={errors.clubName}>
                <Input
                  value={formData.clubName}
                  onChange={(e) => update("clubName", e.target.value)}
                  onBlur={() => touch("clubName")}
                  placeholder="Enter your Club Name"
                />
              </Field>
            </div>

            <SectionTitle>Account Information</SectionTitle>

            <Field label="Email" required error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => touch("email")}
                placeholder="example: someone@example.com"
              />
            </Field>

            <div className="flex items-center justify-between pt-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="px-8 py-6 text-base"
                onClick={() => navigate("/")}
              >
                Back
              </Button>
              <Button type="submit" size="lg" className="px-10 py-6 text-base font-semibold">
                Next
              </Button>
            </div>
          </form>
        )}

        {step === 2 && role === "athlete" && (
  <AthleteInformationStep
    sportType={formData.sportType}
    backendErrors={errors}
    onFieldChange={(field) =>
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
    onBack={() => setStep(1)}
    onSubmit={handleAthleteSubmit}
  />
)}

        {step === 2 && role === "scout" && (
          <ScoutInformationStep
            selectedCountry={formData.country}
            onBack={() => setStep(1)}
            onSubmit={(scoutData) => {
              const fullPhone = formData.country
                ? `${phoneValidation[formData.country]?.countryCode ?? ""}${formData.phone}`
                : formData.phone;
              console.log("Registration:", { ...formData, role, fullPhone, ...scoutData });
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <OtpVerificationStep
            email={formData.email}
            onBack={() => setStep(role === "athlete" || role === "scout" ? 2 : 1)}
            onVerified={() => {
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <CreatePasswordStep
            onBack={() => setStep(3)}
            onSubmit={async (password) => {
  try {
    const res = await fetch("http://localhost:3000/api/auth/signup/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId: draftId,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Error:", data);
      alert(data.error || "Something went wrong");
      return;
    }

    console.log("Account created:", data);

    if (role === "coach") {
      navigate("/coach-feed");
    } else if (role === "scout") {
      navigate("/scout-feed");
    } else {
      navigate("/feed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}}
          />
        )}
      </div>
    </MainLayout>
  );
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-[2px] w-5 rounded-full bg-secondary" />
      <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">{children}</h2>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  );
}

export default RegistrationForm;
