import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ProfileTabs from '@/components/store/profile/ProfileTabs';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">Cài đặt hồ sơ</h3>
          <p className="text-muted-foreground mt-2">
            Quản lý cài đặt tài khoản, địa chỉ và danh sách yêu thích của bạn.
          </p>
        </div>
        <ProfileTabs user={session.user} />
      </div>
    </div>
  );
}
