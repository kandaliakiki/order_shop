"use client";

import * as React from "react";
import { addDays, addMonths, format, isBefore, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModifiedOriginalDateRangePickerProps {
  className?: string;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
}: ModifiedOriginalDateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalRange, setInternalRange] = React.useState<
    DateRange | undefined
  >(dateRange);

  // Predefined ranges
  const predefinedRanges = {
    "This Month": {
      from: startOfMonth(new Date()),
      to: addDays(addMonths(startOfMonth(new Date()), 1), -1),
    },
    "Last Month": {
      from: startOfMonth(addMonths(new Date(), -1)),
      to: addDays(startOfMonth(new Date()), -1),
    },
    "Last 3 Months": {
      from: startOfMonth(addMonths(new Date(), -2)),
      to: addDays(addMonths(startOfMonth(new Date()), 1), -1),
    },
    "Last 6 Months": {
      from: startOfMonth(addMonths(new Date(), -5)),
      to: addDays(addMonths(startOfMonth(new Date()), 1), -1),
    },
    "This Year": {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(new Date().getFullYear(), 11, 31),
    },
    "Last Year": {
      from: new Date(new Date().getFullYear() - 1, 0, 1),
      to: new Date(new Date().getFullYear() - 1, 11, 31),
    },
  };

  // Reset selection when opening the popover
  React.useEffect(() => {
    if (isOpen) {
      setInternalRange(undefined);
    }
  }, [isOpen]);

  // Handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setInternalRange(range);

    // If only one date is selected, don't update yet
    if (!range || !range.from || !range.to) {
      return;
    }

    // Calculate the difference in months
    const fromMonth = range.from.getMonth() + range.from.getFullYear() * 12;
    const toMonth = range.to.getMonth() + range.to.getFullYear() * 12;
    const monthDiff = toMonth - fromMonth + 1; // +1 because we count inclusive

    setDateRange(range);
    setIsOpen(false);
  };

  // Handle predefined range selection
  const handlePredefinedRangeSelect = (rangeName: string) => {
    const range = predefinedRanges[rangeName as keyof typeof predefinedRanges];
    if (range) {
      setInternalRange(range);
      setDateRange(range);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM, yyyy")} -{" "}
                  {format(dateRange.to, "dd MMM, yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd MMM, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="border-r p-3">
              <Select onValueChange={handlePredefinedRangeSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(predefinedRanges).map((rangeName) => (
                    <SelectItem key={rangeName} value={rangeName}>
                      {rangeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-3 text-xs text-muted-foreground">
                <p>• Minimum selection: 1 month</p>
                <p>• Selection is reset when reopened</p>
                <p>• First click sets start date</p>
                <p>• Second click sets end date</p>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={internalRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              className="border-none"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
