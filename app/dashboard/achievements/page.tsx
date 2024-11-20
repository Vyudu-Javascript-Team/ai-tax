"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Achievements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardHeader>
              <CardTitle>{achievement.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{achievement.description}</p>
              <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
              <p className="mt-2">
                Progress: {achievement.progress} / {achievement.maxProgress}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}