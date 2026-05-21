import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  QuerySnapshot,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { Container, ContainerType, Household, Item, Room } from './types';

// --- Households -------------------------------------------------------------

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export async function createHousehold(
  uid: string,
  name: string
): Promise<void> {
  const ref = await addDoc(collection(db, 'households'), {
    name: name.trim(),
    memberIds: [uid],
    inviteCode: generateInviteCode(),
    createdAt: Date.now(),
  });
  await updateDoc(doc(db, 'users', uid), { householdId: ref.id });
}

export async function joinHousehold(
  uid: string,
  inviteCode: string
): Promise<void> {
  const code = inviteCode.trim().toUpperCase();
  const snapshot = await getDocs(
    query(collection(db, 'households'), where('inviteCode', '==', code))
  );
  if (snapshot.empty) {
    throw new Error('No household found for that invite code.');
  }
  const householdDoc = snapshot.docs[0];
  await updateDoc(householdDoc.ref, { memberIds: arrayUnion(uid) });
  await updateDoc(doc(db, 'users', uid), { householdId: householdDoc.id });
}

// --- Inventory data ---------------------------------------------------------

function mapDocs<T>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

export interface RoomInput {
  name: string;
  icon: string;
}

export interface ContainerInput {
  name: string;
  type: ContainerType;
  roomId: string;
  photoUrl: string | null;
}

export interface ItemInput {
  name: string;
  notes: string;
  quantity: number;
  roomId: string;
  containerId: string | null;
  photoUrl: string | null;
  tags: string[];
}

interface InventoryContextValue {
  householdId: string | null;
  household: Household | null;
  rooms: Room[];
  containers: Container[];
  items: Item[];
  allTags: string[];
  loading: boolean;
  addRoom: (input: RoomInput) => Promise<void>;
  updateRoom: (id: string, input: Partial<RoomInput>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addContainer: (input: ContainerInput) => Promise<string>;
  updateContainer: (
    id: string,
    input: Partial<ContainerInput>
  ) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  addItem: (input: ItemInput) => Promise<string>;
  updateItem: (id: string, input: Partial<ItemInput>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { userDoc } = useAuth();
  const householdId = userDoc?.householdId ?? null;

  const [household, setHousehold] = useState<Household | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      setRooms([]);
      setContainers([]);
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const base = ['households', householdId] as const;
    const unsubHousehold = onSnapshot(
      doc(db, 'households', householdId),
      (snap) =>
        setHousehold(
          snap.exists()
            ? ({ id: snap.id, ...snap.data() } as Household)
            : null
        )
    );
    const unsubRooms = onSnapshot(
      collection(db, ...base, 'rooms'),
      (snap) => setRooms(mapDocs<Room>(snap))
    );
    const unsubContainers = onSnapshot(
      collection(db, ...base, 'containers'),
      (snap) => setContainers(mapDocs<Container>(snap))
    );
    const unsubItems = onSnapshot(
      collection(db, ...base, 'items'),
      (snap) => {
        setItems(mapDocs<Item>(snap));
        setLoading(false);
      }
    );
    return () => {
      unsubHousehold();
      unsubRooms();
      unsubContainers();
      unsubItems();
    };
  }, [householdId]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const value = useMemo<InventoryContextValue>(() => {
    function requireHousehold(): string {
      if (!householdId) {
        throw new Error('No household selected.');
      }
      return householdId;
    }

    return {
      householdId,
      household,
      rooms,
      containers,
      items,
      allTags,
      loading,

      addRoom: async (input) => {
        const hid = requireHousehold();
        await addDoc(collection(db, 'households', hid, 'rooms'), {
          ...input,
          createdAt: Date.now(),
        });
      },

      updateRoom: async (id, input) => {
        const hid = requireHousehold();
        await updateDoc(doc(db, 'households', hid, 'rooms', id), input);
      },

      deleteRoom: async (id) => {
        const hid = requireHousehold();
        const batch = writeBatch(db);
        containers
          .filter((c) => c.roomId === id)
          .forEach((c) =>
            batch.delete(doc(db, 'households', hid, 'containers', c.id))
          );
        items
          .filter((i) => i.roomId === id)
          .forEach((i) =>
            batch.delete(doc(db, 'households', hid, 'items', i.id))
          );
        batch.delete(doc(db, 'households', hid, 'rooms', id));
        await batch.commit();
      },

      addContainer: async (input) => {
        const hid = requireHousehold();
        const ref = await addDoc(
          collection(db, 'households', hid, 'containers'),
          { ...input, createdAt: Date.now() }
        );
        return ref.id;
      },

      updateContainer: async (id, input) => {
        const hid = requireHousehold();
        await updateDoc(doc(db, 'households', hid, 'containers', id), input);
      },

      deleteContainer: async (id) => {
        const hid = requireHousehold();
        const batch = writeBatch(db);
        // Items in the container stay in their room but become loose.
        items
          .filter((i) => i.containerId === id)
          .forEach((i) =>
            batch.update(doc(db, 'households', hid, 'items', i.id), {
              containerId: null,
            })
          );
        batch.delete(doc(db, 'households', hid, 'containers', id));
        await batch.commit();
      },

      addItem: async (input) => {
        const hid = requireHousehold();
        const now = Date.now();
        const ref = await addDoc(collection(db, 'households', hid, 'items'), {
          ...input,
          createdAt: now,
          updatedAt: now,
        });
        return ref.id;
      },

      updateItem: async (id, input) => {
        const hid = requireHousehold();
        await updateDoc(doc(db, 'households', hid, 'items', id), {
          ...input,
          updatedAt: Date.now(),
        });
      },

      deleteItem: async (id) => {
        const hid = requireHousehold();
        await deleteDoc(doc(db, 'households', hid, 'items', id));
      },
    };
  }, [householdId, household, rooms, containers, items, allTags, loading]);

  return React.createElement(InventoryContext.Provider, { value }, children);
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
