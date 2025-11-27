'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconRenderer } from '@/components/icon-renderer';
import { createFolder, deleteMenuItem, moveMenuItem, updateMenuItem } from '@/actions/menu';
import { toast } from 'sonner';
import { FolderPlus, Trash2, ChevronUp, ChevronDown, Edit2, Save, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuItem = any;

export function MenuEditor({ initialItems }: { initialItems: MenuItem[] }) {
    const router = useRouter();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        setIsCreatingFolder(true);
        const result = await createFolder(newFolderName);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Menu Structure</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
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
                            </div>
                            <Button onClick={handleCreateFolder} disabled={isCreatingFolder} className="w-full">
                                Create Folder
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {initialItems.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No menu items found. Create a folder or add tools from the library.
                    </div>
                )}

                {initialItems.map((item) => (
                    <MenuItemRow
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        onMove={handleMove}
                        onEdit={startEdit}
                        isEditing={editingId === item.id}
                        editLabel={editLabel}
                        setEditLabel={setEditLabel}
                        onSave={() => saveEdit(item.id)}
                        onCancel={cancelEdit}
                    />
                ))}
            </div>
        </div>
    );
}

function MenuItemRow({
    item,
    onDelete,
    onMove,
    onEdit,
    isEditing,
    editLabel,
    setEditLabel,
    onSave,
    onCancel
}: {
    item: MenuItem,
    onDelete: (id: string) => void,
    onMove: (id: string, dir: 'up' | 'down') => void,
    onEdit: (item: MenuItem) => void,
    isEditing: boolean,
    editLabel: string,
    setEditLabel: (val: string) => void,
    onSave: () => void,
    onCancel: () => void
}) {
    const iconName = item.icon || item.tool?.icon || 'Circle';
    const displayName = item.label || item.tool?.name;

    return (
        <div className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 group">
            <div className="text-gray-400">
                <IconRenderer name={iconName} className="h-5 w-5" />
            </div>

            <div className="flex-1">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="h-8 max-w-xs"
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
                        {displayName}
                        {item.isFolder && <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">Folder</span>}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    );
}
