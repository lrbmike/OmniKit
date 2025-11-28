'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconRenderer } from '@/components/icon-renderer';
import { createFolder, deleteMenuItem, moveMenuItem, updateMenuItem, addToolToMenu } from '@/actions/menu';
import { toast } from 'sonner';
import { FolderPlus, Trash2, ChevronUp, ChevronDown, Edit2, Save, X, Plus, Search, FolderOpen } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tool = any;

export function MenuEditor({ initialItems, tools }: { initialItems: MenuItem[], tools: Tool[] }) {
    const router = useRouter();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [toolSearch, setToolSearch] = useState('');

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        setIsCreatingFolder(true);
        const result = await createFolder(newFolderName, selectedFolderId);
        setIsCreatingFolder(false);
        setNewFolderName('');

        if (result.success) {
            toast.success('Folder created');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const result = await deleteMenuItem(id);
        if (result.success) {
            toast.success('Item deleted');
            if (selectedFolderId === id) setSelectedFolderId(null);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleMove = async (id: string, direction: 'up' | 'down') => {
        const result = await moveMenuItem(id, direction);
        if (result.success) {
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleAddTool = async (toolId: string) => {
        const result = await addToolToMenu(toolId, selectedFolderId);
        if (result.success) {
            toast.success('Tool added to menu');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const startEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setEditLabel(item.label || item.tool?.name || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditLabel('');
    };

    const saveEdit = async (id: string) => {
        const result = await updateMenuItem(id, { label: editLabel });
        if (result.success) {
            toast.success('Item updated');
            setEditingId(null);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const filteredTools = tools.filter(t => 
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) || 
        t.nameEn?.toLowerCase().includes(toolSearch.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Tool Library */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-2">Tool Library</h3>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search tools..."
                            className="pl-9"
                            value={toolSearch}
                            onChange={(e) => setToolSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredTools.map(tool => (
                        <div key={tool.id} className="flex items-center justify-between p-3 rounded-md border border-transparent hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-200 dark:hover:border-gray-700 group transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-md text-primary">
                                    <IconRenderer name={tool.icon} className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{tool.name}</div>
                                    <div className="text-xs text-gray-500">{tool.nameEn}</div>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={() => handleAddTool(tool.id)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Menu Structure */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold">Menu Structure</h3>
                        <p className="text-xs text-gray-500">
                            {selectedFolderId 
                                ? "Adding to selected folder" 
                                : "Adding to root directory"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                         {selectedFolderId && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFolderId(null)}>
                                Clear Selection
                            </Button>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    New Folder
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Folder</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Folder Name</Label>
                                        <Input
                                            id="name"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            placeholder="e.g., Development Tools"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {selectedFolderId ? "Will be created inside selected folder." : "Will be created at root level."}
                                        </p>
                                    </div>
                                    <Button onClick={handleCreateFolder} disabled={isCreatingFolder} className="w-full">
                                        Create Folder
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {initialItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                            <FolderOpen className="h-8 w-8 opacity-20" />
                            <p>Menu is empty</p>
                        </div>
                    )}

                    {initialItems.map((item) => (
                        <MenuItemRow
                            key={item.id}
                            item={item}
                            level={0}
                            onDelete={handleDelete}
                            onMove={handleMove}
                            onEdit={startEdit}
                            isEditing={editingId === item.id}
                            editLabel={editLabel}
                            setEditLabel={setEditLabel}
                            onSave={() => saveEdit(item.id)}
                            onCancel={cancelEdit}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={setSelectedFolderId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function MenuItemRow({
    item,
    level,
    onDelete,
    onMove,
    onEdit,
    isEditing,
    editLabel,
    setEditLabel,
    onSave,
    onCancel,
    selectedFolderId,
    onSelectFolder
}: {
    item: MenuItem,
    level: number,
    onDelete: (id: string) => void,
    onMove: (id: string, dir: 'up' | 'down') => void,
    onEdit: (item: MenuItem) => void,
    isEditing: boolean,
    editLabel: string,
    setEditLabel: (val: string) => void,
    onSave: () => void,
    onCancel: () => void,
    selectedFolderId: string | null,
    onSelectFolder: (id: string | null) => void
}) {
    const iconName = item.icon || item.tool?.icon || 'Circle';
    const displayName = item.label || item.tool?.name;
    const isSelected = selectedFolderId === item.id;

    const handleRowClick = (e: React.MouseEvent) => {
        // Prevent selection if clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) return;
        
        if (item.isFolder) {
            onSelectFolder(isSelected ? null : item.id);
        }
    };

    return (
        <>
            <div 
                className={cn(
                    "p-2 pl-[calc(0.75rem+var(--indent))] flex items-center gap-3 rounded-md group transition-colors cursor-default border border-transparent",
                    isSelected ? "bg-primary/10 border-primary/20" : "hover:bg-gray-50 dark:hover:bg-gray-750",
                    item.isFolder && "cursor-pointer"
                )}
                style={{ '--indent': `${level * 1.5}rem` } as React.CSSProperties}
                onClick={handleRowClick}
            >
                <div className={cn("text-gray-400", isSelected && "text-primary")}>
                    <IconRenderer name={iconName} className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="h-8 max-w-xs"
                                autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={onSave} className="h-8 w-8 text-green-600">
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8 text-red-600">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="font-medium text-sm flex items-center gap-2">
                            <span className="truncate">{displayName}</span>
                            {item.isFolder && (
                                <span className="text-[10px] h-5 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 inline-flex items-center">
                                    Folder
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {!isEditing && (
                        <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="h-8 w-8 text-gray-500">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => onMove(item.id, 'up')} className="h-8 w-8 text-gray-500">
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onMove(item.id, 'down')} className="h-8 w-8 text-gray-500">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            {/* Recursive rendering for children */}
            {item.children && item.children.length > 0 && (
                <div className="mt-1 space-y-1">
                    {item.children.map((child: MenuItem) => (
                        <MenuItemRow
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onDelete={onDelete}
                            onMove={onMove}
                            onEdit={onEdit}
                            isEditing={isEditing && false} // Only support editing one item at a time globally
                            editLabel={editLabel}
                            setEditLabel={setEditLabel}
                            onSave={onSave}
                            onCancel={onCancel}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
