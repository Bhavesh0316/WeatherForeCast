import React, { useState, useEffect } from 'react';
import axios from 'axios';


// https://api.openweathermap.org/data/2.5/weather?q=peshawar&appid=d71313d9b170d18812c1848fd9f61fc1


const WeatherForecast = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [unitSystem, setUnitSystem] = useState('metric'); 

  const API_KEY = '9ee38e679aad3ca0845385d9b46955ac';

  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unitSystem}&appid=${API_KEY}`
      );
      setWeatherData(response.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unitSystem}&appid=${API_KEY}`
      );

      const groupedForecastData = forecastResponse.data.list.reduce((acc, item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      setForecastData(groupedForecastData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (input) => {
    setCity(input);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/find?q=${input}&type=like&sort=population&cnt=5&units=${unitSystem}&appid=${API_KEY}`
      );
      setSuggestions(response.data.list);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (selectedCity) => {
    setCity(selectedCity.name);
    setSuggestions([]);
    fetchWeatherData(selectedCity.name);
  };

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          axios
            .get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unitSystem}&appid=${API_KEY}`
            )
            .then((response) => {
              setWeatherData(response.data);
              

              return axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unitSystem}&appid=${API_KEY}`
              );
            })
            .then((forecastResponse) => {
              
              const groupedForecastData = forecastResponse.data.list.reduce((acc, item) => {
                const date = item.dt_txt.split(' ')[0];
                if (!acc[date]) {
                  acc[date] = [];
                }
                acc[date].push(item);
                return acc;
              }, {});

              setForecastData(groupedForecastData);
            })
            .catch((error) => {
              console.error('Error fetching weather data:', error);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    getCurrentLocationWeather();
  }, [unitSystem]); 

  return (
    <main className="">
      <div className="max-w-3xl mx-auto mt-3  bg-slate-100 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">
          Weather Forecast App
        </h1>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => handleInputChange(e.target.value)}
            className="border-2 border-gray-300 p-2 rounded-md w-full"
          />
          <button
            type="button"
            onClick={() => fetchWeatherData(city)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            Get 
          </button>
          <div className="mt-2 md:mt-0">
            
            <select
              id="unitSystem"
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            >
              <option value="metric">Metric (Celsius)</option>
              <option value="imperial">Imperial (Fahrenheit)</option>
            </select>
          </div>
        </div>
        {loading && <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Loading...</p>}
        {suggestions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {suggestions.map((suggest) => (
              <li
                key={suggest.id}
                onClick={() => handleSuggestionClick(suggest)}
                className="cursor-pointer hover:underline"
              >
                {suggest.name}, {suggest.sys.country}
              </li>
            ))}
          </ul>
        )}
        {weatherData && (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold">{weatherData.name}, {weatherData.sys.country}</h2>
            <p className="text-lg">
              Temperature: {weatherData.main.temp.toFixed(2)} °{unitSystem === 'metric' ? 'C' : 'F'}
            </p>
            <p className="text-lg">Weather: {weatherData.weather[0].description}</p>
          </div>
        )}
          {forecastData && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">5-Day Forecast</h3>
                <div className="flex flex-wrap justify-around">
                  {Object.entries(forecastData).map(([date, items]) => {
                    
                    const maxTemperatureItem = items.reduce((maxTempItem, currentItem) => {
                      return currentItem.main.temp > maxTempItem.main.temp ? currentItem : maxTempItem;
                    }, items[0]);

                    return (
                      <div key={date} className=" p-2  w-80 bg-gray-200 dark:bg-gray-800 rounded-md mb-2">
                        <p className="font-semibold">{new Date(date).toLocaleDateString()}</p>
                        <div className="mb-2">
                          <p>Temperature: {maxTemperatureItem.main.temp.toFixed(2)} °{unitSystem === 'metric' ? 'C' : 'F'}</p>
                          <p>Weather: {maxTemperatureItem.weather[0].description}</p>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          )}

      </div>
    </main>
  );
};

export default WeatherForecast;
