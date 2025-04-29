
export function getImageUrl(imageUrl?: string) {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
}
