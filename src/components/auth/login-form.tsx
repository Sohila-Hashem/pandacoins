import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "@tanstack/react-router"
import { login } from "@/api/auth"
import { toast } from "sonner"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/schemas/auth-schema"
import { Eye, EyeOff } from "lucide-react"

// assets
import LoginIllustratonDark from "@/assets/illustrations/login-illustration-dark.png"
import LoginIllustratonLight from "@/assets/illustrations/login-illustration.png"

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const illustration = mounted && resolvedTheme === "dark" ? LoginIllustratonDark : LoginIllustratonLight;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            await login(data.email, data.password);
            toast.success("Logged in successfully.");
            navigate({ to: "/", replace: true });
        } catch (error: any) {
            console.error("Error logging in:", error);
            toast.error(error.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden border-primary/10 shadow-2xl backdrop-blur-xl bg-card/40 p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-8 md:p-12 flex flex-col justify-center" onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <div className="flex flex-col items-center gap-2 text-center mb-8">
                                <img src="/favicon.png" alt="PandaCoins Logo" className="relative w-20 object-contain" />
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back</h1>
                                <p className="text-muted-foreground">
                                    Continue your journey to financial clarity.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                className="bg-background/50"
                                            />
                                        )}
                                    />
                                    <FieldError errors={[errors.email]} />
                                </Field>
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <Link
                                            to="/auth/forgot-password"
                                            className="ml-auto text-xs text-primary hover:underline font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Controller
                                            name="password"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="bg-background/50 pr-10"
                                                />
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    <FieldError errors={[errors.password]} />
                                </Field>
                            </div>
                            <Button type="submit" className="w-full mt-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                                {loading ? "Signing in..." : "Login"}
                            </Button>
                            <Separator />
                            <p className="text-center text-sm text-muted-foreground">
                                New to PandaCoins?{" "}
                                <Link to="/auth/signup" className="text-primary font-semibold hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-white/50 dark:bg-primary/5 md:flex items-center justify-center overflow-hidden border-l border-primary/10">
                        <img
                            src={illustration}
                            alt="Finance Illustration"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 rounded-lg"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
