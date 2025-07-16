import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Features = () => {
  const features = [
    {
      id: 1,
      icon: '🎯',
      gradient: 'from-gaza-blue to-gaza-purple',
      bgColor: 'bg-gaza-blue/10',
      title: 'مسارات تعليمية متخصصة',
      description: 'نوفر لك مسارات تعليمية متكاملة في مختلف مجالات البرمجة والتقنية.'
    },
    {
      id: 2,
      icon: '👨‍💻',
      gradient: 'from-gaza-purple to-gaza-orange',
      bgColor: 'bg-gaza-purple/10',
      title: 'مدربون محترفون',
      description: 'تعلم على يد نخبة من المدربين ذوي الخبرة في سوق العمل.'
    },
    {
      id: 3,
      icon: '🏆',
      gradient: 'from-gaza-orange to-gaza-blue',
      bgColor: 'bg-gaza-orange/10',
      title: 'شهادات معتمدة',
      description: 'احصل على شهادات معتمدة بعد إتمام الدورات بنجاح.'
    },
    {
      id: 4,
      icon: '🤝',
      gradient: 'from-gaza-blue to-gaza-purple',
      bgColor: 'bg-gaza-blue/10',
      title: 'مجتمع تفاعلي',
      description: 'انضم إلى مجتمع نشط من المتعلمين والمدربين وشارك خبراتك.'
    },
  ];

  return (
    <section className="section bg-gradient-card">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-2 rounded-xl shadow-elegant">
            ✨ مميزات المنصة
          </Badge>
          <h2 className="h2">
            مميزات المنصة
          </h2>
          <p className="text-xl text-muted-foreground">
            اكتشف أبرز ما يميز غزة كودنج سبيس عن غيرها من المنصات التعليمية
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="group relative overflow-hidden border-0 bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-500 hover:-translate-y-2 rounded-2xl"
            >
              <CardContent className="p-10 text-center space-y-4">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {/* Gradient overlay on hover */}
                <div className={`absolute top-[-35px] inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-card/50 backdrop-blur rounded-full px-8 py-4 shadow-elegant">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs text-white font-bold">{i}</span>
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold">آلاف الطلاب</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-muted-foreground">انضم إلى مجتمعنا الآن</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;