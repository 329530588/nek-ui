/**
 * ------------------------------------------------------------
 * KLCol 栅格布局-列
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../../../ui-base/component');
var _ = require('../../../ui-base/_');
var template = require('./index.html');
var KLRow = require('../KLRow');

/**
 * @class KLCol
 * @extend Component
 * @param {object}          [options.data]                        => 绑定数据
 * @param {string}          [options.data.class]                  => 补充class
 * @param {number}          [options.data.span='']              => 栅格占据的列数
 * @param {number}          [options.data.offset='']            => 栅格左侧的间隔格数
 */
var KLCol = Component.extend({
  name: 'kl-col',
  template: template,
  config: function (data) {
    this.defaults({
      span: '',
      offset: '',
      gutter: 0,
    });

    var $outer = this;
    do {
      if ($outer.$outer) {
        $outer = $outer.$outer;
      } else if ($outer.$parent) {
        $outer = $outer.$parent;
      }
    } while(!($outer instanceof KLRow) && ($outer.$outer || $outer.$parent));

    if ($outer && $outer instanceof KLRow) {
      this.data.gutter = $outer.data.gutter;
    }

    this.supr(data);
  },
});

KLCol.directive('gutter', function(ele, value) {
  this.$watch(value, function(gutter) {
    if (gutter) {
      var padding = gutter/2 + 'px';
      ele.style.paddingLeft = padding;
      ele.style.paddingRight = padding;
    }
  })
});

module.exports = KLCol;
