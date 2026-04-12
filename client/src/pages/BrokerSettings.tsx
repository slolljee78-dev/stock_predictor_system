import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, LogOut, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface BrokerAccount {
  id: string;
  broker: 'trading212' | 'alpaca' | 'interactive_brokers';
  accountNumber: string;
  accountType: 'demo' | 'live';
  status: 'connected' | 'disconnected' | 'error';
  balance: number;
  currency: string;
  lastSyncedAt: Date;
  email: string;
}

export default function BrokerSettings() {
  const [accounts, setAccounts] = useState<BrokerAccount[]>([
    {
      id: '1',
      broker: 'trading212',
      accountNumber: 'T212-123456',
      accountType: 'demo',
      status: 'connected',
      balance: 5000,
      currency: 'GBP',
      lastSyncedAt: new Date('2026-04-12T10:30:00'),
      email: 'user@example.com',
    },
  ]);

  const [isLinking, setIsLinking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<'trading212' | 'alpaca' | 'interactive_brokers'>('trading212');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const brokers = [
    {
      id: 'trading212',
      name: 'Trading 212',
      description: 'Commission-free stock trading',
      icon: '📈',
      supported: true,
    },
    {
      id: 'alpaca',
      name: 'Alpaca',
      description: 'API-first stock trading',
      icon: '🚀',
      supported: false,
    },
    {
      id: 'interactive_brokers',
      name: 'Interactive Brokers',
      description: 'Professional trading platform',
      icon: '💼',
      supported: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'disconnected':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      case 'error':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleLinkAccount = async () => {
    setIsLinking(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newAccount: BrokerAccount = {
        id: String(accounts.length + 1),
        broker: selectedBroker,
        accountNumber: `${selectedBroker.toUpperCase()}-${Math.random().toString(36).substr(2, 9)}`,
        accountType: 'demo',
        status: 'connected',
        balance: 10000,
        currency: 'GBP',
        lastSyncedAt: new Date(),
        email: credentials.email,
      };

      setAccounts([...accounts, newAccount]);
      setShowLinkDialog(false);
      setCredentials({ email: '', password: '' });
    } catch (error) {
      console.error('Failed to link account:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts(accounts.filter((a) => a.id !== accountId));
  };

  const handleRefreshBalance = async (accountId: string) => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setAccounts(
        accounts.map((a) =>
          a.id === accountId
            ? {
                ...a,
                balance: a.balance + Math.random() * 100 - 50,
                lastSyncedAt: new Date(),
              }
            : a,
        ),
      );
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broker Accounts</h1>
        <p className="text-muted-foreground mt-2">Connect your trading accounts to enable automated trading</p>
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Your linked broker accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{account.broker.replace('_', ' ').toUpperCase()}</h3>
                      <Badge className={getStatusColor(account.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(account.status)}
                          {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                        </span>
                      </Badge>
                      <Badge variant="outline">{account.accountType.toUpperCase()}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Account Number</p>
                        <p className="font-mono">{account.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p>{account.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-semibold text-lg">
                          {account.currency} {account.balance.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Synced</p>
                        <p>{account.lastSyncedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshBalance(account.id)}
                      disabled={isRefreshing}
                      className="gap-1"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      className="gap-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Link New Account */}
      <Card>
        <CardHeader>
          <CardTitle>Link New Account</CardTitle>
          <CardDescription>Connect a new broker account to start automated trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {brokers.map((broker) => (
              <div
                key={broker.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedBroker === broker.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'hover:border-gray-400 dark:hover:border-gray-600'
                } ${!broker.supported ? 'opacity-50' : ''}`}
                onClick={() => broker.supported && setSelectedBroker(broker.id as any)}
              >
                <div className="text-3xl mb-2">{broker.icon}</div>
                <h3 className="font-semibold">{broker.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{broker.description}</p>
                {!broker.supported && <Badge className="mt-2 bg-gray-500/10">Coming Soon</Badge>}
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowLinkDialog(true)}
            className="mt-6 gap-2 w-full md:w-auto"
            disabled={!brokers.find((b) => b.id === selectedBroker)?.supported}
          >
            <Plus className="w-4 h-4" />
            Link Account
          </Button>
        </CardContent>
      </Card>

      {/* Account Features */}
      <Card>
        <CardHeader>
          <CardTitle>Account Features</CardTitle>
          <CardDescription>What you can do with connected accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Automated Trading</h4>
                <p className="text-sm text-muted-foreground">Execute trades automatically based on signals</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Real-time Sync</h4>
                <p className="text-sm text-muted-foreground">Keep your portfolio data in sync</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Position Tracking</h4>
                <p className="text-sm text-muted-foreground">Monitor all your open positions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Trade History</h4>
                <p className="text-sm text-muted-foreground">Complete record of all trades</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Account Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link {selectedBroker.replace('_', ' ').toUpperCase()} Account</DialogTitle>
            <DialogDescription>Enter your broker credentials to connect your account</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Security Note:</strong> Your credentials are encrypted and never stored. We only use them to
                authenticate with your broker.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleLinkAccount}
                disabled={isLinking || !credentials.email || !credentials.password}
                className="flex-1 gap-2"
              >
                {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isLinking ? 'Linking...' : 'Link Account'}
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                Need help? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  View setup guide
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
