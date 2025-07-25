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
import { useAppSelector } from "@/hooks/useAppSelector";
import { useLocation } from "react-router-dom";
import PortfolioDetails from "./pages/PortfolioDetails";
import OrderService from "./pages/OrderService";
import Messenger from "./pages/Messenger";
import ChatRoom from "./pages/ChatRoom";
import ArticleDetails from "./pages/ArticleDetails";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import ProtectedLectureRoute from "./components/ProtectedLectureRoute";

const queryClient = new QueryClient();

function PrivateRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const token = localStorage.getItem('token');
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

function ReduxLogger() {
  const reduxUser = useAppSelector((state) => state.user.user);
  const reduxAuth = useAppSelector((state) => state.user.isAuthenticated);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner /> {/* Ensure Sonner is included for toasts */}
            <BrowserRouter>
              <ScrollToTop />
              <ReduxLogger />
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
                  <Route element={<PrivateRoute />}>
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetails />} />
                    <Route path="/courses/:courseId/lecture/:lectureId" element={
                      <ProtectedLectureRoute>
                        <LectureDetails />
                      </ProtectedLectureRoute>
                    } />
                    <Route path="/chat" element={<Messenger />} />
                    <Route path="/chat/:id" element={<ChatRoom />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/articles/:id" element={<ArticleDetails />} />
                  <Route path="/services" element={<Services />} />
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