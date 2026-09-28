import { useEffect, useRef, useState } from "react";
import {
  CitySelect,
  CountrySelect,
  GetCity,
  GetCountries,
  GetState,
  StateSelect,
} from "react-country-state-city";
import type { City, Country, State } from "react-country-state-city/dist/esm/types";
import "react-country-state-city/dist/react-country-state-city.css";

function isCountry(value: object): value is Country {
  return "iso2" in value;
}

function isState(value: object): value is State {
  return "state_code" in value;
}

function isCity(value: object): value is City {
  return "latitude" in value && !("state_code" in value) && !("iso2" in value);
}

export default function PlaceSelects({
  country,
  stateName,
  city,
  onCountry,
  onState,
  onCity,
  inputClassName,
  labelClassName,
}: {
  country: string;
  stateName: string;
  city: string;
  onCountry: (name: string) => void;
  onState: (name: string) => void;
  onCity: (name: string) => void;
  inputClassName: string;
  labelClassName: string;
}) {
  const [countryId, setCountryId] = useState(0);
  const [stateId, setStateId] = useState(0);
  const [countryValue, setCountryValue] = useState<Country | undefined>();
  const [stateValue, setStateValue] = useState<State | undefined>();
  const [cityValue, setCityValue] = useState<City | undefined>();
  const [stateHasCities, setStateHasCities] = useState(true);
  const [ready, setReady] = useState(false);
  const countryNameRef = useRef(country);
  const stateNameRef = useRef(stateName);
  const cityNameRef = useRef(city);

  useEffect(() => {
    let cancelled = false;

    const loadSavedPlace = async () => {
      if (!country) {
        setReady(true);
        return;
      }

      const countries = await GetCountries();
      const savedCountry = countries.find((item) => item.name === country);

      if (!savedCountry || cancelled) {
        setReady(true);
        return;
      }

      setCountryId(savedCountry.id);
      setCountryValue(savedCountry);

      if (!stateName) {
        setReady(true);
        return;
      }

      const states = await GetState(savedCountry.id);
      const savedState = states.find((item) => item.name === stateName);

      if (!savedState || cancelled) {
        setReady(true);
        return;
      }

      setStateId(savedState.id);
      setStateValue(savedState);
      setStateHasCities(savedState.hasCities);

      if (city && savedState.hasCities) {
        const cities = await GetCity(savedCountry.id, savedState.id);
        const savedCity = cities.find((item) => item.name === city);
        if (savedCity) {
          setCityValue(savedCity);
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    };

    loadSavedPlace();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <p className="text-xs text-muted-foreground">Loading places...</p>;
  }

  return (
    <>
      <div className="space-y-1.5">
        <label className={labelClassName}>Country</label>
        <CountrySelect
          defaultValue={countryValue as never}
          placeHolder="Select country"
          containerClassName="w-full"
          inputClassName={inputClassName}
          onChange={(selected) => {
            if (!selected || !isCountry(selected)) {
              return;
            }
            countryNameRef.current = selected.name;
            stateNameRef.current = "";
            cityNameRef.current = "";
            setCountryId(selected.id);
            setCountryValue(selected);
            setStateId(0);
            setStateValue(undefined);
            setCityValue(undefined);
            setStateHasCities(true);
            onCountry(selected.name);
            onState("");
            onCity("");
          }}
          onTextChange={(event) => {
            if (event.target.value === countryNameRef.current) {
              return;
            }
            countryNameRef.current = "";
            stateNameRef.current = "";
            cityNameRef.current = "";
            setCountryId(0);
            setStateId(0);
            setStateValue(undefined);
            setCityValue(undefined);
            onCountry("");
            onState("");
            onCity("");
          }}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClassName}>State</label>
        {countryId > 0 ? (
          <StateSelect
            key={countryId}
            countryid={countryId}
            defaultValue={stateValue as never}
            placeHolder="Select state"
            containerClassName="w-full"
            inputClassName={inputClassName}
            onChange={(selected) => {
              if (!selected || !isState(selected)) {
                return;
              }
              stateNameRef.current = selected.name;
              const nextCity = selected.hasCities ? "" : selected.name;
              cityNameRef.current = nextCity;
              setStateId(selected.id);
              setStateValue(selected);
              setStateHasCities(selected.hasCities);
              setCityValue(undefined);
              onState(selected.name);
              onCity(nextCity);
            }}
            onTextChange={(event) => {
              if (event.target.value === stateNameRef.current) {
                return;
              }
              stateNameRef.current = "";
              cityNameRef.current = "";
              setStateId(0);
              setCityValue(undefined);
              onState("");
              onCity("");
            }}
          />
        ) : (
          <input
            type="text"
            value=""
            placeholder="Select a country first"
            disabled
            className={inputClassName}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label className={labelClassName}>City</label>
        {countryId > 0 && stateId > 0 && stateHasCities ? (
          <CitySelect
            key={`${countryId}-${stateId}`}
            countryid={countryId}
            stateid={stateId}
            defaultValue={cityValue as never}
            placeHolder="Select city"
            containerClassName="w-full"
            inputClassName={inputClassName}
            onChange={(selected) => {
              if (!selected || !isCity(selected)) {
                return;
              }
              cityNameRef.current = selected.name;
              setCityValue(selected);
              onCity(selected.name);
            }}
            onTextChange={(event) => {
              if (event.target.value === cityNameRef.current) {
                return;
              }
              cityNameRef.current = "";
              onCity("");
            }}
          />
        ) : (
          <input
            type="text"
            value={stateHasCities ? "" : city}
            placeholder={
              stateId > 0 ? "No city list for this state" : "Select a state first"
            }
            disabled
            className={inputClassName}
          />
        )}
      </div>
    </>
  );
}
