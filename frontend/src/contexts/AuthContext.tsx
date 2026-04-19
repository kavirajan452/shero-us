'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { AdminRole } from "@/data/adminRoles";

export type UserRole = "customer" | "partner" | null;
/**
 * Fine-grained role resolved from the `user_roles` table.  Any role
 * from the 25-value `app_role` enum is possible; `null` means we
 * could not resolve one yet (still loading, or no row).
 */
export type FineGrainedRole = AdminRole | "customer" | "partner" | null;

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  /** Full, fine-grained role (super_admin, country_manager, partner, customer, …) */
  primaryRole: FineGrainedRole;
  /** Only populated when primaryRole is an admin role (i.e. not customer/partner/null) */
  adminRole: AdminRole | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [primaryRole, setPrimaryRole] = useState<FineGrainedRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const adminRole: AdminRole | null =
    primaryRole && primaryRole !== "customer" && primaryRole !== "partner"
      ? (primaryRole as AdminRole)
      : null;

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data && data.length > 0) {
      const roles = data.map((r) => r.role);
      if (roles.includes("partner")) {
        setRole("partner");
      } else if (roles.includes("customer")) {
        setRole("customer");
      }
    }

    // Separately fetch the fine-grained primary role via the RPC added
    // in migration 20260420000000_phase2_task4_auth_rbac.sql.
    const { data: primary } = await (supabase.rpc as any)("get_primary_role", {
      _user_id: userId,
    });
    if (primary) setPrimaryRole(primary as FineGrainedRole);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchRole(user.id);
    }
  }, [user, fetchProfile, fetchRole]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchProfile(newSession.user.id);
            fetchRole(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setPrimaryRole(null);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setRole(null);
          setPrimaryRole(null);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
        fetchRole(existingSession.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRole]);

  // Legacy login for backward compatibility during migration
  const login = useCallback((r: UserRole) => {
    setRole(r);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setPrimaryRole(null);
    // Clear legacy localStorage
    localStorage.removeItem("shero-role");
    localStorage.removeItem("shero-admin");
    localStorage.removeItem("shero-admin-role");
    localStorage.removeItem("shero-admin-rem");
    localStorage.removeItem("shero-admin-name");
    localStorage.removeItem("shero-partner");
    localStorage.removeItem("shero-partner-email");
    localStorage.removeItem("shero-partner-name");
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      primaryRole,
      adminRole,
      isLoggedIn: !!user,
      isLoading,
      login,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
