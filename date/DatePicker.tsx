  <CustomDatePicker
    value={f.createdAt}
    onChange={f.setCreatedAt}
    RightIcon={
      <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
    }
  />
---------------------------------------------------------------------------------
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IProps {
  value?: { from: Date | undefined; to: Date | undefined };
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
  RightIcon?: React.ReactNode;
}

export default function CustomDatePicker({
  value,
  onChange,
  RightIcon,
}: IProps) {
  const [date, setDate] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(
    value
      ? { from: value.from, to: value.to }
      : { from: undefined, to: undefined }
  );
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(value || { from: undefined, to: undefined });
  }, [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full flex justify-between items-center text-left font-normal",
            !date.from && !date.to && "text-muted-foreground"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from && date.to ? (
              `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`
            ) : (
              <span>Огноогоор шүүх</span>
            )}
          </div>

          {date.from && date.to && RightIcon && (
            <span
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setDate({ from: undefined, to: undefined });
                onChange({ from: undefined, to: undefined });
              }}
            >
              {RightIcon}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={date}
          onSelect={(selectedDate: any) => {
            setDate(selectedDate);
            onChange(selectedDate || { from: undefined, to: undefined });
            if (selectedDate?.from && selectedDate?.to) {
              setIsOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
