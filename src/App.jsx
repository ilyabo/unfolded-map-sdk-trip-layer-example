import React, {useState, useRef, useEffect} from "react";
import {createMap} from "http://localhost:8090/index.js";
// import { createMap } from "@unfolded/map-sdk";
import {csvParse} from "d3-dsv";
import tripLayerConfig from "../public/data/tripLayerConfig.json";

function layerToLayerCreationProps(layerConfig) {
  const {id, config, type, visualChannels} = layerConfig;
  const {dataId, label, columns, isVisible} = config;
  return {
    id,
    dataId,
    type,
    fields: columns,
    label,
    isVisible,
    config: {...config, visualChannels},
  };
}

async function fetchFlightData() {
  const response = await fetch("/data/flights.csv");
  const data = csvParse(await response.text());
  data.sort((a, b) => a.timestamp - b.timestamp);
  return data;
}

function App() {
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);
  const [layerResult, setLayerResult] = useState("");

  const [flightData, setFlightData] = useState(null);
  useEffect(() => {
    (async () => {
      const flightData = await fetchFlightData();
      setFlightData(flightData);
    })();
  }, []);

  useEffect(() => {
    if (!map || !flightData) {
      return;
    }

    map.setView({
      latitude: 50.47525000000004,
      longitude: 2.726350000000003,
      zoom: 3,
    });
    const dataset1 = map.addDataset(
      {
        id: "flights-1",
        label: "Flights #1",

        data: flightData.slice(0, 15000),
      },
      {autoCreateLayers: false}
    );
    const dataset2 = map.addDataset(
      {
        id: "flights-2",
        label: "Flights #2",
        data: flightData.slice(10000),
      },
      {autoCreateLayers: false}
    );

    map.addLayer(
      layerToLayerCreationProps({
        ...tripLayerConfig,
        id: "flights-1",
        config: {
          ...tripLayerConfig.config,
          label: "flights #1",
          dataId: dataset1.id,
        },
      })
    );

    map.addLayer(
      layerToLayerCreationProps({
        ...tripLayerConfig,
        id: "flights-2",
        config: {
          ...tripLayerConfig.config,
          label: "flights #2",
          dataId: dataset2.id,
        },
      })
    );
  }, [map, flightData]);

  return (
    <div className="App">
      <UnfoldedMap setMap={setMap} />
    </div>
  );
}

function UnfoldedMap({setMap}) {
  const mountContainerRef = useRef(null);

  useEffect(() => {
    const loadMap = async () => {
      const mapInstance = await createMap({});

      setMap(mapInstance);
      mapInstance.addToDOM(mountContainerRef?.current);
    };
    loadMap();
  }, [setMap]);

  return <div className="unfolded" ref={mountContainerRef} />;
}

export default App;
