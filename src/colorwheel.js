"use strict";

const COLOR_WHEEL_THICKNESS = 15;
const COLOR_WHEEL_GRADIENT_COLORS = ['#FF0000', '#00FF00', '#0000FF'];

/* Simple Class To Build Color Wheel Functionality */
class ColorWheel {
	constructor(canvasContainer) {
		this._canvasContainer = canvasContainer; // Reference To DOM Element
		this._canvas     = this._CreateAppendElement('canvas', this._canvasContainer);
		this._cursor     = this._CreateAppendElement('div',    this._canvasContainer);
		this._cursorCore = this._CreateAppendElement('div',    this._cursor);
		
		// #region Canvas Width Assignment When Set From Stylesheet
		this._cornerOffset = {
			X: $(this._canvasContainer).position().left,
			Y: $(this._canvasContainer).position().top,	
		}
		
		this._canvas.width  = this._canvas.offsetWidth;
		this._canvas.height = this._canvas.offsetHeight;
		
		this._cursor.width  = this._cursor.offsetWidth;
		this._cursor.height = this._cursor.offsetHeight;
		// #endregion
		
		// # region Instance Variable Assignment
		this._context = this._canvas.getContext('2d');
		
		this.radius = 0.75 * Math.min(this.Width(), this.Height()) / 2;
		this.center = {X: this.Width() / 2, Y: this.Height() / 2};
		this.mousedown = false; // By default, mouse is assumed to be up
		// #endregion
		
		// #region Event Assignments
		this._colorChangedEvent = new CustomEvent('ColorChanged', {
			detail: { self : this } // detail.self = current instance
		});
		
		this._canvas.onmousedown     = $.proxy(this._mouseDownEventHandler, this);
		this._cursor.onmousedown     = $.proxy(this._mouseDownEventHandler, this);
		this._cursorCore.onmousedown = $.proxy(this._mouseDownEventHandler, this);
		
		$(document).mouseup($.proxy(this._mouseUpEventHandler, this));
		$(document).mousemove($.proxy(this._mouseMoveEventHandler, this));
		// #endregion
		
		ColorWheel.DrawColorWheel(
			this._context, this.center, -Math.PI/2, this.radius, 
			COLOR_WHEEL_THICKNESS, COLOR_WHEEL_GRADIENT_COLORS
		);
		
		this.SetCursorLocation(this.center.X, this.center.Y-this.radius);
		this.UpdateCursorColor(); // Update color of cursor to reflect position
	}
	
	/* Get Width Of Color Wheel Element */
	Width() { return this._canvas.width; }
	
	/* Get Height Of Color Wheel Element */
	Height() { return this._canvas.height; }
	
	// #region Store Mouse Down Flag
	_mouseDownEventHandler() { this.mousedown = true; }
	
	_mouseUpEventHandler() { this.mousedown = false; }
	// #endregion
	
	_mouseMoveEventHandler(e) {
		if (this.mousedown) { // Mouse Down
			var currentMousePosition = {
				// Relative To Canvas Location
				X: e.pageX - this._cornerOffset.X,
				Y: e.pageY - this._cornerOffset.Y
			}
			
			if (true) {
				var mouseDisplacementFromCenter = {
					X: this.center.X - currentMousePosition.X,
					Y: this.center.Y - currentMousePosition.Y
				}
				
				var theta = Math.atan2(mouseDisplacementFromCenter.Y, mouseDisplacementFromCenter.X);
				
				var positionOnColorWheel = {
					X: this.center.X - this.radius * Math.cos(theta),
					Y: this.center.Y - this.radius * Math.sin(theta)
				}
				
				this.SetCursorLocation(positionOnColorWheel.X, positionOnColorWheel.Y);
				this.UpdateCursorColor(); // Color Cursor Location Changed, So Update
			}
		}
	}
	
	GetCanvasColorValueFromLocation(loc) {
		var data = this._context.getImageData(loc.X, loc.Y, 1, 1).data;
		return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
	}
	
	// Sets color of cursor
	SetCursorColor(color) {
		this._cursorCore.style.backgroundColor = color;
	}
	
