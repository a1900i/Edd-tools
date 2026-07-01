import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ==================== TYPES ====================
interface ImageSettings {
  brightness: number;
  contrast: number;
  exposure: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  saturation: number;
  vibrance: number;
  temperature: number;
  tint: number;
  hueRotate: number;
  blur: number;
  sharpness: number;
  clarity: number;
  sepia: number;
  grayscale: number;
  invert: number;
  opacity: number;
  vignette: number;
  grain: number;
  fade: number;
  dehaze: number;
}

interface Preset {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  settings: ImageSettings;
  category: string;
  description: string;
  tags: string[];
  popularity: number;
}

interface SliderConfig {
  key: keyof ImageSettings;
  label: string;
  icon: string;
  min: number;
  max: number;
  unit: string;
  step: number;
  group: string;
}

// ==================== DEFAULT SETTINGS ====================
const defaultSettings: ImageSettings = {
  brightness: 100, contrast: 100, exposure: 100, highlights: 100, shadows: 100,
  whites: 100, blacks: 100, saturation: 100, vibrance: 100, temperature: 0,
  tint: 0, hueRotate: 0, blur: 0, sharpness: 0, clarity: 0, sepia: 0,
  grayscale: 0, invert: 0, opacity: 100, vignette: 0, grain: 0, fade: 0, dehaze: 0,
};

// ==================== SLIDER GROUPS ====================
const sliderGroups = [
  { id: 'light', name: 'نور', icon: '💡', color: 'amber' },
  { id: 'color', name: 'رنگ', icon: '🎨', color: 'rose' },
  { id: 'detail', name: 'جزئیات', icon: '🔍', color: 'emerald' },
  { id: 'effects', name: 'افکت', icon: '✨', color: 'violet' },
  { id: 'stylize', name: 'سبک', icon: '🎭', color: 'sky' },
];

const sliderConfigs: SliderConfig[] = [
  { key: 'exposure', label: 'نوردهی', icon: '◐', min: 50, max: 150, unit: '%', step: 1, group: 'light' },
  { key: 'brightness', label: 'روشنایی', icon: '☀', min: 0, max: 200, unit: '%', step: 1, group: 'light' },
  { key: 'contrast', label: 'کنتراست', icon: '◑', min: 0, max: 200, unit: '%', step: 1, group: 'light' },
  { key: 'highlights', label: 'هایلایت', icon: '◻', min: 50, max: 150, unit: '%', step: 1, group: 'light' },
  { key: 'shadows', label: 'سایه‌ها', icon: '◼', min: 50, max: 150, unit: '%', step: 1, group: 'light' },
  { key: 'whites', label: 'سفیدها', icon: '□', min: 50, max: 150, unit: '%', step: 1, group: 'light' },
  { key: 'blacks', label: 'سیاه‌ها', icon: '■', min: 50, max: 150, unit: '%', step: 1, group: 'light' },
  { key: 'saturation', label: 'اشباع', icon: '●', min: 0, max: 200, unit: '%', step: 1, group: 'color' },
  { key: 'vibrance', label: 'سرزندگی', icon: '◈', min: 0, max: 200, unit: '%', step: 1, group: 'color' },
  { key: 'temperature', label: 'دما', icon: '🌡', min: -50, max: 50, unit: '', step: 1, group: 'color' },
  { key: 'tint', label: 'تینت', icon: '◆', min: -50, max: 50, unit: '', step: 1, group: 'color' },
  { key: 'hueRotate', label: 'چرخش رنگ', icon: '🔄', min: 0, max: 360, unit: '°', step: 1, group: 'color' },
  { key: 'sharpness', label: 'شارپنس', icon: '△', min: 0, max: 100, unit: '%', step: 1, group: 'detail' },
  { key: 'clarity', label: 'کلاریتی', icon: '◇', min: 0, max: 100, unit: '%', step: 1, group: 'detail' },
  { key: 'dehaze', label: 'رفع مه', icon: '🌤', min: 0, max: 100, unit: '%', step: 1, group: 'detail' },
  { key: 'blur', label: 'تاری', icon: '○', min: 0, max: 20, unit: 'px', step: 0.1, group: 'detail' },
  { key: 'sepia', label: 'سپیا', icon: '▣', min: 0, max: 100, unit: '%', step: 1, group: 'effects' },
  { key: 'grayscale', label: 'خاکستری', icon: '▤', min: 0, max: 100, unit: '%', step: 1, group: 'effects' },
  { key: 'invert', label: 'نگاتیو', icon: '▥', min: 0, max: 100, unit: '%', step: 1, group: 'effects' },
  { key: 'opacity', label: 'مات', icon: '▦', min: 0, max: 100, unit: '%', step: 1, group: 'effects' },
  { key: 'vignette', label: 'ویگنت', icon: '⬭', min: 0, max: 100, unit: '%', step: 1, group: 'stylize' },
  { key: 'grain', label: 'گرین', icon: '⬡', min: 0, max: 100, unit: '%', step: 1, group: 'stylize' },
  { key: 'fade', label: 'فید', icon: '▧', min: 0, max: 100, unit: '%', step: 1, group: 'stylize' },
];

// ==================== PRESET CATEGORIES ====================
const presetCategories = [
  { id: 'all', name: 'همه', icon: '📋' },
  { id: 'portrait', name: 'پرتره', icon: '👤' },
  { id: 'landscape', name: 'منظره', icon: '🏔️' },
  { id: 'wedding', name: 'عروسی', icon: '💒' },
  { id: 'fashion', name: 'فشن', icon: '👗' },
  { id: 'film', name: 'فیلم', icon: '🎞️' },
  { id: 'cinematic', name: 'سینمایی', icon: '🎬' },
  { id: 'bw', name: 'سیاه‌وسفید', icon: '🖤' },
  { id: 'vintage', name: 'وینتیج', icon: '📻' },
  { id: 'street', name: 'خیابانی', icon: '🏙️' },
  { id: 'food', name: 'غذا', icon: '🍕' },
  { id: 'nature', name: 'طبیعت', icon: '🌿' },
  { id: 'night', name: 'شب', icon: '🌙' },
  { id: 'hdr', name: 'HDR', icon: '🌈' },
  { id: 'mood', name: 'مود', icon: '💫' },
  { id: 'seasonal', name: 'فصلی', icon: '🍂' },
  { id: 'minimal', name: 'مینیمال', icon: '⬜' },
  { id: 'social', name: 'اجتماعی', icon: '📱' },
];

