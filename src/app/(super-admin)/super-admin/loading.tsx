import { Loader2 } from "@/lib/icons";

export default function SuperAdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
    </div>
  );
}
