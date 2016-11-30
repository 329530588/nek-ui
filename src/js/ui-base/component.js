/**
 * ------------------------------------------------------------
 * Component 组件基类
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

'use strict';

var Regular = require('regularjs');
var polyfill = require('./polyfill.js');
var _ = require('./_.js');
var filter = require('./filter.js');
var directive = require('./directive.js');
var rules = require('./rules.js');

/**
 * @class Component
 * @extend Regular
 * @param {boolean=false}           options.data.readonly            => 是否只读
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {boolean=true}            options.data.visible             => 是否显示
 * @param {string=''}               options.data.class               => 补充class
 */
var Component = Regular.extend({
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            readonly: false,
            disabled: false,
            visible: true,
            'class': '',
            console: typeof console === 'undefined' ? undefined : console,
            rules: rules
        });
        this.$on('update_nek', function(conf) {
            if (!conf) return;
            var typeTrans = function(value, type, extraType) {
                // type: 'none', 'string', 'number', 'boolean', 'array', 'select', 'expression'
                // extraType: string/number/boolean
                if (type === 'none' || type === 'boolean') {
                    return value === 'true';
                }
                if (type === 'number'
                  || (type === 'select' && extraType === 'number')) {
                    return value / 1;
                }
                if (type === 'array') {
                    return JSON.parse(value || '[]').map(function(d) {
                        if (extraType === 'number') {
                            return d / 1;
                        }
                        if (extraType === 'boolean') {
                            return d === 'true';
                        }
                        return d;
                    });
                }
                // 表达式类型只是为了 NEK CLI 预填数据，不做设置
                if (type === 'expression') {
                    return 'NEK_EXP';
                }
                return value;
            };
            conf.forEach(function(d) {
                var val = typeTrans(d.value, d.type, d.extraType);
                if (this.data.hasOwnProperty(d.key) && val !== 'NEK_EXP') {
                    this.$update(d.key, val);
                }
            }.bind(this));
        });
        this.supr();
    },
    /**
     * @protected
     */
    defaults: function(data) {
      if (data.rules) { console.warn('use this.rules([Object]) instead of this.defaults to set validate rules'); }
      this.data = Object.assign(data, this.data);
    },
    /**
     * @protected
     */
    rules: function(rules) {
      this.data.rules = Object.assign(this.data.rules, rules);
    },
    /**
     * @protected
     */
    reset: function() {
        this.data = {};
        this.config();
    }
})
.filter(filter)
.directive(directive);

module.exports = Component;