// ==================== PRESETS ====================
const d = defaultSettings;
const presets: Preset[] = [
  // پرتره
  { id: 'portrait-soft', name: 'پرتره نرم', nameEn: 'Soft Portrait', icon: '👩', category: 'portrait', description: 'پوست نرم و درخشان', tags: ['پرتره', 'نرم'], popularity: 5, settings: { ...d, brightness: 108, contrast: 92, saturation: 88, vibrance: 110, temperature: 8, highlights: 110, shadows: 105, blur: 0.3, sharpness: 15, clarity: 10, sepia: 5, fade: 8 } },
  { id: 'portrait-vivid', name: 'پرتره زنده', nameEn: 'Vivid Portrait', icon: '🧑', category: 'portrait', description: 'رنگ‌های پرانرژی', tags: ['زنده'], popularity: 4, settings: { ...d, brightness: 105, contrast: 115, saturation: 130, vibrance: 140, temperature: 5, highlights: 105, sharpness: 25, clarity: 20 } },
  { id: 'portrait-beauty', name: 'بیوتی', nameEn: 'Beauty', icon: '💄', category: 'portrait', description: 'عکاسی آرایشی', tags: ['بیوتی'], popularity: 5, settings: { ...d, brightness: 112, contrast: 95, saturation: 95, vibrance: 105, temperature: 5, tint: 3, highlights: 115, shadows: 108, blur: 0.5, sharpness: 10, clarity: 8, fade: 5 } },
  { id: 'portrait-golden', name: 'طلایی', nameEn: 'Golden Hour', icon: '🌤️', category: 'portrait', description: 'نور ساعت طلایی', tags: ['طلایی'], popularity: 5, settings: { ...d, brightness: 110, contrast: 105, saturation: 115, vibrance: 120, temperature: 25, tint: 5, highlights: 110, shadows: 110, sepia: 15, fade: 5 } },
  { id: 'portrait-matte', name: 'مات', nameEn: 'Matte', icon: '🎭', category: 'portrait', description: 'فینیش مات', tags: ['مات'], popularity: 4, settings: { ...d, brightness: 108, contrast: 90, saturation: 85, vibrance: 95, fade: 20, highlights: 105, shadows: 110 } },
  { id: 'portrait-film', name: 'فیلمی', nameEn: 'Film Look', icon: '🎬', category: 'portrait', description: 'ظاهر فیلم', tags: ['فیلم'], popularity: 5, settings: { ...d, brightness: 102, contrast: 108, saturation: 90, vibrance: 95, temperature: 8, highlights: 105, shadows: 108, fade: 12, grain: 15 } },
  { id: 'portrait-dramatic', name: 'دراماتیک', nameEn: 'Dramatic', icon: '🎪', category: 'portrait', description: 'کنتراست قوی', tags: ['دراماتیک'], popularity: 4, settings: { ...d, brightness: 95, contrast: 140, saturation: 90, vibrance: 100, temperature: -5, highlights: 90, shadows: 85, clarity: 30, vignette: 25 } },
  { id: 'portrait-studio', name: 'استودیویی', nameEn: 'Studio', icon: '📷', category: 'portrait', description: 'نور استودیو', tags: ['استودیو'], popularity: 5, settings: { ...d, brightness: 102, contrast: 115, saturation: 100, vibrance: 105, sharpness: 25, clarity: 20, highlights: 105 } },

  // منظره
  { id: 'landscape-vivid', name: 'منظره زنده', nameEn: 'Vivid', icon: '🏞️', category: 'landscape', description: 'رنگ‌های زنده', tags: ['زنده'], popularity: 5, settings: { ...d, brightness: 105, contrast: 125, saturation: 145, vibrance: 150, temperature: 3, highlights: 95, shadows: 110, sharpness: 35, clarity: 40 } },
  { id: 'landscape-golden', name: 'ساعت طلایی', nameEn: 'Golden Hour', icon: '🌅', category: 'landscape', description: 'غروب و طلوع', tags: ['طلایی'], popularity: 5, settings: { ...d, brightness: 108, contrast: 115, saturation: 130, vibrance: 135, temperature: 30, tint: 8, highlights: 105, shadows: 115, sepia: 10, sharpness: 20, clarity: 25 } },
  { id: 'landscape-dramatic', name: 'دراماتیک', nameEn: 'Dramatic', icon: '⛰️', category: 'landscape', description: 'کنتراست بالا', tags: ['دراماتیک'], popularity: 4, settings: { ...d, brightness: 95, contrast: 150, saturation: 110, vibrance: 120, temperature: -5, highlights: 85, shadows: 120, sharpness: 45, clarity: 50, vignette: 20 } },
  { id: 'landscape-misty', name: 'مه‌آلود', nameEn: 'Misty', icon: '🌫️', category: 'landscape', description: 'فضای رازآلود', tags: ['مه'], popularity: 3, settings: { ...d, brightness: 115, contrast: 75, saturation: 70, vibrance: 80, temperature: -8, highlights: 120, shadows: 115, fade: 25, blur: 0.5, clarity: 5 } },
  { id: 'landscape-hdr', name: 'HDR', nameEn: 'HDR', icon: '🌄', category: 'landscape', description: 'دامنه بالا', tags: ['HDR'], popularity: 4, settings: { ...d, brightness: 105, contrast: 140, saturation: 135, vibrance: 145, highlights: 80, shadows: 130, sharpness: 50, clarity: 55 } },
  { id: 'landscape-forest', name: 'جنگل', nameEn: 'Forest', icon: '🌲', category: 'landscape', description: 'سبزینگی جنگل', tags: ['جنگل'], popularity: 4, settings: { ...d, brightness: 100, contrast: 120, saturation: 125, vibrance: 130, temperature: -5, tint: -8, highlights: 100, shadows: 115, clarity: 25 } },
  { id: 'landscape-ocean', name: 'اقیانوس', nameEn: 'Ocean', icon: '🌊', category: 'landscape', description: 'آبی دریا', tags: ['دریا'], popularity: 4, settings: { ...d, brightness: 105, contrast: 115, saturation: 120, vibrance: 130, temperature: -12, tint: -5, highlights: 105, shadows: 110, clarity: 25 } },

  // عروسی
  { id: 'wedding-bright', name: 'روشن و هوایی', nameEn: 'Bright & Airy', icon: '💐', category: 'wedding', description: 'محبوب‌ترین سبک', tags: ['روشن'], popularity: 5, settings: { ...d, brightness: 118, contrast: 88, saturation: 85, vibrance: 90, temperature: 8, tint: 3, highlights: 120, shadows: 118, fade: 10, clarity: 5 } },
  { id: 'wedding-romantic', name: 'رمانتیک', nameEn: 'Romantic', icon: '💕', category: 'wedding', description: 'فضای عاشقانه', tags: ['رمانتیک'], popularity: 5, settings: { ...d, brightness: 110, contrast: 90, saturation: 90, vibrance: 95, temperature: 15, tint: 8, highlights: 115, shadows: 112, blur: 0.3, sepia: 10, fade: 12 } },
  { id: 'wedding-classic', name: 'کلاسیک', nameEn: 'Classic', icon: '👰', category: 'wedding', description: 'بی‌زمان', tags: ['کلاسیک'], popularity: 4, settings: { ...d, brightness: 105, contrast: 105, saturation: 92, vibrance: 100, temperature: 5, highlights: 108, shadows: 108, sharpness: 15, clarity: 10, sepia: 5 } },
  { id: 'wedding-film', name: 'فیلمی', nameEn: 'Film Wedding', icon: '🎞️', category: 'wedding', description: 'ظاهر فیلم', tags: ['فیلم'], popularity: 4, settings: { ...d, brightness: 105, contrast: 95, saturation: 88, vibrance: 92, temperature: 10, highlights: 108, shadows: 110, fade: 15, grain: 12 } },
  { id: 'wedding-golden', name: 'طلایی', nameEn: 'Golden', icon: '✨', category: 'wedding', description: 'نور طلایی', tags: ['طلایی'], popularity: 5, settings: { ...d, brightness: 108, contrast: 102, saturation: 100, vibrance: 108, temperature: 20, tint: 5, highlights: 112, shadows: 108, sepia: 12 } },
  { id: 'wedding-soft', name: 'نرم', nameEn: 'Soft', icon: '☁️', category: 'wedding', description: 'نرم و رویایی', tags: ['نرم'], popularity: 4, settings: { ...d, brightness: 115, contrast: 85, saturation: 88, vibrance: 92, temperature: 8, highlights: 118, shadows: 115, blur: 0.4, fade: 15 } },

  // فشن
  { id: 'fashion-editorial', name: 'اديتوريال', nameEn: 'Editorial', icon: '👗', category: 'fashion', description: 'سبک مجلات', tags: ['اديتوريال'], popularity: 5, settings: { ...d, brightness: 100, contrast: 125, saturation: 85, vibrance: 95, temperature: -5, highlights: 95, shadows: 90, sharpness: 30, clarity: 28 } },
  { id: 'fashion-highkey', name: 'های‌کی', nameEn: 'High Key', icon: '💡', category: 'fashion', description: 'روشن و مینیمال', tags: ['روشن'], popularity: 4, settings: { ...d, brightness: 120, contrast: 90, saturation: 90, vibrance: 95, temperature: 2, highlights: 125, shadows: 115, fade: 10 } },
  { id: 'fashion-lowkey', name: 'لوکی', nameEn: 'Low Key', icon: '🌑', category: 'fashion', description: 'تاریک', tags: ['تاریک'], popularity: 4, settings: { ...d, brightness: 85, contrast: 135, saturation: 90, vibrance: 100, temperature: -5, highlights: 90, shadows: 75, vignette: 30, clarity: 25 } },
  { id: 'fashion-glossy', name: 'براق', nameEn: 'Glossy', icon: '✨', category: 'fashion', description: 'براق و لوکس', tags: ['براق'], popularity: 4, settings: { ...d, brightness: 105, contrast: 118, saturation: 110, vibrance: 115, temperature: 0, highlights: 112, shadows: 100, sharpness: 25, clarity: 20 } },
  { id: 'fashion-matte', name: 'مات', nameEn: 'Matte', icon: '🎭', category: 'fashion', description: 'فینیش مات', tags: ['مات'], popularity: 4, settings: { ...d, brightness: 105, contrast: 95, saturation: 88, vibrance: 95, fade: 22, highlights: 108, shadows: 108 } },
  { id: 'fashion-bold', name: 'جسورانه', nameEn: 'Bold', icon: '💥', category: 'fashion', description: 'رنگ‌های قوی', tags: ['جسور'], popularity: 4, settings: { ...d, brightness: 102, contrast: 130, saturation: 140, vibrance: 150, temperature: 0, highlights: 100, shadows: 95, clarity: 30 } },

  // فیلم آنالوگ
  { id: 'film-portra400', name: 'پورترا ۴۰۰', nameEn: 'Portra 400', icon: '🟡', category: 'film', description: 'فیلم محبوب', tags: ['کداک'], popularity: 5, settings: { ...d, brightness: 105, contrast: 92, saturation: 85, vibrance: 95, temperature: 12, tint: 5, highlights: 108, shadows: 110, sepia: 8, fade: 12, grain: 15 } },
  { id: 'film-ektar100', name: 'اکتار ۱۰۰', nameEn: 'Ektar 100', icon: '🔴', category: 'film', description: 'رنگ‌های اشباع', tags: ['کداک'], popularity: 4, settings: { ...d, brightness: 102, contrast: 115, saturation: 140, vibrance: 145, temperature: 8, highlights: 95, shadows: 105, sharpness: 20, grain: 8 } },
  { id: 'film-gold200', name: 'گلد ۲۰۰', nameEn: 'Gold 200', icon: '🌟', category: 'film', description: 'فیلم کلاسیک', tags: ['کداک'], popularity: 4, settings: { ...d, brightness: 108, contrast: 95, saturation: 105, vibrance: 110, temperature: 18, tint: 5, highlights: 110, shadows: 108, sepia: 12, grain: 12, fade: 8 } },
  { id: 'film-fuji400h', name: 'فوجی ۴۰۰H', nameEn: 'Fuji 400H', icon: '🟢', category: 'film', description: 'تن سبز-آبی', tags: ['فوجی'], popularity: 5, settings: { ...d, brightness: 108, contrast: 88, saturation: 80, vibrance: 90, temperature: -8, tint: -8, highlights: 112, shadows: 115, fade: 15, grain: 10 } },
  { id: 'film-velvia50', name: 'ولویا ۵۰', nameEn: 'Velvia 50', icon: '💚', category: 'film', description: 'اسلاید اشباع', tags: ['فوجی'], popularity: 5, settings: { ...d, brightness: 98, contrast: 135, saturation: 155, vibrance: 160, temperature: 5, highlights: 90, shadows: 95, sharpness: 25, grain: 5 } },
  { id: 'film-cinestill', name: 'سینستیل', nameEn: 'CineStill', icon: '🟣', category: 'film', description: 'فیلم سینمایی', tags: ['سینستیل'], popularity: 4, settings: { ...d, brightness: 100, contrast: 110, saturation: 90, vibrance: 85, temperature: -15, tint: -10, hueRotate: 10, highlights: 115, shadows: 105, grain: 20, fade: 8, vignette: 15 } },
  { id: 'film-hp5', name: 'HP5', nameEn: 'Ilford HP5', icon: '⚫', category: 'film', description: 'سیاه‌وسفید', tags: ['ایلفورد'], popularity: 4, settings: { ...d, brightness: 105, contrast: 130, grayscale: 100, highlights: 105, shadows: 110, sharpness: 15, grain: 25, fade: 5 } },
  { id: 'film-trix', name: 'ترای-ایکس', nameEn: 'Tri-X', icon: '⬛', category: 'film', description: 'سیاه‌وسفید کداک', tags: ['کداک'], popularity: 4, settings: { ...d, brightness: 102, contrast: 135, grayscale: 100, highlights: 100, shadows: 105, sharpness: 20, grain: 28, fade: 3 } },

  // سینمایی
  { id: 'cinema-teal-orange', name: 'آبی-نارنجی', nameEn: 'Teal Orange', icon: '🎬', category: 'cinematic', description: 'محبوب‌ترین سبک', tags: ['آبی'], popularity: 5, settings: { ...d, brightness: 98, contrast: 120, saturation: 100, vibrance: 110, temperature: 15, tint: -10, highlights: 105, shadows: 90, sharpness: 15, vignette: 20, fade: 5 } },
  { id: 'cinema-dark', name: 'تاریک', nameEn: 'Dark Cinema', icon: '🌑', category: 'cinematic', description: 'فضای تاریک', tags: ['تاریک'], popularity: 4, settings: { ...d, brightness: 82, contrast: 130, saturation: 75, vibrance: 80, temperature: -8, highlights: 85, shadows: 80, sharpness: 20, vignette: 35, fade: 3 } },
  { id: 'cinema-blockbuster', name: 'بلاکباستر', nameEn: 'Blockbuster', icon: '🎥', category: 'cinematic', description: 'فیلم‌های پرفروش', tags: ['هالیوود'], popularity: 4, settings: { ...d, brightness: 95, contrast: 135, saturation: 110, vibrance: 120, temperature: 5, tint: -5, highlights: 90, shadows: 95, sharpness: 25, clarity: 30, vignette: 15 } },
  { id: 'cinema-wes', name: 'وس اندرسون', nameEn: 'Wes Anderson', icon: '🏨', category: 'cinematic', description: 'پالت پاستلی', tags: ['پاستل'], popularity: 4, settings: { ...d, brightness: 112, contrast: 92, saturation: 95, vibrance: 100, temperature: 12, tint: 5, highlights: 115, shadows: 112, fade: 10, clarity: 5 } },
  { id: 'cinema-blade', name: 'بلید رانر', nameEn: 'Blade Runner', icon: '🌃', category: 'cinematic', description: 'سایبرپانک', tags: ['سایبرپانک'], popularity: 3, settings: { ...d, brightness: 88, contrast: 125, saturation: 120, vibrance: 130, temperature: -20, tint: 15, hueRotate: 330, highlights: 110, shadows: 80, vignette: 25, grain: 8 } },
  { id: 'cinema-joker', name: 'جوکر', nameEn: 'Joker', icon: '🃏', category: 'cinematic', description: 'تن‌های سرد', tags: ['جوکر'], popularity: 4, settings: { ...d, brightness: 90, contrast: 125, saturation: 80, vibrance: 85, temperature: -12, tint: 5, highlights: 95, shadows: 85, vignette: 30, grain: 10 } },
  { id: 'cinema-horror', name: 'ترسناک', nameEn: 'Horror', icon: '👻', category: 'cinematic', description: 'وحشتناک', tags: ['ترسناک'], popularity: 3, settings: { ...d, brightness: 80, contrast: 140, saturation: 60, vibrance: 65, temperature: -18, highlights: 85, shadows: 70, vignette: 45, grain: 12 } },

  // سیاه‌وسفید
  { id: 'bw-classic', name: 'کلاسیک', nameEn: 'Classic B&W', icon: '🖤', category: 'bw', description: 'سیاه‌وسفید تمیز', tags: ['کلاسیک'], popularity: 5, settings: { ...d, brightness: 102, contrast: 120, grayscale: 100, sharpness: 20, clarity: 15 } },
  { id: 'bw-high', name: 'کنتراست بالا', nameEn: 'High Contrast', icon: '⬛', category: 'bw', description: 'کنتراست شدید', tags: ['کنتراست'], popularity: 4, settings: { ...d, brightness: 98, contrast: 160, grayscale: 100, highlights: 90, shadows: 80, sharpness: 30, clarity: 35, vignette: 15 } },
  { id: 'bw-soft', name: 'نرم', nameEn: 'Soft B&W', icon: '🩶', category: 'bw', description: 'ملایم', tags: ['نرم'], popularity: 3, settings: { ...d, brightness: 110, contrast: 85, grayscale: 100, highlights: 115, shadows: 115, fade: 20, clarity: 5 } },
  { id: 'bw-noir', name: 'فیلم نوآر', nameEn: 'Film Noir', icon: '🎩', category: 'bw', description: 'سبک دهه ۴۰', tags: ['نوآر'], popularity: 4, settings: { ...d, brightness: 90, contrast: 155, grayscale: 100, highlights: 85, shadows: 75, sharpness: 20, vignette: 40, grain: 15 } },
  { id: 'bw-sepia', name: 'سپیا', nameEn: 'Sepia', icon: '🟫', category: 'bw', description: 'قهوه‌ای نوستالژیک', tags: ['سپیا'], popularity: 3, settings: { ...d, brightness: 105, contrast: 110, grayscale: 50, sepia: 65, temperature: 15, grain: 20, fade: 10 } },
  { id: 'bw-dramatic', name: 'دراماتیک', nameEn: 'Dramatic B&W', icon: '🎭', category: 'bw', description: 'تاثیرگذار', tags: ['دراماتیک'], popularity: 4, settings: { ...d, brightness: 95, contrast: 145, grayscale: 100, highlights: 88, shadows: 82, clarity: 35, vignette: 25, sharpness: 25 } },

  // وینتیج
  { id: 'vintage-70s', name: 'دهه ۷۰', nameEn: '70s', icon: '✌️', category: 'vintage', description: 'حس دهه هفتاد', tags: ['۷۰'], popularity: 4, settings: { ...d, brightness: 108, contrast: 90, saturation: 80, vibrance: 85, temperature: 20, tint: 10, sepia: 30, fade: 20, grain: 25, vignette: 15 } },
  { id: 'vintage-80s', name: 'دهه ۸۰', nameEn: '80s', icon: '🕹️', category: 'vintage', description: 'نئونی رترو', tags: ['۸۰'], popularity: 4, settings: { ...d, brightness: 110, contrast: 120, saturation: 140, vibrance: 150, temperature: -10, tint: 15, hueRotate: 340, grain: 10, vignette: 10 } },
  { id: 'vintage-polaroid', name: 'پولاروید', nameEn: 'Polaroid', icon: '📸', category: 'vintage', description: 'عکس فوری', tags: ['پولاروید'], popularity: 5, settings: { ...d, brightness: 112, contrast: 88, saturation: 82, vibrance: 90, temperature: 15, tint: 8, highlights: 115, sepia: 15, fade: 18, grain: 12, vignette: 25 } },
  { id: 'vintage-faded', name: 'محو شده', nameEn: 'Faded', icon: '🌫️', category: 'vintage', description: 'عکس قدیمی', tags: ['محو'], popularity: 3, settings: { ...d, brightness: 115, contrast: 78, saturation: 60, vibrance: 65, temperature: 20, sepia: 25, fade: 35, grain: 30, vignette: 20 } },
  { id: 'vintage-retro', name: 'رترو', nameEn: 'Retro', icon: '🎵', category: 'vintage', description: 'سبک قدیمی', tags: ['رترو'], popularity: 4, settings: { ...d, brightness: 105, contrast: 100, saturation: 95, vibrance: 100, temperature: 15, sepia: 18, fade: 12, grain: 15 } },
  { id: 'vintage-disposable', name: 'یکبار مصرف', nameEn: 'Disposable', icon: '📷', category: 'vintage', description: 'دوربین ارزان', tags: ['یکبار مصرف'], popularity: 4, settings: { ...d, brightness: 108, contrast: 105, saturation: 115, vibrance: 120, temperature: 8, hueRotate: 5, highlights: 110, fade: 8, grain: 22, vignette: 15 } },

  // خیابانی
  { id: 'street-gritty', name: 'خشن', nameEn: 'Gritty', icon: '🏚️', category: 'street', description: 'واقع‌گرایانه', tags: ['خشن'], popularity: 4, settings: { ...d, brightness: 95, contrast: 140, saturation: 75, vibrance: 80, temperature: -5, highlights: 90, shadows: 85, sharpness: 40, clarity: 45, grain: 20, vignette: 15 } },
  { id: 'street-urban', name: 'شهری', nameEn: 'Urban', icon: '🌆', category: 'street', description: 'سبک شهری', tags: ['شهری'], popularity: 4, settings: { ...d, brightness: 110, contrast: 90, saturation: 80, vibrance: 85, temperature: 8, highlights: 110, shadows: 115, fade: 20, grain: 10, clarity: 10 } },
  { id: 'street-night', name: 'شب', nameEn: 'Night Street', icon: '🌃', category: 'street', description: 'شب شهری', tags: ['شب'], popularity: 3, settings: { ...d, brightness: 95, contrast: 125, saturation: 110, vibrance: 115, temperature: -12, tint: 5, highlights: 115, shadows: 90, sharpness: 15, vignette: 20 } },
  { id: 'street-neon', name: 'نئون', nameEn: 'Neon', icon: '💜', category: 'street', description: 'نورهای نئون', tags: ['نئون'], popularity: 4, settings: { ...d, brightness: 95, contrast: 120, saturation: 135, vibrance: 145, temperature: -15, tint: 10, highlights: 115, shadows: 85, vignette: 20 } },
  { id: 'street-documentary', name: 'مستند', nameEn: 'Documentary', icon: '📹', category: 'street', description: 'سبک مستند', tags: ['مستند'], popularity: 4, settings: { ...d, brightness: 100, contrast: 115, saturation: 85, vibrance: 90, sharpness: 25, clarity: 30, grain: 12 } },

  // غذا
  { id: 'food-warm', name: 'گرم', nameEn: 'Warm Food', icon: '🍕', category: 'food', description: 'اشتهاآور', tags: ['گرم'], popularity: 5, settings: { ...d, brightness: 108, contrast: 110, saturation: 125, vibrance: 130, temperature: 20, tint: 5, highlights: 110, shadows: 108, sharpness: 30, clarity: 25 } },
  { id: 'food-bright', name: 'روشن', nameEn: 'Bright Food', icon: '🥗', category: 'food', description: 'تازه و روشن', tags: ['روشن'], popularity: 4, settings: { ...d, brightness: 118, contrast: 105, saturation: 120, vibrance: 125, temperature: 5, highlights: 115, shadows: 115, sharpness: 25, clarity: 15 } },
  { id: 'food-moody', name: 'مودی', nameEn: 'Dark Food', icon: '🍷', category: 'food', description: 'تاریک و لوکس', tags: ['تاریک'], popularity: 4, settings: { ...d, brightness: 88, contrast: 125, saturation: 100, vibrance: 110, temperature: 10, highlights: 90, shadows: 85, sharpness: 20, clarity: 25, vignette: 30 } },
  { id: 'food-fresh', name: 'تازه', nameEn: 'Fresh', icon: '🥬', category: 'food', description: 'سبزیجات تازه', tags: ['تازه'], popularity: 4, settings: { ...d, brightness: 112, contrast: 108, saturation: 130, vibrance: 135, temperature: -5, tint: -5, highlights: 110, sharpness: 25 } },
  { id: 'food-cafe', name: 'کافه', nameEn: 'Cafe', icon: '☕', category: 'food', description: 'فضای کافه', tags: ['کافه'], popularity: 4, settings: { ...d, brightness: 105, contrast: 108, saturation: 105, vibrance: 110, temperature: 12, highlights: 110, shadows: 108, clarity: 15 } },

  // طبیعت
  { id: 'nature-vivid', name: 'زنده', nameEn: 'Vivid Nature', icon: '🌿', category: 'nature', description: 'رنگ‌های زنده', tags: ['زنده'], popularity: 5, settings: { ...d, brightness: 105, contrast: 120, saturation: 140, vibrance: 145, temperature: 0, highlights: 100, shadows: 110, sharpness: 30, clarity: 35 } },
  { id: 'nature-autumn', name: 'پاییز', nameEn: 'Autumn', icon: '🍂', category: 'nature', description: 'رنگ‌های پاییزی', tags: ['پاییز'], popularity: 5, settings: { ...d, brightness: 105, contrast: 115, saturation: 125, vibrance: 130, temperature: 25, tint: 8, hueRotate: 350, highlights: 105, sepia: 10, clarity: 18 } },
  { id: 'nature-spring', name: 'بهار', nameEn: 'Spring', icon: '🌷', category: 'nature', description: 'شکوفه‌های بهاری', tags: ['بهار'], popularity: 4, settings: { ...d, brightness: 112, contrast: 105, saturation: 120, vibrance: 125, temperature: 5, tint: 5, highlights: 112, shadows: 110, clarity: 12 } },
  { id: 'nature-summer', name: 'تابستان', nameEn: 'Summer', icon: '☀️', category: 'nature', description: 'تابستان گرم', tags: ['تابستان'], popularity: 4, settings: { ...d, brightness: 110, contrast: 110, saturation: 130, vibrance: 135, temperature: 15, highlights: 108, shadows: 105, clarity: 15 } },
  { id: 'nature-winter', name: 'زمستان', nameEn: 'Winter', icon: '❄️', category: 'nature', description: 'سرمای زمستان', tags: ['زمستان'], popularity: 4, settings: { ...d, brightness: 112, contrast: 105, saturation: 70, vibrance: 75, temperature: -22, tint: -5, highlights: 115, shadows: 108, clarity: 10, fade: 8 } },
  { id: 'nature-flower', name: 'گل', nameEn: 'Flower', icon: '🌻', category: 'nature', description: 'گل‌های رنگارنگ', tags: ['گل'], popularity: 4, settings: { ...d, brightness: 108, contrast: 108, saturation: 135, vibrance: 140, temperature: 8, highlights: 108, clarity: 18 } },

  // شب
  { id: 'night-city', name: 'شهر شب', nameEn: 'City Night', icon: '🌙', category: 'night', description: 'نورهای شهر', tags: ['شهر'], popularity: 4, settings: { ...d, brightness: 95, contrast: 125, saturation: 115, vibrance: 120, temperature: -10, highlights: 115, shadows: 90, sharpness: 15, vignette: 15 } },
  { id: 'night-neon', name: 'نئون', nameEn: 'Neon Night', icon: '💜', category: 'night', description: 'نورهای نئون', tags: ['نئون'], popularity: 4, settings: { ...d, brightness: 92, contrast: 130, saturation: 145, vibrance: 155, temperature: -18, tint: 12, highlights: 118, shadows: 82, vignette: 22 } },
  { id: 'night-moody', name: 'مودی', nameEn: 'Moody Night', icon: '🌑', category: 'night', description: 'شب تاریک', tags: ['مودی'], popularity: 3, settings: { ...d, brightness: 85, contrast: 130, saturation: 80, vibrance: 85, temperature: -12, highlights: 95, shadows: 80, vignette: 35, grain: 10 } },
  { id: 'night-blue', name: 'آبی شب', nameEn: 'Blue Hour', icon: '🔵', category: 'night', description: 'ساعت آبی', tags: ['آبی'], popularity: 4, settings: { ...d, brightness: 100, contrast: 115, saturation: 105, vibrance: 110, temperature: -20, tint: -8, highlights: 108, shadows: 105, clarity: 15 } },
  { id: 'night-stars', name: 'ستاره', nameEn: 'Starry', icon: '⭐', category: 'night', description: 'آسمان شب', tags: ['ستاره'], popularity: 3, settings: { ...d, brightness: 95, contrast: 135, saturation: 110, vibrance: 115, temperature: -15, highlights: 105, shadows: 95, sharpness: 25, clarity: 30, vignette: 12 } },

  // HDR
  { id: 'hdr-natural', name: 'طبیعی', nameEn: 'Natural HDR', icon: '🌈', category: 'hdr', description: 'HDR طبیعی', tags: ['طبیعی'], popularity: 5, settings: { ...d, brightness: 105, contrast: 130, saturation: 120, vibrance: 125, highlights: 85, shadows: 120, sharpness: 30, clarity: 35 } },
  { id: 'hdr-vibrant', name: 'زنده', nameEn: 'Vibrant HDR', icon: '✨', category: 'hdr', description: 'رنگ‌های زنده', tags: ['زنده'], popularity: 4, settings: { ...d, brightness: 108, contrast: 140, saturation: 145, vibrance: 155, highlights: 82, shadows: 125, sharpness: 35, clarity: 45 } },
  { id: 'hdr-dramatic', name: 'دراماتیک', nameEn: 'Dramatic HDR', icon: '🎭', category: 'hdr', description: 'کنتراست شدید', tags: ['دراماتیک'], popularity: 4, settings: { ...d, brightness: 100, contrast: 155, saturation: 130, vibrance: 140, highlights: 78, shadows: 130, sharpness: 40, clarity: 55, vignette: 15 } },
  { id: 'hdr-soft', name: 'نرم', nameEn: 'Soft HDR', icon: '☁️', category: 'hdr', description: 'HDR ملایم', tags: ['نرم'], popularity: 3, settings: { ...d, brightness: 110, contrast: 115, saturation: 115, vibrance: 120, highlights: 90, shadows: 115, sharpness: 20, clarity: 25 } },

  // مود
  { id: 'mood-dreamy', name: 'رویایی', nameEn: 'Dreamy', icon: '💭', category: 'mood', description: 'خیال‌انگیز', tags: ['رویایی'], popularity: 5, settings: { ...d, brightness: 118, contrast: 82, saturation: 110, vibrance: 115, temperature: 10, highlights: 120, shadows: 115, blur: 1.2, sepia: 8, fade: 15 } },
  { id: 'mood-melancholy', name: 'ملانکولی', nameEn: 'Melancholy', icon: '🥀', category: 'mood', description: 'غم و دلتنگی', tags: ['غمگین'], popularity: 3, settings: { ...d, brightness: 92, contrast: 105, saturation: 55, vibrance: 60, temperature: -15, tint: -5, highlights: 100, shadows: 90, fade: 15, vignette: 25, grain: 10 } },
  { id: 'mood-euphoria', name: 'سرخوشی', nameEn: 'Euphoria', icon: '🦋', category: 'mood', description: 'حس خوب', tags: ['سرخوشی'], popularity: 4, settings: { ...d, brightness: 102, contrast: 115, saturation: 135, vibrance: 145, temperature: -15, tint: 20, hueRotate: 320, highlights: 110, shadows: 95, vignette: 15, grain: 5 } },
  { id: 'mood-romantic', name: 'عاشقانه', nameEn: 'Romantic', icon: '💕', category: 'mood', description: 'فضای عاشقانه', tags: ['عاشقانه'], popularity: 5, settings: { ...d, brightness: 110, contrast: 92, saturation: 95, vibrance: 100, temperature: 15, tint: 8, highlights: 112, shadows: 110, blur: 0.3, sepia: 8, fade: 10 } },
  { id: 'mood-peaceful', name: 'آرام', nameEn: 'Peaceful', icon: '🕊️', category: 'mood', description: 'آرامش‌بخش', tags: ['آرام'], popularity: 4, settings: { ...d, brightness: 112, contrast: 90, saturation: 90, vibrance: 95, temperature: 5, highlights: 115, shadows: 112, blur: 0.5, fade: 10 } },

  // فصلی
  { id: 'seasonal-spring', name: 'بهار', nameEn: 'Spring', icon: '🌸', category: 'seasonal', description: 'شکوفه بهاری', tags: ['بهار'], popularity: 5, settings: { ...d, brightness: 112, contrast: 105, saturation: 120, vibrance: 125, temperature: 5, tint: 8, highlights: 112, shadows: 110, clarity: 12 } },
  { id: 'seasonal-summer', name: 'تابستان', nameEn: 'Summer', icon: '☀️', category: 'seasonal', description: 'گرمای تابستان', tags: ['تابستان'], popularity: 5, settings: { ...d, brightness: 110, contrast: 112, saturation: 130, vibrance: 140, temperature: 18, highlights: 108, shadows: 105, clarity: 18 } },
  { id: 'seasonal-autumn', name: 'پاییز', nameEn: 'Autumn', icon: '🍂', category: 'seasonal', description: 'برگ‌ریزان', tags: ['پاییز'], popularity: 5, settings: { ...d, brightness: 105, contrast: 115, saturation: 125, vibrance: 130, temperature: 25, tint: 8, hueRotate: 350, highlights: 105, sepia: 12, clarity: 15 } },
  { id: 'seasonal-winter', name: 'زمستان', nameEn: 'Winter', icon: '❄️', category: 'seasonal', description: 'سرمای زمستان', tags: ['زمستان'], popularity: 5, settings: { ...d, brightness: 112, contrast: 105, saturation: 70, vibrance: 75, temperature: -22, tint: -5, highlights: 115, shadows: 108, clarity: 10, fade: 8 } },
  { id: 'seasonal-golden', name: 'ساعت طلایی', nameEn: 'Golden Hour', icon: '🌅', category: 'seasonal', description: 'نور طلایی', tags: ['طلایی'], popularity: 5, settings: { ...d, brightness: 108, contrast: 108, saturation: 120, vibrance: 128, temperature: 28, highlights: 108, shadows: 110, sepia: 10 } },

  // مینیمال
  { id: 'minimal-clean', name: 'تمیز', nameEn: 'Clean', icon: '⬜', category: 'minimal', description: 'ساده و تمیز', tags: ['تمیز'], popularity: 5, settings: { ...d, brightness: 115, contrast: 95, saturation: 90, vibrance: 95, highlights: 118, shadows: 115, sharpness: 15 } },
  { id: 'minimal-white', name: 'سفید', nameEn: 'White', icon: '🤍', category: 'minimal', description: 'فضای سفید', tags: ['سفید'], popularity: 4, settings: { ...d, brightness: 120, contrast: 90, saturation: 85, vibrance: 90, highlights: 125, shadows: 118, fade: 10 } },
  { id: 'minimal-muted', name: 'صامت', nameEn: 'Muted', icon: '🔇', category: 'minimal', description: 'رنگ‌های خاموش', tags: ['صامت'], popularity: 4, settings: { ...d, brightness: 108, contrast: 98, saturation: 70, vibrance: 75, highlights: 110, shadows: 108, fade: 12 } },
  { id: 'minimal-soft', name: 'نرم', nameEn: 'Soft', icon: '☁️', category: 'minimal', description: 'ملایم و نرم', tags: ['نرم'], popularity: 4, settings: { ...d, brightness: 112, contrast: 88, saturation: 88, vibrance: 92, highlights: 115, shadows: 112, blur: 0.3 } },
  { id: 'minimal-nordic', name: 'نوردیک', nameEn: 'Nordic', icon: '🏔️', category: 'minimal', description: 'اسکاندیناوی', tags: ['نوردیک'], popularity: 4, settings: { ...d, brightness: 112, contrast: 100, saturation: 80, vibrance: 85, temperature: -10, highlights: 115, shadows: 110, clarity: 8 } },

  // شبکه اجتماعی
  { id: 'social-insta', name: 'اینستاگرام', nameEn: 'Instagram', icon: '📱', category: 'social', description: 'سبک اینستاگرام', tags: ['اینستا'], popularity: 5, settings: { ...d, brightness: 110, contrast: 105, saturation: 115, vibrance: 120, temperature: 8, highlights: 108, shadows: 108, fade: 8, clarity: 10 } },
  { id: 'social-vsco', name: 'VSCO', nameEn: 'VSCO', icon: '📷', category: 'social', description: 'سبک VSCO', tags: ['VSCO'], popularity: 5, settings: { ...d, brightness: 108, contrast: 95, saturation: 85, vibrance: 90, temperature: 10, highlights: 110, shadows: 112, fade: 15, grain: 10 } },
  { id: 'social-bright', name: 'روشن', nameEn: 'Bright', icon: '✨', category: 'social', description: 'روشن و جذاب', tags: ['روشن'], popularity: 5, settings: { ...d, brightness: 118, contrast: 100, saturation: 110, vibrance: 115, highlights: 118, shadows: 115, clarity: 8 } },
  { id: 'social-warm', name: 'گرم', nameEn: 'Warm', icon: '🔥', category: 'social', description: 'تن گرم', tags: ['گرم'], popularity: 4, settings: { ...d, brightness: 108, contrast: 105, saturation: 112, vibrance: 118, temperature: 18, highlights: 108, sepia: 8 } },
  { id: 'social-cool', name: 'سرد', nameEn: 'Cool', icon: '❄️', category: 'social', description: 'تن سرد', tags: ['سرد'], popularity: 4, settings: { ...d, brightness: 108, contrast: 108, saturation: 105, vibrance: 110, temperature: -12, highlights: 108, clarity: 10 } },
  { id: 'social-moody', name: 'مودی', nameEn: 'Moody', icon: '🌑', category: 'social', description: 'تاریک و جذاب', tags: ['مودی'], popularity: 4, settings: { ...d, brightness: 95, contrast: 118, saturation: 90, vibrance: 95, temperature: 5, highlights: 98, shadows: 92, vignette: 18, fade: 8 } },
  { id: 'social-golden', name: 'طلایی', nameEn: 'Golden', icon: '🌟', category: 'social', description: 'نور طلایی', tags: ['طلایی'], popularity: 5, settings: { ...d, brightness: 108, contrast: 105, saturation: 115, vibrance: 120, temperature: 22, highlights: 110, shadows: 108, sepia: 10 } },
  { id: 'social-vibrant', name: 'زنده', nameEn: 'Vibrant', icon: '🌈', category: 'social', description: 'رنگ‌های زنده', tags: ['زنده'], popularity: 4, settings: { ...d, brightness: 108, contrast: 115, saturation: 140, vibrance: 150, highlights: 105, clarity: 15 } },
];

