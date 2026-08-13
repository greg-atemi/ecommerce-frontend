import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";

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
    const [registerStatus, setRegisterStatus] = useState<
        "success" | "error" | null
    >(null);

    const form = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(data: RegisterForm) {
        setError(null);
        setRegisterStatus(null);

        try {
            // Split "Jane Doe" → firstName: "Jane", lastName: "Doe"
            const parts = data.name.trim().split(" ");
            const firstName = parts[0];
            const lastName = parts.slice(1).join(" ") || parts[0];

            await register(
                firstName,
                lastName,
                data.email,
                data.password
            );

            // Show success state
            setRegisterStatus("success");

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (err: unknown) {
            setRegisterStatus("error");

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

                {/* Header */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Create an account
                    </CardTitle>

                    <CardDescription>
                        Join us and start shopping today
                    </CardDescription>
                </CardHeader>

                {/* Form */}
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            {/* Full name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full name</FormLabel>

                                        <FormControl>
                                            <Input
                                                placeholder="Jane Doe"
                                                {...field}
                                                disabled={
                                                    registerStatus === "success"
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>

                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                {...field}
                                                disabled={
                                                    registerStatus === "success"
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>

                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="(123) 456-7890"
                                                {...field}
                                                disabled={
                                                    registerStatus === "success"
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>

                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                disabled={
                                                    registerStatus === "success"
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Confirm password
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                disabled={
                                                    registerStatus === "success"
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isLoading ||
                                    registerStatus === "success"
                                }
                            >
                                {isLoading
                                    ? "Creating account…"
                                    : "Create account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                {/* Status message at bottom of card */}
                {registerStatus === "success" && (
                    <div className="mx-6 mb-4 flex flex-col items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/30">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />

                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">
                                Account created successfully
                            </p>

                            <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                                Redirecting you to the login page...
                            </p>
                        </div>
                    </div>
                )}

                {registerStatus === "error" && (
                    <div className="mx-6 mb-4 flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950/30">
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />

                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-400">
                                Registration failed
                            </p>

                            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <CardFooter className="justify-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="ml-1 font-medium text-foreground underline"
                    >
                        Sign in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}