export type ContainerType =
  | 'drawer'
  | 'bin'
  | 'shelf'
  | 'closet'
  | 'box'
  | 'cabinet'
  | 'other';

export const CONTAINER_TYPES: ContainerType[] = [
  'drawer',
  'bin',
  'shelf',
  'closet',
  'box',
  'cabinet',
  'other',
];

export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  householdId: string | null;
}

export interface Household {
  id: string;
  name: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: number;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
}

export interface Container {
  id: string;
  name: string;
  type: ContainerType;
  roomId: string;
  photoUrl: string | null;
  createdAt: number;
}

export interface Item {
  id: string;
  name: string;
  notes: string;
  quantity: number;
  roomId: string;
  containerId: string | null;
  photoUrl: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
