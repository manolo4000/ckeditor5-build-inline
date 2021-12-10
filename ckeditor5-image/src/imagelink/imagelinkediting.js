/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagelink/imagelinkediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isImage } from '../image/utils';
import { linkElementCreator, getLinkFromImage, matchImageLink } from './utils';

/**
 * The image link engine plugin.
 *
 * It registers proper converters. It takes care of adding a link element if the image without it is inserted
 * to the model document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageLinkEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageLinkEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;
		const t = editor.t;

		/**
		 * The last selected link editable.
		 * It is used for hiding the editable when it is empty and the image widget is no longer selected.
		 *
		 * @private
		 * @member {module:engine/view/editableelement~EditableElement} #_lastSelectedLink
		 */

		// Schema configuration.
		schema.register( 'link', {
			allowIn: 'image',
			allowContentOf: '$block',
			isLimit: true
		} );

		// Add link element to each image inserted without it.
		editor.model.document.registerPostFixer( writer => this._insertMissingModelLinkElement( writer ) );

		// View to model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchImageLink,
			model: 'link'
		} );

		// Model to view converter for the data pipeline.
		const createLinkForData = writer => writer.createContainerElement( 'figlink' );
		data.downcastDispatcher.on( 'insert:link', linkModelToView( createLinkForData, false ) );

		// Model to view converter for the editing pipeline.
		const createLinkForEditing = linkElementCreator( view, t( 'Enter image link' ) );
		editing.downcastDispatcher.on( 'insert:link', linkModelToView( createLinkForEditing ) );

		// Always show link in view when something is inserted in model.
		editing.downcastDispatcher.on(
			'insert',
			this._fixLinkVisibility( data => data.item ),
			{ priority: 'high' }
		);

		// Hide link when everything is removed from it.
		editing.downcastDispatcher.on( 'remove', this._fixLinkVisibility( data => data.position.parent ), { priority: 'high' } );

		// Update link visibility on view in post fixer.
		view.document.registerPostFixer( writer => this._updateLinkVisibility( writer ) );
	}

	/**
	 * Updates the view before each rendering, making sure that empty links (so unnecessary ones) are hidden
	 * and then visible when the image is selected.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
	 * @returns {Boolean} Returns `true` when the view is updated.
	 */
	_updateLinkVisibility( viewWriter ) {
		const mapper = this.editor.editing.mapper;
		const lastLink = this._lastSelectedLink;
		let viewLink;

		// If whole image is selected.
		const modelSelection = this.editor.model.document.selection;
		const selectedElement = modelSelection.getSelectedElement();

		if ( selectedElement && selectedElement.is( 'image' ) ) {
			const modelLink = getLinkFromImage( selectedElement );
			viewLink = mapper.toViewElement( modelLink );
		}

		// If selection is placed inside link.
		const position = modelSelection.getFirstPosition();
		const modelLink = getParentLink( position.parent );

		if ( modelLink ) {
			viewLink = mapper.toViewElement( modelLink );
		}

		// Is currently any link selected?
		if ( viewLink ) {
			// Was any link selected before?
			if ( lastLink ) {
				// Same link as before?
				if ( lastLink === viewLink ) {
					return showLink( viewLink, viewWriter );
				} else {
					hideLinkIfEmpty( lastLink, viewWriter );
					this._lastSelectedLink = viewLink;

					return showLink( viewLink, viewWriter );
				}
			} else {
				this._lastSelectedLink = viewLink;
				return showLink( viewLink, viewWriter );
			}
		} else {
			// Was any link selected before?
			if ( lastLink ) {
				const viewModified = hideLinkIfEmpty( lastLink, viewWriter );
				this._lastSelectedLink = null;

				return viewModified;
			} else {
				return false;
			}
		}
	}

	/**
	 * Returns a converter that fixes link visibility during the model-to-view conversion.
	 * Checks if the changed node is placed inside the link element and fixes its visibility in the view.
	 *
	 * @private
	 * @param {Function} nodeFinder
	 * @returns {Function}
	 */
	_fixLinkVisibility( nodeFinder ) {
		return ( evt, data, conversionApi ) => {
			const node = nodeFinder( data );
			const modelLink = getParentLink( node );
			const mapper = this.editor.editing.mapper;
			const viewWriter = conversionApi.writer;

			if ( modelLink ) {
				const viewLink = mapper.toViewElement( modelLink );

				if ( viewLink ) {
					if ( modelLink.childCount ) {
						viewWriter.removeClass( 'ck-hidden', viewLink );
					} else {
						viewWriter.addClass( 'ck-hidden', viewLink );
					}
				}
			}
		};
	}

	/**
	 * Checks whether the data inserted to the model document have an image element that has no link element inside it.
	 * If there is none, it adds it to the image element.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer The writer to make changes with.
	 * @returns {Boolean} `true` if any change was applied, `false` otherwise.
	 */
	_insertMissingModelLinkElement( writer ) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();

		const imagesWithoutLink = [];

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				const item = entry.position.nodeAfter;

				if ( item.is( 'image' ) && !getLinkFromImage( item ) ) {
					imagesWithoutLink.push( item );
				}

				// Check elements with children for nested images.
				if ( !item.is( 'image' ) && item.childCount ) {
					for ( const nestedItem of model.createRangeIn( item ).getItems() ) {
						if ( nestedItem.is( 'image' ) && !getLinkFromImage( nestedItem ) ) {
							imagesWithoutLink.push( nestedItem );
						}
					}
				}
			}
		}

		for ( const image of imagesWithoutLink ) {
			writer.appendElement( 'link', image );
		}

		return !!imagesWithoutLink.length;
	}
}

