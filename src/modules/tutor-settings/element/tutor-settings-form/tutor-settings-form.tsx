"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { toast } from "sonner";

import { useUpdateTutorNotificationPreferences } from "@/entities/tutor/api/tutor-profile.query";
import { useSignOut, useUpdatePassword } from "@/entities/user/api/user.query";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type Props = {
  prefs: {
    email_booking: boolean;
    email_message: boolean;
    push_booking: boolean;
    push_message: boolean;
  };
};

export function TutorSettingsForm({ prefs }: Props) {
  const router = useRouter();
  const updatePrefs = useUpdateTutorNotificationPreferences();
  const updatePassword = useUpdatePassword();
  const signOut = useSignOut();
  const [emailBooking, setEmailBooking] = useState(prefs.email_booking);
  const [emailMessage, setEmailMessage] = useState(prefs.email_message);
  const [pushBooking, setPushBooking] = useState(prefs.push_booking);
  const [pushMessage, setPushMessage] = useState(prefs.push_message);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function savePrefs() {
    setPending(true);
    try {
      await updatePrefs.mutateAsync({
        emailBooking,
        emailMessage,
        pushBooking,
        pushMessage,
      });
      toast.success("Preferences saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
    setPending(false);
  }

  async function changePassword() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPending(true);
    try {
      await updatePassword.mutateAsync({ password });
      toast.success("Password updated");
      setPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
    setPending(false);
  }

  async function deactivate() {
    setPending(true);
    try {
      await signOut.mutateAsync();
      toast.message("Signed out", {
        description: "Contact support to remove your tutor profile completely.",
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign out failed");
    }
    setPending(false);
  }

  return (
    <div className="max-w-md space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold">Notifications</h2>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={emailBooking}
            onCheckedChange={(c) => setEmailBooking(c === true)}
          />
          Email for bookings
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={emailMessage}
            onCheckedChange={(c) => setEmailMessage(c === true)}
          />
          Email for messages
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={pushBooking}
            onCheckedChange={(c) => setPushBooking(c === true)}
          />
          Push for bookings
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={pushMessage}
            onCheckedChange={(c) => setPushMessage(c === true)}
          />
          Push for messages
        </label>
        <Button
          type="button"
          size="sm"
          onClick={() => void savePrefs()}
          disabled={pending || updatePassword.isPending || signOut.isPending}
        >
          Save preferences
        </Button>
      </section>
      <section className="space-y-4">
        <h2 className="font-semibold">Change password</h2>
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void changePassword()}
          disabled={pending || updatePassword.isPending || signOut.isPending}
        >
          Update password
        </Button>
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">Account</h2>
        <p className="text-muted-foreground text-sm">
          Signing out clears your session. Full account deletion can be wired to
          Supabase admin or support.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => void deactivate()}
          disabled={pending || updatePassword.isPending || signOut.isPending}
        >
          Sign out / deactivate session
        </Button>
      </section>
    </div>
  );
}
