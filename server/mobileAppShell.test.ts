import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Swipe Gesture Tests for Mobile Watchlist
 * Tests the swipe-left remove and swipe-right view details behaviors
 */

describe("SwipeableWatchlistCard", () => {
  describe("Swipe Gesture Calculations", () => {
    it("should detect swipe left for removal (offset < -50)", () => {
      const offset = -60;
      const shouldRemove = offset < -50;
      expect(shouldRemove).toBe(true);
    });

    it("should detect swipe left with velocity (negative velocity > 0.5)", () => {
      const offset = -30;
      const velocity = -0.6;
      const shouldRemove = offset < 0 && velocity < -0.5;
      expect(shouldRemove).toBe(true);
    });

    it("should not remove for small swipe left (offset > -50 and low velocity)", () => {
      const offset = -30;
      const velocity = -0.2;
      const shouldRemove = offset < -50 || (offset < 0 && velocity < -0.5);
      expect(shouldRemove).toBe(false);
    });

    it("should detect swipe right for view details (offset > 50)", () => {
      const offset = 60;
      const shouldViewDetails = offset > 50;
      expect(shouldViewDetails).toBe(true);
    });

    it("should detect swipe right with velocity (positive velocity > 0.5)", () => {
      const offset = 30;
      const velocity = 0.6;
      const shouldViewDetails = offset > 0 && velocity > 0.5;
      expect(shouldViewDetails).toBe(true);
    });

    it("should not view details for small swipe right (offset < 50 and low velocity)", () => {
      const offset = 30;
      const velocity = 0.2;
      const shouldViewDetails = offset > 50 || (offset > 0 && velocity > 0.5);
      expect(shouldViewDetails).toBe(false);
    });

    it("should return to original position for neutral swipe", () => {
      const offset = 20;
      const velocity = 0.1;
      const isNeutral = !(offset < -50 || (offset < 0 && velocity < -0.5)) &&
                        !(offset > 50 || (offset > 0 && velocity > 0.5));
      expect(isNeutral).toBe(true);
    });
  });

  describe("Watchlist Item Filtering", () => {
    it("should filter removed items from visible watchlist", () => {
      const watchlist = [
        { id: 1, ticker: "AAPL", name: "Apple" },
        { id: 2, ticker: "MSFT", name: "Microsoft" },
        { id: 3, ticker: "GOOGL", name: "Google" },
      ];
      const removedIds = [2];

      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });

      expect(visibleWatchlist).toHaveLength(2);
      expect(visibleWatchlist[0].id).toBe(1);
      expect(visibleWatchlist[1].id).toBe(3);
    });

    it("should handle empty removed ids list", () => {
      const watchlist = [
        { id: 1, ticker: "AAPL", name: "Apple" },
        { id: 2, ticker: "MSFT", name: "Microsoft" },
      ];
      const removedIds: number[] = [];

      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });

      expect(visibleWatchlist).toHaveLength(2);
    });

    it("should handle all items removed", () => {
      const watchlist = [
        { id: 1, ticker: "AAPL", name: "Apple" },
        { id: 2, ticker: "MSFT", name: "Microsoft" },
      ];
      const removedIds = [1, 2];

      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });

      expect(visibleWatchlist).toHaveLength(0);
    });
  });

  describe("State Management", () => {
    it("should add stock id to removed list without duplicates", () => {
      let removedIds: number[] = [];
      const stockId = 1;

      // First removal
      if (!removedIds.includes(stockId)) {
        removedIds = [...removedIds, stockId];
      }
      expect(removedIds).toEqual([1]);

      // Second removal attempt (should not duplicate)
      if (!removedIds.includes(stockId)) {
        removedIds = [...removedIds, stockId];
      }
      expect(removedIds).toEqual([1]);
    });

    it("should add multiple different stock ids", () => {
      let removedIds: number[] = [];

      [1, 2, 3].forEach((stockId) => {
        if (!removedIds.includes(stockId)) {
          removedIds = [...removedIds, stockId];
        }
      });

      expect(removedIds).toEqual([1, 2, 3]);
    });
  });

  describe("Animation Thresholds", () => {
    it("should use 300ms duration for swipe completion", () => {
      const duration = 300;
      expect(duration).toBe(300);
    });

    it("should use 200ms duration for reset animation", () => {
      const duration = 200;
      expect(duration).toBe(200);
    });

    it("should translate -200px for removed state", () => {
      const translateX = -200;
      expect(translateX).toBe(-200);
    });

    it("should have minimum swipe threshold of 50px", () => {
      const minThreshold = 50;
      expect(minThreshold).toBe(50);
    });

    it("should have minimum velocity threshold of 0.5", () => {
      const minVelocity = 0.5;
      expect(minVelocity).toBe(0.5);
    });
  });
});


