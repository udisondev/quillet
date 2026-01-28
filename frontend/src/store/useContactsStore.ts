import { create } from "zustand";
import type { Contact } from "../types";

interface ContactsState {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  removeContact: (publicID: string) => void;
  updateContactStatus: (
    publicID: string,
    isOnline: boolean,
    lastSeen?: number,
  ) => void;
}

export const useContactsStore = create<ContactsState>()((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (publicID) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.publicID !== publicID),
    })),
  updateContactStatus: (publicID, isOnline, lastSeen) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.publicID === publicID
          ? { ...c, isOnline, ...(lastSeen != null && { lastSeen }) }
          : c,
      ),
    })),
}));
