/**
 * @author anhr / https://github.com/anhr/
*/

//Attenttion!!! Save this file as UTF-8 for localization

//A sprite based text component.
//options:
//{
//	text: The text to be displayed on the sprite. Default is 'Sprite Text'
//	position: THREE.Vector3 - position of the text. Default is new THREE.Vector3(0,0,0)
//	textHeight: The height of the text. Default is 1
//	fontFace: CSS font-family - specifies the font of the text. Default is 'Arial'
//	fontFaces: array of fontFaces. Example ['Arial', 'Verdana', 'Times']
//	fontColor: RGBA object or RGB object or HEX value. Default is 'rgba(255, 255, 255, 1)'
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//	bold: CSS font-weight. Equivalent of 700. Default is false.
//	italic: CSS font-style. Default is false.
//	fontProperties: string. Other font properties. The font property uses the same syntax as the CSS font property.
//		Default is empty string. Example "900", "oblique lighter".
//	center: THREE.Vector2 - The text's anchor point, and the point around which the text rotates.
//		A value of (0.5, 0.5) corresponds to the midpoint of the text.
//		A value of (0, 0) corresponds to the left lower corner of the text.
//		A value of (0, 1) corresponds to the left upper corner of the text.
//		Default is (0, 1).
//	rect: text rectangle.
//	{
//		displayRect: true - the rectangle around the text is visible. Default is false
//		backgroundColor: RGBA object or RGB object or HEX value. Default is 'rgba(100, 100, 100, 1)' - gray.
//			Examples 'rgba(0, 0, 255, 0.5)', '#00FF00'
//		borderColor: RGBA object or RGB object or HEX value. Default is 'rgba(0, 255, 0, 1)' - green
//		borderThickness: Default is 5
//		borderRadius: Default is 6
//	}
//}
//Thanks to / https://github.com/vasturiano/three-spritetext
THREE.SpriteText = function ( options ) {

	var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: new THREE.Texture() } ) );

	options = options || {};
	options.text = options.text || 'Sprite Text';
	options.position = options.position || new THREE.Vector3( 0, 0, 0 );
	options.textHeight = options.textHeight || 1;
	options.fontFace = options.fontFace || 'Arial';
	options.fontColor = options.fontColor || 'rgba(255, 255, 255, 1)';
	options.bold = options.bold || false;
	options.italic = options.italic || false;
	options.fontProperties = options.fontProperties || '';
	options.center = options.center || new THREE.Vector2( 0, 1 );

	var canvas = document.createElement( 'canvas' );
	sprite.material.map.minFilter = THREE.LinearFilter;
	var fontSize = 90;
	const context = canvas.getContext( '2d' );

	sprite.update = function ( optionsUpdate ) {

		if ( optionsUpdate !== undefined )
			Object.keys( optionsUpdate ).forEach( function ( key ) {

				options[ key ] = optionsUpdate[ key ];

			} );

		options.font = `${options.fontProperties ? options.fontProperties + ' ' : ''}${options.bold ? 'bold ' : ''}${options.italic ? 'italic ' : ''}${fontSize}px ${options.fontFace}`;

		context.font = options.font;
		const textWidth = context.measureText( options.text ).width;
		canvas.width = textWidth;
		canvas.height = fontSize;

		context.font = options.font;

		//Rect
		//Thanks to http://stemkoski.github.io/Three.js/Sprite-Text-Labels.html

		options.rect = options.rect || {};
		options.rect.displayRect = options.rect.displayRect || false;
		var borderThickness = options.rect.borderThickness || 5;
		if ( options.rect.displayRect ) {

			// background color
			context.fillStyle = options.rect.hasOwnProperty( "backgroundColor" ) ?
				options.rect[ "backgroundColor" ] : 'rgba(100, 100, 100, 1)';

			// border color
			context.strokeStyle = options.rect.hasOwnProperty( "borderColor" ) ?
				options.rect[ "borderColor" ] : 'rgba(0, 255, 0, 1)';

			context.lineWidth = borderThickness;

			// function for drawing rounded rectangles
			function roundRect( ctx, x, y, w, h, r ) {

				ctx.beginPath();
				ctx.moveTo( x + r, y );
				ctx.lineTo( x + w - r, y );
				ctx.quadraticCurveTo( x + w, y, x + w, y + r );
				ctx.lineTo( x + w, y + h - r );
				ctx.quadraticCurveTo( x + w, y + h, x + w - r, y + h );
				ctx.lineTo( x + r, y + h );
				ctx.quadraticCurveTo( x, y + h, x, y + h - r );
				ctx.lineTo( x, y + r );
				ctx.quadraticCurveTo( x, y, x + r, y );
				ctx.closePath();
				ctx.fill();
				ctx.stroke();

			}
			roundRect( context,
				borderThickness / 2,
				borderThickness / 2,
				textWidth - borderThickness,
				fontSize - borderThickness,
				options.rect.borderRadius === undefined ? 6 : options.rect.borderRadius
			);

		}

		context.fillStyle = options.fontColor;
		context.textBaseline = 'bottom';
		context.fillText( options.text, 0, canvas.height + 2 * borderThickness );

		// Inject canvas into sprite
		sprite.material.map.image = canvas;
		sprite.material.map.needsUpdate = true;

		if ( options.hasOwnProperty( 'textHeight' ) )
			sprite.scale.set( options.textHeight * canvas.width / canvas.height, options.textHeight );
		if ( options.hasOwnProperty( 'position' ) )
			sprite.position.copy( options.position );
		if ( options.hasOwnProperty( 'center' ) )
			sprite.center = options.center;

	};
	sprite.update();

	return sprite;

};

