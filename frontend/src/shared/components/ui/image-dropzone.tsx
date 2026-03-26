"use client";

import { Button } from "@shared/components/ui/button";
import { cn } from "@shared/lib/utils";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import type React from "react";
import { useId, useRef, useState } from "react";

type ImageDropzoneProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  emptyLabel?: string;
  helperText?: string;
  className?: string;
};

export function ImageDropzone(
  props: ImageDropzoneProps,
): React.JSX.Element {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openPicker(): void {
    if (props.disabled) return;
    inputRef.current?.click();
  }

  function readFile(file: File | undefined): void {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      props.onChange(typeof result === "string" ? result : null);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    readFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    if (props.disabled) return;

    setIsDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={cn("space-y-3", props.className)}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        role="button"
        tabIndex={props.disabled ? -1 : 0}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!props.disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group overflow-hidden rounded-2xl border border-dashed bg-zinc-50 transition-colors",
          props.disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-zinc-400 hover:bg-zinc-100/70",
          isDragging ? "border-zinc-500 bg-zinc-100" : "border-zinc-300",
        )}
      >
        {props.value ? (
          <div className="space-y-3 p-3">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.value}
                alt="Uploaded preview"
                className="h-48 w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-1">
              <p className="text-sm text-zinc-500">
                Drop a new image to replace this photo.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={props.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  props.onChange(null);
                }}
              >
                <IconTrash className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
            <div className="rounded-full border border-zinc-200 bg-white p-3 text-zinc-500 shadow-sm">
              <IconPhoto className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">
                {props.emptyLabel ?? "Drop an image here or click to upload"}
              </p>
              <p className="text-sm text-zinc-500">
                {props.helperText ?? "PNG, JPG, and WEBP work well here."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={props.disabled}
              onClick={(event) => {
                event.stopPropagation();
                openPicker();
              }}
            >
              <IconUpload className="h-4 w-4" />
              Upload Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
