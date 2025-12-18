import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';

export function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    setCategories(data || []);
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          icon: formData.icon
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Failed to update category: ' + error.message);
      } else {
        toast.success('Category updated successfully');
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          icon: formData.icon
        });

      if (error) {
        toast.error('Failed to create category: ' + error.message);
      } else {
        toast.success('Category created successfully');
        resetForm();
        fetchCategories();
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId: string, name: string) => {
    // Check if category has jobs
    const { count } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (count && count > 0) {
      toast.error(`Cannot delete "${name}" - it has ${count} associated jobs`);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast.error('Failed to delete category: ' + error.message);
    } else {
      toast.success('Category deleted successfully');
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: '' });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update the category details' : 'Create a new service category'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: editingCategory ? formData.slug : generateSlug(name)
                    });
                  }}
                  placeholder="e.g. Cleaning"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. cleaning"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Lucide icon name)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g. Sparkles, Truck, TreeDeciduous"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Service Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>{category.icon || '-'}</TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}