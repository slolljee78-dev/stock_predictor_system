import { useState, useCallback } from "react";
import { GripVertical, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface Stock {
  id: number;
  ticker: string;
  name: string;
  alertOnBuy: number;
  alertOnSell: number;
  displayOrder: number;
}

interface DraggableStockListProps {
  stocks: Stock[];
  groupId: number;
  onStocksReordered?: (stocks: Stock[]) => void;
  onStockRemoved?: (stockId: number) => void;
}

export function DraggableStockList({
  stocks,
  groupId,
  onStocksReordered,
  onStockRemoved,
}: DraggableStockListProps) {
  const [localStocks, setLocalStocks] = useState<Stock[]>(
    [...stocks].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  // Mutations
  const reorderMutation = trpc.watchlists.reorderStocks.useMutation({
    onSuccess: () => {
      onStocksReordered?.(localStocks);
    },
  });

  const removeStockMutation = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      const updatedStocks = localStocks.filter((s) => s.id !== draggedItem);
      setLocalStocks(updatedStocks);
      onStockRemoved?.(draggedItem!);
    },
  });

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverItem(null);

    if (draggedItem === null || draggedItem === dropIndex) {
      return;
    }

    // Reorder locally
    const newStocks = [...localStocks];
    const draggedStock = newStocks[draggedItem];
    newStocks.splice(draggedItem, 1);
    newStocks.splice(dropIndex, 0, draggedStock);

    setLocalStocks(newStocks);
    setDraggedItem(null);

    // Update on server
    const stockIds = newStocks.map((s) => s.id);
    reorderMutation.mutate({
      groupId,
      stockIds,
    });
  };

  const handleRemoveStock = (stockId: number) => {
    if (confirm("Are you sure you want to remove this stock from your watchlist?")) {
      removeStockMutation.mutate({ watchlistId: stockId });
    }
  };

  if (localStocks.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No stocks in this watchlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localStocks.map((stock, index) => (
        <div
          key={stock.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-move ${
            draggedItem === index
              ? "opacity-50 bg-accent/20 border-accent"
              : dragOverItem === index
                ? "bg-accent/10 border-accent/50"
                : "border-border/50 hover:bg-accent/30"
          }`}
        >
          {/* Drag Handle */}
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />

          {/* Stock Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{stock.ticker}</p>
            <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
          </div>

          {/* Alert Badges */}
          <div className="flex gap-1 flex-shrink-0">
            {stock.alertOnBuy && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30">
                Buy
              </Badge>
            )}
            {stock.alertOnSell && (
              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-500/30">
                Sell
              </Badge>
            )}
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveStock(stock.id)}
            disabled={removeStockMutation.isPending}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {reorderMutation.isPending && (
        <div className="text-xs text-muted-foreground text-center py-2">
          Saving order...
        </div>
      )}
    </div>
  );
}
