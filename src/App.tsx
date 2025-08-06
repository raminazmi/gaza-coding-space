import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Articles from "./pages/Articles";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Verify from './pages/Verify';
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CourseDetails from "./pages/CourseDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from '@/components/ui/BottomNavigation';
import LectureDetails from "./pages/LectureDetails";
import ScrollToTop from "./ScrollToTop";
import useAuth from '@/hooks/useAuth';
import { useLocation } from "react-router-dom";
import PortfolioDetails from "./pages/PortfolioDetails";
import OrderService from "./pages/OrderService";
import ServiceDetails from "./pages/ServiceDetails";
import Messenger from "./pages/Messenger";
import ChatRoom from "./pages/ChatRoom";
import ArticleDetails from "./pages/ArticleDetails";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ProtectedLectureRoute from "./components/ProtectedLectureRoute";
import MyCourses from "./pages/MyCourses";
import TeacherCourses from "./pages/TeacherCourses";

const queryClient = new QueryClient();

function PrivateRoute() {
  const { authService } = useAuth();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { authService, getToken } = useAuth();
  const isAuthenticated = authService.isAuthenticated();
  const token = getToken();

  if (isAuthenticated && token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function DefaultLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isMessengerPage = location.pathname.includes('/chat');

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {((isMessengerPage && !isMobile) || !isMessengerPage) && <Header />}
      <main className="flex-1"><Outlet /></main>
      {!isMessengerPage && <Footer />}
      {isMobile && <BottomNavigation />}
    </div>
  );
}

function NoHeaderFooterLayout() {
  return <div className="min-h-screen flex flex-col" dir="rtl"><Outlet /></div>;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner /> {/* Ensure Sonner is included for toasts */}
            <BrowserRouter basename="/">
              <ScrollToTop />
              <Routes>
                <Route element={<NoHeaderFooterLayout />}>
                  <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<Verify />} />
                  </Route>
                </Route>
                <Route element={<DefaultLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/courses/:id" element={<CourseDetails />} />
                  <Route element={<PrivateRoute />}>
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/teacher/:id" element={<TeacherCourses />} />
                    <Route path="/courses/:courseId/lecture/:lectureId" element={<LectureDetails />} />
                    <Route path="/chat" element={<Messenger />} />
                    <Route path="/chat/:id" element={<ChatRoom />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:id" element={<ArticleDetails />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:id" element={<ServiceDetails />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/portfolio/:id" element={<PortfolioDetails />} />
                  <Route path="/order-service" element={<OrderService />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;