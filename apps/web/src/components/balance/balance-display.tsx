'use client';

import { useEffect, useState } from 'react';
import { getUserBalance, addBalance } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function BalanceDisplay() {
  const [balance, setBalance] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const [addingBalance, setAddingBalance] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    const result = await getUserBalance();
    if (result.success && result.data) {
      setBalance(result.data.balance);
      setCurrency(result.data.currency);
    }
    setLoading(false);
  };

  const handleAddBalance = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setAddingBalance(true);
    const result = await addBalance(amountNum);
    setAddingBalance(false);

    if (result.success) {
      toast.success(`Added $${amountNum.toFixed(2)} to your balance`);
      setDialogOpen(false);
      setAmount('');
      fetchBalance();
    } else {
      toast.error(result.error || 'Failed to add balance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        < Loader2 className="w-4 h-4 animate-spin" />
        < span className="text-sm">Loading...</span>
      </div >
    );
  }

  return (
    <div className="flex items-center gap-2">
      < div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        < Wallet className="w-4 h-4 text-primary" />
        < span className="text-sm font-semibold">
          ${parseFloat(balance).toFixed(2)} {currency}
        </span >
      </div >

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-9">
            <Plus className="w-4 h-4 mr-1" />
            Add Funds
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Balance</DialogTitle>
            <DialogDescription>
              Add funds to your wallet (Demo Mode - Instant Credit)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (USD)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div >
            <div className="grid grid-cols-3 gap-2">
              {
                [10, 50, 100].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                  >
                    ${preset}
                  </Button >
                ))}
            </div >
          </div >
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBalance} disabled={addingBalance}>
              {addingBalance && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Funds
            </Button>
          </DialogFooter >
        </DialogContent >
      </Dialog >
    </div >
  );
}
