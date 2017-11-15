/**
 * @file KLSidebar
 * @author   sensen(rainforest92@126.com)
 */

const Component = require('../../../ui-base/component');
const template = require('./index.html');

/**
 * @class KLSidebar
 * @extend Component
 * @param {object}        [options.data]                          => 绑定属性
 * @param {string}        [options.data.class]                    => 补充class
 * @param {array}         [options.data.menus]                    => 菜单数组
 * @param {string}        [options.data.top=60px]               => 菜单style top的值
 * @param {boolean}       [options.data.active=true]              => 默认是否收起
 * @param {string}        [options.data.bodyEl]                => 主内容区body元素的id,当菜单收起时,拉伸bodyEl
 * @param {boolean}       [options.data.uniqueOpened=true]        => 是否只保持打开一个菜单
 * @param {string}        [options.data.titleKey=title]           => 一级菜单的字段key名
 * @param {string}        [options.data.urlKey=url]             => 菜单结构中的链接key名
 * @param {string}        [options.data.routeKey=route]         => 单页spa应用时,使用
 * @param {string}        [options.data.pageKey=title]          => 二级菜单的字段key名
 * @param {string}        [options.data.childrenKey=children]   => 一级菜单对象下二级菜单数组的key名
 * @param {object}        [options.data.router]                   => 单页应用时, 请将regular-state的manager实例传入
 * @param {string}        [options.data.width]                    => sidebar的宽度设置,默认181px
 */
const KLSidebar = Component.extend({
  name: 'kl-sidebar',
  template,
  config() {
    this.defaults({
      class: '',
      uniqueOpened: true,
      menus: [],
      titleKey: 'title',
      urlKey: 'url',
      routeKey: 'route',
      pageKey: 'title',
      childrenKey: 'children',
      top: '60px',
      active: true,
      bodyEl: '',
      width: '181px',
    });

    this.supr();
  },
  initBodyEl() {
    if (this.data.bodyEl) {
      this.data.$bodyEl = document.getElementById(this.data.bodyEl);
      if (this.data.$bodyEl) {
        this.data.$bodyEl.style.transition = 'left .3s';
      }
    }
  },
  toggle() {
    this.initBodyEl();

    this.data.active = !this.data.active;
    const { width } = this.data;
    if (this.data.$bodyEl) {
      this.data.$bodyEl.style.left = this.data.active ? width : '0';
    }

    /**
     * @event KLSidebar#toggle 收缩菜单时触发
     * @property {boolean} active 展开还是收缩
     */
    this.$emit('toggle', this.data.active);
  },
  /**
   * @event KLSidebar#menuitem-click 选择某一页时触发
   * @property {object} menuitem 点击的menuItem实例
   */
  onMenuItemClick(e) {
    this.$emit('menuitem-click', e);
  },
});

module.exports = KLSidebar;
