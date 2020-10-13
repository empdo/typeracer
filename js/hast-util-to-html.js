(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hastUtilToHtml = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

var one = require('./one')

module.exports = all

// Serialize all children of `parent`.
function all(ctx, parent) {
  var children = parent && parent.children
  var length = children && children.length
  var index = -1
  var results = []

  while (++index < length) {
    results[index] = one(ctx, children[index], index, parent)
  }

  return results.join('')
}

},{"./one":15}],2:[function(require,module,exports){
'use strict'

var xtend = require('xtend')
var entities = require('stringify-entities')

module.exports = serializeComment

// See: <https://html.spec.whatwg.org/multipage/syntax.html#comments>
var breakout = /^>|^->|<!--|-->|--!>|<!-$/g
var subset = ['<', '>']
var bogusSubset = ['>']

function serializeComment(ctx, node) {
  var value = node.value

  if (ctx.bogusComments) {
    return (
      '<?' + entities(value, xtend(ctx.entities, {subset: bogusSubset})) + '>'
    )
  }

  return '<!--' + value.replace(breakout, encode) + '-->'

  function encode($0) {
    return entities($0, xtend(ctx.entities, {subset: subset}))
  }
}

},{"stringify-entities":49,"xtend":51}],3:[function(require,module,exports){
'use strict'

// Characters.
var nil = '\0'
var ampersand = '&'
var space = ' '
var tab = '\t'
var graveAccent = '`'
var quotationMark = '"'
var apostrophe = "'"
var equalsTo = '='
var lessThan = '<'
var greaterThan = '>'
var slash = '/'
var lineFeed = '\n'
var carriageReturn = '\r'
var formFeed = '\f'

var whitespace = [space, tab, lineFeed, carriageReturn, formFeed]

// See: <https://html.spec.whatwg.org/#attribute-name-state>.
var name = whitespace.concat(ampersand, slash, greaterThan, equalsTo)

// See: <https://html.spec.whatwg.org/#attribute-value-(unquoted)-state>.
var unquoted = whitespace.concat(ampersand, greaterThan)
var unquotedSafe = unquoted.concat(
  nil,
  quotationMark,
  apostrophe,
  lessThan,
  equalsTo,
  graveAccent
)

// See: <https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state>.
var singleQuoted = [ampersand, apostrophe]

// See: <https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state>.
var doubleQuoted = [ampersand, quotationMark]

// Maps of subsets.
// Each value is a matrix of tuples.
// The first value causes parse errors, the second is valid.
// Of both values, the first value is unsafe, and the second is safe.
module.exports = {
  name: [
    [name, name.concat(quotationMark, apostrophe, graveAccent)],
    [
      name.concat(nil, quotationMark, apostrophe, lessThan),
      name.concat(nil, quotationMark, apostrophe, lessThan, graveAccent)
    ]
  ],
  unquoted: [
    [unquoted, unquotedSafe],
    [unquotedSafe, unquotedSafe]
  ],
  single: [
    [singleQuoted, singleQuoted.concat(quotationMark, graveAccent)],
    [
      singleQuoted.concat(nil),
      singleQuoted.concat(nil, quotationMark, graveAccent)
    ]
  ],
  double: [
    [doubleQuoted, doubleQuoted.concat(apostrophe, graveAccent)],
    [
      doubleQuoted.concat(nil),
      doubleQuoted.concat(nil, apostrophe, graveAccent)
    ]
  ]
}

},{}],4:[function(require,module,exports){
'use strict'

var xtend = require('xtend')
var ccount = require('ccount')
var entities = require('stringify-entities')

module.exports = serializeDoctype

var docLower = 'doctype'
var docUpper = docLower.toUpperCase()

function serializeDoctype(ctx, node) {
  var doc = ctx.upperDoctype ? docUpper : docLower
  var sep = ctx.tightDoctype ? '' : ' '
  var name = node.name
  var pub = node.public
  var sys = node.system
  var parts = ['<!' + doc]

  if (name) {
    parts.push(sep, name)

    if (pub !== null && pub !== undefined) {
      parts.push(' public', sep, quote(ctx, pub))
    } else if (sys !== null && sys !== undefined) {
      parts.push(' system')
    }

    if (sys !== null && sys !== undefined) {
      parts.push(sep, quote(ctx, sys))
    }
  }

  return parts.join('') + '>'
}

function quote(ctx, value) {
  var primary = ctx.quote
  var secondary = ctx.alternative
  var string = String(value)
  var quote =
    ccount(string, primary) > ccount(string, secondary) ? secondary : primary

  return (
    quote +
    // Prevent breaking out of doctype.
    entities(string, xtend(ctx.entities, {subset: ['<', '&', quote]})) +
    quote
  )
}

},{"ccount":18,"stringify-entities":49,"xtend":51}],5:[function(require,module,exports){
'use strict'

var xtend = require('xtend')
var svg = require('property-information/svg')
var find = require('property-information/find')
var spaces = require('space-separated-tokens').stringify
var commas = require('comma-separated-tokens').stringify
var entities = require('stringify-entities')
var ccount = require('ccount')
var all = require('./all')
var constants = require('./constants')

module.exports = serializeElement

var space = ' '
var quotationMark = '"'
var apostrophe = "'"
var equalsTo = '='
var lessThan = '<'
var greaterThan = '>'
var slash = '/'

// eslint-disable-next-line complexity
function serializeElement(ctx, node, index, parent) {
  var parentSchema = ctx.schema
  var name = node.tagName
  var value = ''
  var selfClosing
  var close
  var omit
  var root = node
  var content
  var attrs
  var last

  if (parentSchema.space === 'html' && name === 'svg') {
    ctx.schema = svg
  }

  attrs = serializeAttributes(ctx, node.properties)

  if (ctx.schema.space === 'svg') {
    omit = false
    close = true
    selfClosing = ctx.closeEmpty
  } else {
    omit = ctx.omit
    close = ctx.close
    selfClosing = ctx.voids.indexOf(name.toLowerCase()) !== -1

    if (name === 'template') {
      root = node.content
    }
  }

  content = all(ctx, root)

  // If the node is categorised as void, but it has children, remove the
  // categorisation.
  // This enables for example `menuitem`s, which are void in W3C HTML but not
  // void in WHATWG HTML, to be stringified properly.
  selfClosing = content ? false : selfClosing

  if (attrs || !omit || !omit.opening(node, index, parent)) {
    value = lessThan + name + (attrs ? space + attrs : '')

    if (selfClosing && close) {
      last = attrs.charAt(attrs.length - 1)
      if (
        !ctx.tightClose ||
        last === slash ||
        (ctx.schema.space === 'svg' &&
          last &&
          last !== quotationMark &&
          last !== apostrophe)
      ) {
        value += space
      }

      value += slash
    }

    value += greaterThan
  }

  value += content

  if (!selfClosing && (!omit || !omit.closing(node, index, parent))) {
    value += lessThan + slash + name + greaterThan
  }

  ctx.schema = parentSchema

  return value
}

function serializeAttributes(ctx, props) {
  var values = []
  var key
  var value
  var result
  var length
  var index
  var last

  for (key in props) {
    value = props[key]

    if (value === null || value === undefined) {
      continue
    }

    result = serializeAttribute(ctx, key, value)

    if (result) {
      values.push(result)
    }
  }

  length = values.length
  index = -1

  while (++index < length) {
    result = values[index]
    last = null

    if (ctx.tight) {
      last = result.charAt(result.length - 1)
    }

    // In tight mode, don’t add a space after quoted attributes.
    if (index !== length - 1 && last !== quotationMark && last !== apostrophe) {
      values[index] = result + space
    }
  }

  return values.join('')
}

function serializeAttribute(ctx, key, value) {
  var schema = ctx.schema
  var info = find(schema, key)
  var name = info.attribute

  if (info.overloadedBoolean && (value === name || value === '')) {
    value = true
  } else if (
    info.boolean ||
    (info.overloadedBoolean && typeof value !== 'string')
  ) {
    value = Boolean(value)
  }

  if (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === 'number' && isNaN(value))
  ) {
    return ''
  }

  name = serializeAttributeName(ctx, name)

  if (value === true) {
    // There is currently only one boolean property in SVG: `[download]` on
    // `<a>`.
    // This property does not seem to work in browsers (FF, Sa, Ch), so I can’t
    // test if dropping the value works.
    // But I assume that it should:
    //
    // ```html
    // <!doctype html>
    // <svg viewBox="0 0 100 100">
    //   <a href=https://example.com download>
    //     <circle cx=50 cy=40 r=35 />
    //   </a>
    // </svg>
    // ```
    //
    // See: <https://github.com/wooorm/property-information/blob/master/lib/svg.js>
    return name
  }

  return name + serializeAttributeValue(ctx, key, value, info)
}

function serializeAttributeName(ctx, name) {
  // Always encode without parse errors in non-HTML.
  var valid = ctx.schema.space === 'html' ? ctx.valid : 1
  var subset = constants.name[valid][ctx.safe]

  return entities(name, xtend(ctx.entities, {subset: subset}))
}

function serializeAttributeValue(ctx, key, value, info) {
  var options = ctx.entities
  var quote = ctx.quote
  var alternative = ctx.alternative
  var smart = ctx.smart
  var unquoted
  var subset

  if (typeof value === 'object' && 'length' in value) {
    // `spaces` doesn’t accept a second argument, but it’s given here just to
    // keep the code cleaner.
    value = (info.commaSeparated ? commas : spaces)(value, {
      padLeft: !ctx.tightLists
    })
  }

  value = String(value)

  if (value || !ctx.collapseEmpty) {
    unquoted = value

    // Check unquoted value.
    if (ctx.unquoted) {
      subset = constants.unquoted[ctx.valid][ctx.safe]
      unquoted = entities(
        value,
        xtend(options, {subset: subset, attribute: true})
      )
    }

    // If `value` contains entities when unquoted…
    if (!ctx.unquoted || unquoted !== value) {
      // If the alternative is less common than `quote`, switch.
      if (smart && ccount(value, quote) > ccount(value, alternative)) {
        quote = alternative
      }

      subset = quote === apostrophe ? constants.single : constants.double
      // Always encode without parse errors in non-HTML.
      subset = subset[ctx.schema.space === 'html' ? ctx.valid : 1][ctx.safe]

      value = entities(value, xtend(options, {subset: subset, attribute: true}))

      value = quote + value + quote
    }

    // Don’t add a `=` for unquoted empties.
    value = value ? equalsTo + value : value
  }

  return value
}

},{"./all":1,"./constants":3,"ccount":18,"comma-separated-tokens":21,"property-information/find":29,"property-information/svg":46,"space-separated-tokens":47,"stringify-entities":49,"xtend":51}],6:[function(require,module,exports){
'use strict'

var html = require('property-information/html')
var svg = require('property-information/svg')
var voids = require('html-void-elements')
var omission = require('./omission')
var one = require('./one')

module.exports = toHtml

var quotationMark = '"'
var apostrophe = "'"

var deprecationWarningIssued = false

function toHtml(node, options) {
  var settings = options || {}
  var quote = settings.quote || quotationMark
  var alternative = quote === quotationMark ? apostrophe : quotationMark
  var smart = settings.quoteSmart
  var value =
    node && typeof node === 'object' && 'length' in node
      ? {type: 'root', children: node}
      : node

  if (quote !== quotationMark && quote !== apostrophe) {
    throw new Error(
      'Invalid quote `' +
        quote +
        '`, expected `' +
        apostrophe +
        '` or `' +
        quotationMark +
        '`'
    )
  }

  if (settings.allowDangerousHTML !== undefined) {
    if (!deprecationWarningIssued) {
      deprecationWarningIssued = true
      console.warn(
        'Deprecation warning: `allowDangerousHTML` is a nonstandard option, use `allowDangerousHtml` instead'
      )
    }
  }

  return one(
    {
      valid: settings.allowParseErrors ? 0 : 1,
      safe: settings.allowDangerousCharacters ? 0 : 1,
      schema: settings.space === 'svg' ? svg : html,
      omit: settings.omitOptionalTags && omission,
      quote: quote,
      alternative: alternative,
      smart: smart,
      unquoted: Boolean(settings.preferUnquoted),
      tight: settings.tightAttributes,
      upperDoctype: Boolean(settings.upperDoctype),
      tightDoctype: Boolean(settings.tightDoctype),
      bogusComments: Boolean(settings.bogusComments),
      tightLists: settings.tightCommaSeparatedLists,
      tightClose: settings.tightSelfClosing,
      collapseEmpty: settings.collapseEmptyAttributes,
      dangerous: settings.allowDangerousHtml || settings.allowDangerousHTML,
      voids: settings.voids || voids.concat(),
      entities: settings.entities || {},
      close: settings.closeSelfClosing,
      closeEmpty: settings.closeEmptyElements
    },
    value
  )
}

},{"./omission":8,"./one":15,"html-void-elements":24,"property-information/html":30,"property-information/svg":46}],7:[function(require,module,exports){
'use strict'

var convert = require('unist-util-is/convert')
var element = require('hast-util-is-element')
var whiteSpaceStart = require('./util/white-space-start')
var after = require('./util/siblings').after
var omission = require('./omission')

var isComment = convert('comment')

var optionGroup = 'optgroup'
var options = ['option'].concat(optionGroup)
var dataListItem = ['dt', 'dd']
var listItem = 'li'
var menuContent = ['menuitem', 'hr', 'menu']
var ruby = ['rp', 'rt']
var tableContainer = ['tbody', 'tfoot']
var tableRow = 'tr'
var tableCell = ['td', 'th']

var confusingParagraphParent = [
  'a',
  'audio',
  'del',
  'ins',
  'map',
  'noscript',
  'video'
]

var clearParagraphSibling = [
  'address',
  'article',
  'aside',
  'blockquote',
  'details',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul'
]

module.exports = omission({
  html: html,
  head: headOrColgroupOrCaption,
  body: body,
  p: p,
  li: li,
  dt: dt,
  dd: dd,
  rt: rubyElement,
  rp: rubyElement,
  optgroup: optgroup,
  option: option,
  menuitem: menuitem,
  colgroup: headOrColgroupOrCaption,
  caption: headOrColgroupOrCaption,
  thead: thead,
  tbody: tbody,
  tfoot: tfoot,
  tr: tr,
  td: cells,
  th: cells
})

// Macro for `</head>`, `</colgroup>`, and `</caption>`.
function headOrColgroupOrCaption(node, index, parent) {
  var next = after(parent, index, true)
  return !next || (!isComment(next) && !whiteSpaceStart(next))
}

// Whether to omit `</html>`.
function html(node, index, parent) {
  var next = after(parent, index)
  return !next || !isComment(next)
}

// Whether to omit `</body>`.
function body(node, index, parent) {
  var next = after(parent, index)
  return !next || !isComment(next)
}

// Whether to omit `</p>`.
function p(node, index, parent) {
  var next = after(parent, index)
  return next
    ? element(next, clearParagraphSibling)
    : !parent || !element(parent, confusingParagraphParent)
}

// Whether to omit `</li>`.
function li(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, listItem)
}

// Whether to omit `</dt>`.
function dt(node, index, parent) {
  var next = after(parent, index)
  return next && element(next, dataListItem)
}

// Whether to omit `</dd>`.
function dd(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, dataListItem)
}

