import { __ } from '@wordpress/i18n';
import { store, useBlockProps, useInnerBlocksProps, InspectorControls, ButtonBlockAppender } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, RangeControl, SelectControl, Button, __experimentalUnitControl as UnitControl, ColorPalette } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useSelect } from "@wordpress/data";
import { seen, edit } from '@wordpress/icons';
import initSlideshow from './script';
import './editor.scss';
import Swiper, { Navigation, Pagination, Autoplay } from 'swiper';

// Only allow wpzoom/slide blocks to be added
const ALLOWED_BLOCKS = ['wpzoom/slide'];

// Define the template for a single slide with dummy content
const SLIDE_TEMPLATE = [
	'wpzoom/slide',
	{},
	[
		[
			'wpzoom/video-cover',
			{
				dimRatio: 50,
				minHeight: '500px'
			},
			[
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
			]
		]
	]
];

// Define the template for initial slideshow creation with two slides
const SLIDESHOW_TEMPLATE = [SLIDE_TEMPLATE, SLIDE_TEMPLATE];

export default function Edit({ clientId, isSelected, attributes, setAttributes }) {
	const {
		useNavigation, usePagination, autoplay, loop,
		speed, spaceBetween, slidesPerView, effect, direction,
		freeMode, centeredSlides, cssMode, uniqueId,
		fullHeight, minHeight, navigationColor
	} = attributes;
	const blockInstance = useRef(null);
	const swiperInstance = useRef(null);

	// Add this useSelect hook to get hasInnerBlocksSelected
	const hasInnerBlocksSelected = useSelect(
		(select) => select(store).hasSelectedInnerBlock(clientId, true),
		[clientId]
	);

	// Change the preview mode state to be based on selection
	const [manualPreviewMode, setManualPreviewMode] = useState(false);

	// Compute the effective preview mode based on selection state
	const isPreviewMode = (!isSelected && !hasInnerBlocksSelected) || manualPreviewMode;

	// Track the number of inner blocks (slides)
	const innerBlocksCount = useSelect(
		(select) => select(store).getBlock(clientId)?.innerBlocks.length || 0,
		[clientId]
	);

	// Track inner blocks props with template lock
	const { children, ...innerBlockProps } = useInnerBlocksProps(useBlockProps(), {
		allowedBlocks: ALLOWED_BLOCKS,
		template: SLIDESHOW_TEMPLATE,
		__experimentalDefaultBlock: SLIDE_TEMPLATE,
		renderAppender: false
	});

	// Build swiper options to be used in the script.js
	const swiperOptions = JSON.stringify({
		useNavigation,
		usePagination,
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

	// Generate a unique ID only if one doesn't already exist
	useEffect(() => {
		if (!uniqueId) {
			const newUniqueId = 'slideshow-' + Math.random().toString(36).substr(2, 9);
			setAttributes({ uniqueId: newUniqueId });
		}
	}, [uniqueId]);

	// Initialize the Swiper instance when preview mode is enabled or options change
	useEffect(() => {
		if (!isPreviewMode) {
			if (swiperInstance.current) {
				swiperInstance.current.destroy(true, true);
					swiperInstance.current = null;
			}
			return;
		}

		// Add a small delay to ensure DOM is ready
		setTimeout(() => {
			const node = blockInstance.current?.querySelector('.swiper');
			if (node) {
				// Add swiper-wrapper class to the inner blocks container
				const wrapper = node.querySelector('.wp-block-wpzoom-slideshow');
				if (wrapper) {
					wrapper.classList.add('swiper-wrapper');
				}

				// Add swiper-slide class to all slides
				const slides = node.querySelectorAll('.wp-block-wpzoom-slide');
				slides.forEach(slide => {
					slide.classList.add('swiper-slide');
				});

				// Store current slide index before destroying instance
				const currentIndex = swiperInstance.current?.activeIndex || 0;

				// Destroy existing instance if it exists
				if (swiperInstance.current) {
					swiperInstance.current.destroy(true, true);
					swiperInstance.current = null;
				}

				// Initialize Swiper with all options
				const swiperOptions = {
					modules: [Navigation, Pagination, Autoplay],
					navigation: useNavigation ? {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
						enabled: true,
						hideOnClick: false
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
					spaceBetween,
					slidesPerView,
					effect,
					direction,
					freeMode,
					centeredSlides,
					cssMode: false,
					// Disable all touch/swipe interactions
					allowTouchMove: false,
					simulateTouch: false,
					mousewheel: false,
					keyboard: false,
					touchRatio: 0,
					resistance: false,
					// Keep navigation working
					allowSlideNext: true,
					allowSlidePrev: true,
					watchOverflow: true,
					observer: true,
					observeParents: true,
					on: {
						init: function() {
							if (currentIndex > 0) {
								this.slideTo(currentIndex, 0, false);
							}
							console.log('Swiper initialized successfully');
							
							// Ensure navigation is working
							if (useNavigation) {
								const swiper = this;
								const nextButton = node.querySelector('.swiper-button-next');
								const prevButton = node.querySelector('.swiper-button-prev');
								
								if (nextButton && prevButton) {
									nextButton.addEventListener('click', () => {
										swiper.slideNext();
										console.log('Next button clicked');
									});
									
									prevButton.addEventListener('click', () => {
										swiper.slidePrev();
										console.log('Prev button clicked');
									});
								}
							}
						}
					}
				};

				try {
					// Initialize new Swiper instance
					swiperInstance.current = new Swiper(node, swiperOptions);
					console.log('Swiper instance created:', swiperInstance.current);

					// Update navigation visibility
					const prevButton = node.querySelector('.swiper-button-prev');
					const nextButton = node.querySelector('.swiper-button-next');
					if (prevButton && nextButton) {
						prevButton.style.display = useNavigation ? 'flex' : 'none';
						nextButton.style.display = useNavigation ? 'flex' : 'none';
					}

					// Update pagination visibility
					const pagination = node.querySelector('.swiper-pagination');
					if (pagination) {
						pagination.style.display = usePagination ? 'block' : 'none';
					}
				} catch (error) {
					console.error('Error initializing Swiper:', error);
				}
			}
		}, 100); // Small delay to ensure DOM is ready

		// Cleanup function
		return () => {
			if (swiperInstance.current) {
				swiperInstance.current.destroy(true, true);
				swiperInstance.current = null;
			}
		};
	}, [
		isPreviewMode,
		useNavigation,
		usePagination,
		autoplay,
		loop,
		speed,
		spaceBetween,
		slidesPerView,
		
		effect,
		direction,
		freeMode,
		centeredSlides,
		cssMode
	]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Slideshow Settings", "wpzoom-slideshow-block")} initialOpen={true}>
					<ToggleControl
						label="Navigation"
						checked={useNavigation}
						onChange={(value) => setAttributes({ useNavigation: value })}
					/>
					<ToggleControl
						label="Pagination"
						checked={usePagination}
						onChange={(value) => setAttributes({ usePagination: value })}
					/>
					<ToggleControl
						label="Autoplay"
						checked={autoplay}
						onChange={(value) => setAttributes({ autoplay: value })}
					/>
					<ToggleControl
						label="Loop"
						checked={loop}
						onChange={(value) => setAttributes({ loop: value })}
					/>
					<ToggleControl
						label="Free Mode"
						checked={freeMode}
						onChange={(value) => setAttributes({ freeMode: value })}
					/>
					<ToggleControl
						label="Centered Slides"
						checked={centeredSlides}
						onChange={(value) => setAttributes({ centeredSlides: value })}
					/>
					<ToggleControl
							label="CSS Mode"
							checked={cssMode}
							onChange={(value) => setAttributes({ cssMode: value })}
					/>
					<RangeControl
						label="Speed (ms)"
						value={speed}
						onChange={(value) => setAttributes({ speed: value })}
						min={100}
						max={5000}
					/>
					<RangeControl
						label="Space Between (px)"
						value={spaceBetween}
						onChange={(value) => setAttributes({ spaceBetween: value })}
						min={0}
						max={200}
					/>
					<RangeControl
						label="Slides Per View"
						value={slidesPerView}
						onChange={(value) => setAttributes({ slidesPerView: value })}
						min={1}
						max={5}
					/>
					<SelectControl
						label="Effect"
						value={effect}
						options={[
							{ label: 'Slide', value: 'slide' },
							{ label: 'Fade', value: 'fade' },
							{ label: 'Cube', value: 'cube' },
							{ label: 'Flip', value: 'flip' },
							{ label: 'Coverflow', value: 'coverflow' }
						]}
						onChange={(value) => setAttributes({ effect: value })}
					/>
					<SelectControl
						label="Direction"
						value={direction}
						options={[
							{ label: 'Horizontal', value: 'horizontal' },
							{ label: 'Vertical', value: 'vertical' }
						]}
						onChange={(value) => setAttributes({ direction: value })}
					/>
                    </PanelBody>
					<PanelBody title={__('Height Settings', 'wpzoom-slideshow-block')}>
						<ToggleControl
							label={__('Full height', 'wpzoom-slideshow-block')}
							checked={attributes.isFullHeight}
							onChange={(value) => setAttributes({ isFullHeight: value })}
							help={
								attributes.isFullHeight
									? __('Slideshow will take up the full height of the viewport.', 'wpzoom-slideshow-block')
									: __('Slideshow will use default height.', 'wpzoom-slideshow-block')
							}
						/>
    					{!attributes.isFullHeight && (
    						<UnitControl
    							label="Min Height"
    							value={minHeight}
    							onChange={(value) => setAttributes({ minHeight: value })}
    							units={[
    								{ label: 'px', value: 'px', default: 500 },
    								{ label: '%', value: '%', default: 10 },
    								{ label: 'em', value: 'em', default: 1 },
    								{ label: 'rem', value: 'rem', default: 1 },
    								{ label: 'vw', value: 'vw', default: 10 },
    								{ label: 'vh', value: 'vh', default: 10 }
    							]}
    						/>
    					)}
                    </PanelBody>
					<PanelBody title={__("Color Settings", "wpzoom-slideshow-block")} initialOpen={false}>
						<div className="components-base-control">
							<label className="components-base-control__label">
								{__("Navigation Color", "wpzoom-slideshow-block")}
							</label>
							<ColorPalette
								value={navigationColor}
								onChange={(color) => setAttributes({ navigationColor: color })}
								clearable={false}
							/>
						</div>
					</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{(isSelected || hasInnerBlocksSelected) && (
					<div className="toggle-edit-mode">
						{!manualPreviewMode ? (
							<Button onClick={() => setManualPreviewMode(true)} variant="primary" icon={seen}>
								Switch to preview mode
							</Button>
						) : (
							<Button onClick={() => setManualPreviewMode(false)} variant="primary" icon={edit}>
								Switch to edit mode
							</Button>
							)}
					</div>
				)}
				<div className='slideshow-container' ref={blockInstance}>
					{isPreviewMode ? (
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
						</div>
					) : children}
				</div>
				<div className="append-slide-button">
					<ButtonBlockAppender rootClientId={clientId} />
				</div>
			</div>
		</>
	);
}
