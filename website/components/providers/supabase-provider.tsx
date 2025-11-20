"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseContextValue = {
  client: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }

  return context;
}

type SupabaseProviderProps = {
  children: ReactNode;
  initialSession: Session | null;
};

export default function SupabaseProvider({
  children,
  initialSession,
}: SupabaseProviderProps) {
  const [client] = useState(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    let isMounted = true;

    const syncSessionFromCookies = async () => {
      const { data } = await client.auth.getSession();

      if (isMounted) {
        setSession(data.session ?? null);
      }
    };

    syncSessionFromCookies();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      session,
    }),
    [client, session],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

