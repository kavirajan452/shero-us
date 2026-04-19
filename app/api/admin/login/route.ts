import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = (body.username ?? '').trim().toLowerCase();
    const password: string = body.password ?? '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const { rows } = await pool.query<{
      username: string;
      role: string;
      display_name: string;
      password_hash: string | null;
    }>(
      `SELECT username, role, display_name, password_hash
       FROM public.admin_accounts
       WHERE is_active = true
         AND lower(username) = $1
       LIMIT 1`,
      [username],
    );

    const admin = rows[0];

    // Always run bcrypt.compare to prevent username-enumeration via timing differences.
    const hashToCheck = admin?.password_hash ?? '$2b$10$invalidhashpaddingtomatch22chars';
    const valid = await bcrypt.compare(password, hashToCheck);

    if (!admin?.password_hash || !valid) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      username: admin.username,
      role: admin.role,
      display_name: admin.display_name,
    });
  } catch (err) {
    console.error('[/api/admin/login]', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
