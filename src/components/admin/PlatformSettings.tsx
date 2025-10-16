import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Save, AlertCircle, DollarSign, Mail, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PlatformSettings() {
  const [settings, setSettings] = useState({
    // Fee settings
    platformFeePercentage: 10,
    minJobBudget: 20,
    maxJobBudget: 10000,
    
    // Email settings
    emailNotifications: true,
    welcomeEmails: true,
    jobAlerts: true,
    
    // Platform settings
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    
    // Moderation
    autoModeration: true,
    requireJobApproval: false,
  });

  const handleSave = () => {
    // In a real app, this would save to a database
    toast({
      title: 'Settings saved',
      description: 'Platform settings have been updated successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="fees">
        <TabsList>
          <TabsTrigger value="fees">Fees & Pricing</TabsTrigger>
          <TabsTrigger value="email">Email & Notifications</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fee Configuration
              </CardTitle>
              <CardDescription>
                Manage platform fees and job budget limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Platform Fee Percentage</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={settings.platformFeePercentage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platformFeePercentage: Number(e.target.value),
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    % per transaction (charged to both parties)
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Job Budget</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      value={settings.minJobBudget}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minJobBudget: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Job Budget</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      value={settings.maxJobBudget}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxJobBudget: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Current Settings:</strong> {settings.platformFeePercentage}% fee
                  charged to both customer and provider. Job budgets must be between $
                  {settings.minJobBudget} and ${settings.maxJobBudget}.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for platform events
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Welcome Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send welcome email to new users
                  </p>
                </div>
                <Switch
                  checked={settings.welcomeEmails}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, welcomeEmails: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Job Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts for new job postings
                  </p>
                </div>
                <Switch
                  checked={settings.jobAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, jobAlerts: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>
                General platform settings and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    Maintenance Mode
                    {settings.maintenanceMode && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable platform access for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable new users to create accounts
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewRegistrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowNewRegistrations: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireEmailVerification: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>
                Configure content moderation and approval settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Moderation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically filter inappropriate content
                  </p>
                </div>
                <Switch
                  checked={settings.autoModeration}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoModeration: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Job Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    New job posts must be approved by admins
                  </p>
                </div>
                <Switch
                  checked={settings.requireJobApproval}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireJobApproval: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
