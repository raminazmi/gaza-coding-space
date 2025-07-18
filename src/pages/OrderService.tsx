import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const OrderService = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const service_id = params.get('service_id') || '';
  const { id } = useParams();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    country: '',
    service_id: service_id,
    Job_title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [service, setService] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/api/orders`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.messages || 'تم ارسال طلبك. سوف  يتم التواصل معك قريبا');
        setForm({
          name: '', phone: '', email: '', country: '', service_id: service_id, Job_title: '', description: ''
        });
      } else {
        setError(data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch {
      setError('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/service/${id}`)
      .then(res => res.json())
      .then(data => {
        setService(data.service || null);
        if (data.service && data.service.name) {
          localStorage.setItem('breadcrumb_service_name', data.service.name);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen pt-0 pb-16" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center mb-4 p-0">
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            طلب خدمة
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-500 dark:text-gray-300 mb-0">
            يرجى تعبئة النموذج التالي لطلب الخدمة وسيتم التواصل معك في أقرب وقت.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {success && <div className="bg-green-100 text-green-800 rounded p-3 mb-4 text-center">{success}</div>}
          {error && <div className="bg-red-100 text-red-800 rounded p-3 mb-4 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input type="hidden" name="service_id" value={form.service_id} />
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="ادخل اسمك" className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="ادخل رقم الجوال" className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="ادخل البريد الإلكتروني" className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="country">الدولة</Label>
              <Input id="country" name="country" value={form.country} onChange={handleChange} required placeholder="ادخل الدولة" className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="Job_title">المسمى الوظيفي</Label>
              <Input id="Job_title" name="Job_title" value={form.Job_title} onChange={handleChange} required placeholder="ادخل المسمى الوظيفي" className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" />
            </div>
            <div>
              <Label htmlFor="description">وصف الطلب</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} required placeholder="اكتب تفاصيل الطلب" className="rounded-xl shadow-elegant min-h-[120px] h-32 mt-2 p-3 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus-visible:ring-2 focus-visible:ring-blue-400" />
            </div>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 py-3 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderService; 