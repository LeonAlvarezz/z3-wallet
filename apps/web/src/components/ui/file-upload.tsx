"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileCogIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
} from "lucide-react";
import * as React from "react";

const ROOT_NAME = "FileUpload";
const DROPZONE_NAME = "FileUploadDropzone";
const TRIGGER_NAME = "FileUploadTrigger";
const LIST_NAME = "FileUploadList";
const ITEM_NAME = "FileUploadItem";
const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
const ITEM_METADATA_NAME = "FileUploadItemMetadata";
const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
const ITEM_DELETE_NAME = "FileUploadItemDelete";
const CLEAR_NAME = "FileUploadClear";

const FILE_UPLOAD_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [DROPZONE_NAME]: `\`${DROPZONE_NAME}\` must be within \`${ROOT_NAME}\``,
  [TRIGGER_NAME]: `\`${TRIGGER_NAME}\` must be within \`${ROOT_NAME}\``,
  [LIST_NAME]: `\`${LIST_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_PREVIEW_NAME]: `\`${ITEM_PREVIEW_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_METADATA_NAME]: `\`${ITEM_METADATA_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_PROGRESS_NAME]: `\`${ITEM_PROGRESS_NAME}\` must be within \`${ITEM_NAME}\``,
  [ITEM_DELETE_NAME]: `\`${ITEM_DELETE_NAME}\` must be within \`${ITEM_NAME}\``,
  [CLEAR_NAME]: `\`${CLEAR_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);
  if (ref.current === null) {
    ref.current = fn();
  }
  return ref as React.RefObject<T>;
}

type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface FileState {
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
}

interface StoreState {
  files: Map<File, FileState>;
  dragOver: boolean;
  invalid: boolean;
}

type StoreAction =
  | { variant: "ADD_FILES"; files: File[] }
  | { variant: "SET_FILES"; files: File[] }
  | { variant: "SET_PROGRESS"; file: File; progress: number }
  | { variant: "SET_SUCCESS"; file: File }
  | { variant: "SET_ERROR"; file: File; error: string }
  | { variant: "REMOVE_FILE"; file: File }
  | { variant: "SET_DRAG_OVER"; dragOver: boolean }
  | { variant: "SET_INVALID"; invalid: boolean }
  | { variant: "CLEAR" };

function createStore(
  listeners: Set<() => void>,
  files: Map<File, FileState>,
  onValueChange?: (files: File[]) => void,
  invalid?: boolean,
) {
  const initialState: StoreState = {
    files,
    dragOver: false,
    invalid: invalid ?? false,
  };

  let state = initialState;

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.variant) {
      case "ADD_FILES": {
        for (const file of action.files) {
          files.set(file, {
            file,
            progress: 0,
            status: "idle",
          });
        }

        if (onValueChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_FILES": {
        const newFileSet = new Set(action.files);
        for (const existingFile of files.keys()) {
          if (!newFileSet.has(existingFile)) {
            files.delete(existingFile);
          }
        }

        for (const file of action.files) {
          const existingState = files.get(file);
          if (!existingState) {
            files.set(file, {
              file,
              progress: 0,
              status: "idle",
            });
          }
        }
        return { ...state, files };
      }

      case "SET_PROGRESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: action.progress,
            status: "uploading",
          });
        }
        return { ...state, files };
      }

      case "SET_SUCCESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: 100,
            status: "success",
          });
        }
        return { ...state, files };
      }

      case "SET_ERROR": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            error: action.error,
            status: "error",
          });
        }
        return { ...state, files };
      }

      case "REMOVE_FILE": {
        files.delete(action.file);

        if (onValueChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }

      case "SET_INVALID": {
        return { ...state, invalid: action.invalid };
      }

      case "CLEAR": {
        files.clear();
        if (onValueChange) {
          onValueChange([]);
        }
        return { ...state, files, invalid: false };
      }

      default:
        return state;
    }
  }

  function getState() {
    return state;
  }

  function dispatch(action: StoreAction) {
    state = reducer(state, action);
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, dispatch, subscribe };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(
  null,
);
StoreContext.displayName = ROOT_NAME;

function useStoreContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext(ROOT_NAME);

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
    () => null,
  );

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface FileUploadContextValue {
  inputId: string;
  dropzoneId: string;
  listId: string;
  labelId: string;
  disabled: boolean;
  dir: Direction;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFilesChange: (files: File[]) => void;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
  null,
);

function useFileUploadContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

interface FileUploadRootProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
}

const FileUploadRoot = React.forwardRef<HTMLDivElement, FileUploadRootProps>(
  (props, forwardedRef) => {
    const {
      value,
      defaultValue,
      onValueChange,
      onAccept,
      onFileAccept,
      onFileReject,
      onFileValidate,
      onUpload,
      accept,
      maxFiles,
      maxSize,
      dir: dirProp,
      label,
      name,
      asChild,
      disabled = false,
      invalid = false,
      multiple = false,
      required = false,
      children,
      className,
      ...rootProps
    } = props;

    const inputId = React.useId();
    const dropzoneId = React.useId();
    const listId = React.useId();
    const labelId = React.useId();

    const dir = useDirection(dirProp);
    const listeners = useLazyRef(() => new Set<() => void>()).current;
    const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;

    const store = React.useMemo(
      () => createStore(listeners, files, onValueChange, invalid),
      [listeners, files, onValueChange, invalid],
    );

    React.useEffect(() => {
      if (isControlled) {
        store.dispatch({ variant: "SET_FILES", files: value });
      } else if (
        defaultValue &&
        defaultValue.length > 0 &&
        !store.getState().files.size
      ) {
        store.dispatch({ variant: "SET_FILES", files: defaultValue });
      }
    }, [value, defaultValue, isControlled, store]);

    async function onFilesUpload(files: File[]) {
      try {
        for (const file of files) {
          store.dispatch({ variant: "SET_PROGRESS", file, progress: 0 });
        }

        if (onUpload) {
          await onUpload(files, {
            onProgress: (file, progress) => {
              store.dispatch({
                variant: "SET_PROGRESS",
                file,
                progress: Math.min(Math.max(0, progress), 100),
              });
            },
            onSuccess: (file) => {
              store.dispatch({ variant: "SET_SUCCESS", file });
            },
            onError: (file, error) => {
              store.dispatch({
                variant: "SET_ERROR",
                file,
                error: error.message ?? "Upload failed",
              });
            },
          });
        } else {
          for (const file of files) {
            store.dispatch({ variant: "SET_SUCCESS", file });
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        for (const file of files) {
          store.dispatch({
            variant: "SET_ERROR",
            file,
            error: errorMessage,
          });
        }
      }
    }

    function onFilesChange(originalFiles: File[]) {
      if (disabled) return;

      let filesToProcess = [...originalFiles];
      let invalid = false;

      if (maxFiles) {
        const currentCount = store.getState().files.size;
        const remainingSlotCount = Math.max(0, maxFiles - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          invalid = true;

          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            let rejectionMessage = `Maximum ${maxFiles} files allowed`;

            if (onFileValidate) {
              const validationMessage = onFileValidate(file);
              if (validationMessage) {
                rejectionMessage = validationMessage;
              }
            }

            onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];

      for (const file of filesToProcess) {
        let rejected = false;
        let rejectionMessage = "";

        if (onFileValidate) {
          const validationMessage = onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
            onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
            continue;
          }
        }

        if (accept) {
          const acceptTypes = accept.split(",").map((t) => t.trim());
          const fileType = file.type;
          const fileExtension = `.${file.name.split(".").pop()}`;

          if (
            !acceptTypes.some(
              (type) =>
                type === fileType ||
                type === fileExtension ||
                (type.includes("/*") &&
                  fileType.startsWith(type.replace("/*", "/"))),
            )
          ) {
            rejectionMessage = "File type not accepted";
            onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
          }
        }

        if (maxSize && file.size > maxSize) {
          rejectionMessage = "File too large";
          onFileReject?.(file, rejectionMessage);
          rejected = true;
          invalid = true;
        }

        if (!rejected) {
          acceptedFiles.push(file);
        }
      }

      if (invalid) {
        store.dispatch({ variant: "SET_INVALID", invalid });
        setTimeout(() => {
          store.dispatch({ variant: "SET_INVALID", invalid: false });
        }, 2000);
      }

      if (acceptedFiles.length > 0) {
        store.dispatch({ variant: "ADD_FILES", files: acceptedFiles });

        if (isControlled && onValueChange) {
          const currentFiles = Array.from(store.getState().files.values()).map(
            (fileState) => fileState.file,
          );
          onValueChange([...currentFiles]);
        }

        onAccept?.(acceptedFiles);

        for (const file of acceptedFiles) {
          onFileAccept?.(file);
        }

        if (onUpload) {
          requestAnimationFrame(() => {
            onFilesUpload(acceptedFiles);
          });
        }
      }
    }

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      const files = Array.from(event.target.files ?? []);
      onFilesChange(files);
      event.target.value = "";
    }

    const RootPrimitive = asChild ? Slot : "div";
    const contextValue: FileUploadContextValue = {
      dropzoneId,
      inputId,
      listId,
      labelId,
      dir,
      disabled,
      inputRef,
      onFilesChange,
    };

    return (
      <DirectionContext.Provider value={dir}>
        <StoreContext.Provider value={store}>
          <FileUploadContext.Provider value={contextValue}>
            <RootPrimitive
              data-disabled={disabled ? "" : undefined}
              data-slot="file-upload"
              dir={dir}
              {...rootProps}
              ref={forwardedRef}
              className={cn("relative flex flex-col gap-2", className)}
            >
              {children}
              <input
                type="file"
                id={inputId}
                aria-labelledby={labelId}
                aria-describedby={dropzoneId}
                ref={inputRef}
                tabIndex={-1}
                accept={accept}
                name={name}
                disabled={disabled}
                multiple={multiple}
                required={required}
                className="sr-only"
                onChange={onInputChange}
              />
              <span id={labelId} className="sr-only">
                {label ?? "File upload"}
              </span>
            </RootPrimitive>
          </FileUploadContext.Provider>
        </StoreContext.Provider>
      </DirectionContext.Provider>
    );
  },
);
FileUploadRoot.displayName = ROOT_NAME;

interface FileUploadDropzoneProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadDropzone = React.forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>((props, forwardedRef) => {
  const { asChild, className, ...dropzoneProps } = props;

  const context = useFileUploadContext(DROPZONE_NAME);
  const store = useStoreContext(DROPZONE_NAME);
  const dragOver = useStore((state) => state.dragOver);
  const invalid = useStore((state) => state.invalid);

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    dropzoneProps.onClick?.(event);

    if (event.defaultPrevented) return;

    const target = event.target;

    const isFromTrigger =
      target instanceof HTMLElement &&
      target.closest('[data-slot="file-upload-trigger"]');

    if (!isFromTrigger) {
      context.inputRef.current?.click();
    }
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    dropzoneProps.onDragOver?.(event);

    if (event.defaultPrevented) return;

    event.preventDefault();
    store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
  }

  function onDragEnter(event: React.DragEvent<HTMLDivElement>) {
    dropzoneProps.onDragEnter?.(event);

    if (event.defaultPrevented) return;

    event.preventDefault();
    store.dispatch({ variant: "SET_DRAG_OVER", dragOver: true });
  }

  function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
    dropzoneProps.onDragLeave?.(event);

    if (event.defaultPrevented) return;

    event.preventDefault();
    store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    dropzoneProps.onDrop?.(event);

    if (event.defaultPrevented) return;

    event.preventDefault();
    store.dispatch({ variant: "SET_DRAG_OVER", dragOver: false });
    context.onFilesChange(Array.from(event.dataTransfer.files));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    dropzoneProps.onKeyDown?.(event);

    if (
      !event.defaultPrevented &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      context.inputRef.current?.click();
    }
  }

  const DropzonePrimitive = asChild ? Slot : "div";

  return (
    <DropzonePrimitive
      role="region"
      id={context.dropzoneId}
      aria-controls={`${context.inputId} ${context.listId}`}
      aria-disabled={context.disabled}
      aria-invalid={invalid}
      data-disabled={context.disabled ? "" : undefined}
      data-dragging={dragOver ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="file-upload-dropzone"
      dir={context.dir}
      {...dropzoneProps}
      ref={forwardedRef}
      tabIndex={context.disabled ? undefined : 0}
      className={cn(
        "hover:bg-accent/30 focus-visible:border-ring/50 data-dragging:border-primary data-invalid:border-destructive data-invalid:ring-destructive/20 relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors outline-none select-none data-disabled:pointer-events-none",
        className,
      )}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
    />
  );
});
FileUploadDropzone.displayName = DROPZONE_NAME;

interface FileUploadTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const FileUploadTrigger = React.forwardRef<
  HTMLButtonElement,
  FileUploadTriggerProps
>((props, forwardedRef) => {
  const { asChild, ...triggerProps } = props;
  const context = useFileUploadContext(TRIGGER_NAME);

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    triggerProps.onClick?.(event);

    if (event.defaultPrevented) return;

    context.inputRef.current?.click();
  }

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <TriggerPrimitive
      type="button"
      aria-controls={context.inputId}
      data-disabled={context.disabled ? "" : undefined}
      data-slot="file-upload-trigger"
      {...triggerProps}
      ref={forwardedRef}
      disabled={context.disabled}
      onClick={onClick}
    />
  );
});
FileUploadTrigger.displayName = TRIGGER_NAME;

interface FileUploadListProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  asChild?: boolean;
  forceMount?: boolean;
}

const FileUploadList = React.forwardRef<HTMLDivElement, FileUploadListProps>(
  (props, forwardedRef) => {
    const {
      className,
      orientation = "vertical",
      asChild,
      forceMount,
      ...listProps
    } = props;

    const context = useFileUploadContext(LIST_NAME);

    const hasFiles = useStore((state) => state.files.size > 0);
    const shouldRender = forceMount || hasFiles;

    if (!shouldRender) return null;

    const ListPrimitive = asChild ? Slot : "div";

    return (
      <ListPrimitive
        role="list"
        id={context.listId}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="file-upload-list"
        data-state={shouldRender ? "active" : "inactive"}
        dir={context.dir}
        {...listProps}
        ref={forwardedRef}
        className={cn(
          "data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:slide-out-to-top-2 data-[state=active]:slide-in-from-top-2 data-[state=active]:animate-in data-[state=inactive]:animate-out flex flex-col gap-2",
          orientation === "horizontal" && "flex-row overflow-x-auto p-1.5",
          className,
        )}
      />
    );
  },
);
FileUploadList.displayName = LIST_NAME;

interface FileUploadItemContextValue {
  id: string;
  fileState: FileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
}

const FileUploadItemContext =
  React.createContext<FileUploadItemContextValue | null>(null);

function useFileUploadItemContext(name: keyof typeof FILE_UPLOAD_ERRORS) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(FILE_UPLOAD_ERRORS[name]);
  }
  return context;
}

interface FileUploadItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: File;
  asChild?: boolean;
}

const FileUploadItem = React.forwardRef<HTMLDivElement, FileUploadItemProps>(
  (props, forwardedRef) => {
    const { value, asChild, className, ...itemProps } = props;

    const id = React.useId();
    const statusId = `${id}-status`;
    const nameId = `${id}-name`;
    const sizeId = `${id}-size`;
    const messageId = `${id}-message`;

    const context = useFileUploadContext(ITEM_NAME);
    const fileState = useStore((state) => state.files.get(value));
    const fileCount = useStore((state) => state.files.size);
    const fileIndex = useStore((state) => {
      const files = Array.from(state.files.keys());
      return files.indexOf(value) + 1;
    });

    const itemContext: FileUploadItemContextValue = {
      id,
      fileState,
      nameId,
      sizeId,
      statusId,
      messageId,
    };

    if (!fileState) return null;

    const statusText = fileState.error
      ? `Error: ${fileState.error}`
      : fileState.status === "uploading"
        ? `Uploading: ${fileState.progress}% complete`
        : fileState.status === "success"
          ? "Upload complete"
          : "Ready to upload";

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <FileUploadItemContext.Provider value={itemContext}>
        <ItemPrimitive
          role="listitem"
          id={id}
          aria-setsize={fileCount}
          aria-posinset={fileIndex}
          aria-describedby={`${nameId} ${sizeId} ${statusId} ${
            fileState.error ? messageId : ""
          }`}
          aria-labelledby={nameId}
          data-slot="file-upload-item"
          dir={context.dir}
          {...itemProps}
          ref={forwardedRef}
          className={cn(
            "as-[[data-slot=file-upload-progress]]:flex-col relative flex items-center gap-2.5 rounded-md border p-3 has-data-[slot=file-upload-progress]:items-start",
            className,
          )}
        >
          {props.children}
          <span id={statusId} className="sr-only">
            {statusText}
          </span>
        </ItemPrimitive>
      </FileUploadItemContext.Provider>
    );
  },
);
FileUploadItem.displayName = ITEM_NAME;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("video/")) {
    return <FileVideoIcon />;
  }

  if (type.startsWith("audio/")) {
    return <FileAudioIcon />;
  }

  if (
    type.startsWith("text/") ||
    ["txt", "md", "rtf", "pdf"].includes(extension)
  ) {
    return <FileTextIcon />;
  }

  if (
    [
      "html",
      "css",
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "xml",
      "php",
      "py",
      "rb",
      "java",
      "c",
      "cpp",
      "cs",
    ].includes(extension)
  ) {
    return <FileCodeIcon />;
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return <FileArchiveIcon />;
  }

  if (
    ["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) ||
    type.startsWith("application/")
  ) {
    return <FileCogIcon />;
  }

  return <FileIcon />;
}

interface FileUploadItemPreviewProps extends React.ComponentPropsWithoutRef<"div"> {
  render?: (file: File) => React.ReactNode;
  asChild?: boolean;
}

const FileUploadItemPreview = React.forwardRef<
  HTMLDivElement,
  FileUploadItemPreviewProps
>((props, forwardedRef) => {
  const { render, asChild, children, className, ...previewProps } = props;

  const itemContext = useFileUploadItemContext(ITEM_PREVIEW_NAME);

  const isImage = itemContext.fileState?.file.type.startsWith("image/");

  if (!itemContext.fileState) return null;

  const preview = render ? (
    render(itemContext.fileState.file)
  ) : isImage ? (
    <img
      src={URL.createObjectURL(itemContext.fileState.file)}
      alt={itemContext.fileState.file.name}
      className="size-full rounded object-cover"
      onLoad={(event) => {
        if (!(event.target instanceof HTMLImageElement)) return;
        URL.revokeObjectURL(event.target.src);
      }}
    />
  ) : (
    getFileIcon(itemContext.fileState.file)
  );

  const ItemPreviewPrimitive = asChild ? Slot : "div";

  return (
    <ItemPreviewPrimitive
      aria-labelledby={itemContext.nameId}
      data-slot="file-upload-preview"
      {...previewProps}
      ref={forwardedRef}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-md",
        isImage ? "object-cover" : "bg-accent/50 [&>svg]:size-7",
        className,
      )}
    >
      {preview}
      {children}
    </ItemPreviewPrimitive>
  );
});
FileUploadItemPreview.displayName = ITEM_PREVIEW_NAME;

interface FileUploadItemMetadataProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const FileUploadItemMetadata = React.forwardRef<
  HTMLDivElement,
  FileUploadItemMetadataProps
>((props, forwardedRef) => {
  const { asChild, children, className, ...metadataProps } = props;

  const context = useFileUploadContext(ITEM_METADATA_NAME);
  const itemContext = useFileUploadItemContext(ITEM_METADATA_NAME);

  if (!itemContext.fileState) return null;

  const ItemMetadataPrimitive = asChild ? Slot : "div";

  return (
    <ItemMetadataPrimitive
      data-slot="file-upload-metadata"
      dir={context.dir}
      {...metadataProps}
      ref={forwardedRef}
      className={cn(
        "mobile:max-w-full flex max-w-30 min-w-0 flex-1 flex-col",
        className,
      )}
    >
      {children ?? (
        <>
          <span
            id={itemContext.nameId}
            className="truncate text-sm font-medium"
          >
            {itemContext.fileState.file.name}
          </span>
          <span
            id={itemContext.sizeId}
            className="text-muted-foreground text-xs"
          >
            {formatBytes(itemContext.fileState.file.size)}
          </span>
          {itemContext.fileState.error && (
            <span
              id={itemContext.messageId}
              className="text-destructive text-xs"
            >
              {itemContext.fileState.error}
            </span>
          )}
        </>
      )}
    </ItemMetadataPrimitive>
  );
});
FileUploadItemMetadata.displayName = ITEM_METADATA_NAME;

interface FileUploadItemProgressProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  circular?: boolean;
  size?: number;
}

const FileUploadItemProgress = React.forwardRef<
  HTMLDivElement,
  FileUploadItemProgressProps
>((props, forwardedRef) => {
  const { circular, size = 40, asChild, className, ...progressProps } = props;

  const itemContext = useFileUploadItemContext(ITEM_PROGRESS_NAME);

  if (!itemContext.fileState) return null;

  const ItemProgressPrimitive = asChild ? Slot : "div";

  if (circular) {
    if (itemContext.fileState.status === "success") return null;

    const circumference = 2 * Math.PI * ((size - 4) / 2);
    const strokeDashoffset =
      circumference - (itemContext.fileState.progress / 100) * circumference;

    return (
      <ItemProgressPrimitive
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={itemContext.fileState.progress}
        aria-valuetext={`${itemContext.fileState.progress}%`}
        aria-labelledby={itemContext.nameId}
        data-slot="file-upload-progress"
        {...progressProps}
        ref={forwardedRef}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          className,
        )}
      >
        <svg
          className="-rotate-90 transform"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          stroke="currentColor"
        >
          <circle
            className="text-primary/20"
            strokeWidth="2"
            cx={size / 2}
            cy={size / 2}
            r={(size - 4) / 2}
          />
          <circle
            className="text-primary transition-all"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            cx={size / 2}
            cy={size / 2}
            r={(size - 4) / 2}
          />
        </svg>
      </ItemProgressPrimitive>
    );
  }

  return (
    <ItemProgressPrimitive
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={itemContext.fileState.progress}
      aria-valuetext={`${itemContext.fileState.progress}%`}
      aria-labelledby={itemContext.nameId}
      data-slot="file-upload-progress"
      {...progressProps}
      ref={forwardedRef}
      className={cn(
        "bg-primary/20 relative h-1.5 w-full overflow-hidden rounded-full",
        className,
      )}
    >
      <div
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - itemContext.fileState.progress}%)`,
        }}
      />
    </ItemProgressPrimitive>
  );
});
FileUploadItemProgress.displayName = ITEM_PROGRESS_NAME;

