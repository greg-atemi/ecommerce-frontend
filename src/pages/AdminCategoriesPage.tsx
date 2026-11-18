import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { adminApi, type AdminProductResponse } from "@/api/adminApi";
import { productApi, type Category } from "@/api/productApi";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type CategoryForm = z.infer<typeof categorySchema>;

function productCountByCategory(products: AdminProductResponse[]) {
  const map: Record<number, number> = {};
  for (const product of products) {
    for (const cat of product.categories ?? []) {
      map[cat.id] = (map[cat.id] ?? 0) + 1;
    }
  }
  return map;
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts]     = useState<AdminProductResponse[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [categoryDialog, setCategoryDialog]   = useState<"create" | "edit" | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget]       = useState<Category | null>(null);
  const [formError, setFormError]             = useState<string | null>(null);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const categoryForm = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", imageUrl: "" },
  });

  function load() {
    setIsLoading(true);
    setError(null);
    Promise.all([productApi.getCategories(), adminApi.getAllProducts()])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        setProducts(prodRes.data);
      })
      .catch(() => setError("Failed to load categories."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  const catCounts = productCountByCategory(products);

  function openCreate() {
    setEditingCategory(null);
    categoryForm.reset({ name: "", imageUrl: "" });
    setFormError(null);
    setCategoryDialog("create");
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    categoryForm.reset({ name: category.name, imageUrl: category.imageUrl ?? "" });
    setFormError(null);
    setCategoryDialog("edit");
  }

  async function onCategorySubmit(data: CategoryForm) {
    setFormError(null);
    const payload = { name: data.name, imageUrl: data.imageUrl || undefined };
    try {
      if (categoryDialog === "create") {
        const { data: created } = await adminApi.createCategory(payload);
        setCategories((prev) => [...prev, created]);
      } else if (editingCategory) {
        const { data: updated } = await adminApi.updateCategory(editingCategory.id, payload);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
      setCategoryDialog(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to save category.");
    }
  }

  async function onDeleteCategory(category: Category) {
    setDeleteError(null);
    try {
      await adminApi.deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.message ?? "Failed to delete category.");
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${categories.length} categories`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add category
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : categories.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden group relative">
              <div className="aspect-video w-full bg-muted">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary" size="icon" className="h-7 w-7"
                    onClick={() => openEdit(category)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="secondary" size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => { setDeleteTarget(category); setDeleteError(null); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm truncate">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {catCounts[category.id] ?? 0} product{(catCounts[category.id] ?? 0) === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={categoryDialog !== null}
        onOpenChange={(open) => { if (!open) { setCategoryDialog(null); setFormError(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{categoryDialog === "create" ? "Add category" : "Edit category"}</DialogTitle>
          </DialogHeader>
          {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField control={categoryForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={categoryForm.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCategoryDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
                  {categoryForm.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : categoryDialog === "create" ? "Create category" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. If products are still assigned to this category, the delete will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <Alert variant="destructive"><AlertDescription>{deleteError}</AlertDescription></Alert>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); deleteTarget && onDeleteCategory(deleteTarget); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}