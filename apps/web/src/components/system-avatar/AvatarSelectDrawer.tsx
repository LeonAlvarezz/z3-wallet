import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { systemAvatars } from "./avatar.catalog";
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: string | null;
  onChange?: (value: string | null) => void;
};

export default function AvatarSelectDrawer({
  open,
  onOpenChange,
  value,
  onChange,
}: Props) {
  const [selectedAvatar, setSelectedAvatar] = useState(value);

  const handleSave = async () => {
    if (!selectedAvatar) {
      return;
    }
    onChange?.(selectedAvatar);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select avatar</DrawerTitle>
          <DrawerDescription>Select system avatar.</DrawerDescription>
          {systemAvatars.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              No system avatars found.
            </div>
          ) : (
            <section className="my-6 grid grid-cols-3 gap-3">
              {systemAvatars.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <Button
                    key={String(avatar.id)}
                    type="button"
                    variant="outline"
                    className={cn("h-fit", isSelected && "ring-primary ring-2")}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    aria-pressed={isSelected}
                  >
                    <Avatar className="size-14">
                      <AvatarImage
                        src={avatar.src}
                        alt={`System avatar ${avatar.id}`}
                      />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  </Button>
                );
              })}
            </section>
          )}

          <Button
            type="button"
            className="mt-auto w-full"
            disabled={!selectedAvatar}
            onClick={handleSave}
          >
            Use this avatar
          </Button>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
