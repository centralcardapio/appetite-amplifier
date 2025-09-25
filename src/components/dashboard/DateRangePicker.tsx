import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}

export const DateRangePicker = ({ selectedDate, onDateChange, placeholder }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal px-3 py-2 h-auto min-w-[140px]",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onDateChange(date);
            setIsOpen(false);
          }}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};