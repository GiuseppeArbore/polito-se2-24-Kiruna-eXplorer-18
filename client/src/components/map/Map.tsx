
import mapboxgl, { LngLat, LngLatBounds, LngLatLike } from "mapbox-gl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { featureCollection,area } from "@turf/turf";
import  { documentColorMapping } from "./documentcolors";

import {
  Button,
  Card,
  TabGroup,
  TabList,
  Tab,
  Divider,
  TextInput,
  Icon,
} from "@tremor/react";
import {
  RiCheckFill,
  RiCloseLine,
  RiCrosshair2Fill,
  RiDeleteBinFill,
  RiHand,
  RiInfoI,
  RiInformation2Line,
  RiMapPinLine,
  RiScissorsCutFill,
  RiShapeLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import {PreviewMapDraw ,DocumentMapDraw} from "./DrawBar";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { Feature, FeatureCollection, Position } from "geojson";
import { DrawCreateEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { coordDistance } from "../../utils";
import { RiFileLine } from "@remixicon/react";
import { KxDocument } from "../../model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropDownMenu";
import "../../index.css";
import "../../css/map.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGxzdGUiLCJhIjoiY20ydWhhNWV1MDE1ZDJrc2JkajhtZWk3cyJ9.ptoCifm6vPYahR3NN2Snmg";

export interface SatMapProps {
  drawing: FeatureCollection | undefined;
  zoom?: number;
  style?: React.CSSProperties;
  className?: string;
  entireMunicipalityDocuments?: KxDocument[];
}

const defaultZoom = 12;
const center: LngLatLike = [20.26, 67.845];

export const PreviewMap: React.FC<SatMapProps> = (props) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      //style: "mapbox://styles/mapbox/satellite-streets-v12",
      style: "mapbox://styles/mapbox/light-v11",
      center: center,
      zoom: props.zoom || defaultZoom,
      pitch: 40,
      interactive: false,
    });
    mapRef.current.addControl(PreviewMapDraw, "bottom-right");
    if (props.drawing) PreviewMapDraw.set(props.drawing);
  }, [mapContainerRef.current]);

  useMemo(() => {
    if (props.drawing) {
      mapRef.current?.remove();
      mapRef.current = null;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: center,
        zoom: props.zoom || defaultZoom,
        pitch: 40,
        interactive: false,
      });
      mapRef.current.addControl(PreviewMapDraw, "bottom-right");
      if (props.drawing) PreviewMapDraw.set(props.drawing);
    }
  }, [props.drawing]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.setZoom(props.zoom || defaultZoom);
  }, [props.zoom]);

  return (
    <div
      className={props.className}
      ref={mapContainerRef}
      id="map"
      style={{
        ...props.style,
        ...{ pointerEvents: "none", touchAction: "none" },
      }}
    ></div>
  );
};

