import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'buy_signal' | 'sell_signal' | 'alert' | 'price_alert';
  ticker: string;
  price: number;
  confidence: number;
  timestamp: Date;
  timeAgo: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
  };

  return (
    <div className="relative flex justify-end">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-w-[calc(100vw-2rem)]">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {unreadCount === 0
                  ? 'No new notifications'
                  : `${unreadCount} new alert${unreadCount !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 max-h-80 sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-accent/50 transition-colors flex items-start gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notification.type === 'buy_signal' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <p className="font-semibold text-sm">{notification.ticker}</p>
                          <Badge
                            variant={
                              notification.type === 'buy_signal' ? 'default' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {notification.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          £{notification.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.timeAgo}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