//Adds SpriteText folder into gui.
//See src\objects\SpriteText.js for SpriteText details
//gui: see https://github.com/dataarts/dat.gui/blob/master/API.md for details
//sprite: sprite with text component or array of sprites
//options: options of the SpriteText.
//guiParams:
//{
//	getLanguageCode: Your custom getLanguageCode() function.
//		returns the "primary language" subtag of the language version of the browser.
//		Examples: "en" - English language, "ru" Russian.
//		See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
//		Default returns the 'en' is English language.
//	cookie: Your custom setCookie function for saving of the SpriteText settings
//	lang: Object with localized language values
//	parentFolder:
//}
THREE.gui.spriteText = function ( gui, sprite, options, guiParams ) {

	guiParams = guiParams || {};

	// Default cookie is not saving settings
	// name: name of current setting
	function cookie( name ) {

		this.set = function ( value ) { };

	}
	if ( guiParams.cookie !== undefined ) cookie = guiParams.cookie;

	//Localization

	function getLanguageCode() {

		return 'en';//Default language is English

	}
	if ( guiParams.getLanguageCode !== undefined ) getLanguageCode = guiParams.getLanguageCode;

	var lang = {
		spriteText: 'Sprite Text',

		textHeight: 'Height',
		textHeightTitle: 'Text Height.',

		displayRect: 'Rect',
		displayRectTitle: 'Display a rectangle around the text.',

		defaultButton: 'Default',
		defaultTitle: 'Restore default Sprite Text settings.',

	};

	var languageCode = getLanguageCode();
	switch ( languageCode ) {

		case 'ru'://Russian language
			lang.spriteText = 'Текстовый спрайт';//'Sprite Text'

			lang.textHeight = 'Высота';
			lang.textHeightTitle = 'Высота текста.';

			lang.displayRect = 'Прямоугольник';
			lang.displayRectTitle = 'Отобразить прямоугольник вокруг текста.';

			lang.defaultButton = 'Восстановить';
			lang.defaultTitle = 'Восстановить настройки текстового спрайта по умолчанию.';
			break;
		default://Custom language
			if ( ( guiParams.lang === undefined ) || ( guiParams.lang.languageCode != languageCode ) )
				break;

			Object.keys( guiParams.lang ).forEach( function ( key ) {

				if ( lang[ key ] === undefined )
					return;
				lang[ key ] = guiParams.lang[ key ];

			} );

	}

	//

	function updateSpriteText() {

		function update( sprite ) {

			sprite.update( options );

		}
		if ( Array.isArray( sprite ) )
			sprite.forEach( function ( sprite ) {

				update( sprite );

			} );
		else update( sprite );

		if ( controllerFont !== undefined )
			controllerFont.setValue( options.font );

	}

	if ( ! guiParams.hasOwnProperty( 'parentFolder' ) )
		guiParams.parentFolder = gui;

	var fSpriteText = guiParams.parentFolder.addFolder( lang.spriteText );//'Sprite Text'

	if ( options.hasOwnProperty( 'text' ) )
		fSpriteText.add( options, 'text' ).onChange( function ( value ) {

			updateSpriteText();

		} );
	if ( options.hasOwnProperty( 'textHeight' ) )
		dat.controllerNameAndTitle(
			fSpriteText.add( options, 'textHeight', options.textHeight / 10, options.textHeight * 10 ).onChange( function ( value ) {

				updateSpriteText();

			} ),
			lang.textHeight, lang.textHeightTitle
		);

	if ( options.fontFaces !== undefined )
		fSpriteText.add( options, 'fontFace', options.fontFaces ).onChange( function ( value ) {

			updateSpriteText();

		} );

	if ( options.hasOwnProperty( 'bold' ) )
		fSpriteText.add( options, 'bold' ).onChange( function ( value ) {

			updateSpriteText();

		} );
	if ( options.hasOwnProperty( 'italic' ) )
		fSpriteText.add( options, 'italic' ).onChange( function ( value ) {

			updateSpriteText();

		} );

	if ( options.hasOwnProperty( 'fontProperties' ) )
		fSpriteText.add( options, 'fontProperties' ).onChange( function ( value ) {

			updateSpriteText();

		} );

	if ( options.hasOwnProperty( 'font' ) ) {

		var controllerFont = fSpriteText.add( options, 'font' );
		controllerFont.__input.readOnly = true;

	}

	if ( ( options.hasOwnProperty( 'rect' ) ) && ( options.rect.hasOwnProperty( 'displayRect' ) ) )
		dat.controllerNameAndTitle( fSpriteText.add( options.rect, 'displayRect' ).onChange( function ( value ) {

			updateSpriteText();

		} ), lang.displayRect, lang.displayRectTitle );

	if ( options.hasOwnProperty( 'fontColor' ) )
		fSpriteText.addColor( options, 'fontColor' ).onChange( function ( value ) {

			updateSpriteText();

		} );

	if ( options.hasOwnProperty( 'center' ) ) {

		var fAnchor = fSpriteText.addFolder( 'Anchor' );
		fAnchor.add( options.center, 'x', 0, 1, 0.1 ).onChange( function ( value ) {

			updateSpriteText();

		} );
		fAnchor.add( options.center, 'y', 0, 1, 0.1 ).onChange( function ( value ) {

			updateSpriteText();

		} );

	}

	//default button
	var optionsDefault = Object.assign( {}, options ),
		defaultParams = {
			defaultF: function ( value ) {

				Object.keys( optionsDefault ).forEach( function ( key ) {

					fSpriteText.__controllers.forEach( function ( controller ) {

						if ( controller.property != key ) {

							if ( typeof optionsDefault[ key ] != "object" )
								return;
							Object.keys( optionsDefault[ key ] ).forEach( function ( key ) {

								if ( controller.property != key )
									return;
								controller.setValue( optionsDefault[ key ] );

							} );
							return;

						}
						controller.setValue( optionsDefault[ key ] );

					} );

				} );

			},

		};
	dat.controllerNameAndTitle( fSpriteText.add( defaultParams, 'defaultF' ), lang.defaultButton, lang.defaultTitle );

};

