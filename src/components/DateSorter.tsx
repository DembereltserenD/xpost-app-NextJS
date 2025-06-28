"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateSorterProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  className?: string;
}

export default function DateSorter({
  onDateSelect = () => {},
  selectedDate = "",
  className = "",
}: DateSorterProps) {
  // Generate last 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }

    return dates;
  };

  const dates = generateDates();
  const [activeDate, setActiveDate] = useState(
    selectedDate || dates[0].toISOString().split("T")[0],
  );
  const [showFullYear, setShowFullYear] = useState(false);

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    setActiveDate(dateString);
    onDateSelect(dateString);
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      if (showFullYear) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-muted/30 rounded-full border border-border/50",
        "dark:bg-muted/20 dark:border-border/30",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-background/80 dark:hover:bg-background/60"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => setShowFullYear(!showFullYear)}
            className="cursor-pointer"
          >
            {showFullYear ? "Hide" : "Show"} Full Year
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dates.map((date, index) => {
        const dateString = date.toISOString().split("T")[0];
        const isActive = activeDate === dateString;
        const isToday = date.toDateString() === new Date().toDateString();

        return (
          <button
            key={dateString}
            onClick={() => handleDateClick(date)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] h-12 px-3 py-1.5 rounded-full transition-all duration-200 text-xs font-medium",
              "hover:bg-background/80 hover:shadow-sm",
              "dark:hover:bg-background/60",
              isActive && [
                "bg-primary text-primary-foreground shadow-md",
                "dark:bg-primary dark:text-primary-foreground",
                "hover:bg-primary/90 dark:hover:bg-primary/90",
              ],
              !isActive && [
                "text-muted-foreground",
                "dark:text-muted-foreground",
              ],
              isToday &&
                !isActive && [
                  "text-foreground font-semibold",
                  "dark:text-foreground",
                ],
            )}
          >
            <span className="text-[10px] leading-none mb-0.5 opacity-80">
              {formatDateDisplay(date)}
            </span>
            <span className="text-sm leading-none font-bold">
              {getDateNumber(date)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
