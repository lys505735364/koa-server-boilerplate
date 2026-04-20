/**
 * 统一响应格式工具函数（简化版）
 * 
 * 设计理念：
 * 1. 不再使用复杂的错误码体系
 * 2. HTTP 状态码由 koa-json-error 中间件处理
 * 3. Service 层只关心业务逻辑，返回 success 或 fail
 * 4. 具体的错误信息通过 msg 字段传递
 * 5. 前端根据 HTTP 状态码 + msg 进行处理
 */

/**
 * 成功响应
 * @param {any} result - 响应结果数据
 * @param {string} msg - 成功消息（默认'操作成功'）
 * @returns {Object} 标准响应对象
 * 
 * @example
 * return success(data, '查询成功');
 * return success(null, '删除成功');
 * return success({ total: 100, list: [...] });
 */
function success(result = null, msg = '操作成功') {
  return {
    code: '000000',  // 固定为 '000000' 表示成功（字符串格式，前端易对比）
    result,
    msg,
  };
}

/**
 * 失败响应
 * @param {string} msg - 错误描述（必填，用于向用户展示）
 * @param {any} result - 额外的错误数据（可选）
 * @returns {Object} 标准响应对象
 * 
 * @example
 * return fail('图形验证码已过期');
 * return fail('账号或密码错误');
 * return fail('无新增资产权限');
 * return fail('该资产编码已存在', { assetCode: 'ABC123' });
 */
function fail(result = null,msg='操作失败') {
  return {
    code: '999999',  // 固定为 '999999' 表示失败（字符串格式，前端易对比）
    result,
    msg,
  };
}

module.exports = {
  success,
  fail,
};
