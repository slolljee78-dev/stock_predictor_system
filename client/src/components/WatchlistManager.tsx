import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit2, Plus, GripVertical } from "lucide-react";

interface WatchlistManagerProps {
  onSelectWatchlist?: (groupId: number) => void;
  selectedGroupId?: number;
}

export function WatchlistManager({ onSelectWatchlist, selectedGroupId }: WatchlistManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string; description?: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  // Queries
  const { data: groups, isLoading, refetch } = trpc.watchlists.listGroups.useQuery();

  // Mutations
  const createGroupMutation = trpc.watchlists.createGroup.useMutation({
    onSuccess: () => {
      setNewGroupName("");
      setNewGroupDescription("");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  const renameGroupMutation = trpc.watchlists.renameGroup.useMutation({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      refetch();
    },
  });

  const updateDescriptionMutation = trpc.watchlists.updateGroupDescription.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteGroupMutation = trpc.watchlists.deleteGroup.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateWatchlist = () => {
    if (!newGroupName.trim()) {
      return;
    }
    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription || undefined,
    });
  };

  const handleRenameWatchlist = () => {
    if (!editingGroup || !newGroupName.trim()) {
      return;
    }
    renameGroupMutation.mutate({
      groupId: editingGroup.id,
      newName: newGroupName,
    });
    if (editingGroup.description !== newGroupDescription) {
      updateDescriptionMutation.mutate({
        groupId: editingGroup.id,
        description: newGroupDescription || undefined,
      });
    }
  };

  const handleDeleteWatchlist = (groupId: number) => {
    if (confirm("Are you sure you want to delete this watchlist?")) {
      deleteGroupMutation.mutate({ groupId });
    }
  };

  const handleEditWatchlist = (group: any) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || "");
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Watchlists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading watchlists...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Watchlists</CardTitle>
          <CardDescription>Organize stocks by trading strategy</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Watchlist</DialogTitle>
              <DialogDescription>
                Create a new watchlist to organize stocks by trading strategy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Watchlist Name</label>
                <Input
                  placeholder="e.g., Tech Stocks, Dividend Plays"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Describe the purpose of this watchlist..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWatchlist} disabled={createGroupMutation.isPending}>
                {createGroupMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!groups || groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No watchlists yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedGroupId === group.id
                    ? "bg-accent border-accent-foreground"
                    : "bg-background hover:bg-muted border-border"
                }`}
                onClick={() => onSelectWatchlist?.(group.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{group.name}</h4>
                  {group.description && (
                    <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Dialog open={isEditDialogOpen && editingGroup?.id === group.id} onOpenChange={(open) => {
                    if (!open) setEditingGroup(null);
                    setIsEditDialogOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWatchlist(group);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Watchlist</DialogTitle>
                        <DialogDescription>
                          Update the name and description of your watchlist
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Watchlist Name</label>
                          <Input
                            placeholder="e.g., Tech Stocks, Dividend Plays"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (Optional)</label>
                          <Textarea
                            placeholder="Describe the purpose of this watchlist..."
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditDialogOpen(false);
                            setEditingGroup(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRenameWatchlist}
                          disabled={renameGroupMutation.isPending || updateDescriptionMutation.isPending}
                        >
                          {renameGroupMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWatchlist(group.id);
                    }}
                    disabled={deleteGroupMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
