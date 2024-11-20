"use client";

import { useEffect, useState } from 'react';
import { CalendarIcon } from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  date: string;
}

export function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      try {
        const response = await fetch('/api/dashboard/upcoming-deadlines');
        if (response.ok) {
          const deadlineData = await response.json();
          setDeadlines(deadlineData);
        }
      } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
      }
    };

    fetchUpcomingDeadlines();
  }, []);

  return (
    <div className="space-y-8">
      {deadlines.map((deadline) => (
        <div key={deadline.id} className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
          <span className="flex-1 truncate">{deadline.title}</span>
          <span className="text-muted-foreground">
            {new Date(deadline.date).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}