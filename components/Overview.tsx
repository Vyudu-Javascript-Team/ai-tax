"use client";

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface OverviewData {
  month: string;
  returns: number;
}

export function Overview() {
  const [data, setData] = useState<OverviewData[]>([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/api/dashboard/overview');
        if (response.ok) {
          const overviewData = await response.json();
          setData(overviewData);
        }
      } catch (error) {
        console.error('Error fetching overview data:', error);
      }
    };

    fetchOverview();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar dataKey="returns" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}