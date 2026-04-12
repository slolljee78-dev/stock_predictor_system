import React, { useState } from 'react';
import { Copy, Download, Plus, Trash2, Eye, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'aggressive' | 'balanced' | 'conservative' | 'dividend' | 'growth' | 'value';
  stocks: { symbol: string; weight: number; sector: string }[];
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  minInvestment: number;
  createdAt: Date;
  uses: number;
  author: string;
  isPublic: boolean;
}

export default function PortfolioTemplates() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Tech Growth Portfolio',
      description: 'High-growth technology stocks for long-term capital appreciation',
      category: 'growth',
      stocks: [
        { symbol: 'AAPL', weight: 20, sector: 'Technology' },
        { symbol: 'MSFT', weight: 18, sector: 'Technology' },
        { symbol: 'NVDA', weight: 15, sector: 'Technology' },
        { symbol: 'TSLA', weight: 12, sector: 'Automotive' },
        { symbol: 'META', weight: 10, sector: 'Technology' },
        { symbol: 'GOOGL', weight: 25, sector: 'Technology' },
      ],
      expectedReturn: 18.5,
      riskLevel: 'high',
      minInvestment: 5000,
      createdAt: new Date('2026-03-01'),
      uses: 342,
      author: 'Stock Predictor',
      isPublic: true,
    },
    {
      id: '2',
      name: 'Dividend Income Portfolio',
      description: 'Stable dividend-paying stocks for consistent income',
      category: 'dividend',
      stocks: [
        { symbol: 'JNJ', weight: 20, sector: 'Healthcare' },
        { symbol: 'PG', weight: 18, sector: 'Consumer' },
        { symbol: 'KO', weight: 15, sector: 'Consumer' },
        { symbol: 'MCD', weight: 12, sector: 'Consumer' },
        { symbol: 'PEP', weight: 15, sector: 'Consumer' },
        { symbol: 'IBM', weight: 20, sector: 'Technology' },
      ],
      expectedReturn: 8.2,
      riskLevel: 'low',
      minInvestment: 3000,
      createdAt: new Date('2026-02-15'),
      uses: 521,
      author: 'Stock Predictor',
      isPublic: true,
    },
    {
      id: '3',
      name: 'Balanced Index Portfolio',
      description: 'Diversified portfolio tracking major indices',
      category: 'balanced',
      stocks: [
        { symbol: 'SPY', weight: 40, sector: 'Index' },
        { symbol: 'QQQ', weight: 30, sector: 'Index' },
        { symbol: 'BND', weight: 20, sector: 'Bonds' },
        { symbol: 'VNQ', weight: 10, sector: 'Real Estate' },
      ],
      expectedReturn: 10.5,
      riskLevel: 'medium',
      minInvestment: 2000,
      createdAt: new Date('2026-01-20'),
      uses: 789,
      author: 'Stock Predictor',
      isPublic: true,
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });

  const categoryColors: Record<string, string> = {
    aggressive: 'bg-red-500/10 text-red-700 dark:text-red-400',
    balanced: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    conservative: 'bg-green-500/10 text-green-700 dark:text-green-400',
    dividend: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    growth: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    value: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  };

  const riskColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    high: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  const handleUseTemplate = (template: Template) => {
    console.log('Using template:', template.id);
    // In production, this would create a new portfolio from the template
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.description) {
      const template: Template = {
        id: String(templates.length + 1),
        name: newTemplate.name,
        description: newTemplate.description,
        category: 'balanced',
        stocks: [],
        expectedReturn: 10,
        riskLevel: 'medium',
        minInvestment: 1000,
        createdAt: new Date(),
        uses: 0,
        author: 'You',
        isPublic: false,
      };
      setTemplates([...templates, template]);
      setShowCreateDialog(false);
      setNewTemplate({ name: '', description: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Templates</h1>
          <p className="text-muted-foreground mt-2">Pre-built portfolios to get started quickly</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Featured Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Featured Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                  {!template.isPublic && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={categoryColors[template.category]}>
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </Badge>
                  <Badge className={riskColors[template.riskLevel]}>
                    {template.riskLevel.charAt(0).toUpperCase() + template.riskLevel.slice(1)} Risk
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expected Return</p>
                    <p className="font-semibold text-green-600">{template.expectedReturn.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Investment</p>
                    <p className="font-semibold">£{template.minInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stocks</p>
                    <p className="font-semibold">{template.stocks.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Used</p>
                    <p className="font-semibold">{template.uses.toLocaleString()} times</p>
                  </div>
                </div>

                {/* Holdings Preview */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Top Holdings</p>
                  <div className="space-y-1">
                    {template.stocks.slice(0, 3).map((stock) => (
                      <div key={stock.symbol} className="flex justify-between text-xs">
                        <span>{stock.symbol}</span>
                        <span className="font-medium">{stock.weight}%</span>
                      </div>
                    ))}
                    {template.stocks.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{template.stocks.length - 3} more</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                    className="gap-1"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  {!template.isPublic && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Template Details Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="text-lg font-semibold text-green-600">{selectedTemplate.expectedReturn.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge className={riskColors[selectedTemplate.riskLevel]}>
                    {selectedTemplate.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Investment</p>
                  <p className="text-lg font-semibold">£{selectedTemplate.minInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Holdings</p>
                  <p className="text-lg font-semibold">{selectedTemplate.stocks.length}</p>
                </div>
              </div>

              {/* Holdings Table */}
              <div>
                <h4 className="font-semibold mb-3">Portfolio Holdings</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left py-2 px-3">Symbol</th>
                        <th className="text-left py-2 px-3">Sector</th>
                        <th className="text-right py-2 px-3">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTemplate.stocks.map((stock) => (
                        <tr key={stock.symbol} className="border-t hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono font-semibold">{stock.symbol}</td>
                          <td className="py-2 px-3">{stock.sector}</td>
                          <td className="py-2 px-3 text-right font-semibold">{stock.weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handleUseTemplate(selectedTemplate)} className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  Use This Template
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>Create a custom portfolio template to save and reuse</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g., My Growth Portfolio"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Describe your portfolio strategy"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Tip:</strong> You can add holdings to your template after creation.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.description} className="flex-1">
                Create Template
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
