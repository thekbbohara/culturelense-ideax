import Link from "next/link";
import { Button } from "@/components/ui-components";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-xl font-semibold mb-2">Page Not Found</p>
      <p className="text-neutral-500 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/home">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
}
