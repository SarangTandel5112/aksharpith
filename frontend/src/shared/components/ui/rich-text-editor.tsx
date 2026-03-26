"use client";

import { Button } from "@shared/components/ui/button";
import { normalizeRichTextHtml } from "@shared/lib/rich-text";
import { cn } from "@shared/lib/utils";
import {
  IconBold,
  IconItalic,
  IconLink,
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

type ToolbarContent = {
  icon?: typeof IconBold;
  text?: string;
};

type ToolbarAction = {
  kind: "command" | "formatBlock" | "link";
  key: string;
  label: string;
  content: ToolbarContent;
  buttonSize?: "xs" | "icon-sm";
  command?: string;
  blockTag?: "p" | "h1" | "h2" | "h3" | "blockquote";
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    kind: "formatBlock",
    key: "paragraph",
    label: "Paragraph",
    content: { text: "P" },
    buttonSize: "xs",
    blockTag: "p",
  },
  {
    kind: "formatBlock",
    key: "heading-1",
    label: "Heading 1",
    content: { text: "H1" },
    buttonSize: "xs",
    blockTag: "h1",
  },
  {
    kind: "formatBlock",
    key: "heading-2",
    label: "Heading 2",
    content: { text: "H2" },
    buttonSize: "xs",
    blockTag: "h2",
  },
  {
    kind: "formatBlock",
    key: "heading-3",
    label: "Heading 3",
    content: { text: "H3" },
    buttonSize: "xs",
    blockTag: "h3",
  },
  {
    kind: "formatBlock",
    key: "blockquote",
    label: "Quote",
    content: { text: "Quote" },
    buttonSize: "xs",
    blockTag: "blockquote",
  },
  {
    kind: "command",
    key: "bold",
    label: "Bold",
    command: "bold",
    content: { icon: IconBold },
    buttonSize: "icon-sm",
  },
  {
    kind: "command",
    key: "italic",
    label: "Italic",
    command: "italic",
    content: { icon: IconItalic },
    buttonSize: "icon-sm",
  },
  {
    kind: "command",
    key: "underline",
    label: "Underline",
    command: "underline",
    content: { icon: IconUnderline },
    buttonSize: "icon-sm",
  },
  {
    kind: "command",
    key: "unordered-list",
    label: "Bullet List",
    command: "insertUnorderedList",
    content: { icon: IconList },
    buttonSize: "icon-sm",
  },
  {
    kind: "command",
    key: "ordered-list",
    label: "Numbered List",
    command: "insertOrderedList",
    content: { icon: IconListNumbers },
    buttonSize: "icon-sm",
  },
  {
    kind: "link",
    key: "link",
    label: "Insert Link",
    content: { icon: IconLink },
    buttonSize: "icon-sm",
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

  function applyBlockFormat(blockTag: "p" | "h1" | "h2" | "h3" | "blockquote"): void {
    if (props.disabled) return;

    editorRef.current?.focus();
    document.execCommand("formatBlock", false, `<${blockTag}>`);
    emitChange();
  }

  function saveSelection(): Range | null {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    return selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection(range: Range | null): void {
    if (!range) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function applyLink(): void {
    if (props.disabled) return;

    const savedRange = saveSelection();
    const nextHref = window.prompt("Enter a URL", "https://");

    if (!nextHref) {
      return;
    }

    restoreSelection(savedRange);
    editorRef.current?.focus();
    document.execCommand("createLink", false, nextHref.trim());
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
          const Icon = action.content.icon;

          return (
            <Button
              key={action.key}
              type="button"
              variant="ghost"
              size={action.buttonSize ?? "icon-sm"}
              aria-label={action.label}
              disabled={props.disabled}
              onMouseDown={(event) => {
                event.preventDefault();
                if (action.kind === "command" && action.command) {
                  applyCommand(action.command);
                  return;
                }

                if (action.kind === "formatBlock" && action.blockTag) {
                  applyBlockFormat(action.blockTag);
                  return;
                }

                applyLink();
              }}
            >
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <span className="text-[11px] font-semibold tracking-wide uppercase">
                  {action.content.text}
                </span>
              )}
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
          role="textbox"
          aria-label={props.placeholder ?? "Rich text editor"}
          aria-multiline="true"
          tabIndex={props.disabled ? -1 : 0}
          contentEditable={!props.disabled}
          suppressContentEditableWarning
          className={cn(
            "min-h-32 px-4 py-3 text-sm leading-7 text-zinc-900 outline-none [&_a]:font-medium [&_a]:text-zinc-900 [&_a]:underline [&_a]:decoration-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
            props.editorClassName,
          )}
          onInput={emitChange}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
}