interface FileUploadItemDeleteProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

const FileUploadItemDelete = React.forwardRef<
  HTMLButtonElement,
  FileUploadItemDeleteProps
>((props, forwardedRef) => {
  const { asChild, ...deleteProps } = props;

  const store = useStoreContext(ITEM_DELETE_NAME);
  const itemContext = useFileUploadItemContext(ITEM_DELETE_NAME);

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    deleteProps.onClick?.(event);

    if (!itemContext.fileState || event.defaultPrevented) return;

    store.dispatch({
      variant: "REMOVE_FILE",
      file: itemContext.fileState.file,
    });
  }

  if (!itemContext.fileState) return null;

  const ItemDeletePrimitive = asChild ? Slot : "button";

  return (
    <ItemDeletePrimitive
      type="button"
      aria-controls={itemContext.id}
      aria-describedby={itemContext.nameId}
      data-slot="file-upload-item-delete"
      {...deleteProps}
      ref={forwardedRef}
      onClick={onClick}
    />
  );
});
FileUploadItemDelete.displayName = ITEM_DELETE_NAME;

interface FileUploadClearProps extends React.ComponentPropsWithoutRef<"button"> {
  forceMount?: boolean;
  asChild?: boolean;
}

const FileUploadClear = React.forwardRef<
  HTMLButtonElement,
  FileUploadClearProps
