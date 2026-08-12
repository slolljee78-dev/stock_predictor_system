/**
 * Widget embed instructions page — /embed
 *
 * Shows finance bloggers how to embed the Vortextrade live signal widget.
 * Includes a live preview and copy-paste embed code.
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Code2, ExternalLink, Zap } from "lucide-react";

const EMBED_CODE = `<iframe
  src="https://vortextrade.manus.space/embed/signals"
  width="360"
  height="300"
  frameborder="0"
  scrolling="no"
  style="border-radius:12px;border:none;"
  title="Vortextrade Live Trading Signals"
></iframe>`;

export default function EmbedPage() {
  const [location] = useLocation();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMBED_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <>
      <Helmet>
        <title>Embed Live Trading Signals on Your Website — Free Widget | Vortextrade</title>
        <meta
          name="description"
          content="Add a live AI trading signal widget to your finance blog or website in 30 seconds. Free to embed, no API key required. Powered by Vortextrade."
        />
        <link rel="canonical" href="https://vortextrade.manus.space/embed" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0f1e]">
        <PublicSiteHeader currentPath={location} />

        <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 font-medium mb-5">
              <Zap className="h-3.5 w-3.5" />
              Free for finance blogs and websites
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Embed Live Trading Signals
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Add a live AI signal widget to your blog or website in 30 seconds.
              Automatically updates every 5 minutes. No API key, no sign-up required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Live preview */}
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-cyan-400" />
                Live preview
              </h2>
              <div className="rounded-2xl overflow-hidden border border-slate-700/60">
                <iframe
                  src="/embed/signals"
                  width="100%"
                  height="300"
                  frameBorder="0"
                  scrolling="no"
                  title="Vortextrade Live Trading Signals"
                  className="block"
                />
              </div>
            </div>

            {/* Embed code */}
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Code2 className="h-4 w-4 text-cyan-400" />
                Embed code
              </h2>
              <Card className="bg-slate-800/40 border-slate-700/60">
                <CardContent className="pt-4 pb-4">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed mb-4 bg-slate-900/60 rounded-lg p-3">
                    {EMBED_CODE}
                  </pre>
                  <Button
                    onClick={handleCopy}
                    className={`w-full ${
                      copied
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-cyan-600 hover:bg-cyan-500"
                    } text-white`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy embed code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features */}
          <Card className="bg-slate-800/30 border-slate-700/50 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base">What's included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Live buy/sell signals, updated every 5 minutes",
                  "AI confidence score for each signal",
                  "Ticker symbol and signal timestamp",
                  "Clickable links to full signal history",
                  "Dark theme, responsive to container width",
                  "Zero JavaScript dependencies — pure iframe",
                  "Free forever, no API key required",
                  "Powered by Vortextrade AI (200+ stocks)",
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attribution note */}
          <Card className="bg-slate-800/20 border-slate-700/40">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-white font-semibold mb-2">Attribution</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The widget includes a small "by Vortextrade" link in the header.
                This is required and must not be removed. If you'd like a white-label
                version for your publication, contact us at{" "}
                <a
                  href="mailto:hello@vortextrade.com"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                >
                  hello@vortextrade.com
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