// ==================== HELPER FUNCTIONS ====================
function getFilterString(s: ImageSettings): string {
  const bright = (s.brightness / 100) * (s.exposure / 100) * (s.highlights / 100) * (s.whites / 100);
  const shadowBoost = (s.shadows / 100) * (s.blacks / 100);
  const sat = (s.saturation / 100) * (s.vibrance / 100);
  const tempHue = s.temperature * 0.6 + s.tint * 0.3 + s.hueRotate;
  const sharp = 100 + s.sharpness * 0.5 + s.clarity * 0.3 + (s.dehaze || 0) * 0.2;
  const cont = (s.contrast / 100) * (sharp / 100);
  const fadeBright = 1 + s.fade * 0.002;
  return `brightness(${(bright * shadowBoost * fadeBright * 100).toFixed(0)}%) contrast(${(cont * 100).toFixed(0)}%) saturate(${(sat * 100).toFixed(0)}%) hue-rotate(${tempHue.toFixed(0)}deg) blur(${s.blur}px) sepia(${s.sepia}%) grayscale(${s.grayscale}%) invert(${s.invert}%) opacity(${s.opacity}%)`;
}

const colorMap: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', accent: '#d97706', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', accent: '#e11d48', border: 'border-rose-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', accent: '#059669', border: 'border-emerald-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', accent: '#7c3aed', border: 'border-violet-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', accent: '#0284c7', border: 'border-sky-200' },
};

