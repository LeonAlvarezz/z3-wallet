import { Button } from "@/components/ui/button";
import ImportPrototypeModal from "@/modules/transaction/components/import-prototype/ImportPrototypeModal";
import { useState } from "react";

export default function ImportPrototypePage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
      <ImportPrototypeModal open={open} onOpenChange={setOpen} />
      <div className="w-full max-w-sm rounded-md border p-4 text-center">
        <p className="text-sm font-medium">
          PROTOTYPE - Transaction Import Flow
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Throwaway route for validating CSV format detection, field mapping,
          cutoff selection, review edits, and confirmation.
        </p>
        <Button className="mt-4" onClick={() => setOpen(true)}>
          Open Import Prototype
        </Button>
      </div>
    </div>
  );
}
