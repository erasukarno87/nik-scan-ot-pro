import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [nik, setNik] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nik.trim()) {
      toast.error("Mohon masukkan NIK");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user exists in profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('nik', nik.trim())
        .single();

      if (error || !profile) {
        toast.error("NIK tidak ditemukan. Silakan hubungi admin.");
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage (simplified auth)
      localStorage.setItem('currentNik', profile.nik);
      localStorage.setItem('userProfile', JSON.stringify(profile));

      toast.success(`Selamat datang, ${profile.full_name}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Clock className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Overtime System</CardTitle>
          <CardDescription className="text-base">
            Production Department - PT. Manufacturing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-base font-medium">
                NIK (Nomor Induk Karyawan)
              </Label>
              <div className="relative">
                <Input
                  id="nik"
                  type="text"
                  placeholder="Masukkan NIK Anda"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="h-12 text-lg pr-12"
                  disabled={isLoading}
                />
                <ScanLine className="absolute right-3 top-3 h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Atau scan QR code pada ID Card Anda
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Demo Login: ADMIN001 (Admin) atau hubungi admin untuk NIK Anda
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
