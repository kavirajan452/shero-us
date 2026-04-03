// ═══ Catalog Data Hooks — cookery, shero classes, services, service providers ═══
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ═══ COOKERY CATEGORIES ═══
export function useCookeryCategories() {
  return useQuery({
    queryKey: ["cookery_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cookery_categories" as any).select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data as any[];
    },
  });
}

// ═══ COOKERY CLASSES ═══
export function useCookeryClasses(cuisineId?: string, mealType?: string) {
  return useQuery({
    queryKey: ["cookery_classes", cuisineId, mealType],
    queryFn: async () => {
      let q = supabase.from("cookery_classes" as any).select("*").eq("is_active", true);
      if (cuisineId) q = q.eq("cuisine_id", cuisineId);
      if (mealType) q = q.eq("meal_type", mealType);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCookeryClass(id: string | undefined) {
  return useQuery({
    queryKey: ["cookery_class", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("cookery_classes" as any).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// ═══ SHERO CLASSES ═══
export function useSheroClasses(categoryId?: string) {
  return useQuery({
    queryKey: ["shero_classes", categoryId],
    queryFn: async () => {
      let q = supabase.from("shero_classes" as any).select("*").eq("is_active", true);
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useSheroClass(id: string | undefined) {
  return useQuery({
    queryKey: ["shero_class", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("shero_classes" as any).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// ═══ SERVICE CATEGORIES ═══
export function useServiceCategories() {
  return useQuery({
    queryKey: ["service_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_categories" as any).select("*").eq("is_active", true);
      if (error) throw error;
      return data as any[];
    },
  });
}

// ═══ SERVICE ITEMS ═══
export function useServiceItems(categoryId?: string) {
  return useQuery({
    queryKey: ["service_items", categoryId],
    queryFn: async () => {
      let q = supabase.from("service_items" as any).select("*").eq("is_active", true);
      if (categoryId) q = q.eq("category_id", categoryId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useServiceItem(id: string | undefined) {
  return useQuery({
    queryKey: ["service_item", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("service_items" as any).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
}

// ═══ SERVICE PROVIDERS ═══
export function useServiceProviders(categoryId?: string) {
  return useQuery({
    queryKey: ["service_providers", categoryId],
    queryFn: async () => {
      let q = supabase.from("service_providers" as any).select("*").eq("is_active", true);
      if (categoryId) q = q.contains("category_ids", [categoryId]);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}
