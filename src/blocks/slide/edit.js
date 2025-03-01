/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InnerBlocks, useInnerBlocksProps, InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { PanelBody, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * Define the template for Video Cover without inner blocks
 */
const TEMPLATE = [
	['wpzoom/video-cover', {
		dimRatio: 50,
		minHeight: '500px'
	}]
];

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes, clientId }) {
	const blockProps = useBlockProps();

	// Get dispatch functions
	const { selectBlock } = useDispatch(blockEditorStore);

	// Get parent block IDs
	const { parents } = useSelect(select => {
		const { getBlockParents } = select(blockEditorStore);
		return {
			parents: getBlockParents(clientId)
		};
	}, [clientId]);

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		template: TEMPLATE,
		templateLock: 'all',
		allowedBlocks: ['wpzoom/video-cover']
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Slide Settings', 'wpzoom-slideshow-block')}>
					<Button 
						onClick={() => {
							const parentId = parents.at(-1);
							if (parentId) {
								selectBlock(parentId);
							}
						}}
						variant="secondary"
						className="edit-slider-settings"
						style={{
							width: '100%',
							justifyContent: 'center',
							marginBottom: '8px'
						}}
					>
						{__('Slideshow Settings', 'wpzoom-slideshow-block')}
					</Button>
				</PanelBody>
			</InspectorControls>

			<div {...innerBlocksProps} />
		</>
	);
}