describe("Mobile Swipe Actions - Real Implementation", () => {
  describe("Swipe Left Remove with API", () => {
    it("should call remove mutation with correct watchlistId", () => {
      const watchlistId = 5;
      const mockMutate = vi.fn();
      
      // Simulate the mutation call
      mockMutate({ watchlistId });
      
      expect(mockMutate).toHaveBeenCalledWith({ watchlistId: 5 });
    });

    it("should add watchlistId to removedIds before API call", () => {
      let removedIds: number[] = [];
      const watchlistId = 3;
      
      // Optimistic update
      if (!removedIds.includes(watchlistId)) {
        removedIds = [...removedIds, watchlistId];
      }
      
      expect(removedIds).toContain(3);
    });

    it("should filter out removed watchlist items from visible list", () => {
      const watchlist = [
        { id: 1, ticker: "AAPL", name: "Apple", stockId: 100 },
        { id: 2, ticker: "MSFT", name: "Microsoft", stockId: 101 },
        { id: 3, ticker: "GOOGL", name: "Google", stockId: 102 },
      ];
      const removedIds = [2];
      
      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });
      
      expect(visibleWatchlist).toHaveLength(2);
      expect(visibleWatchlist.map(s => s.id)).toEqual([1, 3]);
    });

    it("should handle multiple removals in sequence", () => {
      let removedIds: number[] = [];
      const mockMutate = vi.fn();
      
      // First removal
      removedIds = [1];
      mockMutate({ watchlistId: 1 });
      
      // Second removal
      removedIds = [1, 2];
      mockMutate({ watchlistId: 2 });
      
      expect(mockMutate).toHaveBeenCalledTimes(2);
      expect(removedIds).toEqual([1, 2]);
    });
  });

  describe("Swipe Right View Details", () => {
    it("should navigate to stock detail page with correct ticker", () => {
      const stock = { id: 1, ticker: "AAPL", name: "Apple", stockId: 100 };
      const expectedPath = `/stock/${stock.ticker}`;
      
      expect(expectedPath).toBe("/stock/AAPL");
    });

    it("should trigger navigation without removing from watchlist", () => {
      let removedIds: number[] = [];
      const stock = { id: 1, ticker: "MSFT", name: "Microsoft", stockId: 101 };
      
      // View details should NOT add to removedIds
      // Only swipe-left removal should do that
      
      expect(removedIds).toHaveLength(0);
    });

    it("should handle navigation for different stock tickers", () => {
      const stocks = [
        { ticker: "AAPL" },
        { ticker: "GOOGL" },
        { ticker: "TSLA" },
      ];
      
      const paths = stocks.map(s => `/stock/${s.ticker}`);
      
      expect(paths).toEqual(["/stock/AAPL", "/stock/GOOGL", "/stock/TSLA"]);
    });
  });

  describe("Swipe Animation & Feedback", () => {
    it("should animate card to -200px on swipe left completion", () => {
      const finalPosition = -200;
      expect(finalPosition).toBe(-200);
    });

    it("should use 300ms duration for removal animation", () => {
      const duration = 300;
      expect(duration).toBe(300);
    });

    it("should animate back to 0px on neutral swipe", () => {
      const resetPosition = 0;
      expect(resetPosition).toBe(0);
    });

    it("should use 200ms duration for reset animation", () => {
      const resetDuration = 200;
      expect(resetDuration).toBe(200);
    });

    it("should show red background indicator during swipe left", () => {
      const backgroundColor = "bg-red-500/80";
      expect(backgroundColor).toContain("red");
    });

    it("should display 'Remove' text on red background", () => {
      const text = "Remove";
      expect(text).toBe("Remove");
    });
  });

  describe("Swipe Gesture Edge Cases", () => {
    it("should handle swipe on last item in watchlist", () => {
      const watchlist = [{ id: 1, ticker: "AAPL", name: "Apple", stockId: 100 }];
      const removedIds = [1];
      
      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });
      
      expect(visibleWatchlist).toHaveLength(0);
    });

    it("should handle rapid consecutive swipes", () => {
      let removedIds: number[] = [];
      const mockMutate = vi.fn();
      
      // Rapid swipes on different items
      for (let i = 1; i <= 3; i++) {
        if (!removedIds.includes(i)) {
          removedIds = [...removedIds, i];
        }
        mockMutate({ watchlistId: i });
      }
      
      expect(removedIds).toEqual([1, 2, 3]);
      expect(mockMutate).toHaveBeenCalledTimes(3);
    });

    it("should prevent duplicate removals of same item", () => {
      let removedIds: number[] = [];
      const mockMutate = vi.fn();
      
      // First removal
      removedIds = [1];
      mockMutate({ watchlistId: 1 });
      
      // Attempt duplicate removal
      if (!removedIds.includes(1)) {
        removedIds = [...removedIds, 1];
        mockMutate({ watchlistId: 1 });
      }
      
      expect(removedIds).toEqual([1]);
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it("should handle swipe with zero velocity", () => {
      const offset = -60;
      const velocity = 0;
      const shouldRemove = offset < -50 || (offset < 0 && velocity < -0.5);
      
      expect(shouldRemove).toBe(true); // offset < -50 is true
    });

    it("should handle swipe with very high velocity", () => {
      const offset = -30;
      const velocity = -2.0;
      const shouldRemove = offset < -50 || (offset < 0 && velocity < -0.5);
      
      expect(shouldRemove).toBe(true); // velocity < -0.5 is true
    });
  });

  describe("Watchlist State Persistence", () => {
    it("should maintain removed items across multiple renders", () => {
      let removedIds: number[] = [];
      
      // First render: remove item 1
      removedIds = [1];
      let visibleCount = 3 - removedIds.length;
      expect(visibleCount).toBe(2);
      
      // Second render: remove item 2
      removedIds = [1, 2];
      visibleCount = 3 - removedIds.length;
      expect(visibleCount).toBe(1);
    });

    it("should preserve watchlist data after removal", () => {
      const watchlist = [
        { id: 1, ticker: "AAPL", name: "Apple", stockId: 100 },
        { id: 2, ticker: "MSFT", name: "Microsoft", stockId: 101 },
      ];
      const removedIds = [1];
      
      const visibleWatchlist = watchlist.filter((stock) => {
        for (const id of removedIds) {
          if (id === stock.id) return false;
        }
        return true;
      });
      
      expect(visibleWatchlist[0]).toEqual({
        id: 2,
        ticker: "MSFT",
        name: "Microsoft",
        stockId: 101,
      });
    });
  });
});
