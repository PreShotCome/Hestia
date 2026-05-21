import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useInventory } from '../../lib/db';
import ItemForm, { ItemFormValues } from '../../components/ItemForm';
import { isRemoteUri } from '../../lib/format';
import { itemPhotoPath, uploadPhoto } from '../../lib/storage';

export default function AddItemScreen() {
  const router = useRouter();
  const { householdId, rooms, containers, allTags, addItem, updateItem } =
    useInventory();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ItemFormValues) => {
    const id = await addItem({
      name: values.name,
      notes: values.notes,
      quantity: values.quantity,
      roomId: values.roomId,
      containerId: values.containerId,
      tags: values.tags,
      photoUrl: null,
    });
    if (values.photo && !isRemoteUri(values.photo) && householdId) {
      const url = await uploadPhoto(
        values.photo,
        itemPhotoPath(householdId, id)
      );
      await updateItem(id, { photoUrl: url });
    }
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
