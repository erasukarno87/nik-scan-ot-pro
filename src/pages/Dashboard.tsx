import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Clock, CheckCircle, BarChart3, FileText, Settings } from "lucide-react";
import SubmitOvertime from "@/components/overtime/SubmitOvertime";
import ApprovalTab from "@/components/overtime/ApprovalTab";
import MonitoringTab from "@/components/overtime/MonitoringTab";
import ReportTab from "@/components/overtime/ReportTab";
import AdminTab from "@/components/overtime/AdminTab";

interface UserProfile {
  nik: string;
  full_name: string;
  line_area: string;
  role: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const currentNik = localStorage.getItem('currentNik');
    const profileData = localStorage.getItem('userProfile');

    if (!currentNik || !profileData) {
      navigate('/login');
      return;
    }

    setUserProfile(JSON.parse(profileData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentNik');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  if (!userProfile) {
    return null;
  }

  const isAdmin = userProfile.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Overtime Management</h1>
                <p className="text-sm text-muted-foreground">Production Department</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-foreground">{userProfile.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.line_area} • {userProfile.role.toUpperCase()}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-card border shadow-sm">
            <TabsTrigger value="submit" className="flex items-center gap-2 py-3">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Submit</span>
            </TabsTrigger>
            <TabsTrigger value="approval" className="flex items-center gap-2 py-3">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Approval</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2 py-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="submit">
            <SubmitOvertime userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="approval">
            <ApprovalTab userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="monitoring">
            <MonitoringTab userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="report">
            <ReportTab userProfile={userProfile} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
