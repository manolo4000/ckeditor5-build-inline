
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CrossreferenceEditing from './crossreferenceediting';
import CrossreferenceUI from './crossreferenceui';

// Tutorials used for this plugin
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/tutorials/implementing-an-inline-widget.html
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/creating-simple-plugin.html

export default class Crossreference extends Plugin {
	static get requires() {
		return [ CrossreferenceEditing, CrossreferenceUI ];
	}
}
