import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Shield, UserCog, UserX } from "lucide-react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import BaseRoleBadge from "../components/BaseRoleBadge";
import UserStatusBadge from "../components/UserStatusBadge";
import { BASE_ROLE_OPTIONS } from "../constants/people.constants";
import { mockRoles } from "../data/mockRoles";
import { useUserDetailForm } from "../hooks/useUserDetailForm";
import { useUserById } from "../hooks/useUsersList";
import { useUsersMutations } from "../hooks/useUsersMutations";
import type { BaseRole, User } from "../types/user.types";

const fullName = (user: User) => [user.name, user.firstSurname, user.secondSurname].filter(Boolean).join(" ");
const getBaseRole = (user: User) => user.roles.find((role) => role.roleType === "base")?.name as BaseRole | undefined;
const formatDateTime = (value: string | null) => (value ? new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—");

const PeopleUserDetailPage = () => {
  const { id } = useParams();
  const numericId = Number(id);
  const user = useUserById(Number.isFinite(numericId) ? numericId : undefined);

  if (!user) return <Navigate to="/admin/usuarios" replace />;

  return <PeopleUserDetailContent user={user} />;
};

interface PeopleUserDetailContentProps {
  user: User;
}

const PeopleUserDetailContent = ({ user }: PeopleUserDetailContentProps) => {
  const navigate = useNavigate();
  const { updateProfile, changeBaseRole, assignFunctionalRole, removeFunctionalRole, setUserStatus, anonymizeUser, isPending } = useUsersMutations();
  const [anonymizeOpen, setAnonymizeOpen] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState<"activate" | "deactivate" | null>(null);


  const form = useUserDetailForm(user);
  const baseRole = getBaseRole(user);
  const functionalRoles = user.roles.filter((role) => role.roleType === "functional");
  const assignableRoles = mockRoles.filter(
    (role) => role.roleType === "functional" && baseRole && role.compatibleBaseRoles.includes(baseRole) && !user.roles.some((current) => current.id === role.id),
  );
  const isActive = user.status === "active";

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(async (values) => {
      await updateProfile(user.id, values);
      toast({ title: "Perfil actualizado", description: "Los datos del usuario fueron guardados localmente." });
    })(event);
  };

  const handleToggleRequest = (checked: boolean) => {
    setStatusConfirm(checked ? "activate" : "deactivate");
  };

  const handleConfirmStatus = async () => {
    if (!statusConfirm) return;
    const activate = statusConfirm === "activate";
    await setUserStatus(user.id, activate ? "active" : "inactive");
    setStatusConfirm(null);
    toast({
      title: activate ? "Usuario activado" : "Usuario desactivado",
      description: activate
        ? "La persona puede volver a ingresar al sistema."
        : "La persona quedó marcada como inactiva.",
    });
  };


  const handleAnonymize = async () => {
    await anonymizeUser(user.id);
    setAnonymizeOpen(false);
    toast({ title: "Usuario anonimizado", description: "Los datos personales fueron reemplazados." });
    navigate("/admin/usuarios");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName(user)}
        description="Detalle de perfil, roles, permisos y actividad de la persona."
        icon={UserCog}
        actions={
          <Button asChild variant="outline" className="border-slate-300 font-semibold">
            <Link to="/admin/usuarios"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
          </Button>
        }
      />

      <Card className="border-slate-200 bg-[hsl(var(--sigap-sky)/0.18)]">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-sidebar">{user.email}</p>
            <p className="text-sm font-medium text-muted-foreground">Cédula {user.nationalId} · Código {user.institutionalCode ?? "—"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {baseRole && <BaseRoleBadge role={baseRole} />}
            <UserStatusBadge status={user.status} />
            <Separator orientation="vertical" className="hidden h-8 bg-slate-300 md:block" />
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-card px-3 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                {isActive ? "Activo" : "Inactivo"}
              </span>
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleRequest}
                disabled={isPending}
                className="data-[state=checked]:bg-sidebar"
                aria-label={`${isActive ? "Desactivar" : "Activar"} ${fullName(user)}`}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-card font-semibold text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => setAnonymizeOpen(true)}
              disabled={isPending}
            >
              <UserX className="mr-2 h-4 w-4" />
              Anonimizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={anonymizeOpen}
        onOpenChange={setAnonymizeOpen}
        title="Anonimizar usuario"
        description={`Esta acción reemplazará los datos personales de ${fullName(user)} por valores anónimos. No se puede deshacer.`}
        confirmLabel="Anonimizar"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleAnonymize}
      />

      <ConfirmDialog
        open={statusConfirm !== null}
        onOpenChange={(open) => !open && setStatusConfirm(null)}
        title={statusConfirm === "activate" ? "Activar usuario" : "Desactivar usuario"}
        description={
          statusConfirm === "activate"
            ? `¿Confirmas que deseas activar a ${fullName(user)}? Podrá volver a ingresar al sistema.`
            : `¿Confirmas que deseas desactivar a ${fullName(user)}? No podrá ingresar al sistema hasta que sea reactivado.`
        }
        confirmLabel={statusConfirm === "activate" ? "Activar" : "Desactivar"}
        variant={statusConfirm === "deactivate" ? "destructive" : "default"}
        isLoading={isPending}
        onConfirm={handleConfirmStatus}
      />


      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-[hsl(var(--sigap-sky)/0.18)]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="roles">Roles y permisos</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Datos personales</CardTitle>
              <CardDescription>Campos editables del perfil institucional.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="firstSurname" render={({ field }) => (
                    <FormItem><FormLabel>Primer apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="secondSurname" render={({ field }) => (
                    <FormItem><FormLabel>Segundo apellido</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="institutionalCode" render={({ field }) => (
                    <FormItem><FormLabel>Código institucional</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone1" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone2" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono secundario</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" disabled={isPending}>Guardar cambios</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Rol base</CardTitle>
                <CardDescription>Define compatibilidad de roles funcionales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={baseRole}
                  onValueChange={async (value) => {
                    await changeBaseRole(user.id, value as BaseRole);
                    toast({ title: "Rol base actualizado", description: "Se recalcularon los roles funcionales compatibles." });
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione rol base" /></SelectTrigger>
                  <SelectContent>
                    {BASE_ROLE_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-sidebar">Áreas asignadas</p>
                  <div className="flex flex-wrap gap-2">
                    {user.assignedAreas.length ? user.assignedAreas.map((area) => <Badge key={area.id} variant="secondary">{area.name}</Badge>) : <span className="text-sm text-muted-foreground">Sin áreas asignadas</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Roles funcionales y permisos</CardTitle>
                <CardDescription>Permisos derivados del cargo o asignados temporalmente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-sidebar"><Shield className="h-4 w-4" /> Roles funcionales</h3>
                  <div className="space-y-2">
                    {functionalRoles.length ? functionalRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <span className="font-semibold text-sm">{role.label}</span>
                        <Button variant="outline" size="sm" className="border-slate-300" onClick={() => void removeFunctionalRole(user.id, role.id)} disabled={isPending}>Remover</Button>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">Sin roles funcionales asignados.</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignableRoles.map((role) => (
                      <Button key={role.id} variant="outline" size="sm" className="border-slate-300 hover:bg-primary/10 hover:text-primary" onClick={() => void assignFunctionalRole(user.id, role.id)} disabled={isPending}>Asignar {role.label}</Button>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-sidebar"><KeyRound className="h-4 w-4" /> Permisos directos y temporales</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Directos</p>
                      <div className="flex flex-wrap gap-2">{user.directPermissions.length ? user.directPermissions.map((permission) => <Badge key={permission.id} variant="outline">{permission.label}</Badge>) : <span className="text-sm text-muted-foreground">Sin permisos directos</span>}</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Temporales</p>
                      <div className="space-y-2">{user.temporaryPermissions.length ? user.temporaryPermissions.map((permission) => <p key={permission.id} className="text-sm"><span className="font-semibold">{permission.permissionLabel}</span> hasta {formatDateTime(permission.expiresAt)}</p>) : <span className="text-sm text-muted-foreground">Sin permisos temporales</span>}</div>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Actividad de cuenta</CardTitle>
              <CardDescription>Resumen básico mientras se conecta auditoría real.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Email verificado</p><p className="mt-2 font-semibold text-sidebar">{formatDateTime(user.emailVerifiedAt)}</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Último ingreso</p><p className="mt-2 font-semibold text-sidebar">{formatDateTime(user.lastLoginAt)}</p></div>
              <div className="rounded-lg border border-slate-200 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Eliminación lógica</p><p className="mt-2 font-semibold text-sidebar">{formatDateTime(user.deletedAt)}</p></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PeopleUserDetailPage;