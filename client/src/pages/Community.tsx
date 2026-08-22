import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Trophy,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Award,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LEADERBOARD,
  CHALLENGES,
  getActiveChallenge,
  getUpcomingChallenges,
  getCompletedChallenges,
} from '@/lib/communityData';

export default function Community() {
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState('leaderboard');

  const activeChallenge = getActiveChallenge();
  const upcomingChallenges = getUpcomingChallenges();
  const completedChallenges = getCompletedChallenges();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Vortextrade Community</h1>
          <p className="text-lg text-muted-foreground">
            Compete with other traders, join challenges, and climb the leaderboard
          </p>
        </div>

        {/* Active Challenge Banner */}
        {activeChallenge && (
          <Card className="premium-card border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {activeChallenge.title}
                      <Badge variant="default">Active Now</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">{activeChallenge.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold">{activeChallenge.participants}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="text-lg font-semibold">{formatDate(activeChallenge.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prize</p>
                  <p className="text-lg font-semibold">{activeChallenge.prize}</p>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => setLocation('/simulator')}
                    className="pill-button pill-button-primary w-full"
                  >
                    Join Challenge
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Traders Leaderboard
                </CardTitle>
                <CardDescription>
                  Ranked by total return percentage across all portfolios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {LEADERBOARD.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center w-12">
                          {entry.rank === 1 && (
                            <Trophy className="h-6 w-6 text-yellow-500 mx-auto" />
                          )}
                          {entry.rank === 2 && (
                            <Trophy className="h-6 w-6 text-gray-400 mx-auto" />
                          )}
                          {entry.rank === 3 && (
                            <Trophy className="h-6 w-6 text-orange-600 mx-auto" />
                          )}
                          {entry.rank > 3 && (
                            <span className="font-bold text-lg">#{entry.rank}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.portfolioName} • {entry.tradesCount} trades
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-lg">
                          {entry.totalReturnPercent.toFixed(1)}%
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{entry.winRate}% win rate</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4">
            {/* Active Challenge */}
            {activeChallenge && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Active Challenge
                </h3>
                <Card className="premium-card">
                  <CardHeader>
                    <CardTitle>{activeChallenge.title}</CardTitle>
                    <CardDescription>{activeChallenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Objective</p>
                      <p className="text-sm text-muted-foreground">{activeChallenge.objective}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Rules</p>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                        {activeChallenge.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      onClick={() => setLocation('/simulator')}
                      className="pill-button pill-button-primary w-full"
                    >
                      Join Challenge
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Upcoming Challenges */}
            {upcomingChallenges.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Challenges
                </h3>
                <div className="grid gap-4">
                  {upcomingChallenges.map(challenge => (
                    <Card key={challenge.id} className="premium-card">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        {challenge.prize && (
                          <p className="text-sm font-semibold mt-2">Prize: {challenge.prize}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Past Challenges
                </h3>
                <div className="grid gap-4">
                  {completedChallenges.map(challenge => (
                    <Card key={challenge.id} className="premium-card">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                        {challenge.leaderboard.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2">Winners:</p>
                            <div className="space-y-1">
                              {challenge.leaderboard.slice(0, 3).map((entry, i) => (
                                <p key={entry.userId} className="text-xs text-muted-foreground">
                                  {i + 1}. {entry.username} - {entry.totalReturnPercent.toFixed(1)}%
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Traders</p>
                    <p className="text-3xl font-bold">2,847</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trades Executed</p>
                    <p className="text-3xl font-bold">156,234</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Win Rate</p>
                    <p className="text-3xl font-bold">62.3%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Return</p>
                    <p className="text-3xl font-bold">+18.4%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Trader Return</p>
                    <p className="text-3xl font-bold">+{LEADERBOARD[0].totalReturnPercent.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Challenges</p>
                    <p className="text-3xl font-bold">{CHALLENGES.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle>How to Join the Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Create a portfolio in the Trading Simulator</li>
                  <li>Start trading using Vortextrade signals</li>
                  <li>Join an active challenge to compete with other traders</li>
                  <li>Climb the leaderboard and win prizes</li>
                  <li>Share your strategies with the community</li>
                </ol>
                <Button
                  onClick={() => setLocation('/simulator')}
                  className="pill-button pill-button-primary w-full mt-4"
                >
                  Get Started Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
