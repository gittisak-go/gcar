import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAdminReservationsRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel("admin-reservations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        (payload) => {
          console.log("Admin Realtime:", payload);
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
