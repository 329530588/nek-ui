/**
 * ------------------------------------------------------------
 * Input   输入扩展
 * @author   sensen(rainforest92@126.com)
 * ------------------------------------------------------------
 */

var Component = require('../../ui-base/component.js');
var template = require('./ui.input.html');
var _ = require('../../ui-base/_.js');
var Validation = require('../../util/validation.js');
var inputRules = require('./ui.input.rule.js');

var bowser = require('bowser');

/**
 * @class Input
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {string=''}               options.data.value              <=> 文本框的值
 * @param {string=''}               options.data.type                => 文本框的类型, 5种类型：int, float, email, url，byte
 * @param {string=''}               options.data.placeholder         => 占位符
 * @param {string=''}               options.data.state              <=> 文本框的状态
 * @param {number}                  options.data.maxlength           => 文本框的最大长度
 * @param {string=''}               options.data.unit                => 单位
 * @param {object[]=[]}             options.data.rules               => 验证规则
 * @param {boolean=false}           options.data.autofocus           => 是否自动获得焦点
 * @param {boolean=false}           options.data.readonly            => 是否只读
 * @param {boolean=false}           options.data.disabled            => 是否禁用
 * @param {boolean=true}            options.data.visible             => 是否显示
 * @param {string=''}               options.data.class               => 补充class
 * @param {boolean}                 options.data.required            => 【验证规则】是否必填
 * @param {number}                  options.data.min                 => 【验证规则】type=int/float时的最小值, type=byte时，最小长度
 * @param {number}                  options.data.max                 => 【验证规则】type=int/float时的最大值, type=byte时，最大长度
 * @oaram {string=''}               options.data.message             => 【验证规则】验证失败时，提示的消息
 */
var Input = Component.extend({
    name: 'ui.input',
    template: template,
    /**
     * @protected
     */
    config: function() {
        _.extend(this.data, {
            value: '',
            type: '',
            placeholder: '',
            state: '',
            maxlength: undefined,
            unit: '',
            rules: [],
            autofocus: false,
            _eltIE9: bowser.msie && bowser.version <= 9
        });
        this.rules({
            required: false,
            byteLen: this.data.type === 'byte',
            isEmail: this.data.type === 'email',
            isURL: this.data.type === 'url',
            isInt: this.data.type === 'int',
            isFloat: this.data.type === 'float',
            message: ''
        });

        this.supr();

        var $outer = this.$outer;
        if($outer && $outer instanceof Validation) {
            $outer.controls.push(this);

            this.$on('destroy', function() {
                var index = $outer.controls.indexOf(this);
                $outer.controls.splice(index, 1);
            });
        }
    },
    /**
     * @override 
     */
    rules: function(ruleAttris) {
        this.supr(ruleAttris);
        ['required', 'isEmail', 'isURL', 'isFloat', 'isInt', 'byteLen'].forEach(function(name) {
            this.addRule(name);
        }.bind(this));
    },
    /**
     * @protected
     */
    addRule: function(name) {
        var min = this.data.min, 
            max = this.data.max,
            message = this.data.message,
            rules = this.data.rules;

        if (!this.data[name]) { return; }
        var rule = inputRules[name];
        if (typeof rule === 'function') {
            rules.push(rule(min, max, message));
        } else {
            rules.push(rule);
        }
    },
    /**
     * @method validate() 根据`rules`验证组件的值是否正确
     * @public
     * @return {object} result 结果
     */
    validate: function(on) {
        var value = this.data.value;
        var rules = this.data.rules;

        var PRIORITY = {
            'keyup': 2,
            'blur': 1,
            'submit': 0,
            '': 0
        }

        on = on || '';
        rules = rules.filter(function(rule) {
            return (rule.on || '').indexOf(on) >= 0;
        });

        var result = Validation.validate(value, rules);
        if(result.firstRule
            && !(result.firstRule.silentOn === true || (typeof result.firstRule.silentOn === 'string' && result.firstRule.silentOn.indexOf(on) >= 0)))
                this.data.tip = result.firstRule.message;
        else
            this.data.tip = '';

        // @TODO
        if(!result.success)
            this.data.state = 'error';
        // else if(PRIORITY[on] <= PRIORITY['blur'])
        //     this.data.state = 'success';
        else
            this.data.state = '';

        this.$emit('validate', {
            sender: this,
            on: on,
            result: result
        });

        return result;
    },
    _onKeyUp: function($event) {
        this.validate('keyup');
        this.$emit('keyup', $event);
    },
    _onBlur: function($event) {
        this.validate('blur');
        this.$emit('blur', $event);
    }
});

Input.filter('type', function(val) {
    if (['int', 'float'].indexOf(val) != -1) {
        return 'number';
    } else {
        return 'text';
    }
});

module.exports = Input;
