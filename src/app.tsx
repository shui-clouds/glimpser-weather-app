import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LocationApiResponse, LocationResult } from "../types";
import { fetchWeatherData, locationApi } from "../lib";

export default function App() {
  const searchDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [locationSearchResults, setlocationSearchResults] = useState<
    LocationResult[] | undefined
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);

  const queryClient = useQueryClient();

  const weatherQuery = useQuery({
    queryKey: ["weather", selectedLocation?.id],
    queryFn: () =>
      fetchWeatherData(selectedLocation!.longitude, selectedLocation!.latitude),
    enabled: !!selectedLocation,
  });

  const formatLocationResultName = (result: LocationResult) => {
    return Array.from([result.name, result.admin1, result.country])
      .filter((s) => s)
      .join(", ");
  };

  return (
    <main className="flex flex-col justify-center items-center px-12 py-12">
      <h1 className="text-center text-3xl font-semibold">Glimpser ⛅</h1>
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
                setErrorMessage("Please enter 2 or more characters");
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

          {((locationSearchResults && locationSearchResults.length > 0) ||
            errorMessage) && (
            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {errorMessage ? (
                <p className="py-2 pl-3 pr-9 text-gray-600 select-none">
                  {errorMessage}
                </p>
              ) : (
                locationSearchResults!.map((result) => (
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
                ))
              )}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>

      <div className="xl:flex gap-x-6 mt-12">
        {weatherQuery.data?.map((weatherForecast) => (
          <div
            key={weatherForecast.time.getTime()}
            className="flex flex-col rounded-sm  text-center outline outline-2 outline-gray-200 my-8"
          >
            <div className="flex flex-1 flex-col p-8 px-12 gap-y-2 ">
              <p className="text-xl font-medium text-gray-900 pb-4">
                {weatherForecast.time.toLocaleDateString()}
              </p>
              <img
                alt=""
                src={weatherForecast.weatherCodeImage}
                className="mx-auto aspect-square max-w-36 mb-2"
              />
              <p className="text-md font-medium text-gray-900">
                {weatherForecast.weatherCodeCaption}
              </p>
              <p className="text-md text-gray-900">
                High: {weatherForecast.temperature2mMax}°C
              </p>
              <p className="text-md text-gray-900">
                Low: {weatherForecast.temperature2mMin}°C
              </p>
              <p className="text-md text-gray-900">
                Low Apparent: {weatherForecast.apparentTemperatureMin}°C
              </p>
              <p className="text-md text-gray-900">
                High Apparent: {weatherForecast.apparentTemperatureMin}°C
              </p>
              <p className="text-md text-gray-900">
                Wind Speed: {weatherForecast.windSpeed10mMax} mph
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
