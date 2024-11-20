import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Gamification = ({ points, level, badges }) => {
  return (
    <div>
      <h3>Your Tax Hero Status</h3>
      <p>Points: {points}</p>
      <p>Level: {level}</p>
      <Progress value={points % 100} max={100} />
      <div>
        {badges.map((badge, index) => (
          <Badge key={index}>{badge}</Badge>
        ))}
      </div>
    </div>
  );
};

export default Gamification;