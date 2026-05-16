import { Injectable } from '@nestjs/common';

@Injectable()
export class WeatherService {
  private readonly apiUrl = 'https://api.open-meteo.com/v1/forecast';
  private readonly latitude = 21.072280519484927;
  private readonly longitude = 105.77390753910294;

  async getCurrentWeather() {
    const params = new URLSearchParams({
      latitude: this.latitude.toString(),
      longitude: this.longitude.toString(),
      current: 'temperature_2m,weather_code,wind_speed_10m',
    });

    const response = await fetch(`${this.apiUrl}?${params}`);
    const data = await response.json();
    return data;
  }
}
