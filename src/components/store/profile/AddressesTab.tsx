'use client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import AddressForm from '../AddressForm';

export default function AddressesTab({ profile }: { profile: any }) {
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.user.deleteAddress.useMutation();
  const updateMutation = trpc.user.updateAddress.useMutation();

  const addresses = profile?.addresses || [];

  const handleDelete = (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    deleteMutation.mutate({ addressId }, {
      onSuccess: () => {
        utils.user.getProfile.invalidate();
        toast.success("Address deleted");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete address");
      }
    });
  };

  const handleSetDefault = (address: any) => {
    updateMutation.mutate({
      addressId: address._id,
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      isDefault: true
    }, {
      onSuccess: () => {
        utils.user.getProfile.invalidate();
        toast.success("Default address updated");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update default address");
      }
    });
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold">Add New Address</h3>
            <p className="text-sm text-gray-500 mt-1">Fill in the details for your new delivery location.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
        <AddressForm onSuccess={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-1">Shipping Addresses</h3>
          <p className="text-gray-500 text-sm">Manage your delivery locations.</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl bg-gray-50">
          <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-gray-500">You haven't added any addresses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((address: any) => (
            <div key={address._id} className={`p-5 flex flex-col rounded-xl border ${address.isDefault ? 'border-black shadow-sm bg-gray-50/50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{address.fullName}</h4>
                  {address.isDefault && (
                    <span className="bg-black text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" /> Default
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-6 flex-1">
                <p>{address.phone}</p>
                <p>{address.street}</p>
                <p>{address.ward}, {address.district}</p>
                <p>{address.province}</p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200" onClick={() => handleDelete(address._id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
                {!address.isDefault && (
                  <Button variant="secondary" size="sm" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900" onClick={() => handleSetDefault(address)}>
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
