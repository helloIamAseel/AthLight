import { useRef, useState, forwardRef, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parse, isValid, setMonth, setYear } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "./AppDatePicker.css";

interface AppDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: boolean;
  maxDate?: Date;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

const AppDatePicker = forwardRef<HTMLDivElement, AppDatePickerProps>(
  function AppDatePicker(
    { value, onChange, label, placeholder = "Select date", className = "", error = false, maxDate },
    _ref
  ) {
    const [open, setOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(
      value ? parse(value, "yyyy-MM-dd", new Date()) : new Date()
    );
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDate = value
      ? parse(value, "yyyy-MM-dd", new Date())
      : undefined;

    const handleSelect = (day: Date | undefined) => {
      if (day && isValid(day)) {
        onChange(format(day, "yyyy-MM-dd"));
      } else {
        onChange("");
      }
      setOpen(false);
    };

    const displayValue =
      selectedDate && isValid(selectedDate)
        ? format(selectedDate, "MMM d, yyyy")
        : "";

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }, []);

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open, handleClickOutside]);

    const handleMonthChange = (monthValue: string) => {
      setDisplayMonth((prev) => setMonth(prev, Number(monthValue)));
    };

    const handleYearChange = (yearValue: string) => {
      setDisplayMonth((prev) => setYear(prev, Number(yearValue)));
    };

    return (
      <div className={`app-date-picker ${className}`} ref={containerRef}>
        {label && <span className="text-sm font-medium text-card-foreground">{label}</span>}

        <button
          type="button"
          className={`flex h-10 w-full items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            error
              ? "border-destructive focus:ring-destructive"
              : "border-input"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <Calendar size={15} className="text-muted-foreground flex-shrink-0" />
          <span className={displayValue ? "text-foreground" : "text-muted-foreground"}>
            {displayValue || placeholder}
          </span>
        </button>

        {open && (
          <div
            className="app-date-picker__popup"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Month/Year dropdowns using app Select component */}
            <div className="flex gap-2 mb-3 relative z-[1400]">
              <div className="flex-1">
                <Select
                  value={String(displayMonth.getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[1500]">
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={String(displayMonth.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[1500]">
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              showOutsideDays
              disabled={maxDate ? (date) => date > maxDate : undefined}
              className="app-date-picker__calendar"
              classNames={{
                months: "app-cal__months",
                month: "app-cal__month",
                caption: "app-cal__caption",
                caption_label: "app-cal__caption-label",
                nav: "app-cal__nav",
                nav_button: "app-cal__nav-button",
                nav_button_previous: "app-cal__nav-prev",
                nav_button_next: "app-cal__nav-next",
                table: "app-cal__table",
                head_row: "app-cal__head-row",
                head_cell: "app-cal__head-cell",
                row: "app-cal__row",
                cell: "app-cal__cell",
                day: "app-cal__day",
                day_selected: "app-cal__day--selected",
                day_today: "app-cal__day--today",
                day_outside: "app-cal__day--outside",
                day_disabled: "app-cal__day--disabled",
              }}
              components={{
                IconLeft: () => <ChevronLeft size={16} />,
                IconRight: () => <ChevronRight size={16} />,
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

export default AppDatePicker;
