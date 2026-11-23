-- InternTrack Seed Data
-- 1 Coordinator, 3 Guides, 30 Students in realistic varied states

-- Coordinator
insert into public.profiles (id, role, name, email, phone, roll_no, batch, semester, department)
values ('11111111-1111-1111-1111-111111111111', 'coordinator', 'Prof. D. Kamat', 'coordinator@dbce.edu', '+91 9822100001', 'COORD-01', '2021-2025', 'VII', 'Electronics & Telecommunication')
on conflict (id) do nothing;

-- 3 Internal Guides
insert into public.profiles (id, role, name, email, phone, roll_no, batch, semester, department) values
('22222222-2222-2222-2222-222222222201', 'guide', 'Dr. Rajesh Sharma', 'guide.sharma@dbce.edu', '+91 9822100002', 'FAC-01', '2021-2025', 'VII', 'Electronics & Telecommunication'),
('22222222-2222-2222-2222-222222222202', 'guide', 'Prof. Melba Fernandes', 'guide.fernandes@dbce.edu', '+91 9822100003', 'FAC-02', '2021-2025', 'VII', 'Electronics & Telecommunication'),
('22222222-2222-2222-2222-222222222203', 'guide', 'Prof. Sanket Naik', 'guide.naik@dbce.edu', '+91 9822100004', 'FAC-03', '2021-2025', 'VII', 'Electronics & Telecommunication')
on conflict (id) do nothing;
