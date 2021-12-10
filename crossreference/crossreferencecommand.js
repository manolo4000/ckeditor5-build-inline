import Command from '@ckeditor/ckeditor5-core/src/command';

export default class CrossreferenceCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;

		editor.model.change( writer => {
			// Create a <placeholder> elment with the "name" attribute...
			const crossreference = writer.createElement( 'crossreference', { reference: value } );

			// ... and insert it into the document.
			editor.model.insertContent( crossreference );

			// Put the selection on the inserted element.
			writer.setSelection( crossreference, 'on' );

			const nodes = this.findNodes( writer, 'crossreference', editor.model.document.getRoot() );

			nodes.forEach( ( node, idx ) => {
				writer.setAttribute( 'index', idx + 1, node );
			} );
		} );
	}

	getSelectedReferenceModelWidget( selection ) {
		const selectedElement = selection.getSelectedElement();

		if ( selectedElement && selectedElement.is( 'crossreference' ) ) {
			return selectedElement;
		}

		return null;
	}

	refresh() {
		const model = this.editor.model;
		const editor = this.editor;
		const selection = model.document.selection;
		const selectedReference = this.getSelectedReferenceModelWidget( selection );

		const isAllowed = model.schema.checkChild( selection.focus.parent, 'crossreference' );

		this.isEnabled = isAllowed;
		this.value = selectedReference ? selectedReference.getAttribute( 'reference' ) : null;

		editor.model.change( writer => {
			const nodes = this.findNodes( writer, 'crossreference', editor.model.document.getRoot() );
			nodes.forEach( ( node, idx ) => {
				writer.setAttribute( 'index', idx + 1, node );
			} );
		} );
	}

	findNodes( writer, type, root ) {
		type = type || 'crossreference';
		const nodes = [];
		const range = writer.createRangeIn( root );

		for ( const value of range.getWalker( { ignoreElementEnd: true } ) ) {
			const node = value.item;

			if ( node.is( type ) ) {
				nodes.push( node );
			}
		}

		return nodes;
	}
}
