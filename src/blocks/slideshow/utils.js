export const getVideoProvider = (url) => {
    if (!url) return null;
    
    // YouTube
    if (url.match(/youtube\.com|youtu\.be/)) {
        return 'youtube';
    }
    
    // Vimeo
    if (url.match(/vimeo\.com/)) {
        return 'vimeo';
    }
    
    return null;
};

export const getEmbedUrl = (url, provider) => {
    switch (provider) {
        case 'youtube':
            // Convert YouTube URL to embed URL with autoplay and mute
            return url.replace(
                /(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]+)/,
                'youtube.com/embed/$3?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=$3'
            );
            
        case 'vimeo':
            // Convert Vimeo URL to embed URL with autoplay and mute
            return url.replace(
                /vimeo\.com\/([0-9]+)/,
                'player.vimeo.com/video/$1?autoplay=1&muted=1&background=1'
            );
            
        default:
            return url;
    }
}; 