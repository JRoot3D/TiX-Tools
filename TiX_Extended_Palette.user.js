// ==UserScript==
// @name         TiX Extended Palette
// @namespace    https://tixchat.com/*
// @version      2.4
// @author       JRoot3D
// @match        https://tixchat.com/*
// @grant        none
// @updateURL    https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Extended_Palette.user.js
// @downloadURL  https://github.com/JRoot3D/TiX-Tools/raw/master/TiX_Extended_Palette.user.js
// ==/UserScript==

(function() {
	'use strict';
	C.ColorPicker = Class({

		constructor: function (pdata, part) {
			this.pdata = pdata;
			this.part = part;
			this.$container = $('<div class="ColorPicker"></div>');
			this.redraw();
		},

		redraw: function () {
			var i;
			var picker = this;
			var part = picker.part;
			var pdata = picker.pdata;
			var colors = part.colors;
			var $ctr = picker.$container;

			$ctr.html('');

			var css = function (color) {
				return 'rgb(' + color + ')';
			};

			var full = (function (i, p) {
				var $input = $('<input />');
				$input.appendTo($ctr);
				$input.spectrum({
					color: css(colors[i]),
					clickoutFiresChange: true,
					showInput: true,
					showInitial: true,
					preferredFormat: "hex",
					showPalette: true,
					palette: p
				}).on('change move.spectrum', _.throttle(function () {
					var rgb = $(this).spectrum('get').toRgb();
					colors[i] = [ rgb.r, rgb.g, rgb.b ];
					picker.onchange();
				}, 100));
			});

			var fixPalette = function (palette) {
				var result = [
					["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
					["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
					["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
					["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
					["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
					["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
					["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
					["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
				];

				var paletteLine = [];
				for (var id in palette) {
					paletteLine.push('rgb (' + C.parseColor(palette[id]) + ')');
					if (id > 0 && id % 7 === 0) {
						result.push(paletteLine);
						paletteLine = [];
					}
				}
				if (paletteLine.length > 0) {
					result.push(paletteLine);
				}
				return result;
			};

			var paletteToArray = function (palette) {
				var result;
				if (typeof palette == 'string') {
					result = C.getPalette(palette);
					return fixPalette(result);
				} else if (_.isArray(palette)) {
					result = palette;
					return fixPalette(result);
				}
			};

			var preparePalette = function (palette) {
				var result = [];
				if (palette) {
					if (pdata.colorCount > 1) {
						for (var id in palette) {
							result.push(paletteToArray(palette[id]));
						}
					} else {
						result.push(paletteToArray(palette));
					}
				} else {
					result = [fixPalette([])];
				}
				return result;
			};

			for (i = 0; i < pdata.colorCount; i++) {
				full(i, preparePalette(pdata.palette)[i]);
			}
		}
	});
})();