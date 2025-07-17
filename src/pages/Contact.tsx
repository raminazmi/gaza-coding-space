import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

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
    <div className="container py-8 flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center mb-4 p-0">
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            تواصل معنا
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-500 dark:text-gray-300 mb-0">
            يمكنك التواصل معنا عبر النموذج التالي وسنرد عليك في أقرب وقت ممكن.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" required placeholder="اكتب اسمك" />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" required placeholder="اكتب بريدك الإلكتروني" />
            </div>
            <div>
              <Label htmlFor="subject">الموضوع</Label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" required placeholder="موضوع الرسالة" />
            </div>
            <div>
              <Label htmlFor="message">الرسالة</Label>
              <Textarea id="message" name="message" value={formData.message} onChange={handleChange} className="rounded-xl shadow-elegant min-h-[120px] h-32 mt-2 p-3 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus-visible:ring-2 focus-visible:ring-blue-400" required placeholder="اكتب رسالتك هنا" />
            </div>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 py-3 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white">
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;