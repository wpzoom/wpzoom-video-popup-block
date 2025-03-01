import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    store as blockEditorStore,
    BlockControls,
    BlockAlignmentToolbar
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    ToggleControl,
    RangeControl,
    SelectControl,
    __experimentalUnitControl as UnitControl,
    ColorPalette,
    Notice,
    Placeholder,
    Spinner
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { isBlobURL } from '@wordpress/blob';
import { gallery, update } from '@wordpress/icons';
import Swiper, { Navigation, Pagination, Autoplay } from 'swiper';
import './editor.scss';

export default function Edit({ attributes, setAttributes, isSelected }) {
    const {
        images,
        useNavigation,
        usePagination,
        autoplay,
        loop,
        speed,
        effect,
        height,
        navigationColor,
        uniqueId,
        align
    } = attributes;

    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const blockProps = useBlockProps({
        className: align ? `align${align}` : '',
        style: {
            height
        }
    });
    const swiperRef = useRef(null);

    // Generate unique ID if not exists
    useEffect(() => {
        if (!uniqueId) {
            setAttributes({ 
                uniqueId: 'image-slideshow-' + Math.random().toString(36).substr(2, 9) 
            });
        }
    }, []);

    // Initialize Swiper with error handling
    useEffect(() => {
        const node = swiperRef.current?.querySelector('.swiper');
        if (!node || !images.length) return;

        try {
            const swiperOptions = {
                modules: [Navigation, Pagination, Autoplay],
                navigation: useNavigation ? {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                    enabled: true
                } : false,
                pagination: usePagination ? {
                    el: '.swiper-pagination',
                    clickable: true
                } : false,
                autoplay: autoplay ? {
                    delay: 3000,
                    disableOnInteraction: false
                } : false,
                loop,
                speed,
                effect,
                observer: true,
                observeParents: true,
                a11y: {
                    enabled: true,
                    prevSlideMessage: __('Previous slide', 'wpzoom-slideshow-block'),
                    nextSlideMessage: __('Next slide', 'wpzoom-slideshow-block'),
                    firstSlideMessage: __('This is the first slide', 'wpzoom-slideshow-block'),
                    lastSlideMessage: __('This is the last slide', 'wpzoom-slideshow-block'),
                    paginationBulletMessage: __('Go to slide {{index}}', 'wpzoom-slideshow-block')
                }
            };

            const swiper = new Swiper(node, swiperOptions);
            return () => swiper.destroy();
        } catch (err) {
            setError(__('Error initializing slideshow', 'wpzoom-slideshow-block'));
            console.error('Swiper initialization error:', err);
        }
    }, [images, useNavigation, usePagination, autoplay, loop, speed, effect]);

    const onSelectImages = (newImages) => {
        setIsUploading(true);
        setError(null);

        try {
            setAttributes({
                images: newImages.map(image => ({
                    id: image.id,
                    url: image.url,
                    alt: image.alt || ''
                }))
            });
        } catch (err) {
            setError(__('Error processing images', 'wpzoom-slideshow-block'));
            console.error('Image processing error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    // Show loading state for temporary blob URLs
    const isUploadingImages = images.some(image => isBlobURL(image.url));

    return (
        <>
            <InspectorControls>
                {error && (
                    <Notice status="error" isDismissible={false}>
                        {error}
                    </Notice>
                )}
                
                <PanelBody title={__('Images', 'wpzoom-slideshow-block')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectImages}
                            allowedTypes={['image']}
                            multiple={true}
                            gallery={true}
                            value={images.map(img => img.id)}
                            render={({ open }) => (
                                <Button
                                    onClick={open}
                                    variant="primary"
                                    icon={images.length ? update : gallery}
                                    style={{ width: '100%', marginBottom: '8px' }}
                                    disabled={isUploading}
                                >
                                    {images.length === 0 
                                        ? __('Add Images', 'wpzoom-slideshow-block')
                                        : __('Edit Images', 'wpzoom-slideshow-block')
                                    }
                                </Button>
                            )}
                        />
                    </MediaUploadCheck>
                </PanelBody>

                <PanelBody title={__('Slideshow Settings', 'wpzoom-slideshow-block')}>
                    <ToggleControl
                        label={__('Navigation Arrows', 'wpzoom-slideshow-block')}
                        checked={useNavigation}
                        onChange={value => setAttributes({ useNavigation: value })}
                    />
                    <ToggleControl
                        label={__('Pagination Dots', 'wpzoom-slideshow-block')}
                        checked={usePagination}
                        onChange={value => setAttributes({ usePagination: value })}
                    />
                    <ToggleControl
                        label={__('Autoplay', 'wpzoom-slideshow-block')}
                        checked={autoplay}
                        onChange={value => setAttributes({ autoplay: value })}
                    />
                    <ToggleControl
                        label={__('Loop', 'wpzoom-slideshow-block')}
                        checked={loop}
                        onChange={value => setAttributes({ loop: value })}
                    />
                    <RangeControl
                        label={__('Speed (ms)', 'wpzoom-slideshow-block')}
                        value={speed}
                        onChange={value => setAttributes({ speed: value })}
                        min={100}
                        max={5000}
                    />
                    <SelectControl
                        label={__('Effect', 'wpzoom-slideshow-block')}
                        value={effect}
                        options={[
                            { label: 'Slide', value: 'slide' },
                            { label: 'Fade', value: 'fade' },
                            { label: 'Cube', value: 'cube' },
                            { label: 'Flip', value: 'flip' },
                            { label: 'Coverflow', value: 'coverflow' }
                        ]}
                        onChange={value => setAttributes({ effect: value })}
                    />
                    <UnitControl
                        label={__('Height', 'wpzoom-slideshow-block')}
                        value={height}
                        onChange={value => setAttributes({ height: value })}
                        units={[
                            { label: 'px', value: 'px' },
                            { label: '%', value: '%' },
                            { label: 'vh', value: 'vh' }
                        ]}
                    />
                </PanelBody>

                <PanelBody title={__('Color Settings', 'wpzoom-slideshow-block')}>
                    <div className="components-base-control">
                        <label className="components-base-control__label">
                            {__('Navigation Color', 'wpzoom-slideshow-block')}
                        </label>
                        <ColorPalette
                            value={navigationColor}
                            onChange={color => setAttributes({ navigationColor: color })}
                            clearable={false}
                        />
                    </div>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} onClick={(e) => e.stopPropagation()}>
                <div className="slideshow-container" ref={swiperRef}>
                    {isUploadingImages && (
                        <Placeholder>
                            <Spinner />
                            {__('Uploading images…', 'wpzoom-slideshow-block')}
                        </Placeholder>
                    )}
                    
                    {!isUploadingImages && images.length === 0 ? (
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectImages}
                                allowedTypes={['image']}
                                multiple={true}
                                gallery={true}
                                render={({ open }) => (
                                    <Placeholder
                                        icon={gallery}
                                        label={__('Image Slideshow', 'wpzoom-slideshow-block')}
                                        instructions={__('Add images to create a slideshow', 'wpzoom-slideshow-block')}
                                    >
                                        <Button
                                            onClick={open}
                                            variant="primary"
                                            disabled={isUploading}
                                        >
                                            {__('Add Images', 'wpzoom-slideshow-block')}
                                        </Button>
                                    </Placeholder>
                                )}
                            />
                        </MediaUploadCheck>
                    ) : (
                        <div 
                            className="swiper"
                            style={{ 
                                '--wpzoom-navigation-color': navigationColor,
                                pointerEvents: 'none'
                            }}
                        >
                            <div className="swiper-wrapper">
                                {images.map((image, index) => (
                                    <div 
                                        key={image.id || index} 
                                        className="swiper-slide"
                                        role="group"
                                        aria-label={__('Slide {{index}} of {{total}}', {
                                            args: {
                                                index: index + 1,
                                                total: images.length
                                            }
                                        })}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.alt}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {useNavigation && (
                                <div style={{ pointerEvents: 'auto' }}>
                                    <div className="swiper-button-prev" />
                                    <div className="swiper-button-next" />
                                </div>
                            )}
                            {usePagination && (
                                <div className="swiper-pagination" style={{ pointerEvents: 'auto' }} />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 