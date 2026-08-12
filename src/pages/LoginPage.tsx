import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<
    "success" | "error" | null
  >(null);

  // ── Resolve redirect destination ─────────────────────────────────────────
  // 1. ?redirect=/checkout  (set by CheckoutPage)
  // 2. location.state.from  (set by ProtectedRoute)
  // 3. fallback: "/"
  const redirectTo =
    searchParams.get("redirect") ??
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    setLoginStatus(null);

    try {
      await login(data.email, data.password);

      // Show success message before redirecting
      setLoginStatus("success");

      // Give the user a moment to see the success message
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
    } catch (err: any) {
      setLoginStatus("error");
      setError(err.message ?? "Invalid email or password");
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in</CardTitle>

          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                        disabled={loginStatus === "success"}
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
                        disabled={loginStatus === "success"}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Success message */}
              {loginStatus === "success" && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/30">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />

                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Login successful
                    </p>

                    <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                      Redirecting you to{" "}
                      {redirectTo === "/" ? "your account" : redirectTo}...
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {loginStatus === "error" && (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950/30">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />

                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Login Failed
                    </p>
                    <p className="font-medium text-sm text-red-700 dark:text-red-400">
                      Try again with the correct credentials
                    </p>
                  </div>

                </div>
              )}

              {/* Redirect information */}
              {redirectTo !== "/" && !loginStatus && (
                <p className="text-center text-xs text-muted-foreground">
                  You'll be redirected to{" "}
                  <span className="font-medium">{redirectTo}</span> after
                  signing in.
                </p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || loginStatus === "success"}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <Link
            to="/"
            className="underline hover:text-foreground"
          >
            Shop as a guest
          </Link>

          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}