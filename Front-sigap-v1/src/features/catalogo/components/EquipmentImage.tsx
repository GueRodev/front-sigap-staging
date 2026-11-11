import { useEffect, useState } from "react";
import { Camera, Laptop, Package, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_BY_PARENT: Record<string, LucideIcon> = {
  Audiovisual: Camera,
  "Cómputo": Laptop,
  Herramientas: Wrench,
  Insumos: Package,
};

interface EquipmentImageProps {
  src: string | null;
  alt: string;
  parentCategoryName: string;
  className?: string;
}

/** Imagen del equipo con fallback por categoría padre (null o error de carga). */
const EquipmentImage = ({ src, alt, parentCategoryName, className }: EquipmentImageProps) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    const Icon = ICON_BY_PARENT[parentCategoryName] ?? Package;
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-muted", className)}>
        <Icon className="h-12 w-12 text-muted-foreground" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
};

export default EquipmentImage;
