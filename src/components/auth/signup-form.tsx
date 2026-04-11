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
import { useState } from "react"
import { toast } from "sonner"
import { signUp } from "@/api/auth"
import { Separator } from "@/components/ui/separator"
import { PasswordStrength } from "./password-strength"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormData } from "@/schemas/auth-schema"
import { Eye, EyeOff } from "lucide-react"

// assets
import SignupIllustrationDark from "@/assets/illustrations/signup-illustration-dark.png"
import SignupIllustrationLight from "@/assets/illustrations/signup-illustration.png"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const illustration = mounted && resolvedTheme === "dark" ? SignupIllustrationDark : SignupIllustrationLight;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = useWatch({
        control,
        name: "password",
    });

    const onSubmit = async (data: SignupFormData) => {
        setLoading(true);
        try {
            await signUp(data.email, data.password, {
                full_name: data.fullName,
            })
            toast.success("Account created successfully.");
            navigate({ to: "/", replace: true });
        } catch (error) {
            console.error("Error signing up:", error);
            toast.error("An error occurred during registration.");
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
                            <div className="flex flex-col items-center gap-2 text-center mb-4">
                                <img src="/favicon.png" alt="PandaCoins Logo" className="relative w-20 object-contain" />
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create an account</h1>
                                <p className="text-muted-foreground text-sm">
                                    Join us and start tracking your wealth today.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Field>
                                    <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                                    <Controller
                                        name="fullName"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                className="bg-background/50"
                                            />
                                        )}
                                    />
                                    <FieldError errors={[errors.fullName]} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">Email address</FieldLabel>
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
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
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
                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                                            <div className="relative">
                                                <Controller
                                                    name="confirmPassword"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            className="bg-background/50 pr-10"
                                                        />
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            <FieldError errors={[errors.confirmPassword]} />
                                        </Field>
                                    </div>
                                    <PasswordStrength password={password || ""} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full mt-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                                {loading ? "Creating account..." : "Register Now"}
                            </Button>
                            <Separator />
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </FieldGroup>
                    </form>
                    <div className="relative hidden bg-white/50 dark:bg-background/5 md:flex items-center justify-center overflow-hidden border-l border-primary/10">
                        <img
                            src={illustration}
                            alt="Security Illustration"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 rounded-lg"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
