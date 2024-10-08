import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LocationApiResponse, LocationResult } from "../types";
import { fetchWeatherApi } from "openmeteo";

let searchDebounceTimeout: ReturnType<typeof setTimeout>;

const locationApi = "https://geocoding-api.open-meteo.com/v1";

const people = [
  {
    id: 1,
    name: "Jane Cooper",
    title: "Paradigm Representative",
    role: "Admin",
    email: "janecooper@example.com",
    telephone: "+1-202-555-0170",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
  {
    id: 2,
    name: "Jane Test",
    title: "Paradigm Representative",
    role: "Admin",
    email: "janecooper@example.com",
    telephone: "+1-202-555-0170",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
  {
    id: 3,
    name: "Jane Test",
    title: "Paradigm Representative",
    role: "Admin",
    email: "janecooper@example.com",
    telephone: "+1-202-555-0170",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
  {
    id: 4,
    name: "Jane Test",
    title: "Paradigm Representative",
    role: "Admin",
    email: "janecooper@example.com",
    telephone: "+1-202-555-0170",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
  {
    id: 5,
    name: "Jane Test",
    title: "Paradigm Representative",
    role: "Admin",
    email: "janecooper@example.com",
    telephone: "+1-202-555-0170",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
];

export default function App() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const [locationSearchResults, setlocationSearchResults] = useState<
    LocationResult[] | undefined
  >([]);

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

  // const filteredPeople =
  //   searchString === ""
  //     ? people
  //     : people.filter((person) => {
  //         return person.name.toLowerCase().includes(searchString.toLowerCase());
  //       });

  return (
    <main className="flex flex-col justify-center items-center px-12 py-12">
      {/* <p>current: {searchString}</p> */}
      <h1 className="text-center text-3xl font-semibold">Weather App</h1>
      <Combobox
        className="w-full max-w-64"
        as="div"
        value={selectedLocation}
        onChange={setSelectedLocation}
      >
        <div className="relative mt-12">
          <ComboboxInput
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => {
              clearTimeout(searchDebounceTimeout);
              const searchString = event.target.value;
              if (searchString === "") {
                setlocationSearchResults([]);
                return;
              }
              setlocationSearchResults(undefined);
              searchDebounceTimeout = setTimeout(async () => {
                const data: LocationApiResponse = await queryClient.fetchQuery({
                  queryKey: ["search", searchString],
                  queryFn: async () => {
                    const response = await fetch(
                      `${locationApi}/search?name=${searchString}`
                    );
                    const jsonResponse = await response.json();
                    console.log(jsonResponse);
                    return jsonResponse;
                  },
                });
                if (data.results) {
                  setlocationSearchResults(data.results);
                } else {
                  setlocationSearchResults([]);
                }
              }, 500);
            }}
            placeholder="Enter a location..."
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon
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
                  value={`${result.name}, ${result.admin1}, ${result.country}`}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                >
                  <span className="block truncate group-data-[selected]:font-semibold">
                    {`${result.name}, ${result.admin1}, ${result.country}`}
                  </span>

                  <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
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
