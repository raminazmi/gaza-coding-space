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

const queryClient = new QueryClient();

// مكون الحماية
function PrivateRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const token = localStorage.getItem('token') ;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// مكون حماية للصفحات العامة فقط
function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const token = localStorage.getItem('token');
  if (isAuthenticated && token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// 1. تعريف Layout افتراضي
function DefaultLayout() {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      {isMobile && <BottomNavigation />}
    </div>
  );
}

// 2. تعريف Layout فارغ
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
            <Sonner />
            <BrowserRouter>
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
                  <Route element={<PrivateRoute />}>
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetails />} />
                    <Route path="/courses/:courseId/lecture/:lectureId" element={<LectureDetails />} />
                  </Route>
                  <Route path="/articles" element={<Articles />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/portfolio" element={<Portfolio />} />
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
