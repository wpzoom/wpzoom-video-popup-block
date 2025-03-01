import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

export default function initImageSlideshow(slideshow) {
    // Safety check - ensure slideshow exists
    if (!slideshow) {
        return null;
    }

    try {
        const swiperContainer = slideshow.querySelector('.swiper');
        if (!swiperContainer || !swiperContainer.dataset.swiper) {
            return null;
        }

        const options = JSON.parse(swiperContainer.dataset.swiper);
        
        // Apply navigation color if set
        if (options.navigationColor) {
            swiperContainer.style.setProperty('--wpzoom-navigation-color', options.navigationColor);
            swiperContainer.style.setProperty('--swiper-theme-color', options.navigationColor);
            swiperContainer.style.setProperty('--swiper-navigation-color', options.navigationColor);
            swiperContainer.style.setProperty('--swiper-pagination-color', options.navigationColor);
        }

        // Initialize Swiper with options
        const swiperOptions = {
            navigation: options.useNavigation ? {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            } : false,
            pagination: options.usePagination ? {
                el: '.swiper-pagination',
                clickable: true
            } : false,
            autoplay: options.autoplay ? {
                delay: 3000,
                disableOnInteraction: false
            } : false,
            loop: options.loop,
            speed: options.speed,
            effect: options.effect,
            observer: true,
            observeParents: true,
            resizeObserver: true,
            updateOnWindowResize: true
        };

        // Initialize Swiper
        return new Swiper(swiperContainer, swiperOptions);
    } catch (error) {
        console.warn('Error initializing image slideshow:', error);
        return null;
    }
}

// Initialize all image slideshows on page load
document.addEventListener('DOMContentLoaded', function() {
    const slideshows = document.querySelectorAll('.wp-block-wpzoom-image-slideshow');
    slideshows.forEach(slideshow => {
        initImageSlideshow(slideshow);
    });
}); 