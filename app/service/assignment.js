"use strict";
const Service = require("egg").Service;
const { BizError, errorInfoEnum } = require("../constant/error");
const { tableEnum } = require("../constant/constant");
const validateUtil = require("@jianghujs/jianghu/app/common/validateUtil");
const idGenerateUtil = require("@jianghujs/jianghu/app/common/idGenerateUtil");
const _ = require("lodash");
const dayjs = require("dayjs");
// ========================================常用 require end=============================================
const actionDataScheme = Object.freeze({
  selectArticleAssignmentList: {
    type: "object",
    additionalProperties: true,
    required: [],
    properties: {
      articleId: { anyOf: [{ type: "string" }, { type: "number" }] },
    },
  },
});

class AssignmentService extends Service {
  // 重做作业
  // 清空已做的作业，并且重做次数+1，判断是否大于最大重做次数
  async redoUserAssignment() {
    const { ctx, app } = this;
    const { jianghuKnex, config } = app;
    const { where } = ctx.request.body.appData;
    const { assignmentId } = where;

    const existingAssignmentRecord = await jianghuKnex(tableEnum.assignment)
      .where({ assignmentId })
      .select();
    if (!existingAssignmentRecord || existingAssignmentRecord.length != 1) {
      throw new Error("作业记录出错，请联系系统管理员！");
    }

    const assignment = existingAssignmentRecord[0];

    const assignmentUserAnswer = this._extractDefaultAssignment(
      JSON.parse(assignment.assignmentStandardAnswer)
    );
    const retryNumber = parseInt(assignment.assignmentRetryNumber) + 1;

    const newActionData = {
      assignmentScore: 0,
      assignmentRetryNumber: retryNumber,
      assignmentSubmitStatus: "new",
      assignmentSubmitAt: null,
      assignmentUserAnswer: JSON.stringify(assignmentUserAnswer),
      assignmentReview: null,
      assignmentReviewUserId: null,
      assignmentReviewUser: null,
      assignmentReviewStatus: "",
      assignmentReviewAt: null,
    };

    ctx.request.body.appData.actionData = newActionData;
  }
  _extractDefaultAssignment(formItemList) {
    if (!formItemList) {
      return [];
    }
    formItemList.forEach((item) => {
      this._setDefaultFormItem(item);
    });
    return formItemList;
  }

  _setDefaultFormItem(item) {
    const file = {};
    item.component.uploadConfig.forEach((type) => {
      file[type] = "";
    });
    let answer = "";
    if (["singleSelect", "multipleSelect"].includes(item.component.type)) {
      answer = [];
    } else if (item.component.type === "fillBlank") {
      answer = {};
      item.component.statement
        .filter((e) => e.type === "input")
        .forEach((e) => {
          answer[e.id] = "";
        });
    }
    item.user = {
      file,
      answer,
      remark: "",
    };
    if (item.component.type === "markdown") {
      item.user.answer = ``;
    }
    if (item.component.type === "questionGroup") {
      item.component.itemList.forEach((e) => {
        this.setDefaultFormItem(e);
      });
    }
    return item;
  }
}

module.exports = AssignmentService;