>((props, forwardedRef) => {
  const { asChild, forceMount, disabled, ...clearProps } = props;

  const context = useFileUploadContext(CLEAR_NAME);
  const store = useStoreContext(CLEAR_NAME);

  const isDisabled = disabled || context.disabled;
  const hasFiles = useStore((state) => state.files.size > 0);

  function onClick(event: React.MouseEvent<HTMLButtonElement>) {
    clearProps.onClick?.(event);

    if (event.defaultPrevented) return;

    store.dispatch({ variant: "CLEAR" });
  }

  const shouldRender = forceMount || hasFiles;

  if (!shouldRender) return null;

  const ClearPrimitive = asChild ? Slot : "button";

  return (
    <ClearPrimitive
      type="button"
      aria-controls={context.listId}
      data-slot="file-upload-clear"
      data-disabled={isDisabled ? "" : undefined}
      {...clearProps}
      ref={forwardedRef}
      disabled={isDisabled}
      onClick={onClick}
    />
  );
});
FileUploadClear.displayName = CLEAR_NAME;

const FileUpload = FileUploadRoot;
const Root = FileUploadRoot;
const Trigger = FileUploadTrigger;
const Dropzone = FileUploadDropzone;
const List = FileUploadList;
const Item = FileUploadItem;
const ItemPreview = FileUploadItemPreview;
const ItemMetadata = FileUploadItemMetadata;
const ItemProgress = FileUploadItemProgress;
const ItemDelete = FileUploadItemDelete;
const Clear = FileUploadClear;

export {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemProgress,
  FileUploadItemDelete,
  FileUploadClear,
  //
  Root,
  Dropzone,
  Trigger,
  List,
  Item,
  ItemPreview,
  ItemMetadata,
  ItemProgress,
  ItemDelete,
  Clear,
};
