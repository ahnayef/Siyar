import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="neo-card p-8 max-w-xl mx-auto">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-destructive">User Not Found</h2>
        <p className="text-muted-foreground mb-6 text-body-md">
          The user profile you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="neo-button">
          <Link href="/">
            Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  );
}
