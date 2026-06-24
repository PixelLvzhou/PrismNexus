export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windDirection: string;     // 新增：风向
  windPower: string;         // 新增：风力等级
  windSpeed: number;
  icon: string;
  updateTime: string;        // 新增：更新时间
  source: string;            // 新增：数据来源
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

// 获取用户当前位置
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置功能'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      }
    );
  });
};

export const getWeather = async (options?: {
  lat?: number;
  lon?: number;
}): Promise<WeatherData> => {
  const params = new URLSearchParams();
  if (options?.lat) params.append('lat', options.lat.toString());
  if (options?.lon) params.append('lon', options.lon.toString());

  const response = await fetch(
    `http://localhost:3000/api/weather?${params.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '获取天气信息失败');
  }

  return await response.json();
};

// 自动获取位置并查询天气
export const getWeatherWithLocation = async (): Promise<WeatherData> => {
  try {
    const location = await getCurrentLocation();
    return await getWeather({
      lat: location.latitude,
      lon: location.longitude
    });
  } catch (error) {
    // 如果获取位置失败，使用默认位置（北京）
    console.warn('获取位置失败，使用默认位置:', error);
    return await getWeather();
  }
};

// 天气预报数据接口（预留）
export interface WeatherForecast {
  date: string;
  dayWeather: string;
  nightWeather: string;
  dayTemp: string;
  nightTemp: string;
  dayWind: string;
  nightWind: string;
  week: string;
}

// 获取天气预报（预留接口）
export const getWeatherForecast = async (options?: {
  city?: string;
}): Promise<WeatherForecast[]> => {
  const params = new URLSearchParams();
  if (options?.city) params.append('city', options.city);

  const response = await fetch(
    `http://localhost:3000/api/weather/forecast?${params.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '获取天气预报失败');
  }

  return await response.json();
};
