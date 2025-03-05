/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

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
        hoverBackgroundColor: {
            type: 'string',
        },
        hoverTextColor: {
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
        const { hoverBackgroundColor, hoverTextColor } = attributes;

        return (
            <Fragment>
                <BlockEdit { ...props } />
                <InspectorControls>
                    <PanelBody
                        title={ __( 'Hover Settings', 'wpzoom-video-popup-block' ) }
                        initialOpen={ false }
                    >
                        <PanelColorSettings
                            title={ __( 'Hover Colors', 'wpzoom-video-popup-block' ) }
                            colorSettings={ [
                                {
                                    value: hoverBackgroundColor,
                                    onChange: ( value ) => setAttributes( { hoverBackgroundColor: value } ),
                                    label: __( 'Background Color', 'wpzoom-video-popup-block' ),
                                },
                                {
                                    value: hoverTextColor,
                                    onChange: ( value ) => setAttributes( { hoverTextColor: value } ),
                                    label: __( 'Text Color', 'wpzoom-video-popup-block' ),
                                },
                            ] }
                        />
                    </PanelBody>
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
        const { hoverBackgroundColor, hoverTextColor } = attributes;

        // Generate a unique ID for this button
        const buttonId = `wpzoom-button-${props.clientId}`;

        // Add custom styles for hover
        let customStyles = '';
        if ( hoverBackgroundColor || hoverTextColor ) {
            customStyles = `
                <style>
                    #${buttonId} .wp-block-button__link:hover {
                        ${hoverBackgroundColor ? `background-color: ${hoverBackgroundColor} !important;` : ''}
                        ${hoverTextColor ? `color: ${hoverTextColor} !important;` : ''}
                        transition: all 0.3s ease;
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

    const { hoverBackgroundColor, hoverTextColor } = attributes;

    if ( hoverBackgroundColor || hoverTextColor ) {
        // Add data attributes to store hover colors
        extraProps['data-hover-background'] = hoverBackgroundColor || '';
        extraProps['data-hover-text'] = hoverTextColor || '';
        extraProps.className = extraProps.className ? `${extraProps.className} has-hover-colors` : 'has-hover-colors';
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