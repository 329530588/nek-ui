/* eslint-disable */

import Component from '../../../../../ui-base/component';
import _ from '../../../../../ui-base/_';
import template from './index.html';


import KLDrop from '../../../../layout/KLDrop/index';
import KLDropHeader from '../../../../layout/KLDrop/KLDropHeader/index';
import KLDropMenu from '../../../../layout/KLDrop/KLDropMenu/index';

import DatePickerPanel from '../../panel/Date/date/index';
import DateRangePickerPanel from '../../panel/Date/date.range/index';

import {
    DEFAULT_FORMATS,
    RANGE_SEPARATOR,
    TYPE_VALUE_RESOLVER_MAP,
    getDayCountOfMonth,
} from '../../util';

import EventMixin from './mixins/event.mixin';

const findComponentsDownward = (context, componentName) => context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child);
    const foundChilds = findComponentsDownward(child, componentName);
    return components.concat(foundChilds);
}, []);

const prefixCls = 'ivu-date-picker';
const pickerPrefixCls = 'ivu-picker';

const isEmptyArray = val => val.reduce((isEmpty, str) => isEmpty && !str || (typeof str === 'string' && str.trim() === ''), true);

const keyValueMapper = {
    40: 'up',
    39: 'right',
    38: 'down',
    37: 'left',
};

const mapPossibleValues = (key, horizontal, vertical) => {
    if (key === 'left') return horizontal * -1;
    if (key === 'right') return horizontal * 1;
    if (key === 'up') return vertical * 1;
    if (key === 'down') return vertical * -1;
};

const pulseElement = (el) => {
    const pulseClass = 'ivu-date-picker-btn-pulse';
    el.classList.add(pulseClass);
    setTimeout(() => el.classList.remove(pulseClass), 200);
};

const extractTime = (date) => {
    if (!date) return [0, 0, 0];
    return [
        date.getHours(), date.getMinutes(), date.getSeconds(),
    ];
};


