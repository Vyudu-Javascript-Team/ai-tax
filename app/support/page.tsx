"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function Support() {
  const [ticket, setTicket] = useState({ subject: "", message: "" });

  const submitTicket = async (e) => {
    e.preventDefault();
    // Implement API call to submit support ticket
    toast({
      title: "Support ticket submitted",
      description: "We'll get back to you soon!",
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitTicket} className="space-y-4">
            <Input
              placeholder="Subject"
              value={ticket.subject}
              onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
              required
            />
            <Textarea
              placeholder="Describe your issue"
              value={ticket.message}
              onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
              required
            />
            <Button type="submit">Submit Ticket</Button>
          </form>
        </CardContent>
      </Card>
      {/* Add FAQs, knowledge base, or live chat component here */}
    </div>
  );
}