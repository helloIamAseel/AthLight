import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  SA: ["Riyadh","Jeddah","Makkah","Madinah","Dammam","Khobar","Dhahran","Taif","Abha","Tabuk","Hail","Yanbu","Najran","Jazan"],
  AE: ["Abu Dhabi","Dubai","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Al Ain"],
  EG: ["Cairo","Giza","Alexandria","Luxor","Aswan","Port Said","Suez"],
  KW: ["Kuwait City","Hawalli","Salmiya","Jahra"],
  QA: ["Doha","Al Rayyan","Al Wakrah","Al Khor"],
  BH: ["Manama","Riffa","Muharraq"],
  OM: ["Muscat","Salalah","Sohar","Nizwa"],
  JO: ["Amman","Irbid","Zarqa","Aqaba"],
  MA: ["Rabat","Casablanca","Marrakesh","Tangier"],
  DZ: ["Algiers","Oran","Constantine","Annaba"],
};

const COUNTRY_LABELS: Record<string, string> = {
  SA: "Saudi Arabia", AE: "United Arab Emirates", EG: "Egypt",
  KW: "Kuwait", QA: "Qatar", BH: "Bahrain",
  OM: "Oman", JO: "Jordan", MA: "Morocco", DZ: "Algeria",
};

interface Props {
  selectedCountry: string;
  onBack: () => void;
  onSubmit: (data: { scoutingRegion: string }) => void;
}

export default function ScoutInformationStep({ selectedCountry, onBack, onSubmit }: Props) {
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");

  const cities = useMemo(() => CITIES_BY_COUNTRY[selectedCountry] ?? [], [selectedCountry]);

  const handleSubmit = () => {
    if (!region) {
      setError("Required");
      return;
    }
    onSubmit({ scoutingRegion: region });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-4 rounded-full bg-secondary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">Scout Information</h2>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-card-foreground">Country</Label>
        <Input value={COUNTRY_LABELS[selectedCountry] ?? selectedCountry} disabled />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-card-foreground">
          Region of Scouting Focus<span className="text-destructive">*</span>
        </Label>
        <Select value={region} onValueChange={(v) => { setRegion(v); setError(""); }}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>Back</Button>
        <Button type="button" size="lg" className="px-10" onClick={handleSubmit}>Next</Button>
      </div>
    </div>
  );
}
