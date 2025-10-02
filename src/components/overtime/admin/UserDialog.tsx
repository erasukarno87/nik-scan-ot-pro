import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  full_name: z.string().min(1, "Nama wajib diisi"),
  line_area: z.string().min(1, "Line/Area wajib diisi"),
  role: z.enum(["operator", "leader", "manager", "admin"]),
  approver1_nik: z.string().optional(),
  approver2_nik: z.string().optional(),
  is_admin: z.boolean().default(false),
  is_manager: z.boolean().default(false),
});

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
}

export const UserDialog = ({ open, onOpenChange, user }: UserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: "",
      full_name: "",
      line_area: "",
      role: "operator",
      approver1_nik: "",
      approver2_nik: "",
      is_admin: false,
      is_manager: false,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        nik: user.nik,
        full_name: user.full_name,
        line_area: user.line_area,
        role: user.role,
        approver1_nik: user.approver1_nik || "",
        approver2_nik: user.approver2_nik || "",
        is_admin: user.user_roles?.some((r: any) => r.role === "admin") || false,
        is_manager: user.user_roles?.some((r: any) => r.role === "manager") || false,
      });
    } else {
      form.reset({
        nik: "",
        full_name: "",
        line_area: "",
        role: "operator",
        approver1_nik: "",
        approver2_nik: "",
        is_admin: false,
        is_manager: false,
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const profileData = {
        nik: values.nik,
        full_name: values.full_name,
        line_area: values.line_area,
        role: values.role,
        approver1_nik: values.approver1_nik || null,
        approver2_nik: values.approver2_nik || null,
      };

      let userId = user?.id;

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", user.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();

        if (error) throw error;
        userId = data.id;
      }

      // Manage app roles
      if (userId) {
        // Delete existing app roles
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        // Insert new app roles
        const rolesToInsert = [];
        if (values.is_admin) rolesToInsert.push({ user_id: userId, role: "admin" });
        if (values.is_manager) rolesToInsert.push({ user_id: userId, role: "manager" });

        if (rolesToInsert.length > 0) {
          const { error } = await supabase
            .from("user_roles")
            .insert(rolesToInsert);

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Berhasil",
        description: user ? "User berhasil diupdate" : "User berhasil ditambahkan",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Tambah User"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIK</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Line/Area</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Default</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="approver1_nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK Approver 1</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approver2_nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK Approver 2</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 border rounded-lg p-4">
              <h4 className="font-semibold text-sm">App Roles</h4>
              <FormField
                control={form.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Admin</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_manager"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Manager</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
