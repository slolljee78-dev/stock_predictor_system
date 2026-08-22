import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, Gift, Users, Star, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);

  const { data: code, isLoading: codeLoading } = trpc.referral.getMyCode.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.referral.getStats.useQuery();
  const { data: referrals, isLoading: referralsLoading } = trpc.referral.getMyReferrals.useQuery();

  const referralUrl = code
    ? `${window.location.origin}/?ref=${code.code}`
    : "";

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast.success("Copied!", { description: "Referral link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "credited":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Credited</Badge>;
      case "converted":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Converted</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Referral Programme</h1>
          <p className="text-slate-400 mt-1">
            Give a friend 1 month free, get 1 month free. For every friend who upgrades to Pro, you both get 30 days free. No limit.
          </p>
        </div>

        {/* How it works */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-cyan-400" />
              How it works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Share your link", desc: "Copy your unique referral link and share it with friends, on Reddit, or social media." },
                { step: "2", title: "They sign up", desc: "When someone clicks your link and creates a Vortextrade account, they're tracked as your referral." },
                { step: "3", title: "You both get 30 days free", desc: "When they upgrade, you both receive 30 free days automatically — no voucher codes needed." },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Referrals",
              value: statsLoading ? null : stats?.totalReferrals ?? 0,
              icon: <Users className="h-4 w-4 text-cyan-400" />,
            },
            {
              label: "Credits Earned",
              value: statsLoading ? null : `${stats?.totalCreditsEarned ?? 0} days`,
              icon: <Star className="h-4 w-4 text-amber-400" />,
            },
            {
              label: "Pending Credits",
              value: statsLoading ? null : `${stats?.pendingCredits ?? 0} days`,
              icon: <Clock className="h-4 w-4 text-blue-400" />,
            },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="text-slate-400 text-xs">{stat.label}</span>
                </div>
                {stat.value === null ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="text-white text-xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral link */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {codeLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-300 font-mono truncate">
                  {referralUrl}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 border-slate-600 text-slate-300 hover:text-white hover:border-cyan-500"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            )}
            {code && (
              <p className="text-slate-500 text-xs">
                Your referral code: <span className="text-cyan-400 font-mono font-bold">{code.code}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Referral history */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !referrals || referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No referrals yet.</p>
                <p className="text-slate-500 text-xs mt-1">Share your link to start earning free days.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {r.referredUserName || "Anonymous User"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.creditsAwarded > 0 && (
                        <span className="text-emerald-400 text-sm font-medium">+{r.creditsAwarded} days</span>
                      )}
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
