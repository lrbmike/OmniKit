'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  createTinyPngAccount,
  updateTinyPngAccount,
  deleteTinyPngAccount,
  type TinyPngAccount
} from '@/actions/tiny-png';

interface TinyPngAccountsManagerProps {
  initialAccounts: TinyPngAccount[];
}

export function TinyPngAccountsManager({ initialAccounts }: TinyPngAccountsManagerProps) {
  const t = useTranslations('Settings.pages.tinyPngAccounts');
  const [accounts, setAccounts] = useState<TinyPngAccount[]>(initialAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TinyPngAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
  });

  const handleOpenDialog = (account?: TinyPngAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        apiKey: account.apiKey,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        apiKey: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      name: '',
      apiKey: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.apiKey) {
      toast.error(t('errorRequired'));
      return;
    }

    setIsLoading(true);
    try {
      if (editingAccount) {
        // 更新
        const result = await updateTinyPngAccount({
          id: editingAccount.id,
          name: formData.name,
          apiKey: formData.apiKey,
        });

        if (result.success && result.data) {
          setAccounts(prev => prev.map(a => a.id === editingAccount.id ? result.data! : a));
          toast.success(t('updateSuccess'));
          handleCloseDialog();
        } else {
          toast.error(result.error || t('updateFailed'));
        }
      } else {
        // 创建
        const result = await createTinyPngAccount(formData);

        if (result.success && result.data) {
          setAccounts(prev => [...prev, result.data!]);
          toast.success(t('createSuccess'));
          handleCloseDialog();
        } else {
          toast.error(result.error || t('createFailed'));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    setIsLoading(true);
    try {
      const result = await deleteTinyPngAccount(id);

      if (result.success) {
        setAccounts(prev => prev.filter(a => a.id !== id));
        toast.success(t('deleteSuccess'));
      } else {
        toast.error(result.error || t('deleteFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t('manageHint')}
        </p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addAccount')}
        </Button>
      </div>

      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
        <span className="text-muted-foreground">{t('getApiKeysInfo')}</span>
        <a
          href="https://tinypng.com/developers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          {t('consoleLink')}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid gap-4">
        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">{t('noAccounts')}</p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{account.name}</CardTitle>
                    {!account.isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {t('inactiveBadge')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(account)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('apiKey')}:</span>
                    <span className="ml-2 font-mono">{account.apiKey ? '********' : t('notConfigured')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('status')}:</span>
                    <span className="ml-2">{account.isActive ? t('active') : t('inactive')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? t('editAccount') : t('addAccount')}
            </DialogTitle>
            <DialogDescription>
              {editingAccount ? t('editDescription') : t('addDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('apiKey')}</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={t('apiKeyPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}