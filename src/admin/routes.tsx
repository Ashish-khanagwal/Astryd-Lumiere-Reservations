import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequireRole } from './guards/RequireRole';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminLoginPage } from './pages/auth/SuperAdminLoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { ReservationsPage } from './pages/reservations/ReservationsPage';
import { HomepageSectionsPage } from './pages/website/HomepageSectionsPage';
import { SectionEditorPage } from './pages/website/SectionEditorPage';
import { HeaderSettingsPage } from './pages/website/HeaderSettingsPage';
import { BrandSettingsPage } from './pages/website/BrandSettingsPage';
import { MediaLibraryPage } from './pages/website/MediaLibraryPage';
import { CategoriesPage } from './pages/menu/CategoriesPage';
import { MenuItemsPage } from './pages/menu/MenuItemsPage';
import { MenuItemFormPage } from './pages/menu/MenuItemFormPage';
import { AddonsPage } from './pages/menu/AddonsPage';
import { OffersPage } from './pages/menu/OffersPage';
import { InformationPage } from './pages/restaurant/InformationPage';
import { ContactPage } from './pages/restaurant/ContactPage';
import { HoursPage } from './pages/restaurant/HoursPage';
import { SocialMediaPage } from './pages/restaurant/SocialMediaPage';
import { AccountPage } from './pages/settings/AccountPage';
import { UsersPage } from './pages/settings/UsersPage';
import { PagesPage } from './pages/settings/PagesPage';
import { SuperAdminSitesPage } from './pages/superadmin/SitesPage';

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/admin/superadmin/login" element={<SuperAdminLoginPage />} />

      <Route path="/admin" element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reservations" element={<ReservationsPage />} />

          <Route path="website/homepage" element={<HomepageSectionsPage />} />
          <Route path="website/homepage/:type" element={<SectionEditorPage />} />
          <Route path="website/header" element={<HeaderSettingsPage />} />
          <Route path="website/branding" element={<BrandSettingsPage />} />
          <Route path="website/media" element={<MediaLibraryPage />} />

          <Route path="menu/categories" element={<CategoriesPage />} />
          <Route path="menu/items" element={<MenuItemsPage />} />
          <Route path="menu/items/:itemId" element={<MenuItemFormPage />} />
          <Route path="menu/addons" element={<AddonsPage />} />
          <Route path="menu/offers" element={<OffersPage />} />

          <Route path="restaurant/information" element={<InformationPage />} />
          <Route path="restaurant/contact" element={<ContactPage />} />
          <Route path="restaurant/hours" element={<HoursPage />} />
          <Route path="restaurant/social" element={<SocialMediaPage />} />

          <Route path="settings/account" element={<AccountPage />} />
          <Route path="settings/pages" element={<PagesPage />} />
          <Route element={<RequireRole allow={['owner', 'super_admin']} />}>
            <Route path="settings/users" element={<UsersPage />} />
          </Route>
          <Route element={<RequireRole allow={['super_admin']} />}>
            <Route path="superadmin/sites" element={<SuperAdminSitesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
