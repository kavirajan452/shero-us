INSERT INTO public.user_roles (user_id, role)
VALUES ('09aae761-ee1a-439a-abac-ef725592cec3', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;