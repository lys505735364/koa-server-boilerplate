/**
 * 优化后：单用户单连接，承载多聊天室
 * 存储结构：Map<uid, WebSocket>
 * 连接属性：ws.uid / ws.roomIds(Set)
 */
const SocketMaps = new Map();

/**
 * 添加连接
 * @param {number} uid 业主ID
 * @param {WebSocket} ws 连接实例
 */
function addConnection(uid, ws) {
  // 若用户已有连接，先关闭旧连接（避免多端登录冲突，也可改为允许多端）
  if (SocketMaps.has(uid)) {
    const oldWs = SocketMaps.get(uid);
    oldWs.close(1008, '新设备登录，旧连接断开');
  }
  // 绑定核心属性
  SocketMaps.set(uid, ws);

  // 连接关闭时移除
  ws.on('close', () => {
    if (SocketMaps.get(uid) === ws) {
      SocketMaps.delete(uid);
    }
    console.log(`[连接管理] 业主${uid}连接已移除，关联聊天室：${[...ws.roomIds]}`);
  });
}

/**
 * 获取用户的在线连接
 * @param {number} uid 业主ID
 * @returns {WebSocket|undefined} 连接实例
 */
function getConnection(uid) {
  return SocketMaps.get(uid);
}

/**
 * 获取指定聊天室的所有在线连接
 * @param {string|number} roomId 聊天室ID
 * @param {number} excludeOwnerId 排除的发送者ID
 * @returns {Array<WebSocket>} 连接列表
 */
function getRoomConnections(roomId, excludeOwnerId) {
  const roomConns = [];
  for (const [uid, ws] of SocketMaps) {
    console.log(uid)
    console.log(Array.from(ws.roomIds))
    if (uid === excludeOwnerId) continue;
    // 检查用户是否在该聊天室中
    if (ws.roomIds.has(roomId)) {
      roomConns.push(ws);
    }
  }
  return roomConns;
}

/**
 * 心跳检测（逻辑不变）
 */
function setupHeartbeat(ws, pingInterval, pingTimeout) {
  ws.isAlive = true;
  ws.on('pong', () => { 
    ws.isAlive = true; 
  });
  const interval = setInterval(() => {
    if (!ws.isAlive) {
      ws.terminate();
      clearInterval(interval);
      return;
    }
    ws.isAlive = false;
    ws.ping();
    setTimeout(() => {
      if(!ws.isAlive) {
        ws.terminate();
      }
    }, pingTimeout)
  }, pingInterval);
  ws.on('close', () => clearInterval(interval));
}

module.exports = {
  addConnection,
  getConnection,
  getRoomConnections,
  setupHeartbeat
};