const KLNewDate = Component.extend({
    name: 'kl-new-date',
    template,
    config() {
        _.extend(this.data, {
            type: 'date',       // 显示类型，可选值为 date、daterange、datetime、datetimerange、year、month
            value: null,
            format: '',
            placement: 'bottom',
            placeholder: '',
            splitPanels: false,
            multiple: false,
            showWeekNumbers: false,
            startDate: null,
            confirm: false,
            open: false,
            size: 'default',            // 'small', 'large', 'default'
            disabled: false,
            clearable: true,
            readonly: false,
            editable: true,
            timePickerOptions: {},
            options: {},

            name: '',
            steps: [],

            prefixCls,
            showClose: false,
            isShow: false,

            disableClickOutSide: false,    // fixed when click a date,trigger clickoutside to close picker
            disableCloseUnderTransfer: false,  // transfer 模式下，点击Drop也会触发关闭,
            forceInputRerender: 1,
            isFocused: false,
            internalFocus: false,
        });
        this.initDate();
        this.supr();
    },
    initDate() {
        const isRange = this.data.type.includes('range');
        const emptyArray = isRange ? [null, null] : [null];
        const initialValue = isEmptyArray((isRange ? this.data.value : [this.data.value]) || []) ? emptyArray : this.parseDate(this.data.value);
        const focusedTime = initialValue.map(extractTime);

        this.data.internalValue = initialValue;
        this.data.selectionMode = this.onSelectionModeChange(this.data.type);
        this.data.focusedDate = initialValue[0] || this.data.startDate || new Date();
        this.data.focusedTime = {
            column: 0, // which column inside the picker
            picker: 0, // which picker
            time: focusedTime, // the values array into [hh, mm, ss],
            active: false,
        };


        // mounted
        // const initialValue = this.data.value;
        const parsedValue = this.data.publicVModelValue;
        if (typeof initialValue !== typeof parsedValue || JSON.stringify(initialValue) !== JSON.stringify(parsedValue)) {
            this.$emit('input', this.data.publicVModelValue); // to update v-model
        }
        if (this.data.open !== null) this.data.isShow = this.data.open;

        this.publicVModelValue();
        this.publicStringValue();
    },
    init() {
        this.supr();
        // to handle focus from confirm buttons
        this.$on('focus-input', () => this.focus());
        //
        // this.$watch('isShow', (state) => {
        //     if (state === false){
        //         this.$refs.drop.destroy();
        //     }
        //     this.$refs.drop.update();
        //     this.$emit('on-open-change', state);
        // });

        this.$watch('value', (val) => {
            this.data.internalValue = this.parseDate(val);
        });

        this.$watch('open', (val) => {
            this.data.isShow = val === true;
        });

        this.$watch('type', (type) => {
            this.onSelectionModeChange(type);
        });

        this.$watch('publicVModelValue', (now, before) => {
            const newValue = JSON.stringify(now);
            const oldValue = JSON.stringify(before);
            const shouldEmitInput = newValue !== oldValue || typeof now !== typeof before;
            if (shouldEmitInput) this.$emit('input', now); // to update v-model
        });
    },

    publicVModelValue() {
        const store = this.data;

        if (store.multiple) {
            return store.internalValue.slice();
        }
        const isRange = store.type.includes('range');
        let val = store.internalValue.map(date => date instanceof Date ? new Date(date) : (date || ''));

        if (store.type.match(/^time/)) {
            val = val.map(this.formatDate.bind(this));
        }

        this.data.publicVModelValue = (isRange || store.multiple) ? val : val[0];
        return (isRange || store.multiple) ? val : val[0];
    },

    publicStringValue() {
        const {publicVModelValue, type} = this.data;
        const formatDate = this.formatDate.bind(this);
        if (type.match(/^time/)) return publicVModelValue;
        if (this.data.multiple) return formatDate(publicVModelValue);
        this.data.publicStringValue = Array.isArray(publicVModelValue) ? publicVModelValue.map(formatDate) : formatDate(publicVModelValue);
        return Array.isArray(publicVModelValue) ? publicVModelValue.map(formatDate) : formatDate(publicVModelValue);
    },


    computed: {
        wrapperClasses() {
            const isFocusedCls = this.data.isFocused ? `${prefixCls}-focused` : '';
            return `${prefixCls} ${isFocusedCls}`;
        },
        opened() {
            return this.data.open === null ? this.data.isShow : this.data.open;
        },
        iconType() {
            let icon = 'ios-calendar-outline';
            if (this.data.type === 'time' || this.data.type === 'timerange') icon = 'ios-time-outline';
            if (this.data.showClose) icon = 'ios-close-circle';
            return icon;
        },
        transition() {
            const bottomPlaced = this.data.placement.match(/^bottom/);
            return bottomPlaced ? 'slide-up' : 'slide-down';
        },
        visualValue() {
            return this.formatDate(this.data.internalValue);
        },
        isConfirm() {
            return this.data.confirm || this.data.type === 'datetime' || this.data.type === 'datetimerange' || this.data.multiple;
        },
        ownPickerProps(){
            return this.data.options;
        }
    },
    // 开启 transfer 时，点击 Drop 即会关闭，这里不让其关闭
    // handleTransferClick() {
    //     if (this.data.transfer) this.data.disableCloseUnderTransfer = true;
    // },

    handleClose(e) {
        if (this.data.disableCloseUnderTransfer) {
            this.data.disableCloseUnderTransfer = false;
            return false;
        }

        if (e && e.type === 'mousedown' && this.data.isShow) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (this.data.isShow) {
            const pickerPanel = this.$refs.pickerPanel && this.$refs.pickerPanel.$el;
            if (e && pickerPanel && pickerPanel.contains(e.target)) return; // its a click inside own component, lets ignore it.

            this.data.isShow = false;
            e && e.preventDefault();
            e && e.stopPropagation();
            return;
        }

        this.data.isFocused = false;
        this.data.disableClickOutSide = false;
    },
    handleFocus(e) {
        if (this.data.readonly) return;
        this.data.isFocused = true;
        if (e && e.type === 'focus') return; // just focus, don't open yet
        this.data.isShow = true;
    },
    handleBlur(e) {
        const store = this.data;

        if (store.internalFocus) {
            store.internalFocus = false;
            return;
        }
        if (store.isShow) {
            e.preventDefault();
            return;
        }

        store.isFocused = false;
        this.onSelectionModeChange(store.type);
        store.internalValue = store.internalValue.slice(); // trigger panel watchers to reset views
        this.reset();
        this.$refs.pickerPanel.onToggleVisibility(false);
    },
    handleKeydown(e) {
        const store = this.data;
        const keyCode = e.keyCode;

        // handle "tab" key
        if (keyCode === 9) {
            if (store.isShow) {
                e.stopPropagation();
                e.preventDefault();

                if (store.isConfirm) {
                    const selector = `.${pickerPrefixCls}-confirm > *`;
                    const tabbable = this.$refs.drop.$el.querySelectorAll(selector);
                    store.internalFocus = true;
                    const element = [...tabbable][e.shiftKey ? 'pop' : 'shift']();
                    element.focus();
                } else {
                    this.handleClose();
                }
            } else {
                store.focused = false;
            }
        }

        // open the panel
        const arrows = [37, 38, 39, 40];
        if (!store.isShow && arrows.includes(keyCode)) {
            store.isShow = true;
            return;
        }

        // close on "esc" key
        if (keyCode === 27) {
            if (store.isShow) {
                e.stopPropagation();
                this.handleClose();
            }
        }

        // select date, "Enter" key
        if (keyCode === 13) {
            const timePickers = findComponentsDownward(this, 'TimeSpinner');
            if (timePickers.length > 0) {
                const columnsPerPicker = timePickers[0].showSeconds ? 3 : 2;
                const pickerIndex = Math.floor(store.focusedTime.column / columnsPerPicker);
                const value = store.focusedTime.time[pickerIndex];

                timePickers[pickerIndex].chooseValue(value);
                return;
            }

            if (store.type.match(/range/)) {
                this.$refs.pickerPanel.handleRangePick(store.focusedDate, 'date');
            } else {
                const panels = findComponentsDownward(this, 'PanelTable');
                const compareDate = (d) => {
                    const sliceIndex = ['year', 'month', 'date'].indexOf((store.type)) + 1;
                    return [d.getFullYear(), d.getMonth(), d.getDate()].slice(0, sliceIndex).join('-');
                };
                const dateIsValid = panels.find(({cells}) => cells.find(({date, disabled}) => compareDate(date) === compareDate(store.focusedDate) && !disabled));
                if (dateIsValid) this.onPick(store.focusedDate, false, 'date');
            }
        }

        if (!arrows.includes(keyCode)) return; // ignore rest of keys

        // navigate times and dates
        if (store.focusedTime.active) e.preventDefault(); // to prevent cursor from moving
        this.navigateDatePanel(keyValueMapper[keyCode], e.shiftKey);
    },
    reset() {
        // this.$refs.pickerPanel.reset && this.$refs.pickerPanel.reset();
    },
    navigateTimePanel(direction) {
        const store = this.data;
        store.focusedTime.active = true;
        const horizontal = direction.match(/left|right/);
        const vertical = direction.match(/up|down/);
        const timePickers = findComponentsDownward(this, 'TimeSpinner');

        const maxNrOfColumns = (timePickers[0].showSeconds ? 3 : 2) * timePickers.length;
        const column = ((currentColumn) => {
            const incremented = currentColumn + (horizontal ? (direction === 'left' ? -1 : 1) : 0);
            return (incremented + maxNrOfColumns) % maxNrOfColumns;
        })(store.focusedTime.column);

        const columnsPerPicker = maxNrOfColumns / timePickers.length;
        const pickerIndex = Math.floor(column / columnsPerPicker);
        const col = column % columnsPerPicker;


        if (horizontal) {
            const time = store.internalValue.map(extractTime);

            store.focusedTime = {
                ...store.focusedTime,
                column,
                time,
            };
            timePickers.forEach((instance, i) => {
                if (i === pickerIndex) instance.updateFocusedTime(col, time[pickerIndex]);
                else instance.updateFocusedTime(-1, instance.focusedTime);
            });
        }

        if (vertical) {
            const increment = direction === 'up' ? 1 : -1;
            const timeParts = ['hours', 'minutes', 'seconds'];


            const pickerPossibleValues = timePickers[pickerIndex][`${timeParts[col]}List`];
            const nextIndex = pickerPossibleValues.findIndex(({text}) => store.focusedTime.time[pickerIndex][col] === text) + increment;
            const nextValue = pickerPossibleValues[nextIndex % pickerPossibleValues.length].text;
            const times = store.focusedTime.time.map((time, i) => {
                if (i !== pickerIndex) return time;
                time[col] = nextValue;
                return time;
            });
            store.focusedTime = {
                ...store.focusedTime,
                time: times,
            };

            timePickers.forEach((instance, i) => {
                if (i === pickerIndex) instance.updateFocusedTime(col, times[i]);
                else instance.updateFocusedTime(-1, instance.focusedTime);
            });
        }
    },
    navigateDatePanel(direction, shift) {
        const store = this.data;

        const timePickers = findComponentsDownward(this, 'TimeSpinner');
        if (timePickers.length > 0) {
            // we are in TimePicker mode
            this.navigateTimePanel(direction, shift, timePickers);
            return;
        }

        if (shift) {
            if (store.type === 'year') {
                store.focusedDate = new Date(
                    store.focusedDate.getFullYear() + mapPossibleValues(direction, 0, 10),
                    store.focusedDate.getMonth(),
                    store.focusedDate.getDate(),
                );
            } else {
                store.focusedDate = new Date(
                    store.focusedDate.getFullYear() + mapPossibleValues(direction, 0, 1),
                    store.focusedDate.getMonth() + mapPossibleValues(direction, 1, 0),
                    store.focusedDate.getDate(),
                );
            }

            const position = direction.match(/left|down/) ? 'prev' : 'next';
            const double = direction.match(/up|down/) ? '-double' : '';

            // pulse button
            const button = this.$refs.drop.$el.querySelector(`.ivu-date-picker-${position}-btn-arrow${double}`);
            if (button) pulseElement(button);
            return;
        }

        const initialDate = store.focusedDate || (store.internalValue && store.internalValue[0]) || new Date();
        const focusedDate = new Date(initialDate);

        if (store.type.match(/^date/)) {
            const lastOfMonth = getDayCountOfMonth(initialDate.getFullYear(), initialDate.getMonth());
            const startDay = initialDate.getDate();
            const nextDay = focusedDate.getDate() + mapPossibleValues(direction, 1, 7);

            if (nextDay < 1) {
                if (direction.match(/left|right/)) {
                    focusedDate.setMonth(focusedDate.getMonth() + 1);
                    focusedDate.setDate(nextDay);
                } else {
                    focusedDate.setDate(startDay + Math.floor((lastOfMonth - startDay) / 7) * 7);
                }
            } else if (nextDay > lastOfMonth) {
                if (direction.match(/left|right/)) {
                    focusedDate.setMonth(focusedDate.getMonth() - 1);
                    focusedDate.setDate(nextDay);
                } else {
                    focusedDate.setDate(startDay % 7);
                }
            } else {
                focusedDate.setDate(nextDay);
            }
        }

        if (store.type.match(/^month/)) {
            focusedDate.setMonth(focusedDate.getMonth() + mapPossibleValues(direction, 1, 3));
        }

        if (store.type.match(/^year/)) {
            focusedDate.setFullYear(focusedDate.getFullYear() + mapPossibleValues(direction, 1, 3));
        }

        store.focusedDate = focusedDate;
    },
    handleInputChange(event) {
        const store = this.data;

        const isArrayValue = store.type.includes('range') || store.multiple;
        const oldValue = store.visualValue;
        const newValue = event.target.value;
        const newDate = this.parseDate(newValue);
        const disabledDateFn =
            store.options &&
            typeof store.options.disabledDate === 'function' &&
            store.options.disabledDate;
        const valueToTest = isArrayValue ? newDate : newDate[0];
        const isDisabled = disabledDateFn && disabledDateFn(valueToTest);
        const isValidDate = newDate.reduce((valid, date) => valid && date instanceof Date, true);

        if (newValue !== oldValue && !isDisabled && isValidDate) {
            this.emitChange(store.type);
            store.internalValue = newDate;
        } else {
            store.forceInputRerender++;
        }
    },
    handleInputMouseenter() {
        const store = this.data;

        if (store.readonly || store.disabled) return;
        if (store.visualValue && store.clearable) {
            store.showClose = true;
        }
    },
    handleInputMouseleave() {
        this.data.showClose = false;
    },
    handleIconClick() {
        const store = this.data;

        if (store.showClose) {
            // this.handleClear();
        } else if (!store.disabled) {
            this.handleFocus();
        }
    },
    parseDate(val) {
        const store = this.data;

        const isRange = store.type.includes('range');
        const type = store.type;
        const parser = (
            TYPE_VALUE_RESOLVER_MAP[type] ||
            TYPE_VALUE_RESOLVER_MAP.default
        ).parser;
        const format = store.format || DEFAULT_FORMATS[type];
        const multipleParser = TYPE_VALUE_RESOLVER_MAP.multiple.parser;

        if (val && type === 'time' && !(val instanceof Date)) {
            val = parser(val, format);
        } else if (store.multiple && val) {
            val = multipleParser(val, format);
        } else if (isRange) {
            if (!val) {
                val = [null, null];
            } else if (typeof val === 'string') {
                val = parser(val, format);
            } else if (type === 'timerange') {
                val = parser(val, format).map(v => v || '');
            } else {
                const [start, end] = val;
                if (start instanceof Date && end instanceof Date) {
                    val = val.map(date => new Date(date));
                } else if (typeof start === 'string' && typeof end === 'string') {
                    val = parser(val.join(RANGE_SEPARATOR), format);
                } else if (!start || !end) {
                    val = [null, null];
                }
            }
        } else if (typeof val === 'string' && type.indexOf('time') !== 0) {
            val = parser(val, format) || null;
        }
        return (isRange || store.multiple) ? (val || []) : [val];
    },
    formatDate(value) {
        const store = this.data;

        const format = DEFAULT_FORMATS[store.type];

        if (store.multiple) {
            const formatter = TYPE_VALUE_RESOLVER_MAP.multiple.formatter;
            return formatter(value, store.format || format);
        }
        const {formatter} = (
            TYPE_VALUE_RESOLVER_MAP[store.type] ||
            TYPE_VALUE_RESOLVER_MAP.default
        );
        return formatter(value, store.format || format);
    },
    focus() {
        this.$refs.input && this.$refs.input.focus();
    },
})
    .use(EventMixin);

module.exports = KLNewDate;
