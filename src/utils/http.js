/**
 * WS服务专用 Axios 封装
 * 适配接口格式：{code:"000000", result: any, msg:"操作成功"}
 * 核心特性：鉴权Token、统一异常处理、日志追踪、环境适配
 */
const axios = require("axios");
const { WS, WEB } = require("../config");

// 1. 环境适配：优先使用WEB配置的baseURL，兜底用硬编码
const BASE_URL = `http://localhost:${WEB.PORT}` || "http://localhost:3000";

// 2. 创建Axios实例（避免污染全局axios）
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s超时
  headers: {
    "Content-Type": "application/json;charset=utf-8", // 修正编码拼写错误
    "X-WS-Token": WS.authToken, // WS服务调用KOA接口的专属鉴权Token
  },
});

// 3. 请求拦截器：添加日志、请求ID追踪
axiosInstance.interceptors.request.use(
  (config) => {
    // 生成唯一请求ID（用于日志追踪）
    config.headers["X-Request-Id"] = Date.now() + "-" + Math.random().toString(36).slice(2);
    // 打印请求日志
    // console.log(`[Axios请求] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, {
    //   params: config.params,
    //   data: config.data,
    //   requestId: config.headers["X-Request-Id"],
    // });
    return config;
  },
  (error) => {
    // console.error("[Axios请求拦截异常]", error.message);
    return Promise.reject({
      code: "999999",
      msg: `请求初始化失败：${error.message}`,
      result: null,
    });
  }
);

// 4. 响应拦截器：适配接口格式、统一异常处理
axiosInstance.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers["X-Request-Id"];
    const { code, result, msg } = response.data || {};

    // 打印响应日志
    // console.log(`[Axios响应] ${response.config.method.toUpperCase()} ${response.config.url}`, {
    //   requestId,
    //   code,
    //   msg,
    //   result: result ? (typeof result === "object" ? JSON.stringify(result) : result) : null,
    // });

    // 适配约定的接口格式：仅code=000000视为成功
    if (code === "000000") {
      return Promise.resolve({ code, result, msg });
    } else {
      // 业务异常（如参数错误、权限不足）
      return Promise.reject({
        code: code || "999999",
        msg: msg || "接口返回非成功码",
        result: null,
        requestId,
      });
    }
  },
  (error) => {
    const requestId = error.config?.headers["X-Request-Id"] || "无请求ID";
    let errorInfo = {
      code: "999999",
      msg: "接口请求失败",
      result: null,
      requestId,
    };

    // 分类处理异常
    if (!error.response) {
      // 网络异常/超时
      errorInfo.msg = error.message.includes("timeout") ? "接口请求超时（10s）" : "网络异常：无法连接到后端服务";
    } else {
      // 服务器状态码异常（4xx/5xx）
      const { status, data } = error.response;
      errorInfo.code = data?.code || `HTTP_${status}`;
      errorInfo.msg = data?.msg || `接口返回异常状态码：${status}`;
      errorInfo.result = data?.result || null;
    }

    // 打印错误日志
    console.error(`[Axios错误] ${error.config?.method.toUpperCase()} ${error.config?.url}`, errorInfo);
    return Promise.reject(errorInfo);
  }
);

// 5. 统一请求方法（兼容get/post，简化调用）
const request = (options) => {
  const { url, method = "get", params, data, headers = {} } = options;
  const config = {
    url,
    method: method.toLowerCase(),
    headers: { ...axiosInstance.defaults.headers, ...headers }, // 合并自定义header
  };

  // 区分get/post参数
  if (config.method === "get") {
    config.params = params || {};
  } else if (config.method === "post") {
    config.data = data || {};
  }

  // 返回Promise（无需嵌套new Promise，axios本身返回Promise）
  return axiosInstance(config);
};

// 6. 导出（统一使用CommonJS，适配Node.js环境）
module.exports = {
  request,
  axiosInstance, // 导出实例，便于特殊场景自定义调用
};
