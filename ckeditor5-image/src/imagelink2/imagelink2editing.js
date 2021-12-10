/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativeediting
 */

import Imagelink2command from './imagelink2command';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The image text alternative editing plugin.
 *
 * Registers the `'imageTextAlternative'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Imagelink2editing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageLink2Editing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.add( 'imageLink2', new Imagelink2command( this.editor ) );
	}
}
