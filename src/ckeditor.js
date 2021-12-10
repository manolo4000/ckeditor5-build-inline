/**
 * @license Copyright (c) 2014-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
 import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor.js';
 import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
 import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
 import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
 import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
 import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock.js';
 import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
 import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';
 import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
 import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
 import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
 import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
 import Image from '@ckeditor/ckeditor5-image/src/image.js';
 import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
 import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
 import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
 import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
 import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
 import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
 import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
 import Link from '@ckeditor/ckeditor5-link/src/link.js';
 import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
 import List from '@ckeditor/ckeditor5-list/src/list.js';
 import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
 import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
 import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
 import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
 import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
 import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
 import Table from '@ckeditor/ckeditor5-table/src/table.js';
 import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
 import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';

//import ImageLink2 from '../ckeditor5-image/src/imagelink2';
import Crossreference from '../crossreference/crossreference';
import Comments from '../comments/comments';

class Editor extends InlineEditor {}

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

class InsertImage extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertImage', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert image',
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				const imageUrl = prompt( 'Image URL' );

				editor.model.change( writer => {
					const imageElement = writer.createElement( 'paragraph', {
						Text: imageUrl
					} );

					// Insert the image in the current selection location.
					editor.model.insertContent( imageElement, editor.model.document.selection );
				} );
			} );

			return view;
		} );
	}
}

// Plugins to include in the build.
InlineEditor.builtinPlugins = [
	Autoformat,
	AutoImage,
	AutoLink,
	BlockQuote,
	ImageBlock,
	Bold,
	CKFinder,
	CloudServices,
	Essentials,
	Heading,
	Image,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Italic,
	Link,
	LinkImage,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	SimpleUploadAdapter,
	Subscript,
	Superscript,
	Table,
	TableToolbar,
	TextTransformation,
	Crossreference,
	Comments
];

// Editor configuration.
InlineEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'superscript',
			'subscript',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'indent',
			'outdent',
			'|',
			'imageInsert',
			'|',
			'imageUpload',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo',
			'crossreference'
		]
	},
	language: 'es',
	image: {
		toolbar: [
			'imageTextAlternative',
			'imageStyle:inline',
			'imageStyle:full',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'linkImage'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	}
};

export default Editor;
