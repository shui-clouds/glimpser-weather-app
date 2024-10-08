import { fetchWeatherApi } from "openmeteo";

const weatherCodesMap = new Map<number, { description: string, image: string }>([
    [0, { description: "Sunny", image: "http://openweathermap.org/img/wn/01d@2x.png" }],
    [1, { description: "Mainly Sunny", image: "http://openweathermap.org/img/wn/01d@2x.png" }],
    [2, { description: "Partly Cloudy", image: "http://openweathermap.org/img/wn/02d@2x.png" }],
    [3, { description: "Cloudy", image: "http://openweathermap.org/img/wn/03d@2x.png" }],
    [45, { description: "Foggy", image: "http://openweathermap.org/img/wn/50d@2x.png" }],
    [48, { description: "Rime Fog", image: "http://openweathermap.org/img/wn/50d@2x.png" }],
    [51, { description: "Light Drizzle", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [53, { description: "Drizzle", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [55, { description: "Heavy Drizzle", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [56, { description: "Light Freezing Drizzle", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [57, { description: "Freezing Drizzle", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [61, { description: "Light Rain", image: "http://openweathermap.org/img/wn/10d@2x.png" }],
    [63, { description: "Rain", image: "http://openweathermap.org/img/wn/10d@2x.png" }],
    [65, { description: "Heavy Rain", image: "http://openweathermap.org/img/wn/10d@2x.png" }],
    [66, { description: "Light Freezing Rain", image: "http://openweathermap.org/img/wn/10d@2x.png" }],
    [67, { description: "Freezing Rain", image: "http://openweathermap.org/img/wn/10d@2x.png" }],
    [71, { description: "Light Snow", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [73, { description: "Snow", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [75, { description: "Heavy Snow", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [77, { description: "Snow Grains", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [80, { description: "Light Showers", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [81, { description: "Showers", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [82, { description: "Heavy Showers", image: "http://openweathermap.org/img/wn/09d@2x.png" }],
    [85, { description: "Light Snow Showers", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [86, { description: "Snow Showers", image: "http://openweathermap.org/img/wn/13d@2x.png" }],
    [95, { description: "Thunderstorm", image: "http://openweathermap.org/img/wn/11d@2x.png" }],
    [96, { description: "Light Thunderstorms With Hail", image: "http://openweathermap.org/img/wn/11d@2x.png" }],
    [99, { description: "Thunderstorm With Hail", image: "http://openweathermap.org/img/wn/11d@2x.png" }]
]);


const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export const locationApi = "https://geocoding-api.open-meteo.com/v1";

export const fetchWeatherData = async (longitude: number, latitude: number) => {
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, {
      longitude,
      latitude,
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "wind_speed_10m_max",
      ],
      wind_speed_unit: "mph",
      forecast_days: 5,
    });
    const response = responses[0];
    const daily = response.daily()!;

    const weatherData = {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval()
        ).map((t) => new Date((t + response.utcOffsetSeconds()) * 1000)),
        weatherCode: daily.variables(0)!.valuesArray()!,
        temperature2mMax: daily.variables(1)!.valuesArray()!,
        temperature2mMin: daily.variables(2)!.valuesArray()!,
        apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
        apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
        windSpeed10mMax: daily.variables(5)!.valuesArray()!,

    };

    
    const formattedWeatherData = [];
    
    for (let i = 0; i < weatherData.time.length; i++) {
        const weatherCodeCaption = weatherCodesMap.get(weatherData.weatherCode[i])?.description ?? 'Unknown';
        formattedWeatherData.push({
            time: weatherData.time[i],
            weatherCodeCaption: weatherCodeCaption,
            weatherCodeImage: weatherCodesMap.get(weatherData.weatherCode[i])?.image,
            temperature2mMax: Math.round(weatherData.temperature2mMax[i]),
            temperature2mMin: Math.round(weatherData.temperature2mMin[i]),
            apparentTemperatureMax: Math.round(weatherData.apparentTemperatureMax[i]),
            apparentTemperatureMin: Math.round(weatherData.apparentTemperatureMin[i]),
            windSpeed10mMax: Math.round(weatherData.windSpeed10mMax[i])
        });
    }
    console.dir(formattedWeatherData, {depth: null})
    return formattedWeatherData;
  };

  export type WeatherData = {
    time: Date;
    weatherCodeCaption: string;
    weatherCodeImage: string;
    temperature2mMax: number;
    temperature2mMin: number;
    apparentTemperatureMax: number;
    apparentTemperatureMin: number; 
    windSpeed10mMax: number;
  }