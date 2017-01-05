'use strict';

var _ = require('../../../ui-base/_');
var ajax = require('../../../ui-base/ajax');
var Validation = require('../../../util/validation');

var template = require('./index.html');

/**
 * @class UIForm
 * @extend Validation
 * @param {object}                  options.data                     =  绑定属性
 * @param {string=''}               options.data.service             => 全站异步获取source的接口地址
 * @param {string=''}               options.data.class               => 扩展样式
 * @param {string='data'}           options.data.sourcePath          => 获取到select数据后,读取json数据的路径
 */
var UIForm = Validation.extend({
    name: 'ui.form',
    template: template,
    config: function (data) {
        this.selectors = [];

        _.extend(data, {
            service: null,
            sourcePath: 'data',
            class: ''
        });
        this.supr(data);
    },
    init: function() {
        this.initSelectorSource();
    },
    initSelectorSource: function() {
        var controls = this.controls;
        this.selectors = controls.filter(function($formitem) {
            return !!$formitem.data.sourceKey;
        });

        if (!this.data.service || !this.selectors.length) { return; }

        this.__reqSource();
    },
    __getSourceKeys: function() {
        return this.selectors.map(function($formitem) {
            return $formitem.data.sourceKey;
        })
    },
    __reqSource: function() {
        var keys = this.__getSourceKeys();

        window.NEKSelects = window.NEKSelects || {};
        keys = keys.filter(function(key) { return !window.NEKSelects[key]; });

        this.selectors.forEach(function($formitem) {
            var key = $formitem.data.sourceKey;
            var source = window.NEKSelects[key] || [];
            this.__updateSource($formitem, key, source);
        }.bind(this));


        if (!keys.length) { return; }
        this.keys = keys;
        ajax.request({
            url: this.data.service,
            method: 'get',
            type: 'json',
            data: {
                keys:keys.join(',')
            },
            success: this.__cbReqSource.bind(this)
        })
    },
    __cbReqSource: function(json) {
        var keys = this.keys,
            path = this.data.sourcePath,
            result = path === '' ? json : json[path];

        result = result || {};

        this.selectors.forEach(function($formitem) {
            var key = $formitem.data.sourceKey;
            var source = result[key] || [];
            this.__updateSource($formitem, key, source);
        }.bind(this));
    },
    __updateSource: function($formitem, key, source) {
        var $selectItem = $formitem.controls[0];
        window.NEKSelects[key] = _.clone(source);

        /* 三种情况不给组件赋值:1. form.item下面没有选项组件; 2. source为空 3. 选项组件的source属性已经有值 */
        if (!$selectItem || !source.length || $selectItem.data.source.length) return;
        $selectItem.data.source =  _.clone(source);
    }
});

module.exports = UIForm;