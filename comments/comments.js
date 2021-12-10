
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CommentsEditing from './commentsediting';
import CommentsUI from './commentsui';

// Tutorials used for this plugin
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/tutorials/implementing-an-inline-widget.html
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/creating-simple-plugin.html

export default class Comments extends Plugin {
	static get requires() {
		return [ CommentsEditing, CommentsUI ];
	}
}
