import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
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
        uniqueId
    } = attributes;

    const blockProps = useBlockProps.save({
        style: {
            height
        }
    });

    // Build swiper options to be used in the script.js
    const swiperOptions = JSON.stringify({
        useNavigation,
        usePagination,
        autoplay,
        loop,
        speed,
        effect,
        navigationColor
    });

    return (
        <div {...blockProps}>
            {images.length > 0 && (
                <div className="slideshow-container">
                    <div 
                        id={uniqueId}
                        className="swiper"
                        data-swiper={swiperOptions}
                        style={{ 
                            '--wpzoom-navigation-color': navigationColor,
                            height: '100%'
                        }}
                    >
                        <div className="swiper-wrapper">
                            {images.map((image, index) => (
                                <div key={image.id || index} className="swiper-slide">
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover' 
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {useNavigation && (
                            <>
                                <div className="swiper-button-prev"></div>
                                <div className="swiper-button-next"></div>
                            </>
                        )}
                        
                        {usePagination && (
                            <div className="swiper-pagination"></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 