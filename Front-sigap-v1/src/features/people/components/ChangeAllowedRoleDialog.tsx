import { FormEvent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BASE_ROLE_OPTIONS } from "../constants/people.constants";
import type { AllowedUser, BaseRole } from "../types/user.types";

interface ChangeAllowedRoleDialogProps {
  item: AllowedUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, baseRole: BaseRole) => Promise<void> | void;
  isLoading?: boolean;
}

interface FormValues { baseRole: BaseRole }

const ChangeAllowedRoleDialog = ({ item, open, onOpenChange, onSubmit, isLoading }: ChangeAllowedRoleDialogProps) => {
  const form = useForm<FormValues>({ values: { baseRole: item?.baseRole ?? "student" } });

  const handleSubmit = async (values: FormValues) => {
    if (!item) return;
    await onSubmit(item.id, values.baseRole);
    onOpenChange(false);
  };

  const handleNativeSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(handleSubmit)(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar rol base</DialogTitle>
          <DialogDescription>Actualiza el rol base asignado al correo {item?.email}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleNativeSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="baseRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol base</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccione rol base" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BASE_ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
              <Button type="submit" className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" disabled={isLoading}>Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAllowedRoleDialog;