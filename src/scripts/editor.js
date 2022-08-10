'use strict';

/*
  TODO:
  - Icon picker
  - Cache thumbnails
*/

import json from '../../block.json';
import classnames from 'classnames';
import styled from '@emotion/styled';
import { registerBlockType } from '@wordpress/blocks';
import { useState, setState, useEffect, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useInstanceId } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';
import {
	useBlockProps,
	InspectorControls,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseColorProps as useColorProps,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
	__experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles
} from '@wordpress/block-editor';
import {
	BaseControl,
	TextControl,
	TextareaControl,
	Button,
	Icon,
	Spinner,
	Flex,
	FlexItem,
	VisuallyHidden,
	__experimentalUnitControl as UnitControl,
	__experimentalAlignmentMatrixControl as AlignmentMatrixControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalVStack as VStack
} from '@wordpress/components';
import urlParser from 'js-video-url-parser/lib/base';
import 'js-video-url-parser/lib/provider/youtube';
import 'js-video-url-parser/lib/provider/vimeo';
import 'js-video-url-parser/lib/provider/dailymotion';
import embed from 'embed-video';

const translateAlignments = input => {
	return input
		.replace( 'top', 'start' )
		.replace( 'left', 'start' )
		.replace( 'bottom', 'end' )
		.replace( 'right', 'end' );
}

