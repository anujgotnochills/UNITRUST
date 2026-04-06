import { api } from './api';
import { BACKEND_URL } from '@/lib/constants';

export const ipfsService = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BACKEND_URL}/api/ipfs/upload-file`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },

  async uploadMetadata(metadata: Record<string, any>) {
    const res = await api.post('/ipfs/upload-metadata', metadata);
    return res.data;
  },
};
