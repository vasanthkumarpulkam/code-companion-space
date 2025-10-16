import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

export default function JobFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Budget Range</Label>
          <Slider defaultValue={[0, 1000]} max={1000} step={50} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>$1000+</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Location</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="austin" />
              <label htmlFor="austin" className="text-sm">Austin</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="dallas" />
              <label htmlFor="dallas" className="text-sm">Dallas</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="houston" />
              <label htmlFor="houston" className="text-sm">Houston</label>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Posted</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="today" />
              <label htmlFor="today" className="text-sm">Today</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="week" />
              <label htmlFor="week" className="text-sm">This Week</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="month" />
              <label htmlFor="month" className="text-sm">This Month</label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
