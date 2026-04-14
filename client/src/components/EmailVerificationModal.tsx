import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

interface EmailVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  onVerified?: () => void;
}

export function EmailVerificationModal({
  open,
  onOpenChange,
  userEmail,
  onVerified,
}: EmailVerificationModalProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendVerificationEmail = trpc.auth.sendVerificationEmail.useMutation();
  const verifyEmail = trpc.auth.verifyEmail.useMutation();

  const handleSendEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendVerificationEmail.mutateAsync();
      setMessage(`Verification code sent to ${userEmail}`);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      setError('Please enter the verification token');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await verifyEmail.mutateAsync({ token });
      setMessage('Email verified successfully!');
      setTimeout(() => {
        onOpenChange(false);
        setStep('send');
        setToken('');
        setMessage('');
        onVerified?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Verify Your Email</DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 'send'
              ? 'Verify your email address to unlock all features'
              : 'Enter the verification code sent to your email'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'send' ? (
            <>
              <p className="text-sm text-gray-400">
                We'll send a verification code to:
              </p>
              <p className="font-medium text-white">{userEmail}</p>
              <Button
                onClick={handleSendEmail}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <Input
                placeholder="Enter verification code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <Button
                onClick={handleVerifyToken}
                disabled={loading || !token.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <Button
                onClick={() => {
                  setStep('send');
                  setToken('');
                  setError('');
                  setMessage('');
                }}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Back
              </Button>
            </>
          )}

          {message && (
            <div className="p-3 bg-emerald-900/30 border border-emerald-700 rounded text-emerald-200 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
