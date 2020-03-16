# ColorWheel
A simple color selection wheel, written in vanilla javascript and css. You can find the demo [here][demo].

[demo]: https://mohkale.github.io/ColorWheel/
<iframe src="https://mohkale.github.io/ColorWheel/" width="100%" style="border: 0px; height: 25em">
</iframe>

Click on a color to select it, drag around the wheel to cycle through colors.

## Installation
Copy `./src/colorwheel.js` and `./src/colorwheel.css` to some path on your site. Then
load them both into the document as desired.

```html
...
  <link rel="stylesheet" type="text/css" href="/path/to/colorwheel.css">

  <script>
    import { getAllWheels } from '/path/to/colorwheel.js';

    // find all elements with class .colorwheel and convert them
    // to ColorWheel instances.
    getAllWheels();
  </script>
...
```

## Notes
* A color wheel inherits it's width and height from the element containing it.

## Usage
### Creation
From javascript you can create a `ColorWheel` by simply passing the element that
should contain the wheel to the `ColorWheel` constructor.

```javascript
import ColorWheel from 'colorwheel.js';

let elem, wheel;

if ((elem = document.getElementById('my-wheel')) !== null) {
  wheel = new ColorWheel(elem);
}
```

To make it easier to bulk construct wheels from all wheels on the page, `colorwheel.js`
also provides a method which finds all elements with the `.colorwheel` class, converts
them to `ColorWheel`'s returning an array of them. This method is demonstrated above.

**WARN**: a colorwheel should be made once for each container, repeatedly calling
          `new ColorWheel(elem)` will have unforeseen issues and should be avoided.

### Wheel Fields
Every instance of `ColorWheel` has the following fields:
* `wheel.parent` - the elemenet containing the color wheel.
* `wheel.canvas` - the canvas onto which the wheel is drawn.
* `wheel.cursor` - the circular disc which shows where on the wheel the current color is.
* `wheel.cursorCore` - the center of the cursor which shows the current color.
* `wheel.radius` - how wide the wheel should be, this is assigned from the width/height.

### Detecting Change
You can bind an [event][custom-event] handler for each wheel, which is run whenever the color
selected by the wheel is changed. From this handler, you also have access to the `ColorWheel`
instance which is being updated.

To bind a listener, call the `colorChanged` function of the wheel with the listener function
as an argument.

```javascript
wheel.colorChanged(function(e) {
  // NOTE: e.detail.self is equal to wheel
  console.log(e.detail.self.getCurrentColor());
});
```

[custom-event]: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent

## Customisation
Both the thickness of the color wheel ring and the colors used within it are defined in
javascript. `colorwheel.js` exports functions to let you assign these values outside of
the module. `setColorWheelThickness` &amp; `setColorWheelGradientColors` respectively.

The dimensions of the cursor is a CSS [variable][css-var] (`--colorwheel-cursor-dimensions`)
defined in `colorwheel.css`. Similarly the percentage of the cursor taken up by the
cursor-core is defined using the `--colorwheel-cursor-core-ratio` variable.

[css-var]: https://www.w3schools.com/css/css3_variables.asp
