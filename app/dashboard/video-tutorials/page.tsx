"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export default function VideoTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    // In a real application, this would be an API call
    const mockTutorials: Tutorial[] = [
      {
        id: "1",
        title: "Getting Started with AI Tax Prep",
        description: "Learn the basics of using our platform",
        videoUrl: "https://example.com/video1.mp4",
      },
      {
        id: "2",
        title: "Advanced Tax Deductions",
        description: "Discover lesser-known tax deductions",
        videoUrl: "https://example.com/video2.mp4",
      },
      // Add more mock tutorials as needed
    ];
    setTutorials(mockTutorials);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Video Tutorials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id}>
            <CardHeader>
              <CardTitle>{tutorial.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{tutorial.description}</p>
              <video controls className="w-full">
                <source src={tutorial.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}