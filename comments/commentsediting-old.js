import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidgetEditable,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import './theme/comments.css';

export default class CommentsEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'CommentsEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();
		// this.editor.commands.add( 'crossreference', new CrossreferenceCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'comments' ) )
		);

		// this.editor.model.document.on( 'change:data', () => {
		// 	console.log( 'The data has changed!' );
		// } );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'comments', {
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The placeholder will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and can be selected:
			isObject: true,

			// The placeholder can have many types, like date, name, surname, etc:
			allowAttributes: [ 'class', 'id' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'comment' ]
			},
			model: ( viewElement, modelWriter ) => {
				// Extract the "name" from "{name}".
				const child = viewElement.getChild( 0 );
				const data = child ? child.data : '';
				const id = viewElement.getAttribute( 'id' );

				return modelWriter.createElement( 'comments', { id, data: viewElement } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'comments',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createCommentView( modelItem, viewWriter );

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidgetEditable( widgetElement, viewWriter );
			}
		} ).add( dispatcher => {
			// Specify converter for attribute `text` on element `dailyNote`.
			dispatcher.on( 'attribute:data', ( evt, data, conversionApi ) => {
				const element = data.item;

				// Mark element as consumed by conversion.
				conversionApi.consumable.consume( data.item, evt.name );

				/*// Get mapped view element to update.
				const viewElement = conversionApi.mapper.toViewElement( element );

				// Remove current <div> element contents.
				conversionApi.writer.remove( viewElement.getChild( 0 ) );

				// Set current content
				setContent( conversionApi.writer, data.attributeNewValue, viewElement );*/
			} );
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'comments',
			view: createCommentView
		} );

		function setContent( viewWriter, data, commentView ) {
			const innerText = viewWriter.createText( String(data) );
			viewWriter.insert( viewWriter.createPositionAt( commentView, 0 ), innerText );
		}

		// Helper method for both downcast converters.
		function createCommentView( modelItem, viewWriter ) {
			const id = modelItem.getAttribute( 'id' );
			const data = modelItem.getAttribute( 'data' );

			debugger
			const commentView = viewWriter.createEditableElement( 'div', {
				class: 'comment',
				id
			} );

			// const innerText = viewWriter.createText( '[' + index + ']' );
			// viewWriter.insert( viewWriter.createPositionAt( crossreferenceView, 0 ), innerText );
			setContent( viewWriter, 'hello', commentView );

			return commentView;
		}
	}
}
