import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2, PackagePlus, RefreshCw } from "lucide-react";
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
import { adminApi, type AdminProductResponse, type AdminProductPayload } from "@/api/adminApi";
import { productApi, type Category } from "@/api/productApi";
import { formatPrice } from "@/data/products";

const productSchema = z.object({
  name:           z.string().min(1, "Name is required"),
  brand:          z.string().optional(),
  description:    z.string().min(1, "Description is required"),
  price:          z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().optional(),
  imageUrl:       z.string().url("Enter a valid URL").optional().or(z.literal("")),
  available:      z.boolean().default(true),
  quantity:       z.coerce.number().min(0),
  categoryIds:    z.array(z.number()).min(1, "Select at least one category"),
});

const stockSchema = z.object({
  quantity: z.coerce.number().min(0, "Must be 0 or more"),
});

type ProductForm = z.infer<typeof productSchema>;
type StockForm   = z.infer<typeof stockSchema>;

export function AdminProductsPage() {
  const [products, setProducts]     = useState<AdminProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [productDialog, setProductDialog] = useState<"create" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProductResponse | null>(null);
  const [stockProduct, setStockProduct]   = useState<AdminProductResponse | null>(null);
  const [deleteId, setDeleteId]           = useState<number | null>(null);
  const [formError, setFormError]         = useState<string | null>(null);

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", brand: "", description: "", price: 0, quantity: 0, available: true, categoryIds: [] },
  });

  const stockForm = useForm<StockForm>({
    resolver: zodResolver(stockSchema),
    defaultValues: { quantity: 0 },
  });

  function load() {
    setIsLoading(true);
    setError(null);
    Promise.all([adminApi.getAllProducts(), productApi.getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data);
        setCategories(catRes.data);
      })
      .catch(() => setError("Failed to load products."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingProduct(null);
    productForm.reset({ name: "", brand: "", description: "", price: 0, quantity: 0, available: true, categoryIds: [] });
    setFormError(null);
    setProductDialog("create");
  }

  function openEdit(product: AdminProductResponse) {
    setEditingProduct(product);
    productForm.reset({
      name: product.name, brand: product.brand ?? "",
      description: product.description, price: product.price,
      compareAtPrice: product.compareAtPrice, imageUrl: product.imageUrl ?? "",
      available: product.available, quantity: product.quantity,
      categoryIds: product.categories?.map((c) => c.id) ?? [],
    });
    setFormError(null);
    setProductDialog("edit");
  }

  async function onProductSubmit(data: ProductForm) {
    setFormError(null);
    const payload: AdminProductPayload = {
      ...data,
      imageUrl:       data.imageUrl       || undefined,
      compareAtPrice: data.compareAtPrice || undefined,
    };
    try {
      if (productDialog === "create") {
        const { data: created } = await adminApi.createProduct(payload);
        setProducts((prev) => [...prev, created]);
      } else if (editingProduct) {
        const { data: updated } = await adminApi.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      }
      setProductDialog(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to save product.");
    }
  }

  async function onDelete(id: number) {
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete product.");
    } finally {
      setDeleteId(null);
    }
  }

  async function onStockSubmit(data: StockForm) {
    if (!stockProduct) return;
    try {
      const { data: updated } = await adminApi.updateStock(stockProduct.id, data.quantity);
      setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setStockProduct(null);
      stockForm.reset();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to update stock.");
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${products.length} products`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add product
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
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name}
                          className="h-10 w-10 rounded object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.categories && product.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((c) => (
                          <Badge key={c.id} variant="outline" className="font-normal">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-medium text-sm">{formatPrice(product.price)}</p>
                    {product.compareAtPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium text-sm ${product.quantity <= 5 ? "text-destructive" : ""}`}>
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isAvailable ? "default" : "secondary"}>
                      {product.isAvailable ? "Available" : "Not Available"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Update stock"
                        onClick={() => { setStockProduct(product); stockForm.reset({ quantity: product.quantity }); setFormError(null); }}>
                        <PackagePlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={productDialog !== null}
        onOpenChange={(open) => { if (!open) { setProductDialog(null); setFormError(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productDialog === "create" ? "Add product" : "Edit product"}</DialogTitle>
          </DialogHeader>
          {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={productForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={productForm.control} name="brand" render={({ field }) => (
                  <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={productForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={productForm.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (KSh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={productForm.control} name="compareAtPrice" render={({ field }) => (
                  <FormItem><FormLabel>Compare at price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={productForm.control} name="categoryIds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <div>
                      <div className="flex flex-wrap gap-3 rounded-md border border-input p-3">
                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No categories available.</p>
                        ) : (
                          categories.map((c) => {
                            const checked = field.value.includes(c.id);
                            return (
                              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={checked}
                                  onChange={(e) => {
                                    field.onChange(
                                      e.target.checked
                                        ? [...field.value, c.id]
                                        : field.value.filter((id) => id !== c.id)
                                    );
                                  }}
                                />
                                {c.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Create new categories <a href="/admin/categories" className="text-primary underline">Here</a>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={productForm.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={productForm.control} name="available" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Available for sale</FormLabel>
                </FormItem>
              )} />
              <Separator />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProductDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={productForm.formState.isSubmitting}>
                  {productForm.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : productDialog === "create" ? "Create product" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={stockProduct !== null}
        onOpenChange={(open) => { if (!open) { setStockProduct(null); setFormError(null); } }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Update stock — {stockProduct?.name}</DialogTitle>
          </DialogHeader>
          {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
          <p className="text-sm text-muted-foreground">
            Current stock: <span className="font-medium text-foreground">{stockProduct?.quantity}</span>
          </p>
          <Form {...stockForm}>
            <form onSubmit={stockForm.handleSubmit(onStockSubmit)} className="space-y-4">
              <FormField control={stockForm.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>New quantity</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStockProduct(null)}>Cancel</Button>
                <Button type="submit" disabled={stockForm.formState.isSubmitting}>
                  {stockForm.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : "Update stock"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && onDelete(deleteId)}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}