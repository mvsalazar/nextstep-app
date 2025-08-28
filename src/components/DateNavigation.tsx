import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { TODAY } from "@/lib/constants";

interface DateNavigationProps {
  currentDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
}

export function DateNavigation({ currentDate, onDateChange }: DateNavigationProps) {
  const toLocalYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    // Parse the YYYY-MM-DD date string correctly for local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Compare dates without time (all normalized to local timezone)
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compareYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const compareTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (compareDate.getTime() === compareToday.getTime()) {
      return "Today";
    } else if (compareDate.getTime() === compareYesterday.getTime()) {
      return "Yesterday";
    } else if (compareDate.getTime() === compareTomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric" 
      });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    // Compute next/prev date in local time to avoid UTC shifts
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + (direction === 'prev' ? -1 : 1));
    onDateChange(toLocalYmd(date));
  };

  const goToToday = () => {
    onDateChange(TODAY);
  };

  const isToday = () => {
    return currentDate === TODAY;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateDate("prev")}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-lg text-foreground">
          {formatDisplayDate(currentDate)}
        </span>
        {!isToday() && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="ml-2 text-xs"
          >
            Today
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateDate("next")}
        className="flex items-center gap-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
