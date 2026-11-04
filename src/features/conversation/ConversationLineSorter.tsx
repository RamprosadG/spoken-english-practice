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
import Badge from "@/components/ui/badges/Badge";
import Button from "@/components/ui/buttons/Button";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import type { ConversationSpeaker } from "@/types/conversation";
import { SPEAKER_BADGE_VARIANTS, SPEAKER_ROW_CLASSES } from "./speakerStyles";

export interface ConversationLineDraft {
  key: string;
  text: string;
}

const LINE_MAX_LENGTH = 1000;
const MIN_LINES = 2;

let lineKeyCounter = 0;

/**
 * Keys anchor React state and dragging only. They never travel to the API,
 * where the array order alone defines the stored turn sequence.
 */
export function createLineKey() {
  lineKeyCounter += 1;
  return `line-${lineKeyCounter}`;
}

interface TurnProps {
  index: number;
  speaker: ConversationSpeaker;
  speakerName: string;
}

/** Falls back while the speaker name fields are still empty. */
function turnLabel({
  index,
  speakerName,
}: Pick<TurnProps, "index" | "speakerName">) {
  return speakerName.trim() || `Speaker ${index % 2 === 0 ? "1" : "2"}`;
}

interface SortableTurnProps extends TurnProps {
  draft: ConversationLineDraft;
  error?: string;
  canRemove: boolean;
  onChange: (key: string, text: string) => void;
  onRemove: (key: string) => void;
}

function SortableTurn({
  draft,
  index,
  speaker,
  speakerName,
  error,
  canRemove,
  onChange,
  onRemove,
}: SortableTurnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: draft.key });

  const label = turnLabel({ index, speakerName });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg ${isDragging ? "z-10 opacity-90" : ""}`}
    >
      <div
        className={`flex items-start gap-2 rounded-lg border px-3 py-3 ${SPEAKER_ROW_CLASSES[speaker]}`}
      >
        <button
          type="button"
          aria-label={`Reorder turn ${index + 1}, ${label}`}
          title="Drag to reorder"
          className="mt-1 cursor-grab touch-none rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <RiDraggable className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant={SPEAKER_BADGE_VARIANTS[speaker]} size="sm">
              {label}
            </Badge>
            <span className="text-xs font-medium text-slate-500">
              Turn {index + 1}
            </span>
          </div>

          <textarea
            id={`conversation-line-${draft.key}`}
            name={`line-${index}`}
            rows={2}
            maxLength={LINE_MAX_LENGTH}
            placeholder="Type what this speaker says"
            aria-label={`Turn ${index + 1} text for ${label}`}
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
          tooltip={`Remove turn ${index + 1}`}
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

function TurnDragPreview({ draft, ...turn }: TurnProps & { draft: ConversationLineDraft }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-3 shadow-lg ${SPEAKER_ROW_CLASSES[turn.speaker]}`}
    >
      <span className="mt-1 text-slate-400" aria-hidden="true">
        <RiDraggable className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1">
          <Badge variant={SPEAKER_BADGE_VARIANTS[turn.speaker]} size="sm">
            {turnLabel(turn)}
          </Badge>
        </p>
        <p className="truncate text-sm text-slate-900">
          {draft.text.trim() || "Empty turn"}
        </p>
      </div>
    </div>
  );
}

interface ConversationLineSorterProps {
  lines: ConversationLineDraft[];
  speaker1: string;
  speaker2: string;
  errors: Record<string, string>;
  onChange: (lines: ConversationLineDraft[]) => void;
}

export function ConversationLineSorter({
  lines,
  speaker1,
  speaker2,
  errors,
  onChange,
}: ConversationLineSorterProps) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const turn = (index: number): TurnProps => ({
    index,
    speaker: index % 2 === 0 ? "one" : "two",
    speakerName: index % 2 === 0 ? speaker1 : speaker2,
  });

  const draggedIndex = lines.findIndex((line) => line.key === draggedKey);

  const handleTextChange = (key: string, text: string) => {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, text } : line)),
    );
  };

  const handleRemove = (key: string) => {
    onChange(lines.filter((line) => line.key !== key));
  };

  const handleAdd = () => {
    onChange([...lines, { key: createLineKey(), text: "" }]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedKey(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedKey(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = lines.findIndex((line) => line.key === active.id);
    const to = lines.findIndex((line) => line.key === over.id);
    if (from < 0 || to < 0) return;

    onChange(arrayMove(lines, from, to));
  };

  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-800">
        Conversation turns
      </legend>
      <p className="text-xs text-slate-500">
        Turns alternate between the two speakers. Drag the handle — or focus it
        and press the space bar, then the arrow keys — to change the order.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedKey(null)}
      >
        <SortableContext
          items={lines.map((line) => line.key)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-3 flex flex-col gap-3">
            {lines.map((line, index) => (
              <SortableTurn
                key={line.key}
                draft={line}
                {...turn(index)}
                error={errors[line.key]}
                canRemove={lines.length > MIN_LINES}
                onChange={handleTextChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay>
          {draggedIndex >= 0 ? (
            <TurnDragPreview
              draft={lines[draggedIndex]}
              {...turn(draggedIndex)}
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
        Add turn
      </Button>
    </fieldset>
  );
}
