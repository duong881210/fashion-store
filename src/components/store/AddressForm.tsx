'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const localAddressSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Phone must be at least 9 digits'),
  province: z.string().min(1, 'Please select a province'),
  district: z.string().min(1, 'Please select a district'),
  ward: z.string().min(1, 'Please select a ward'),
  street: z.string().min(1, 'Please enter street address'),
  isDefault: z.boolean()
});

type AddressFormValues = z.infer<typeof localAddressSchema>;

export default function AddressForm({ onSuccess }: { onSuccess?: () => void }) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const utils = trpc.useUtils();
  const addAddressMutation = trpc.user.addAddress.useMutation();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(localAddressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      isDefault: false
    }
  });

  const selectedProvinceName = form.watch('province');
  const selectedDistrictName = form.watch('district');

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(r => r.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Failed to load provinces", err));
  }, []);

  const selectedProvince = provinces.find(p => p.name === selectedProvinceName);
  const districts = selectedProvince?.districts || [];
  
  const selectedDistrict = districts.find((d: any) => d.name === selectedDistrictName);
  const wards = selectedDistrict?.wards || [];

  const onSubmit = (values: AddressFormValues) => {
    addAddressMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Address added successfully!");
        utils.user.getProfile.invalidate();
        form.reset();
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to add address');
      }
    });
  };

  const isSubmitting = isPending || addAddressMutation.isPending;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
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
                    <Input placeholder="0901234567" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province / City</FormLabel>
                <Select disabled={isSubmitting} onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue('district', '');
                    form.setValue('ward', '');
                  }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map(p => (
                      <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select disabled={isSubmitting || !selectedProvinceName} onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue('ward', '');
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts.map((d: any) => (
                        <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ward</FormLabel>
                  <Select disabled={isSubmitting || !selectedDistrictName} onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wards.map((w: any) => (
                        <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="House number, street name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Set as default address</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? 'Saving...' : 'Save Address'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
