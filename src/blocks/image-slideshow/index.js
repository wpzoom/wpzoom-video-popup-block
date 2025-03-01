import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import './style.scss';
import './editor.scss';

registerBlockType('wpzoom/image-slideshow', {
    edit: Edit,
    save: Save,
    transforms: {
        from: [
            {
                type: 'block',
                blocks: ['core/gallery'],
                transform: (attributes) => {
                    return createBlock('wpzoom/image-slideshow', {
                        images: attributes.images?.map(image => ({
                            id: image.id,
                            url: image.url,
                            alt: image.alt || ''
                        })) || []
                    });
                }
            }
        ]
    }
}); 