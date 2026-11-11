import { createPortal } from "react-dom";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay = ({ isLoading, message }: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sigap-dark/85 backdrop-blur-sm animate-fade-in">
      {/* Spinner */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-sigap-sky/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sigap-sky border-r-sigap-blue animate-spin-slow" />
      </div>

      {message && (
        <p className="mt-6 text-sm font-medium tracking-wide text-sigap-sky/90 animate-pulse">
          {message}
        </p>
      )}
    </div>,
    document.body
  );
};

export default LoadingOverlay;
