import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  nik: string;
  full_name: string;
  line_area: string;
  role: string;
  approver1_nik?: string;
  approver2_nik?: string;
}

interface OvertimeCategory {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description: string;
}

interface SubmitOvertimeProps {
  userProfile: UserProfile;
}

const SubmitOvertime = ({ userProfile }: SubmitOvertimeProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<OvertimeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        setStartTime(category.start_time.substring(0, 5));
        setEndTime(category.end_time.substring(0, 5));
        calculateTotalHours(category.start_time, category.end_time);
      }
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('overtime_categories')
      .select('*')
      .eq('is_active', true);

    if (error) {
      toast.error("Gagal memuat kategori overtime");
      return;
    }

    setCategories(data || []);
  };

  const calculateTotalHours = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const hours = (totalMinutes / 60).toFixed(2);
    setTotalHours(hours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !jobDescription.trim()) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      // Fetch approvers from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('approver1_nik, approver2_nik')
        .eq('nik', userProfile.nik)
        .single();

      const { error } = await supabase
        .from('overtime_submissions')
        .insert({
          employee_nik: userProfile.nik,
          submission_date: format(date, 'yyyy-MM-dd'),
          category_id: selectedCategory,
          start_time: startTime,
          end_time: endTime,
          total_hours: parseFloat(totalHours),
          job_description: jobDescription,
          approver1_nik: profile?.approver1_nik,
          approver2_nik: profile?.approver2_nik,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Pengajuan lembur berhasil dikirim!");
      
      // Reset form
      setSelectedCategory("");
      setStartTime("");
      setEndTime("");
      setTotalHours("");
      setJobDescription("");
      setDate(new Date());
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Gagal mengirim pengajuan lembur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pengajuan Lembur
        </CardTitle>
        <CardDescription>
          Lengkapi form di bawah untuk mengajukan lembur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Lembur *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "EEEE, dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori Lembur *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (endTime) calculateTotalHours(e.target.value, endTime);
                }}
                className="font-mono"
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (startTime) calculateTotalHours(startTime, e.target.value);
                }}
                className="font-mono"
              />
            </div>

            {/* Total Hours */}
            <div className="space-y-2">
              <Label htmlFor="totalHours">Total Jam Lembur</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="totalHours"
                  type="text"
                  value={totalHours}
                  readOnly
                  className="pl-10 bg-muted font-semibold"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-3 text-sm text-muted-foreground">jam</span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Alasan / Deskripsi Pekerjaan *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Jelaskan alasan lembur dan deskripsi pekerjaan yang akan dikerjakan..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? "Mengirim..." : "Kirim Pengajuan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmitOvertime;
