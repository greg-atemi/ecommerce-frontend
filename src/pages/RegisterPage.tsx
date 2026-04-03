import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const registerSchema = z
    .object({
        name: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Enter a valid email address"),
        phone: z.string().min(10, "Phone number must be at least 10 digits"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { register, isLoading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
    });

    async function onSubmit(data: RegisterForm) {
        setError(null);
        try {
            // Split "Jane Doe" → firstName: "Jane", lastName: "Doe"
            const parts = data.name.trim().split(" ");
            const firstName = parts[0];
            const lastName = parts.slice(1).join(" ") || parts[0];

            await register(firstName, lastName, data.email, data.password);
            navigate("/account");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    }

    return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Join us and start shopping today</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <p className="text-sm text-destructive text-center">{error}</p>
                            )}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jane Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="(123) 456-7890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Creating account…" : "Create account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="ml-1 font-medium text-foreground underline">
                        Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}