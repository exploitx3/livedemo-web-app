/**!
 * Element Picker.
 * A JavaScript library that allows you to point and click to get the hovered element.
 * @author  James Bechet <jamesbechet@gmail.com>
 * @license MIT
 */

const elementPickerFactory = function() {

  if (typeof window === 'undefined' || !window.document) {
    console.error('elementPicker requires the window and document.');
  }

  var oldTarget;
  var desiredBackgroundColor = 'rgba(0, 0, 0, 0.1)';
  var oldBackgroundColor;
  var oldOutline;
  var onClick;
  var currentDocument = document

  function setPickerActive(active) {
    try {
      window.__livedemoElementPickerActive = !!active
    } catch (e) {
      // ignore
    }
  }

  function onMouseMove(event) {

    event      = event || window.event;
    var target = event.target || event.srcElement;
    if (oldTarget) {
      resetOldTargetColor();
    }
    else {
      document.body.style.cursor = 'pointer';
    }
    oldTarget = target;
    oldBackgroundColor = target.style.backgroundColor;
    oldOutline = target.style.outline;
    target.style.outline = "2px solid " + desiredBackgroundColor;

  }

  function onMouseClick(event) {

    event      = event || window.event;
    var target = event.target || event.srcElement;
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
    onClick(target);
    reset();
    return false

  }

  function reset() {

    setPickerActive(false)
    // Capture + bubble: rrweb hover-only guards used to listen in capture and
    // swallow clicks before a bubble-only picker could see them.
    currentDocument.removeEventListener('click', onMouseClick, true);
    currentDocument.removeEventListener('click', onMouseClick, false);
    currentDocument.removeEventListener('mousemove', onMouseMove, false);
    if (currentDocument.body) {
      currentDocument.body.style.cursor = 'auto';
    }
    if (oldTarget) {
      resetOldTargetColor();
    }
    oldTarget = null;
    oldBackgroundColor = null;

  }

  function resetOldTargetColor() {
    oldTarget.style.backgroundColor = oldBackgroundColor
    oldTarget.style.outline = oldOutline

  }

  function init(options) {

    if (!options || !options.onClick) {
      console.error('onClick option needs to be specified.');
      return;
    }
    desiredBackgroundColor = options.backgroundColor || desiredBackgroundColor

    // Re-init while already picking — drop previous listeners first.
    reset()

    currentDocument = options.document || document
    onClick = options.onClick;
    setPickerActive(true)
    // Capture phase so we receive the click even if other handlers stop bubbling.
    currentDocument.addEventListener('click', onMouseClick, true);
    currentDocument.addEventListener('mousemove', onMouseMove, false);

    return elementPicker;

  }

  /**
   * The library object.
   * @property {Function} init    - Function called to init the library.
   * @property {Function} onClick - The callback triggered once an element is clicked.
   * @property {String} version   - The library's version.
   * @type {Object}
   */
  var elementPicker     = {};
  elementPicker.version = '1.0.1';
  elementPicker.init    = init;
  elementPicker.reset = reset;

  return elementPicker;
};

// ES module export
const elementPicker = elementPickerFactory();
export default elementPicker;
export const { init, reset } = elementPicker;
