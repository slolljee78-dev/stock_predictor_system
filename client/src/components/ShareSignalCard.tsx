import React, { useRef, useState, useCallback } from 'react';
import { Share2, Twitter, Copy, Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface ShareSignalCardProps {
  signal: {
    ticker: string;
    signalType: 'buy' | 'sell' | 'hold';
    confidence: number;
    price: number | string | null;
    timestamp: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Draws a Vortextrade-branded signal card onto a canvas element.
 */
function drawSignalCard(
  canvas: HTMLCanvasElement,
  signal: ShareSignalCardProps['signal'],
  referralUrl: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 800;
  const H = 420;
  canvas.width = W;
  canvas.height = H;

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#0c1a2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Accent glow ──
  const isGreen = signal.signalType === 'buy';
  const accentColor = isGreen ? '#22d3ee' : '#f43f5e';
  const accentGlow = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, 320);
  accentGlow.addColorStop(0, isGreen ? 'rgba(34,211,238,0.12)' : 'rgba(244,63,94,0.12)');
  accentGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = accentGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Border ──
  ctx.strokeStyle = isGreen ? 'rgba(34,211,238,0.3)' : 'rgba(244,63,94,0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // ── Vortextrade logo text ──
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('VORTEXTRADE', 40, 52);

  // ── Tagline ──
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('AI-Powered Trading Signals', 40, 72);

  // ── Divider line ──
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 90);
  ctx.lineTo(W - 40, 90);
  ctx.stroke();

  // ── Ticker ──
  ctx.font = 'bold 72px system-ui, sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(`$${signal.ticker}`, 40, 180);

  // ── Signal type badge ──
  const badgeText = signal.signalType.toUpperCase();
  const badgeX = 40;
  const badgeY = 200;
  const badgeW = 100;
  const badgeH = 36;
  const badgeBg = isGreen ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
  const badgeBorder = isGreen ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
  const badgeFg = isGreen ? '#4ade80' : '#f87171';

  ctx.fillStyle = badgeBg;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fill();
  ctx.strokeStyle = badgeBorder;
  ctx.lineWidth = 1;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.stroke();

  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = badgeFg;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 23);
  ctx.textAlign = 'left';

  // ── Confidence ──
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Confidence', 40, 268);
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText(`${signal.confidence}%`, 40, 308);

  // ── Price ──
  const numericPrice = parseFloat(String(signal.price ?? 0)) || 0;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Price at Signal', 200, 268);
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(`$${numericPrice.toFixed(2)}`, 200, 308);

  // ── Date ──
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Generated', 420, 268);
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.fillText(new Date(signal.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 420, 308);

  // ── Bottom divider ──
  ctx.strokeStyle = 'rgba(148,163,184,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 340);
  ctx.lineTo(W - 40, 340);
  ctx.stroke();

  // ── Referral URL ──
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Join Vortextrade:', 40, 368);
  ctx.fillStyle = accentColor;
  ctx.fillText(referralUrl, 170, 368);

  // ── Disclaimer ──
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Not financial advice. Past performance does not guarantee future results.', 40, 400);
}

/** Helper to draw rounded rectangles */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function ShareSignalCard({ signal, isOpen, onClose }: ShareSignalCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [rendered, setRendered] = useState(false);
  const { user } = useAuth();

  const { data: referralCode } = trpc.referral.getMyCode.useQuery(undefined, {
    enabled: !!user && isOpen,
  });

  const referralUrl = referralCode?.code
    ? `${window.location.origin}/?ref=${referralCode.code}`
    : window.location.origin;

  const shareUrl = `${window.location.origin}/signals?ticker=${signal.ticker}`;

  // Draw card when dialog opens or referral code loads
  const renderCard = useCallback(() => {
    if (canvasRef.current) {
      drawSignalCard(canvasRef.current, signal, referralUrl);
      setRendered(true);
    }
  }, [signal, referralUrl]);

  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure canvas is mounted
      const t = setTimeout(renderCard, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, renderCard]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `vortextrade-${signal.ticker}-${signal.signalType}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleTwitterShare = () => {
    const isGreen = signal.signalType === 'buy';
    const emoji = isGreen ? '📈' : '📉';
    const text = `${emoji} ${signal.signalType.toUpperCase()} signal on $${signal.ticker} — ${signal.confidence}% confidence\n\nGenerated by @Vortextrade AI\n\n${shareUrl}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleCopyLink = async () => {
    const isGreen = signal.signalType === 'buy';
    const emoji = isGreen ? '📈' : '📉';
    const text = `${emoji} ${signal.signalType.toUpperCase()} signal on $${signal.ticker} — ${signal.confidence}% confidence\n\nGenerated by Vortextrade AI\n${shareUrl}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            Share Signal Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas preview */}
          <div className="rounded-lg overflow-hidden border border-border bg-slate-900">
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
              style={{ display: 'block', maxHeight: '280px', objectFit: 'contain' }}
            />
          </div>

          {/* Referral link display */}
          {referralCode?.code && (
            <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <span className="text-xs text-cyan-400 font-medium">Your referral link is included:</span>
              <code className="text-xs text-cyan-300 truncate">{referralUrl}</code>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={handleTwitterShare} variant="outline" className="gap-2">
              <Twitter className="h-4 w-4" />
              Share on X
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Text
                </>
              )}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="gap-2" disabled={!rendered}>
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Not financial advice. Always do your own research before trading.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
