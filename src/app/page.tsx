import Dashboard from "@/components/Dashboard";
import { getSnapshot } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default function Home() {
  const snapshot = getSnapshot();
  return <Dashboard initialData={snapshot} />;
}
