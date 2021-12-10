/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageLinkEditing from './imagelink/imagelinkediting';

import '../theme/imagelink.css';

/**
 * The image caption plugin.
 *
 * For a detailed overview, check the {@glink features/image#image-captions image caption} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageLinkEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageLink';
	}
}
