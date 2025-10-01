import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface UserProfile {
  nik: string;
  full_name: string;
  line_area: string;
  role: string;
}

interface MonitoringTabProps {
  userProfile: UserProfile;
}

const MonitoringTab = ({ userProfile }: MonitoringTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Monitoring Lembur
        </CardTitle>
        <CardDescription>
          Pantau status dan statistik pengajuan lembur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tab Monitoring</h3>
          <p className="text-muted-foreground">
            Fitur monitoring akan menampilkan dashboard dan statistik lembur
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringTab;
