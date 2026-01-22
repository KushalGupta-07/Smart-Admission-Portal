import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Camera,
  User,
  Download,
  ShieldCheck,
  BellRing,
  Globe2,
  Smartphone,
  LockKeyhole,
  Sparkles,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    email_notifications: true,
    sms_notifications: false,
  });
  const [preferences, setPreferences] = useState({
    timezone: "Asia/Kolkata",
    language: "English (India)",
    weeklyReports: true,
    autoSave: true,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    deviceApprovals: true,
  });

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          email_notifications: (data as any).email_notifications ?? true,
          sms_notifications: (data as any).sms_notifications ?? false,
        });
      }
    };
    getProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setValidationErrors({});

    const formSchema = z.object({
      full_name: z.string().min(2, "Name must be at least 2 characters"),
      phone: z
        .string()
        .min(10, "Phone number must be 10 digits")
        .max(10, "Phone number must be 10 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),
      address: z.string().min(5, "Address must be at least 5 characters"),
      city: z.string().min(2, "City must be at least 2 characters"),
      state: z.string().min(2, "State must be at least 2 characters"),
      pincode: z
        .string()
        .min(6, "Pincode must be 6 digits")
        .max(6, "Pincode must be 6 digits")
        .regex(/^\d+$/, "Pincode must contain only digits"),
    });

    try {
      formSchema.parse({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix the highlighted fields.",
        });
        return;
      }
    }

    setLoading(true);

    // Only persist columns that actually exist in `public.profiles`.
    // (email_notifications / sms_notifications are UI-only unless you add DB columns + policies)
    const payload = {
      user_id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile.",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your personal details were saved successfully.",
      });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) return;
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error("Only JPG, PNG or WEBP images are allowed.");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Image must be smaller than 2MB.");
      }

      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      // IMPORTANT: storage RLS expects first folder to be the user's id.
      // Use existing "documents" bucket (already provisioned) to avoid missing-bucket errors.
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      // Bucket is private; create a signed URL for displaying the avatar.
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days
      const publicUrl = signed?.signedUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl || undefined },
      });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl || null);
      await refreshUser();

      toast({
        title: "Profile photo updated",
        description: "Your new photo is live across the app.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message ?? "Could not upload photo.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!user) return;
    setProfile((prev) => ({ ...prev, [key]: value } as any));
    // This project currently doesn't have notification columns in `profiles`,
    // so we keep this preference local to avoid RLS/column errors.
    toast({
      title: "Preference updated",
      description: "Saved for this device (database columns not configured yet).",
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your account password has been changed.",
      });
      setPasswords({ new: "", confirm: "" });
    }
    setPasswordLoading(false);
  };

  const handleDownloadData = () => {
    const dataToDownload = {
      ...profile,
      email: user?.email,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "profile-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your profile data has been exported.",
    });
  };

  const completion = useMemo(() => {
    const fields = ["full_name", "phone", "address", "city", "state", "pincode"] as const;
    const filled = fields.filter((field) => profile[field]);
    return Math.round((filled.length / fields.length) * 100);
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-muted/50 via-background to-background">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Personalized controls for your account
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">Settings</h1>
              <p className="text-muted-foreground max-w-2xl">
                Manage your profile, notifications, security, and preferences from one place.
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20">
              Profile completeness: {completion}%
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-primary/30">
                        {uploading ? (
                          <Skeleton className="h-full w-full" />
                        ) : avatarPreview || avatarUrl ? (
                          <img src={avatarPreview || avatarUrl || ""} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Signed in as</p>
                      <h3 className="text-xl font-semibold">{user?.user_metadata?.full_name || "Applicant"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile strength</span>
                      <span className="font-semibold">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Complete your profile to help us personalize your experience.
                    </p>
                  </div>
                </div>
                <Separator />
                <CardContent className="p-6 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Identity</Badge>
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Keep your contact details up to date for timely notifications.
                      </p>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            placeholder="Your full name"
                            className={validationErrors.full_name ? "border-destructive" : ""}
                          />
                          {validationErrors.full_name && (
                            <p className="text-sm text-destructive">{validationErrors.full_name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="9876543210"
                            className={validationErrors.phone ? "border-destructive" : ""}
                          />
                          {validationErrors.phone && (
                            <p className="text-sm text-destructive">{validationErrors.phone}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={profile.address}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="House number, Street"
                            className={validationErrors.address ? "border-destructive" : ""}
                          />
                          {validationErrors.address && (
                            <p className="text-sm text-destructive">{validationErrors.address}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                              placeholder="City"
                              className={validationErrors.city ? "border-destructive" : ""}
                            />
                            {validationErrors.city && (
                              <p className="text-sm text-destructive">{validationErrors.city}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={profile.state}
                              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                              placeholder="State"
                              className={validationErrors.state ? "border-destructive" : ""}
                            />
                            {validationErrors.state && (
                              <p className="text-sm text-destructive">{validationErrors.state}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={profile.pincode}
                            onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                            placeholder="6-digit code"
                            className={validationErrors.pincode ? "border-destructive" : ""}
                          />
                          {validationErrors.pincode && (
                            <p className="text-sm text-destructive">{validationErrors.pincode}</p>
                          )}
                        </div>
                        <Button type="submit" disabled={loading} className="w-full md:w-auto">
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </form>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge>Security</Badge>
                        <CardTitle className="text-lg">Account Protection</CardTitle>
                      </div>
                      <Card className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                              Two-factor authentication
                            </p>
                            <p className="text-sm text-muted-foreground">Add an extra layer with OTP</p>
                          </div>
                          <Switch
                            checked={security.twoFactor}
                            onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, twoFactor: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <BellRing className="h-4 w-4 text-primary" />
                              Login alerts
                            </p>
                            <p className="text-sm text-muted-foreground">Get notified when a new device signs in</p>
                          </div>
                          <Switch
                            checked={security.loginAlerts}
                            onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, loginAlerts: checked }))}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-primary" />
                              Device approvals
                            </p>
                            <p className="text-sm text-muted-foreground">Require approval for new sign-ins</p>
                          </div>
                          <Switch
                            checked={security.deviceApprovals}
                            onCheckedChange={(checked) => setSecurity((prev) => ({ ...prev, deviceApprovals: checked }))}
                          />
                        </div>
                      </Card>

                      <Card className="p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <LockKeyhole className="h-4 w-4 text-primary" />
                          <p className="font-semibold">Change Password</p>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                          <Input
                            type="password"
                            placeholder="New password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          />
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          />
                          <Button type="submit" disabled={passwordLoading} variant="outline" className="w-full">
                            {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                          </Button>
                        </form>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Preferences</CardTitle>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Language</p>
                            <p className="text-sm text-muted-foreground">{preferences.language}</p>
                          </div>
                          <Badge variant="outline">Beta</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Time zone</p>
                            <p className="text-sm text-muted-foreground">{preferences.timezone}</p>
                          </div>
                          <Badge variant="secondary">Auto</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly progress reports</p>
                            <p className="text-sm text-muted-foreground">Sent every Monday</p>
                          </div>
                          <Switch
                            checked={preferences.weeklyReports}
                            onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, weeklyReports: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-save drafts</p>
                            <p className="text-sm text-muted-foreground">Never lose your progress</p>
                          </div>
                          <Switch
                            checked={preferences.autoSave}
                            onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoSave: checked }))}
                          />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Notifications</CardTitle>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-medium">Email alerts</p>
                            <p className="text-sm text-muted-foreground">Application updates and reminders</p>
                          </div>
                          <Switch
                            checked={profile.email_notifications}
                            onCheckedChange={(checked) => handleNotificationChange("email_notifications", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-medium">SMS updates</p>
                            <p className="text-sm text-muted-foreground">Time-sensitive notifications</p>
                          </div>
                          <Switch
                            checked={profile.sms_notifications}
                            onCheckedChange={(checked) => handleNotificationChange("sms_notifications", checked)}
                          />
                        </div>
                        <div className="p-3 rounded-lg bg-muted flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Tip</p>
                            <p className="text-sm text-muted-foreground">
                              Enable both channels to never miss payment deadlines or exam updates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Data & Privacy</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Export a copy of your personal data anytime. We keep your information secure and compliant.
                      </p>
                      <Button variant="outline" onClick={handleDownloadData} className="w-full md:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download profile data
                      </Button>
                    </Card>

                    <Card className="p-5 space-y-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-lg">Need any changes?</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Contact support if you need to update sensitive information or revoke access.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="secondary" asChild>
                          <a href="/help">Open Help & Support</a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="mailto:support@smartadmission.io">Email support</a>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Overview</Badge>
                  <CardTitle className="text-lg">Account Snapshot</CardTitle>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate max-w-[180px] text-right">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">Applicant</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Notifications</span>
                    <Badge variant="outline">{profile.email_notifications ? "Enabled" : "Disabled"}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Quick actions</p>
                  <Button asChild className="w-full">
                    <a href="/dashboard">Return to Dashboard</a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/help">Help & Support</a>
                  </Button>
                </div>
              </Card>

              <Card className="p-5 space-y-4 bg-muted/60 border-dashed">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-lg">Security Checklist</CardTitle>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Use a strong password with 8+ characters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Enable login alerts for new devices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Keep contact info updated for recovery
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;