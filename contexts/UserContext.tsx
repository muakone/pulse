"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  type: "patient" | "hospital" | "transport";
  location?: {
    lat: number;
    lng: number;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateLocation: (lat: number, lng: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const updateLocation = (lat: number, lng: number) => {
    if (user) {
      setUser({
        ...user,
        location: { lat, lng },
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateLocation }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
