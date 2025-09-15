export function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  return fetch('/api/images', {
    method: 'POST',
    body: formData,
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Image upload failed');
      }
      return res.json();
    })
    .then((data) => data.url as string);
}
