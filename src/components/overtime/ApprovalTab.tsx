import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface UserProfile {
  nik: string;
  full_name: string;
  line_area: string;
  role: string;
}

interface ApprovalTabProps {
  userProfile: UserProfile;
}

const ApprovalTab = ({ userProfile }: ApprovalTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Approval Lembur
        </CardTitle>
        <CardDescription>
          Kelola persetujuan pengajuan lembur dari tim Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tab Approval</h3>
          <p className="text-muted-foreground">
            Fitur approval akan menampilkan daftar pengajuan yang perlu disetujui
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalTab;
