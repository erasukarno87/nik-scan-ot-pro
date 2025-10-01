import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const AdminTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          Kelola user, approval flow, dan konfigurasi sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Settings className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tab Admin</h3>
          <p className="text-muted-foreground">
            Fitur admin untuk manajemen user dan flow approval
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTab;
