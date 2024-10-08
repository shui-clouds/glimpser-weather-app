import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LocationApiResponse, LocationResult } from "../types";
import { fetchWeatherData, locationApi } from "../lib";

export default function App() {
  const searchDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const [locationSearchResults, setlocationSearchResults] = useState<
    LocationResult[] | undefined
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState(null);

  const queryClient = useQueryClient();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const url = "https://api.open-meteo.com/v1/forecast";
  //     const responses = await fetchWeatherApi(url, {
  //       longitude: location.longitude,
  //       latitude: location.latitude,
  //       "current": ["temperature_2m", "apparent_temperature", "precipitation", "rain", "showers", "weather_code"],
  //       "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min"],
  //       "wind_speed_unit": "mph"
  //     });
  //     const response = responses[0];
  //     const utcOffsetSeconds = response.utcOffsetSeconds();

  //     const current = response.current()!;
  //     const daily = response.daily()!;

  //     const weatherData = {
  //       current: {
  //         time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
  //         temperature2m: current.variables(0)!.value(),
  //         apparentTemperature: current.variables(1)!.value(),
  //         precipitation: current.variables(2)!.value(),
  //         rain: current.variables(3)!.value(),
  //         showers: current.variables(4)!.value(),
  //         weatherCode: current.variables(5)!.value(),
  //       },
  //       daily: {
  //         time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
  //           (t) => new Date((t + utcOffsetSeconds) * 1000)
  //         ),
  //         weatherCode: daily.variables(0)!.valuesArray()!,
  //         temperature2mMax: daily.variables(1)!.valuesArray()!,
  //         temperature2mMin: daily.variables(2)!.valuesArray()!,
  //         apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
  //         apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
  //       },

  //     };
  //     setData(weatherData.daily);
  //   };

  //   fetchData();
  // }, []);

  const formatLocationResultName = (result: LocationResult) => {
    return Array.from([result.name, result.admin1, result.country])
      .filter((s) => s)
      .join(", ");
  };

  return (
    <main className="flex flex-col justify-center items-center px-12 py-12">
      <h1 className="text-center text-3xl font-semibold">Weather App</h1>
      <Combobox
        className="w-full max-w-64"
        as="div"
        value={selectedLocation}
        onChange={setSelectedLocation}
      >
        <div className="relative mt-12">
          <ComboboxInput
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-7 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => {
              clearTimeout(searchDebounceTimeoutRef.current);
              const searchString = event.target.value;
              if (searchString.length < 2) {
                setlocationSearchResults([]);
                setErrorMessage("Enter 2 or more characters");
                return;
              }
              setlocationSearchResults(undefined);
              searchDebounceTimeoutRef.current = setTimeout(async () => {
                const data: LocationApiResponse = await queryClient.fetchQuery({
                  queryKey: ["search", searchString],
                  queryFn: async () => {
                    const response = await fetch(
                      `${locationApi}/search?name=${searchString}`
                    );
                    return await response.json();
                  },
                });
                if (data.results) {
                  setlocationSearchResults(data.results);
                  setErrorMessage(null);
                } else {
                  setlocationSearchResults([]);
                  setErrorMessage("No results found");
                }
              }, 500);
            }}
            placeholder="Enter a location..."
            displayValue={(result: LocationResult | undefined) =>
              result ? formatLocationResultName(result) : ""
            }
          />
          <ComboboxButton className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ArrowPathIcon
              className={`h-5 w-5 text-gray-400 animate-spin ${
                locationSearchResults === undefined ? "" : "hidden"
              }`}
              aria-hidden="true"
            />
          </ComboboxButton>

          {locationSearchResults && locationSearchResults.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {locationSearchResults.map((result) => (
                <ComboboxOption
                  key={result.id}
                  value={result}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                >
                  <span className="block truncate group-data-[selected]:font-semibold">
                    {formatLocationResultName(result)}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
          {errorMessage && (
            <p className="mt-1 text-sm font-medium text-center">
              {errorMessage}
            </p>
          )}
        </div>
      </Combobox>

      <div className="xl:flex gap-x-6 mt-12">
        {people.map((person) => (
          <div
            key={person.id}
            className="flex flex-col rounded-sm  text-center outline outline-2 outline-gray-200 my-8"
          >
            <div className="flex flex-1 flex-col p-8 px-12 gap-y-2">
              <p className="text-xl font-medium text-gray-900 pb-4">
                Day / Date
              </p>
              <img
                alt=""
                src={person.imageUrl}
                className="mx-auto aspect-square max-w-36 mb-2"
              />
              <p className="text-lg text-gray-900">Description</p>
              <p className="text-lg text-gray-900">Temperature</p>
              <p className="text-lg text-gray-900">Wind Speed</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
