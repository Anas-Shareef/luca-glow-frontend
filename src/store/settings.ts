import { create } from "zustand";

export type SiteSettings = {
  store_name: string;
  tagline: string;
  support_email: string;
  support_phone: string;
  address: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  maintenance: boolean;
  maintenance_msg: string;
  currency: string;
  currency_symbol: string;
};

type SettingsState = {
  settings: SiteSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
};

export const useSettings = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
      const apiUrl = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
      const response = await fetch(`${apiUrl}/settings/public`);
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      set({ settings: data, isLoading: false });

      // Update document title and favicon
      if (typeof document !== 'undefined') {
        if (data.store_name) {
          document.title = `${data.store_name} | ${data.tagline}`;
        }
        if (data.favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.favicon_url;
        }
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
      set({ isLoading: false });
    }
  },
}));
