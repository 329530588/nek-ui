/**
 * @file KLInput   输入扩展
 * @author   sensen<rainforest92@126.com>
 * ------------------------------------------------------------
 */

const Component = require('../../../ui-base/component');
const template = require('./index.html');
const _ = require('../../../ui-base/_');
const Validation = require('../../../util/validation');
const validationMixin = require('../../../util/validationMixin');
const inputRules = require('./common/rule.js');
const inputFilters = require('./common/filter.js');

const bowser = require('bowser');

/**
 * @class KLInput
 * @extend Component
 * @param {object}          [options.data]                    = 绑定属性
 * @param {string}          [options.data.value]              <=> 文本框的值
 * @param {string}          [options.data.type]               => 文本框的类型, 6种类型：int, float, char，password （email, url暂未实现），
 * @param {string}          [options.data.placeholder]        => 占位符
 * @param {number}          [options.data.maxlength]          => 文本框的最大长度
 * @param {string}          [options.data.unit]               => 单位
 * @param {boolean}         [options.data.clearable=false]    => 是否显示清空图标
 * @param {object[]}        [options.data.rules=[]]           => 验证规则
 * @param {boolean}         [options.data.autofocus=false]    => 是否自动获得焦点
 * @param {boolean}         [options.data.readonly=false]     => 是否只读
 * @param {boolean}         [options.data.disabled=false]     => 是否禁用
 * @param {boolean}         [options.data.visible=true]       => 是否显示
 * @param {string}          [options.data.class]              => 补充class
 * @param {number}          [options.data.decimalDigits]      => type=float时,最多输入几位小数的filter
 * @param {boolean}         [options.data.required]           => 【验证规则】是否必填
 * @param {boolean}         [options.data.hideTip=false]      => 是否显示校验错误信息
 * @param {number}          [options.data.min]                => 【验证规则】type=int/float时的最小值, type=char时，最小长度
 * @param {number}          [options.data.max]                => 【验证规则】type=int/float时的最大值, type=char时，最大长度
 * @param {string}          [options.data.message]            => 【验证规则】验证失败时，提示的消息
 * @param {string}          [options.data.size]               => 组件大小, sm/lg控制整体尺寸，smw/mdw/lgw控制宽度大小
 * @param {number}          [options.data.width]              => 组件宽度
 */
const KLInput = Component.extend({
  name: 'kl-input',
  template,
  config() {
    _.extend(this.data, {
      hideTip: false,
      value: '',
      type: 'char',
      placeholder: '',
      state: '',
      maxlength: undefined,
      unit: '',
      rules: [],
      autofocus: false,
      _eltIE9: bowser.msie && bowser.version <= 9,
      clearable: false,
    });
    this.rules({
      required: false,
      byteLen: this.data.type === 'char',
      isEmail: this.data.type === 'email',
      isURL: this.data.type === 'url',
      isInt: this.data.type === 'int',
      isFloat: this.data.type === 'float',
      message: '',
    });

    this.supr();

    this.initValidation();
  },
  init() {
    this.$watch('required', function (value) {
      if (value) {
        this.addRule('required');
      } else {
        this.data.rules = this.data.rules.filter(
          rule => rule.type !== 'isRequired',
        );
      }
    });
  },
  rules(ruleAttris) {
    this.supr(ruleAttris);
    const self = this;
    [
      'required',
      'isEmail',
      'isURL',
      'isFloat',
      'isInt',
      'byteLen',
    ].forEach((name) => {
      self.addRule(name);
    });
  },
  addRule(name) {
    const { min, max, message: _message, rules } = this.data;

    let message = _message;
    if (name === 'required') {
      message = message || this.$trans('PLEASE_INPUT');
    }

    if (!this.data[name]) {
      return;
    }
    const rule = inputRules[name];
    if (typeof rule === 'function') {
      rules.push(rule(min, max, message));
    } else {
      const ruleCopy = _.extend({}, rule);
      message && (ruleCopy.message = message);
      rules.push(ruleCopy);
    }
  },
  validate(on = '') {
    const { readonly, disabled } = this.data;
    // 如果是readonly或者disabled状态, 无需验证
    if (readonly || disabled) {
      return {
        success: true,
      };
    }

    const value =
      this.data.value || this.data.value === 0 ? `${this.data.value}` : '';
    let rules = this.data.rules;

    rules = rules.filter(rule => (rule.on || '').indexOf(on) >= 0);
    if (!rules.length) {
      return { success: true };
    }
    const result = Validation.validate(value, rules);
    if (
      result.firstRule &&
      !(
        result.firstRule.silentOn === true ||
        (typeof result.firstRule.silentOn === 'string' &&
          result.firstRule.silentOn.indexOf(on) >= 0)
      )
    ) {
      this.data.tip = result.firstRule.message;
    } else this.data.tip = '';

    // @TODO
    if (!result.success) this.data.state = 'error';
    else {
      this.data.state = '';
    }

    this.$emit('validate', {
      sender: this,
      on,
      result,
    });

    return result;
  },
  clear() {
    this.$update('value', '');
  },
  /* 1. type=char时,去除前后的空格; 2. type=int/float时, 只能输入对应类型的数字; */
  __valueFilter(_value) {
    const type = this.data.type;

    let value = _value;
    if (type !== 'char') value = `${value}`.trim();
    value = (inputFilters[type] || inputFilters.default)(
      value,
      this.data.decimalDigits,
    );
    return value;
  },
  _onKeyUp($event) {
    this.validate('keyup');
    /**
     * @event KLInput#keyup 原生keyup事件
     * @param {event} MouseEvent 点击的鼠标事件
     */
    this.$emit('keyup', $event);
  },
  _onBlur($event) {
    this.validate('blur');
    /**
     * @event KLInput#blur 原生blur事件
     * @param {event} MouseEvent 点击的鼠标事件
     */
    this.$emit('blur', $event);
  },
  _onFocus($event) {
    /**
     * @event KLInput#focus 原生focus事件
     * @param {event} MouseEvent 点击的鼠标事件
     */
    this.$emit('focus', $event);
  },
  _onChange($event) {
    this.validate('change');
    /**
     * @event KLInput#change 原生change事件
     * @param {event} KeyBoardEvent 点击的鼠标事件
     */
    this.$emit('change', $event);
  },
  _onInput($event) {
    this.validate('input');
    /**
     * @event KLInput#input 原生input事件
     * @param {event} KeyBoardEvent 点击的鼠标事件
     */
    this.$emit('input', $event);
  },
  _onSearch($event) {
    /**
     * @event KLInput#search 点击搜索图标时触发
     * @param {event} MouseEvent 点击的鼠标事件
     */
    this.$emit('search', $event);
  },
});

KLInput.filter('type', (val) => {
  if (['int', 'float'].indexOf(val) !== -1) {
    /* 这里不能是number, 因为number的话, 输入++++123这种获取到的值是空 */
    return 'text';
  } else if (val === 'password') {
    return 'password';
  }
  return 'text';
});

KLInput.filter({
  valueFilter: {
    get(val) {
      return this.__valueFilter(val);
    },
    set(val) {
      return this.__valueFilter(val);
    },
  },
});

KLInput.use(validationMixin);
module.exports = KLInput;
