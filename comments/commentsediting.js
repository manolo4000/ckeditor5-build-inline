/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module comments/commentsediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CommentsCommand from './commentscommand';

/**
 * The comments editing feature. It introduces the {@link module:comments/commentscommand~CommentsCommand command} and the `comments`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<mark>` element with a `class` attribute (`<mark class="marker-green">...</mark>`) depending
 * on the {@link module:comments/comments~CommentsConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CommentsEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CommentsEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		this.editor = editor;

		editor.config.define( 'comments', {
			options: [
				{
					model: 'yellowMarker',
					class: 'marker-yellow',
					title: 'Yellow marker',
					color: 'var(--ck-comments-marker-yellow)',
					type: 'marker'
				},
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'var(--ck-comments-marker-green)',
					type: 'marker'
				},
				{
					model: 'pinkMarker',
					class: 'marker-pink',
					title: 'Pink marker',
					color: 'var(--ck-comments-marker-pink)',
					type: 'marker'
				},
				{
					model: 'blueMarker',
					class: 'marker-blue',
					title: 'Blue marker',
					color: 'var(--ck-comments-marker-blue)',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'var(--ck-comments-pen-red)',
					type: 'pen'
				},
				{
					model: 'greenPen',
					class: 'pen-green',
					title: 'Green pen',
					color: 'var(--ck-comments-pen-green)',
					type: 'pen'
				}
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow comments attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: [ 'comments', 'commentId' ] } );

		const options = editor.config.get( 'comments.options' );

		editor.conversion.attributeToAttribute( {
			model: {
				name: 'comments',
				key: 'commentId'
			},
			view: {
				name: 'mark',
				key: 'comment-id'
			},
			converterPriority: 'low'
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: {
				key: 'commentId',
				name: '$text'
			},
			view: ( value, writer ) => {
				return writer.createAttributeElement( 'mark', { 'comment-id': value } );
			},
			converterPriority: 'high'
		} );

		// Set-up the two-way conversion.
		editor.conversion.attributeToElement( _buildDefinition( options ) );

		editor.commands.add( 'comments', new CommentsCommand( editor ) );
	}
}

// Converts the options array to a converter definition.
//
// @param {Array.<module:comments/comments~CommentsOption>} options An array with configured options.
// @returns {module:engine/conversion/conversion~ConverterDefinition}
function _buildDefinition( options ) {
	const definition = {
		model: {
			key: 'comments',
			values: []
		},
		view: {},
		upcastAlso: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model );
		definition.view[ option.model ] = {
			name: 'mark',
			classes: [ option.class, 'comment' ]
		};
	}

	return definition;
}
