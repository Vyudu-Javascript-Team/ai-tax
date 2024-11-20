import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to AI Tax Prep</h1>
      <p className="mb-8">Simplify your tax preparation with our AI-powered platform.</p>
      <Button as={Link} href="/auth/signin" color="primary" size="lg">
        Get Started
      </Button>
    </div>
  );
}