registerBlockType(
	json.name,
	{
		edit: ( props ) => {
			const { attributes, setAttributes, clientId } = props;
			const {
				id,
				url,
				text,
				textPosition,
				iconColor,
				iconSize,
				overlayColor,
				_thumbnail,
				_embed
			} = attributes;
			const blockProps = useBlockProps( {
				className: classnames( 'wpzoom-video-popup-block', { [`wpzoom-video-popup-block_${id}`]: id && id.trim().length > 0 } )
			} );
			const colorProps = useColorProps( attributes );
			const color = _.pick( colorProps.style, [ 'color' ] );
			const bgColor = _.pick( colorProps.style, [ 'backgroundColor' ] );
			const spacingProps = useSpacingProps( attributes );
			const padding = _.pick( spacingProps.style, [ 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom' ] );
			const margin = _.pick( spacingProps.style, [ 'marginTop', 'marginLeft', 'marginRight', 'marginBottom' ] );
			const borderProps = useBorderProps( attributes );
			const [ state, setState ] = useState( { thumbnail: '', embed: '', loading: false } );
			const textPositionArgs = textPosition && typeof textPosition === 'string' && textPosition.trim().length > 0
				? translateAlignments( textPosition ).split( ' ' )
				: [];
			const alignVertical = textPositionArgs.length > 0 ? textPositionArgs[0] : 'center';
			const alignHorizontal = textPositionArgs.length > 1 ? textPositionArgs[1] : 'center';
			const buttonHref = url && typeof url === 'string' && url.length > 0 && typeof urlParser.parse( url ) !== 'undefined'
				? `#TB_inline?height=500&width=600&inlineId=wpzoom-video-popup-block_${id}_embed-code`
				: undefined;
			const Root = styled.div`box-sizing: border-box; max-width: 235px; padding-bottom: 12px; width: 100%;`;
			const Header = styled( Flex )`margin-bottom: 8px;`;
			const HeaderControlWrapper = styled( Flex )`min-height: 30px; gap: 0;`;

			const getVideoDetails = ( theUrl ) => {
				if ( theUrl.length > 0 ) {
					const urlParsed = urlParser.parse( theUrl );

					if ( typeof urlParsed !== 'undefined' ) {
						setState( { thumbnail: '', embed: '', loading: true } );
						setAttributes( { _thumbnail: '', _embed: '' } );

						const thumbSize = 'vimeo' === urlParsed.provider
							? 'thumbnail_large'
							: ( 'dailymotion' === urlParsed.provider
								? 'thumbnail_1080_url'
								: 'maxresdefault' );

						embed.image( theUrl, { image: thumbSize }, ( err, thumb ) => {
							if ( err ) {
								setState( { thumbnail: '', embed: '', loading: false } );
								setAttributes( { _thumbnail: '', _embed: '' } );
								throw err;
							} else {
								const embedCode = embed( theUrl );
								setState( { thumbnail: thumb.src, embed: embedCode, loading: false } );
								setAttributes( { _thumbnail: thumb.src, _embed: embedCode } );
							}
						} );

						return;
					}
				}

				setState( { thumbnail: '', embed: '', loading: false } );
				setAttributes( { _thumbnail: '', _embed: '' } );
			};

			useEffect(
				() => {
					if ( '' === id ) {
						setAttributes( { id: clientId.split( '-' )[0] } );
					}
				},
				[]
			);

			useEffect( () => getVideoDetails( url || '' ), [] );

			return (
				<>
					<InspectorControls>
						<div className="wpzoom-video-popup-block-inspector">
							<ToolsPanel
								label={ __( 'Content', 'wpzoom-video-popup-block' ) }
								resetAllFilter={ ( newAttributes ) => ( {
									...newAttributes,
									url: undefined,
									text: undefined
								} ) }
							>
								<ToolsPanelItem
									label={ __( 'Video URL', 'wpzoom-video-popup-block' ) }
									hasValue={ () => !! url }
									onDeselect={ () => setAttributes( { url: undefined } ) }
									isShownByDefault
									resetAllFilter={ ( newAttributes ) => ( {
										...newAttributes,
										url: undefined,
									} ) }
								>
									<VStack className="video-url-input">
										<TextControl
											label={ __( 'Video URL', 'wpzoom-video-popup-block' ) }
											placeholder={ __( 'e.g. https://youtu.be/GRMSwnJzRDA', 'wpzoom-video-popup-block' ) }
											style={ { margin: 0 } }
											value={ url || '' }
											onChange={ ( value ) => {
												const val = value.trim();
												setAttributes( { url: val } );
												getVideoDetails( val );
											} }
										/>

										<div className={ classnames( 'preview-image', { 'show-preview': state.loading || '' !== state.thumbnail } ) }>
											{ state.loading ?
												<Spinner />
											:
												<img src={ state.thumbnail } />
											}
										</div>
									</VStack>
								</ToolsPanelItem>

								<ToolsPanelItem
									label={ __( 'Overlay Text', 'wpzoom-video-popup-block' ) }
									hasValue={ () => !! text }
									onDeselect={ () => setAttributes( { text: undefined } ) }
									isShownByDefault
									resetAllFilter={ ( newAttributes ) => ( {
										...newAttributes,
										text: undefined,
									} ) }
								>
									<TextareaControl
										label={ __( 'Overlay Text', 'wpzoom-video-popup-block' ) }
										placeholder={ __( 'Write overlay text…', 'wpzoom-video-popup-block' ) }
										rows="2"
										value={ text }
										onChange={ ( value ) => setAttributes( { text: value } ) }
									/>
								</ToolsPanelItem>
							</ToolsPanel>
						</div>
					</InspectorControls>

					<InspectorControls __experimentalGroup="color">
						<ToolsPanelItem
							label={ __( 'Icon', 'wpzoom-video-popup-block' ) }
							hasValue={ () => !! iconColor }
							onDeselect={ () => setAttributes( { iconColor: undefined } ) }
							panelId={ clientId }
							isShownByDefault={ false }
							resetAllFilter={ ( newAttributes ) => ( {
								...newAttributes,
								iconColor: undefined
							} ) }
						>
							<ColorGradientSettingsDropdown
								__experimentalHasMultipleOrigins
								__experimentalIsRenderedInSidebar
								settings={ [
									{
										colorValue: iconColor,
										label: __( 'Icon', 'wpzoom-video-popup-block' ),
										onColorChange: ( value ) => setAttributes( { iconColor: value } ),
										isShownByDefault: false,
										disableCustomGradients: true,
										enableAlpha: true,
										resetAllFilter: () => ( { iconColor: undefined } )
									},
								] }
								panelId={ clientId }
							/>
						</ToolsPanelItem>

						<ToolsPanelItem
							label={ __( 'Overlay', 'wpzoom-video-popup-block' ) }
							hasValue={ () => !! overlayColor }
							onDeselect={ () => setAttributes( { overlayColor: undefined } ) }
							panelId={ clientId }
							isShownByDefault={ false }
							resetAllFilter={ ( newAttributes ) => ( {
								...newAttributes,
								overlayColor: undefined
							} ) }
						>
							<ColorGradientSettingsDropdown
								__experimentalHasMultipleOrigins
								__experimentalIsRenderedInSidebar
								settings={ [
									{
										colorValue: overlayColor,
										label: __( 'Overlay', 'wpzoom-video-popup-block' ),
										onColorChange: ( value ) => setAttributes( { overlayColor: value } ),
										isShownByDefault: false,
										enableAlpha: true,
										resetAllFilter: () => ( { overlayColor: undefined } )
									},
								] }
								panelId={ clientId }
							/>
						</ToolsPanelItem>
					</InspectorControls>

					<InspectorControls __experimentalGroup="dimensions">
						<ToolsPanelItem
							label={ __( 'Content Position', 'wpzoom-video-popup-block' ) }
							hasValue={ () => !! textPosition }
							onDeselect={ () => setAttributes( { textPosition: undefined } ) }
							panelId={ clientId }
							isShownByDefault={ false }
							resetAllFilter={ ( newAttributes ) => ( {
								...newAttributes,
								textPosition: undefined,
							} ) }
						>
							<Root role="group">
								<Header className="component-box-control__header">
									<FlexItem>
										<BaseControl.VisualLabel>
											{ __( 'Content Position', 'wpzoom-video-popup-block' ) }
										</BaseControl.VisualLabel>
									</FlexItem>
								</Header>

								<HeaderControlWrapper className="component-box-control__header-control-wrapper">
									<AlignmentMatrixControl
										label={ __( 'Change content position', 'wpzoom-video-popup-block' ) }
										value={ textPosition }
										onChange={ ( value ) => setAttributes( { textPosition: value } ) }
									/>
								</HeaderControlWrapper>
							</Root>
						</ToolsPanelItem>

						<ToolsPanelItem
							label={ __( 'Icon Size', 'wpzoom-video-popup-block' ) }
							hasValue={ () => !! iconSize }
							onDeselect={ () => setAttributes( { iconSize: undefined } ) }
							panelId={ clientId }
							isShownByDefault={ false }
							resetAllFilter={ ( newAttributes ) => ( {
								...newAttributes,
								iconSize: undefined,
							} ) }
						>
							<Root role="group">
								<Header className="component-box-control__header">
									<FlexItem>
										<BaseControl.VisualLabel>
											{ __( 'Icon Size', 'wpzoom-video-popup-block' ) }
										</BaseControl.VisualLabel>
									</FlexItem>
								</Header>

								<HeaderControlWrapper className="component-box-control__header-control-wrapper">
									<UnitControl
										label={ __( 'Change icon size', 'wpzoom-video-popup-block' ) }
										hideLabelFromVision={ true }
										value={ iconSize }
										onChange={ ( value ) => setAttributes( { iconSize: value } ) }
										units={ [
											{ value: 'px', label: 'px', default: 64 },
											{ value: 'em', label: 'em', default: 2 },
											{ value: 'rem', label: 'rem', default: 4 },
										] }
									/>
								</HeaderControlWrapper>
							</Root>
						</ToolsPanelItem>
					</InspectorControls>

					<div { ...blockProps }>
						<a
							href={ buttonHref }
							onClick={ ( e ) => e.preventDefault() }
							className="wpzoom-video-popup-block_button"
							style={ {
								...bgColor,
								...borderProps.style,
								...margin
							} }
						>
							<img
								src={ state.thumbnail }
								className="wpzoom-video-popup-block_thumbnail"
							/>

							<div
								className="wpzoom-video-popup-block_overlay"
								style={ {
									...color,
									backgroundColor: overlayColor,
									alignItems: alignVertical,
									justifyContent: alignHorizontal,
									...padding
								} }
							>
								<span
									className="wpzoom-video-popup-block_icon dashicon dashicons dashicons-admin-collapse"
									style={ {
										fontSize: iconSize,
										color: iconColor
									} }
								></span>

								{ typeof text !== 'undefined' && text }
							</div>
						</a>

						<div
							id={ `wpzoom-video-popup-block_${id}_embed-code` }
							className="wpzoom-video-popup-block_embed-code"
						>
							<RawHTML id="wpzoom-video-popup-block_embed-code-inner">
								{ state.embed }
							</RawHTML>
						</div>
					</div>
				</>
			);
		},

		save: ( props ) => {
			const { attributes } = props;
			const {
				id,
				url,
				text,
				textPosition,
				iconColor,
				iconSize,
				overlayColor,
				_thumbnail,
				_embed
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: classnames( 'wpzoom-video-popup-block', { [`wpzoom-video-popup-block_${id}`]: id && id.trim().length > 0 } )
			} );
			const colorProps = getColorClassesAndStyles( attributes );
			const color = _.pick( colorProps.style, [ 'color' ] );
			const bgColor = _.pick( colorProps.style, [ 'backgroundColor' ] );
			const spacingProps = getSpacingClassesAndStyles( attributes );
			const padding = _.pick( spacingProps.style, [ 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom' ] );
			const margin = _.pick( spacingProps.style, [ 'marginTop', 'marginLeft', 'marginRight', 'marginBottom' ] );
			const borderProps = getBorderClassesAndStyles( attributes );
			const textPositionArgs = textPosition && typeof textPosition === 'string' && textPosition.trim().length > 0
				? translateAlignments( textPosition ).split( ' ' )
				: [];
			const alignVertical = textPositionArgs.length > 0 ? textPositionArgs[0] : 'center';
			const alignHorizontal = textPositionArgs.length > 1 ? textPositionArgs[1] : 'center';
			const buttonHref = _embed && typeof _embed === 'string' && _embed.length > 0
				? `#TB_inline?height=500&width=600&inlineId=wpzoom-video-popup-block_${id}_embed-code`
				: undefined;

			return (
				<div { ...blockProps }>
					<a
						href={ buttonHref }
						className="wpzoom-video-popup-block_button thickbox"
						style={ {
							...bgColor,
							...borderProps.style,
							...margin
						} }
					>
						<img
							src={ _thumbnail }
							className="wpzoom-video-popup-block_thumbnail"
						/>

						<div
							className="wpzoom-video-popup-block_overlay"
							style={ {
								...color,
								backgroundColor: overlayColor,
								alignItems: alignVertical,
								justifyContent: alignHorizontal,
								...padding
							} }
						>
							<span
								className="wpzoom-video-popup-block_icon dashicon dashicons dashicons-admin-collapse"
								style={ {
									fontSize: iconSize,
									color: iconColor
								} }
							></span>

							{ typeof text !== 'undefined' && text }
						</div>
					</a>

					<div
						id={ `wpzoom-video-popup-block_${id}_embed-code` }
						className="wpzoom-video-popup-block_embed-code"
					>
						<RawHTML id="wpzoom-video-popup-block_embed-code-inner">
							{ _embed }
						</RawHTML>
					</div>
				</div>
			);
		},
	}
);
