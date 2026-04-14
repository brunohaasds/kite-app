import { MobileContainer } from "@/components/layout/mobile-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <MobileContainer className="space-y-4 p-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </MobileContainer>
  );
}
