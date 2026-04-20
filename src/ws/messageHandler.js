/**
 * 最终版核心逻辑：
 * 1. 先保存聊天记录（同步）→ 保存成功后再推送消息
 * 2. 保留虚拟ID精准响应、极简路由职责
 * 3. 离线消息仅保存不推送，客户端上线后自行同步
 */
const { getConnection, getRoomConnections } = require("./connectionManager");
const { saveChatLogsApi } = require("../api");

/**
 * 统一响应工具（携带客户端虚拟ID）
 */
function sendResponse(ws, code, vId, data, msg) {
  ws.send(
    JSON.stringify({
      code,
      msgType: 2,
      msg,
      vId,
      data,
    })
  );
}

/**
 * 核心消息处理：保存日志 → 路由分发
 */
async function handleMessage(msgStr, ws) {
  try {
    // 1. 解析消息（强制携带虚拟ID）
    const msg = JSON.parse(msgStr);
    const { vId, senderId, msgType } = msg;

    // 2. 基础参数校验
    const requiredFields = ["vId", "senderId", "receiverId", "msgType", "contentType", "content"];
    const missingFields = requiredFields.filter((field) => !msg.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return sendResponse(ws, 400, vId, null, `缺少必填字段：${missingFields.join(", ")}`);
    }

    // 3. 身份校验
    if (ws.uid != senderId) {
      return sendResponse(ws, 403, vId, null, "身份校验失败：发送者ID与连接绑定ID不一致");
    }

    // 4. 统一保存聊天记录（核心：保存成功后再推送）
    let saveResult;
    try {
      // 同步保存聊天记录（必须保存成功才继续）
      saveResult = await saveChatLogsApi(msg);
      if (saveResult.code !== "000000") {
        throw new Error(saveResult.msg || "聊天记录保存失败");
      }
    } catch (saveErr) {
      // 保存失败：直接响应，不推送消息
      return sendResponse(ws, 500, vId, null, `聊天记录保存失败：${saveErr.message}`);
    }
    console.log(saveResult);
    // 5. 保存成功后，按消息类型推送
    switch (msgType) {
      case 1: // 私聊
        await handlePrivateMsg(ws, msg, vId, saveResult.result);
        break;
      case 2: // 群聊
        await handleRoomMsg(ws, msg, vId, saveResult.result);
        break;
      default:
        sendResponse(ws, 400, vId, saveResult.result, `不支持的消息类型：${msgType}`);
    }
  } catch (err) {
    console.error("[消息处理] 全局异常：", err.message);
    let vId = "unknown";
    try {
      const parsedMsg = JSON.parse(msgStr);
      vId = parsedMsg.vId || "unknown";
    } catch (e) {}

    sendResponse(ws, 500, vId, null`消息处理失败：${err.message}`);
  }
}

/**
 * 私聊消息：保存成功后 → 推送（在线）/仅保存（离线）
 * @param {WebSocket} ws 发送者连接
 * @param {Object} msg 消息体
 * @param {string} vId 客户端虚拟ID
 * @param {Object} saveResult 保存日志的返回结果（含logId）
 */
async function handlePrivateMsg(ws, msg, vId, saveResult) {
  const receiverId = saveResult.receiverId;
  const logId = saveResult.id; // 日志ID（KOA返回）

  // 1. 找接收者WS连接
  const receiverWs = getConnection(receiverId);
  const isOnline = !!receiverWs;

  // 2. 组装推送消息（携带日志ID+虚拟ID）

  const msgLog = { ...saveResult };
  msgLog.msgId = saveResult.id;
  msgLog.targetId = saveResult.senderId;
  delete msgLog.id;
  const pushMsg = {
    msgType: 1, // 0:系统消息 1: 推送消息(主动推送过来的聊天消息) 2:回复消息(用于回复发送者的消息)
    code: 200,
    data: msgLog,
  };

  // 3. 在线则推送，离线则仅保存（客户端上线后同步）
  if (isOnline) {
    receiverWs.send(JSON.stringify(pushMsg));
  }

  msgLog.targetId = saveResult.receiverId;
  // 4. 响应发送者
  sendResponse(ws, 200, vId, msgLog, isOnline ? "消息已送达" : "消息已发送（对方未在线）");
}

/**
 * 群聊消息：保存成功后 → 广播给在线用户
 * @param {WebSocket} ws 发送者连接
 * @param {Object} msg 消息体
 * @param {string} vId 客户端虚拟ID
 * @param {Object} saveResult 保存日志的返回结果（含logId）
 */
async function handleRoomMsg(ws, msg, vId, saveResult) {
  const roomId = saveResult.receiverId;
  const senderId = saveResult.senderId;

  // 1. 校验发送者是否在聊天室
  if (!ws.roomIds.has(roomId)) {
    return sendResponse(ws, 403, vId, `无权限发送消息到聊天室`, null);
  }

  // 2. 找聊天室所有在线用户（排除发送者）
  const roomConns = getRoomConnections(roomId, senderId);
  const broadcastCount = roomConns.length;

  // 3. 组装广播消息
  const msgLog = { ...saveResult };
  msgLog.msgId = saveResult.id;
  msgLog.targetId = roomId;
  delete msgLog.id;
  const pushMsg = {
    msgType: 1, // 0:系统消息 1: 推送消息(主动推送过来的聊天消息) 2:回复消息(用于回复发送者的消息)
    code: 200,
    data: msgLog,
  };
  // 4. 广播给在线用户
  roomConns.forEach((conn) => conn.send(JSON.stringify(pushMsg)));

  // 5. 响应发送者
  sendResponse(ws, 200, vId, msgLog, `群聊消息已保存并广播给${broadcastCount}人`);
}

module.exports = { handleMessage };
