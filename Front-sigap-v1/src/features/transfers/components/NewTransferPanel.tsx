import { useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';

import SearchInput from '@/components/shared/SearchInput';
import FilterSelect from '@/components/shared/FilterSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { MOCK_CATEGORIES, isComputoEquipment } from '@/features/equipment/data/mockEquipment';
import { _equipmentStore } from '@/features/equipment/hooks/useEquipmentList';
import type { Equipment } from '@/features/equipment/types/equipment.types';
import { useAreasStore } from '@/features/areas/hooks/useAreasStore';
import { useCurrentMockUser } from '@/features/areas/hooks/useCurrentMockUser';

import {
  IT_ROLES,
  TRANSFERABLE_STATUSES,
  type TransferResolution,
} from '../constants/transfer.constants';
import { resolveTransferModality } from '../hooks/resolveTransferModality';

interface Props {
  onResolved: (
    equipment: Equipment,
    originAreaId: number,
    destinationAreaId: number,
    resolution: TransferResolution,
  ) => void;
}

const leafCategories = MOCK_CATEGORIES.filter((c) => c.parent_id !== null);

/** Bordes según la modalidad resuelta al arrastrar. */
const resolutionBorder = (r: TransferResolution | null): string => {
  if (!r) return 'border-slate-200';
  if (r.modality === 'direct') return 'border-sigap-sky ring-2 ring-sigap-sky/40';
  if (r.modality === 'request') return 'border-amber-400 ring-2 ring-amber-400/40';
  if (r.modality === 'sublocation') return 'border-violet-400 ring-2 ring-violet-400/40';
  return 'border-slate-200 opacity-40';
};

const NewTransferPanel = ({ onResolved }: Props) => {
  const { user } = useCurrentMockUser();
  const areas = useAreasStore((s) => s.areas);

  // Force re-render if equipment mutates elsewhere.
  const [, setV] = useState(0);
  useEffect(() => {
    const unsub = _equipmentStore.subscribe(() => setV((x) => x + 1));
    return () => {
      unsub();
    };
  }, []);
  const equipmentAll = _equipmentStore.getAll();

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<number | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [dragEquipmentId, setDragEquipmentId] = useState<number | null>(null);
  const [dragHighlights, setDragHighlights] = useState<Map<number, TransferResolution>>(new Map());
  const [selectedForTouch, setSelectedForTouch] = useState<number | null>(null);

  const isIT = IT_ROLES.has(user.functionalRole);

  const equipmentList = useMemo(() => {
    return equipmentAll.filter((e) => {
      // Filtro por categoría
      if (categoryFilter && e.category_id !== categoryFilter) return false;
      // Filtro por área — IT ve todo Cómputo aunque no coincida
      if (areaFilter) {
        const ignoreAreaFilter = isIT && isComputoEquipment(e.category_id);
        if (!ignoreAreaFilter && e.current_area_id !== areaFilter) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [e.name, e.institutional_plate, e.internal_plate, e.serial_number]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [equipmentAll, areaFilter, categoryFilter, search, isIT]);

  const destinationAreas = useMemo(
    () => areas.filter((a) => !a.deletedAt && !a.is_protected),
    [areas],
  );
  const areaOptions = destinationAreas.map((a) => ({ value: String(a.id), label: a.name }));
  const categoryOptions = leafCategories.map((c) => ({ value: String(c.id), label: c.name }));

  /** Cuando arranca el drag calculamos el resultado contra cada área. */
  const computeHighlights = (equipment: Equipment) => {
    const map = new Map<number, TransferResolution>();
    for (const dest of destinationAreas) {
      const origin = areas.find((a) => a.id === equipment.current_area_id);
      if (!origin) continue;
      const resolution = resolveTransferModality(equipment, origin, dest, user);
      map.set(dest.id, resolution);
    }
    setDragHighlights(map);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, equipment: Equipment) => {
    setDragEquipmentId(equipment.id);
    computeHighlights(equipment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(equipment.id));
  };

  const handleDragEnd = () => {
    setDragEquipmentId(null);
    setDragHighlights(new Map());
  };

  const handleDrop = (destinationAreaId: number) => {
    if (dragEquipmentId == null) return;
    const equipment = equipmentAll.find((e) => e.id === dragEquipmentId);
    if (!equipment) return;
    const origin = areas.find((a) => a.id === equipment.current_area_id);
    const destination = areas.find((a) => a.id === destinationAreaId);
    if (!origin || !destination) return;
    const resolution = resolveTransferModality(equipment, origin, destination, user);
    handleDragEnd();
    onResolved(equipment, origin.id, destination.id, resolution);
  };

  const handleTouchTransfer = (destinationAreaId: number) => {
    if (selectedForTouch == null) return;
    const equipment = equipmentAll.find((e) => e.id === selectedForTouch);
    if (!equipment) return;
    const origin = areas.find((a) => a.id === equipment.current_area_id);
    const destination = areas.find((a) => a.id === destinationAreaId);
    if (!origin || !destination) return;
    const resolution = resolveTransferModality(equipment, origin, destination, user);
    setSelectedForTouch(null);
    setDragHighlights(new Map());
    onResolved(equipment, origin.id, destination.id, resolution);
  };

  const selectForTouch = (equipment: Equipment) => {
    if (!TRANSFERABLE_STATUSES.has(equipment.status)) return;
    setSelectedForTouch(equipment.id);
    computeHighlights(equipment);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Columna Origen */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display text-sidebar">Origen — equipos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar equipo…"
              className="min-w-[180px] flex-1"
            />
            <FilterSelect
              value={areaFilter ? String(areaFilter) : undefined}
              onChange={(v) => setAreaFilter(v ? Number(v) : undefined)}
              options={areaOptions}
              placeholder="Todas las áreas"
              allLabel="Todas las áreas"
              className="w-[180px]"
            />
            <FilterSelect
              value={categoryFilter ? String(categoryFilter) : undefined}
              onChange={(v) => setCategoryFilter(v ? Number(v) : undefined)}
              options={categoryOptions}
              placeholder="Todas las categorías"
              allLabel="Todas las categorías"
              className="w-[190px]"
            />
          </div>

          {isIT && (
            <p className="text-xs text-sidebar/70">
              Tu rol de TI puede mover equipos de Cómputo desde cualquier área — el filtro de área
              se ignora para esa categoría.
            </p>
          )}

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {equipmentList.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay equipos que coincidan con los filtros.
              </p>
            ) : (
              equipmentList.map((eq) => {
                const transferable = TRANSFERABLE_STATUSES.has(eq.status);
                const isSelected = selectedForTouch === eq.id;
                const plate = eq.institutional_plate ?? eq.internal_plate ?? 'Sin placa';
                return (
                  <div
                    key={eq.id}
                    draggable={transferable}
                    onDragStart={(e) => transferable && handleDragStart(e, eq)}
                    onDragEnd={handleDragEnd}
                    onClick={() => transferable && selectForTouch(eq)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 transition-all',
                      transferable
                        ? 'cursor-grab border-slate-200 bg-white hover:border-sigap-sky hover:shadow-sm active:cursor-grabbing'
                        : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60',
                      isSelected && 'border-sigap-sky ring-2 ring-sigap-sky/30',
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                      <Package className="h-4 w-4 text-sky-500" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-sidebar">
                        {eq.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {plate} · {areas.find((a) => a.id === eq.current_area_id)?.name ?? '—'}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {eq.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Columna Destino */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display text-sidebar">Destino — áreas</CardTitle>
          {selectedForTouch != null && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedForTouch(null)}>
              Cancelar selección
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid max-h-[600px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {destinationAreas.map((area) => {
              const resolution = dragHighlights.get(area.id) ?? null;
              const showHighlight =
                dragEquipmentId != null || selectedForTouch != null;
              return (
                <div
                  key={area.id}
                  onDragOver={(e) => {
                    if (dragEquipmentId != null) e.preventDefault();
                  }}
                  onDrop={() => handleDrop(area.id)}
                  onClick={() => selectedForTouch != null && handleTouchTransfer(area.id)}
                  className={cn(
                    'flex flex-col rounded-lg border p-3 transition-all',
                    showHighlight
                      ? resolutionBorder(resolution)
                      : 'border-slate-200 hover:border-sigap-sky',
                    selectedForTouch != null && 'cursor-pointer',
                  )}
                >
                  <p className="font-display text-sm font-semibold text-sidebar">{area.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.zone ? `Zona ${area.zone}` : 'Sin zona'} · {area.building ?? '—'}
                  </p>
                  {showHighlight && resolution && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {resolution.modality === 'direct' && 'Traslado directo'}
                      {resolution.modality === 'request' && 'Genera solicitud'}
                      {resolution.modality === 'sublocation' && 'Cambio de sublocación'}
                      {resolution.modality === 'not_allowed' && 'No permitido'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransferPanel;
