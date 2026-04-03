import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScreenContent {
  id: string;
  screen_key: string;
  content_key: string;
  content_value: string;
  content_type: string;
  description: string | null;
}

export interface Promotion {
  id: string;
  vertical: string;
  title: string;
  offer_text: string;
  offer_tag: string | null;
  discount_value: number;
  discount_type: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  target_screen: string | null;
  display_order: number;
}

// Fetch all screen content for a given screen_key
export function useScreenContent(screenKey: string) {
  return useQuery({
    queryKey: ["screen_content", screenKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("screen_content")
        .select("*")
        .eq("screen_key", screenKey);
      if (error) throw error;
      return (data || []) as ScreenContent[];
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}

// Fetch all screen content (for admin page)
export function useAllScreenContent() {
  return useQuery({
    queryKey: ["screen_content", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("screen_content")
        .select("*")
        .order("screen_key")
        .order("content_key");
      if (error) throw error;
      return (data || []) as ScreenContent[];
    },
  });
}

// Fetch multiple screen keys at once
export function useMultiScreenContent(screenKeys: string[]) {
  return useQuery({
    queryKey: ["screen_content", "multi", screenKeys],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("screen_content")
        .select("*")
        .in("screen_key", screenKeys);
      if (error) throw error;
      return (data || []) as ScreenContent[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Helper: convert array to lookup map
export function contentMap(items: ScreenContent[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items) {
    map[`${item.screen_key}.${item.content_key}`] = item.content_value;
  }
  return map;
}

// Fetch promotions by vertical or target_screen
export function usePromotions(filters?: { vertical?: string; targetScreen?: string }) {
  return useQuery({
    queryKey: ["promotions", filters],
    queryFn: async () => {
      let q = supabase.from("promotions").select("*").eq("is_active", true).order("display_order");
      if (filters?.vertical) q = q.eq("vertical", filters.vertical);
      if (filters?.targetScreen) q = q.eq("target_screen", filters.targetScreen);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Promotion[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch all promotions (for admin)
export function useAllPromotions() {
  return useQuery({
    queryKey: ["promotions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("vertical")
        .order("display_order");
      if (error) throw error;
      return (data || []) as Promotion[];
    },
  });
}
