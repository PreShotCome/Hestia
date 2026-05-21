import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, spacing } from '../lib/theme';
import Button from './Button';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  uri: string | null;
  onDone: (croppedUri: string) => void;
  onCancel: () => void;
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const MIN_SIZE = 64;
const MARGIN = 30;

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(value, hi));
}

/** Rendered rect of the image, fit (with margin) inside the crop area. */
function fitRect(
  img: { w: number; h: number },
  box: { w: number; h: number }
): Rect {
  const scale = Math.min(
    (box.w - 2 * MARGIN) / img.w,
    (box.h - 2 * MARGIN) / img.h
  );
  const w = img.w * scale;
  const h = img.h * scale;
  return { x: (box.w - w) / 2, y: (box.h - h) / 2, w, h };
}

export default function CropModal({ uri, onDone, onCancel }: Props) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);

  // Refs mirror the latest values so the (stable) gesture handlers can read
  // current state without being recreated on every render.
  const cropRef = useRef<Rect | null>(null);
  const dispRef = useRef<Rect | null>(null);
  const startRef = useRef<Rect | null>(null);

  const disp = imgSize && box ? fitRect(imgSize, box) : null;
  cropRef.current = crop;
  dispRef.current = disp;

  useEffect(() => {
    setImgSize(null);
    setCrop(null);
    if (!uri) return;
    Image.getSize(
      uri,
      (w, h) => setImgSize({ w, h }),
      () => {
        Alert.alert('Could not open image', 'Please try another photo.');
        onCancel();
      }
    );
  }, [uri]);

  useEffect(() => {
    if (imgSize && box && !crop) {
      const d = fitRect(imgSize, box);
      setCrop({
        x: d.x + d.w * 0.1,
        y: d.y + d.h * 0.1,
        w: d.w * 0.8,
        h: d.h * 0.8,
      });
    }
  }, [imgSize, box, crop]);

  // Build the pan responders exactly once.
  const respondersRef = useRef<{
    move: PanResponderInstance;
    tl: PanResponderInstance;
    tr: PanResponderInstance;
    bl: PanResponderInstance;
    br: PanResponderInstance;
  } | undefined>(undefined);
  if (!respondersRef.current) {
    const move = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startRef.current = cropRef.current;
      },
      onPanResponderMove: (_, g) => {
        const s = startRef.current;
        const d = dispRef.current;
        if (!s || !d) return;
        setCrop({
          x: clamp(s.x + g.dx, d.x, d.x + d.w - s.w),
          y: clamp(s.y + g.dy, d.y, d.y + d.h - s.h),
          w: s.w,
          h: s.h,
        });
      },
    });

    const corner = (c: Corner) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startRef.current = cropRef.current;
        },
        onPanResponderMove: (_, g) => {
          const s = startRef.current;
          const d = dispRef.current;
          if (!s || !d) return;
          let left = s.x;
          let right = s.x + s.w;
          let top = s.y;
          let bottom = s.y + s.h;
          if (c === 'tl' || c === 'bl') left = s.x + g.dx;
          if (c === 'tr' || c === 'br') right = s.x + s.w + g.dx;
          if (c === 'tl' || c === 'tr') top = s.y + g.dy;
          if (c === 'bl' || c === 'br') bottom = s.y + s.h + g.dy;
          left = clamp(left, d.x, right - MIN_SIZE);
          right = clamp(right, left + MIN_SIZE, d.x + d.w);
          top = clamp(top, d.y, bottom - MIN_SIZE);
          bottom = clamp(bottom, top + MIN_SIZE, d.y + d.h);
          setCrop({ x: left, y: top, w: right - left, h: bottom - top });
        },
      });

    respondersRef.current = {
      move,
      tl: corner('tl'),
      tr: corner('tr'),
      bl: corner('bl'),
      br: corner('br'),
    };
  }
  const responders = respondersRef.current;

  const onAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  const confirm = async () => {
    if (!uri || !crop || !disp || !imgSize) return;
    setBusy(true);
    try {
      const scale = imgSize.w / disp.w;
      const originX = Math.max(0, Math.round((crop.x - disp.x) * scale));
      const originY = Math.max(0, Math.round((crop.y - disp.y) * scale));
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            crop: {
              originX,
              originY,
              width: Math.min(Math.round(crop.w * scale), imgSize.w - originX),
              height: Math.min(Math.round(crop.h * scale), imgSize.h - originY),
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      onDone(result.uri);
    } catch {
      Alert.alert('Crop failed', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={!!uri}
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>Crop photo</Text>
        <Text style={styles.hint}>Drag the frame to move it, corners to resize.</Text>

        <View style={styles.area} onLayout={onAreaLayout}>
          {uri && disp ? (
            <Image
              source={{ uri }}
              style={{
                position: 'absolute',
                left: disp.x,
                top: disp.y,
                width: disp.w,
                height: disp.h,
              }}
            />
          ) : (
            <ActivityIndicator color={colors.primary} size="large" />
          )}

          {disp && crop ? (
            <>
              <View
                style={[styles.dim, { left: 0, top: 0, right: 0, height: crop.y }]}
              />
              <View
                style={[
                  styles.dim,
                  { left: 0, top: crop.y + crop.h, right: 0, bottom: 0 },
                ]}
              />
              <View
                style={[
                  styles.dim,
                  { left: 0, top: crop.y, width: crop.x, height: crop.h },
                ]}
              />
              <View
                style={[
                  styles.dim,
                  {
                    left: crop.x + crop.w,
                    top: crop.y,
                    right: 0,
                    height: crop.h,
                  },
                ]}
              />

              <View
                {...responders.move.panHandlers}
                style={[
                  styles.cropBox,
                  { left: crop.x, top: crop.y, width: crop.w, height: crop.h },
                ]}
              />

              {(['tl', 'tr', 'bl', 'br'] as Corner[]).map((c) => {
                const hx = c === 'tl' || c === 'bl' ? crop.x : crop.x + crop.w;
                const hy = c === 'tl' || c === 'tr' ? crop.y : crop.y + crop.h;
                return (
                  <View
                    key={c}
                    {...responders[c].panHandlers}
                    style={[styles.handle, { left: hx - 22, top: hy - 22 }]}
                  >
                    <View style={styles.handleDot} />
                  </View>
                );
              })}
            </>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            style={styles.btn}
          />
          <Button
            label="Use Photo"
            onPress={confirm}
            loading={busy}
            style={styles.btn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1512',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  hint: {
    color: '#C9BCAE',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  area: {
    flex: 1,
    margin: spacing.md,
  },
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  handle: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  btn: {
    flex: 1,
  },
});
