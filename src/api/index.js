const { request } = require('./utils/http.js');

// 获取聊天室列表
function getChatRoomsApi(token) {
  return request({
    url: '/appApi/chat/getChatRooms',
    method: 'get',
    headers: { authorizationapi: token },
  });
}
// 保存聊天记录
function saveChatLogsApi(params) {
  return request({
    url: '/webApi/chat/saveChatLogs',
    method: 'post',
    data: params,
  });
}

module.exports = {
  getChatRoomsApi,
  saveChatLogsApi,
};
