"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Expert {
  id: string;
  name: string;
  specialization: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export default function ExpertConsultation() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    if (selectedExpert && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedExpert, selectedDate]);

  const fetchExperts = async () => {
    try {
      const response = await fetch("/api/experts");
      if (!response.ok) {
        throw new Error("Failed to fetch experts");
      }
      const data = await response.json();
      setExperts(data);
    } catch (error) {
      console.error("Error fetching experts:", error);
      toast({
        title: "Error",
        description: "Failed to load tax experts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/experts/${selectedExpert}/availability?date=${selectedDate?.toISOString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }
      const data = await response.json();
      setAvailableSlots(data);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast({
        title: "Error",
        description: "Failed to load available time slots. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleConsultation = async () => {
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: selectedExpert,
          date: selectedDate,
          slotId: selectedSlot,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to schedule consultation");
      }
      toast({
        title: "Success",
        description: "Consultation scheduled successfully.",
      });
      // Reset selection
      setSelectedExpert("");
      setSelectedDate(new Date());
      setSelectedSlot("");
    } catch (error) {
      console.error("Error scheduling consultation:", error);
      toast({
        title: "Error",
        description: "Failed to schedule consultation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Schedule Expert Consultation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select an Expert</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedExpert}
            onValueChange={setSelectedExpert}
            className="mb-4"
          >
            <option value="">Select an expert</option>
            {experts.map((expert) => (
              <option key={expert.id} value={expert.id}>
                {expert.name} - {expert.specialization}
              </option>
            ))}
          </Select>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="mb-4"
          />
          {availableSlots.length > 0 && (
            <Select
              value={selectedSlot}
              onValueChange={setSelectedSlot}
              className="mb-4"
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </Select>
          )}
          <Button
            onClick={handleScheduleConsultation}
            disabled={!selectedExpert || !selectedDate || !selectedSlot}
          >
            Schedule Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}