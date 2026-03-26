"use client";

import { Button } from "@shared/components/ui/button";
import { normalizeRichTextHtml } from "@shared/lib/rich-text";
import { cn } from "@shared/lib/utils";
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconUnderline,
} from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  disabled?: boolean;
};

type ToolbarAction = {
  label: string;
  command: string;
  icon: typeof IconBold;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { label: "Bold", command: "bold", icon: IconBold },
  { label: "Italic", command: "italic", icon: IconItalic },
  { label: "Underline", command: "underline", icon: IconUnderline },
  {
    label: "Bullet List",
    command: "insertUnorderedList",
    icon: IconList,
  },
  {
    label: "Numbered List",
    command: "insertOrderedList",
    icon: IconListNumbers,
  },
];

export function RichTextEditor(props: RichTextEditorProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(
    normalizeRichTextHtml(props.value).length === 0,
  );

  useEffect(() => {
    const nextValue = normalizeRichTextHtml(props.value);
    const editor = editorRef.current;

    if (!editor) {
      setIsEmpty(nextValue.length === 0);
      return;
    }

    if (editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }

    setIsEmpty(nextValue.length === 0);
  }, [props.value]);

  function emitChange(): void {
    const editor = editorRef.current;
    if (!editor) return;

    const nextValue = normalizeRichTextHtml(editor.innerHTML);
    if (editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }

    setIsEmpty(nextValue.length === 0);
    props.onChange(nextValue);
  }

  function applyCommand(command: string): void {
    if (props.disabled) return;

    editorRef.current?.focus();
    document.execCommand(command);
    emitChange();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm",
        props.className,
      )}
    >
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 p-2">
        {TOOLBAR_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.command}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={action.label}
              disabled={props.disabled}
              onMouseDown={(event) => {
                event.preventDefault();
                applyCommand(action.command);
              }}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
      <div className="relative">
        {isEmpty ? (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-zinc-400">
            {props.placeholder ?? "Start typing..."}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable={!props.disabled}
          suppressContentEditableWarning
          className={cn(
            "min-h-32 px-4 py-3 text-sm leading-7 text-zinc-900 outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
            props.editorClassName,
          )}
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}
