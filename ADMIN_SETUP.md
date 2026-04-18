# Admin Portal Setup Guide

## Available Roles

| Role Key | Label | Tier | Access |
|---|---|---|---|
| `super_admin` | Super Admin | Leadership | Full platform — all sections, all data |
| `country_manager` | Country Head | Leadership | Full platform |
| `vertical_head` | Vertical Head | Leadership | Full platform |
| `regional_manager` | Regional Manager | Manager | Partners, Orders, Menus, Metrics |
| `ops_manager` | Operations Manager | Manager | Orders, SSC, Analytics, Comms |
| `onboarding_manager` | Onboarding Manager | Manager | Partners, SAP Onboarding |
| `kobtl` | KOB Team Leader | Team Leader | Orders, Kitchen, Menus |
| `kob_executive` | KOB Executive | Executive | Orders, Kitchen, Menus (limited) |
| `sap_onboarding_tl` | SAP Onboarding TL | Team Leader | SAP Onboarding |
| `shf_manager` | SHF Manager | Manager | Partners, Orders, Metrics |
| `hcf_manager` | HCF Manager | Manager | Partners, Orders, Metrics |
| `spc_manager` | SPC Manager | Manager | SPC |
| `spc_tl` | SPC Team Leader | Team Leader | SPC (limited) |
| `ssc_manager` | SSC Manager | Manager | Tickets, Support, Debit/Credit |
| `ssc_tl` | SSC Team Leader | Team Leader | Tickets, Support |
| `ssc_executor` | SSC Executor | Executive | Tickets (limited) |
| `finance_manager` | Finance Manager | Manager | All Finance sections |
| `ppp_tl` | PPP Team Leader | Team Leader | Payments, Finance (limited) |
| `ppp_executor` | PPP Executor | Executive | Payments (view only) |
| `party_manager` | Party Manager | Manager | Party Orders, Menus, Finance |
| `party_tl` | Party Team Leader | Team Leader | Party Orders, Menus |
| `party_executive` | Party Executive | Executive | Party Orders (limited) |
| `hr_manager` | HR Manager | Manager | Team, PMS, HR Policies |
| `asst_manager` | Assistant Manager | Manager | Dashboard, Orders, Support |

---

## Creating the First Super Admin

Since the `admin_accounts` table is populated from existing `user_roles` entries at migration time,
a fresh deployment has no admin accounts. Follow these steps to create the first **Super Admin**:

### Step 1 — Create the Supabase Auth User

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Users**
3. Click **Add User → Create New User**
4. Enter an email address (e.g. `superadmin@yourdomain.com`) and a strong password
5. Click **Create User** and note down the new user's **UUID** from the users list

### Step 2 — Grant the Admin Role (SQL Editor)

Open the **SQL Editor** in your Supabase Dashboard and run:

```sql
-- Replace the values below with your actual user ID, email, and desired display name
DO $$
DECLARE
  v_user_id UUID := '<PASTE_USER_UUID_HERE>';   -- from Step 1
  v_username TEXT := 'superadmin';              -- username for login
  v_display_name TEXT := 'Super Admin';         -- display name shown in the console
BEGIN
  -- 1. Add to user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 2. Add to admin_accounts
  INSERT INTO public.admin_accounts (auth_user_id, username, role, display_name, is_active)
  VALUES (v_user_id, v_username, 'super_admin', v_display_name, true)
  ON CONFLICT (auth_user_id) DO UPDATE
    SET role = 'super_admin',
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        is_active = true,
        updated_at = now();
END $$;
```

### Step 3 — Log In

Go to `/admin/login` and sign in with:
- **Username**: `superadmin` (or whatever you set as `v_username` above)
- **Password**: the password you set in Step 1

---

## Adding More Admins (Super Admin only)

Once logged in as Super Admin, run a similar SQL snippet for each new admin account,
substituting the appropriate `role` value from the table above.

Future versions will include an in-app admin user management screen.
