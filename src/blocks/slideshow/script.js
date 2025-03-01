import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

export default function initSlideshow(slideshow) {
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

        // Add swiper-wrapper class to the inner blocks container
        const wrapper = swiperContainer.querySelector('.swiper-wrapper');
        if (!wrapper) {
            const content = swiperContainer.querySelector('.wp-block-wpzoom-slideshow');
            if (content) {
                content.classList.add('swiper-wrapper');
            }
        }

        // Ensure slides have proper class
        const slides = swiperContainer.querySelectorAll('.wp-block-wpzoom-slide');
        slides.forEach(slide => {
            slide.classList.add('swiper-slide');
        });

        // Initialize Swiper with options
        const swiperOptions = {
            ...options,
            navigation: options.useNavigation ? {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            } : false,
            pagination: options.usePagination ? {
                el: '.swiper-pagination',
                clickable: true
            } : false,
            scrollbar: options.useScrollbar ? {
                el: '.swiper-scrollbar'
            } : false,
            autoplay: options.autoplay ? {
                delay: 3000,
                disableOnInteraction: false
            } : false,
            observer: true,
            observeParents: true,
            resizeObserver: true,
            updateOnWindowResize: true
        };

        // Initialize Swiper
        return new Swiper(swiperContainer, swiperOptions);
    } catch (error) {
        console.warn('Error initializing slideshow:', error);
        return null;
    }
}

// Initialize all slideshows on page load
document.addEventListener('DOMContentLoaded', function() {
    const slideshows = document.querySelectorAll('.wp-block-wpzoom-slideshow');
    slideshows.forEach(slideshow => {
        initSlideshow(slideshow);
    });
});
