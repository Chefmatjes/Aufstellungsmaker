import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Anmeldung fehlgeschlagen</CardTitle>
            <CardDescription>
              Es gab ein Problem bei der Authentifizierung. Das kann passieren, wenn der
              Anmeldevorgang abgebrochen wurde oder der Link abgelaufen ist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full">Erneut versuchen</Button>
            </Link>
            <p className="text-center text-sm text-muted-foreground">
              Falls das Problem weiterhin besteht, lösche deine Browser-Cookies und versuche es
              erneut.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
