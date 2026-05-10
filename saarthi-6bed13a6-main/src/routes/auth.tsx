import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/saarthi-logo.png";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signUp({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fd.get("name") as string },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email if confirmation is required.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block gradient-hero text-white p-12">
        <div className="flex items-center gap-3 font-display font-bold text-xl">
          <img src={logo} alt="Saarthi" className="size-12 object-contain drop-shadow" />
          Saarthi
        </div>
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-display font-bold text-4xl leading-tight">Plan magical journeys across incredible India.</h2>
          <p className="mt-3 opacity-85">Join Saarthi and let AI guide your next adventure.</p>
        </div>
      </div>

      <div className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <h1 className="font-display font-bold text-3xl">Welcome to Saarthi</h1>
          <p className="text-muted-foreground mt-1">Sign in or create an account to start planning.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={onSignIn} className="space-y-4 mt-4">
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Password</Label><Input name="password" type="password" required /></div>
                <Button disabled={loading} className="w-full gradient-sunset text-white border-0">{loading ? "..." : "Sign in"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignUp} className="space-y-4 mt-4">
                <div><Label>Full name</Label><Input name="name" required /></div>
                <div><Label>Email</Label><Input name="email" type="email" required /></div>
                <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
                <Button disabled={loading} className="w-full gradient-sunset text-white border-0">{loading ? "..." : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
