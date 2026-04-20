/**
 * WS服务入口：启动服务、监听连接、处理消息
 */
const WebSocket = require('ws');
const { WS } = require('../config');
const { redisClient } = require('../redis');
const { handleMessage } = require('./messageHandler');
const { setupHeartbeat, addConnection } = require('./connectionManager');
const { getChatRoomsApi } = require('../api');

async function verifyToken(clientToken) {
  try {
    // 1. 从Redis获取UID
    const uid = await redisClient.get(clientToken);
    if (!uid) return { valid: false, code: 403, msg: 'Invalid Token: Token无效或已过期' };

    // 2. 获取用户信息
    const catchUserInfo = await redisClient.get(uid);
    if (!catchUserInfo) return { valid: false, code: 403, msg: 'Invalid Token: 用户信息不存在' };

    // 3. 解析并校验Token
    const { token, userInfo } = JSON.parse(catchUserInfo);
    if (token !== clientToken) return { valid: false, code: 403, msg: 'Invalid Token: Token不匹配' };

    // 4. 校验用户状态
    // if (userInfo.userType !== 1 || userInfo.authStatus !== 1) {
    //   return { valid: false, code: 403, msg: "Invalid Token: 仅认证用户可连接" };
    // }

    // 5. 鉴权成功，返回用户信息
    return { valid: true, uid, userInfo };
  } catch (err) {
    console.error('Token校验异常：', err.message);
    return { valid: false, code: 500, msg: 'Internal Server Error: 服务器鉴权异常' };
  }
}

// 封装拉取用户聊天室列表
async function getRoomList(token) {
  try {
    const res = await getChatRoomsApi(token); // 使用axios跨服务请求
    return res.result;
  } catch (err) {
    const errorMsg = err.msg || `拉取聊天室失败：${err.message}`;
    console.error(`拉取用户聊天室列表异常：`, errorMsg);
    throw new Error(errorMsg); // 向上抛出，明确错误信息
  }
}

// 创建WS服务器

redisClient.connect(); // 连接Redis

const wss = new WebSocket.Server({
  port: WS.port,
  path: WS.path,
  verifyClient: (info, done) => {
    console.log('客户端链接请求校验 start');
    const clientToken = info.req.headers.token;

    // 1. 无Token直接拒绝
    if (!clientToken) {
      return done(false, 403, 'Missing Token: 请提供有效的认证 Token');
    }

    // 2. 异步执行鉴权逻辑
    verifyToken(clientToken)
      .then((result) => {
        if (result.valid) {
          info.req.uid = result.uid;
          info.req.userInfo = result.userInfo;
          done(true); // 允许连接
        } else {
          done(false, result.code, result.msg); // 拒绝连接
        }
      })
      .catch((err) => {
        console.error('鉴权流程异常：', err.message);
        done(false, 500, 'Internal Server Error: 鉴权流程异常');
      });
  },
});

// 服务器启动成功日志
wss.on('listening', () => {
  console.log(`====================================`);
  console.log(`WS服务启动成功 🚀`);
  console.log(`服务端口：${WS.port} | 路径：${WS.path}`);
  console.log(`====================================`);
});

// 处理新连接（核心：鉴权后拉取聊天室+绑定连接）
wss.on('connection', async (ws, req) => {
  const userInfo = req.userInfo;
  const uid = userInfo.id;
  const token = req.headers.token;
  console.log(`[连接] 新客户端接入：UID=${uid}，用户名=${userInfo.ownerName}`);

  try {
    // 1. 拉取用户聊天室列表（核心补充）
    const roomList = await getRoomList(token);
    const roomIds = [];
    const communityIds = [];
    if (Array.isArray(roomList)) {
      roomList.forEach((room) => {
        roomIds.push(room.id);
        communityIds.push(room.communityId);
      });
    }

    // 2. 心跳检测初始化
    setupHeartbeat(ws, WS.pingInterval, WS.pingTimeout);

    // 3. 绑定核心数据到WS连接（供后续消息处理使用）
    ws.uid = userInfo.id;
    ws.userInfo = userInfo;
    ws.roomIds = new Set(roomIds); // 多聊天室ID集合
    ws.communityIds = new Set(communityIds); // 多小区ID集合

    // 4. 添加到连接管理池（单用户单连接）
    addConnection(uid, ws);

    // 5. 通知客户端连接成功（不携带其他信息,让客户端与后端进行交互查询）
    ws.send(JSON.stringify({ msgType: 0, code: 200, msg: '连接成功', data: null }));

    // 6. 处理客户端消息（启用+修正参数顺序）
    ws.on('message', (msgStr) => {
      console.log(`[消息] UID=${uid} 发送：${msgStr}`);
      handleMessage(msgStr, ws); // 修正参数顺序：先消息，后连接
    });

    // 7. 连接错误处理
    ws.on('error', (err) => {
      console.error(`[连接] UID=${uid} 异常：`, err.message);
    });

    // 8. 连接关闭处理
    ws.on('close', (code, reason) => {
      console.log(`[连接] UID=${uid} 断开：code=${code}，reason=${reason.toString()}`);
    });
  } catch (err) {
    console.error(`[连接] UID=${uid} 初始化失败：`, err.message);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(4003, `初始化失败：${err.message}`);
    }
  }
});

// 服务器全局错误处理（优化：增加重启提示）
wss.on('error', (err) => {
  console.error('[服务器] 异常 🚫：', err.message);
  console.warn('[服务器] 异常后将在5秒后重启...');
  setTimeout(() => {
    process.exit(1); // 退出后由PM2等进程管理工具重启
  }, 5000);
});

// 进程退出处理（优化：增加连接清理）
process.on('SIGINT', () => {
  console.log('\n[服务器] 正在优雅关闭...');
  // 关闭所有客户端连接
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, '服务器正在关闭');
    }
  });
  // 关闭服务器
  wss.close(() => {
    console.log('[服务器] 已优雅关闭，所有连接已清理');
    // 关闭Redis连接
    redisClient.quit().then(() => {
      console.log('[Redis] 连接已关闭');
      process.exit(0);
    });
  });
});

// 未捕获异常处理（补充：避免进程崩溃）
process.on('uncaughtException', (err) => {
  console.error('[未捕获异常]：', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[未处理Promise拒绝]：', reason.message, promise);
  process.exit(1);
});
