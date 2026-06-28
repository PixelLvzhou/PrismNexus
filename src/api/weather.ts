import request from '@/utils/request';

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windDirection: string;
  windPower: string;
  windSpeed: number;
  icon: string;
  updateTime: string;
  source: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

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
        maximumAge: 300000
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

  const data = await request<WeatherData>(
    `/api/weather?${params.toString()}`,
    {
      method: 'GET',
      auth: false,
    }
  );

  return data;
};

export const getWeatherWithLocation = async (): Promise<WeatherData> => {
  try {
    const location = await getCurrentLocation();
    return await getWeather({
      lat: location.latitude,
      lon: location.longitude
    });
  } catch (error) {
    console.warn('获取位置失败，使用默认位置:', error);
    return await getWeather();
  }
};

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

export const getWeatherForecast = async (options?: {
  city?: string;
}): Promise<WeatherForecast[]> => {
  const params = new URLSearchParams();
  if (options?.city) params.append('city', options.city);

  const data = await request<WeatherForecast[]>(
    `/api/weather/forecast?${params.toString()}`,
    {
      method: 'GET',
      auth: false,
    }
  );

  return data;
};
