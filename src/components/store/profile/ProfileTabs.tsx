'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User2, MapPin, Lock, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

import PersonalInfoForm from "./PersonalInfoForm";
import PasswordForm from "./PasswordForm";
import AddressesTab from "./AddressesTab";
import WishlistTab from "./WishlistTab";

export default function ProfileTabs({ user }: { user: any }) {
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  if (isLoading) {
    return (
      <div className="flex animate-pulse flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 h-64 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="w-full h-96 bg-gray-200 rounded-xl flex-1"></div>
      </div>
    );
  }

  if (!profile) return <div>Tải hồ sơ thất bại. Vui lòng làm mới trang.</div>;

  return (
    <Tabs defaultValue="info" className="flex flex-col md:flex-row gap-6 items-start">
      <TabsList className="flex md:flex-col h-auto justify-start border p-1 w-full md:w-64 rounded-xl bg-white md:sticky md:top-24 shadow-sm">
        <TabsTrigger value="info" className="w-full justify-start px-4 text-left py-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm rounded-lg mb-1 transition-all">
          <User2 className="mr-3 h-4 w-4" /> Thông Tin Cá Nhân
        </TabsTrigger>
        <TabsTrigger value="addresses" className="w-full justify-start px-4 text-left py-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm rounded-lg mb-1 transition-all">
          <MapPin className="mr-3 h-4 w-4" /> Địa Chỉ
        </TabsTrigger>
        <TabsTrigger value="password" className="w-full justify-start px-4 text-left py-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm rounded-lg mb-1 transition-all text-gray-900 border-transparent bg-transparent">
          <Lock className="mr-3 h-4 w-4" /> Đổi Mật Khẩu
        </TabsTrigger>
        <TabsTrigger value="wishlist" className="w-full justify-start px-4 text-left py-3 data-[state=active]:bg-gray-100 data-[state=active]:shadow-sm rounded-lg transition-all">
          <Heart className="mr-3 h-4 w-4" /> Yêu Thích
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 bg-white p-6 md:p-8 rounded-xl border shadow-sm w-full">
        <TabsContent value="info" className="mt-0 outline-none">
          <PersonalInfoForm profile={profile} />
        </TabsContent>
        <TabsContent value="addresses" className="mt-0 outline-none">
          <AddressesTab profile={profile} />
        </TabsContent>
        <TabsContent value="password" className="mt-0 outline-none">
          <PasswordForm />
        </TabsContent>
        <TabsContent value="wishlist" className="mt-0 outline-none">
          <WishlistTab wishlist={profile.wishlist} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
