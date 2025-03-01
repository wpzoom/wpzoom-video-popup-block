import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    ColorPalette,
    InnerBlocks,
    MediaUpload,
    MediaUploadCheck,
    __experimentalPanelColorGradientSettings as PanelColorGradientSettings,
    store as blockEditorStore
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    RangeControl,
    Button,
    SelectControl,
    __experimentalUnitControl as UnitControl,
    Icon,
    ToggleControl
} from '@wordpress/components';
import { close } from '@wordpress/icons';
import { getVideoProvider, getEmbedUrl, getYouTubeThumbnail } from './utils';
import { useDispatch, useSelect } from '@wordpress/data';
import './editor.scss';
import { useState, useEffect } from '@wordpress/element';

const ALLOWED_BLOCKS = [
    'core/paragraph',
    'core/heading',
    'core/buttons',
    'core/button',
    'core/columns',
    'core/column'
];

export default function Edit({ attributes, setAttributes, clientId }) {
    // Get dispatch functions
    const { selectBlock } = useDispatch(blockEditorStore);

    // Get parent block IDs
    const { parents } = useSelect(select => {
        const { getBlockParents } = select(blockEditorStore);
        return {
            parents: getBlockParents(clientId)
        };
    }, [clientId]);

    // Get the slideshow block ID (grandparent)
    const slideshowBlockId = parents.length >= 2 ? parents[parents.length - 2] : null;

    const {
        url,
        videoProvider,
        localVideoUrl,
        localVideoType,
        backgroundImageId,
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

    const blockProps = useBlockProps({
        className: `has-background-video ${videoProvider ? `has-background-video-${videoProvider}` : ''} ${backgroundImageUrl ? 'has-background-image' : ''}`,
        style: {
            backgroundColor: overlayColor || customOverlayColor,
            ...(backgroundImageUrl && {
                backgroundImage: `url(${backgroundImageUrl})`,
                backgroundSize,
            }),
        }
    });

    const onVideoUrlChange = (newUrl) => {
        const provider = getVideoProvider(newUrl);
        if (provider) {
            setAttributes({
                url: newUrl,
                videoProvider: provider,
                localVideoUrl: '',
                localVideoType: ''
            });
        }
    };

    const onSelectLocalVideo = (media) => {
        if (!media || !media.url) {
            return;
        }

        setAttributes({
            localVideoUrl: media.url,
            localVideoType: media.mime_type,
            url: '',
            videoProvider: 'local'
        });
    };

    const removeLocalVideo = () => {
        setAttributes({
            localVideoUrl: '',
            localVideoType: '',
            videoProvider: ''
        });
    };

    const onSelectImage = (media) => {
        if (!media || !media.url) {
            return;
        }

        setAttributes({
            backgroundImageUrl: media.url,
            backgroundImageId: media.id,
            backgroundImageAlt: media.alt || '',
        });
    };

    const removeImage = () => {
        setAttributes({
            backgroundImageUrl: '',
            backgroundImageId: undefined,
            backgroundImageAlt: '',
        });
    };

    const isExternalVideo = videoProvider === 'youtube' || videoProvider === 'vimeo';
    const selectedSource = isExternalVideo ? 'external' : videoProvider;

    // Add state for thumbnail
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    // Add effect to handle thumbnail loading
    useEffect(() => {
        if (videoProvider === 'youtube' && url) {
            setThumbnailLoaded(false);
            setVideoLoaded(false);
        }
    }, [url, videoProvider]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Slideshow Settings', 'wpzoom-slideshow-block')}>
                    {slideshowBlockId && (
                        <Button
                            onClick={() => selectBlock(slideshowBlockId)}
                            variant="secondary"
                            className="edit-slider-settings"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}
                        >
                            {__('Slideshow Settings', 'wpzoom-slideshow-block')}
                        </Button>
                    )}
                </PanelBody>
                <PanelBody title={__('Video Settings', 'wpzoom-slideshow-block')}>
                    <SelectControl
                        label={__('Video Source', 'wpzoom-slideshow-block')}
                        value={selectedSource}
                        options={[
                            { label: __('Select Source', 'wpzoom-slideshow-block'), value: '' },
                            { label: __('YouTube/Vimeo', 'wpzoom-slideshow-block'), value: 'external' },
                            { label: __('Self-hosted', 'wpzoom-slideshow-block'), value: 'local' }
                        ]}
                        onChange={(value) => {
                            if (value === '') {
                                setAttributes({
                                    videoProvider: '',
                                    url: '',
                                    localVideoUrl: '',
                                    localVideoType: ''
                                });
                            } else if (value === 'external') {
                                if (!url) {
                                    setAttributes({
                                        videoProvider: '',
                                        localVideoUrl: '',
                                        localVideoType: ''
                                    });
                                }
                            } else {
                                setAttributes({
                                    videoProvider: value,
                                    url: '',
                                    localVideoUrl: '',
                                    localVideoType: ''
                                });
                            }
                        }}
                    />

                    {(selectedSource === 'external' || selectedSource === '') && (
                        <div className="components-base-control video-url-control">
                            <label className="components-base-control__label" htmlFor="video-url-input">
                                {__('Video URL', 'wpzoom-slideshow-block')}
                            </label>
                            <div className="video-url-input-wrapper">
                                <input
                                    id="video-url-input"
                                    type="url"
                                    className="components-text-control__input"
                                    value={url || ''}
                                    onChange={(e) => onVideoUrlChange(e.target.value)}
                                    placeholder={__('Enter YouTube or Vimeo video URL', 'wpzoom-slideshow-block')}
                                />
                                {url && (
                                    <Button
                                        icon={close}
                                        label={__('Clear', 'wpzoom-slideshow-block')}
                                        onClick={() => {
                                            setAttributes({
                                                url: '',
                                                videoProvider: ''
                                            });
                                        }}
                                        className="clear-url-button"
                                    />
                                )}
                            </div>
                            <p className="components-base-control__help">
                                {__('Enter YouTube or Vimeo video URL', 'wpzoom-slideshow-block')}
                            </p>
                        </div>
                    )}

                    {videoProvider === 'local' && (
                        <div className="wp-block-video-cover__local-video-upload">
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={onSelectLocalVideo}
                                    allowedTypes={['video']}
                                    value={localVideoUrl}
                                    render={({ open }) => (
                                        <div>
                                            {!localVideoUrl ? (
                                                <Button
                                                    onClick={open}
                                                    variant="primary"
                                                >
                                                    {__('Upload Video', 'wpzoom-slideshow-block')}
                                                </Button>
                                            ) : (
                                                <div>
                                                    <video
                                                        src={localVideoUrl}
                                                        style={{ maxWidth: '100%' }}
                                                        controls
                                                    />
                                                    <div className="video-controls">
                                                        <Button
                                                            onClick={open}
                                                            variant="secondary"
                                                        >
                                                            {__('Replace Video', 'wpzoom-slideshow-block')}
                                                        </Button>
                                                        <Button
                                                            onClick={removeLocalVideo}
                                                            variant="link"
                                                            isDestructive
                                                        >
                                                            {__('Remove Video', 'wpzoom-slideshow-block')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
                            </MediaUploadCheck>
                        </div>
                    )}

                    <RangeControl
                        label={__('Overlay Opacity', 'wpzoom-slideshow-block')}
                        value={dimRatio}
                        onChange={(value) => setAttributes({ dimRatio: value })}
                        min={0}
                        max={100}
                        step={10}
                    />

                    {(videoProvider === 'local' || videoProvider === 'youtube' || videoProvider === 'vimeo') && (
                        <>
                            <ToggleControl
                                label={__('Show Pause Button', 'wpzoom-slideshow-block')}
                                help={__('Add a pause/play button overlay for the video', 'wpzoom-slideshow-block')}
                                checked={showPauseButton}
                                onChange={(value) => setAttributes({ showPauseButton: value })}
                            />
                            <ToggleControl
                                label={__('Show Unmute Button', 'wpzoom-slideshow-block')}
                                help={__('Add a mute/unmute button overlay for the video', 'wpzoom-slideshow-block')}
                                checked={showUnmuteButton}
                                onChange={(value) => setAttributes({ showUnmuteButton: value })}
                            />
                            {videoProvider === 'local' && (
                                <ToggleControl
                                    label={__('Show Fullscreen Button', 'wpzoom-slideshow-block')}
                                    help={__('Add a fullscreen button overlay for the video', 'wpzoom-slideshow-block')}
                                    checked={showFullscreenButton}
                                    onChange={(value) => setAttributes({ showFullscreenButton: value })}
                                />
                            )}
                        </>
                    )}
                </PanelBody>
                <PanelColorGradientSettings
                    title={__('Overlay Color', 'wpzoom-slideshow-block')}
                    initialOpen={false}
                    settings={[
                        {
                            colorValue: overlayColor || customOverlayColor,
                            onColorChange: (value) => {
                                setAttributes({
                                    customOverlayColor: value,
                                    overlayColor: undefined
                                });
                            },
                            label: __('Color', 'wpzoom-slideshow-block')
                        }
                    ]}
                />
                <PanelBody title={__('Background Settings', 'wpzoom-slideshow-block')}>
                    <div className="wpzoom-background-image-controls">
                        <p className="components-base-control__label">
                            {__('Background Image', 'wpzoom-slideshow-block')}
                        </p>
                        <p className="components-base-control__help">
                            {__('Select an image to use as background or fallback when video is not available', 'wpzoom-slideshow-block')}
                        </p>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectImage}
                                allowedTypes={['image']}
                                value={backgroundImageId}
                                render={({ open }) => (
                                    <div className="background-image-buttons">
                                        {!backgroundImageUrl ? (
                                            <Button
                                                onClick={open}
                                                variant="secondary"
                                            >
                                                {__('Select Image', 'wpzoom-slideshow-block')}
                                            </Button>
                                        ) : (
                                            <div className="background-image-preview">
                                                <img src={backgroundImageUrl} alt={backgroundImageAlt} />
                                                <div className="background-image-controls">
                                                    <Button
                                                        onClick={open}
                                                        variant="secondary"
                                                    >
                                                        {__('Replace', 'wpzoom-slideshow-block')}
                                                    </Button>
                                                    <Button
                                                        onClick={removeImage}
                                                        variant="link"
                                                        isDestructive
                                                    >
                                                        {__('Remove', 'wpzoom-slideshow-block')}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />
                        </MediaUploadCheck>

                        {backgroundImageUrl && (
                            <SelectControl
                                label={__('Background Size', 'wpzoom-slideshow-block')}
                                value={backgroundSize}
                                options={[
                                    { label: __('Cover', 'wpzoom-slideshow-block'), value: 'cover' },
                                    { label: __('Contain', 'wpzoom-slideshow-block'), value: 'contain' },
                                    { label: __('Auto', 'wpzoom-slideshow-block'), value: 'auto' }
                                ]}
                                onChange={(value) => setAttributes({ backgroundSize: value })}
                            />
                        )}
                    </div>
                </PanelBody>
            </InspectorControls>

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
                ) : (videoProvider && url) && (
                    <div className="wp-block-video-cover__video-background">
                        <div 
                            className={`wp-block-video-cover__thumbnail ${videoLoaded ? 'is-loaded' : ''}`}
                            style={{
                                backgroundImage: `url(${getYouTubeThumbnail(url)})`
                            }}
                        />
                        <iframe
                            src={getEmbedUrl(url, videoProvider)}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={videoLoaded ? 'is-loaded' : ''}
                            onLoad={() => {
                                // Short delay to ensure video starts playing
                                setTimeout(() => {
                                    setVideoLoaded(true);
                                }, 1000);
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
                    <InnerBlocks
                        allowedBlocks={ALLOWED_BLOCKS}
                        templateLock={false}
                        template={[
                            ['core/heading', {
                                textAlign: 'center',
                                content: 'Add Your Heading Here',
                                level: 2,
                                style: { 
                                    color: { text: '#ffffff' }
                                }
                            }],
                            ['core/buttons', {
                                layout: { type: 'flex', justifyContent: 'center' }
                            }, [
                                ['core/button', {
                                    text: 'Click Here',
                                    backgroundColor: 'vivid-cyan-blue'
                                }]
                            ]]
                        ]}
                    />
                </div>
            </div>
        </>
    );
} 