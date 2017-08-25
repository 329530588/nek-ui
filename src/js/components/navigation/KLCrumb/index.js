/**
 * @file KLCrumb 面包屑
 * @author   zianecui@gmail.com
 */

const Component = require('../../../ui-base/component');
const template = require('./index.html');
const _ = require('../../../ui-base/_');

/**
 * @class KLCrumb
 * @extend Component
 * @param {object}          [options.data]                     = 绑定属性
 * @param {string}          [options.data.class]               => 补充class
 * @param {string}          [options.data.separator]           => 分隔符，支持模板
 * @param {string}          [options.data.href]                => 传入的链接
 */

/**
 * @class KLCrumbItem
 * @extend Component
 * @param {object}          [options.data]                    = 绑定属性
 * @param {string}          [options.data.content]            => 内容模板
 * @param {string}          [options.data.class]              => 补充class
 * @param {string}          [options.data.href]                => 传入的链接
 */

const KLCrumb = Component.extend({
  name: 'kl-crumb',
  template,
  config() {
    _.extend(this.data, {
      separator: '/',
      crumbArr: [],
    });
    this.supr();
  },
});

module.exports = KLCrumb;
