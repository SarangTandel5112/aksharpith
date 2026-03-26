import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";

type DeleteDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
};

export function DeleteDialog(props: DeleteDialogProps): React.JSX.Element {
  return (
    <AlertDialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) props.onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-zinc-950">
            {props.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-6 text-zinc-500">
            {props.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={props.onConfirm}
            disabled={props.isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {props.isDeleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
