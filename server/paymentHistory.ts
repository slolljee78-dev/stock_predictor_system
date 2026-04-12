/**
 * Payment History & Invoice Management
 * Handles payment records, invoice generation, and payment history tracking
 */

export interface Payment {
  id: string;
  userId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  tier: 'STARTER' | 'PRO' | 'ELITE';
  description: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, string>;
}

export interface Invoice {
  id: string;
  paymentId: string;
  userId: number;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  tier: 'STARTER' | 'PRO' | 'ELITE';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  notes?: string;
  metadata?: Record<string, string>;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

export interface PaymentHistory {
  totalPayments: number;
  totalAmount: number;
  currency: string;
  payments: Payment[];
  invoices: Invoice[];
  averagePaymentAmount: number;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
}

/**
 * Generate payment history for user
 */
export function generatePaymentHistory(userId: number, payments: Payment[]): PaymentHistory {
  const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'succeeded' ? p.amount : 0), 0);
  const succeededPayments = payments.filter((p) => p.status === 'succeeded');
  const averagePaymentAmount = succeededPayments.length > 0 ? totalAmount / succeededPayments.length : 0;

  return {
    totalPayments: succeededPayments.length,
    totalAmount,
    currency: 'GBP',
    payments: payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    invoices: [],
    averagePaymentAmount,
    lastPaymentDate: succeededPayments.length > 0 ? succeededPayments[0].createdAt : undefined,
    nextBillingDate: succeededPayments.length > 0 ? new Date(succeededPayments[0].createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
  };
}

/**
 * Generate invoice from payment
 */
export function generateInvoice(payment: Payment, invoiceNumber: string): Invoice {
  const issueDate = payment.createdAt;
  const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const tierDescriptions: Record<string, string> = {
    STARTER: 'Stock Predictor - Starter Plan (Monthly)',
    PRO: 'Stock Predictor - Pro Plan (Monthly)',
    ELITE: 'Stock Predictor - Elite Plan (Monthly)',
  };

  return {
    id: `inv_${Date.now()}`,
    paymentId: payment.id,
    userId: payment.userId,
    invoiceNumber,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status === 'succeeded' ? 'paid' : 'draft',
    tier: payment.tier,
    issueDate,
    dueDate,
    paidDate: payment.status === 'succeeded' ? payment.updatedAt : undefined,
    items: [
      {
        description: tierDescriptions[payment.tier] || payment.description,
        quantity: 1,
        unitPrice: payment.amount,
        amount: payment.amount,
        taxRate: 0, // UK VAT would be applied here in production
      },
    ],
    notes: `Thank you for your subscription to Stock Predictor. Your subscription will renew on ${new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`,
  };
}

/**
 * Generate invoice HTML for PDF rendering
 */
