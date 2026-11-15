import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useActiveLearner } from '@/src/hooks/useActiveLearner';
import { useCreateLearnerMutation } from '@/src/hooks/useLearnerQueries';

const createLearnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Learner name must be at least 2 characters.')
    .max(60, 'Learner name must be under 60 characters.'),
  learning_track: z
    .string()
    .trim()
    .min(2, 'Please enter a course or learning track.')
    .max(80, 'Learning track must be under 80 characters.'),
  goal: z
    .string()
    .trim()
    .max(160, 'Learning goal must be under 160 characters.')
    .optional(),
});

type CreateLearnerFormValues = z.infer<typeof createLearnerSchema>;

export function CreateLearnerDialog() {
  const { isCreateDialogOpen, setCreateDialogOpen, connectionInfo } = useActiveLearner();
  const createMutation = useCreateLearnerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLearnerFormValues>({
    resolver: zodResolver(createLearnerSchema),
    defaultValues: {
      name: '',
      learning_track: 'CS1 Python Foundations',
      goal: '',
    },
  });

  const onSubmit = async (values: CreateLearnerFormValues) => {
    await createMutation.mutateAsync({
      name: values.name,
      learning_track: values.learning_track,
      goal: values.goal || undefined,
    });
    reset();
  };

  return (
    <Dialog
      open={isCreateDialogOpen}
      onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Learner Profile</DialogTitle>
          <DialogDescription>
            {connectionInfo.mode === 'live'
              ? 'Registers a new learner via POST /learners with an empty Knowledge Twin ready for diagnostic assessment.'
              : 'Creates a clean-slate Demo Mode learner profile so you can test the full assessment and Knowledge Twin flow.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="learner-name">Learner Name</Label>
            <Input
              id="learner-name"
              placeholder="e.g., Elena Vance"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[#EF4444]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="learning-track">Learning Track / Course</Label>
            <Input
              id="learning-track"
              placeholder="e.g., CS1 Python Foundations"
              {...register('learning_track')}
            />
            {errors.learning_track && (
              <p className="text-xs text-[#EF4444]">{errors.learning_track.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="learning-goal">Target Goal (Optional)</Label>
            <Input
              id="learning-goal"
              placeholder="e.g., Build mastery in loops and conditionals"
              {...register('goal')}
            />
            {errors.goal && (
              <p className="text-xs text-[#EF4444]">{errors.goal.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating Profile...' : 'Create Learner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