	// Creates Element, Appends To Container, Returns New Element
	_CreateAppendElement(elementName, container) {
		var elem = document.createElement(elementName);
		container.appendChild(elem); // Add as child
		return elem; // Return Created Element
	}
	
	/* Sets Cursor Location Relative To Canvas */
	SetCursorLocation(X, Y) {
		X -= this._cursor.width / 2;
		Y -= this._cursor.height / 2;
		
		X += this._cornerOffset.X;
		Y += this._cornerOffset.Y;
		
		this._cursor.style.left = X;
		this._cursor.style.top  = Y;
	}
	
	/* Uses position of cursor to determine color */
	UpdateCursorColor() {
		var center = ColorWheel.GetElementCentre(this._cursor);
		
		// #region Adjust to relative position 
		center.X -= this._cornerOffset.X;
		center.Y -= this._cornerOffset.Y;
		// #endregion
		
		this.SetCursorColor(this.GetCanvasColorValueFromLocation(center));
		this._canvasContainer.dispatchEvent(this._colorChangedEvent);
	}
	
	GetCurrentColor() {
		var colors = this.GetCurrentColorAsRGBString().replace(/[^\d,]/g, '').split(',');
		return {R: colors[0], G: colors[1], B: colors[2], Z: 1};
	}
	
	GetCurrentColorAsRGBString() {
		return this._cursorCore.style.backgroundColor;
	}
	
	/* Binds Argument Method As Event Handler To Internal Event
	 * S.N. You can access the current colorwheel instance in the
	 * event handler, via the detail.self property of the argument */
	ColorChanged(eventListener) {
		this._canvasContainer.addEventListener('ColorChanged', eventListener);
	}
	
	/* Traverses web page, creates & returns all color wheels */
	static GetAllWheels() {
		var w_elements = $(".colorwheel");
		var wheelsToReturn = []; // New wheels array
		
		for (var X in w_elements.get()) {
			wheelsToReturn.push(new ColorWheel(w_elements.get(X)));
		}
		
		return wheelsToReturn; // Return all built wheel instances
	}
	
	// Gets center of a DOM element
	static GetElementCentre(elem) {
		elem = $(elem); // Cast to JQuery Object
		var pos = elem.position(); // Store Position
		
		return {
			X: pos.left + elem.width() / 2,
			Y: pos.top + elem.height() / 2
		};
	}
	
	/* Method to actually draw a rainbow color ring */
	static DrawColorWheel(context, center, theta, radius, thickness, gradColors) {
		// #region Variable Definitions
		var thetaChunk = (2 * Math.PI) / gradColors.length;
		// Angle turned for each color match in gradient list
		
		var theta = -Math.PI/2; // Add offset by 90 Deg to make
		// First color in gradColors at top of wheel gradient
		
		var colorMatch = {start: null, end: null} // Gradient Pair
		// #endregion
		
		for (var X=0; X < gradColors.length; X++) {
			// #region Iterated Variable Definitions
			colorMatch.start = gradColors[X]; // Set gradient colors
			colorMatch.end   = gradColors[(X+1) % gradColors.length];
			
			var startPos = {
				X: center.X + (radius * Math.cos(theta)),
				Y: center.Y + (radius * Math.sin(theta))
			}, endPos = {
				X: center.X + (radius * Math.cos(theta+thetaChunk)),
				Y: center.Y + (radius * Math.sin(theta+thetaChunk))
			}
			// #endregion
			
			//#region Gradient Definition
			var gradient = context.createLinearGradient(
				startPos.X, startPos.Y, endPos.X, endPos.Y
			);
			
			gradient.addColorStop(0, colorMatch.start);
			gradient.addColorStop(1, colorMatch.end);
			// #endregion 
			
			// #region Draw
			context.beginPath(); // Initialise Canvas To Draw
			
			context.strokeStyle = gradient; // Set Fill
			context.webkitImageSmoothingEnabled = true;
			context.lineWidth = thickness; // Set Line Width
			
			context.arc(center.X, center.Y, radius, theta, theta+thetaChunk);
			
			context.stroke(); // Actually draw changes To Canvas
			context.closePath(); // Prevent Gradient Wrapping
			// #endregion
			
			theta += thetaChunk; // Move To Next Chunk
		}
	}
}
