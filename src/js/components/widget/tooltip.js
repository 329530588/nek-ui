/**
 * ------------------------------------------------------------
 * Tooltip     提示
 * @author   ziane(zianecui@gmail.com)
 * ------------------------------------------------------------
 */

'use strict';

var TipContent = require('./tip.content.js');
var Component = require("../../ui-base/component.js");
var template = require('./tooltip.html');
var dom = require('regularjs').dom;
var _ = require('../../ui-base/_.js');

/**
 * @class Tooltip
 * @extend Component
 * @param {object}                  options.data                     =  绑定属性
 * @param {string=''}               options.data.tip                 => 文字提示
 * @param {string='tr'}             options.data.placement           => tips展示出的位置：四个值，tr,tl,br,bl
 */
var Tooltip = Component.extend({
    name: 'tooltip',
    template: template,
    config: function (data) {
        _.extend(data, {
            placement: 'tr',
            isHide: false,
            domAttr: {},
            offSetStyle: ''
        });
        this.supr(data);
    },
    enter: function($event) {
        var elem = $event.target;
        var placement = this.data.placement;
        var innerHeight = window.innerHeight;
        var innerWidth = window.innerWidth;
        var newValue = {}

        newValue.offsetTop = elem.offsetTop;
        newValue.offsetLeft = elem.offsetLeft;
        newValue.clientWidth = elem.clientWidth;
        newValue.clientHeight = elem.clientHeight;

        if (placement == 'tr') {
            this.data.offSetStyle = 'left:' + newValue.offsetLeft + 'px' + ';bottom:' + (innerHeight - newValue.offsetTop + 10) + 'px;';
        }

        if (placement == 'tl') {
            this.data.offSetStyle = 'right:' + (innerWidth - newValue.offsetLeft - newValue.clientWidth) + 'px' + ';bottom:' + (innerHeight - newValue.offsetTop + 10) + 'px;';
        }

        if (placement == 'bl') {
            this.data.offSetStyle = 'right:' + (innerWidth - newValue.offsetLeft - newValue.clientWidth) + 'px' + ';top:' + (newValue.offsetTop + newValue.clientHeight + 10) + 'px;';
        }

        if (placement == 'br') {
            this.data.offSetStyle = 'left:' + newValue.offsetLeft + 'px' + ';top:' + (newValue.offsetTop + newValue.clientHeight + 10) + 'px;';
        }


        var placement = {
            tl: 'arrow-tl',
            tr: 'arrow-tr',
            bl: 'arrow-bl',
            br: 'arrow-br'
        };
        this._content = new TipContent({
            data:{
                tip: this.data.tip,
                isHide: this.data.isHide,
                offSetStyle: this.data.offSetStyle,
                arrow: placement[this.data.placement]
            }
        });
    },
    leave: function() {
        this._content.destroy();
    }
});

module.exports = Tooltip;
