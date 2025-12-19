import { Button } from "@culturelense/ui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CultureLense",
  description: "Discover cultural entities",
};

import { InstallPrompt } from "../components/InstallPrompt";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">CultureLense</h1>
      <p className="mb-8">Welcome to the future of cultural discovery.</p>
      <div className="flex gap-4">
        <Button className="bg-blue-600 text-white px-4 py-2 rounded">
          Get Started
        </Button>
      </div>
      <InstallPrompt />
    </main>
  );
}
