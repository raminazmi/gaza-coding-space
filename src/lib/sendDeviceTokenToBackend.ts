export async function sendDeviceTokenToBackend(fcmToken: string) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('token', fcmToken);

  const res = await fetch('https://gazacodingspace.mahmoudalbatran.com/api/device-tokens', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  return data;
} 