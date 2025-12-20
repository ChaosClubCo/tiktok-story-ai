import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthRequired, LoadingSpinner } from '@/components/shared';
import {
  ProfileSettings,
  NotificationPreferences,
  PasswordChange,
  LinkedAccounts,
} from '@/components/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Lock, Link2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { user, loading } = useAuth();
  usePageTitle('Settings');

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <AuthRequired user={user} loading={loading}>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and security settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Accounts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile"><ProfileSettings /></TabsContent>
            <TabsContent value="notifications"><NotificationPreferences /></TabsContent>
            <TabsContent value="security"><PasswordChange /></TabsContent>
            <TabsContent value="accounts"><LinkedAccounts /></TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthRequired>
  );
}
