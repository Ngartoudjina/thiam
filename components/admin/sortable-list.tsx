'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ActionResult } from '@/services/admin/action-result';

export interface SortableEntry {
  readonly id: string;
}

interface SortableListProps<T extends SortableEntry> {
  readonly items: readonly T[];
  readonly onReorder: (orderedIds: readonly string[]) => Promise<ActionResult>;
  readonly renderItem: (item: T) => ReactNode;
  readonly className?: string;
}

/**
 * Liste réordonnable par glisser-déposer.
 *
 * dnd-kit gère aussi le clavier : on saisit un élément par Espace, on le
 * déplace aux flèches, on le dépose par Espace. Le réordonnancement reste donc
 * accessible sans souris.
 *
 * L'ordre est appliqué localement puis persisté ; en cas d'échec serveur, la
 * liste revient à son état précédent.
 */
export function SortableList<T extends SortableEntry>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  const [ordered, setOrdered] = useState<readonly T[]>(items);

  useEffect(() => setOrdered(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const previous = ordered;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove([...ordered], oldIndex, newIndex);
    setOrdered(next);

    const result = await onReorder(next.map((item) => item.id));

    if (!result.ok) {
      setOrdered(previous);
      toast.error(result.message);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ordered.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={cn('flex flex-col gap-2', className)}>
          {ordered.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { readonly id: string; readonly children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-stretch gap-1 rounded-xl border border-panel-border bg-panel',
        'dark:border-panel-dark-border dark:bg-panel-dark-muted',
        isDragging && 'z-10 shadow-(--shadow-panel-lg)',
      )}
    >
      <button
        type="button"
        aria-label="Déplacer cet élément"
        className={cn(
          'flex w-8 shrink-0 cursor-grab items-center justify-center rounded-l-xl text-panel-faint',
          'hover:bg-panel-muted hover:text-panel-soft active:cursor-grabbing',
          'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent',
          'dark:hover:bg-panel-dark-sunken',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} strokeWidth={1.7} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1 py-3 pr-3">{children}</div>
    </li>
  );
}
