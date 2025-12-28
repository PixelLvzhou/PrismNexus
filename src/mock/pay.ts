// 微信支付mock数据
import type { MockMethod } from "vite-plugin-mock";

export default [
  {
    url: "/api/pay",
    method: "post",
    response: () => {
      // 模拟微信支付统一下单接口返回的参数
      return {
        code: 200,
        message: "success",
        data: {
          appid: "wx1234567890abcdef", // 微信公众号appid，全小写
          timestamp: Math.floor(Date.now() / 1000).toString(), // 时间戳，微信要求小写s
          nonceStr: "abcdefghijklmnopqrstuvwxyz123456", // 随机字符串
          package: "prepay_id=wx202401011234567890abcdef1234567890", // 预支付交易会话标识
          signType: "MD5", // 签名类型
          paySign: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0", // 签名
        },
      };
    },
  },
  {
    url: "/api/pay/query",
    method: "get",
    response: ({ query }: { query: Record<string, string> }) => {
      // 模拟微信支付查询接口
      const { out_trade_no } = query;
      return {
        code: 200,
        message: "success",
        data: {
          out_trade_no,
          trade_state: "SUCCESS", // 交易状态
          trade_state_desc: "支付成功", // 交易状态描述
          bank_type: "CFT", // 付款银行
          total_fee: 1, // 订单金额
          cash_fee: 1, // 现金支付金额
          transaction_id: "1217752501201407033233368018", // 微信支付订单号
          time_end: "20240101123456", // 支付完成时间
        },
      };
    },
  },
] as MockMethod[];
