import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./admin/UserManagement";
import { CategoryManagement } from "./admin/CategoryManagement";

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
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Kelola User</TabsTrigger>
            <TabsTrigger value="categories">Kelola Kategori</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminTab;
