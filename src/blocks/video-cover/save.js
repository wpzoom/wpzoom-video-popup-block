import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { getEmbedUrl, getYouTubeThumbnail } from './utils';

export default function save({ attributes }) {
    const {
        url,
        videoProvider,
        localVideoUrl,
        backgroundImageUrl,
        backgroundImageAlt,
        backgroundSize,
        dimRatio,
        overlayColor,
        customOverlayColor,
        showPauseButton,
        showUnmuteButton,
        showFullscreenButton
    } = attributes;

    const blockProps = useBlockProps.save({
        className: `has-background-video ${videoProvider ? `has-background-video-${videoProvider}` : ''} ${backgroundImageUrl ? 'has-background-image' : ''}`,
        style: {
            backgroundColor: overlayColor || customOverlayColor,
            ...(backgroundImageUrl && {
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize,
            }),
        }
    });

    return (
        <div {...blockProps}>
            {videoProvider === 'local' && localVideoUrl ? (
                <div className="wp-block-video-cover__video-background">
                    <video
                        src={localVideoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </div>
            ) : ((videoProvider === 'youtube' || videoProvider === 'vimeo') && url) && (
                <div className="wp-block-video-cover__video-background">
                    {videoProvider === 'youtube' && (
                        <div 
                            className="wp-block-video-cover__thumbnail"
                            data-thumbnail={getYouTubeThumbnail(url)}
                            style={{
                                backgroundImage: `url(${getYouTubeThumbnail(url)})`
                            }}
                        />
                    )}
                    <iframe
                        src={getEmbedUrl(url, videoProvider)}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={(e) => {
                            e.target.classList.add('is-loaded');
                            const thumbnail = e.target.previousElementSibling;
                            if (thumbnail) {
                                thumbnail.classList.add('is-loaded');
                            }
                        }}
                    />
                </div>
            )}
            {backgroundImageUrl && !videoProvider && (
                <div className="wp-block-video-cover__background-image">
                    <img src={backgroundImageUrl} alt={backgroundImageAlt} />
                </div>
            )}
            <div 
                className="wp-block-video-cover__overlay"
                style={{
                    opacity: dimRatio / 100,
                    backgroundColor: overlayColor || customOverlayColor
                }}
            />
            <div className="wp-block-video-cover__content">
                <InnerBlocks.Content />
            </div>
            {videoProvider === 'local' && localVideoUrl && showPauseButton && (
                <button 
                    className="wpzoom-video-cover__pause-button"
                    aria-label={__('Pause/Play video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-pause"></span>
                </button>
            )}
            {videoProvider === 'local' && localVideoUrl && showUnmuteButton && (
                <button 
                    className="wpzoom-video-cover__unmute-button"
                    aria-label={__('Unmute/Mute video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-volumeoff"></span>
                </button>
            )}
            {videoProvider === 'local' && localVideoUrl && showFullscreenButton && (
                <button 
                    className="wpzoom-video-cover__fullscreen-button"
                    aria-label={__('Enter fullscreen', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-fullscreen-alt"></span>
                </button>
            )}
            {videoProvider === 'youtube' && url && showPauseButton && (
                <button 
                    className="wpzoom-video-cover__pause-button"
                    aria-label={__('Pause/Play video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-pause"></span>
                </button>
            )}
            {videoProvider === 'youtube' && url && showUnmuteButton && (
                <button 
                    className="wpzoom-video-cover__unmute-button"
                    aria-label={__('Unmute/Mute video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-volumeoff"></span>
                </button>
            )}
            {videoProvider === 'vimeo' && url && showPauseButton && (
                <button 
                    className="wpzoom-video-cover__pause-button"
                    aria-label={__('Pause/Play video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-pause"></span>
                </button>
            )}
            {videoProvider === 'vimeo' && url && showUnmuteButton && (
                <button 
                    className="wpzoom-video-cover__unmute-button"
                    aria-label={__('Unmute/Mute video', 'wpzoom-slideshow-block')}
                >
                    <span className="dashicons dashicons-controls-volumeoff"></span>
                </button>
            )}
        </div>
    );
} 