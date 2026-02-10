import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  myReservations: [],

  /** Called once on app mount — restores session & subscribes to auth changes */
  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user, isLoading: false });
      get().fetchProfile(session.user.id);
    } else {
      set({ isLoading: false });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ user, isLoading: false });
      if (user) get().fetchProfile(user.id);
      else set({ profile: null });
    });

    return subscription;
  },

  fetchProfile: async (uid) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (data) set({ profile: data });
  },

  updateProfile: async (updates) => {
    const uid = get().user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", uid)
      .select()
      .single();
    if (!error && data) set({ profile: data });
    return { data, error };
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, myReservations: [] });
  },

  /** Reservations management */
  setReservations: (reservations) => set({ myReservations: reservations }),

  updateReservationById: (id, updates) => {
    const reservations = get().myReservations;
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    set({ myReservations: updated });
  },
}));

export default useAuthStore;
