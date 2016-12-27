/**
 * ------------------------------------------------------------
 * ui.button  按钮
 * @author   Cody Chan<int64ago@gmail.com>
 * ------------------------------------------------------------
 */

'use strict';

var Component = require('../../ui-base/component.js');
var template = require('./ui.button.html');
var _ = require('../../ui-base/_.js');

/**
 * @class Input
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {string='点我'}            options.data.title               => 按钮标题
 * @param {string='default'}        options.data.type                => 按钮样式, primary, default, info, success, warn, error
 * @param {string='normal'}         options.data.size                => 按钮大小, xs, sm, lg, xl
 * @param {string=''}               options.data.icon                => 按钮图标,action不能满足需求时使用;
 * @param {string=''}               options.data.action              => 按钮操作类型, 每种类型有对应的icon;
 * @param {string=''}               options.data.link                => 按钮的链接
 * @param {string='_self'}          options.data.target              => 按钮链接的打开方式
 * @param {string=''}               options.data.shape               => circle或者默认
 * @param {boolean='false'}         options.data.loading             => 是否正在加载
 * @param {boolean='false'}         options.data.class               => 样式扩展
 */
var actionIcons= {
  /* 查看 */
  view: 'eye',
  /* 发送 */
  send: 'send-o',
  /* 撤销 */
  undo: 'reply-all',
  /* 取消 */
  cancel: 'arrow-circle-left',
  /* 删除 */
  remove: 'trash-o',
  /* 更新 */
  update: 'refresh',
  /* 提交 */
  submit: 'legal',
  /* 保存 */
  save: 'save',
  /* 复制 */
  copy: 'copy',
  /* 通过 */
  pass: 'thumbs-up',
  /* 驳回 */
  reject: 'thumbs-down',
  /* 返回 */
  backward: 'angle-double-left',
  /* 下载 */
  download: 'download',
  /* 上传 */
  upload: 'upload',
  /* 查询 */
  search: 'search',
  /* 编辑 */
  edit: 'edit',
  /* 添加 */
  add: 'plus-square',
  /* 链接 */
  link: 'link'
};


var UIButton = Component.extend({
    name: 'ui.button',
    template: template,
    config: function() {
        _.extend(this.data, {
            title: '点我',
            type: 'default',
            size: 'normal',
            icon: '',
            loading: false,
            actionIcons: actionIcons,
            target: '_self'
        });
        this.supr();
    },
    onClick: function(e) {
      var loading = this.data.loading;
      if (!loading) {
        this.$emit('click', e);
      }
      return !!this.data.link;
    }
});

module.exports = UIButton;
