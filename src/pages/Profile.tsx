import React, { useEffect, useState, useRef } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiUser, FiMail, FiPhone, FiCamera, FiEdit2 } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone_number: '' });
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${apiBaseUrl}/api/student`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
        });
      })
      .catch(() => setError('تعذر جلب بيانات المستخدم'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setSuccess('');
    setError('');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone_number', form.phone_number);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/update-profile`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSuccess(data.message || 'تم تحديث البيانات بنجاح');
      } else {
        setError(data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch {
      setError('حدث خطأ أثناء التحديث');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPhoto(file);
    setPhotoLoading(true);
    setSuccess('');
    setError('');
    const formData = new FormData();
    formData.append('profile_photo_path', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/update-photo-profile`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSuccess(data.message || 'تم تحديث الصورة بنجاح');
      } else {
        setError(data.message || 'حدث خطأ أثناء تحديث الصورة');
      }
    } catch {
      setError('حدث خطأ أثناء تحديث الصورة');
    } finally {
      setPhotoLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen pt-4 pb-16 px-2" dir="rtl">
      <Card className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-10 flex flex-col gap-6">
        <CardHeader className="flex flex-col items-center gap-2 mb-2 p-0">
          <div className="relative group mb-2">
            <img
              src={user?.profile_photo_url || '/default-avatar.png'}
              alt={user?.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 dark:border-blue-900 shadow-lg bg-gray-200 dark:bg-gray-700"
            />
            <button
              type="button"
              className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-all border-2 border-white dark:border-gray-800"
              onClick={() => fileInputRef.current?.click()}
              title="تغيير الصورة"
            >
              <FiCamera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoChange}
              disabled={photoLoading}
              placeholder="اختر صورة جديدة"
            />
            {photoLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-full"><Loading /></div>}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</CardTitle>
          <span className="text-gray-500 dark:text-gray-300 text-sm">{user?.email}</span>
        </CardHeader>
        <CardContent className="p-0">
          {success && <div className="bg-green-100 text-green-800 rounded p-3 mb-4 text-center">{success}</div>}
          {error && <div className="bg-red-100 text-red-800 rounded p-3 mb-4 text-center">{error}</div>}
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="block mb-1 font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><FiUser /> الاسم</label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required className="rounded-xl h-12 mt-2 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><FiMail /> البريد الإلكتروني</label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="rounded-xl h-12 mt-2 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="phone_number" className="block mb-1 font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><FiPhone /> رقم الجوال</label>
              <Input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} required className="rounded-xl h-12 mt-2 text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600" />
            </div>
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 py-3 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white" disabled={editLoading}>
              {editLoading ? 'جاري الحفظ...' : <><FiEdit2 className="inline mr-2" /> حفظ التعديلات</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 