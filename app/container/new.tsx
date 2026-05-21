import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useInventory } from '../../lib/db';
import ContainerForm, {
  ContainerFormValues,
} from '../../components/ContainerForm';
import { isRemoteUri } from '../../lib/format';
import { uploadPhoto } from '../../lib/storage';

export default function NewContainerScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { addContainer } = useInventory();

  const handleSubmit = async (values: ContainerFormValues) => {
    if (!roomId) {
      throw new Error('Missing room.');
    }
    let photoUrl: string | null = null;
    if (values.photo && !isRemoteUri(values.photo)) {
      photoUrl = await uploadPhoto(values.photo);
    }
    await addContainer({
      name: values.name,
      type: values.type,
      roomId,
      photoUrl,
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add Container' }} />
      <ContainerForm submitLabel="Add Container" onSubmit={handleSubmit} />
    </>
  );
}