export const DashboardMap: React.FC<SatMapProps> = (props) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: center,
      zoom: props.zoom || defaultZoom,
      pitch: 40,
      interactive: true,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
  }, [mapContainerRef.current]);

  useEffect(() => {
    if (props.drawing) {
      mapRef.current?.remove();
      mapRef.current = null;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: center,
        zoom: props.zoom || defaultZoom,
        pitch: 40,
        interactive: true,
      });

      mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
      mapRef.current.addControl(
        new mapboxgl.FullscreenControl(),
        "bottom-right"
      );

     
      mapRef.current.on("load", function () {
        

      
        //SOURCES------------------------------------------------------------
        const pointsAndCentroids = {
          type: 'FeatureCollection',
          features: props.drawing?.features.flatMap(feature => {
            const features = [feature];
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
              let centroid = turf.pointOnFeature(feature);
              centroid.properties = { ...feature.properties };
              features.push(centroid);
            }
            return features;
          })
        };

        
        mapRef.current?.addSource('pointsAndCentroids', {
          type: 'geojson',
          data: pointsAndCentroids as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 20 
        });

      
        //POINTS-----------------------------------------------------------------
        mapRef.current?.addLayer({
          id: 'points',
          type: 'circle',
          source: 'pointsAndCentroids',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 10,
            'circle-color': '#ffffff'
          }
        });
        mapRef.current?.addLayer({
          id: 'highlight-point',
          type: 'circle',
          source: 'pointsAndCentroids',
          paint: {
            'circle-radius': 10,
            'circle-color':documentColorMapping,
            'circle-opacity': 1
          },
          filter: ['==', 'highlight', 'false'] // Initially not highlighted
        });
        
        mapRef.current?.on('mouseenter', 'points', function (e) {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = 'pointer';
          }
          if (!e.features || e.features.length === 0) return;
          const coordinates = (e.features[0].geometry as any).coordinates.slice();
          const title = e.features[0].properties?.title;
        
          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
        
          new mapboxgl.Popup({ closeButton: false })
            .setLngLat(coordinates)
            .setHTML(`<h3>Document Title:</h3><p>${title}</p>`)
            .addTo(mapRef.current!);
        
          // Change color of the point on hover

    // Cambia il colore del punto al passaggio del cursore
    const id = e.features[0].properties?.id;
    const type = e.features[0].properties?.type;
  

    // Cambia il colore del punto quando il mouse è sopra
    if (id) {
    
      mapRef.current?.setFilter('highlight-point', ['==', 'id', id]);

     
    }
        });
      
        mapRef.current?.on('mouseleave', 'points', function () {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = '';
          }
          const popup = document.querySelector('.mapboxgl-popup');
          if (popup) popup.remove();
      
          // Reset color of the point on mouse leave

          mapRef.current?.setFilter('highlight-area', ['==', 'highlight', 'false']);
          mapRef.current?.setFilter('highlight-point', ['==', 'highlight', 'false']);
        });
      
        // Add click interaction
        mapRef.current?.on('click', 'points', function (e) {
          if (!e.features || e.features.length === 0) return;
          const id = e.features[0].properties?.id;
          if (id) {
            window.location.href = `/documents/${id}`;
          }
        });

        //CLUSTERS--------------------------------------------------------------
        mapRef.current?.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'pointsAndCentroids',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#51bbd6',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ]
          }
        });
      
        mapRef.current?.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'pointsAndCentroids',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
      
        // Zoom into cluster on click
        mapRef.current?.on('click', 'clusters', function (e) {
          const features = mapRef.current?.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          if (features && features.length > 0) {
            const clusterId = features[0]?.properties?.cluster_id;
            const source = mapRef.current?.getSource('pointsAndCentroids');
            if (source && 'getClusterExpansionZoom' in source) {
              (source as any).getClusterExpansionZoom(
                clusterId,
                function (err: any, zoom: any) {
                  if (err) return;
      
                  mapRef.current?.easeTo({
                    center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
                    zoom: zoom
                  });
                }
              );
            }
          }
        });
      
        // Show titles of documents in cluster on hover
        mapRef.current?.on('mouseenter', 'clusters', function (e) {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = 'pointer';
          }
          if (!e.features || e.features.length === 0) return;
          const clusterId = e.features[0]?.properties?.cluster_id;
          const source = mapRef.current?.getSource('pointsAndCentroids');
          if (source && 'getClusterLeaves' in source) {
            (source as any).getClusterLeaves(
              clusterId,
              Infinity,
              0,
              function (err: any, leaves: any) {
                if (err) return;
      
                const titles = leaves.map((leaf: any) => leaf.properties.title).join('<br>');
                const coordinates = (e.features?.[0].geometry as any).coordinates.slice();
      
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
      
                new mapboxgl.Popup({ closeButton: false })
                  .setLngLat(coordinates)
                  .setHTML(`<h3>Documents Titles:</h3><p>${titles}</p>`)
                  .addTo(mapRef.current!);
              }
            );
          }
        });
      
        mapRef.current?.on('mouseleave', 'clusters', function () {
          if (mapRef.current) {
            mapRef.current.getCanvas().style.cursor = '';
          }
          const popup = document.querySelector('.mapboxgl-popup');
          if (popup) popup.remove();
        });
      });

      
    }
  }, [props.drawing]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.setZoom(props.zoom || defaultZoom);
  }, [props.zoom]);

  return (
    <>
      <div
        className={props.className}
        ref={mapContainerRef}
        id="map"
        style={{
          ...props.style,
          pointerEvents: "auto",
          touchAction: "auto",
        }}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button className="button-whole-Kiruna" variant="primary">
            <div style={{ display: "flex", alignItems: "center" }}>
              Whole Kiruna: {props.entireMunicipalityDocuments?.length}
              <RiFileLine
                style={{
                  fontSize: "1rem",
                  color: "#4A4A4A",
                  transform: "scale(0.80)",
                }}
              />
              <RiArrowDownSLine
                style={{
                  fontSize: "1rem",
                  color: "#4A4A4A",
                  marginLeft: "0.25rem",
                }}
              />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Documents</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {props.entireMunicipalityDocuments?.map((doc, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => (window.location.href = `/documents/${doc._id}`)}
              >
                {doc.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const DocumentPageMap: React.FC<SatMapProps> = (props) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: center,
      zoom: props.zoom || defaultZoom,
      pitch: 40,
      interactive: true,
    });

    mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    mapRef.current.addControl(DocumentMapDraw, "bottom-right");
    
    mapRef.current.on("load", function () {
      DocumentMapDraw.changeMode("static");
    })

  }, [mapContainerRef.current]);

  useEffect(() => {
    if (props.drawing) {
      mapRef.current?.remove();
      mapRef.current = null;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: center,
        zoom: props.zoom || defaultZoom,
        pitch: 40,
        interactive: true,
      });

      mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
      mapRef.current.addControl(
        new mapboxgl.FullscreenControl(),
        "bottom-right"
      );
      mapRef.current.addControl(DocumentMapDraw, "bottom-right");

      mapRef.current.on("load", function () {
        DocumentMapDraw.changeMode("static");
      })

      if (props.drawing) {

        DocumentMapDraw.set(props.drawing);
      }
    }
  }, [props.drawing]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.setZoom(props.zoom || defaultZoom);
  }, [props.zoom]);

  return (
    <>
      <div
        className={props.className}
        ref={mapContainerRef}
        id="map"
        style={{
          ...props.style,
          pointerEvents: "auto",
          touchAction: "auto",
        }}
      />
    </>
  );
};

