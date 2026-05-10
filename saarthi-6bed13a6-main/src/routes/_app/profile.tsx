import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => setProfile(data));
  }, [user]);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("profiles").update({
      full_name: fd.get("full_name") as string,
      avatar_url: fd.get("avatar_url") as string,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
  };

  return (
    <>
      <p className="text-sunset font-medium text-sm tracking-wide uppercase">Profile</p>
      <h1 className="font-display font-bold text-4xl mt-1">Your account</h1>

      <div className="mt-8 glass rounded-2xl p-6 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full gradient-sunset grid place-items-center text-white">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="size-full rounded-full object-cover" /> : <User className="size-7" />}
          </div>
          <div>
            <div className="font-semibold">{profile?.full_name ?? "Traveler"}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <form onSubmit={save} className="mt-6 space-y-4">
          <div><Label>Full name</Label><Input name="full_name" defaultValue={profile?.full_name ?? ""} /></div>
          <div><Label>Avatar URL</Label><Input name="avatar_url" defaultValue={profile?.avatar_url ?? ""} /></div>
          <Button className="gradient-sunset text-white border-0">Save changes</Button>
        </form>
      </div>
    </>
  );
}
