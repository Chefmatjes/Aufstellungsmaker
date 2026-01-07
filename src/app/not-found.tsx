import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Seite nicht gefunden</CardTitle>
          <CardDescription>
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/" className="block">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              Zum Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
