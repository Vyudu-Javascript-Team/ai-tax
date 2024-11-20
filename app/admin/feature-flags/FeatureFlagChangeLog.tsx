"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChangeLogEntry {
  id: string;
  changedBy: string;
  oldValue: boolean;
  newValue: boolean;
  changedAt: string;
}

export function FeatureFlagChangeLog({ flagId }: { flagId: string }) {
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChangeLog = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/feature-flags/${flagId}/changelog`);
        if (!response.ok) {
          throw new Error('Failed to fetch change log');
        }
        const data = await response.json();
        setChangeLog(data);
      } catch (error) {
        console.error('Error fetching change log:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChangeLog();
  }, [flagId]);

  if (loading) {
    return <div>Loading change log...</div>;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {changeLog.length === 0 ? (
        <p>No changes recorded yet.</p>
      ) : (
        changeLog.map((entry) => (
          <Card key={entry.id} className="mb-2">
            <CardContent className="py-2">
              <p className="text-sm">
                <span className="font-semibold">{entry.changedBy}</span> changed the flag from{' '}
                <span className={entry.oldValue ? 'text-green-600' : 'text-red-600'}>
                  {entry.oldValue ? 'enabled' : 'disabled'}
                </span>{' '}
                to{' '}
                <span className={entry.newValue ? 'text-green-600' : 'text-red-600'}>
                  {entry.newValue ? 'enabled' : 'disabled'}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(entry.changedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}