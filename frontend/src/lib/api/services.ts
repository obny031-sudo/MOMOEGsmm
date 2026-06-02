import { apiFetch } from "@/lib/api/client";
import { services as mockServices } from "@/lib/services-data";
import type { LucideIcon } from "lucide-react";
import { Globe, Heart, Music2, Send, Play } from "lucide-react";

export type ServiceItem = {
  id: number;
  title: string;
  category: string;
  icon: LucideIcon;
  price: number;
  min: number;
  max: number;
  speed: string;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Instagram: Heart,
  TikTok: Music2,
  YouTube: Play,
  Telegram: Send,
  Facebook: Globe,
};

function mapService(service: {
  serviceId: number;
  title: string;
  category: string;
  price: number;
  min: number;
  max: number;
  speed: string;
}): ServiceItem {
  return {
    id: service.serviceId,
    title: service.title,
    category: service.category,
    icon: CATEGORY_ICONS[service.category] || Globe,
    price: service.price,
    min: service.min,
    max: service.max,
    speed: service.speed,
  };
}

export async function getServices(): Promise<ServiceItem[]> {
  try {
    const result = await apiFetch<{
      services: {
        serviceId: number;
        title: string;
        category: string;
        price: number;
        min: number;
        max: number;
        speed: string;
      }[];
    }>("/api/v1/services");

    if (result.services?.length) {
      return result.services.map(mapService);
    }
  } catch {
    console.warn("Services API unavailable, using local catalog");
  }

  return mockServices;
}
