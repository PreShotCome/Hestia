import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useInventory } from '../../lib/db';
import ContainerForm, {
  ContainerFormValues,
} from '../../components/ContainerForm';
import { isRemoteUri } from '../../lib/format';
import { containerPhotoPath, uploadPhoto } from '../../lib/storage';

export default function NewContainerScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { householdId, addContainer, updateContainer } = useInventory();

  const handleSubmit = async (values: ContainerFormValues) => {
    if (!roomId) {
      throw new Error('Missing room.');
    }
    const id = await addContainer({
      name: values.name,
      type: values.type,
      roomId,
      photoUrl: null,
    });
    if (values.photo && !isRemoteUri(values.photo) && householdId) {
      const url = await uploadPhoto(
        values.photo,
        containerPhotoPath(householdId, id)
      );
      await updateContainer(id, { photoUrl: url });
    }
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add Container' }} />
      <ContainerForm submitLabel="Add Container" onSubmit={handleSubmit} />
    </>
  );
}
