import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-32 md:py-40 flex items-center min-h-[70vh]">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gaza-blue/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gaza-purple/30 rounded-full blur-3xl animate-pulse" />
      <div className="container relative z-10 flex flex-col items-center justify-center gap-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="h1">
              <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
                تعلم البرمجة وتطوير التطبيقات
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              منصة تعليمية رائدة في تعليم البرمجة وتطوير التطبيقات
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              انضم إلى مجتمعنا التعليمي واكتشف عالم البرمجة مع أفضل المدربين وأحدث التقنيات
            </p>
          </div>
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <FiSearch className="absolute top-1/2 -translate-y-1/2 h-6 w-6 text-primary right-4 transition-transform group-focus-within:scale-110" />
                <Input
                  type="text"
                  placeholder="ابحث عن الدورات والمقالات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 text-lg bg-card/70 backdrop-blur border-2 border-primary/20 focus:border-primary rounded-2xl shadow-elegant transition-all duration-300 pr-14 pl-4"
                />
              </div>
            </form>
          </div>
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-6">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-10 py-6 h-auto rounded-2xl shadow-elegant hover:scale-105"
            >
              <Link to="/courses">
                ابدأ التعلم الآن
                <FiArrowRight className="h-5 w-5 rotate-180" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="text-lg px-10 py-6 h-auto border-2 border-primary rounded-2xl hover:bg-primary/10 hover:shadow-glow"
            >
              <Link to="/courses">
                استكشف الدورات
              </Link>
            </Button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center bg-white/70 dark:bg-card/80 rounded-xl shadow-elegant p-6 hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-gaza-blue">500+</div>
              <div className="text-sm text-muted-foreground">طالب نشط</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-card/80 rounded-xl shadow-elegant p-6 hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-gaza-purple">50+</div>
              <div className="text-sm text-muted-foreground">دورة متخصصة</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-card/80 rounded-xl shadow-elegant p-6 hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-gaza-orange">98%</div>
              <div className="text-sm text-muted-foreground">معدل الرضا</div>
            </div>
            <div className="text-center bg-white/70 dark:bg-card/80 rounded-xl shadow-elegant p-6 hover:scale-105 transition-transform">
              <div className="text-3xl md:text-4xl font-bold text-gaza-blue">24/7</div>
              <div className="text-sm text-muted-foreground">دعم متواصل</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;