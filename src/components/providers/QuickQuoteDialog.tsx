import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QuickQuoteDialogProps {
  providerId: string;
  providerName: string;
}

export function QuickQuoteDialog({ providerId, providerName }: QuickQuoteDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    location: '',
    preferredPricing: 'either' as 'hourly' | 'fixed' | 'either',
    urgency: 'flexible' as 'urgent' | 'soon' | 'flexible',
  });

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Please login to request quotes" });
      navigate('/auth/login');
      return;
    }

    if (!formData.categoryId || !formData.title || !formData.description || !formData.location) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('quote_requests').insert({
        customer_id: user.id,
        provider_id: providerId,
        category_id: formData.categoryId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        preferred_pricing: formData.preferredPricing,
        urgency: formData.urgency,
      });

      if (error) throw error;

      toast({ title: `Quote request sent to ${providerName}!` });
      setOpen(false);
      setFormData({
        categoryId: '',
        title: '',
        description: '',
        location: '',
        preferredPricing: 'either',
        urgency: 'flexible',
      });
    } catch (error: any) {
      toast({ title: 'Error sending quote request', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) loadCategories();
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <Zap className="mr-2 h-5 w-5" />
          Request Quick Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Quick Quote from {providerName}</DialogTitle>
          <DialogDescription>
            Provide details about your project and get a fast response
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Project Title * (min 10 characters)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Need house cleaning this weekend"
              minLength={10}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description * (min 20 characters)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you need done..."
              className="min-h-32"
              minLength={20}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, State or ZIP"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricing">Preferred Pricing</Label>
              <Select value={formData.preferredPricing} onValueChange={(value: any) => setFormData({ ...formData, preferredPricing: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="either">Either</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="soon">Within a week</SelectItem>
                  <SelectItem value="urgent">ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Sending...' : 'Send Quote Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}