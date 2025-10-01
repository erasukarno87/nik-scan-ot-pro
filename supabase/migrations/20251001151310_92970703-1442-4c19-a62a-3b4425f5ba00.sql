-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'leader', 'manager');

-- Create enum for overtime status
CREATE TYPE overtime_status AS ENUM ('pending', 'approved_level1', 'approved_level2', 'rejected');

-- Create profiles table (separate from auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nik VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  line_area VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'operator',
  approver1_nik VARCHAR(50),
  approver2_nik VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create overtime categories table
CREATE TABLE public.overtime_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create overtime submissions table
CREATE TABLE public.overtime_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_nik VARCHAR(50) NOT NULL,
  submission_date DATE NOT NULL,
  category_id UUID REFERENCES public.overtime_categories(id),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours DECIMAL(4,2) NOT NULL,
  job_description TEXT NOT NULL,
  status overtime_status DEFAULT 'pending',
  approver1_nik VARCHAR(50),
  approver1_approved_at TIMESTAMP WITH TIME ZONE,
  approver2_nik VARCHAR(50),
  approver2_approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (employee_nik) REFERENCES public.profiles(nik)
);

-- Create approval history table for audit trail
CREATE TABLE public.approval_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  overtime_id UUID REFERENCES public.overtime_submissions(id) ON DELETE CASCADE,
  approver_nik VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default overtime categories
INSERT INTO public.overtime_categories (name, start_time, end_time, description) VALUES
('Lembur Normal (After Shift)', '17:00:00', '21:00:00', 'Overtime after regular shift ends'),
('Lembur Malam', '21:00:00', '05:00:00', 'Night shift overtime'),
('Lembur Hari Libur', '08:00:00', '17:00:00', 'Holiday overtime - full day'),
('Lembur Sabtu', '08:00:00', '14:00:00', 'Saturday half-day overtime');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE nik = current_setting('app.current_nik', true) AND role = 'admin'
  ));

CREATE POLICY "Only admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE nik = current_setting('app.current_nik', true) AND role = 'admin'
  ));

-- RLS Policies for overtime_categories
CREATE POLICY "Everyone can view active categories"
  ON public.overtime_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage categories"
  ON public.overtime_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE nik = current_setting('app.current_nik', true) AND role = 'admin'
  ));

-- RLS Policies for overtime_submissions
CREATE POLICY "Users can view their own submissions"
  ON public.overtime_submissions FOR SELECT
  USING (employee_nik = current_setting('app.current_nik', true));

CREATE POLICY "Approvers can view submissions they need to approve"
  ON public.overtime_submissions FOR SELECT
  USING (
    approver1_nik = current_setting('app.current_nik', true) OR
    approver2_nik = current_setting('app.current_nik', true)
  );

CREATE POLICY "Admins and managers can view all submissions"
  ON public.overtime_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE nik = current_setting('app.current_nik', true) 
    AND role IN ('admin', 'manager')
  ));

CREATE POLICY "Users can insert their own submissions"
  ON public.overtime_submissions FOR INSERT
  WITH CHECK (employee_nik = current_setting('app.current_nik', true));

CREATE POLICY "Approvers can update submissions"
  ON public.overtime_submissions FOR UPDATE
  USING (
    approver1_nik = current_setting('app.current_nik', true) OR
    approver2_nik = current_setting('app.current_nik', true) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE nik = current_setting('app.current_nik', true) 
      AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for approval_history
CREATE POLICY "Everyone can view approval history"
  ON public.approval_history FOR SELECT
  USING (true);

CREATE POLICY "Approvers can insert approval history"
  ON public.approval_history FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_submissions_updated_at
  BEFORE UPDATE ON public.overtime_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user
INSERT INTO public.profiles (nik, full_name, line_area, role) VALUES
('ADMIN001', 'System Administrator', 'IT Department', 'admin');