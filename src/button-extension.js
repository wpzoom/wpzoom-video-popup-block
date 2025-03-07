/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { 
    InspectorControls, 
    PanelColorSettings,
    getColorClassName,
} from '@wordpress/block-editor';

/**
 * Add hover color controls to the Button block.
 */
function addHoverColorControls( settings, name ) {
    // Only add controls to the core button block
    if ( name !== 'core/button' ) {
        return settings;
    }

    // Add new attributes to the block
    const newAttributes = {
        ...settings.attributes,
        customHoverBackgroundColor: {
            type: 'string',
        },
        customHoverTextColor: {
            type: 'string',
        },
    };

    return {
        ...settings,
        attributes: newAttributes,
    };
}

/**
 * Add hover color controls to the Button block inspector.
 */
const withHoverColorControls = createHigherOrderComponent( ( BlockEdit ) => {
    return ( props ) => {
        // Only add controls to the core button block
        if ( props.name !== 'core/button' ) {
            return <BlockEdit { ...props } />;
        }

        const { attributes, setAttributes } = props;
        const { customHoverBackgroundColor, customHoverTextColor } = attributes;

        return (
            <Fragment>
                <BlockEdit { ...props } />
                <InspectorControls>
                    <PanelColorSettings
                        title={ __( 'Hover Colors', 'wpzoom-video-popup-block' ) }
                        initialOpen={ false }
                        colorSettings={ [
                            {
                                value: customHoverBackgroundColor,
                                onChange: ( colorValue ) => {
                                    setAttributes( { customHoverBackgroundColor: colorValue } );
                                },
                                label: __( 'Background Color', 'wpzoom-video-popup-block' ),
                            },
                            {
                                value: customHoverTextColor,
                                onChange: ( colorValue ) => {
                                    setAttributes( { customHoverTextColor: colorValue } );
                                },
                                label: __( 'Text Color', 'wpzoom-video-popup-block' ),
                            },
                        ] }
                    />
                </InspectorControls>
            </Fragment>
        );
    };
}, 'withHoverColorControls' );

/**
 * Add custom styles to the Button block.
 */
const addHoverStyles = createHigherOrderComponent( ( BlockListBlock ) => {
    return ( props ) => {
        // Only add styles to the core button block
        if ( props.name !== 'core/button' ) {
            return <BlockListBlock { ...props } />;
        }

        const { attributes } = props;
        const { customHoverBackgroundColor, customHoverTextColor } = attributes;

        // Generate a unique ID for this button
        const buttonId = `wpzoom-button-${props.clientId}`;

        // Add custom styles for hover
        let customStyles = '';
        if ( customHoverBackgroundColor || customHoverTextColor ) {
            customStyles = `
                <style>
                    #${buttonId} .wp-block-button__link:hover {
                        ${customHoverBackgroundColor ? `background-color: ${customHoverBackgroundColor} !important;` : ''}
                        ${customHoverTextColor ? `color: ${customHoverTextColor} !important;` : ''}
                    }
                </style>
            `;
        }

        // Add a wrapper with ID and custom styles
        return (
            <div id={buttonId}>
                <BlockListBlock { ...props } />
                {customStyles && <div dangerouslySetInnerHTML={{ __html: customStyles }} />}
            </div>
        );
    };
}, 'addHoverStyles' );

/**
 * Add custom attributes to the Button block save output.
 */
function addHoverAttributesToSave( extraProps, blockType, attributes ) {
    // Only add attributes to the core button block
    if ( blockType.name !== 'core/button' ) {
        return extraProps;
    }

    const { customHoverBackgroundColor, customHoverTextColor } = attributes;

    // Debug the attributes
    console.log('WPZOOM Button Extension: addHoverAttributesToSave', {
        blockType: blockType.name,
        customHoverBackgroundColor,
        customHoverTextColor,
        extraProps
    });

    if ( customHoverBackgroundColor || customHoverTextColor ) {
        // Add data attributes to store hover colors
        // Use a prefix to make it easier to identify and remove our attributes
        if (customHoverBackgroundColor) {
            extraProps['data-hover-background'] = customHoverBackgroundColor;
        }
        if (customHoverTextColor) {
            extraProps['data-hover-text'] = customHoverTextColor;
        }
        
        // Ensure the has-hover-colors class is added
        // Use a prefix to make it easier to identify and remove our class
        extraProps.className = extraProps.className ? `${extraProps.className} has-hover-colors` : 'has-hover-colors';
        
        // Debug the final props
        console.log('WPZOOM Button Extension: Final extraProps', extraProps);
    }

    return extraProps;
}

// Register the filters
addFilter(
    'blocks.registerBlockType',
    'wpzoom/button-hover-colors/add-attributes',
    addHoverColorControls
);

addFilter(
    'editor.BlockEdit',
    'wpzoom/button-hover-colors/add-controls',
    withHoverColorControls
);

addFilter(
    'editor.BlockListBlock',
    'wpzoom/button-hover-colors/add-styles',
    addHoverStyles
);

addFilter(
    'blocks.getSaveContent.extraProps',
    'wpzoom/button-hover-colors/add-attributes-to-save',
    addHoverAttributesToSave
); 