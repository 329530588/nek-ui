/**
 * ------------------------------------------------------------
 * KLSteps     步骤条
 * @author   ziane(zianecui@gmail.com)
 * ------------------------------------------------------------
 */

const Component = require('../../../ui-base/component');
const template = require('./index.html');
const _ = require('../../../ui-base/_');

/**
 * @class KLSteps
 * @extend Component
 * @param {object}      [options.data]                = 绑定属性
 * @param {object}      [options.data.steps=null]     <=> 类似于kl-select的source
 * @param {string}      [options.data.current=null]   <=> 当前状态
 * @param {boolean}     [options.data.size=false]     =>  当前尺寸
 */
const KLSteps = Component.extend({
  name: 'kl-steps',
  template,
  /**
     * @protected
     */
  config() {
    _.extend(this.data, {
      steps: [],
      current: 0,
      size: '',
      currentIndex: 0,
    });
    this.supr();
  },
  init() {
    this.supr();
    this.$watch('current', function (newValue, oldValue) {
      this.juedgeFinishedItem();
    });
  },
  juedgeFinishedItem() {
    const data = this.data;
    const current = data.current;
    const steps = data.steps;

    steps.forEach((item, index) => {
      if (item.status == current) {
        data.currentIndex = index;
      }
    });
  },
});

module.exports = KLSteps;
