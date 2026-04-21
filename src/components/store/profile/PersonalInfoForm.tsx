'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const localUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z.string().optional(),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof localUpdateProfileSchema>;

export default function PersonalInfoForm({ profile }: { profile: any }) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.user.updateProfile.useMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(localUpdateProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        utils.user.getProfile.invalidate();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile");
      }
    });
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
        <p className="text-gray-500 text-sm mb-6">Update your personal details here.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Your Phone Number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.jpg" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
