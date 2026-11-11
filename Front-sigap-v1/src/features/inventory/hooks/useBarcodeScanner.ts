import { useCallback, useState } from "react";
import { useZxing } from "react-zxing";

export interface UseBarcodeScannerOptions {
  /** Called with the raw decoded text. Debounced by the consumer if needed. */
  onDecoded: (text: string) => void;
  /** Pause the camera stream (e.g. while a lookup is in progress). */
  paused?: boolean;
}

/**
 * Único punto de la app que importa `react-zxing`. Encapsula el ciclo de vida
 * de la cámara + errores de permisos. El consumidor solo necesita adjuntar
 * `ref` a un `<video>` y renderizar el estado (`error`, `isScanning`).
 */
export const useBarcodeScanner = ({ onDecoded, paused }: UseBarcodeScannerOptions) => {
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const { ref } = useZxing({
    paused,
    onDecodeResult: (result) => {
      setError(null);
      // react-zxing v3 uses the BarcodeDetector shape (`rawValue`).
      const text =
        (result as unknown as { rawValue?: string }).rawValue ??
        (result as unknown as { getText?: () => string }).getText?.() ??
        "";
      if (text) onDecoded(text);
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : "No se pudo acceder a la cámara.";
      setError(message);
    },
    // `nonce` change forces re-initialization on retry.
    timeBetweenDecodingAttempts: 250,
  });

  const retry = useCallback(() => {
    setError(null);
    setNonce((n) => n + 1);
  }, []);

  return {
    ref,
    isScanning: !paused && !error,
    error,
    retry,
    /** Attach to the container as `key` to force remount when retrying. */
    key: nonce,
  };
};
