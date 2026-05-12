import { createAdminDashboardPage } from "../pages/admin/dashboard-page.js";
import { createAdminBlocklistPage } from "../pages/admin/blocklist-page.js";
import { createAdminBookingsPage } from "../pages/admin/bookings-page.js";
import { createAdminParkingRatePage } from "../pages/admin/parking-rate-page.js";
import { createAdminReportsPage } from "../pages/admin/reports-page.js";
import { createAdminUserDetailsPage } from "../pages/admin/user-details-page.js";
import { createAdminUsersPage } from "../pages/admin/users-page.js";
import { createCashierDashboardPage } from "../pages/cashier/dashboard-page.js";
import { createCashierBookingsPage } from "../pages/cashier/bookings-page.js";
import { createCashierNotificationsPage } from "../pages/cashier/notifications-page.js";
import { createCashierPaymentPage } from "../pages/cashier/payment-page.js";
import { createCashierParkingRatePage } from "../pages/cashier/parking-rate-page.js";
import { createCashierReceiptPage } from "../pages/cashier/receipt-page.js";
import { createCashierUserDetailsPage } from "../pages/cashier/user-details-page.js";
import { createCashierUsersPage } from "../pages/cashier/users-page.js";
import { createForgotPasswordPage } from "../pages/public/forgot-password-page.js";
import { createPublicHomePage } from "../pages/public/home-page.js";
import { createLoginPage } from "../pages/public/login-page.js";
import { createRegisterPage } from "../pages/public/register-page.js";
import { createResetPasswordPage } from "../pages/public/reset-password-page.js";
import { createStatusPage } from "../pages/public/status-page.js";
import { createVerifyPage } from "../pages/public/verify-page.js";
import { createUserDashboardPage } from "../pages/user/dashboard-page.js";
import { createUserBookPage } from "../pages/user/book-page.js";
import { createUserBookingsPage } from "../pages/user/bookings-page.js";
import { createUserNotificationsPage } from "../pages/user/notifications-page.js";
import { createUserParkingCostPage } from "../pages/user/parking-cost-page.js";
import { createUserProfilePage } from "../pages/user/profile-page.js";
import { createUserSelectSlotPage } from "../pages/user/select-slot-page.js";

