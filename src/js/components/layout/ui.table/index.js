'use strict';

var TableHeader = require('./table.header');
var TableBody = require('./table.body');
var TableCol = require('./table.col');
var TableTemplate = require('./table.template');
var _ = require('../../../ui-base/_');
var utils = require('./utils');

var Component = require('../../../ui-base/component');
var tpl = require('./index.html');

var getLeaves = function(columns) {
    var res = [];
    var extractLeaves = function(columns) {
        if(columns.forEach) {
            return columns.forEach(function(item) {
                if(item.children && item.children.length > 0) {
                    extractLeaves(item.children);
                } else {
                    res.push(item);
                }
            });
        }
    };
    extractLeaves(columns);
    return res;
};

var getNum = function(str) {
    return +((str+'').split('px')[0]);
};

var setElementValue = function(ele, prop, val) {
    if(ele) {
        ele[prop] = val;
    }
};

var getElementHeight = function(ele) {
    var computedStyle = window.getComputedStyle(ele);
    var height = getNum(computedStyle.marginTop)
            + getNum(computedStyle.borderTopWidth)
            + getNum(ele.offsetHeight)
            + getNum(computedStyle.borderBottomWidth)
            + getNum(computedStyle.marginBottom);
    return height;
}

var UITable = Component.extend({
    name: 'ui.table',
    template: tpl,
    computed: {
        bodyHeight: {
            get: function() {
                var data = this.data;
                if(data.height != undefined && data.headerHeight != undefined) {
                    return +data.height - data.headerHeight;
                }
            },
            set: function(val) {
                return this.data.bodyHeight = val;
            }
        }
    },
    config: function(data) {
        this.defaults({
            enableHover: true,
            scrollYBar: 0,
            scrollXBar: 0,

            show: true,
            columns: [],
            sorting: {},
            config: {},
            _scrollBarTimer: null
        });
        this.supr(data);

        this._initWatchers();
    },
    _initWatchers: function() {
        this.$watch('scrollYBar', this._onScrollYBarChange);
        this.$watch('columns', this._onColumnsChange);
        this.$watch('source', this._onSouceChange)

        this._onBodyScroll = utils.throttle(this._onBodyScroll.bind(this), 16);

        this._onScroll = utils.throttle(this._onScroll.bind(this), 200);
        window.document.addEventListener('scroll', this._onScroll);

        this._onWindowResize = utils.throttle(this._onWindowResize.bind(this), 200);
        window.addEventListener('resize', this._onWindowResize);

        this._watchWidthChange();
    },
    _onScroll: function() {
        if(!this.$refs || !this._isShow()) {
            return;
        }
        this._updateSticky();
    },
    _onSouceChange: function() {
        setTimeout(function() {
            this._updateSticky();
        }.bind(this), 500)
    },
    _updateSticky: function() {
        var data = this.data;
        if(!data.stickyHeader && !data.stickyFooter) {
            return;
        }

        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var tableRect = this.$refs.tableWrap.getBoundingClientRect();
        var tableWrapOffset = {
            top: tableRect.top + scrollTop,
            bottom: tableRect.bottom + scrollTop
        };

        if(data.stickyHeader && tableWrapOffset) {
            this._updateStickyHeaderStatus(tableWrapOffset);
        }

        if(data.stickyFooter && tableWrapOffset) {
            this._updateStickyFooterStatus(tableWrapOffset);
        }
    },
    _updateStickyHeaderStatus: function(tableWrapOffset) {
        var headerHeight = this._getHeaderHeight();
        var scrollY = window.scrollY;
        var stickyActive = false;

        if(scrollY + headerHeight > tableWrapOffset.bottom
            || scrollY < tableWrapOffset.top
        ) {
            stickyActive = false;
        } else if(scrollY > tableWrapOffset.top) {
            stickyActive = true;
        }

        if(stickyActive !== this.data.stickyHeaderActive) {
            this.$update('stickyHeaderActive ', stickyActive);
        }
    },
    _updateStickyFooterStatus: function(tableWrapOffset) {
        var headerHeight = this._getHeaderHeight();
        var footerHeight = this._getFooterHeight();
        var scrollY = window.scrollY;
        var innerHeight = window.innerHeight;
        var scrollYBottom = scrollY + innerHeight;
        var stickyActive = false;

        if(scrollYBottom > tableWrapOffset.bottom + footerHeight
            || scrollYBottom < tableWrapOffset.top + headerHeight + 20
        ) {
            stickyActive = false;
        } else {
            stickyActive = true;
        }

        if(stickyActive !== this.data.stickyFooterActive) {
            this.$update('stickyFooterActive', stickyActive);
        }
    },
    _watchWidthChange: function() {
        this.data._widthTimer = setInterval(function() {
            if(!this._isShow()) {
                return;
            }
            this._updateScrollBar();
            this._updateColumnsWidth();
            this._updateFixedColumnWidth();
        }.bind(this), 300);
    },
    _updateScrollBar: function() {
        var data = this.data;
        var tableWrap = this.$refs.bodyWrap;
        if(!tableWrap) {
            return;
        }

        var yBarWidth = tableWrap.offsetWidth - tableWrap.clientWidth;
        var xBarWidth = tableWrap.offsetHeight - tableWrap.clientHeight;

        if(data.scrollYBar !== yBarWidth) {
            this.$update('scrollYBar', yBarWidth);
        }
        if(data.scrollXBar !== xBarWidth) {
            this.$update('scrollXBar', xBarWidth);
        }
    },
    _onScrollYBarChange: function(newVal, oldVal) {
        if(oldVal === undefined) {
            return;
        }
        this._updateTableWidth();
    },
    _onColumnsChange: function(newVal) {
        if(newVal) {
            this._updateDataColumn();
        }
    },
    _updateDataColumn: function() {
        this.data._dataColumns = getLeaves(this.data.columns);
    },
    init: function() {
        this._initTable();
    },
    _initTable: function() {
        var data = this.data;
        var refs = this.$refs;
        setTimeout(function() {
            data.headerHeight = refs.headerWrap.offsetHeight;
            data.viewWidth = refs.table.offsetWidth;

            this._initTableWidth();
            this._getHeaderHeight();
        }.bind(this), 200);
    },
    _updateTableWidth: function() {
        this._updateColumnsWidth();
        this._updateFixedColumnWidth();
    },
    _initTableWidth: function() {
        var data = this.data;
        var _dataColumns = data._dataColumns;
        if(!_dataColumns) {
            return;
        }

        var tableWidth = this.$refs.table.clientWidth;
        var customWidthCount = 0;
        var customColumnWidthTotal = _dataColumns.reduce(function(previous, current) {
            var width = parseInt(current.width);
            if(width) {
                customWidthCount++;
                return previous + width;
            }
            return previous;
        }, 0);

        var tableViewWidth = tableWidth - data.scrollYBar;
        var autoWidth = Math.floor((tableViewWidth-customColumnWidthTotal) / (_dataColumns.length-customWidthCount));
        autoWidth = autoWidth >= 0 ? autoWidth : 100;

        var totalWidth = 0;
        _dataColumns.forEach(function(dataColumn) {
            dataColumn._width = parseInt(dataColumn.width || autoWidth);
            totalWidth += dataColumn._width;
            return dataColumn;
        });
        data.tableWidth = totalWidth;
        this.$update();
    },
    _getHeaderHeight: function() {
        var headerHeight = getElementHeight(this.$refs.headerWrap);
        if(this.data.headerHeight !== headerHeight) {
            this.data.headerHeight = headerHeight;
        }
        return headerHeight;
    },
    _getFooterHeight: function() {
        var footerHeight = getElementHeight(this.$refs.footerWrap);
        if(this.data.footerHeight !== footerHeight) {
           this.data.footerHeight = footerHeight;
        }
        return footerHeight;
    },
    _updateColumnsWidth: function() {
        var data = this.data;
        var _dataColumns = data._dataColumns;
        if(!_dataColumns) {
            return;
        }
        var newTableWidth = _dataColumns.reduce(function(previous, current) {
            return previous + current._width;
        }, 0);

        _dataColumns.forEach(function(column) {
            if(!column._width) {
                column._width = column.width || 100;
            }
        });

        if(data.tableWidth !== newTableWidth) {
            this.$update('tableWidth', newTableWidth);
        }
    },
    _updateFixedColumnWidth: function() {
        var data = this.data;
        if(!data._dataColumns
            || (!this.$refs.table && this.$refs.table.clientWidth <= 0)) {
            return;
        }

        var fixedCol = false;
        var fixedColRight = false;
        var fixedTableWidth = 0;
        var fixedTableWidthRight = 0;
        data._dataColumns.forEach(function(item) {
            if(item._width && item.fixed) {
                if(item.fixed === 'right') {
                    fixedColRight = true;
                    fixedTableWidthRight += item._width;
                } else {
                    fixedCol = true;
                    fixedTableWidth += item._width;
                }
            }
        });

        data.fixedTableWidth = fixedTableWidth;
        data.fixedTableWidthRight = fixedTableWidthRight;
        data.fixedCol = fixedCol;
        data.fixedColRight = fixedColRight;
    },
    _onWindowResize: function() {
        if(!this.$refs || !this._isShow()) {
            return;
        }
        this.$update('viewWidth', this.$refs.table.offsetWidth);
    },
    _onBodyScroll: function(host) {
        if(!this._isShow()) {
            return;
        }
        var $refs = this.$refs;

        setElementValue($refs.bodyWrapFixed, 'scrollTop', host.scrollTop);
        setElementValue($refs.bodyWrapFixedRight, 'scrollTop', host.scrollTop);
        setElementValue($refs.headerWrap, 'scrollLeft', host.scrollLeft);
        setElementValue($refs.bodyWrap, 'scrollLeft', host.scrollLeft);
    },
    _onSort: function(e) {
        this.$emit('sort', e);
    },
    _onCustomEvent: function(e) {
        this.$emit(e.type, _.extend({
            sender: this,
            custom: true
        }, e.args));
    },
    _onItemCheckChange: function(e) {
        this.$emit('checkchange', {
            sender: this,
            item: e.item,
            checked: e.checked,
            checkedEvent: e.event
        });
    },
    emitEvent: function(type) {
        var args = [].slice.call(arguments, 1);
        this.$emit(type, {
            custom: true,
            sender: this,
            param: args
        });
    },
    _onExpand: function(e) {
        this.$emit('expand', {
            sender: this,
            expand: e.expand,
            item: e.item,
            itemIndex: e.itemIndex,
            column: e.column
        });
    },
    _onPaging: function(e) {
        console.log(e);
    },
    _onFixedExpand: function(e) {
        this.$refs.tableBody._onExpand(e.item, e.itemIndex, e.column);
    },
    _isShow: function() {
        return this.data.show;
    },
    destroy: function() {
        this.removeEventListener();
        this.supr();
    },
    removeEventListener: function() {
        clearInterval(this.data._widthTimer);
        window.document.removeEventListener('scroll', this._onScroll);
        window.removeEventListener('resize', this._onWindowResize);
    }
})
.component('table.header', TableHeader)
.component('table.body', TableBody)
.component('table.col', TableCol)
.component('table.template', TableTemplate);

module.exports = UITable;

