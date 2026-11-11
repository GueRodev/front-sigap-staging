import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { userSchema, type UserFormValues } from "../schemas/userSchema";
import type { User } from "../types/user.types";

const fromUser = (user: User): UserFormValues => ({
  name: user.name,
  firstSurname: user.firstSurname,
  secondSurname: user.secondSurname ?? undefined,
  institutionalCode: user.institutionalCode ?? undefined,
  phone1: user.phone1,
  phone2: user.phone2 ?? undefined,
});

export const useUserDetailForm = (user: User) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: fromUser(user),
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(fromUser(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  return form;
};