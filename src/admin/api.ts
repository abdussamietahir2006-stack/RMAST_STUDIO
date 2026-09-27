import { request } from '../lib/api';
import { AdminUser, InquiryStatus, LeadStats, MediaAsset, PostSize, SocialPost, SocialVideo, StoredInquiry, VideoStyle, MusicMood } from '../types';

export { ApiError } from '../lib/api';

export const adminApi = {
  me: () => request<{ user: AdminUser }>('/api/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: AdminUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  logoutAll: () => request<void>('/api/auth/logout-all', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/api/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  stats: () =>
    request<LeadStats>(`/api/admin/stats?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`),
  leads: (params: { division?: string; group?: string; status?: string; q?: string; limit?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v)
        .map(([k, v]) => [k, String(v)])
    );
    return request<StoredInquiry[]>(`/api/admin/leads?${qs}`);
  },
  setStatus: (id: string, status: InquiryStatus) =>
    request<void>(`/api/admin/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteLead: (id: string) => request<void>(`/api/admin/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  socialPosts: () => request<{ posts: SocialPost[]; ready: boolean; autoPost: boolean }>('/api/admin/social'),
  setAutoPost: (autoPost: boolean) =>
    request<void>('/api/admin/social/settings', { method: 'PUT', body: JSON.stringify({ autoPost }) }),
  // Creates today's automatic idea if it doesn't exist yet (safe to call repeatedly)
  socialToday: () => request<SocialPost>('/api/admin/social/today', { method: 'POST' }),
  socialExtra: () => request<SocialPost>('/api/admin/social/extra', { method: 'POST' }),
  // The founder's own idea (or ready-written slides) turned into a post; slides: 4-10 or 'auto'
  socialFromIdea: (brief: string, slides: number | 'auto', style: VideoStyle | 'surprise', size: PostSize) =>
    request<SocialPost>('/api/admin/social/custom', { method: 'POST', body: JSON.stringify({ brief, slides, style, size }) }),
  updateSocialPost: (id: string, patch: Partial<Pick<SocialPost, 'status' | 'style' | 'seed' | 'size'>>) =>
    request<void>(`/api/admin/social/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteSocialPost: (id: string) => request<void>(`/api/admin/social/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  socialVideos: () => request<{ videos: SocialVideo[]; ready: boolean }>('/api/admin/videos'),
  // A motion-graphics reel script from the founder's idea (the MP4 is rendered in the browser)
  createVideo: (brief: string, seconds: number, style: VideoStyle | 'surprise', music: MusicMood, size: PostSize) =>
    request<SocialVideo>('/api/admin/videos', { method: 'POST', body: JSON.stringify({ brief, seconds, style, music, size }) }),
  // Change a video's status, look, variation or music (the script stays the same)
  updateVideo: (id: string, patch: Partial<Pick<SocialVideo, 'status' | 'style' | 'seed' | 'music' | 'size'>>) =>
    request<void>(`/api/admin/videos/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteVideo: (id: string) => request<void>(`/api/admin/videos/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  media: () => request<{ assets: MediaAsset[]; storageReady: boolean }>('/api/admin/media'),
  removeMedia: (key: string) => request<void>(`/api/admin/media/${encodeURIComponent(key)}`, { method: 'DELETE' }),

  // Uploads straight from the browser to Vercel Blob (the API only signs the upload),
  // then records the new file against the slot.
  async uploadMedia(key: string, file: File, onProgress: (percent: number) => void): Promise<MediaAsset> {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
    // Loaded on demand so the uploader doesn't weigh down the rest of the dashboard
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(`media/${key}/${safeName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/media/upload',
      clientPayload: JSON.stringify({ key }),
      contentType: file.type,
      multipart: file.size > 8 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => onProgress(percentage)
    });
    // Videos also get a poster (their first frame), so the website shows a picture while they load
    let poster: string | undefined;
    if (file.type.startsWith('video/')) {
      const { posterFromVideo } = await import('./videoCheck');
      const image = await posterFromVideo(file);
      if (image) {
        const ext = image.type === 'image/webp' ? 'webp' : 'jpg';
        poster = (
          await upload(`media/${key}/poster-${safeName.replace(/\.[a-z0-9]+$/, '')}.${ext}`, image, {
            access: 'public',
            handleUploadUrl: '/api/admin/media/upload',
            clientPayload: JSON.stringify({ key }),
            contentType: image.type
          }).catch(() => null)
        )?.url;
      }
    }
    return request<MediaAsset>(`/api/admin/media/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ url: blob.url, contentType: file.type, size: file.size, poster })
    });
  }
};
