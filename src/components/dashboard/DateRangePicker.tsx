import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const DateRangePicker = ({ dateRange, onDateRangeChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverRange, setHoverRange] = useState<DateRange | undefined>();

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return "Selecionar período";
    }
    
    if (range.from && !range.to) {
      return format(range.from, "dd/MM/yyyy", { locale: ptBR });
    }
    
    if (range.from && range.to) {
      return `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(range.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    
    return "Selecionar período";
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal px-3 py-2 h-auto",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(dateRange)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={hoverRange || dateRange}
          onSelect={(range) => {
            onDateRangeChange(range);
            setHoverRange(undefined);
            if (range?.from && range?.to) {
              setIsOpen(false);
            }
          }}
          onDayMouseEnter={(date) => {
            if (dateRange?.from && !dateRange.to) {
              setHoverRange({ from: dateRange.from, to: date });
            }
          }}
          onDayMouseLeave={() => {
            if (dateRange?.from && !dateRange.to) {
              setHoverRange({ from: dateRange.from, to: undefined });
            }
          }}
          numberOfMonths={2}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};