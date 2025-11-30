'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, StarOff } from 'lucide-react';
import { 
  createAiProvider, 
  updateAiProvider, 
  deleteAiProvider, 
  setDefaultAiProvider,
  type AiProvider 
} from '@/actions/ai-provider';

interface AiProvidersManagerProps {
  initialProviders: AiProvider[];
}

export function AiProvidersManager({ initialProviders }: AiProvidersManagerProps) {
  const t = useTranslations('Settings.pages.aiProviders');
  const [providers, setProviders] = useState<AiProvider[]>(initialProviders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AiProvider | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'openai',
    baseUrl: '',
    apiKey: '',
    model: '',
  });

  const handleOpenDialog = (provider?: AiProvider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        type: provider.type,
        baseUrl: provider.baseUrl,
        apiKey: provider.apiKey || '',
        model: provider.model,
      });
    } else {
      setEditingProvider(null);
      setFormData({
        name: '',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-3.5-turbo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProvider(null);
    setFormData({
      name: '',
      type: 'openai',
      baseUrl: '',
      apiKey: '',
      model: '',
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.baseUrl || !formData.model) {
      toast.error(t('errorRequired'));
      return;
    }

    setIsLoading(true);
    try {
      if (editingProvider) {
        // 更新
        const result = await updateAiProvider({
          id: editingProvider.id,
          name: formData.name,
          type: formData.type,
          baseUrl: formData.baseUrl,
          apiKey: formData.apiKey,
          model: formData.model,
        });

        if (result.success && result.data) {
          setProviders(prev => prev.map(p => p.id === editingProvider.id ? result.data! : p));
          toast.success(t('updateSuccess'));
          handleCloseDialog();
        } else {
          toast.error(result.error || t('updateFailed'));
        }
      } else {
        // 创建
        const result = await createAiProvider(formData);

        if (result.success && result.data) {
          setProviders(prev => [...prev, result.data!]);
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
      const result = await deleteAiProvider(id);

      if (result.success) {
        setProviders(prev => prev.filter(p => p.id !== id));
        toast.success(t('deleteSuccess'));
      } else {
        toast.error(result.error || t('deleteFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await setDefaultAiProvider(id);

      if (result.success && result.data) {
        setProviders(prev => prev.map(p => ({
          ...p,
          isDefault: p.id === id,
        })));
        toast.success(t('setDefaultSuccess'));
      } else {
        toast.error(result.error || t('setDefaultFailed'));
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
          {t('addProvider')}
        </Button>
      </div>

      <div className="grid gap-4">
        {providers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">{t('noProviders')}</p>
            </CardContent>
          </Card>
        ) : (
          providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{provider.name}</CardTitle>
                    {provider.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        {t('defaultBadge')}
                      </span>
                    )}
                    {!provider.isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {t('inactiveBadge')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!provider.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(provider.id)}
                        disabled={isLoading}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(provider)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                      disabled={isLoading || provider.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {provider.baseUrl}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('model')}:</span>
                    <span className="ml-2">{provider.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('type')}:</span>
                    <span className="ml-2">{provider.type}</span>
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
              {editingProvider ? t('editProvider') : t('addProvider')}
            </DialogTitle>
            <DialogDescription>
              {editingProvider ? t('editDescription') : t('addDescription')}
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
              <Label htmlFor="type">{t('type')}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI Compatible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">{t('baseUrl')}</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">{t('model')}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="gpt-3.5-turbo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('apiKey')}</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
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