// Creates a converter that converts image link model element to view element.
//
// @private
// @param {Function} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @returns {Function}
function linkModelToView( elementCreator, hide = true ) {
	return ( evt, data, conversionApi ) => {
		const linkElement = data.item;

		// Return if element shouldn't be present when empty.
		if ( !linkElement.childCount && !hide ) {
			return;
		}

		if ( isImage( linkElement.parent ) ) {
			if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
				return;
			}

			const viewImage = conversionApi.mapper.toViewElement( data.range.start.parent );
			const viewLink = elementCreator( conversionApi.writer );
			const viewWriter = conversionApi.writer;

			// Hide if empty.
			if ( !linkElement.childCount ) {
				viewWriter.addClass( 'ck-hidden', viewLink );
			}

			insertViewLinkAndBind( viewLink, data.item, viewImage, conversionApi );
		}
	};
}

// Inserts `viewLink` at the end of `viewImage` and binds it to `modelLink`.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} viewLink
// @param {module:engine/model/element~Element} modelLink
// @param {module:engine/view/containerelement~ContainerElement} viewImage
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function insertViewLinkAndBind( viewLink, modelLink, viewImage, conversionApi ) {
	const viewPosition = conversionApi.writer.createPositionAt( viewImage, 'end' );

	conversionApi.writer.insert( viewPosition, viewLink );
	conversionApi.mapper.bindElements( modelLink, viewLink );
}

// Checks if the provided node or one of its ancestors is a link element, and returns it.
//
// @private
// @param {module:engine/model/node~Node} node
// @returns {module:engine/model/element~Element|null}
function getParentLink( node ) {
	const ancestors = node.getAncestors( { includeSelf: true } );
	const link = ancestors.find( ancestor => ancestor.name == 'link' );

	if ( link && link.parent && link.parent.name == 'image' ) {
		return link;
	}

	return null;
}

// Hides a given link in the view if it is empty.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} link
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function hideLinkIfEmpty( link, viewWriter ) {
	if ( !link.childCount && !link.hasClass( 'ck-hidden' ) ) {
		viewWriter.addClass( 'ck-hidden', link );
		return true;
	}

	return false;
}

// Shows the link.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} link
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function showLink( link, viewWriter ) {
	if ( link.hasClass( 'ck-hidden' ) ) {
		viewWriter.removeClass( 'ck-hidden', link );
		return true;
	}

	return false;
}
