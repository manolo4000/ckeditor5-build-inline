/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagelink/utils
 */

import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * Returns a function that creates a link editable element for the given {@link module:engine/view/document~Document}.
 *
 * @param {module:engine/view/view~View} view
 * @param {String} placeholderText The text to be displayed when the link is empty.
 * @returns {Function}
 */
export function linkElementCreator( view, placeholderText ) {
	return writer => {
		const editable = writer.createEditableElement( 'figlink' );
		writer.setCustomProperty( 'imageLink', true, editable );

		enablePlaceholder( {
			view,
			element: editable,
			text: placeholderText
		} );

		return toWidgetEditable( editable, writer );
	};
}

/**
 * Returns `true` if a given view element is the image link editable.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isLink( viewElement ) {
	return !!viewElement.getCustomProperty( 'imageLink' );
}

/**
 * Returns the link model element from a given image element. Returns `null` if no link is found.
 *
 * @param {module:engine/model/element~Element} imageModelElement
 * @returns {module:engine/model/element~Element|null}
 */
export function getLinkFromImage( imageModelElement ) {
	for ( const node of imageModelElement.getChildren() ) {
		if ( !!node && node.is( 'link' ) ) {
			return node;
		}
	}

	return null;
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figlink>` element that is placed
 * inside the image `<figure>` element.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
 * cannot be matched.
 */
export function matchImageLink( element ) {
	const parent = element.parent;

	// Convert only links for images.
	if ( element.name == 'figlink' && parent && parent.name == 'figure' && parent.hasClass( 'image' ) ) {
		return { name: true };
	}

	return null;
}
