"use strict";
const Service = require("egg").Service;
const { tableEnum } = require("../constant/constant");
const _ = require("lodash");

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
    const retryNumber = parseInt(assignment.assignmentRetryNumber || 0) + 1;

    const newActionData = {
      assignmentScore: 0,
      assignmentRetryNumber: retryNumber,
      assignmentSubmitStatus: "new",
      assignmentSubmitAt: null,
      assignmentUserAnswer: null,
      assignmentReview: null,
      assignmentReviewUserId: null,
      assignmentReviewUser: null,
      assignmentReviewStatus: "",
      assignmentReviewAt: null,
    };

    ctx.request.body.appData.actionData = newActionData;
  }
}

module.exports = AssignmentService;
