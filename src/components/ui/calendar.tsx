"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = Omit<
  React.ComponentProps<typeof DayPicker>,
  "selected" | "onSelect" | "mode"
> & {
  value?: Date // The selected date and time
  onChange?: (dateWithTime: Date | undefined) => void // Callback with the full date and time
}

function Calendar({
  className, // For the root div
  classNames, // For DayPicker internals
  showOutsideDays = true,
  value,
  onChange,
  ...props // Other DayPicker props
}: CalendarProps) {
  const timeInputId = React.useId()

  const handleDateSelect = (selectedDay: Date | undefined) => {
    if (!onChange) return

    if (selectedDay) {
      // Ensure we are working with local time parts for hours/minutes.
      // Create date with year, month, day from selectedDay.
      const finalNewDateTime = new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate(),
        value ? value.getHours() : 0, // Preserve existing hours or default to 0
        value ? value.getMinutes() : 0, // Preserve existing minutes or default to 0
        value ? value.getSeconds() : 0, // Preserve existing seconds or default to 0
        value ? value.getMilliseconds() : 0 // Preserve existing ms or default to 0
      )
      onChange(finalNewDateTime)
    } else {
      onChange(undefined)
    }
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange || !value) return // Time can only be changed if a date (value) already exists

    const timeValue = event.target.value // "HH:mm"
    const [hoursStr, minutesStr] = timeValue.split(":")
    const hours = parseInt(hoursStr, 10)
    const minutes = parseInt(minutesStr, 10)

    if (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {
      const newDateTime = new Date(value)
      newDateTime.setHours(hours)
      newDateTime.setMinutes(minutes)
      newDateTime.setSeconds(0) // Reset seconds for consistency with time input
      newDateTime.setMilliseconds(0) // Reset milliseconds
      onChange(newDateTime)
    } else if (timeValue === "") {
      // Handle clearing the time input
      const newDateTime = new Date(value)
      newDateTime.setHours(0)
      newDateTime.setMinutes(0)
      newDateTime.setSeconds(0)
      newDateTime.setMilliseconds(0)
      onChange(newDateTime)
    }
  }

  // For DayPicker's `selected` prop, we only need the date part.
  // It should be a Date object representing the start of the day in local time.
  const selectedDateForDayPicker = value
    ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
    : undefined

  const timeInputString = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(
        value.getMinutes()
      ).padStart(2, "0")}`
    : ""

  return (
    <div className={cn("inline-block rounded-md border", className)}>
      <DayPicker
        mode="single"
        selected={selectedDateForDayPicker}
        onSelect={handleDateSelect}
        showOutsideDays={showOutsideDays}
        className={cn("p-3")} // Apply padding to DayPicker itself
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames, // Allow overriding via props
        }}
        components={{
          IconLeft: ({ ...iconProps }) => (
            <ChevronLeft className={cn("h-4 w-4", iconProps.className)} {...iconProps} />
          ),
          IconRight: ({ ...iconProps }) => (
            <ChevronRight className={cn("h-4 w-4", iconProps.className)} {...iconProps} />
          ),
        }}
        {...props} // Spread other DayPicker props
      />
      <div className="p-3 border-t border-border">
        <label
          htmlFor={timeInputId}
          className="text-sm font-medium mb-1 block text-muted-foreground"
        >
          Time
        </label>
        <input
          id={timeInputId}
          type="time"
          value={timeInputString}
          onChange={handleTimeChange}
          disabled={!value} // Disable time input if no date is selected
          className="w-full p-2 border border-input bg-transparent rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
