import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  tier: 'STARTER' | 'PRO' | 'ELITE';
  createdAt: Date;
  stripePaymentIntentId: string;
  description: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
}

export default function PaymentHistory() {
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      amount: 29.99,
      currency: 'GBP',
      status: 'succeeded',
      tier: 'PRO',
      createdAt: new Date('2026-04-12'),
      stripePaymentIntentId: 'pi_1234567890',
      description: 'Stock Predictor - Pro Plan (Monthly)',
    },
    {
      id: '2',
      amount: 29.99,
      currency: 'GBP',
      status: 'succeeded',
      tier: 'PRO',
      createdAt: new Date('2026-03-12'),
      stripePaymentIntentId: 'pi_0987654321',
      description: 'Stock Predictor - Pro Plan (Monthly)',
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'inv_1',
      invoiceNumber: 'INV-2026-001',
      amount: 29.99,
      status: 'paid',
      issueDate: new Date('2026-04-12'),
      dueDate: new Date('2026-05-12'),
      paidDate: new Date('2026-04-12'),
    },
    {
      id: 'inv_2',
      invoiceNumber: 'INV-2026-002',
      amount: 29.99,
      status: 'paid',
      issueDate: new Date('2026-03-12'),
      dueDate: new Date('2026-04-12'),
      paidDate: new Date('2026-03-12'),
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'STARTER':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'PRO':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'ELITE':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setIsDownloading(true);
    try {
      // In production, this would fetch the PDF from the server
      console.log(`Downloading invoice ${invoice.invoiceNumber}`);
      
      // Simulate download delay
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      setIsDownloading(false);
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const averagePayment = payments.length > 0 ? totalSpent / payments.filter((p) => p.status === 'succeeded').length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-2">Manage your payments, invoices, and billing information</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.filter((p) => p.status === 'succeeded').length} successful payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{averagePayment.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pro</div>
            <p className="text-xs text-muted-foreground mt-1">Renews on May 12, 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>All your payment history and transaction details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tier</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">{payment.description}</td>
                    <td className="py-3 px-4">
                      <Badge className={getTierBadgeColor(payment.tier)}>{payment.tier}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold">£{payment.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{payment.stripePaymentIntentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download and view your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 font-semibold">£{invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={isDownloading}
                          className="gap-1"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>Invoice details and information</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-semibold">{format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-semibold">{format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-lg">£{selectedInvoice.amount.toFixed(2)}</p>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Date</p>
                      <p className="font-semibold">{format(new Date(selectedInvoice.paidDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Invoice Items</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Stock Predictor - Pro Plan (Monthly)</span>
                      <span>£{selectedInvoice.amount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>£{selectedInvoice.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
