/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Imagelink2editing from './imagelink2/imagelink2editing';
import Imagelink2ui from './imagelink2/imagelink2ui';

/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/image#image-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~Imagelink2editing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~Imagelink2ui} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageLink2 extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Imagelink2editing, Imagelink2ui ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageLink2';
	}
}