// ==================== SLIDER COMPONENT ====================
function Slider({ label, icon, value, min, max, unit, step, defaultValue, accentColor = '#6366f1', onChange }: {
  label: string; icon: string; value: number; min: number; max: number; unit: string; step: number; defaultValue: number; accentColor?: string; onChange: (v: number) => void;
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const isModified = value !== defaultValue;
  const isBipolar = min < 0;
  const centerPercent = isBipolar ? ((-min) / (max - min)) * 100 : -1;
  
  const trackStyle = useMemo(() => {
    if (isBipolar) {
      if (percentage >= centerPercent) {
        return { background: `linear-gradient(to right, rgba(148,163,184,0.25) 0%, rgba(148,163,184,0.25) ${centerPercent}%, ${accentColor} ${centerPercent}%, ${accentColor} ${percentage}%, rgba(148,163,184,0.25) ${percentage}%, rgba(148,163,184,0.25) 100%)` };
      }
      return { background: `linear-gradient(to right, rgba(148,163,184,0.25) 0%, rgba(148,163,184,0.25) ${percentage}%, ${accentColor} ${percentage}%, ${accentColor} ${centerPercent}%, rgba(148,163,184,0.25) ${centerPercent}%, rgba(148,163,184,0.25) 100%)` };
    }
    return { background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${percentage}%, rgba(148,163,184,0.25) ${percentage}%, rgba(148,163,184,0.25) 100%)` };
  }, [isBipolar, percentage, centerPercent, accentColor]);

  return (
    <div className={`group rounded px-2 py-1.5 transition-all ${isModified ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] opacity-60">{icon}</span>
          <span className="text-[10px] font-medium text-slate-600">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-mono min-w-[32px] text-center px-1 py-0.5 rounded ${isModified ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-400'}`}>
            {value > 0 && isBipolar ? '+' : ''}{step < 1 ? value.toFixed(1) : value}{unit}
          </span>
          {isModified && <button onClick={() => onChange(defaultValue)} className="w-4 h-4 flex items-center justify-center text-[9px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded">↺</button>}
        </div>
      </div>
      <div dir="ltr" className="w-full relative">
        {isBipolar && <div className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-slate-400/50 z-10 pointer-events-none" style={{ left: `${centerPercent}%` }} />}
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-full cursor-pointer slider-input" style={trackStyle} />
      </div>
    </div>
  );
}

// ==================== SLIDER GROUP COMPONENT ====================
function SliderGroup({ name, icon, color, sliders, settings, onSliderChange }: {
  name: string; icon: string; color: string; sliders: SliderConfig[]; settings: ImageSettings; onSliderChange: (key: keyof ImageSettings, value: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const colors = colorMap[color] || colorMap.violet;
  const modifiedCount = sliders.filter(s => settings[s.key] !== defaultSettings[s.key]).length;

  return (
    <div className={`rounded-lg border ${isOpen ? colors.border : 'border-slate-200'} overflow-hidden transition-colors`}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-2 py-1.5 transition-colors ${isOpen ? colors.bg : 'bg-white hover:bg-slate-50'}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{icon}</span>
          <span className={`text-[10px] font-bold ${isOpen ? colors.text : 'text-slate-600'}`}>{name}</span>
          {modifiedCount > 0 && <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{modifiedCount}</span>}
        </div>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${isOpen ? colors.text : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-1 py-0.5 bg-white">
            {sliders.map((config) => (
              <Slider key={config.key} label={config.label} icon={config.icon} value={settings[config.key]} min={config.min} max={config.max} unit={config.unit} step={config.step} defaultValue={defaultSettings[config.key]} accentColor={colors.accent} onChange={(value) => onSliderChange(config.key, value)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PRESET CARD COMPONENT ====================
const PresetCard = ({ preset, isActive, onClick, imageUrl }: { preset: Preset; isActive: boolean; onClick: () => void; imageUrl: string; }) => {
  const filterStr = useMemo(() => getFilterString(preset.settings), [preset.settings]);
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 group transition-transform ${isActive ? 'scale-[0.98]' : 'hover:scale-[1.02]'}`}>
      <div className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${isActive ? 'border-indigo-500 shadow-lg shadow-indigo-300/40 ring-2 ring-indigo-300/50' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
        <img src={imageUrl} alt={preset.name} className="w-full h-full object-cover" style={{ filter: filterStr }} loading="lazy" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded"><span className="text-[9px]">{preset.icon}</span></div>
        {isActive && <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
        <div className="absolute bottom-0.5 left-0.5 flex gap-px">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`text-[5px] ${i < preset.popularity ? 'text-amber-400' : 'text-white/30'}`}>★</span>)}</div>
      </div>
      <span className={`text-[9px] font-semibold leading-tight text-center truncate w-full px-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}>{preset.name}</span>
    </button>
  );
};

// ==================== IMAGE PREVIEW COMPONENT ====================
function ImagePreview({ imageUrl, settings, showComparison, onDownload, isDownloading }: { imageUrl: string; settings: ImageSettings; showComparison: boolean; onDownload: () => void; isDownloading: boolean; }) {
  const filterStr = useMemo(() => getFilterString(settings), [settings]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const vignetteOpacity = settings.vignette / 100 * 0.7;
  const grainOpacity = settings.grain / 100 * 0.15;

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => { if (showComparison) { e.preventDefault(); setIsDragging(true); } }, [showComparison]);
  const handleMove = useCallback((clientX: number) => { if (!isDragging || !containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); const x = clientX - rect.left; setSliderPosition(Math.max(5, Math.min(95, (x / rect.width) * 100))); }, [isDragging]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) handleMove(e.touches[0].clientX); };
    const onEnd = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onEnd); window.addEventListener('touchmove', onTouchMove); window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onEnd); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onEnd); };
  }, [isDragging, handleMove]);

  useEffect(() => { if (showComparison) setSliderPosition(50); }, [showComparison]);

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 shadow-xl select-none">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)', backgroundSize: '12px 12px' }} />
      {showComparison ? (
        <>
          <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}><img src={imageUrl} alt="قبل" className="w-full h-full object-contain" draggable={false} /><div className="absolute top-2 right-2 bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded-md font-medium">قبل</div></div>
          <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}><img src={imageUrl} alt="بعد" className="w-full h-full object-contain" style={{ filter: filterStr }} draggable={false} />{settings.vignette > 0 && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${vignetteOpacity}) 100%)` }} />}{settings.grain > 0 && <div className="absolute inset-0 pointer-events-none grain-overlay" style={{ opacity: grainOpacity, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }} />}<div className="absolute top-2 left-2 bg-indigo-600/80 text-white text-[10px] px-2 py-1 rounded-md font-medium">بعد</div></div>
          <div className="absolute top-0 bottom-0 z-20 cursor-ew-resize touch-none" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }} onMouseDown={handleStart} onTouchStart={handleStart}><div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-[3px] border-indigo-500"><div className="flex items-center text-indigo-600"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></div></div></div>
        </>
      ) : (
        <>
          <img src={imageUrl} alt="تصویر" className="w-full h-full object-contain relative z-10 transition-[filter] duration-300" style={{ filter: filterStr }} draggable={false} />
          {settings.vignette > 0 && <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${vignetteOpacity}) 100%)` }} />}
          {settings.grain > 0 && <div className="absolute inset-0 z-20 pointer-events-none grain-overlay" style={{ opacity: grainOpacity, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '100px 100px' }} />}
        </>
      )}
      <button onClick={onDownload} disabled={isDownloading} className="absolute bottom-3 left-3 z-30 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white px-3 py-2 rounded-lg text-[11px] font-semibold shadow-lg transition-all flex items-center gap-1.5">
        {isDownloading ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span className="hidden sm:inline">ذخیره...</span></> : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="hidden sm:inline">ذخیره</span></>}
      </button>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [settings, setSettings] = useState<ImageSettings>({ ...defaultSettings });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePanel, setActivePanel] = useState<'presets' | 'controls'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSliderChange = useCallback((key: keyof ImageSettings, value: number) => { setSettings((prev) => ({ ...prev, [key]: value })); setActivePreset(null); }, []);
  const handlePresetClick = useCallback((preset: Preset) => { setSettings({ ...defaultSettings, ...preset.settings }); setActivePreset(preset.id); }, []);
  const handleReset = useCallback(() => { setSettings({ ...defaultSettings }); setActivePreset(null); }, []);
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); setUploadedImage(url); setSettings({ ...defaultSettings }); setActivePreset(null); } }, []);
  const handleRemoveImage = useCallback(() => { if (uploadedImage) URL.revokeObjectURL(uploadedImage); setUploadedImage(null); setSettings({ ...defaultSettings }); setActivePreset(null); }, [uploadedImage]);

  const filteredPresets = useMemo(() => {
    let result = activeCategory === 'all' ? presets : presets.filter((p) => p.category === activeCategory);
    if (searchQuery.trim()) { const q = searchQuery.trim().toLowerCase(); result = result.filter((p) => p.name.includes(q) || p.nameEn.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))); }
    return result;
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => { const counts: Record<string, number> = { all: presets.length }; presets.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; }); return counts; }, []);

  const handleDownload = useCallback(async () => {
    if (!uploadedImage) return;
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const img = new Image(); img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = uploadedImage; });
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      ctx.filter = getFilterString(settings); ctx.drawImage(img, 0, 0);
      if (settings.vignette > 0) { const vignetteOpacity = settings.vignette / 100 * 0.7; const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, canvas.width / 2, canvas.height / 2, canvas.width * 0.7); gradient.addColorStop(0, 'transparent'); gradient.addColorStop(1, `rgba(0,0,0,${vignetteOpacity})`); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      const link = document.createElement('a'); const presetName = activePreset ? presets.find(p => p.id === activePreset)?.nameEn || 'edited' : 'edited'; link.download = `image-${presetName}-${Date.now()}.png`; link.href = canvas.toDataURL('image/png', 1.0); link.click();
    } catch (error) { console.error('Error downloading image:', error); alert('خطا در ذخیره تصویر'); } finally { setIsDownloading(false); }
  }, [uploadedImage, settings, activePreset]);

  const modifiedSlidersCount = useMemo(() => Object.keys(settings).filter((key) => settings[key as keyof ImageSettings] !== defaultSettings[key as keyof ImageSettings]).length, [settings]);
  const groupedSliders = useMemo(() => sliderGroups.map((group) => ({ ...group, sliders: sliderConfigs.filter((s) => s.group === group.id) })), []);
  const activePresetData = useMemo(() => presets.find((p) => p.id === activePreset), [activePreset]);

  // Upload screen
  if (!uploadedImage) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 flex flex-col items-center justify-center p-4">
        <canvas ref={canvasRef} className="hidden" />
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">پریست‌های حرفه‌ای تصویر</h1>
          <p className="text-sm text-indigo-200/70">{presets.length}+ پریست تخصصی در {presetCategories.length - 1} دسته‌بندی</p>
        </div>
        <label className="group cursor-pointer">
          <div className="relative bg-white/5 backdrop-blur-xl border-2 border-dashed border-indigo-400/50 hover:border-indigo-400 rounded-3xl p-8 sm:p-12 transition-all hover:bg-white/10 hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors"><svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
              <div className="text-center"><p className="text-lg font-semibold text-white mb-1">انتخاب تصویر</p><p className="text-xs text-indigo-200/60">JPG, PNG یا WebP</p></div>
            </div>
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-md">
          {presetCategories.slice(1, 9).map((cat) => <span key={cat.id} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 rounded-full text-xs text-indigo-200/70"><span>{cat.icon}</span>{cat.name}</span>)}
          <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-indigo-200/70">+{presetCategories.length - 9} دسته دیگر</span>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="h-[100dvh] flex flex-col bg-slate-100 overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm z-50">
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
            <div className="hidden sm:block min-w-0"><h1 className="text-sm font-bold text-slate-800 truncate">پریست‌های حرفه‌ای</h1><p className="text-[10px] text-slate-400">{presets.length} پریست</p></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowComparison(!showComparison)} className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all border ${showComparison ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>⇆ مقایسه</button>
            {modifiedSlidersCount > 0 && <button onClick={handleReset} className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-red-50 text-red-600 rounded-lg border border-red-200">↺<span className="hidden sm:inline">بازنشانی</span></button>}
            <label className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">📁<span className="hidden sm:inline">تغییر تصویر</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
            <button onClick={handleRemoveImage} className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف تصویر">✕</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Image Preview */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 order-1 lg:order-2">
          <div className="lg:hidden flex-shrink-0 flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
            <div className="flex gap-1">
              <button onClick={() => setActivePanel('presets')} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${activePanel === 'presets' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>🎞️ پریست‌ها</button>
              <button onClick={() => setActivePanel('controls')} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${activePanel === 'controls' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>⚙️ تنظیمات</button>
            </div>
            <button onClick={() => setShowComparison(!showComparison)} className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${showComparison ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-600'}`}>⇆</button>
          </div>
          <div className="flex-1 relative p-2 sm:p-3 min-h-0"><ImagePreview imageUrl={uploadedImage} settings={settings} showComparison={showComparison} onDownload={handleDownload} isDownloading={isDownloading} /></div>
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-3 py-2">
            {activePresetData ? <div className="flex items-center gap-2"><span className="text-base">{activePresetData.icon}</span><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><span className="text-[11px] font-bold text-indigo-700">{activePresetData.name}</span><span className="text-[9px] text-slate-400">({activePresetData.nameEn})</span></div><p className="text-[9px] text-slate-400 truncate">{activePresetData.description}</p></div></div> : modifiedSlidersCount > 0 ? <div className="flex items-center gap-2"><span>✏️</span><span className="text-[11px] font-bold text-amber-700">تنظیمات سفارشی</span><span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">{modifiedSlidersCount}</span></div> : <p className="text-[10px] text-slate-400 text-center">یک پریست انتخاب کنید</p>}
          </div>
        </main>

        {/* Presets Panel */}
        <aside className={`${activePanel === 'presets' ? 'flex' : 'hidden'} lg:flex flex-col flex-shrink-0 w-full lg:w-[240px] xl:w-[280px] bg-white border-l border-slate-200 order-2 lg:order-1 h-[45vh] lg:h-auto`}>
          <div className="flex-shrink-0 p-2 border-b border-slate-100">
            <div className="relative"><input type="text" placeholder="جستجو..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-[11px] pr-7 pl-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" /><svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
          </div>
          <div className="flex-shrink-0 px-2 py-1.5 border-b border-slate-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-1 min-w-max">{presetCategories.map((cat) => <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex-shrink-0 flex items-center gap-0.5 px-2 py-1 text-[9px] font-semibold rounded-md transition-all ${activeCategory === cat.id ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50'}`}><span className="text-[10px]">{cat.icon}</span>{cat.name}<span className={`text-[8px] px-1 rounded ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-200'}`}>{categoryCounts[cat.id] || 0}</span></button>)}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 min-h-0" style={{ scrollbarWidth: 'thin' }}>
            {filteredPresets.length === 0 ? <div className="flex flex-col items-center justify-center py-8 text-slate-400"><span className="text-2xl mb-1">🔍</span><p className="text-[11px]">پریستی یافت نشد</p></div> : <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-1.5">{filteredPresets.map((preset) => <PresetCard key={preset.id} preset={preset} isActive={activePreset === preset.id} onClick={() => handlePresetClick(preset)} imageUrl={uploadedImage} />)}</div>}
          </div>
          <div className="flex-shrink-0 px-2 py-1.5 border-t border-slate-100 bg-slate-50/50"><p className="text-[9px] text-slate-400 text-center">{filteredPresets.length} از {presets.length}</p></div>
        </aside>

        {/* Controls Panel */}
        <aside className={`${activePanel === 'controls' ? 'flex' : 'hidden'} lg:flex flex-col flex-shrink-0 w-full lg:w-[220px] xl:w-[260px] bg-white border-r border-slate-200 order-3 h-[45vh] lg:h-auto`}>
          <div className="flex-shrink-0 px-2 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"><span className="text-[11px] font-bold text-slate-700">⚙️ تنظیمات</span>{modifiedSlidersCount > 0 && <button onClick={handleReset} className="text-[9px] text-red-500 hover:text-red-700 font-medium">↺ بازنشانی</button>}</div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0" style={{ scrollbarWidth: 'thin' }}>{groupedSliders.map((group) => <SliderGroup key={group.id} name={group.name} icon={group.icon} color={group.color} sliders={group.sliders} settings={settings} onSliderChange={handleSliderChange} />)}</div>
        </aside>
      </div>
    </div>
  );
}
