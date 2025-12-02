import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export function ProviderSettingsEditor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    available_now: false,
    accepts_fixed: true,
    accepts_hourly: true,
    accepts_instant_bookings: false,
    hourly_rate: 0,
    service_radius_miles: 25,
    response_time_hours: 24,
    bio_headline: '',
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('provider_settings')
      .select('*')
      .eq('provider_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        available_now: data.available_now ?? false,
        accepts_fixed: data.accepts_fixed ?? true,
        accepts_hourly: data.accepts_hourly ?? true,
        accepts_instant_bookings: data.accepts_instant_bookings ?? false,
        hourly_rate: data.hourly_rate ?? 0,
        service_radius_miles: data.service_radius_miles ?? 25,
        response_time_hours: data.response_time_hours ?? 24,
        bio_headline: data.bio_headline ?? '',
      });
    } else if (!error || error.code === 'PGRST116') {
      // No settings found, create default
      await supabase.from('provider_settings').insert({
        provider_id: user.id,
        ...settings,
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('provider_settings')
        .upsert({
          provider_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast({ title: 'Settings saved successfully!' });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Manage your availability and response settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="available_now">Available Now</Label>
              <p className="text-sm text-muted-foreground">
                Show that you're available for immediate bookings
              </p>
            </div>
            <Switch
              id="available_now"
              checked={settings.available_now}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, available_now: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="instant_bookings">Accept Instant Bookings</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to book you without approval
              </p>
            </div>
            <Switch
              id="instant_bookings"
              checked={settings.accepts_instant_bookings}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, accepts_instant_bookings: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_time">
              Average Response Time: {settings.response_time_hours} hours
            </Label>
            <Slider
              id="response_time"
              min={1}
              max={72}
              step={1}
              value={[settings.response_time_hours]}
              onValueChange={([value]) =>
                setSettings({ ...settings, response_time_hours: value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Services</CardTitle>
          <CardDescription>Configure your service offerings and rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accepts_fixed">Accept Fixed-Price Jobs</Label>
              <p className="text-sm text-muted-foreground">
                Work on jobs with a set budget
              </p>
            </div>
            <Switch
              id="accepts_fixed"
              checked={settings.accepts_fixed}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, accepts_fixed: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="accepts_hourly">Accept Hourly Jobs</Label>
              <p className="text-sm text-muted-foreground">
                Work on jobs billed by the hour
              </p>
            </div>
            <Switch
              id="accepts_hourly"
              checked={settings.accepts_hourly}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, accepts_hourly: checked })
              }
            />
          </div>

          {settings.accepts_hourly && (
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="5"
                value={settings.hourly_rate}
                onChange={(e) =>
                  setSettings({ ...settings, hourly_rate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service_radius">
              Service Radius: {settings.service_radius_miles} miles
            </Label>
            <Slider
              id="service_radius"
              min={5}
              max={100}
              step={5}
              value={[settings.service_radius_miles]}
              onValueChange={([value]) =>
                setSettings({ ...settings, service_radius_miles: value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Bio</CardTitle>
          <CardDescription>Short headline for your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio_headline">Bio Headline</Label>
            <Textarea
              id="bio_headline"
              placeholder="e.g., Professional cleaner with 10+ years experience"
              value={settings.bio_headline}
              onChange={(e) =>
                setSettings({ ...settings, bio_headline: e.target.value })
              }
              maxLength={150}
            />
            <p className="text-sm text-muted-foreground">
              {settings.bio_headline.length}/150 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
