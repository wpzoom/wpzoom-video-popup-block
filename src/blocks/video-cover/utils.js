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

export const getYouTubeVideoId = (url) => {
    if (!url) return null;

    // Regular YouTube URL (https://www.youtube.com/watch?v=VIDEO_ID)
    let match = url.match(/(?:\?v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]+)/);
    
    return match ? match[1] : null;
};

export const getVimeoVideoId = (url) => {
    if (!url) return null;
    let match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    return match ? match[1] : null;
};

export const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;

    // Try maxresdefault first (highest quality)
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const getEmbedUrl = (url, provider) => {
    if (provider === 'youtube') {
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return url;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&enablejsapi=1`;
    }
    
    if (provider === 'vimeo') {
        const videoId = getVimeoVideoId(url);
        if (!videoId) return url;
        return `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&controls=0&transparent=0&api=1&volume=0`;
    }
    
    return url;
}; 