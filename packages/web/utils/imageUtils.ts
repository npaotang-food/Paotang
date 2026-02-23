/**
 * imageUtils.ts
 * Client-side image compression + Supabase Storage upload
 *
 * Compress: ลดขนาดรูปเหลือ max 1000px, JPEG quality 75%
 * Upload:   อัพโหลดไป Supabase Storage bucket "images"
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'images';
const MAX_SIZE_PX = 1000;   // ความกว้าง/สูงสูงสุด (px)
const JPEG_QUALITY = 0.75;  // 75% quality

/** ลดขนาดรูปด้วย Canvas API (ทำงานใน browser เท่านั้น) */
export async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // คำนวณขนาดใหม่โดยรักษา aspect ratio
            let { width, height } = img;
            if (width > MAX_SIZE_PX || height > MAX_SIZE_PX) {
                if (width > height) {
                    height = Math.round((height * MAX_SIZE_PX) / width);
                    width = MAX_SIZE_PX;
                } else {
                    width = Math.round((width * MAX_SIZE_PX) / height);
                    height = MAX_SIZE_PX;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                },
                'image/jpeg',
                JPEG_QUALITY,
            );
        };

        img.onerror = () => reject(new Error('Image load failed'));
        img.src = url;
    });
}

/** Upload ไป Supabase Storage แล้วคืน public URL */
export async function uploadMenuImage(
    file: File,
    folder: string = 'menu',
): Promise<{ url: string; path: string }> {
    // 1. Compress
    const compressed = await compressImage(file);

    // 2. ชื่อไฟล์ unique
    const ext = 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // 3. Upload
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, compressed, {
            contentType: 'image/jpeg',
            upsert: false,
        });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
}

/** ลบรูปออกจาก Storage */
export async function deleteMenuImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(`Delete failed: ${error.message}`);
}

/** คำนวณขนาดไฟล์ที่อ่านได้ */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
