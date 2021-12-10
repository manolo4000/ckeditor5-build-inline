/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module comments/commentscommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The comments command. It is used by the {@link module:comments/commentsediting~CommentsEditing comments feature}
 * to apply the text commentsing.
 *
 *		editor.execute( 'comments', { value: 'greenMarker' } );
 *
 * **Note**: Executing the command without a value removes the attribute from the model. If the selection is collapsed
 * inside a text with the comments attribute, the command will remove the attribute from the entire range
 * of that text.
 *
 * @extends module:core/command~Command
 */
export default class CommentsCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		/**
		 * A value indicating whether the command is active. If the selection has some comments attribute,
		 * it corresponds to the value of that attribute.
		 *
		 * @observable
		 * @readonly
		 * @member {undefined|String} module:comments/commentscommand~CommentsCommand#value
		 */
		this.value = doc.selection.getAttribute( 'comments' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'comments' );
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.value] The value to apply.
	 *
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const commentser = options.value;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'comments' );

			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside text with `comments` attribute.
				if ( selection.hasAttribute( 'comments' ) ) {
					// Find the full commentsed range.
					const isSameComments = value => {
						return value.item.hasAttribute( 'comments' ) && value.item.getAttribute( 'comments' ) === this.value;
					};

					const commentsStart = position.getLastMatchingPosition( isSameComments, { direction: 'backward' } );
					const commentsEnd = position.getLastMatchingPosition( isSameComments );

					const commentsRange = writer.createRange( commentsStart, commentsEnd );

					// Then depending on current value...
					if ( !commentser || this.value === commentser ) {
						// ...remove attribute when passing commentser different then current or executing "eraser".
						writer.removeAttribute( 'comments', commentsRange );
						writer.removeSelectionAttribute( 'comments' );
					} else {
						// ...update `comments` value.
						writer.setAttribute( 'comments', commentser, commentsRange );
						writer.setSelectionAttribute( 'comments', commentser );
					}
				} else if ( commentser ) {
					writer.setSelectionAttribute( 'comments', commentser );
				}
			} else {
				for ( const range of ranges ) {
					if ( commentser ) {
						writer.setAttribute( 'comments', commentser, range );
					} else {
						writer.removeAttribute( 'comments', range );
					}
				}
			}
		} );
	}
}
