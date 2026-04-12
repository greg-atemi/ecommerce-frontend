import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, MapPin, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addressApi, type AddressResponse } from "@/api/addressApi";

const KE_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Nyeri", "Machakos", "Kisii", "Kakamega",
];

const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi",
  "South Sudan", "Somalia", "Ethiopia", "Djibouti", "Sudan",
];

const addressSchema = z.object({
  localityArea: z.string().min(2, "Locality is required"),
  county:       z.string().min(1, "County is required"),
  country:      z.string().default("Kenya"),
  mapsPin:      z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export function AccountAddressesPage() {
  const [addresses, setAddresses]   = useState<AddressResponse[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [pageError, setPageError]   = useState<string | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      localityArea: "", county: "", country: "Kenya", mapsPin: "",
    },
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  function fetchAddresses() {
    setIsLoading(true);
    setPageError(null);
    addressApi.getMyAddresses()
      .then(({ data }) => setAddresses(data))
      .catch(() => setPageError("Failed to load addresses. Please try again."))
      .finally(() => setIsLoading(false));
  }

  async function onAddAddress(data: AddressForm) {
    setFormError(null);
    try {
      const { data: created } = await addressApi.createAndAssign(data);
      setAddresses((prev) => [...prev, created]);
      setShowDialog(false);
      form.reset();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to save address.");
    }
  }

  async function onDeleteAddress(id: number) {
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setPageError("Failed to delete address. Please try again.");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="container py-8 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/account">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Delivery addresses</h1>
            <p className="text-sm text-muted-foreground">
              Manage your saved delivery locations
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4" /> Add address
        </Button>
      </div>

      {/* Page-level error */}
      {pageError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            {pageError}
            <Button variant="ghost" size="sm" onClick={fetchAddresses}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No saved addresses</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a delivery address to speed up checkout.
              </p>
            </div>
            <Button size="sm" className="mt-2 gap-2" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4" /> Add your first address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="flex items-start justify-between p-5">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{addr.localityArea}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.cityTown && `${addr.cityTown}, `}{addr.county}, {addr.country}
                    </p>
                    {addr.mapsPin && (
                      <a
                        href={addr.mapsPin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-0.5 block"
                      >
                        View on Maps
                      </a>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(addr.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout CTA */}
      {addresses.length > 0 && (
        <div className="mt-6 rounded-lg border bg-muted/40 p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Ready to place an order?</p>
          <Button size="sm" asChild>
            <Link to="/checkout">Go to checkout</Link>
          </Button>
        </div>
      )}

      {/* Add address dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) { form.reset(); setFormError(null); }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add delivery address</DialogTitle>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddAddress)} className="space-y-4">

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KE_COUNTIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="localityArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locality / Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Westlands, Karen, Kilimani" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mapsPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Google Maps link{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowDialog(false); form.reset(); }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    : "Save address"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete address?</AlertDialogTitle>
            <AlertDialogDescription>
              This address will be permanently removed. Any orders already
              placed with this address are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && onDeleteAddress(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}