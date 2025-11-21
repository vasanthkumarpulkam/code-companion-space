import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Star, Zap, Award, CheckCircle, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const BADGE_TYPES = [
  { value: 'verified', label: 'Verified', icon: CheckCircle, color: 'text-blue-500' },
  { value: 'top_rated', label: 'Top Rated', icon: Star, color: 'text-yellow-500' },
  { value: 'fast_response', label: 'Fast Response', icon: Zap, color: 'text-green-500' },
  { value: 'quality_pro', label: 'Quality Pro', icon: Award, color: 'text-purple-500' },
  { value: 'background_checked', label: 'Background Checked', icon: Shield, color: 'text-red-500' },
];

export function BadgeManagement() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedBadgeType, setSelectedBadgeType] = useState('');
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProviders();
    fetchAllBadges();
  }, []);

  const fetchProviders = async () => {
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, profiles(id, full_name, email)')
      .eq('role', 'provider');

    if (rolesData) {
      const providersList = rolesData
        .map((r: any) => r.profiles)
        .filter((p: any) => p !== null);
      setProviders(providersList);
    }
    setLoading(false);
  };

  const fetchAllBadges = async () => {
    const { data } = await supabase
      .from('provider_badges')
      .select('*, profiles(full_name, email)')
      .order('issued_at', { ascending: false });

    setBadges(data || []);
  };

  const handleAssignBadge = async () => {
    if (!selectedProvider || !selectedBadgeType) {
      toast({
        title: 'Error',
        description: 'Please select both provider and badge type',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('provider_badges').insert({
      provider_id: selectedProvider,
      badge_type: selectedBadgeType,
      verified_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Badge assigned successfully!',
      });
      setSelectedProvider('');
      setSelectedBadgeType('');
      fetchAllBadges();
    }
  };

  const handleRevokeBadge = async (badgeId: string) => {
    const { error } = await supabase
      .from('provider_badges')
      .delete()
      .eq('id', badgeId);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Badge revoked successfully',
      });
      fetchAllBadges();
    }
  };

  const filteredBadges = badges.filter((badge) =>
    badge.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    badge.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assign Badge</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Badge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Provider Badge</DialogTitle>
                  <DialogDescription>
                    Select a provider and badge type to assign
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.full_name} ({provider.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Badge Type</Label>
                    <Select value={selectedBadgeType} onValueChange={setSelectedBadgeType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_TYPES.map((badge) => {
                          const Icon = badge.icon;
                          return (
                            <SelectItem key={badge.value} value={badge.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${badge.color}`} />
                                {badge.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAssignBadge}>Assign Badge</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Badges</CardTitle>
          <Input
            placeholder="Search by provider name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Badge Type</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBadges.map((badge) => {
                const badgeType = BADGE_TYPES.find((b) => b.value === badge.badge_type);
                const Icon = badgeType?.icon || CheckCircle;
                return (
                  <TableRow key={badge.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{badge.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{badge.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Icon className={`h-3 w-3 ${badgeType?.color}`} />
                        {badgeType?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(badge.issued_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeBadge(badge.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
