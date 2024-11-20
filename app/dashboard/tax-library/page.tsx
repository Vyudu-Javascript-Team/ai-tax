"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleCard } from "@/components/ArticleCard";
import { TaxCalculator } from "@/components/TaxCalculator";
import { useToast } from "@/components/ui/use-toast";

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  date: string;
}

const categories = [
  "All",
  "Industry Deductions",
  "Personal Finance",
  "Money-Saving Strategies",
  "Tax Law Updates",
];

export default function TaxLibrary() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userArticle, setUserArticle] = useState({ title: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/tax-library/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tax-library/submit-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userArticle),
      });
      if (response.ok) {
        toast({
          title: "Article Submitted",
          description: "Your article has been submitted for review.",
        });
        setUserArticle({ title: "", content: "" });
      }
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your article. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter(article => 
    (selectedCategory === "All" || article.category === selectedCategory) &&
    (article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     article.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Library</h1>
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="submit">Submit Article</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>Browse Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded p-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <ScrollArea className="h-[600px]">
                {filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxCalculator />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Article</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitArticle}>
                <Input
                  placeholder="Article Title"
                  value={userArticle.title}
                  onChange={(e) => setUserArticle({ ...userArticle, title: e.target.value })}
                  className="mb-4"
                />
                <textarea
                  placeholder="Article Content"
                  value={userArticle.content}
                  onChange={(e) => setUserArticle({ ...userArticle, content: e.target.value })}
                  className="w-full h-32 p-2 border rounded mb-4"
                />
                <Button type="submit">Submit Article</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}