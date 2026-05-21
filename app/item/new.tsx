import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useInventory } from '../../lib/db';
import ItemForm, { ItemFormValues } from '../../components/ItemForm';
import { isRemoteUri } from '../../lib/format';
import { uploadPhoto } from '../../lib/storage';

export default function NewItemScreen() {
  const { roomId, containerId } = useLocalSearchParams<{
    roomId?: string;
    containerId?: string;
  }>();
  const router = useRouter();
  const { rooms, containers, allTags, addItem } = useInventory();

  const handleSubmit = async (values: ItemFormValues) => {
    let photoUrl: string | null = null;
    if (values.photo && !isRemoteUri(values.photo)) {
      photoUrl = await uploadPhoto(values.photo);
    }
    await addItem({
      name: values.name,
      notes: values.notes,
      quantity: values.quantity,
      roomId: values.roomId,
      containerId: values.containerId,
      tags: values.tags,
      photoUrl,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add Item' }} />
      <ItemForm
        rooms={rooms}
        containers={containers}
        allTags={allTags}
        submitLabel="Add Item"
        initial={{
          roomId: roomId ?? '',
          containerId: containerId ?? null,
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
