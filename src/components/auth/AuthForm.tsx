
"use client";

import type React from 'react';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase character")
  .regex(/[A-Z]/, "Password must contain at least one uppercase character")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type FormData = SignupFormData | LoginFormData;

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (data: FormData) => Promise<void>;
  socialLogins?: React.ReactNode;
}

export default function AuthForm({ mode, onSubmit, socialLogins }: AuthFormProps) {
  const schema = mode === 'signup' ? signupSchema : loginSchema;
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit: SubmitHandler<any> = async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error: any) {
      // Toast is handled by the page
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-8 neo-card w-full max-w-md">
      {mode === 'signup' && (
        <div className="space-y-1">
          <Label htmlFor="username" className="text-card-foreground font-semibold font-inter">Username</Label>
          <Input id="username" type="text" {...register('username')} className="neo-input" placeholder="your_username" />
          {errors.username && <p className="text-sm text-destructive">{String(errors.username.message)}</p>}
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-card-foreground font-semibold font-inter">Email</Label>
        <Input id="email" type="email" {...register('email')} className="neo-input" placeholder="you@example.com" />
        {errors.email && <p className="text-sm text-destructive">{String(errors.email.message)}</p>}
      </div>
      <div className="space-y-1 relative">
        <Label htmlFor="password" className="text-card-foreground font-semibold font-inter">Password</Label>
        <Input id="password" type={showPassword ? "text" : "password"} {...register('password')} className="neo-input pr-10" placeholder="••••••••" />
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-7 h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
          </Button>
        {errors.password && <p className="text-sm text-destructive">{String(errors.password.message)}</p>}
      </div>
      {mode === 'signup' && (
        <div className="space-y-1 relative">
          <Label htmlFor="confirmPassword" className="text-card-foreground font-semibold font-inter">Confirm Password</Label>
          <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register('confirmPassword')} className="neo-input pr-10" placeholder="••••••••" />
          <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-7 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          {errors.confirmPassword && <p className="text-sm text-destructive">{String(errors.confirmPassword.message)}</p>}
        </div>
      )}
      <Button type="submit" disabled={isLoading} className="w-full neo-button text-lg py-3">
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </Button>
      {socialLogins && (
        <>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          {socialLogins}
        </>
      )}
    </form>
  );
}
    