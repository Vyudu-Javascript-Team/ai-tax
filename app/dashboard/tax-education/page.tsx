"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaxTopic {
  id: string;
  title: string;
  content: string;
}

export default function TaxEducationPage() {
  const [topics, setTopics] = useState<TaxTopic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    // In a real application, this would be an API call
    const mockTopics: TaxTopic[] = [
      {
        id: "1",
        title: "Understanding Tax Brackets",
        content: "Tax brackets are...",
      },
      {
        id: "2",
        title: "Itemized vs. Standard Deductions",
        content: "When deciding between itemized and standard deductions...",
      },
      // Add more mock topics as needed
    ];
    setTopics(mockTopics);
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Education Center</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{topic.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}