export function generateInvoiceHTML(invoice: Invoice, companyInfo: CompanyInfo): string {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = invoice.items.reduce((sum, item) => sum + (item.amount * (item.taxRate || 0)) / 100, 0);
  const total = subtotal + tax;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    .company-info h1 {
      margin: 0;
      color: #007bff;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-details p {
      margin: 5px 0;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background-color: #f5f5f5;
      padding: 10px;
      text-align: left;
      font-weight: bold;
      border-bottom: 1px solid #ddd;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .amount {
      text-align: right;
    }
    .totals {
      text-align: right;
      margin-top: 20px;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .totals-label {
      width: 150px;
      font-weight: bold;
    }
    .totals-amount {
      width: 100px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #007bff;
    }
    .total-label {
      width: 150px;
      font-weight: bold;
      font-size: 16px;
    }
    .total-amount {
      width: 100px;
      text-align: right;
      font-weight: bold;
      font-size: 16px;
      color: #007bff;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>${companyInfo.name}</h1>
        <p>${companyInfo.address}</p>
        <p>${companyInfo.email}</p>
      </div>
      <div class="invoice-details">
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: ${invoice.status === 'paid' ? 'green' : 'orange'}">${invoice.status.toUpperCase()}</span></p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Bill To</div>
      <p><strong>User ID:</strong> ${invoice.userId}</p>
    </div>

    <div class="section">
      <div class="section-title">Invoice Items</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Quantity</th>
            <th class="amount">Unit Price</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item) => `
            <tr>
              <td>${item.description}</td>
              <td class="amount">${item.quantity}</td>
              <td class="amount">£${item.unitPrice.toFixed(2)}</td>
              <td class="amount">£${item.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-row">
        <div class="totals-label">Subtotal:</div>
        <div class="totals-amount">£${subtotal.toFixed(2)}</div>
      </div>
      ${tax > 0 ? `
        <div class="totals-row">
          <div class="totals-label">Tax (VAT):</div>
          <div class="totals-amount">£${tax.toFixed(2)}</div>
        </div>
      ` : ''}
      <div class="total-row">
        <div class="total-label">Total:</div>
        <div class="total-amount">£${total.toFixed(2)}</div>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="section">
        <div class="section-title">Notes</div>
        <p>${invoice.notes}</p>
      </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business! If you have any questions about this invoice, please contact us at ${companyInfo.email}</p>
      <p>Payment Terms: Due within 30 days of invoice date</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Company information for invoices
 */
export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  website?: string;
  taxId?: string;
}

/**
 * Generate payment confirmation email
 */
export function generatePaymentConfirmationEmail(payment: Payment, invoice: Invoice, companyInfo: CompanyInfo): EmailContent {
  const tierNames: Record<string, string> = {
    STARTER: 'Starter',
    PRO: 'Pro',
    ELITE: 'Elite',
  };

  return {
    subject: `Payment Confirmation - Invoice #${invoice.invoiceNumber}`,
    html: `
<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Payment Confirmation</h2>
    <p>Thank you for your payment! Your subscription has been activated.</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3>Order Details</h3>
      <p><strong>Plan:</strong> ${tierNames[payment.tier]} Plan</p>
      <p><strong>Amount:</strong> £${payment.amount.toFixed(2)}</p>
      <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
      <p><strong>Transaction ID:</strong> ${payment.stripePaymentIntentId}</p>
      <p><strong>Date:</strong> ${payment.createdAt.toLocaleDateString()}</p>
    </div>

    <h3>What's Next?</h3>
    <ul>
      <li>Your subscription is now active</li>
      <li>You can access all ${tierNames[payment.tier]} Plan features</li>
      <li>Your subscription will renew on ${new Date(payment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
      <li>Your invoice has been attached to this email</li>
    </ul>

    <h3>Questions?</h3>
    <p>If you have any questions about your subscription, please contact us at ${companyInfo.email}</p>

    <hr style="margin-top: 40px;">
    <p style="color: #666; font-size: 12px;">
      © ${new Date().getFullYear()} ${companyInfo.name}. All rights reserved.
    </p>
  </body>
</html>
    `,
    text: `
Payment Confirmation

Thank you for your payment! Your subscription has been activated.

Order Details:
- Plan: ${tierNames[payment.tier]} Plan
- Amount: £${payment.amount.toFixed(2)}
- Invoice #: ${invoice.invoiceNumber}
- Transaction ID: ${payment.stripePaymentIntentId}
- Date: ${payment.createdAt.toLocaleDateString()}

What's Next:
- Your subscription is now active
- You can access all ${tierNames[payment.tier]} Plan features
- Your subscription will renew on ${new Date(payment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Your invoice has been attached to this email

Questions?
If you have any questions about your subscription, please contact us at ${companyInfo.email}

© ${new Date().getFullYear()} ${companyInfo.name}. All rights reserved.
    `,
  };
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate payment history report
 */
export function generatePaymentHistoryReport(history: PaymentHistory): string {
  const report = `
# Payment History Report

## Summary
- **Total Payments:** ${history.totalPayments}
- **Total Amount:** £${history.totalAmount.toFixed(2)}
- **Average Payment:** £${history.averagePaymentAmount.toFixed(2)}
- **Last Payment:** ${history.lastPaymentDate ? history.lastPaymentDate.toLocaleDateString() : 'N/A'}
- **Next Billing Date:** ${history.nextBillingDate ? history.nextBillingDate.toLocaleDateString() : 'N/A'}

## Payment Details
| Date | Amount | Tier | Status |
|------|--------|------|--------|
${history.payments.map((p) => `| ${p.createdAt.toLocaleDateString()} | £${p.amount.toFixed(2)} | ${p.tier} | ${p.status} |`).join('\n')}

## Payment Status Breakdown
- Succeeded: ${history.payments.filter((p) => p.status === 'succeeded').length}
- Pending: ${history.payments.filter((p) => p.status === 'pending').length}
- Failed: ${history.payments.filter((p) => p.status === 'failed').length}
- Refunded: ${history.payments.filter((p) => p.status === 'refunded').length}

## Invoices
${history.invoices.length > 0 ? `
| Invoice # | Amount | Status | Issue Date |
|-----------|--------|--------|------------|
${history.invoices.map((i) => `| ${i.invoiceNumber} | £${i.amount.toFixed(2)} | ${i.status} | ${i.issueDate.toLocaleDateString()} |`).join('\n')}
` : 'No invoices generated yet.'}
  `;

  return report;
}
