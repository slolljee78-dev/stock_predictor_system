import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';

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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  // Fetch payment history from tRPC
  const { data: paymentData, isLoading: paymentsLoading } = trpc.payments.getPaymentHistory.useQuery({
    limit: 20,
    offset: 0,
  });

  // Fetch invoices from tRPC
  const { data: invoiceData, isLoading: invoicesLoading } = trpc.payments.getInvoices.useQuery({
    limit: 20,
    offset: 0,
  });

  // Fetch payment summary
  const { data: summary } = trpc.payments.getPaymentSummary.useQuery();

  // Mutation for downloading invoices
  const downloadInvoiceMutation = trpc.payments.downloadInvoice.useMutation();

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setDownloadingInvoice(invoiceId);
      await downloadInvoiceMutation.mutateAsync({ invoiceId });
      // In production, the mutation would handle the download
    } finally {
      setDownloadingInvoice(null);
    }
  };

  // Mock data for demo
  const mockPayments: Payment[] = [
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
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'inv_001',
      invoiceNumber: 'INV-2026-001',
      amount: 29.99,
      status: 'paid',
      issueDate: new Date('2026-04-12'),
      dueDate: new Date('2026-05-12'),
      paidDate: new Date('2026-04-15'),
    },
  ];

  const payments = paymentData?.payments || mockPayments;
  const invoices = invoiceData?.invoices || mockInvoices;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.currency} {(summary?.totalSpent || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.totalPayments || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.currency} {(summary?.averagePayment || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.nextBillingDate
                ? format(new Date(summary.nextBillingDate), 'MMM dd')
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.lastPaymentDate
                ? format(new Date(summary.lastPaymentDate), 'MMM dd, yyyy')
                : 'No payments yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your transaction records</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4 font-semibold">Date</th>
                    <th className="text-left py-2 px-4 font-semibold">Description</th>
                    <th className="text-left py-2 px-4 font-semibold">Amount</th>
                    <th className="text-left py-2 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-4">{payment.description}</td>
                      <td className="py-3 px-4 font-semibold">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download and manage your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">£{invoice.amount.toFixed(2)}</p>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        disabled={downloadingInvoice === invoice.id}
                      >
                        {downloadingInvoice === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && format(new Date(selectedInvoice.issueDate), 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">£{selectedInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge className={getStatusColor(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
