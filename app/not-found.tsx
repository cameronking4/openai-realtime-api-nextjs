import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      <Link href="/" passHref>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Return to Home
        </Button>
      </Link>
    </div>
  );
} 