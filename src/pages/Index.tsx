import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiBookOpen, FiAward, FiStar, FiCheck, FiCode, FiDollarSign, FiFileText } from 'react-icons/fi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { apiBaseUrl } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton';
import ServiceCardSkeleton from '@/components/ui/ServiceCardSkeleton';
import ServiceCard from '@/components/ui/ServiceCard';
import SEO from '@/components/SEO';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = React.useState<any[]>([]);
  const [course, setCourse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    students: 0,
    courses: 0,
    projects: 0,
    articles: 0
  });

  const fetchAllCourses = async (baseUrl: string, token: string | null) => {
    let allCourses: any[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const url = `${baseUrl}?page=${currentPage}`;
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await response.json();

        if (Array.isArray(data.data)) {
          allCourses = [...allCourses, ...data.data];

          if (data.meta && data.meta.current_page < data.meta.last_page) {
            currentPage++;
          } else {
            hasMorePages = false;
          }
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error('Error fetching page', currentPage, ':', error);
        hasMorePages = false;
      }
    }

    return allCourses;
  };

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const token = getToken();

      try {
        const courses = await fetchAllCourses(`${apiBaseUrl}/api/courses`, token);
        setFeaturedCourses(courses.slice(0, 4));
      } catch (error) {
        console.error('Error loading courses:', error);
        setFeaturedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const [featuredServices, setFeaturedServices] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${apiBaseUrl}/api/service`)
      .then(res => res.json())
      .then(data => {
        setFeaturedServices((data.services || []).slice(0, 3));
      });
  }, []);

  React.useEffect(() => {
    fetch(`${apiBaseUrl}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  const getCategoryName = (id: number | string) => {
    const cat = categories.find((c: any) => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bookIconRef = useRef<HTMLDivElement>(null);
  const codeIconRef = useRef<HTMLDivElement>(null);
  const heroIllustration = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f4bb.svg";
  const ctaIllustration = "https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/1f393.svg";
  const navigate = useNavigate();
  const { getToken } = useAuth();

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Statistics`);
        const data = await response.json();
        setStats({
          students: data.students || 0,
          courses: data.courses || 0,
          projects: data.projects || 0,
          articles: data.articles || 0
        });
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    gsap.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
        }
      }
    );

    if (bookIconRef.current) {
      gsap.to(bookIconRef.current, {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: -100, y: 100 },
            { x: -200, y: 200 },
            { x: -300, y: 300 },
            { x: -400, y: 400 },
          ],
          curviness: 1.5,
          autoRotate: false
        },
        scrollTrigger: {
          trigger: coursesRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
          markers: false
        }
      });
    }

    if (codeIconRef.current) {
      gsap.to(codeIconRef.current, {
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: 100, y: 100 },
            { x: 200, y: 200 },
            { x: 300, y: 300 },
            { x: 400, y: 400 },
          ],
          curviness: 1.5,
          autoRotate: false
        },
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
          markers: false
        }
      });
    }

    gsap.fromTo(coursesRef.current?.querySelectorAll('.course-card') || [],
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.2,
        scrollTrigger: {
          trigger: coursesRef.current,
          start: "top 80%",
        }
      }
    );

    gsap.fromTo(servicesRef.current?.querySelectorAll('.service-card') || [],
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.2,
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 80%",
        }
      }
    );

    gsap.fromTo(ctaRef.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        }
      }
    );

    const floatingElements = document.querySelectorAll('.floating');
    floatingElements.forEach(el => {
      gsap.to(el, {
        y: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  function cleanMediaUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    return `${apiBaseUrl}/storage/${url}`;
  }

  return (
    <div className="" dir="rtl">
      <SEO
        title="منصة التعليم التقني الرائدة"
        description="ART TEBU - منصة رائدة في التعليم التقني والبرمجة. تعلم البرمجة، تطوير الويب، الذكاء الاصطناعي، والتطبيقات المحمولة مع خبراء معتمدين."
        keywords="تعليم البرمجة, دورات البرمجة, تطوير الويب, الذكاء الاصطناعي, التطبيقات المحمولة, JavaScript, React, Python, تعليم تقني"
        type="website"
        image="/assests/art_tebu.jpg"
      />
      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-14 md:pb-20 md:pt-6" ref={heroRef}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl floating"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full blur-3xl floating"></div>
        </div>

        <div className="mx-auto px-2 md:px-20 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-right max-w-2xl mx-auto md:mx-0">
            <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow mb-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              مرحبًا بك في منصة ARTTEBU
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              منصة تعليمية رائدة في تعليم البرمجة وتطوير التطبيقات للطلاب
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu text-lg md:text-xl"
              >
                ابدأ التعلم الآن
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 transform-gpu text-lg md:text-xl"
              >
                تواصل معنا
                <FiArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end items-center">
            <img src={heroIllustration} alt="تعلم البرمجة" className="w-[340px] md:w-[420px] floating" loading="lazy" />
          </div>
        </div>
        <svg className="absolute left-0 top-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 320"><path fill="#6366f1" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900" >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiUsers className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">{stats.students}+</h3>
              <p className="text-muted-foreground">طالب مسجل</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiBookOpen className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">{stats.courses}+</h3>
              <p className="text-muted-foreground">دورة تعليمية</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiAward className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">{stats.projects}+</h3>
              <p className="text-muted-foreground">مشروع مكتمل</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiFileText className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">{stats.articles}+</h3>
              <p className="text-muted-foreground">مقالة تعليمية</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden" ref={coursesRef}>
        <div
          ref={bookIconRef}
          className="absolute top-0 right-0 z-0 opacity-20 text-primary"
        >
          <FiBookOpen className="w-16 h-16" />
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <path
            d="M100% 0 Q 80% 20%, 70% 40% T 50% 70% T 30% 90% T 0 100%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="h2 text-lg md:text-xl lg:text-2xl font-bold mb-4">أحدث الدورات</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              اكتشف أفضل الدورات التعليمية في مجال البرمجة وتطوير التطبيقات
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading
              ? [...Array(4)].map((_, i) => <CourseCardSkeleton key={i} />)
              : featuredCourses.map(course => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col h-full course-card"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="relative">
                    {(course.image) && (
                      <img
                        src={cleanMediaUrl(course.image)}
                        alt={course.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      {course.category && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
                          {course.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-2 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{course.name}</h3>

                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <FiUsers /> {course.enroll_count ?? course.Enroll_count ?? 0} طلاب
                      </span>
                      <span className="h-1 w-1 bg-gray-400 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <FiBookOpen /> {course.lecture_count ?? course.Lecture_count ?? 0} محاضرة
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-base mb-5 flex-1 line-clamp-2">
                      {course.discription || course.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-primary font-bold text-lg flex items-center gap-0.5">
                        {course.salary ? course.salary : 'مجاني'}
                        {course.salary == 'مجاني' ? '' : <FiDollarSign />}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-xl bg-gradient-primary hover:shadow-glow px-4 py-2 text-white font-medium text-sm transition-all"
                          onClick={e => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}
                        >
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform-gpu hover:scale-105"
            >
              عرض جميع الدورات
              <FiArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden" ref={servicesRef}>
        <div
          ref={codeIconRef}
          className="absolute top-0 left-0 z-0 opacity-20 text-primary"
        >
          <FiCode className="w-16 h-16" />
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <path
            d="M0 0 Q 20% 20%, 30% 40% T 50% 70% T 70% 90% T 100% 100%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="h2 text-lg md:text-xl lg:text-2xl font-bold mb-4">خدماتنا</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              نقدم مجموعة شاملة من الخدمات التقنية لتطوير مشاريعك
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.length === 0
              ? [...Array(3)].map((_, i) => <ServiceCardSkeleton key={i} />)
              : featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => navigate(`/services/${service.id}`)}
                  showOrderButton={false}
                  categoryName={getCategoryName(service.category_id)}
                />
              ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-primary text-white relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/20"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl floating"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl floating"></div>
        </div>

        <div className="container mx-auto px-2 md:px-20 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-right">
            <h2 className="h2 text-3xl md:text-4xl font-bold mb-6">ابدأ رحلتك في عالم البرمجة اليوم</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              انضم إلى مجتمعنا التعليمي واكتشف عالم البرمجة مع أفضل المدربين والموارد التعليمية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center md:items-start">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg md:text-xl"
              >
                سجل الآن مجاناً
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all duration-300 text-lg md:text-xl"
              >
                استعرض الدورات
                <FiArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end items-center mt-10 md:mt-0">
            <img src={ctaIllustration} alt="ابدأ رحلتك" className="w-[320px] md:w-[380px] floating" loading="lazy" />
          </div>
        </div>
        <svg className="absolute right-0 bottom-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 320"><path fill="#fff" fillOpacity="0.1" d="M0,288L60,272C120,256,240,224,360,197.3C480,171,600,149,720,154.7C840,160,960,192,1080,197.3C1200,203,1320,181,1380,170.7L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
      </section>
    </div>
  );
};

export default Index;