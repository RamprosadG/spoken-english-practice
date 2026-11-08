"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { RiDraggable } from "react-icons/ri";
import Button from "@/components/ui/buttons/Button";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";

export interface ListeningItemDraft {
  key: string;
  text: string;
}

const ITEM_MAX_LENGTH = 1000;
const MIN_ITEMS = 1;

let itemKeyCounter = 0;

/**
 * Keys anchor React state and dragging only. They never travel to the API,
 * where the array order alone defines the stored sentence sequence.
 */
export function createItemKey() {
  itemKeyCounter += 1;
  return `item-${itemKeyCounter}`;
}

interface SortableSentenceProps {
  draft: ListeningItemDraft;
  index: number;
  error?: string;
  canRemove: boolean;
  onChange: (key: string, text: string) => void;
  onRemove: (key: string) => void;
}

function SortableSentence({
  draft,
  index,
  error,
  canRemove,
  onChange,
  onRemove,
}: SortableSentenceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: draft.key });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg ${isDragging ? "z-10 opacity-90" : ""}`}
    >
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <button
          type="button"
          aria-label={`Reorder Sentence ${index + 1}`}
          title="Drag To Reorder"
          className="mt-1 cursor-grab touch-none rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <RiDraggable className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-xs font-medium text-slate-500">
            Sentence {index + 1}
          </p>

          <textarea
            id={`listening-item-${draft.key}`}
            name={`item-${index}`}
            rows={2}
            maxLength={ITEM_MAX_LENGTH}
            placeholder="Type the sentence the learner will dictate"
            aria-label={`Sentence ${index + 1} Text`}
            value={draft.text}
            onChange={(event) => onChange(draft.key, event.target.value)}
            className={`w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
          />

          {error && (
            <span className="mt-0.5 block text-xs font-medium text-red-600">
              {error}
            </span>
          )}
        </div>

        <TableActionButton
          tooltip={`Remove Sentence ${index + 1}`}
          color="rose"
          disabled={!canRemove}
          onClick={() => onRemove(draft.key)}
        >
          <FiTrash2 className="w-4 h-4" />
        </TableActionButton>
      </div>
    </li>
  );
}

function SentenceDragPreview({ draft, index }: { draft: ListeningItemDraft; index: number }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-lg">
      <span className="mt-1 text-slate-400" aria-hidden="true">
        <RiDraggable className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-slate-500">
          Sentence {index + 1}
        </p>
        <p className="truncate text-sm text-slate-900">
          {draft.text.trim() || "Empty Sentence"}
        </p>
      </div>
    </div>
  );
}

interface ListeningItemSorterProps {
  items: ListeningItemDraft[];
  errors: Record<string, string>;
  onChange: (items: ListeningItemDraft[]) => void;
}

export function ListeningItemSorter({
  items,
  errors,
  onChange,
}: ListeningItemSorterProps) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const draggedIndex = items.findIndex((item) => item.key === draggedKey);

  const handleTextChange = (key: string, text: string) => {
    onChange(
      items.map((item) => (item.key === key ? { ...item, text } : item)),
    );
  };

  const handleRemove = (key: string) => {
    onChange(items.filter((item) => item.key !== key));
  };

  const handleAdd = () => {
    onChange([...items, { key: createItemKey(), text: "" }]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedKey(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = items.findIndex((item) => item.key === active.id);
    const to = items.findIndex((item) => item.key === over.id);
    if (from < 0 || to < 0) return;

    onChange(arrayMove(items, from, to));
  };

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        Listening Sentences
      </legend>
      <p className="text-xs text-slate-500">
        Sentences are practised in this order. Drag the handle — or focus it and
        press the space bar, then the arrow keys — to change the order.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedKey(null)}
      >
        <SortableContext
          items={items.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-3 flex flex-col gap-3">
            {items.map((item, index) => (
              <SortableSentence
                key={item.key}
                draft={item}
                index={index}
                error={errors[item.key]}
                canRemove={items.length > MIN_ITEMS}
                onChange={handleTextChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay>
          {draggedIndex >= 0 ? (
            <SentenceDragPreview
              draft={items[draggedIndex]}
              index={draggedIndex}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        type="button"
        variant="white"
        onClick={handleAdd}
        icon={<FiPlus className="h-4 w-4" />}
        className="mt-4 w-full sm:w-auto"
      >
        Add Sentence
      </Button>
    </fieldset>
  );
}
