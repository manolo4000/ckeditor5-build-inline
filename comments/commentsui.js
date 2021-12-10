/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module comments/commentsui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import markerIcon from './theme/icons/marker.svg';
import penIcon from './theme/icons/pen.svg';
import eraserIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';

import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import './theme/comments.css';

/**
 * The default comments UI plugin. It introduces:
 *
 * * The `'comments'` dropdown,
 * * The `'removeComments'` and `'comments:*'` buttons.
 *
 * The default configuration includes the following buttons:
 *
 * * `'comments:yellowMarker'`
 * * `'comments:greenMarker'`
 * * `'comments:pinkMarker'`
 * * `'comments:blueMarker'`
 * * `'comments:redPen'`
 * * `'comments:greenPen'`
 *
 * See the {@link module:comments/comments~CommentsConfig#options configuration} to learn more
 * about the defaults.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CommentsUI extends Plugin {
	/**
	 * Returns the localized option titles provided by the plugin.
	 *
	 * The following localized titles corresponding with default
	 * {@link module:comments/comments~CommentsConfig#options} are available:
	 *
	 * * `'Yellow marker'`,
	 * * `'Green marker'`,
	 * * `'Pink marker'`,
	 * * `'Blue marker'`,
	 * * `'Red pen'`,
	 * * `'Green pen'`.
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedOptionTitles() {
		const t = this.editor.t;

		return {
			'Yellow marker': t( 'Yellow marker' ),
			'Green marker': t( 'Green marker' ),
			'Pink marker': t( 'Pink marker' ),
			'Blue marker': t( 'Blue marker' ),
			'Red pen': t( 'Red pen' ),
			'Green pen': t( 'Green pen' )
		};
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CommentsUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const options = this.editor.config.get( 'comments.options' );

		for ( const option of options ) {
			this._addCommentserButton( option );
		}

		this._addRemoveCommentsButton();

		this._addDropdown( options );
	}

	/**
	 * Creates the "Remove comments" button.
	 *
	 * @private
	 */
	_addRemoveCommentsButton() {
		const t = this.editor.t;

		this._addButton( 'removeComments', t( 'Remove comments' ), eraserIcon );
	}

	/**
	 * Creates a toolbar button from the provided comments option.
	 *
	 * @param {module:comments/comments~CommentsOption} option
	 * @private
	 */
	_addCommentserButton( option ) {
		const command = this.editor.commands.get( 'comments' );

		// TODO: change naming
		this._addButton( 'comments:' + option.model, option.title, getIconForType( option.type ), option.model, decorateCommentsButton );

		function decorateCommentsButton( button ) {
			button.bind( 'isEnabled' ).to( command, 'isEnabled' );
			button.bind( 'isOn' ).to( command, 'value', value => value === option.model );
			button.iconView.fillColor = option.color;
			button.isToggleable = true;
		}
	}

	/**
	 * Internal method for creating comments buttons.
	 *
	 * @param {String} name The name of the button.
	 * @param {String} label The label for the button.
	 * @param {String} icon The button icon.
	 * @param {Function} [decorateButton=()=>{}] Additional method for extending the button.
	 * @private
	 */
	_addButton( name, label, icon, value, decorateButton = () => {} ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( name, locale => {
			const buttonView = new ButtonView( locale );

			const localized = this.localizedOptionTitles[ label ] ? this.localizedOptionTitles[ label ] : label;

			buttonView.set( {
				label: localized,
				icon,
				tooltip: true
			} );

			buttonView.on( 'execute', () => {
				editor.execute( 'comments', { value } );
				editor.editing.view.focus();
			} );

			// Add additional behavior for buttonView.
			decorateButton( buttonView );

			return buttonView;
		} );
	}

	/**
	 * Creates the split button dropdown UI from the provided comments options.
	 *
	 * @param {Array.<module:comments/comments~CommentsOption>} options
	 * @private
	 */
	_addDropdown( options ) {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		const startingCommentser = options[ 0 ];

		const optionsMap = options.reduce( ( retVal, option ) => {
			retVal[ option.model ] = option;

			return retVal;
		}, {} );

		componentFactory.add( 'comments', locale => {
			const command = editor.commands.get( 'comments' );
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			splitButtonView.set( {
				tooltip: t( 'Comments' ),
				// Holds last executed commentser.
				lastExecuted: startingCommentser.model,
				// Holds current commentser to execute (might be different then last used).
				commandValue: startingCommentser.model,
				isToggleable: true
			} );

			// Dropdown button changes to selection (command.value):
			// - If selection is in comments it get active comments appearance (icon, color) and is activated.
			// - Otherwise it gets appearance (icon, color) of last executed comments.
			splitButtonView.bind( 'icon' ).to( command, 'value', value => getIconForType( getActiveOption( value, 'type' ) ) );
			splitButtonView.bind( 'color' ).to( command, 'value', value => getActiveOption( value, 'color' ) );
			splitButtonView.bind( 'commandValue' ).to( command, 'value', value => getActiveOption( value, 'model' ) );
			splitButtonView.bind( 'isOn' ).to( command, 'value', value => !!value );

			splitButtonView.delegate( 'execute' ).to( dropdownView );

			// Create buttons array.
			const buttons = options.map( option => {
				// Get existing commentser button.
				const buttonView = componentFactory.create( 'comments:' + option.model );

				// Update lastExecutedComments on execute.
				this.listenTo( buttonView, 'execute', () => dropdownView.buttonView.set( { lastExecuted: option.model } ) );

				return buttonView;
			} );

			// Make toolbar button enabled when any button in dropdown is enabled before adding separator and eraser.
			dropdownView.bind( 'isEnabled' ).toMany( buttons, 'isEnabled', ( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled ) );

			// Add separator and eraser buttons to dropdown.
			buttons.push( new ToolbarSeparatorView() );
			buttons.push( componentFactory.create( 'removeComments' ) );

			addToolbarToDropdown( dropdownView, buttons );
			bindToolbarIconStyleToActiveColor( dropdownView );

			dropdownView.toolbarView.ariaLabel = t( 'Text comments toolbar' );

			// Execute current action from dropdown's split button action button.
			splitButtonView.on( 'execute', () => {
				editor.execute( 'comments', { value: splitButtonView.commandValue } );
				editor.editing.view.focus();
			} );

			// Returns active commentser option depending on current command value.
			// If current is not set or it is the same as last execute this method will return the option key (like icon or color)
			// of last executed commentser. Otherwise it will return option key for current one.
			function getActiveOption( current, key ) {
				const whichCommentser = !current ||
				current === splitButtonView.lastExecuted ? splitButtonView.lastExecuted : current;

				return optionsMap[ whichCommentser ][ key ];
			}

			return dropdownView;
		} );
	}
}

// Extends split button icon style to reflect last used button style.
function bindToolbarIconStyleToActiveColor( dropdownView ) {
	const actionView = dropdownView.buttonView.actionView;

	actionView.iconView.bind( 'fillColor' ).to( dropdownView.buttonView, 'color' );
}

// Returns icon for given commentser type.
function getIconForType( type ) {
	return type === 'marker' ? markerIcon : penIcon;
}
