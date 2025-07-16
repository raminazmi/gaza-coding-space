import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'تم إرسال رسالتك بنجاح',
      description: 'سنتواصل معك قريبًا بإذن الله',
    });
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-hero flex items-center justify-center" dir="rtl">
      <div className="bg-gradient-card rounded-2xl shadow-elegant p-10 w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow mb-2">
            تواصل معنا
          </h1>
          <p className="text-xl text-muted-foreground">
            يمكنك التواصل معنا عبر النموذج التالي وسنرد عليك في أقرب وقت ممكن.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2" required placeholder="اكتب اسمك" />
                        </div>
                        <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2" required placeholder="اكتب بريدك الإلكتروني" />
          </div>
          <div>
            <Label htmlFor="subject">الموضوع</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2" required placeholder="موضوع الرسالة" />
          </div>
          <div>
            <Label htmlFor="message">الرسالة</Label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="rounded-xl shadow-elegant h-32 mt-2 p-3 resize-none" required placeholder="اكتب رسالتك هنا" />
          </div>
          <Button type="submit" size="lg" className="bg-gradient-primary hover:shadow-glow rounded-2xl mt-4">
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;