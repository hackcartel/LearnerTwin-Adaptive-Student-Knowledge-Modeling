import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import type { RecommendationResponse } from '@/src/types/api';

interface RecommendationCardProps {
  recommendation?: RecommendationResponse;
  isLoading: boolean;
}

export function RecommendationCard({
  recommendation,
  isLoading,
}: RecommendationCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return null;
  }

  const targetHref = `/assessments?concept=${recommendation.recommended_concept_id}`;

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-medium text-[#4F46E5]">
          <Compass className="h-4 w-4" />
          <span>Recommended Next Activity</span>
        </div>
        <CardTitle className="pt-1 text-lg">
          {recommendation.activity_title}
        </CardTitle>
        <CardDescription>
          Target Concept: {recommendation.recommended_concept_title}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm leading-relaxed text-[#64748B]">
          {recommendation.reason}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link to={targetHref}>
              <span>Start Practice</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/learning-path">View Learning Path</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
