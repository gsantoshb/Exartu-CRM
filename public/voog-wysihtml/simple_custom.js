/**
 * Basic rule set based on the simple rules file
 *
 * We try to allow most of the more common html tags with standard attributes and all classes
 */

var globalAttrs = {
  contenteditable: "any",
  "data-*": "any",
  hidden: "any",
  id: "any",
  name: "any",
  style: "any",
  tabindex: "any",
  title: "any"
};

wysihtml5ParserRules = {
  classes: "any",

  tags: {
    a: {
      check_attributes: _.extend({
        href:   "url",
        rel: "any",
        target: "any",
        type: "any"
      }, globalAttrs)
    },
    abbr: {},
    acronym: {},
    address: {},
    area: {},
    article: {},
    aside: {},
    b: { check_attributes: globalAttrs },
    base: {},
    basefont: {},
    bdi: {},
    bgsound: {},
    big: {},
    blockquote: { check_attributes: _.extend({ cite: "any" }, globalAttrs) },
    button: {},
    br: {},
    canvas: {},
    caption: {},
    center: {},
    cite: {},
    code: {},
    command: {},
    del: {},
    details: {},
    dd: {},
    dfn: {},
    div: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    dir: {},
    dl: {},
    dt: {},
    em: {},
    fieldset: {},
    figcaption: {},
    figure: {},
    footer: {},
    form: {},
    h1: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    h2: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    h3: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    h4: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    h5: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    h6: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    hr: {},
    i: { check_attributes: globalAttrs },
    iframe: {},
    img: {
      check_attributes: _.extend({
        align: "any",
        alt: "any",
        border: "any",
        height: "any",
        src: "any",
        width: "any"
      }, globalAttrs)
    },
    input: {
      check_attributes: _.extend({
        accept: "any",
        align: "any",
        alt: "any",
        checked: "any",
        disabled: "any",
        height: "any",
        max: "any",
        maxlength: "any",
        min: "any",
        pattern: "any",
        placeholder: "any",
        readonly: "any",
        required: "any",
        size: "any",
        type: "any",
        value: "any",
        width: "any"
      }, globalAttrs)
    },
    label: {},
    li: {
      check_attributes: _.extend({
        value: "any",
        type: "any"
      }, globalAttrs)
    },
    map: {},
    mark: {},
    marquee: {},
    nav: {},
    noframes: {},
    menu: {},
    meta: {},
    multicol: {},
    nobr: {},
    object: {},
    ol: {
      check_attributes: _.extend({
        compact: "any",
        reversed: "any",
        start: "any",
        type: "any"
      }, globalAttrs)
    },
    option: {},
    output: {},
    p: { check_attributes: _.extend({ align: "any" }, globalAttrs) },
    pre: {},
    progress: {},
    q: {},
    rb: {},
    rt: {},
    rp: {},
    s: {},
    section: {},
    select: {},
    script: {
      check_attributes: {
        type: "any",
        src: "any",
        charset: "any"
      }
    },
    small: {},
    span: {},
    style: {
      check_attributes: {
        type: "any",
        src: "any",
        charset: "any"
      }
    },
    strike: {},
    strong: {},
    summary: {},
    sup: {},
    svg: {},
    table: {},
    tbody: {},
    td: {},
    textarea: {
      unwrap: 1
    },
    tfoot: {},
    th: {},
    thead: {},
    time: {},
    title: {},
    tr: {},
    track: {},
    tt: {},
    u: { check_attributes: globalAttrs },
    ul: {
      check_attributes: _.extend({
        compact: "any",
        type: "any"
      }, globalAttrs)
    },
    video: {},
    wbr: {},
    xmp: {}
  }
};