export const routes = [
  {
    path: "/",
    title: "Royal Service Parking",
    access: "public",
    createPage: createPublicHomePage
  },
  {
    path: "/register",
    title: "Register",
    access: "guest",
    createPage: createRegisterPage
  },
  {
    path: "/register-success",
    title: "Registration Successful",
    access: "guest",
    createPage: (context) =>
      createStatusPage(context, {
        eyebrow: "Registration complete",
        tone: "success",
        iconText: "OK",
        title: "Check your email to verify the account",
        description:
          "Your registration was accepted. The next step is clicking the verification link sent by the backend email service.",
        detail: context.query.get("email")
          ? `Verification instructions were requested for ${context.query.get("email")}.`
          : "Open the mailbox tied to the account and follow the verification link before trying to sign in.",
        actions: [
          { href: "/login", label: "Go to login", variant: "button--primary" },
          { href: "/", label: "Back to home" }
        ]
      })
  },
  {
    path: "/forgot-password",
    title: "Forgot Password",
    access: "guest",
    createPage: createForgotPasswordPage
  },
  {
    path: "/forgot-password-confirmation",
    title: "Reset Email Sent",
    access: "guest",
    createPage: (context) =>
      createStatusPage(context, {
        eyebrow: "Recovery requested",
        tone: "info",
        iconText: "MAIL",
        title: "Password reset instructions are on the way",
        description:
          "If the account is verified and recognized by the backend, a password reset link has been sent.",
        detail: context.query.get("email")
          ? `Check the inbox and spam folder for ${context.query.get("email")}.`
          : "Check the inbox and spam folder of the email you submitted.",
        actions: [
          { href: "/login", label: "Back to login", variant: "button--primary" },
          { href: "/", label: "Back to home" }
        ]
      })
  },
  {
    path: "/reset-password",
    title: "Reset Password",
    access: "guest",
    createPage: createResetPasswordPage
  },
  {
    path: "/reset-success",
    title: "Password Reset Successful",
    access: "guest",
    createPage: (context) =>
      createStatusPage(context, {
        eyebrow: "Password updated",
        tone: "success",
        iconText: "OK",
        title: "Your password has been reset",
        description:
          "The backend accepted the new password. You can now use it to sign in again through the shared login page.",
        detail: "Return to the login screen and continue with the updated credentials.",
        actions: [
          { href: "/login?reset=true", label: "Proceed to login", variant: "button--primary" },
          { href: "/", label: "Back to home" }
        ]
      })
  },
  {
    path: "/verify",
    title: "Verify Email",
    access: "public",
    createPage: createVerifyPage
  },
  {
    path: "/login",
    title: "Login",
    access: "guest",
    createPage: createLoginPage
  },
  {
    path: "/login/user",
    access: "guest",
    redirectTo: "/login"
  },
  {
    path: "/login/cashier",
    access: "guest",
    redirectTo: "/login"
  },
  {
    path: "/login/admin",
    access: "guest",
    redirectTo: "/login"
  },
  {
    path: "/user",
    access: { role: "USER" },
    redirectTo: "/user/dashboard"
  },
  {
    path: "/cashier",
    access: { role: "CASHIER" },
    redirectTo: "/cashier/dashboard"
  },
  {
    path: "/admin",
    access: { role: "ADMIN" },
    redirectTo: "/admin/dashboard"
  },
  {
    path: "/user/dashboard",
    title: "User Dashboard",
    access: { role: "USER" },
    createPage: createUserDashboardPage
  },
  {
    path: "/user/profile",
    title: "My Profile",
    access: { role: "USER" },
    createPage: createUserProfilePage
  },
  {
    path: "/user/book",
    title: "Book Parking",
    access: { role: "USER" },
    createPage: createUserBookPage
  },
  {
    path: "/user/select-slot",
    title: "Select Slot",
    access: { role: "USER" },
    createPage: createUserSelectSlotPage
  },
  {
    path: "/user/bookings",
    title: "My Bookings",
    access: { role: "USER" },
    createPage: createUserBookingsPage
  },
  {
    path: "/user/notifications",
    title: "Notifications",
    access: { role: "USER" },
    createPage: createUserNotificationsPage
  },
  {
    path: "/user/parking-cost",
    title: "Parking Cost",
    access: { role: "USER" },
    createPage: createUserParkingCostPage
  },
  {
    path: "/cashier/dashboard",
    title: "Cashier Dashboard",
    access: { role: "CASHIER" },
    createPage: createCashierDashboardPage
  },
  {
    path: "/cashier/users",
    title: "Cashier Users",
    access: { role: "CASHIER" },
    createPage: createCashierUsersPage
  },
  {
    path: "/cashier/users/detail",
    title: "Cashier User Details",
    access: { role: "CASHIER" },
    createPage: createCashierUserDetailsPage
  },
  {
    path: "/cashier/bookings",
    title: "Cashier Bookings",
    access: { role: "CASHIER" },
    createPage: createCashierBookingsPage
  },
  {
    path: "/cashier/bookings/payment",
    title: "Cashier Payment",
    access: { role: "CASHIER" },
    createPage: createCashierPaymentPage
  },
  {
    path: "/cashier/bookings/receipt",
    title: "Cashier Receipt",
    access: { role: "CASHIER" },
    createPage: createCashierReceiptPage
  },
  {
    path: "/cashier/notifications",
    title: "Cashier Notifications",
    access: { role: "CASHIER" },
    createPage: createCashierNotificationsPage
  },
  {
    path: "/cashier/parking-cost",
    title: "Cashier Parking Rate",
    access: { role: "CASHIER" },
    createPage: createCashierParkingRatePage
  },
  {
    path: "/admin/dashboard",
    title: "Admin Dashboard",
    access: { role: "ADMIN" },
    createPage: createAdminDashboardPage
  },
  {
    path: "/admin/users",
    title: "Admin Users",
    access: { role: "ADMIN" },
    createPage: createAdminUsersPage
  },
  {
    path: "/admin/users/detail",
    title: "Admin User Details",
    access: { role: "ADMIN" },
    createPage: createAdminUserDetailsPage
  },
  {
    path: "/admin/bookings",
    title: "Admin Bookings",
    access: { role: "ADMIN" },
    createPage: createAdminBookingsPage
  },
  {
    path: "/admin/parking-cost",
    title: "Admin Parking Rate",
    access: { role: "ADMIN" },
    createPage: createAdminParkingRatePage
  },
  {
    path: "/admin/blocklist",
    title: "Admin Blocklist",
    access: { role: "ADMIN" },
    createPage: createAdminBlocklistPage
  },
  {
    path: "/admin/reports",
    title: "Admin Reports",
    access: { role: "ADMIN" },
    createPage: createAdminReportsPage
  }
];