interface MapControlsProps {
  // path type is temporary
  onDone: (path: FeatureCollection) => void;
  onCancel: () => void;
  drawing: FeatureCollection | undefined;
}

const MapControls: React.FC<
  MapControlsProps & {
    bounds: LngLatBounds | null;
    flyTo: (coords: LngLatLike) => void;
    setFeature: (_: Feature) => void;
  }
> = (props) => {
  const [index, setIndex] = useState(0);
  const [pointCoords, setPointCoords] = useState<[string, string]>(["", ""]);
  const [coordsError, setCoordsError] = useState(false);
  function str2pos(str: [string, string]): Position {
    return [Number(str[0]), Number(str[1])];
  }
  function pos2str(pos: Position): [string, string] {
    return [pos[0].toString(), pos[1].toString()];
  }

  const emptyPointFeature: Feature = {
    type: "Feature",
    properties: {},
    geometry: { type: "Point", coordinates: [] },
  };
  // structuredClone is necessary to avoid modifying the prop's original value.
  const feature = structuredClone(props?.drawing?.features?.at?.(0));
  const geometry = feature?.geometry;
  const pos = geometry?.type === "Point" ? geometry.coordinates : [NaN, NaN];

  useEffect(() => {
    if (geometry?.type === "Point") {
      setIndex(1);
      setPointCoords(pos2str(pos));
    } else if (geometry?.type === "Polygon") {
      setIndex(2);
    }
  }, [geometry?.type, pos?.[0], pos?.[1]]);

  useEffect(() => {
    const dist = coordDistance(
      center.toReversed() as [number, number],
      str2pos(pointCoords).toReversed() as [number, number]
    );
    if (dist <= 100 || pointCoords.find((c) => c === "") !== undefined) {
      setCoordsError(false);
    } else {
      setCoordsError(true);
    }
    if (
      index === 1 &&
      PreviewMapDraw.getMode() === "simple_select" &&
      pointCoords.every((c) => c === "")
    ) {
      PreviewMapDraw.deleteAll();
      PreviewMapDraw.changeMode("draw_point");
    }
  }, [pointCoords[0], pointCoords[1]]);

  // Note:
  // React's useEffect() are run starting from the children. This means that we cannot change
  // DrawPolygone's mode in the MapControls component's useEffect because it is not going to
  // be completely initialized and it's going to cause an exception.

  return (
    <Card className="ring-transparent absolute top-0 sm:m-2 right-0 xsm:w-full sm:w-80 backdrop-blur bg-white/50">
      <TabGroup
        className="mt-1 flex justify-center"
        index={index}
        onIndexChange={(i) => {
          PreviewMapDraw.deleteAll();
          switch (i) {
            default: // case 0
              PreviewMapDraw.changeMode("simple_select");
              break;
            case 1:
              PreviewMapDraw.changeMode("draw_point");
              break;
            case 2:
              PreviewMapDraw.changeMode("draw_polygon");
              break;
          }
          setIndex(i);
        }}
      >
        <TabList variant="solid">
          <Tab value="1" icon={RiHand}>
            Drag
          </Tab>
          <Tab value="2" icon={RiMapPinLine}>
            Point
          </Tab>
          <Tab value="3" icon={RiShapeLine}>
            Area
          </Tab>
        </TabList>
      </TabGroup>
      <div className="mt-4 px-2">
        {index === 0 ? (
          <></>
        ) : index === 1 ? (
          <>
            <p className="text-sm italic mx-2">
              Click on the map or type the coordinates to add a Point
            </p>
            <div className="mt-2">
              <TextInput
                value={pointCoords[0]}
                onValueChange={(longitude) => {
                  const tmp = Number(longitude);
                  if (tmp < 0 || tmp > 180) return;
                  const newCoords: [string, string] = [
                    isNaN(tmp) ? pointCoords[0] : longitude,
                    pointCoords[1],
                  ];
                  setPointCoords(newCoords);
                  if (newCoords.every((c) => !isNaN(Number(c)) && c !== "")) {
                    let tmp =
                      feature?.geometry.type === "Point"
                        ? feature
                        : emptyPointFeature;
                    tmp.geometry = {
                      ...tmp.geometry,
                      type: "Point",
                      coordinates: str2pos(newCoords),
                    };
                    PreviewMapDraw.changeMode("simple_select");
                    PreviewMapDraw.set({
                      type: "FeatureCollection",
                      features: [tmp],
                    });
                  }
                }}
                error={coordsError}
                icon={() => (
                  <p className="dark:border-dark-tremor-border border-r h-full text-tremor-default italic text-end text-right tremor-TextInput-icon shrink-0 h-5 w-16 mx-1.5 absolute left-0 flex items-center text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                    Longitude
                  </p>
                )}
                className="mt-1 pl-9 rounded-b-none"
              />
              <TextInput
                value={pointCoords[1]}
                onValueChange={(latitude) => {
                  const tmp = Number(latitude);
                  if (tmp < -90 || tmp > 90) return;
                  const newCoords: [string, string] = [
                    pointCoords[0],
                    isNaN(tmp) ? pointCoords[1] : latitude,
                  ];
                  setPointCoords(newCoords);
                  if (newCoords.every((c) => !isNaN(Number(c)) && c !== "")) {
                    let tmp =
                      feature?.geometry.type === "Point"
                        ? feature
                        : emptyPointFeature;
                    tmp.geometry = {
                      ...tmp.geometry,
                      type: "Point",
                      coordinates: str2pos(newCoords),
                    };
                    PreviewMapDraw.changeMode("simple_select");
                    PreviewMapDraw.set({
                      type: "FeatureCollection",
                      features: [tmp],
                    });
                  }
                }}
                error={coordsError}
                errorMessage="All points must be within 100Km of Kiruna"
                icon={() => (
                  <p className="dark:border-dark-tremor-border border-r h-full text-tremor-default italic text-end text-right tremor-TextInput-icon shrink-0 h-5 w-16 mx-1.5 absolute left-0 flex items-center text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
                    Latitude
                  </p>
                )}
                className="pl-9 border-t-0 rounded-t-none"
              />
              {!coordsError &&
              pointCoords.every((c) => c !== "") &&
              !props.bounds?.contains(str2pos(pointCoords) as LngLatLike) ? (
                <div className="flex justify-center mt-2">
                  <Button
                    icon={RiCrosshair2Fill}
                    size="xs"
                    variant="light"
                    onClick={() => {
                      props.flyTo(str2pos(pointCoords) as LngLatLike);
                    }}
                  >
                    Navigate to point
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex justify-center ">
              <Button
                size="xs"
                variant="secondary"
                icon={RiDeleteBinFill}
                color="red"
                className="flex-1"
                onClick={() => {
                  setPointCoords(["", ""]);
                  PreviewMapDraw.deleteAll();
                  PreviewMapDraw.changeMode("draw_point");
                }}
              >
                Remove point
              </Button>
            </div>
          </>
        ) : index === 2 ? (
          <>
            <p className="text-sm italic mx-2">
              Click to add points; to terminate a selection, double click on the
              last point.
            </p>
            <div className="mt-2 flex justify-center space-x-2">
              <Button
                size="xs"
                variant="secondary"
                icon={RiDeleteBinFill}
                color="red"
                className="flex-1"
                onClick={() => {
                  PreviewMapDraw.deleteAll();
                  PreviewMapDraw.changeMode("draw_polygon");
                }}
              >
                Remove area
              </Button>
              <Button
                size="xs"
                variant="secondary"
                icon={RiScissorsCutFill}
                className="flex-1"
                onClick={() => {
                  if (PreviewMapDraw.getMode() === "draw_polygon") return;
                  const features = PreviewMapDraw.getAll().features.map(
                    (f: any) => f.id
                  );
                  if (features.length === 0) return;
                  PreviewMapDraw.changeMode("simple_select", {
                    featureIds: features,
                  });
                  PreviewMapDraw.changeMode("cut_polygon");
                }}
              >
                Cut in shape
              </Button>
            </div>
          </>
        ) : null}
      </div>
      <Divider />
      <div className="px-2 flex justify-between space-x-2">
        <Button
          size="xs"
          variant="secondary"
          icon={RiCloseLine}
          onClick={props.onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          disabled={coordsError}
          size="xs"
          variant="primary"
          icon={RiCheckFill}
          onClick={() => {
            // This changeMode is necessary, otherwise the MapDraw might contain malformed data
            PreviewMapDraw.changeMode("simple_select");
            props.onDone(PreviewMapDraw.getAll());
          }}
          className="flex-1"
        >
          Save
        </Button>
      </div>
    </Card>
  );
};

export const SatMap: React.FC<SatMapProps & MapControlsProps> = (props) => {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [tmpDrawing, setTmpDrawing] = useState<FeatureCollection | undefined>(
    props.drawing
  );
  const [mapBounds, setMapBounds] = useState<LngLatBounds | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: center,
      zoom: props.zoom || defaultZoom,
      pitch: 40,
    });
    mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-right");
    mapRef.current.addControl(PreviewMapDraw, "top-left");
    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

    mapRef.current.on("move", (e) => {
      setMapBounds(e.target.getBounds());
    });
    mapRef.current.on("draw.create", (e: DrawCreateEvent) => {
      setTmpDrawing({ type: "FeatureCollection", features: e.features });
    });
    mapRef.current.on("draw.delete", () => {
      setTmpDrawing(undefined);
    });
    mapRef.current.on("draw.update", (e: DrawUpdateEvent) => {
      setTmpDrawing({ type: "FeatureCollection", features: e.features });
    });

    if (props.drawing) {
      PreviewMapDraw.set(props.drawing);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    map.setZoom(props.zoom || defaultZoom);
  }, [props.zoom]);

  return (
    <>
      <div
        className={props.className}
        ref={mapContainerRef}
        id="map"
        style={props.style}
      />
      <MapControls
        onCancel={props.onCancel}
        onDone={props.onDone}
        setFeature={(f) => {
          PreviewMapDraw.set({ type: "FeatureCollection", features: [f] });
        }}
        drawing={tmpDrawing}
        bounds={mapBounds}
        flyTo={(coords: LngLatLike) => {
          mapRef.current?.flyTo({
            center: coords,
            zoom: props.zoom || defaultZoom,
          });
        }}
      />
    </>
  );
};
