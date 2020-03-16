# ColorWheel
Color selection interface designed in pure JQuery (Javascript) &amp; CSS.

## Description
The methodology behind this project places heavy dependence on Javascript/JQuery
to create the desired affect. The consequence of this is that there isn't much
reliance on HTML to create a color wheel. The API supports placement of multiple
colorwheels within a page. I suggest taking a look at the [demo][demo] to see how
the color wheel actually appears, before attempting to implement it.

[demo]: https://mohkale.github.io/ColorWheel/

## Usage
### Creation
#### HTML Backend
To create a color wheel, pick the desired location of the wheel in the HTML document
and create a new div with a class value of `"colorwheel"` like so:

```HTML
<div class="colorwheel"></div>
```

S.N. The actual color wheel will inherit its width and height from the parent of this
div.

#### Javascript Dependence
Now this alone will not create the color wheel. You need to pass this newly made div
element to the `ColorWheel` class within a javascript script to create a color wheel
like this:

```JavaScript
var wheel = new ColorWheel($('.colorwheel').get(0));
```

This will create a new wheel with all the desired functionality needed for it. However,
this should only be done once for each wheel & doing so many times (such as on an
existing event like `mousedown`) can have unforeseen or unexpected consequence. To
mitigate this problem, I suggest creating a global array to hold all the wheels in the
document and use the `ColorWheel` classes built in `GetAllWheels` method to fill it out
upon the document loading. Like so:

```Javascript
var colorWheels; // Array to store wheels, undefined

$(document).ready(function() {
    colorWheels = ColorWheel.GetAllWheels();
});
```

### Manipulation
The colorwheel class stores references to the container (div) in which it was created &
the dynamically produced canvas & cursor (& cursor-core). Users of the class can
manipulate these object however they see fit using the aliases defined for them in the
first few lines of the constructor.

#### Detecting Color Changes
The `ColorWheel` class defines a custom event called `_colorChangedEvent` and a public method
called `ColorChanged` that adds event listeners to it. The event has single parameter storing
the standard argument object seen in [CustomEvents][custom-event]. This parameter has a property
called key, with another property called self that stores a reference to the `ColorWheel` instance
which invoked it (because the event cannot be invoked by proxy & therefore an alternative means
of accessing the `ColorWheel` instance is required).

[custum-event]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent

An example of what one can do with this event is (assuming the recommended method of creating
a global `ColorWheels` array has been followed):

```JavaScript
$(document).ready(function() {
    colorWheels[0].ColorChanged(function(args) {
        console.log(args.detail.self.GetCurrentColor());
        // Outputs any selection/change in color of wheel
    });
});
```

### Customisation
#### Wheel
##### Ring Thickness
Is defined as a contant variable in `colorwheel.js` called `COLOR_WHEEL_THICKNESS`. Change
this to whatever thickness you preffer.

##### Gradient
The colors used in the gradient of the wheel is defined in the const `COLOR_WHEEL_GRADIENT_COLORS`
array, with the first color appearing at the top of the ring and sequential colors appearing
clockwise from the top.

#### Cursor Dimensions
The diameter of the cursor is a variable defined in the global scope of the stylesheet used by the
program. Changing the `--colorwheel-cursor-dimensions` variable will change the size of the cursor
wheel.

The percentage of the cursor which is taken up by the inner core of the cursor (the region which
displays the current selected color) is defined as the variable `--colorwheel-cursor-core-ratio`.
