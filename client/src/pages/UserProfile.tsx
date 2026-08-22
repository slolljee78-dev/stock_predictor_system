import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Calendar, Mail, Shield, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function UserProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery();
  const { data: plans, isLoading: plansLoading } = trpc.profile.getPlans.useQuery();

  // Mutations
  const updateNameMutation = trpc.profile.updateDisplayName.useMutation({
    onSuccess: () => {
      toast.success("Display name updated successfully");
      setEditingName(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update display name");
    },
  });

  const cancelSubscriptionMutation = trpc.profile.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription cancelled. You will retain access until the end of your billing period.");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    await updateNameMutation.mutateAsync({ name: newName });
  };

  const handleCancelSubscription = async () => {
    await cancelSubscriptionMutation.mutateAsync();
  };

  const handleUpgrade = (tier: string) => {
    setLocation(`/pricing?upgrade=${tier}`);
  };

  if (profileLoading || plansLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Failed to load profile</p>
          <Button onClick={() => setLocation("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = plans?.find((p) => p.isCurrent);
  const upgradePlans = plans?.filter((p) => !p.isCurrent);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your profile and subscription</p>
          </div>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-3">
              <Label htmlFor="display-name">Display Name</Label>
              {editingName ? (
                <div className="flex gap-2">
                  <Input
                    id="display-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <Button
                    onClick={handleUpdateName}
                    disabled={updateNameMutation.isPending}
                    size="sm"
                  >
                    {updateNameMutation.isPending ? <Spinner /> : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingName(false);
                      setNewName(user?.name || "");
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{profile.name || "Not set"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium">{profile.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Email address cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            <Separator />

            {/* Account Created */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Last Signed In */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Last Signed In
              </Label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium">
                  {profile.lastSignedIn
                    ? new Date(profile.lastSignedIn).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-3">
              <Label>Current Plan</Label>
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{currentPlan?.name || "Free"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentPlan?.description || "Basic access to Vortextrade"}
                    </p>
                  </div>
                  <Badge variant={profile.isOnFreePlan ? "secondary" : "default"}>
                    {profile.isOnFreePlan ? "Free" : profile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Plan Features */}
                {currentPlan && (
                  <div className="mt-4 space-y-2">
                    {currentPlan.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                {currentPlan && !profile.isOnFreePlan && (
                  <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <p className="text-sm text-muted-foreground">
                      £{currentPlan.priceGBP}/month
                    </p>
                    {profile.subscriptionStartedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billing started:{" "}
                        {new Date(profile.subscriptionStartedAt).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Upgrade Options */}
            {upgradePlans && upgradePlans.length > 0 && (
              <div className="space-y-3">
                <Label>Upgrade Your Plan</Label>
                <div className="grid gap-3">
                  {upgradePlans.map((plan) => (
                    <div
                      key={plan.key}
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            £{plan.priceGBP}/month
                          </p>
                        </div>
                        <Button
                          onClick={() => handleUpgrade(plan.key)}
                          variant="outline"
                          size="sm"
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Subscription */}
            {!profile.isOnFreePlan && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>Cancel Subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    If you're not satisfied with your subscription, you can cancel anytime. You'll retain access until the end of your billing period.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will retain access to your {currentPlan?.name} plan until the end of your billing period. You can resubscribe anytime.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={cancelSubscriptionMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
                      </AlertDialogAction>
                      <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you have any questions about your account or subscription, please reach out to our support team.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                View FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
