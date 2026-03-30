import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/products">Browse products</Link>
        </Button>
      </div>
    </div>
  );
}
