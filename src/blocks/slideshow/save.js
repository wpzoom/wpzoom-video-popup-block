import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import classnames from 'classnames';

export default function save({ attributes }) {
	const {
		useNavigation, usePagination, useScrollbar, autoplay, loop,
		speed, spaceBetween, slidesPerView, effect, direction,
		freeMode, centeredSlides, cssMode, uniqueId,
		fullHeight, minHeight, navigationColor
	} = attributes;

	// Build swiper options to be used in the script.js
	const swiperOptions = JSON.stringify({
		useNavigation,
		usePagination,
		useScrollbar,
		autoplay,
		loop,
		speed,
		 spaceBetween,
		slidesPerView,
		effect,
		direction,
		freeMode,
		centeredSlides,
		cssMode,
		navigationColor
	});

	// Get block props
	const blockProps = useBlockProps.save({
		className: classnames({
			'is-full-height': attributes.isFullHeight
		}),
		style: {
			height: attributes.isFullHeight ? '100vh' : undefined,
			minHeight: attributes.isFullHeight ? '100vh' : minHeight
		}
	});

	const { children, ...innerBlocksProps } = useInnerBlocksProps.save(blockProps);

	return (
		<div {...blockProps}>
			<div className="slideshow-container">
				<div id={uniqueId} 
					className="swiper" 
					data-swiper={swiperOptions}
					style={{ '--wpzoom-navigation-color': navigationColor }}>
					<div className="wp-block-wpzoom-slideshow">{children}</div>
					{usePagination && <div className="swiper-pagination"></div>}
					{useNavigation && (
						<>
							<div className="swiper-button-prev"></div>
							<div className="swiper-button-next"></div>
						</>
					)}
					{useScrollbar && <div className="swiper-scrollbar"></div>}
				</div>
			</div>
		</div>
	);
}
