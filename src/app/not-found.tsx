import { Suspense } from "react";
import { Header } from "@/components/header";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="no-print">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
      </div>
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      </main>
    </div>
  );
}
