import { Container, Item, Room } from './types';

export function findRoom(
  rooms: Room[],
  id: string | null
): Room | undefined {
  return id ? rooms.find((r) => r.id === id) : undefined;
}

export function findContainer(
  containers: Container[],
  id: string | null
): Container | undefined {
  return id ? containers.find((c) => c.id === id) : undefined;
}

/** Human-readable location, e.g. "Kitchen › Top drawer". */
export function locationLabel(
  item: Item,
  rooms: Room[],
  containers: Container[]
): string {
  const room = findRoom(rooms, item.roomId);
  const container = findContainer(containers, item.containerId);
  const parts = [room?.name ?? 'Unknown room'];
  if (container) {
    parts.push(container.name);
  }
  return parts.join('  ›  ');
}

export function isRemoteUri(uri: string | null): boolean {
  return !!uri && uri.startsWith('http');
}
