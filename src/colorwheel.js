/*
 * Copyright (C) 2020  Mohsin Kaleem
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301, USA.
 */

export var colorWheelThickness = 15;
export var colorWheelGradientColors = ['#FF0000', '#00FF00', '#0000FF'];

export function setColorWheelThickness(value) { colorWheelThickness = value; }
export function setColorWheelGradientColors(value) { colorWheelGradientColors = value; }

/**
 * Creates a new element, appends to {@code container}, then
 * returns it.
 */
function createAppendElement(elementName, container) {
    var elem = document.createElement(elementName);
    container.appendChild(elem); // Add as child
    return elem; // Return Created Element
}


/**
 * get an array of all colorwheels on the page.
 *
 * @returns array of ColorWheel instances on the DOM.
 */
export function getAllWheels() {
    return Array
        .from(document.getElementsByClassName("colorwheel"))
        .map(elem => new ColorWheel(elem));
}

/** Gets center of a DOM element. */
function getElementCentre(elem) {
    return {
        X: elem.offsetLeft + elem.offsetWidth  / 2,
        Y: elem.offsetTop  + elem.offsetHeight / 2
    };
}

/**
 * Represents a single color wheel visible on the DOM.
 *
 * This class binds listeners for handling user input, and takes
 * care of drawing the color gradient to the colorwheel canvas.
 *
 */
export default class ColorWheel {
	constructor(canvasContainer) {
		this.parent     = canvasContainer; // Reference To DOM Element
		this.canvas     = createAppendElement('canvas', this.parent);
		this.cursor     = createAppendElement('div',    this.parent);
		this.cursorCore = createAppendElement('div',    this.cursor);

		// #region Canvas width assignment (when set from stylesheet)
        this._cornerOffset = {
            X: this.parent.offsetLeft,
            Y: this.parent.offsetTop,
        }

        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.cursor.width  = this.cursor.offsetWidth;
        this.cursor.height = this.cursor.offsetHeight;
        // #endregion

        // # region Instance variable assignment
        this._context = this.canvas.getContext('2d');

        this.radius = 0.75 * Math.min(this.width, this.height) / 2;
        this.center = {X: this.width / 2, Y: this.height / 2};
        this.mousedown = false; // By default, mouse is assumed to be up
        // #endregion

        // #region Events
        this._colorChangedEvent = new CustomEvent('ColorChanged', {
            detail: { self : this } // detail.self = current instance
        });

        this.canvas.addEventListener('mousedown', this._mouseDownEventHandler.bind(this));
        this.cursor.addEventListener('mousedown', this._mouseDownEventHandler.bind(this));
        this.cursorCore.addEventListener('mousedown', this._mouseDownEventHandler.bind(this));

        document.addEventListener('mouseup', this._mouseUpEventHandler.bind(this));
        document.addEventListener('mousemove', this._mouseMoveEventHandler.bind(this));
        // #endregion

        ColorWheel.drawColorWheel(
            this._context, this.center, -Math.PI/2, this.radius,
            colorWheelThickness, colorWheelGradientColors
        );

        this.setCursorLocation(this.center.X, this.center.Y-this.radius);
        this.updateCursorColor(); // Update color of cursor to reflect position
    }

    get width()  { return this.canvas.width; }
    get height() { return this.canvas.height; }

    _mouseDownEventHandler() { this.mousedown = true; }
    _mouseUpEventHandler()   { this.mousedown = false; }

    _mouseMoveEventHandler(e) {
        if (this.mousedown) { // Mouse Down
            var currentMousePosition = {
                // Relative To Canvas Location
                X: e.pageX - this._cornerOffset.X,
                Y: e.pageY - this._cornerOffset.Y
            }

            var mouseDisplacementFromCenter = {
                X: this.center.X - currentMousePosition.X,
                Y: this.center.Y - currentMousePosition.Y
            }

            var theta = Math.atan2(mouseDisplacementFromCenter.Y, mouseDisplacementFromCenter.X);

            var positionOnColorWheel = {
                X: this.center.X - this.radius * Math.cos(theta),
                Y: this.center.Y - this.radius * Math.sin(theta)
            }

            this.setCursorLocation(positionOnColorWheel.X, positionOnColorWheel.Y);
            this.updateCursorColor(); // Color Cursor Location Changed, So Update
        }
    }

    getCanvasColorValueFromLocation(loc) {
        var data = this._context.getImageData(loc.X, loc.Y, 1, 1).data;
        return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
    }

    // Sets color of cursor
    setCursorColor(color) {
        this.cursorCore.style.backgroundColor = color;
    }

    /* Sets Cursor Location Relative To Canvas */
    setCursorLocation(X, Y) {
        X -= this.cursor.width / 2;
        Y -= this.cursor.height / 2;

        X += this._cornerOffset.X;
        Y += this._cornerOffset.Y;

        this.cursor.style.left = X;
        this.cursor.style.top  = Y;
    }

    /* Uses position of cursor to determine color */
    updateCursorColor() {
        var center = getElementCentre(this.cursor);

        center.X -= this._cornerOffset.X;
        center.Y -= this._cornerOffset.Y;

        this.setCursorColor(this.getCanvasColorValueFromLocation(center));
        this.parent.dispatchEvent(this._colorChangedEvent);
    }

    getCurrentColor() {
        var colors = this.getCurrentColorAsRGBString().replace(/[^\d,]/g, '').split(',');
        return { red: colors[0], green: colors[1], blue: colors[2], alpha: 1};
    }

    getCurrentColorAsRGBString() {
        return this.cursorCore.style.backgroundColor;
    }

    /**
     * Binds {@code eventListener} as event handler to the ColorChanged
     * event.
     *
     * You can access the current {@code ColorWheel} instance in the
     * event handler, via the {@code detail.self} property of the
     * argument.
     */
    colorChanged(eventListener) {
        this.parent.addEventListener('ColorChanged', eventListener);
    }

    /** actually draw a rainbow color ring */
    static drawColorWheel(context, center, theta, radius, thickness, gradColors) {
        var thetaChunk = (2 * Math.PI) / gradColors.length;
        // Angle turned for each color match in gradient list
        var colorMatch = {start: null, end: null}

        for (var X=0; X < gradColors.length; X++) {
            colorMatch.start = gradColors[X];
            colorMatch.end   = gradColors[(X+1) % gradColors.length];

            var startPos = {
                X: center.X + (radius * Math.cos(theta)),
                Y: center.Y + (radius * Math.sin(theta))
            }, endPos = {
                X: center.X + (radius * Math.cos(theta+thetaChunk)),
                Y: center.Y + (radius * Math.sin(theta+thetaChunk))
            }

            var gradient = context.createLinearGradient(
                startPos.X, startPos.Y, endPos.X, endPos.Y
            );

            gradient.addColorStop(0, colorMatch.start);
            gradient.addColorStop(1, colorMatch.end);

            // #region Draw
            context.beginPath();

            context.strokeStyle = gradient;
            context.webkitImageSmoothingEnabled = true;
            context.lineWidth = thickness;

            context.arc(center.X, center.Y, radius, theta, theta+thetaChunk);

            context.stroke();
            context.closePath();
            // #endregion

			theta += thetaChunk; // Move To Next Chunk
		}
	}
}
