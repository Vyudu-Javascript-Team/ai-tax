"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const taxEvents = [
  { date: "2024-04-15", title: "Tax Filing Deadline" },
  { date: "2024-01-31", title: "W-2 Forms Due" },
  { date: "2024-03-15", title: "S Corporation Tax Return Due" },
  { date: "2024-06-15", title: "Estimated Tax Payment Due" },
  { date: "2024-09-15", title: "Estimated Tax Payment Due" },
  { date: "2024-12-15", title: "Estimated Tax Payment Due" },
];

export default function TaxCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getEventsForDate = (date: Date) => {
    return taxEvents.filter((event) => new Date(event.date).toDateString() === date.toDateString());
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Calendar</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle>Tax Events</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div>
                <h3 className="font-semibold mb-2">
                  Events for {selectedDate.toDateString()}:
                </h3>
                {getEventsForDate(selectedDate).map((event, index) => (
                  <p key={index} className="mb-1">
                    {event.title}
                  </p>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p>No tax events for this date.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}