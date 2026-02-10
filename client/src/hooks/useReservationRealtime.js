import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import useAuthStore from "../store/store";

export function useReservationRealtime() {
  const { user, updateReservationById } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-reservations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reservations",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime Update:", payload);
          // Update store directly for immediate UI feedback
          updateReservationById(payload.new.id, payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, updateReservationById]);
}
