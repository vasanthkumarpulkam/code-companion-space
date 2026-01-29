import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar } from 'lucide-react';

interface JobCardProps {
  job: any;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Badge variant="secondary">{job.categories?.name}</Badge>
              <h3 className="font-semibold text-lg line-clamp-1">{job.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-foreground">${job.budget}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {job.profiles?.full_name?.[0] || 'U'}
            </div>
            <span className="text-sm">{job.profiles?.full_name || 'Anonymous'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
