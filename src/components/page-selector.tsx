"use client";

import { useState } from "react";
import { useDesignerStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function PageSelector() {
  const { pages, currentPageId, addPage, renamePage, deletePage, setCurrentPage } = useDesignerStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddPage = () => {
    if (newPageName.trim()) {
      addPage(newPageName.trim());
      setNewPageName("");
      setIsDialogOpen(false);
      toast({
        title: "Page Added",
        description: `Page "${newPageName}" has been added.`,
      });
    }
  };

  const handleRenamePage = () => {
    if (editingPageId && newPageName.trim()) {
      renamePage(editingPageId, newPageName.trim());
      setNewPageName("");
      setEditingPageId(null);
      setIsDialogOpen(false);
      toast({
        title: "Page Renamed",
        description: `Page has been renamed to "${newPageName}".`,
      });
    }
  };

  const handleDeletePage = (pageId: string) => {
    deletePage(pageId);
    toast({
      title: "Page Deleted",
      description: "Page has been deleted.",
    });
  };

  const openEditDialog = (pageId: string, pageName: string) => {
    setEditingPageId(pageId);
    setNewPageName(pageName);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingPageId(null);
    setNewPageName("");
    setIsDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 overflow-x-auto max-w-md">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center">
            <Button
              variant={currentPageId === page.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page.id)}
              className="text-sm"
            >
              {page.name}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(page.id, page.name)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePage(page.id)}
                  disabled={pages.length <= 1}
                  className={pages.length <= 1 ? "text-gray-400" : "text-red-600"}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={openAddDialog}>
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPageId ? "Rename Page" : "Add New Page"}</DialogTitle>
            <DialogDescription>
              {editingPageId ? "Enter a new name for this page." : "Enter a name for your new page."}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Page name"
            className="mt-2"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingPageId ? handleRenamePage : handleAddPage}>{editingPageId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
