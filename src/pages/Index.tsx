import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiUsers, FiBookOpen, FiAward, FiStar, FiClock, FiPlay, FiCheck, FiCode } from 'react-icons/fi';
import { courses } from '@/data/courses';
import { services } from '@/data/services';
import { siteConfig } from '@/data';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const Index = () => {
  const featuredCourses = courses.filter(course => course.isPopular).slice(0, 3);
  const featuredServices = services.filter(service => service.isPopular).slice(0, 3);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bookIconRef = useRef<HTMLDivElement>(null);
  const codeIconRef = useRef<HTMLDivElement>(null);

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

    gsap.utils.toArray(statsRef.current?.querySelectorAll('.stat-item') || []).forEach((item: any) => {
      const count = item.querySelector('h3')?.textContent?.replace('+', '') || 0;
      const obj = { num: 0 };
      
      gsap.to(obj, {
        num: count,
        duration: 2,
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
        },
        onUpdate: () => {
          if (item.querySelector('h3')) {
            item.querySelector('h3').textContent = Math.floor(obj.num) + (count > 100 ? '+' : '');
          }
        }
      });
    });

    if (bookIconRef.current) {
      gsap.to(bookIconRef.current, {
        motionPath: {
          path: [
            {x: 0, y: 0},
            {x: -100, y: 100},
            {x: -200, y: 200},
            {x: -300, y: 300},
            {x: -400, y: 400},
          ],
          curviness: 1.5,
          autoRotate: true
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
            {x: 0, y: 0},
            {x: 100, y: 100},
            {x: 200, y: 200},
            {x: 300, y: 300},
            {x: 400, y: 400},
          ],
          curviness: 1.5,
          autoRotate: true
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

  return (
    <div className="min-h-screen overflow-x-hidden" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32" ref={heroRef}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/3 -right-1/4 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl floating"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full blur-3xl floating"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow mb-6">
              مرحبًا بك في منصة غزة كودنج سبيس
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              منصة تعليمية رائدة في تعليم البرمجة وتطوير التطبيقات للطلاب في غزة وفلسطين
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform-gpu"
              >
                ابدأ التعلم الآن
                <FiArrowLeft className="h-5 w-5" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300 transform-gpu"
              >
                تواصل معنا
                <FiArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900" ref={statsRef}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiUsers className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">0+</h3>
              <p className="text-muted-foreground">طالب مسجل</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiBookOpen className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">0+</h3>
              <p className="text-muted-foreground">دورة تعليمية</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiAward className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">0+</h3>
              <p className="text-muted-foreground">مشروع مكتمل</p>
            </div>
            <div className="text-center stat-item">
              <div className="flex justify-center mb-4">
                <FiStar className="h-12 w-12 text-primary floating" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">0.0</h3>
              <p className="text-muted-foreground">تقييم الطلاب</p>
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
            <h2 className="h2 text-lg md:text-xl lg:text-2xl font-bold mb-4">الدورات المميزة</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              اكتشف أفضل الدورات التعليمية في مجال البرمجة وتطوير التطبيقات
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden course-card transform-gpu hover:-translate-y-1"
              >
                <div className="relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {course.isPopular && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      مميز
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{course.category}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{course.level}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{course.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <FiStar className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{course.rating}</span>
                      <span className="text-sm text-muted-foreground">({course.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FiClock className="h-4 w-4" />
                      <span>{course.duration} ساعة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {course.isFree ? 'مجاني' : `$${course.price}`}
                    </span>
                    <Link 
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      عرض التفاصيل
                      <FiArrowLeft className="h-4 w-4" />
                    </Link>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => (
              <div 
                key={service.id} 
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-all duration-300 service-card transform-gpu hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center floating">
                    <FiCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FiCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">${service.price.starting}</span>
                    <span className="text-sm text-muted-foreground">ابتداءً من</span>
                  </div>
                  <Link 
                    to="/services"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
                  >
                    المزيد من التفاصيل
                    <FiArrowLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
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
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="h2 text-lg md:text-xl lg:text-2xl font-bold mb-6">ابدأ رحلتك في عالم البرمجة اليوم</h2>
          <p className="text-sm md:text-base mb-8 max-w-2xl mx-auto opacity-90">
            انضم إلى مجتمعنا التعليمي واكتشف عالم البرمجة مع أفضل المدربين والموارد التعليمية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform-gpu hover:scale-105"
            >
              سجل الآن مجاناً
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <Link 
              to="/courses"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all duration-300 transform-gpu hover:scale-105"
            >
              استعرض الدورات
              <FiArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
              <p className="text-muted-foreground">{siteConfig.contact.email}</p>
              <p className="text-muted-foreground">{siteConfig.contact.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">موقعنا</h3>
              <p className="text-muted-foreground">{siteConfig.contact.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;