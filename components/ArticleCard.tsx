import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  date: string;
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">{article.summary}</p>
        <p className="text-sm text-gray-500 mb-2">Source: {article.source}</p>
        <p className="text-sm text-gray-500 mb-2">Category: {article.category}</p>
        <p className="text-sm text-gray-500 mb-4">Date: {article.date}</p>
        <Button as="a" href={article.url} target="_blank" rel="noopener noreferrer">
          Read More
        </Button>
      </CardContent>
    </Card>
  );
}