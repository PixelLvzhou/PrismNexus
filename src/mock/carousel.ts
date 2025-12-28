import type { MockMethod } from 'vite-plugin-mock'

// 轮播图数据
export const carouselData = [
  { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel1.jpg' },
  { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel2.jpg' },
  { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel4.jpg' },
  { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel5.jpg' }
]

// 定义mock API接口
export default [
  {
    url: '/api/carousel',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: carouselData
      }
    }
  }
] as MockMethod[]