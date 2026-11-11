import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { allowedUserSchema, type AllowedUserFormValues } from "../schemas/allowedUserSchema";

export const useAddUserForm = () =>
  useForm<AllowedUserFormValues>({
    resolver: zodResolver(allowedUserSchema),
    defaultValues: {
      email: "",
      baseRole: "student",
    },
    mode: "onBlur",
  });