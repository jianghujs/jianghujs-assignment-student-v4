'use strict';
const Service = require('egg').Service;
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

  async insertUserAssignment() {
    const { ctx, app } = this;
    const { jianghuKnex, config } = app;
    const { userId } = ctx.userInfo;
    const { actionData } = ctx.request.body.appData;
    const { articleId, courseBatchId, albumId, classId } = actionData;
    
    const { tableCourse, tableAlbum } = config;

    let whereOptions = {
      articleId,
      userId
    };

    const existingAssignment = await jianghuKnex(tableEnum.assignment).where(whereOptions).select();
    let assignmentId = '';

    //console.log('[insertUserAssignment] existingAssignment: ', existingAssignment);

    if (existingAssignment && existingAssignment.length > 1){
      throw new Error('作业记录出错，请联系系统管理员！');
    } else if (existingAssignment && existingAssignment.length == 1) {
      assignmentId = existingAssignment[0].assignmentId;
  } else {
      assignmentId = `${articleId}_${userId}_` + _.random(100000, 999999);

      const articleList = await jianghuKnex(tableEnum.article).where({articleId}).select();
      if (!articleList || articleList.length == 0) {
        throw new Error({ errorReason: '作业文章不存在' });
      }
      const article = articleList[0];
      // if (article.articleAssignmentPublishStatus != 'publish') {
      //   throw new Error({ errorReason: '作业题目未发布！' });
      // }
      const assignmentUserAnswer = this.extractDefaultAssignment(JSON.parse(article.articleAssignment));
      const assignmentStandardAnswer = JSON.parse(article.articleAssignmentWithAnswer).formItemList;
      const assignmentFullMarks = this.calculateAssignmentFullMarks(assignmentStandardAnswer);
      
      const userAssignment = {
        assignmentId: assignmentId,
        // albumId,
        // classId,
        // courseId,
        // courseBatchId,
        articleId,
        articleTitle: article.articleTitle,
        userId,
        assignmentRetryNumber: 0,
        assignmentSubmitStatus: 'new',
        assignmentUserAnswer: JSON.stringify(assignmentUserAnswer),
        assignmentStandardAnswer: JSON.stringify(assignmentStandardAnswer),
        assignmentScore: 0,
        assignmentFullMarks,
        assignmentReviewStatus: ''
      }

      //console.log('[insertUserAssignment] userAssignment:', userAssignment);
      await jianghuKnex(tableEnum.assignment, ctx).jhInsert(userAssignment);
    }

    return {
      assignmentId
    }
  }

  extractDefaultAssignment({...articleAssignment}) {
    const {formItemList} = articleAssignment;
    if (!formItemList) {
      return [];
    }
    formItemList.forEach(item => {
      this.setDefaultFormItem(item);
    })
    return formItemList;
  }

  setDefaultFormItem(item) {
    const file = {};
    item.component.uploadConfig.forEach(type => {
      file[type] = '';
    })
    let answer = '';
    if (['singleSelect', 'multipleSelect'].includes(item.component.type)) {
      answer = [];
    } else if (item.component.type === 'fillBlank') {
      answer = {};
      item.component.statement.filter(e => e.type === 'input').forEach(e => {
        answer[e.id] = '';
      })
    }
    item.user = {
      file,
      answer,
      remark: ""
    };
    if (item.component.type === 'markdown') {
      item.user.answer = `# 主题

## 标题

1.
2.
3.

## 标题

1.
2.
3. `;
    }
    if (item.component.type === 'questionGroup') {
      item.component.itemList.forEach(e => {
        this.setDefaultFormItem(e);
      })
    }
    return item;
  }

  calculateAssignmentFullMarks(assignmentStandardAnswer) {
    //console.log('[calculateAssignmentFullMarks]assignmentStandardAnswer: ', assignmentStandardAnswer);
    var fullMarks = 0;
    assignmentStandardAnswer.forEach(item => {
      if (item.component.score) {
        fullMarks += parseInt(item.component.score);
      }
    });
    return fullMarks;
  }

}


module.exports = AssignmentService;
