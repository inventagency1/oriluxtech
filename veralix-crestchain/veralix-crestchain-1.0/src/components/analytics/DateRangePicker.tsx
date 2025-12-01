import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [date, setDate] = useState<{ from?: Date; to?: Date }>({
    from: value?.from,
    to: value?.to
  });

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDate(range);
      onChange?.({ from: range.from, to: range.to });
    }
  };

  const presets = [
    {
      label: "Últimos 7 días",
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Últimos 30 días",
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Últimos 3 meses",
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    },
    {
      label: "Último año",
      getValue: () => ({
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        to: new Date()
      })
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => {
            const range = preset.getValue();
            handleSelect(range);
          }}
        >
          {preset.label}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="w-4 h-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM", { locale: es })} -{" "}
                  {format(date.to, "dd MMM yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd MMM yyyy", { locale: es })
              )
            ) : (
              <span>Rango personalizado</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={date.from && date.to ? { from: date.from, to: date.to } : undefined}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
