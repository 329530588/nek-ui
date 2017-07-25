/**
 *  ------------------------------
 *  UploadCard 上传
 *  ------------------------------
 */

const _ = require('../../../../../ui-base/_');
const utils = require('../../utils');
const FileUnit = require('../FileUnit');
const UploadBase = require('../UploadBase');
const KLImagePreview = require('../KLImagePreview');
const tpl = require('./index.html');

/**
 * @class UploadCard
 * @extend UploadBase
 */

const UploadCard = UploadBase.extend({
  name: 'upload-card',
  template: tpl.replace(/([>}])\s*([<{])/g, '$1$2'),
  config(data) {
    this.supr(data);
    
    _.extend(data, {
      status: 'uploaded',
      info: '',
      numPerline: 5,
      fileUnitWidth: 50,
      fileUnitMargin: 25,
      fileUnitListPadding: 22
    });
  },

  init(data) {
    this.initFilesZone(data);
    
    this.supr(data);
  },

  initFilesZone(data) {
    const fileUnitWidth = data.fileUnitWidth;
    const fileUnitMargin = data.fileUnitMargin;
    let numPerline = data.numPerline;

    if (!isFinite(numPerline)) {
      data.numPerline = 5;
      numPerline = data.numPerline;
    }
    
    data.filesWrapper = this.$refs.fileswrapper;
    data.fileUnitListWidth = (fileUnitWidth * numPerline) + (fileUnitMargin * (numPerline - 1));
  },

  handleFiles(files) {
    const self = this;
    const data = this.data;
    let fileunit;

    this.toggle(false);

    const options = this.setOptions(data);

    data.preCheckInfo = '';

    files = [].slice.call(files);
    files.forEach(function(file) {
      if (data.fileUnitList.length < data.numLimit) {
        data.preCheckInfo = self.preCheck(file);
        if (!data.preCheckInfo) {
          fileunit = self.createFileUnit({
            file,
            options
          });
          fileunit.flag = 'ADDED';
          data.fileUnitList.push({
            inst: fileunit,
            uid: utils.genUid()
          });
          self.updateFilesZone();
        }
      }
    });

    this.updateList();
  },

  updateFilesZone() {
    const data = this.data;
    const filesZone = this.$refs.fileszone;
    const entryWrapper = this.$refs.entrywrapper;
    const inputWrapper = this.$refs.inputwrapper;

    if (data.fileUnitList.length < data.numLimit) {
      filesZone.style.width = '125px';
      entryWrapper.style['margin-right'] = '20px';
      inputWrapper.style.display = 'inline-block';
    } else if (data.fileUnitList.length === data.numLimit) {
      filesZone.style.width = '50px';
      entryWrapper.style['margin-right'] = '0';
      inputWrapper.style.display = 'none';
    }
  },

  createFileUnit(data) {
    const self = this;
    const fileunit = new FileUnit({ data });

    fileunit.$on('preview', previewCb);

    function previewCb() {
      const current = this;

      function filterImgFile(file) {
        return file.inst.data.type === 'IMAGE';
      }

      function mapCurrentFlag(img) {
        if (current === img.inst) {
          img.inst.current = true;
        }
        return img.inst;
      }

      const imgList = self.data.fileUnitList
        .filter(filterImgFile)
        .map(mapCurrentFlag);

      const preview = createImagePreview(imgList);

      preview.$inject(self.$refs.imagepreview);
    }

    function createImagePreview(imgFileList) {
      function findHelper(img) {
        return img.current;
      }
      const curIndex = imgFileList.findIndex(findHelper);

      function mapHelper(img) {
        delete img.current;
        return {
          src: img.data.src,
          name: img.data.name,
          status: img.data.status,
        };
      }
      const imgList = imgFileList.map(mapHelper);

      const imagePreview = new KLImagePreview({
        data: {
          imgList,
          curIndex,
        },
      });

      imagePreview.$on('remove', (imgInfo) => {
        const index = imgInfo.index;
        const imgInst = imgFileList[index];

        if (imgInst) {
          imgInst.$emit('remove');
        }
      });

      imagePreview.$on('$destroy', () => {
        imgFileList.splice(0);
      });

      return imagePreview;
    }

    fileunit.$on('progress', progressCb);

    function progressCb(info) {
      const curInst = this;
      let curIndex = -1;
      let lastIndex = -1;

      self.data.fileUnitList.forEach((item, index) => {
        if (item.inst.data.status === 'uploading') {
          lastIndex = index;
        }
        if (item.inst === curInst) {
          curIndex = index;
        }
      });

      if (curIndex >= lastIndex && self.data.status !== 'failed') {
        self.data.status = 'uploading';
        self.data.progress = info.progress;
        self.$update();
      }
      self.$emit(
        'progress',
        _.extend(info, {
          fileList: self.data.fileList
        })
      );
    }

    fileunit.$on('success', successCb);

    function successCb(info) {
      let allUploaded = true;
      let hasFailed = false;
      self.data.fileUnitList.forEach((item) => {
        allUploaded = allUploaded && item.inst.data.status === 'uploaded';
        hasFailed = hasFailed || item.inst.data.status === 'failed';
      });
      if (allUploaded) {
        self.data.status = 'uploaded';
      } else if (hasFailed) {
        self.data.status = 'failed';
      }
      self.updateList();
      self.$emit(
        'success',
        _.extend(info, {
          fileList: self.data.fileList
        })
      );
    }

    fileunit.$on('error', (info) => {
      self.data.status = 'failed';
      self.data.info = self.$trans('UPLOAD_FAIL');
      self.updateList();
      self.$emit(
        'error',
        _.extend(info, {
          fileList: self.data.fileList
        })
      );
    });

    fileunit.$on('remove', function (info) {
      if (this.flag === 'ORIGINAL') {
        this.flag = 'DELETED';
        this.file = this.data.file;
      }
      self.$emit(
        'remove',
        _.extend(info, {
          fileList: self.data.fileList
        })
      );
      this.destroy();
    });

    fileunit.$on('$destroy', function () {
      self.toggle(false);
      this.destroyed = true;
      this.$off('preview', previewCb);
      this.$off('success', successCb);
      self.updateList();
      self.updateFilesZone();
      resetStatus();
    });

    function resetStatus() {
      let allUploaded = true;
      let hasFailed = false;
      self.data.fileUnitList.forEach((item) => {
        allUploaded = allUploaded && item.inst.data.status === 'uploaded';
        hasFailed = hasFailed || item.inst.data.status === 'failed';
      });
      if (allUploaded) {
        self.data.status = 'uploaded';
      } else if (hasFailed) {
        self.data.status = 'failed';
      }
      self.$update();
    }

    return fileunit;
  },

  uploadFiles() {
    const data = this.data;
    const fileUnitList = data.fileUnitList;

    data.status = 'uploaded';
    data.info = '';

    fileUnitList.forEach((item) => {
      const inst = item.inst;

      if (inst.data.status === 'failed') {
        inst.uploadFile(inst.data.file);
      }
    });
  },

  toggle(open, e) {
    e && e.stopPropagation();

    const data = this.data;
    if (typeof open === 'undefined') {
      data.open = !data.open;
    } else {
      data.open = open;
    }

    this.setPosition(!data.open);

    const index = UploadCard.opens.indexOf(this);
    if (data.open && index < 0) {
      UploadCard.opens.push(this);
    } else if (!data.open && index >= 0) {
      UploadCard.opens.splice(index, 1);
    }
  },

  setPosition(hidden) {
    const filesBanner = this.$refs.filesbanner;
    const filesWrapper = this.$refs.fileswrapper;
    if (hidden) {
      filesBanner.style.left = '-9999px';
      filesWrapper.style.left = '-9999px';
      return;
    }
    this.setVerticalPosition();
    this.setHorizontalPosition();
  },

  setVerticalPosition() {
    const filesEntry = this.$refs.filesentry;
    const filesEntryCoors = filesEntry.getBoundingClientRect();
    const filesWrapper = this.$refs.fileswrapper;
    const filesWrapperCoors = filesWrapper.getBoundingClientRect();
    const viewHeight = document.documentElement.clientHeight;

    // show at vertical bottom side
    let vertical = 'bottom';
    // show at vertical top side
    const isVerticalTopSide =
      filesEntryCoors.top - filesWrapperCoors.height > 0;
    const isVerticalBottomSide =
      filesEntryCoors.bottom + filesWrapperCoors.height < viewHeight;
    if (isVerticalTopSide && !isVerticalBottomSide) {
      vertical = 'top';
    }

    if (vertical === 'bottom') {
      this.data.isTopBanner = false;
      filesWrapper.style.top = '53px';
      filesWrapper.style.bottom = 'auto';
      filesWrapper.style.boxShadow = 'auto';
      filesWrapper.style.boxShadow = '0 2px 3px 0 rgba(0,0,0,0.1)';
    } else {
      this.data.isTopBanner = true;
      filesWrapper.style.top = 'auto';
      filesWrapper.style.bottom = '53px';
      filesWrapper.style.boxShadow = '0 -2px 3px 0 rgba(0,0,0,0.1)';
    }
  },

  setHorizontalPosition() {
    const filesEntry = this.$refs.filesentry;
    const filesEntryCoors = filesEntry.getBoundingClientRect();
    const filesBanner = this.$refs.filesbanner;
    const filesWrapper = this.$refs.fileswrapper;
    const filesWrapperCoors = filesWrapper.getBoundingClientRect();
    const viewWidth = document.documentElement.clientWidth;

    // show at central
    let horizontal = 'left';
    const offsetWidth = (filesWrapperCoors.width / 2) - (filesEntryCoors.width / 2);
    const isHorizontalLeftEdge = filesEntryCoors.left - offsetWidth < 0;
    const isHorizontalRightEdge =
      filesEntryCoors.right + offsetWidth > viewWidth;
    if (isHorizontalRightEdge) {
      horizontal = 'right';
    }
    const isHorizontalCenter = !isHorizontalLeftEdge && !isHorizontalRightEdge;
    if (isHorizontalCenter) {
      horizontal = 'central';
    }

    if (horizontal === 'left') {
      filesWrapper.style.left = '0';
      filesWrapper.style.right = 'auto';
    } else if (horizontal === 'right') {
      filesWrapper.style.left = 'auto';
      filesWrapper.style.right = '0';
    } else if (horizontal === 'central') {
      filesWrapper.style.left = `-${offsetWidth}px`;
    }

    filesBanner.style.left = '20px';
  },
});

UploadCard.opens = [];
const opens = UploadCard.opens;
document.addEventListener(
  'click',
  (e) => {
    for (let len = opens.length, i = len - 1; i >= 0; i -= 1) {
      let close = true;

      const upload = opens[i];
      const uploadElement = upload.$refs.element;
      let iterator = e.target;

      while (iterator) {
        if (uploadElement === iterator) {
          close = false;
          break;
        }
        iterator = iterator.parentElement;
      }

      if (close) {
        upload.toggle(false, e);
        upload.$update();
      }
    }
  },
  false,
);

module.exports = UploadCard;
