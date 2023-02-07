'use strict';

class ValidateError extends Error {
  constructor({ errorCode, errorReason, errorReasonSupplement }) {
    super(JSON.stringify({ errorCode, errorReason, errorReasonSupplement }));
    this.name = 'ValidateError';
    this.errorCode = errorCode;
    this.errorReason = errorReason;
    this.errorReasonSupplement = errorReasonSupplement;
  }
}

class BizError extends Error {
  constructor({ errorCode, errorReason, errorReasonSupplement }) {
    super(JSON.stringify({ errorCode, errorReason, errorReasonSupplement }));
    this.name = 'BizError';
    this.errorCode = errorCode;
    this.errorReason = errorReason;
    this.errorReasonSupplement = errorReasonSupplement;
  }
}

const errorInfoEnum = Object.freeze({
  material_is_not_file: {
    errorCode: "material_is_not_file",
    errorReason: "文件不存在",
  },
  data_expection: {
    errorCode: "data_expection",
    errorReason: "数据异常",
  },
  album_queryType_error: {
    errorCode: "album_queryType_error",
    errorReason: "查询类型不匹配",
  },
  article_not_found: {
    errorCode: "article_not_found",
    errorReason: "文章不存在",
  },
  path_no_permissions: {
    errorCode: "path_no_permissions",
    errorReason: "无文件目录权限",
  },
  wrong_article_passcode: {
    errorCode: "wrong_article_passcode",
    errorReason: "密码输入错误！",
  },
  wrong_exam_info: {
    errorCode: "wrong_exam_info",
    errorReason: "该场考试不存在！",
  }
});

module.exports = {
  ValidateError,
  BizError,
  errorInfoEnum,
};
