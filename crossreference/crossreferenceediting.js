import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import CrossreferenceCommand from './crossreferencecommand';

import './theme/crossreference.css';

export default class CrossreferenceEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		console.log( 'CrossreferenceEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();
		this.editor.commands.add( 'crossreference', new CrossreferenceCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'crossreference' ) )
		);

		// this.editor.model.document.on( 'change:data', () => {
		// 	console.log( 'The data has changed!' );
		// } );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'crossreference', {
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The placeholder will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and can be selected:
			isObject: true,

			// The placeholder can have many types, like date, name, surname, etc:
			allowAttributes: [ 'reference', 'index' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'a',
				classes: [ 'crossreference' ]
			},
			model: ( element, modelWriter ) => {
				// Extract the "name" from "{name}".
				const child = element.getChild( 0 );
				const index = child ? child.data.slice( 1, -1 ) : 1;
				const reference = element.getAttribute( 'title' );
				return modelWriter.writer.createElement( 'crossreference', { reference, index } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'crossreference',
			view: ( modelItem, writer ) => {
				const widgetElement = createCrossreferenceView( modelItem, writer );

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget( widgetElement, writer.writer );
			}
		} ).add( dispatcher => {
			// Specify converter for attribute `text` on element `dailyNote`.
			dispatcher.on( 'attribute:index', ( evt, data, conversionApi ) => {
				const element = data.item;

				// Mark element as consumed by conversion.
				conversionApi.consumable.consume( data.item, evt.name );

				// Get mapped view element to update.
				const viewElement = conversionApi.mapper.toViewElement( element );

				// Remove current <div> element contents.
				conversionApi.writer.remove( viewElement.getChild( 0 ) );

				// Set current content
				setContent( conversionApi, data.attributeNewValue, viewElement );
			} );
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'crossreference',
			view: createCrossreferenceView
		} );

		function setContent( conversionApi, index, crossreferenceView ) {
			const innerText = conversionApi.writer.createText( String(index) );
			conversionApi.writer.insert( conversionApi.writer.createPositionAt( crossreferenceView, 0 ), innerText );
		}

		// Helper method for both downcast converters.
		function createCrossreferenceView( modelItem, viewWriter ) {
			const reference = modelItem.getAttribute( 'reference' );
			const index = modelItem.getAttribute( 'index' );

			const crossreferenceView = viewWriter.writer.createContainerElement( 'a', {
				class: 'crossreference',
				title: reference
			} );

			// const innerText = viewWriter.writer.createText( '[' + index + ']' );
			// viewWriter.writer.insert( viewWriter.writer.createPositionAt( crossreferenceView, 0 ), innerText );
			setContent( viewWriter, index, crossreferenceView );

			return crossreferenceView;
		}
	}
}
