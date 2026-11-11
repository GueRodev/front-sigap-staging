import { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BASE_ROLE_OPTIONS } from "../constants/people.constants";
import { useAddUserForm } from "../hooks/useAddUserForm";
import type { AllowedUserFormValues } from "../schemas/allowedUserSchema";

interface AddAllowedUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AllowedUserFormValues) => Promise<void> | void;
  isLoading?: boolean;
}

const AddAllowedUserDialog = ({ open, onOpenChange, onSubmit, isLoading }: AddAllowedUserDialogProps) => {
  const form = useAddUserForm();

  const handleSubmit = async (values: AllowedUserFormValues) => {
    await onSubmit(values);
    form.reset();
    onOpenChange(false);
  };

  const handleNativeSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(handleSubmit)(event);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar usuario permitido</DialogTitle>
          <DialogDescription>Autoriza un correo institucional para que pueda completar su registro en SIGAP.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleNativeSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email institucional</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre.apellido@ucr.ac.cr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol base</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="submit" className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" disabled={isLoading}>Agregar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAllowedUserDialog;