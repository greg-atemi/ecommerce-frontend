import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Loader2, RefreshCw, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  adminApi, type AdminUserResponse,
  type AdminUserCreatePayload, type AdminUserUpdatePayload,
} from "@/api/adminApi";
import { useAuth } from "@/context/AuthContext"; // adjust to your actual auth hook/path

const userSchema = z.object({
  firstName:   z.string().min(1, "First name is required"),
  lastName:    z.string().min(1, "Last name is required"),
  email:       z.string().email("Enter a valid email"),
  phoneNumber: z.string().optional(),
  password:    z.string().optional(),
  role:        z.enum(["ADMIN", "USER"]),
  isActive:    z.boolean().default(true),
});

type UserForm = z.infer<typeof userSchema>;

type RoleFilter   = "all" | "admin" | "non-admin";
type StatusFilter = "all" | "active" | "inactive";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth(); // expects { id: string, ... }
  const [users, setUsers]         = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [userDialog, setUserDialog]   = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUserResponse | null>(null);
  const [formError, setFormError]     = useState<string | null>(null);

  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phoneNumber: "",
      password: "", role: "USER", isActive: true,
    },
  });

  function load() {
    setIsLoading(true);
    setError(null);
    adminApi.getAllUsers()
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to load users."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "admin" && u.role !== "ADMIN") return false;
    if (roleFilter === "non-admin" && u.role !== "USER") return false;
    if (statusFilter === "active" && !u.isActive) return false;
    if (statusFilter === "inactive" && u.isActive) return false;
    return true;
  });

  function openCreate() {
    setEditingUser(null);
    userForm.reset({
      firstName: "", lastName: "", email: "", phoneNumber: "",
      password: "", role: "USER", isActive: true,
    });
    setFormError(null);
    setUserDialog("create");
  }

  function openEdit(user: AdminUserResponse) {
    setEditingUser(user);
    userForm.reset({
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      phoneNumber: user.phoneNumber ?? "", password: "",
      role: user.role, isActive: user.isActive,
    });
    setFormError(null);
    setUserDialog("edit");
  }

  async function onUserSubmit(data: UserForm) {
    setFormError(null);
    try {
      if (userDialog === "create") {
        if (!data.password || data.password.length < 8) {
          setFormError("Password must be at least 8 characters.");
          return;
        }
        const payload: AdminUserCreatePayload = { ...data, password: data.password };
        const { data: created } = await adminApi.createUser(payload);
        setUsers((prev) => [...prev, created]);
      } else if (editingUser) {
        const payload: AdminUserUpdatePayload = {
          ...data,
          password: data.password || undefined,
        };
        const { data: updated } = await adminApi.updateUser(editingUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
      setUserDialog(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to save user.");
    }
  }

  async function onToggleStatus(user: AdminUserResponse) {
    try {
      const { data: updated } = await adminApi.setActive(user.id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to update user status.");
    } finally {
      setStatusTarget(null);
    }
  }

  const filterButton = (
    active: boolean, label: string, onClick: () => void,
  ) => (
    <Button
      key={label}
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${filteredUsers.length} of ${users.length} users`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add user
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {filterButton(roleFilter === "all", "All roles", () => setRoleFilter("all"))}
          {filterButton(roleFilter === "admin", "Admins", () => setRoleFilter("admin"))}
          {filterButton(roleFilter === "non-admin", "Non-admins", () => setRoleFilter("non-admin"))}
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex gap-2">
          {filterButton(statusFilter === "all", "All statuses", () => setStatusFilter("all"))}
          {filterButton(statusFilter === "active", "Active", () => setStatusFilter("active"))}
          {filterButton(statusFilter === "inactive", "Inactive", () => setStatusFilter("inactive"))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No users match these filters.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-sm">
                        {user.firstName} {user.lastName}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.phoneNumber ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => openEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className={`h-8 w-8 ${user.isActive ? "text-muted-foreground hover:text-destructive" : "text-muted-foreground hover:text-primary"}`}
                          title={isSelf ? "You cannot deactivate your own account" : user.isActive ? "Deactivate" : "Reactivate"}
                          disabled={isSelf && user.isActive}
                          onClick={() => setStatusTarget(user)}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={userDialog !== null}
        onOpenChange={(open) => { if (!open) { setUserDialog(null); setFormError(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{userDialog === "create" ? "Add user" : "Edit user"}</DialogTitle>
          </DialogHeader>
          {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={userForm.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={userForm.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={userForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={userForm.control} name="phoneNumber" render={({ field }) => (
                <FormItem><FormLabel>Phone number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={userForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{userDialog === "create" ? "Password" : "New password (leave blank to keep current)"}</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={userForm.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={userForm.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-end gap-2 space-y-0 pb-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Active</FormLabel>
                  </FormItem>
                )} />
              </div>
              <Separator />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUserDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={userForm.formState.isSubmitting}>
                  {userForm.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : userDialog === "create" ? "Create user" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Deactivate / Reactivate Confirmation */}
      <AlertDialog open={statusTarget !== null} onOpenChange={(open) => { if (!open) setStatusTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusTarget?.isActive ? "Deactivate user?" : "Reactivate user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusTarget?.isActive
                ? `${statusTarget?.firstName} ${statusTarget?.lastName} will no longer be able to sign in.`
                : `${statusTarget?.firstName} ${statusTarget?.lastName} will regain access to their account.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={statusTarget?.isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => statusTarget && onToggleStatus(statusTarget)}
            >
              {statusTarget?.isActive ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}