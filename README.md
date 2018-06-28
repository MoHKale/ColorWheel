# ColorWheel
Color selection interface designed in pure JQuery (Javascript) &amp; CSS.

## Description
The methodology behind this project places heavy dependence on Javascript/JQuery to create the desired affect. The consequence of this is that there isn't much reliance on HTML to create a color wheel. The API supports placement of multiple colorwheels within a page.

## Usage
### Creation
#### HTML Backend
To create a color wheel, pick the desired location of the wheel in the HTML document and create a new div with a class value of "colorwheel" like so:
  
```HTML
<div class="colorwheel"></div>
```

#### Javascript Dependence
Now this alone will not create the color wheel. You need to pass this newly made div element to the ColorWheel class within a javascript script to create a color wheel like this:

```JavaScript
var wheel = new ColorWheel($('.colorwheel').get(0));
```

This will create a new wheel with all the desired functionality needed for it. However, this should only be done once for each wheel & doing so many times (such as on an existing event like mousedown) can have unforeseen or unexpected consequence. To mitigate this problem, I suggest creating a global array to hold all the wheels in the document and use the ColorWheel classes built in GetAllWheels method to fill it out upon the document loading. Like so:

```Javascript
var colorWheels; // Array to store wheels, undefined

$(document).ready(function() {
    colorWheels = ColorWheel.GetAllWheels();
});
```

### Manipulation