// Whether to omit `</rt>` or `</rp>`.
function rubyElement(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, ruby)
}

// Whether to omit `</optgroup>`.
function optgroup(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, optionGroup)
}

// Whether to omit `</option>`.
function option(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, options)
}

// Whether to omit `</menuitem>`.
function menuitem(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, menuContent)
}

// Whether to omit `</thead>`.
function thead(node, index, parent) {
  var next = after(parent, index)
  return next && element(next, tableContainer)
}

// Whether to omit `</tbody>`.
function tbody(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, tableContainer)
}

// Whether to omit `</tfoot>`.
function tfoot(node, index, parent) {
  return !after(parent, index)
}

// Whether to omit `</tr>`.
function tr(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, tableRow)
}

// Whether to omit `</td>` or `</th>`.
function cells(node, index, parent) {
  var next = after(parent, index)
  return !next || element(next, tableCell)
}

},{"./omission":9,"./util/siblings":13,"./util/white-space-start":14,"hast-util-is-element":22,"unist-util-is/convert":50}],8:[function(require,module,exports){
'use strict'
exports.opening = require('./opening')
exports.closing = require('./closing')

},{"./closing":7,"./opening":10}],9:[function(require,module,exports){
'use strict'

module.exports = omission

var own = {}.hasOwnProperty

// Factory to check if a given node can have a tag omitted.
function omission(handlers) {
  return omit

  // Check if a given node can have a tag omitted.
  function omit(node, index, parent) {
    var name = node.tagName

    return own.call(handlers, name)
      ? handlers[name](node, index, parent)
      : false
  }
}

},{}],10:[function(require,module,exports){
'use strict'

var convert = require('unist-util-is/convert')
var element = require('hast-util-is-element')
var before = require('./util/siblings').before
var first = require('./util/first')
var place = require('./util/place')
var whiteSpaceStart = require('./util/white-space-start')
var closing = require('./closing')
var omission = require('./omission')

var isComment = convert('comment')

var uniqueHeadMetadata = ['title', 'base']
var meta = ['meta', 'link', 'script', 'style', 'template']
var tableContainers = ['thead', 'tbody']
var tableRow = 'tr'

module.exports = omission({
  html: html,
  head: head,
  body: body,
  colgroup: colgroup,
  tbody: tbody
})

// Whether to omit `<html>`.
function html(node) {
  var head = first(node)
  return !head || !isComment(head)
}

// Whether to omit `<head>`.
function head(node) {
  var children = node.children
  var length = children.length
  var seen = []
  var index = -1
  var child
  var name

  while (++index < length) {
    child = children[index]
    name = child.tagName

    if (element(child, uniqueHeadMetadata)) {
      if (seen.indexOf(name) !== -1) {
        return false
      }

      seen.push(name)
    }
  }

  return length !== 0
}

// Whether to omit `<body>`.
function body(node) {
  var head = first(node, true)

  return (
    !head ||
    (!isComment(head) && !whiteSpaceStart(head) && !element(head, meta))
  )
}

// Whether to omit `<colgroup>`.
// The spec describes some logic for the opening tag, but it’s easier to
// implement in the closing tag, to the same effect, so we handle it there
// instead.
function colgroup(node, index, parent) {
  var previous = before(parent, index)
  var head = first(node, true)

  // Previous colgroup was already omitted.
  if (
    element(previous, 'colgroup') &&
    closing(previous, place(parent, previous), parent)
  ) {
    return false
  }

  return head && element(head, 'col')
}

// Whether to omit `<tbody>`.
function tbody(node, index, parent) {
  var previous = before(parent, index)
  var head = first(node)

  // Previous table section was already omitted.
  if (
    element(previous, tableContainers) &&
    closing(previous, place(parent, previous), parent)
  ) {
    return false
  }

  return head && element(head, tableRow)
}

},{"./closing":7,"./omission":9,"./util/first":11,"./util/place":12,"./util/siblings":13,"./util/white-space-start":14,"hast-util-is-element":22,"unist-util-is/convert":50}],11:[function(require,module,exports){
'use strict'

var after = require('./siblings').after

module.exports = first

// Get the first child in `parent`.
function first(parent, includeWhiteSpace) {
  return after(parent, -1, includeWhiteSpace)
}

},{"./siblings":13}],12:[function(require,module,exports){
'use strict'

module.exports = place

// Get the position of `node` in `parent`.
function place(parent, child) {
  return parent && parent.children && parent.children.indexOf(child)
}

},{}],13:[function(require,module,exports){
'use strict'

var whiteSpace = require('hast-util-whitespace')

exports.before = siblings(-1)
exports.after = siblings(1)

// Factory to check siblings in a direction.
function siblings(increment) {
  return sibling

  // Find applicable siblings in a direction.
  function sibling(parent, index, includeWhiteSpace) {
    var siblings = parent && parent.children
    var offset = index + increment
    var next = siblings && siblings[offset]

    if (!includeWhiteSpace) {
      while (next && whiteSpace(next)) {
        offset += increment
        next = siblings[offset]
      }
    }

    return next
  }
}

},{"hast-util-whitespace":23}],14:[function(require,module,exports){
'use strict'

var convert = require('unist-util-is/convert')
var whiteSpace = require('hast-util-whitespace')

module.exports = whiteSpaceStart

var isText = convert('text')

// Check if `node` starts with white-space.
function whiteSpaceStart(node) {
  return isText(node) && whiteSpace(node.value.charAt(0))
}

},{"hast-util-whitespace":23,"unist-util-is/convert":50}],15:[function(require,module,exports){
'use strict'

module.exports = serialize

var own = {}.hasOwnProperty

var handlers = {}

handlers.root = require('./all')
handlers.text = require('./text')
handlers.element = require('./element')
handlers.doctype = require('./doctype')
handlers.comment = require('./comment')
handlers.raw = require('./raw')

function serialize(ctx, node, index, parent) {
  var type = node && node.type

  if (!type) {
    throw new Error('Expected node, not `' + node + '`')
  }

  if (!own.call(handlers, type)) {
    throw new Error('Cannot compile unknown node `' + type + '`')
  }

  return handlers[type](ctx, node, index, parent)
}

},{"./all":1,"./comment":2,"./doctype":4,"./element":5,"./raw":16,"./text":17}],16:[function(require,module,exports){
'use strict'

var text = require('./text')

module.exports = serializeRaw

function serializeRaw(ctx, node) {
  return ctx.dangerous ? node.value : text(ctx, node)
}

},{"./text":17}],17:[function(require,module,exports){
'use strict'

var xtend = require('xtend')
var entities = require('stringify-entities')

module.exports = serializeText

function serializeText(ctx, node, index, parent) {
  var value = node.value

  return isLiteral(parent)
    ? value
    : entities(value, xtend(ctx.entities, {subset: ['<', '&']}))
}

// Check if content of `node` should be escaped.
function isLiteral(node) {
  return node && (node.tagName === 'script' || node.tagName === 'style')
}

},{"stringify-entities":49,"xtend":51}],18:[function(require,module,exports){
'use strict'

module.exports = ccount

function ccount(value, character) {
  var val = String(value)
  var count = 0
  var index

  if (typeof character !== 'string' || character.length !== 1) {
    throw new Error('Expected character')
  }

  index = val.indexOf(character)

  while (index !== -1) {
    count++
    index = val.indexOf(character, index + 1)
  }

  return count
}

},{}],19:[function(require,module,exports){
module.exports={
  "nbsp": " ",
  "iexcl": "¡",
  "cent": "¢",
  "pound": "£",
  "curren": "¤",
  "yen": "¥",
  "brvbar": "¦",
  "sect": "§",
  "uml": "¨",
  "copy": "©",
  "ordf": "ª",
  "laquo": "«",
  "not": "¬",
  "shy": "­",
  "reg": "®",
  "macr": "¯",
  "deg": "°",
  "plusmn": "±",
  "sup2": "²",
  "sup3": "³",
  "acute": "´",
  "micro": "µ",
  "para": "¶",
  "middot": "·",
  "cedil": "¸",
  "sup1": "¹",
  "ordm": "º",
  "raquo": "»",
  "frac14": "¼",
  "frac12": "½",
  "frac34": "¾",
  "iquest": "¿",
  "Agrave": "À",
  "Aacute": "Á",
  "Acirc": "Â",
  "Atilde": "Ã",
  "Auml": "Ä",
  "Aring": "Å",
  "AElig": "Æ",
  "Ccedil": "Ç",
  "Egrave": "È",
  "Eacute": "É",
  "Ecirc": "Ê",
  "Euml": "Ë",
  "Igrave": "Ì",
  "Iacute": "Í",
  "Icirc": "Î",
  "Iuml": "Ï",
  "ETH": "Ð",
  "Ntilde": "Ñ",
  "Ograve": "Ò",
  "Oacute": "Ó",
  "Ocirc": "Ô",
  "Otilde": "Õ",
  "Ouml": "Ö",
  "times": "×",
  "Oslash": "Ø",
  "Ugrave": "Ù",
  "Uacute": "Ú",
  "Ucirc": "Û",
  "Uuml": "Ü",
  "Yacute": "Ý",
  "THORN": "Þ",
  "szlig": "ß",
  "agrave": "à",
  "aacute": "á",
  "acirc": "â",
  "atilde": "ã",
  "auml": "ä",
  "aring": "å",
  "aelig": "æ",
  "ccedil": "ç",
  "egrave": "è",
  "eacute": "é",
  "ecirc": "ê",
  "euml": "ë",
  "igrave": "ì",
  "iacute": "í",
  "icirc": "î",
  "iuml": "ï",
  "eth": "ð",
  "ntilde": "ñ",
  "ograve": "ò",
  "oacute": "ó",
  "ocirc": "ô",
  "otilde": "õ",
  "ouml": "ö",
  "divide": "÷",
  "oslash": "ø",
  "ugrave": "ù",
  "uacute": "ú",
  "ucirc": "û",
  "uuml": "ü",
  "yacute": "ý",
  "thorn": "þ",
  "yuml": "ÿ",
  "fnof": "ƒ",
  "Alpha": "Α",
  "Beta": "Β",
  "Gamma": "Γ",
  "Delta": "Δ",
  "Epsilon": "Ε",
  "Zeta": "Ζ",
  "Eta": "Η",
  "Theta": "Θ",
  "Iota": "Ι",
  "Kappa": "Κ",
  "Lambda": "Λ",
  "Mu": "Μ",
  "Nu": "Ν",
  "Xi": "Ξ",
  "Omicron": "Ο",
  "Pi": "Π",
  "Rho": "Ρ",
  "Sigma": "Σ",
  "Tau": "Τ",
  "Upsilon": "Υ",
  "Phi": "Φ",
  "Chi": "Χ",
  "Psi": "Ψ",
  "Omega": "Ω",
  "alpha": "α",
  "beta": "β",
  "gamma": "γ",
  "delta": "δ",
  "epsilon": "ε",
  "zeta": "ζ",
  "eta": "η",
  "theta": "θ",
  "iota": "ι",
  "kappa": "κ",
  "lambda": "λ",
  "mu": "μ",
  "nu": "ν",
  "xi": "ξ",
  "omicron": "ο",
  "pi": "π",
  "rho": "ρ",
  "sigmaf": "ς",
  "sigma": "σ",
  "tau": "τ",
  "upsilon": "υ",
  "phi": "φ",
  "chi": "χ",
  "psi": "ψ",
  "omega": "ω",
  "thetasym": "ϑ",
  "upsih": "ϒ",
  "piv": "ϖ",
  "bull": "•",
  "hellip": "…",
  "prime": "′",
  "Prime": "″",
  "oline": "‾",
  "frasl": "⁄",
  "weierp": "℘",
  "image": "ℑ",
  "real": "ℜ",
  "trade": "™",
  "alefsym": "ℵ",
  "larr": "←",
  "uarr": "↑",
  "rarr": "→",
  "darr": "↓",
  "harr": "↔",
  "crarr": "↵",
  "lArr": "⇐",
  "uArr": "⇑",
  "rArr": "⇒",
  "dArr": "⇓",
  "hArr": "⇔",
  "forall": "∀",
  "part": "∂",
  "exist": "∃",
  "empty": "∅",
  "nabla": "∇",
  "isin": "∈",
  "notin": "∉",
  "ni": "∋",
  "prod": "∏",
  "sum": "∑",
  "minus": "−",
  "lowast": "∗",
  "radic": "√",
  "prop": "∝",
  "infin": "∞",
  "ang": "∠",
  "and": "∧",
  "or": "∨",
  "cap": "∩",
  "cup": "∪",
  "int": "∫",
  "there4": "∴",
  "sim": "∼",
  "cong": "≅",
  "asymp": "≈",
  "ne": "≠",
  "equiv": "≡",
  "le": "≤",
  "ge": "≥",
  "sub": "⊂",
  "sup": "⊃",
  "nsub": "⊄",
  "sube": "⊆",
  "supe": "⊇",
  "oplus": "⊕",
  "otimes": "⊗",
  "perp": "⊥",
  "sdot": "⋅",
  "lceil": "⌈",
  "rceil": "⌉",
  "lfloor": "⌊",
  "rfloor": "⌋",
  "lang": "〈",
  "rang": "〉",
  "loz": "◊",
  "spades": "♠",
  "clubs": "♣",
  "hearts": "♥",
  "diams": "♦",
  "quot": "\"",
  "amp": "&",
  "lt": "<",
  "gt": ">",
  "OElig": "Œ",
  "oelig": "œ",
  "Scaron": "Š",
  "scaron": "š",
  "Yuml": "Ÿ",
  "circ": "ˆ",
  "tilde": "˜",
  "ensp": " ",
  "emsp": " ",
  "thinsp": " ",
  "zwnj": "‌",
  "zwj": "‍",
  "lrm": "‎",
  "rlm": "‏",
  "ndash": "–",
  "mdash": "—",
  "lsquo": "‘",
  "rsquo": "’",
  "sbquo": "‚",
  "ldquo": "“",
  "rdquo": "”",
  "bdquo": "„",
  "dagger": "†",
  "Dagger": "‡",
  "permil": "‰",
  "lsaquo": "‹",
  "rsaquo": "›",
  "euro": "€"
}

},{}],20:[function(require,module,exports){
module.exports={
  "AElig": "Æ",
  "AMP": "&",
  "Aacute": "Á",
  "Acirc": "Â",
  "Agrave": "À",
  "Aring": "Å",
  "Atilde": "Ã",
  "Auml": "Ä",
  "COPY": "©",
  "Ccedil": "Ç",
  "ETH": "Ð",
  "Eacute": "É",
  "Ecirc": "Ê",
  "Egrave": "È",
  "Euml": "Ë",
  "GT": ">",
  "Iacute": "Í",
  "Icirc": "Î",
  "Igrave": "Ì",
  "Iuml": "Ï",
  "LT": "<",
  "Ntilde": "Ñ",
  "Oacute": "Ó",
  "Ocirc": "Ô",
  "Ograve": "Ò",
  "Oslash": "Ø",
  "Otilde": "Õ",
  "Ouml": "Ö",
  "QUOT": "\"",
  "REG": "®",
  "THORN": "Þ",
  "Uacute": "Ú",
  "Ucirc": "Û",
  "Ugrave": "Ù",
  "Uuml": "Ü",
  "Yacute": "Ý",
  "aacute": "á",
  "acirc": "â",
  "acute": "´",
  "aelig": "æ",
  "agrave": "à",
  "amp": "&",
  "aring": "å",
  "atilde": "ã",
  "auml": "ä",
  "brvbar": "¦",
  "ccedil": "ç",
  "cedil": "¸",
  "cent": "¢",
  "copy": "©",
  "curren": "¤",
  "deg": "°",
  "divide": "÷",
  "eacute": "é",
  "ecirc": "ê",
  "egrave": "è",
  "eth": "ð",
  "euml": "ë",
  "frac12": "½",
  "frac14": "¼",
  "frac34": "¾",
  "gt": ">",
  "iacute": "í",
  "icirc": "î",
  "iexcl": "¡",
  "igrave": "ì",
  "iquest": "¿",
  "iuml": "ï",
  "laquo": "«",
  "lt": "<",
  "macr": "¯",
  "micro": "µ",
  "middot": "·",
  "nbsp": " ",
  "not": "¬",
  "ntilde": "ñ",
  "oacute": "ó",
  "ocirc": "ô",
  "ograve": "ò",
  "ordf": "ª",
  "ordm": "º",
  "oslash": "ø",
  "otilde": "õ",
  "ouml": "ö",
  "para": "¶",
  "plusmn": "±",
  "pound": "£",
  "quot": "\"",
  "raquo": "»",
  "reg": "®",
  "sect": "§",
  "shy": "­",
  "sup1": "¹",
  "sup2": "²",
  "sup3": "³",
  "szlig": "ß",
  "thorn": "þ",
  "times": "×",
  "uacute": "ú",
  "ucirc": "û",
  "ugrave": "ù",
  "uml": "¨",
  "uuml": "ü",
  "yacute": "ý",
  "yen": "¥",
  "yuml": "ÿ"
}

},{}],21:[function(require,module,exports){
'use strict'

exports.parse = parse
exports.stringify = stringify

var comma = ','
var space = ' '
var empty = ''

// Parse comma-separated tokens to an array.
function parse(value) {
  var values = []
  var input = String(value || empty)
  var index = input.indexOf(comma)
  var lastIndex = 0
  var end = false
  var val

  while (!end) {
    if (index === -1) {
      index = input.length
      end = true
    }

    val = input.slice(lastIndex, index).trim()

    if (val || !end) {
      values.push(val)
    }

    lastIndex = index + 1
    index = input.indexOf(comma, lastIndex)
  }

  return values
}

// Compile an array to comma-separated tokens.
// `options.padLeft` (default: `true`) pads a space left of each token, and
// `options.padRight` (default: `false`) pads a space to the right of each token.
function stringify(values, options) {
  var settings = options || {}
  var left = settings.padLeft === false ? empty : space
  var right = settings.padRight ? space : empty

  // Ensure the last empty entry is seen.
  if (values[values.length - 1] === empty) {
    values = values.concat(empty)
  }

  return values.join(right + comma + left).trim()
}

},{}],22:[function(require,module,exports){
'use strict'

module.exports = isElement

// Check if if `node` is an `element` and, if `tagNames` is given, `node`
// matches them `tagNames`.
function isElement(node, tagNames) {
  var name

  if (
    !(
      tagNames === null ||
      tagNames === undefined ||
      typeof tagNames === 'string' ||
      (typeof tagNames === 'object' && tagNames.length !== 0)
    )
  ) {
    throw new Error(
      'Expected `string` or `Array.<string>` for `tagNames`, not `' +
        tagNames +
        '`'
    )
  }

  if (
    !node ||
    typeof node !== 'object' ||
    node.type !== 'element' ||
    typeof node.tagName !== 'string'
  ) {
    return false
  }

  if (tagNames === null || tagNames === undefined) {
    return true
  }

  name = node.tagName

  if (typeof tagNames === 'string') {
    return name === tagNames
  }

  return tagNames.indexOf(name) !== -1
}

},{}],23:[function(require,module,exports){
'use strict'

module.exports = interElementWhiteSpace

// HTML white-space expression.
// See <https://html.spec.whatwg.org/#space-character>.
var re = /[ \t\n\f\r]/g

function interElementWhiteSpace(node) {
  var value

  if (node && typeof node === 'object' && node.type === 'text') {
    value = node.value || ''
  } else if (typeof node === 'string') {
    value = node
  } else {
    return false
  }

  return value.replace(re, '') === ''
}

},{}],24:[function(require,module,exports){
module.exports=[
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "nextid",
  "param",
  "source",
  "track",
  "wbr"
]

},{}],25:[function(require,module,exports){
'use strict'

module.exports = alphabetical

// Check if the given character code, or the character code at the first
// character, is alphabetical.
function alphabetical(character) {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return (
    (code >= 97 && code <= 122) /* a-z */ ||
    (code >= 65 && code <= 90) /* A-Z */
  )
}

},{}],26:[function(require,module,exports){
'use strict'

var alphabetical = require('is-alphabetical')
var decimal = require('is-decimal')

module.exports = alphanumerical

// Check if the given character code, or the character code at the first
// character, is alphanumerical.
function alphanumerical(character) {
  return alphabetical(character) || decimal(character)
}

},{"is-alphabetical":25,"is-decimal":27}],27:[function(require,module,exports){
'use strict'

module.exports = decimal

// Check if the given character code, or the character code at the first
// character, is decimal.
function decimal(character) {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return code >= 48 && code <= 57 /* 0-9 */
}

},{}],28:[function(require,module,exports){
'use strict'

module.exports = hexadecimal

// Check if the given character code, or the character code at the first
// character, is hexadecimal.
function hexadecimal(character) {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return (
    (code >= 97 /* a */ && code <= 102) /* z */ ||
    (code >= 65 /* A */ && code <= 70) /* Z */ ||
    (code >= 48 /* A */ && code <= 57) /* Z */
  )
}

},{}],29:[function(require,module,exports){
'use strict'

var normalize = require('./normalize')
var DefinedInfo = require('./lib/util/defined-info')
var Info = require('./lib/util/info')

var data = 'data'

module.exports = find

var valid = /^data[-\w.:]+$/i
var dash = /-[a-z]/g
var cap = /[A-Z]/g

function find(schema, value) {
  var normal = normalize(value)
  var prop = value
  var Type = Info

  if (normal in schema.normal) {
    return schema.property[schema.normal[normal]]
  }

  if (normal.length > 4 && normal.slice(0, 4) === data && valid.test(value)) {
    // Attribute or property.
    if (value.charAt(4) === '-') {
      prop = datasetToProperty(value)
    } else {
      value = datasetToAttribute(value)
    }

    Type = DefinedInfo
  }

  return new Type(prop, value)
}

function datasetToProperty(attribute) {
  var value = attribute.slice(5).replace(dash, camelcase)
  return data + value.charAt(0).toUpperCase() + value.slice(1)
}

function datasetToAttribute(property) {
  var value = property.slice(4)

  if (dash.test(value)) {
    return property
  }

  value = value.replace(cap, kebab)

  if (value.charAt(0) !== '-') {
    value = '-' + value
  }

  return data + value
}

function kebab($0) {
  return '-' + $0.toLowerCase()
}

function camelcase($0) {
  return $0.charAt(1).toUpperCase()
}

},{"./lib/util/defined-info":37,"./lib/util/info":38,"./normalize":45}],30:[function(require,module,exports){
'use strict'

var merge = require('./lib/util/merge')
var xlink = require('./lib/xlink')
var xml = require('./lib/xml')
var xmlns = require('./lib/xmlns')
var aria = require('./lib/aria')
var html = require('./lib/html')

module.exports = merge([xml, xlink, xmlns, aria, html])

},{"./lib/aria":31,"./lib/html":32,"./lib/util/merge":39,"./lib/xlink":42,"./lib/xml":43,"./lib/xmlns":44}],31:[function(require,module,exports){
'use strict'

var types = require('./util/types')
var create = require('./util/create')

var booleanish = types.booleanish
var number = types.number
var spaceSeparated = types.spaceSeparated

module.exports = create({
  transform: ariaTransform,
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: booleanish,
    ariaAutoComplete: null,
    ariaBusy: booleanish,
    ariaChecked: booleanish,
    ariaColCount: number,
    ariaColIndex: number,
    ariaColSpan: number,
    ariaControls: spaceSeparated,
    ariaCurrent: null,
    ariaDescribedBy: spaceSeparated,
    ariaDetails: null,
    ariaDisabled: booleanish,
    ariaDropEffect: spaceSeparated,
    ariaErrorMessage: null,
    ariaExpanded: booleanish,
    ariaFlowTo: spaceSeparated,
    ariaGrabbed: booleanish,
    ariaHasPopup: null,
    ariaHidden: booleanish,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: spaceSeparated,
    ariaLevel: number,
    ariaLive: null,
    ariaModal: booleanish,
    ariaMultiLine: booleanish,
    ariaMultiSelectable: booleanish,
    ariaOrientation: null,
    ariaOwns: spaceSeparated,
    ariaPlaceholder: null,
    ariaPosInSet: number,
    ariaPressed: booleanish,
    ariaReadOnly: booleanish,
    ariaRelevant: null,
    ariaRequired: booleanish,
    ariaRoleDescription: spaceSeparated,
    ariaRowCount: number,
    ariaRowIndex: number,
    ariaRowSpan: number,
    ariaSelected: booleanish,
    ariaSetSize: number,
    ariaSort: null,
    ariaValueMax: number,
    ariaValueMin: number,
    ariaValueNow: number,
    ariaValueText: null,
    role: null
  }
})

function ariaTransform(_, prop) {
  return prop === 'role' ? prop : 'aria-' + prop.slice(4).toLowerCase()
}

},{"./util/create":36,"./util/types":41}],32:[function(require,module,exports){
'use strict'

var types = require('./util/types')
var create = require('./util/create')
var caseInsensitiveTransform = require('./util/case-insensitive-transform')

var boolean = types.boolean
var overloadedBoolean = types.overloadedBoolean
var booleanish = types.booleanish
var number = types.number
var spaceSeparated = types.spaceSeparated
var commaSeparated = types.commaSeparated

module.exports = create({
  space: 'html',
  attributes: {
    acceptcharset: 'accept-charset',
    classname: 'class',
    htmlfor: 'for',
    httpequiv: 'http-equiv'
  },
  transform: caseInsensitiveTransform,
  mustUseProperty: ['checked', 'multiple', 'muted', 'selected'],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: commaSeparated,
    acceptCharset: spaceSeparated,
    accessKey: spaceSeparated,
    action: null,
    allow: null,
    allowFullScreen: boolean,
    allowPaymentRequest: boolean,
    allowUserMedia: boolean,
    alt: null,
    as: null,
    async: boolean,
    autoCapitalize: null,
    autoComplete: spaceSeparated,
    autoFocus: boolean,
    autoPlay: boolean,
    capture: boolean,
    charSet: null,
    checked: boolean,
    cite: null,
    className: spaceSeparated,
    cols: number,
    colSpan: null,
    content: null,
    contentEditable: booleanish,
    controls: boolean,
    controlsList: spaceSeparated,
    coords: number | commaSeparated,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: boolean,
    defer: boolean,
    dir: null,
    dirName: null,
    disabled: boolean,
    download: overloadedBoolean,
    draggable: booleanish,
    encType: null,
    enterKeyHint: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: boolean,
    formTarget: null,
    headers: spaceSeparated,
    height: number,
    hidden: boolean,
    high: number,
    href: null,
    hrefLang: null,
    htmlFor: spaceSeparated,
    httpEquiv: spaceSeparated,
    id: null,
    imageSizes: null,
    imageSrcSet: commaSeparated,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: boolean,
    itemId: null,
    itemProp: spaceSeparated,
    itemRef: spaceSeparated,
    itemScope: boolean,
    itemType: spaceSeparated,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loop: boolean,
    low: number,
    manifest: null,
    max: null,
    maxLength: number,
    media: null,
    method: null,
    min: null,
    minLength: number,
    multiple: boolean,
    muted: boolean,
    name: null,
    nonce: null,
    noModule: boolean,
    noValidate: boolean,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforePrint: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextMenu: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: boolean,
    optimum: number,
    pattern: null,
    ping: spaceSeparated,
    placeholder: null,
    playsInline: boolean,
    poster: null,
    preload: null,
    readOnly: boolean,
    referrerPolicy: null,
    rel: spaceSeparated,
    required: boolean,
    reversed: boolean,
    rows: number,
    rowSpan: number,
    sandbox: spaceSeparated,
    scope: null,
    scoped: boolean,
    seamless: boolean,
    selected: boolean,
    shape: null,
    size: number,
    sizes: null,
    slot: null,
    span: number,
    spellCheck: booleanish,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: commaSeparated,
    start: number,
    step: null,
    style: null,
    tabIndex: number,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: boolean,
    useMap: null,
    value: booleanish,
    width: number,
    wrap: null,

    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null, // Several. Use CSS `text-align` instead,
    aLink: null, // `<body>`. Use CSS `a:active {color}` instead
    archive: spaceSeparated, // `<object>`. List of URIs to archives
    axis: null, // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null, // `<body>`. Use CSS `background-image` instead
    bgColor: null, // `<body>` and table elements. Use CSS `background-color` instead
    border: number, // `<table>`. Use CSS `border-width` instead,
    borderColor: null, // `<table>`. Use CSS `border-color` instead,
    bottomMargin: number, // `<body>`
    cellPadding: null, // `<table>`
    cellSpacing: null, // `<table>`
    char: null, // Several table elements. When `align=char`, sets the character to align on
    charOff: null, // Several table elements. When `char`, offsets the alignment
    classId: null, // `<object>`
    clear: null, // `<br>`. Use CSS `clear` instead
    code: null, // `<object>`
    codeBase: null, // `<object>`
    codeType: null, // `<object>`
    color: null, // `<font>` and `<hr>`. Use CSS instead
    compact: boolean, // Lists. Use CSS to reduce space between items instead
    declare: boolean, // `<object>`
    event: null, // `<script>`
    face: null, // `<font>`. Use CSS instead
    frame: null, // `<table>`
    frameBorder: null, // `<iframe>`. Use CSS `border` instead
    hSpace: number, // `<img>` and `<object>`
    leftMargin: number, // `<body>`
    link: null, // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null, // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null, // `<img>`. Use a `<picture>`
    marginHeight: number, // `<body>`
    marginWidth: number, // `<body>`
    noResize: boolean, // `<frame>`
    noHref: boolean, // `<area>`. Use no href instead of an explicit `nohref`
    noShade: boolean, // `<hr>`. Use background-color and height instead of borders
    noWrap: boolean, // `<td>` and `<th>`
    object: null, // `<applet>`
    profile: null, // `<head>`
    prompt: null, // `<isindex>`
    rev: null, // `<link>`
    rightMargin: number, // `<body>`
    rules: null, // `<table>`
    scheme: null, // `<meta>`
    scrolling: booleanish, // `<frame>`. Use overflow in the child context
    standby: null, // `<object>`
    summary: null, // `<table>`
    text: null, // `<body>`. Use CSS `color` instead
    topMargin: number, // `<body>`
    valueType: null, // `<param>`
    version: null, // `<html>`. Use a doctype.
    vAlign: null, // Several. Use CSS `vertical-align` instead
    vLink: null, // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: number, // `<img>` and `<object>`

    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: boolean,
    disableRemotePlayback: boolean,
    prefix: null,
    property: null,
    results: number,
    security: null,
    unselectable: null
  }
})

},{"./util/case-insensitive-transform":34,"./util/create":36,"./util/types":41}],33:[function(require,module,exports){
'use strict'

var types = require('./util/types')
var create = require('./util/create')
var caseSensitiveTransform = require('./util/case-sensitive-transform')

var boolean = types.boolean
var number = types.number
var spaceSeparated = types.spaceSeparated
var commaSeparated = types.commaSeparated
var commaOrSpaceSeparated = types.commaOrSpaceSeparated

module.exports = create({
  space: 'svg',
  attributes: {
    accentHeight: 'accent-height',
    alignmentBaseline: 'alignment-baseline',
    arabicForm: 'arabic-form',
    baselineShift: 'baseline-shift',
    capHeight: 'cap-height',
    className: 'class',
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    crossOrigin: 'crossorigin',
    dataType: 'datatype',
    dominantBaseline: 'dominant-baseline',
    enableBackground: 'enable-background',
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    hrefLang: 'hreflang',
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    horizOriginY: 'horiz-origin-y',
    imageRendering: 'image-rendering',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    navDown: 'nav-down',
    navDownLeft: 'nav-down-left',
    navDownRight: 'nav-down-right',
    navLeft: 'nav-left',
    navNext: 'nav-next',
    navPrev: 'nav-prev',
    navRight: 'nav-right',
    navUp: 'nav-up',
    navUpLeft: 'nav-up-left',
    navUpRight: 'nav-up-right',
    onAbort: 'onabort',
    onActivate: 'onactivate',
    onAfterPrint: 'onafterprint',
    onBeforePrint: 'onbeforeprint',
    onBegin: 'onbegin',
    onCancel: 'oncancel',
    onCanPlay: 'oncanplay',
    onCanPlayThrough: 'oncanplaythrough',
    onChange: 'onchange',
    onClick: 'onclick',
    onClose: 'onclose',
    onCopy: 'oncopy',
    onCueChange: 'oncuechange',
    onCut: 'oncut',
    onDblClick: 'ondblclick',
    onDrag: 'ondrag',
    onDragEnd: 'ondragend',
    onDragEnter: 'ondragenter',
    onDragExit: 'ondragexit',
    onDragLeave: 'ondragleave',
    onDragOver: 'ondragover',
    onDragStart: 'ondragstart',
    onDrop: 'ondrop',
    onDurationChange: 'ondurationchange',
    onEmptied: 'onemptied',
    onEnd: 'onend',
    onEnded: 'onended',
    onError: 'onerror',
    onFocus: 'onfocus',
    onFocusIn: 'onfocusin',
    onFocusOut: 'onfocusout',
    onHashChange: 'onhashchange',
    onInput: 'oninput',
    onInvalid: 'oninvalid',
    onKeyDown: 'onkeydown',
    onKeyPress: 'onkeypress',
    onKeyUp: 'onkeyup',
    onLoad: 'onload',
    onLoadedData: 'onloadeddata',
    onLoadedMetadata: 'onloadedmetadata',
    onLoadStart: 'onloadstart',
    onMessage: 'onmessage',
    onMouseDown: 'onmousedown',
    onMouseEnter: 'onmouseenter',
    onMouseLeave: 'onmouseleave',
    onMouseMove: 'onmousemove',
    onMouseOut: 'onmouseout',
    onMouseOver: 'onmouseover',
    onMouseUp: 'onmouseup',
    onMouseWheel: 'onmousewheel',
    onOffline: 'onoffline',
    onOnline: 'ononline',
    onPageHide: 'onpagehide',
    onPageShow: 'onpageshow',
    onPaste: 'onpaste',
    onPause: 'onpause',
    onPlay: 'onplay',
    onPlaying: 'onplaying',
    onPopState: 'onpopstate',
    onProgress: 'onprogress',
    onRateChange: 'onratechange',
    onRepeat: 'onrepeat',
    onReset: 'onreset',
    onResize: 'onresize',
    onScroll: 'onscroll',
    onSeeked: 'onseeked',
    onSeeking: 'onseeking',
    onSelect: 'onselect',
    onShow: 'onshow',
    onStalled: 'onstalled',
    onStorage: 'onstorage',
    onSubmit: 'onsubmit',
    onSuspend: 'onsuspend',
    onTimeUpdate: 'ontimeupdate',
    onToggle: 'ontoggle',
    onUnload: 'onunload',
    onVolumeChange: 'onvolumechange',
    onWaiting: 'onwaiting',
    onZoom: 'onzoom',
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pointerEvents: 'pointer-events',
    referrerPolicy: 'referrerpolicy',
    renderingIntent: 'rendering-intent',
    shapeRendering: 'shape-rendering',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    strokeDashArray: 'stroke-dasharray',
    strokeDashOffset: 'stroke-dashoffset',
    strokeLineCap: 'stroke-linecap',
    strokeLineJoin: 'stroke-linejoin',
    strokeMiterLimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    tabIndex: 'tabindex',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    typeOf: 'typeof',
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    vectorEffect: 'vector-effect',
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    xHeight: 'x-height',
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: 'playbackorder',
    timelineBegin: 'timelinebegin'
  },
  transform: caseSensitiveTransform,
  properties: {
    about: commaOrSpaceSeparated,
    accentHeight: number,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: number,
    amplitude: number,
    arabicForm: null,
    ascent: number,
    attributeName: null,
    attributeType: null,
    azimuth: number,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: number,
    by: null,
    calcMode: null,
    capHeight: number,
    className: spaceSeparated,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: number,
    diffuseConstant: number,
    direction: null,
    display: null,
    dur: null,
    divisor: number,
    dominantBaseline: null,
    download: boolean,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: number,
    enableBackground: null,
    end: null,
    event: null,
    exponent: number,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: number,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: commaSeparated,
    g2: commaSeparated,
    glyphName: commaSeparated,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: number,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: number,
    horizOriginX: number,
    horizOriginY: number,
    id: null,
    ideographic: number,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: number,
    k: number,
    k1: number,
    k2: number,
    k3: number,
    k4: number,
    kernelMatrix: commaOrSpaceSeparated,
    kernelUnitLength: null,
    keyPoints: null, // SEMI_COLON_SEPARATED
    keySplines: null, // SEMI_COLON_SEPARATED
    keyTimes: null, // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: number,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: number,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: number,
    overlineThickness: number,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: number,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: spaceSeparated,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: number,
    pointsAtY: number,
    pointsAtZ: number,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: commaOrSpaceSeparated,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: commaOrSpaceSeparated,
    rev: commaOrSpaceSeparated,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: commaOrSpaceSeparated,
    requiredFeatures: commaOrSpaceSeparated,
    requiredFonts: commaOrSpaceSeparated,
    requiredFormats: commaOrSpaceSeparated,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: number,
    specularExponent: number,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: number,
    strikethroughThickness: number,
    string: null,
    stroke: null,
    strokeDashArray: commaOrSpaceSeparated,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: number,
    strokeOpacity: number,
    strokeWidth: null,
    style: null,
    surfaceScale: number,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: commaOrSpaceSeparated,
    tabIndex: number,
    tableValues: null,
    target: null,
    targetX: number,
    targetY: number,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: commaOrSpaceSeparated,
    to: null,
    transform: null,
    u1: null,
    u2: null,
    underlinePosition: number,
    underlineThickness: number,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: number,
    values: null,
    vAlphabetic: number,
    vMathematical: number,
    vectorEffect: null,
    vHanging: number,
    vIdeographic: number,
    version: null,
    vertAdvY: number,
    vertOriginX: number,
    vertOriginY: number,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: number,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  }
})

},{"./util/case-sensitive-transform":35,"./util/create":36,"./util/types":41}],34:[function(require,module,exports){
'use strict'

var caseSensitiveTransform = require('./case-sensitive-transform')

module.exports = caseInsensitiveTransform

function caseInsensitiveTransform(attributes, property) {
  return caseSensitiveTransform(attributes, property.toLowerCase())
}

},{"./case-sensitive-transform":35}],35:[function(require,module,exports){
'use strict'

module.exports = caseSensitiveTransform

function caseSensitiveTransform(attributes, attribute) {
  return attribute in attributes ? attributes[attribute] : attribute
}

},{}],36:[function(require,module,exports){
'use strict'

var normalize = require('../../normalize')
var Schema = require('./schema')
var DefinedInfo = require('./defined-info')

module.exports = create

function create(definition) {
  var space = definition.space
  var mustUseProperty = definition.mustUseProperty || []
  var attributes = definition.attributes || {}
  var props = definition.properties
  var transform = definition.transform
  var property = {}
  var normal = {}
  var prop
  var info

  for (prop in props) {
    info = new DefinedInfo(
      prop,
      transform(attributes, prop),
      props[prop],
      space
    )

    if (mustUseProperty.indexOf(prop) !== -1) {
      info.mustUseProperty = true
    }

    property[prop] = info

    normal[normalize(prop)] = prop
    normal[normalize(info.attribute)] = prop
  }

  return new Schema(property, normal, space)
}

},{"../../normalize":45,"./defined-info":37,"./schema":40}],37:[function(require,module,exports){
'use strict'

var Info = require('./info')
var types = require('./types')

module.exports = DefinedInfo

DefinedInfo.prototype = new Info()
DefinedInfo.prototype.defined = true

var checks = [
  'boolean',
  'booleanish',
  'overloadedBoolean',
  'number',
  'commaSeparated',
  'spaceSeparated',
  'commaOrSpaceSeparated'
]
var checksLength = checks.length

function DefinedInfo(property, attribute, mask, space) {
  var index = -1
  var check

  mark(this, 'space', space)

  Info.call(this, property, attribute)

  while (++index < checksLength) {
    check = checks[index]
    mark(this, check, (mask & types[check]) === types[check])
  }
}

function mark(values, key, value) {
  if (value) {
    values[key] = value
  }
}

},{"./info":38,"./types":41}],38:[function(require,module,exports){
'use strict'

module.exports = Info

var proto = Info.prototype

proto.space = null
proto.attribute = null
proto.property = null
proto.boolean = false
proto.booleanish = false
proto.overloadedBoolean = false
proto.number = false
proto.commaSeparated = false
proto.spaceSeparated = false
proto.commaOrSpaceSeparated = false
proto.mustUseProperty = false
proto.defined = false

function Info(property, attribute) {
  this.property = property
  this.attribute = attribute
}

},{}],39:[function(require,module,exports){
'use strict'

var xtend = require('xtend')
var Schema = require('./schema')

module.exports = merge

function merge(definitions) {
  var length = definitions.length
  var property = []
  var normal = []
  var index = -1
  var info
  var space

  while (++index < length) {
    info = definitions[index]
    property.push(info.property)
    normal.push(info.normal)
    space = info.space
  }

  return new Schema(
    xtend.apply(null, property),
    xtend.apply(null, normal),
    space
  )
}

},{"./schema":40,"xtend":51}],40:[function(require,module,exports){
'use strict'

module.exports = Schema

var proto = Schema.prototype

proto.space = null
proto.normal = {}
proto.property = {}

function Schema(property, normal, space) {
  this.property = property
  this.normal = normal

  if (space) {
    this.space = space
  }
}

},{}],41:[function(require,module,exports){
'use strict'

var powers = 0

exports.boolean = increment()
exports.booleanish = increment()
exports.overloadedBoolean = increment()
exports.number = increment()
exports.spaceSeparated = increment()
exports.commaSeparated = increment()
exports.commaOrSpaceSeparated = increment()

function increment() {
  return Math.pow(2, ++powers)
}

},{}],42:[function(require,module,exports){
'use strict'

var create = require('./util/create')

module.exports = create({
  space: 'xlink',
  transform: xlinkTransform,
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  }
})

function xlinkTransform(_, prop) {
  return 'xlink:' + prop.slice(5).toLowerCase()
}

},{"./util/create":36}],43:[function(require,module,exports){
'use strict'

var create = require('./util/create')

module.exports = create({
  space: 'xml',
  transform: xmlTransform,
  properties: {
    xmlLang: null,
    xmlBase: null,
    xmlSpace: null
  }
})

function xmlTransform(_, prop) {
  return 'xml:' + prop.slice(3).toLowerCase()
}

},{"./util/create":36}],44:[function(require,module,exports){
'use strict'

var create = require('./util/create')
var caseInsensitiveTransform = require('./util/case-insensitive-transform')

module.exports = create({
  space: 'xmlns',
  attributes: {
    xmlnsxlink: 'xmlns:xlink'
  },
  transform: caseInsensitiveTransform,
  properties: {
    xmlns: null,
    xmlnsXLink: null
  }
})

},{"./util/case-insensitive-transform":34,"./util/create":36}],45:[function(require,module,exports){
'use strict'

module.exports = normalize

function normalize(value) {
  return value.toLowerCase()
}

},{}],46:[function(require,module,exports){
'use strict'

var merge = require('./lib/util/merge')
var xlink = require('./lib/xlink')
var xml = require('./lib/xml')
var xmlns = require('./lib/xmlns')
var aria = require('./lib/aria')
var svg = require('./lib/svg')

module.exports = merge([xml, xlink, xmlns, aria, svg])

},{"./lib/aria":31,"./lib/svg":33,"./lib/util/merge":39,"./lib/xlink":42,"./lib/xml":43,"./lib/xmlns":44}],47:[function(require,module,exports){
'use strict'

exports.parse = parse
exports.stringify = stringify

var empty = ''
var space = ' '
var whiteSpace = /[ \t\n\r\f]+/g

function parse(value) {
  var input = String(value || empty).trim()
  return input === empty ? [] : input.split(whiteSpace)
}

function stringify(values) {
  return values.join(space).trim()
}

},{}],48:[function(require,module,exports){
module.exports=[
  "cent",
  "copy",
  "divide",
  "gt",
  "lt",
  "not",
  "para",
  "times"
]

},{}],49:[function(require,module,exports){
'use strict'

var entities = require('character-entities-html4')
var legacy = require('character-entities-legacy')
var hexadecimal = require('is-hexadecimal')
var decimal = require('is-decimal')
var alphanumerical = require('is-alphanumerical')
var dangerous = require('./dangerous.json')

module.exports = encode
encode.escape = escape

var own = {}.hasOwnProperty

// Characters
var equalsTo = 61

// List of enforced escapes.
var escapes = ['"', "'", '<', '>', '&', '`']

// Map of characters to names.
var characters = construct()

// Default escapes.
var defaultEscapes = toExpression(escapes)

// Surrogate pairs.
var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g

// Non-ASCII characters.
// eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
var bmp = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g

// Encode special characters in `value`.
function encode(value, options) {
  var settings = options || {}
  var subset = settings.subset
  var set = subset ? toExpression(subset) : defaultEscapes
  var escapeOnly = settings.escapeOnly
  var omit = settings.omitOptionalSemicolons

  value = value.replace(set, replace)

  if (subset || escapeOnly) {
    return value
  }

  return value
    .replace(surrogatePair, replaceSurrogatePair)
    .replace(bmp, replace)

  function replaceSurrogatePair(pair, pos, slice) {
    return toHexReference(
      (pair.charCodeAt(0) - 0xd800) * 0x400 +
        pair.charCodeAt(1) -
        0xdc00 +
        0x10000,
      slice.charCodeAt(pos + 2),
      omit
    )
  }

  function replace(char, pos, slice) {
    return one(char, slice.charCodeAt(pos + 1), settings)
  }
}

// Shortcut to escape special characters in HTML.
function escape(value) {
  return encode(value, {escapeOnly: true, useNamedReferences: true})
}

// Encode `char` according to `options`.
function one(char, next, options) {
  var shortest = options.useShortestReferences
  var omit = options.omitOptionalSemicolons
  var named
  var code
  var numeric
  var decimal

  if ((shortest || options.useNamedReferences) && own.call(characters, char)) {
    named = toNamed(characters[char], next, omit, options.attribute)
  }

  if (shortest || !named) {
    code = char.charCodeAt(0)
    numeric = toHexReference(code, next, omit)

    // Use the shortest numeric reference when requested.
    // A simple algorithm would use decimal for all code points under 100, as
    // those are shorter than hexadecimal:
    //
    // * `&#99;` vs `&#x63;` (decimal shorter)
    // * `&#100;` vs `&#x64;` (equal)
    //
    // However, because we take `next` into consideration when `omit` is used,
    // And it would be possible that decimals are shorter on bigger values as
    // well if `next` is hexadecimal but not decimal, we instead compare both.
    if (shortest) {
      decimal = toDecimalReference(code, next, omit)

      if (decimal.length < numeric.length) {
        numeric = decimal
      }
    }
  }

  if (named && (!shortest || named.length < numeric.length)) {
    return named
  }

  return numeric
}

// Transform `code` into an entity.
function toNamed(name, next, omit, attribute) {
  var value = '&' + name

  if (
    omit &&
    own.call(legacy, name) &&
    dangerous.indexOf(name) === -1 &&
    (!attribute || (next && next !== equalsTo && !alphanumerical(next)))
  ) {
    return value
  }

  return value + ';'
}

// Transform `code` into a hexadecimal character reference.
function toHexReference(code, next, omit) {
  var value = '&#x' + code.toString(16).toUpperCase()
  return omit && next && !hexadecimal(next) ? value : value + ';'
}

// Transform `code` into a decimal character reference.
function toDecimalReference(code, next, omit) {
  var value = '&#' + String(code)
  return omit && next && !decimal(next) ? value : value + ';'
}

// Create an expression for `characters`.
function toExpression(characters) {
  return new RegExp('[' + characters.join('') + ']', 'g')
}

// Construct the map.
function construct() {
  var chars = {}
  var name

  for (name in entities) {
    chars[entities[name]] = name
  }

  return chars
}

},{"./dangerous.json":48,"character-entities-html4":19,"character-entities-legacy":20,"is-alphanumerical":26,"is-decimal":27,"is-hexadecimal":28}],50:[function(require,module,exports){
'use strict'

module.exports = convert

function convert(test) {
  if (typeof test === 'string') {
    return typeFactory(test)
  }

  if (test === null || test === undefined) {
    return ok
  }

  if (typeof test === 'object') {
    return ('length' in test ? anyFactory : matchesFactory)(test)
  }

  if (typeof test === 'function') {
    return test
  }

  throw new Error('Expected function, string, or object as test')
}

function convertAll(tests) {
  var results = []
  var length = tests.length
  var index = -1

  while (++index < length) {
    results[index] = convert(tests[index])
  }

  return results
}

// Utility assert each property in `test` is represented in `node`, and each
// values are strictly equal.
function matchesFactory(test) {
  return matches

  function matches(node) {
    var key

    for (key in test) {
      if (node[key] !== test[key]) {
        return false
      }
    }

    return true
  }
}

function anyFactory(tests) {
  var checks = convertAll(tests)
  var length = checks.length

  return matches

  function matches() {
    var index = -1

    while (++index < length) {
      if (checks[index].apply(this, arguments)) {
        return true
      }
    }

    return false
  }
}

// Utility to convert a string into a function which checks a given node’s type
// for said string.
function typeFactory(test) {
  return type

  function type(node) {
    return Boolean(node && node.type === test)
  }
}

// Utility to return true.
function ok() {
  return true
}

},{}],51:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],52:[function(require,module,exports){
'use strict'
module.exports = require('./lib')

},{"./lib":6}]},{},[52])(52)
});
