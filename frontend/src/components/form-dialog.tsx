import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface FormDialogProps {
  children: React.ReactNode;
  triggerText: string;
  formTitle: string;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  children,
  triggerText,
  formTitle,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
