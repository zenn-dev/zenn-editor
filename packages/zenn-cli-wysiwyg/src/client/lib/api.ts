import { showToast } from './toast';

export async function uploadImage(file: File, slug: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`/api/images/${slug}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json();
    showToast(data.message, 'error');
    throw new Error(data.message);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
