'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  type ProxyGatewayConfigView,
  type ProxyServiceView,
  type ProxyUpstreamKeyView,
  createProxyUpstreamKey,
  deleteProxyUpstreamKey,
  updateProxyGatewayConfig,
  updateProxyService,
  updateProxyUpstreamKey,
} from '@/actions/proxy-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProxyServicesIndexManagerProps {
  initialGatewayConfig: ProxyGatewayConfigView;
}

interface ProxyServiceDetailManagerProps {
  initialService: ProxyServiceView;
}

export function ProxyServicesIndexManager({
  initialGatewayConfig,
}: ProxyServicesIndexManagerProps) {
  const t = useTranslations('Settings.pages.proxyServices');
  const tSystem = useTranslations('Settings.pages.system');
  const [gatewayConfig, setGatewayConfig] = useState(initialGatewayConfig);
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGateway = async () => {
    if (!apiKey.trim()) {
      toast.error(t('gatewayApiKeyRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProxyGatewayConfig({ apiKey });
      if (result.success && result.data) {
        setGatewayConfig(result.data);
        setApiKey('');
        toast.success(t('gatewaySaved'));
      } else {
        toast.error(result.error || t('saveFailed'));
      }
    } catch (error) {
      toast.error(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('gatewayCardTitle')}</CardTitle>
          <CardDescription>{t('gatewayCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gatewayApiKey">{t('gatewayApiKey')}</Label>
            <Input
              id="gatewayApiKey"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={t('gatewayApiKeyPlaceholder')}
            />
            <p className="text-sm text-muted-foreground">
              {gatewayConfig.hasApiKey
                ? t('gatewayApiKeyConfigured', { hint: gatewayConfig.apiKeyHint || '****' })
                : t('gatewayApiKeyMissing')}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p>{t('gatewayUsageTitle')}</p>
            <code className="block rounded bg-background px-3 py-2 text-xs">
              Authorization: Bearer your_proxy_api_key
            </code>
          </div>

          <Button onClick={handleSaveGateway} disabled={isSaving}>
            {isSaving ? t('saving') : tSystem('saveChanges')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProxyServiceDetailManager({ initialService }: ProxyServiceDetailManagerProps) {
  const t = useTranslations('Settings.pages.proxyServices');
  const tSystem = useTranslations('Settings.pages.system');
  const [service, setService] = useState(initialService);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ProxyUpstreamKeyView | null>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    isActive: initialService.isActive,
    baseUrl: initialService.baseUrl,
    timeoutMs: String(initialService.timeoutMs),
    retryCount: String(initialService.retryCount),
  });
  const [keyForm, setKeyForm] = useState({
    name: '',
    apiKey: '',
    isActive: true,
  });

  const openDialog = (key?: ProxyUpstreamKeyView) => {
    if (key) {
      setEditingKey(key);
      setKeyForm({
        name: key.name,
        apiKey: '',
        isActive: key.isActive,
      });
    } else {
      setEditingKey(null);
      setKeyForm({
        name: '',
        apiKey: '',
        isActive: true,
      });
    }

    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingKey(null);
    setKeyForm({
      name: '',
      apiKey: '',
      isActive: true,
    });
  };

  const handleSaveService = async () => {
    setIsSavingService(true);
    try {
      const result = await updateProxyService({
        code: service.code,
        isActive: serviceForm.isActive,
        baseUrl: serviceForm.baseUrl,
        timeoutMs: Number(serviceForm.timeoutMs),
        retryCount: Number(serviceForm.retryCount),
      });

      if (result.success && result.data) {
        setService(result.data);
        toast.success(t('serviceSaved'));
      } else {
        toast.error(result.error || t('saveFailed'));
      }
    } catch (error) {
      toast.error(t('saveFailed'));
    } finally {
      setIsSavingService(false);
    }
  };

  const handleSaveKey = async () => {
    if (!keyForm.name.trim() || (!editingKey && !keyForm.apiKey.trim())) {
      toast.error(t('keyRequired'));
      return;
    }

    setIsSavingKey(true);
    try {
      const result = editingKey
        ? await updateProxyUpstreamKey({
            code: service.code,
            id: editingKey.id,
            name: keyForm.name,
            apiKey: keyForm.apiKey,
            isActive: keyForm.isActive,
          })
        : await createProxyUpstreamKey({
            code: service.code,
            name: keyForm.name,
            apiKey: keyForm.apiKey,
          });

      if (result.success && result.data) {
        setService((prev) => {
          const upstreamKeys = editingKey
            ? prev.upstreamKeys.map((item) => item.id === editingKey.id ? result.data! : item)
            : [...prev.upstreamKeys, result.data!];

          return {
            ...prev,
            upstreamKeys: upstreamKeys.sort((a, b) => a.order - b.order),
          };
        });
        toast.success(editingKey ? t('keyUpdated') : t('keyCreated'));
        closeDialog();
      } else {
        toast.error(result.error || t('saveFailed'));
      }
    } catch (error) {
      toast.error(t('saveFailed'));
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const result = await deleteProxyUpstreamKey({ code: service.code, id });
      if (result.success) {
        setService((prev) => ({
          ...prev,
          upstreamKeys: prev.upstreamKeys.filter((item) => item.id !== id),
        }));
        toast.success(t('keyDeleted'));
      } else {
        toast.error(result.error || t('deleteFailed'));
      }
    } catch (error) {
      toast.error(t('deleteFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('integrationCardTitle')}</CardTitle>
          <CardDescription>{t('integrationCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('proxyEntry')}</Label>
              <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                /api/proxy/{service.code}
              </code>
            </div>
            <div className="space-y-2">
              <Label>{t('authHeader')}</Label>
              <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
                Authorization: Bearer your_proxy_api_key
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('sampleRequest')}</Label>
            <code className="block rounded bg-muted px-3 py-2 text-xs break-all">
              {getSampleRequest(service.code)}
            </code>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {t('integrationHint')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('serviceDetailTitle', { name: service.name })}</CardTitle>
          <CardDescription>{t('serviceDetailDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="proxy-active" className="text-base font-medium">{t('serviceEnabled')}</Label>
              <p className="text-sm text-muted-foreground">
                {serviceForm.isActive ? t('enabledState') : t('disabledState')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('serviceEnabledHint')}
              </p>
            </div>
            <Switch
              id="proxy-active"
              checked={serviceForm.isActive}
              onCheckedChange={(checked) => setServiceForm((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="baseUrl">{t('baseUrl')}</Label>
                <a
                  href="https://api-dashboard.search.brave.com/app/documentation/web-search/query"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  {t('officialDocs')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Input
                id="baseUrl"
                value={serviceForm.baseUrl}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
                placeholder="https://api.search.brave.com/res/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeoutMs">{t('timeoutMs')}</Label>
              <Input
                id="timeoutMs"
                type="number"
                min={3000}
                max={60000}
                value={serviceForm.timeoutMs}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, timeoutMs: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retryCount">{t('retryCount')}</Label>
              <Input
                id="retryCount"
                type="number"
                min={0}
                max={5}
                value={serviceForm.retryCount}
                onChange={(event) => setServiceForm((prev) => ({ ...prev, retryCount: event.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleSaveService} disabled={isSavingService}>
            {isSavingService ? t('saving') : tSystem('saveChanges')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('keysCardTitle')}</CardTitle>
          <CardDescription>{t('keysCardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t('keysManageHint')}</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addKey')}
            </Button>
          </div>

          {service.upstreamKeys.length === 0 ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              {t('noKeys')}
            </div>
          ) : (
            <div className="grid gap-4">
              {service.upstreamKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{key.name}</h4>
                          {!key.isActive ? (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {t('inactive')}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('keyConfigured')}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDialog(key)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteKey(key.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">{t('status')}:</span>{' '}
                        <span>{key.isActive ? t('active') : t('inactive')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('failCount')}:</span>{' '}
                        <span>{key.failCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('lastUsedAt')}:</span>{' '}
                        <span>{formatDateTime(key.lastUsedAt, t('neverUsed'))}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('cooldownUntil')}:</span>{' '}
                        <span>{formatDateTime(key.cooldownUntil, t('notCooling'))}</span>
                      </div>
                    </div>

                    {key.lastError ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        {t('lastError')}: {key.lastError}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingKey ? t('editKey') : t('addKey')}</DialogTitle>
            <DialogDescription>
              {editingKey ? t('editKeyDescription') : t('addKeyDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">{t('keyName')}</Label>
              <Input
                id="keyName"
                value={keyForm.name}
                onChange={(event) => setKeyForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder={t('keyNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upstreamApiKey">{t('upstreamApiKey')}</Label>
              <Input
                id="upstreamApiKey"
                type="password"
                value={keyForm.apiKey}
                onChange={(event) => setKeyForm((prev) => ({ ...prev, apiKey: event.target.value }))}
                placeholder={editingKey ? t('updateApiKeyOptional') : t('upstreamApiKeyPlaceholder')}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label htmlFor="key-active">{t('keyEnabled')}</Label>
                <p className="text-sm text-muted-foreground">{keyForm.isActive ? t('enabledState') : t('disabledState')}</p>
              </div>
              <Switch
                id="key-active"
                checked={keyForm.isActive}
                onCheckedChange={(checked) => setKeyForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSavingKey}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveKey} disabled={isSavingKey}>
              {isSavingKey ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDateTime(value: Date | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Date(value).toLocaleString();
}

function getSampleRequest(code: string) {
  if (code === 'brave-search') {
    return "GET /api/proxy/brave-search/web/search?q=nextjs";
  }

  return `GET /api/proxy/${code}/...`;
}
