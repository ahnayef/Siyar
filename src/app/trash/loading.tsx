import { Skeleton } from '@/components/ui/skeleton';

export default function TrashLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-1/3 bg-muted/30" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[4px] bg-muted/20" />)}
      </div>
    </div>
  );
}
