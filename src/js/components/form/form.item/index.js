'use strict';

var _ = require('../../../ui-base/_');
var Validation = require('../../../util/validation');
var UIForm = require('../ui.form');
var Tooltip = require('../../widget/tooltip');

var template = require('./index.html');

/**
 * @class FormItem
 * @extend Validation
 * @param {object}        [options.data]              = 绑定属性
 * @param {string}        [options.data.title]        => label显示的文字
 * @param {number}        [options.data.cols]         => 布局列数
 * @param {number}        [options.data.labelCols=4]  => 如果有title, label占的列数
 * @param {string|number} [options.data.labelSize=200]=> 如果有title, label占的宽度,可以是px单位的数字,也可以是sm, md, lg, xlg
 * @param {number}        [options.data.offset]       => 布局offset
 * @param {string}        [options.data.row]          => 垂直布局row
 * @param {boolean}       [options.data.required=false] => 是否必选项
 * @param {string}        [options.data.tip]          => 字段说明
 * @param {string}        [options.data.class]        => 样式扩展
 * @param {string}        [options.data.sourceKey]    => 异步获取下拉列表接口的索引值
 */
var FormItem = Validation.extend({
    name: 'form.item',
    template: template,
    config: function (data) {
        _.extend(data, {
            labelCols:12
        });
        this.supr(data);

        var $outer = this.$outer;
        if ($outer && $outer instanceof UIForm) {
            $outer.controls.push(this);
        }
    },
    init: function() {
        var $outer = this.$outer;
        this.$watch('this.controls.length', function(len) {
            if (!len) { return; }
            if ($outer && $outer.initSelectorSource) {
                $outer.initSelectorSource();
            }
        });

        this.initValidateRule();
    },
    initValidateRule: function() {
        if (!this.controls.length) { return; }

        var controls = this.controls || [],
            message = this.data.message || '请选择';
        controls.forEach(function($component) {
          var rules = $component.data.rules,
              isFilled = { type: 'isFilled', message: message};

          if (this.data.required) {
            if (!rules) {
              $component.data.rules = [].concat(isFilled);
            } else {
              rules.push(isFilled);
            }
            // rules针对input等较复杂的验证规则, required属性针对ui.select, check.group等;
            $component.data.required = true;
            $component.data.message = message;
            $component.$update();
          }
        }.bind(this));
    }
});

FormItem.directive('cols', function(ele, cols) {
    this.$watch(cols, function(ncols) {
        ele.className = ele.className.replace(/(\s)g-col(-\d*)?/gim, '');
        if (ncols) {
            ele.classList.add('g-col', 'g-col-' + ncols);
        }
    });
});

FormItem.directive('offset', function(ele, offset) {
    this.$watch(offset, function(noffset) {
        ele.className = ele.className.replace(/(\s)g-offset(-\d)?/gim, '');

        if (noffset) {
            ele.classList.add('g-offset-' + noffset);
        }
    });
});

FormItem.directive('row', function(ele, row) {
    this.$watch(row, function(newValue) {
        if (newValue) {
            ele.classList.add('u-formitem-row');
            this.data.labelCols = this.data.labelCols == 12 ?  4 : this.data.labelCols;
        }
    });
});

FormItem.directive('size', function(ele, size) {
    this.$watch(size, function(newValue, oldValue) {
        if (!newValue) { return; }

        if (parseInt(newValue)) {
            ele.style.width = parseInt(newValue) + 'px';
        } else {
            ele.classList.remove(oldValue);
            ele.classList.add(`formitem_tt-${newValue}`);
        }
    });
});

module.exports = FormItem;
