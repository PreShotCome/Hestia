import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useInventory } from '../../lib/db';
import ItemForm, { ItemFormValues } from '../../components/ItemForm';
import { isRemoteUri } from '../../lib/format';
import { uploadPhoto } from '../../lib/storage';

export default function AddItemScreen() {
  const router = useRouter();
  const { rooms, containers, allTags, addItem } = useInventory();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ItemFormValues) => {
    let photoUrl: string | null = null;
    if (values.photo && !isRemoteUri(values.photo)) {
      photoUrl = await uploadPhoto(values.photo);
    }
    const id = await addItem({
      name: values.name,
      notes: values.notes,
      quantity: values.quantity,
      roomId: values.roomId,
      containerId: values.containerId,
      tags: values.tags,
      photoUrl,
    });
    setFormKey((k) => k + 1);
    router.push(`/item/${id}`);
  };

  return (
    <ItemForm
      key={formKey}
      rooms={rooms}
      containers={containers}
      allTags={allTags}
      submitLabel="Add Item"
      onSubmit={handleSubmit}
    />
  );
}
