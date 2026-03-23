import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import typeOf from 'type-of';
import { Node } from 'slate';
import { Record } from 'immutable';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * String.
 *
 * @type {String}
 */

var String = new Record({
  object: 'string',
  text: ''
});

/**
 * A rule to (de)serialize text nodes. This is automatically added to the HTML
 * serializer so that users don't have to worry about text-level serialization.
 *
 * @type {Object}
 */

var TEXT_RULE = {
  serialize: function serialize(obj, children) {
    if (obj.object === 'string') {
      return children.split('\n').reduce(function (array, text, i) {
        if (i !== 0) array.push(React.createElement('br', { key: i }));
        array.push(text);
        return array;
      }, []);
    }
  }
};

/**
 * A default `parseHtml` function that returns the `<body>` using `DOMParser`.
 *
 * @param {String} html
 * @return {Object}
 */

function defaultParseHtml(html) {
  if (typeof DOMParser == 'undefined') {
    throw new Error('The native `DOMParser` global which the `Html` serializer uses by default is not present in this environment. You must supply the `options.parseHtml` function instead.');
  }

  var parsed = new DOMParser().parseFromString(html, 'text/html');
  var body = parsed.body;
  // COMPAT: in IE 11 body is null if html is an empty string

  return body || window.document.createElement('body');
}

/**
 * HTML serializer.
 *
 * @type {Html}
 */

var Html =
  /**
   * Create a new serializer with `rules`.
   *
   * @param {Object} options
   *   @property {Array} rules
   *   @property {String|Object|Block} defaultBlock
   *   @property {Function} parseHtml
   */

  function Html() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Html);

    _initialiseProps.call(this);

    var _options$defaultBlock = options.defaultBlock,
      defaultBlock = _options$defaultBlock === undefined ? 'paragraph' : _options$defaultBlock,
      _options$parseHtml = options.parseHtml,
      parseHtml = _options$parseHtml === undefined ? defaultParseHtml : _options$parseHtml,
      _options$rules = options.rules,
      rules = _options$rules === undefined ? [] : _options$rules;


    defaultBlock = Node.createProperties(defaultBlock);

    this.rules = [].concat(toConsumableArray(rules), [TEXT_RULE]);
    this.defaultBlock = defaultBlock;
    this.parseHtml = parseHtml;
  };

/**
 * Add a unique key to a React `element`.
 *
 * @param {Element} element
 * @return {Element}
 */

var _initialiseProps = function _initialiseProps() {
  var _this = this;



  this.serialize = function (value) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var document = value.document;

    var elements = document.nodes.map(_this.serializeNode).filter(function (el) {
      return el;
    });
    if (options.render === false) return elements;

    var html = renderToStaticMarkup(React.createElement(
      'body',
      null,
      elements
    ));
    var inner = html.slice(6, -7);
    return inner;
  };

  this.serializeNode = function (node) {
    if (node.object === 'text') {
      var string = new String({ text: node.text });
      var text = _this.serializeString(string);

      return node.marks.reduce(function (children, mark) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var rule = _step2.value;

            if (!rule.serialize) continue;
            var ret = rule.serialize(mark, children);
            if (ret === null) return;
            if (ret) return addKey(ret);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        throw new Error('No serializer defined for mark of type "' + mark.type + '".');
      }, text);
    }

    var children = node.nodes.map(_this.serializeNode);

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = _this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var rule = _step3.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(node, children);
        if (ret === null) return;
        if (ret) return addKey(ret);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    throw new Error('No serializer defined for node of type "' + node.type + '".');
  };

  this.serializeString = function (string) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = _this.rules[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var rule = _step4.value;

        if (!rule.serialize) continue;
        var ret = rule.serialize(string, string.text);
        if (ret) return ret;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  };

  this.cruftNewline = function (element) {
    return !(element.nodeName === '#text' && element.nodeValue === '\n');
  };
};

var key = 0;

function addKey(element) {
  return React.cloneElement(element, { key: key++ });
}

export default Html;
//# sourceMappingURL=slate-html-serializer.es.js.map
