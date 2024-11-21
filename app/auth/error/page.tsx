"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration. Please try again later.";
    case "AccessDenied":
      return "You do not have permission to access this resource.";
    case "Verification":
      return "The verification link is invalid or has expired.";
    default:
      return "An error occurred during authentication. Please try again.";
  }
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  const errorMessage = getErrorMessage(error);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            We encountered a problem while trying to authenticate you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
