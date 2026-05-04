import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FOOTBALL_POSITIONS } from "@/components/feed/constants";

type SportType = "Football" | "Running" | "Padel" | "Swimming" | string;

interface FormState {
  position: string;
  preferredSide: string;
  heightCm: string;
  weightKg: string;
  injuryNotes: string;
}

interface Props {
  sportType: SportType;
  backendErrors?: Partial<Record<keyof FormState, string>>;
  onFieldChange?: (field: keyof FormState) => void;
  onBack: () => void;
  onSubmit: (data: {
    position: string;
    preferredSide: string;
    heightCm: number;
    weightKg: number;
    injuryNotes: string;
    sportType: string;
  }) => void;
}

const showPosition = (sport: string) => sport === "Football" || sport === "Padel";

function numbersOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

const AthleteInformationStep = ({ sportType, backendErrors, onFieldChange, onBack, onSubmit }: Props) => {
  const [form, setForm] = useState<FormState>({
    position: "",
    preferredSide: "",
    heightCm: "",
    weightKg: "",
    injuryNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const positions = useMemo(() => {
  if (sportType === "Football") return FOOTBALL_POSITIONS;
  return [];
}, [sportType]);

  const update = (field: keyof FormState, value: string) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  setErrors((prev) => ({ ...prev, [field]: undefined }));
  onFieldChange?.(field);
};

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};

    if (sportType === "Football" && !form.position) {
      e.position = "Required";
    }

    if (sportType === "Padel" && !form.preferredSide) {
      e.preferredSide = "Required";
    }

    if (!form.heightCm) e.heightCm = "Required";
    if (!form.weightKg) e.weightKg = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      position: sportType === "Football" ? form.position : "",
      preferredSide: sportType === "Padel" ? form.preferredSide : "",
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      injuryNotes: form.injuryNotes,
      sportType,
    });
  };

  const mergedErrors = {
  ...errors,
  ...backendErrors,
};

  return (
    <div className="space-y-6">
      <SectionTitle>Athlete Information</SectionTitle>

      {sportType === "Football" && (
        <Field label="Player Position" required error={mergedErrors.position}>
          <Select value={form.position} onValueChange={(v) => update("position", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
  <SelectItem key={pos.value} value={pos.value}>
    {pos.label}
  </SelectItem>
))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {sportType === "Padel" && (
        <Field label="Preferred Side" required error={mergedErrors.preferredSide}>
          <RadioGroup
            value={form.preferredSide}
            onValueChange={(v) => update("preferredSide", v)}
            className="flex gap-6 pt-1"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="RIGHT" id="side-right" />
              <Label htmlFor="side-right" className="text-sm font-normal text-card-foreground cursor-pointer">
                Right
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="LEFT" id="side-left" />
              <Label htmlFor="side-left" className="text-sm font-normal text-card-foreground cursor-pointer">
                Left
              </Label>
            </div>
          </RadioGroup>
        </Field>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Height (cm)" required error={mergedErrors.heightCm}>
          <Input
            inputMode="numeric"
            value={form.heightCm}
            onChange={(e) => update("heightCm", numbersOnly(e.target.value))}
            placeholder="Enter height"
          />
        </Field>

        <Field label="Weight (kg)" required error={mergedErrors.weightKg}>
          <Input
            inputMode="numeric"
            value={form.weightKg}
            onChange={(e) => update("weightKg", numbersOnly(e.target.value))}
            placeholder="Enter weight"
          />
        </Field>
      </div>

      <Field label="Injury History / Medical Notes">
        <Textarea
          rows={4}
          value={form.injuryNotes}
          onChange={(e) => update("injuryNotes", e.target.value)}
          placeholder="Enter any relevant notes"
        />
      </Field>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="px-10 py-6 text-base font-semibold"
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="button" size="lg" className="px-10 py-6 text-base font-semibold" onClick={handleSubmit}>
          Next
        </Button>
      </div>
    </div>
  );
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-0.5 w-4 rounded-full bg-secondary" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">{children}</h2>
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
      <Label className="text-sm font-medium text-card-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default AthleteInformationStep;
