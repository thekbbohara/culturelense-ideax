"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { getExploreData, toggleVisited } from "@/actions/map";
import { Landmark, Search, Locate, Loader2 } from "lucide-react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Temple {
    id: string;
    name: string;
    geoLocation: string | null;
    description: string;
    imageUrl: string | null;
    lat: number;
    lng: number;
    isVisited: boolean;
}

// Map Events: Update Zoom state
function MapEvents({ setZoom }: { setZoom: (z: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            setZoom(map.getZoom());
        },
    });
    return null;
}

// Search Component
function MapSearch({ temples, onSelect }: { temples: Temple[], onSelect: (id: string) => void }) {
    const map = useMap();
    const [query, setQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    // Fuzzy Search Logic
    const results = useMemo(() => {
        if (!query) return [];
        const q = query.toLowerCase();

        return temples
            .map(t => {
                const name = t.name.toLowerCase();
                // Scoring:
                // 100 = Exact match (starts with)
                // 50 = Contains
                // >0 = Fuzzy sequence match
                let score = 0;
                if (name.startsWith(q)) score = 100;
                else if (name.includes(q)) score = 50;
                else {
                    // Simple sequence match
                    let qIdx = 0;
                    for (let i = 0; i < name.length && qIdx < q.length; i++) {
                        if (name[i] === q[qIdx]) qIdx++;
                    }
                    if (qIdx === q.length) score = 10; // All chars found in order
                }
                return { temple: t, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score) // Sort by score
            .slice(0, 5) // Top 5
            .map(item => item.temple);

    }, [temples, query]);

    const handleSelect = (temple: Temple) => {
        map.flyTo([temple.lat, temple.lng], 16, { animate: true, duration: 1.5 });
        onSelect(temple.id); // Trigger highlight
        setQuery("");
        setShowDropdown(false);
    };

    return (
        <div className="absolute top-4 left-14 z-[1000] w-64 md:w-80 group font-sans">
            {/* Search Input */}
            {/* Fixed visibility issues by using white background and dark text */}
            <div className="relative shadow-lg rounded-full bg-white transition-all hover:shadow-xl border border-transparent focus-within:border-primary/20">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search temples..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full h-11 pl-10 pr-4 rounded-full bg-transparent text-sm outline-none text-neutral-900 placeholder:text-gray-400 font-medium"
                />
            </div>

            {/* Dropdown Results */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                    {results.map((temple) => (
                        <button
                            key={temple.id}
                            onClick={() => handleSelect(temple)}
                            className="text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0 w-full group/item"
                        >
                            <div className="p-2 bg-gray-100 rounded-full flex-shrink-0 group-hover/item:bg-blue-100 transition-colors">
                                <Landmark className="w-4 h-4 text-gray-600 group-hover/item:text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{temple.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                    {temple.description.substring(0, 35)}...
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Location Marker Component
function LocationMarker() {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);

    const handleLocate = () => {
        setIsLocating(true);
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, 15);
            setIsLocating(false);
        }).on("locationerror", function (e) {
            console.error(e);
            setIsLocating(false);
            alert("Could not access your location.");
        });
    };

    return (
        <div className="absolute bottom-4 right-4 z-[1000]">
            <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-md bg-white/90 backdrop-blur-sm hover:bg-white transition-all transform hover:scale-105"
                onClick={handleLocate}
                disabled={isLocating}
                title="Find my location"
            >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
            </Button>
        </div>
    );
}

export default function Map() {
    const queryClient = useQueryClient();
    const [currentZoom, setCurrentZoom] = useState(13);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const markerRefs = useRef<Record<string, L.Marker | null>>({});

    const { data: temples = [] } = useQuery({
        queryKey: ['explore-data'],
        queryFn: () => getExploreData(),
    });

    const { mutate: toggleVisit } = useMutation({
        mutationFn: async (temple: Temple) => {
            return toggleVisited(temple.id, {
                name: temple.name,
                lat: temple.lat.toString(),
                lng: temple.lng.toString(),
            });
        },
        onMutate: async (templeToToggle) => {
            await queryClient.cancelQueries({ queryKey: ['explore-data'] });
            const previousTemples = queryClient.getQueryData<Temple[]>(['explore-data']);

            if (previousTemples) {
                queryClient.setQueryData<Temple[]>(['explore-data'], (old) => {
                    if (!old) return [];
                    return old.map(t =>
                        t.id === templeToToggle.id
                            ? { ...t, isVisited: !t.isVisited }
                            : t
                    );
                });
            }

            return { previousTemples };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousTemples) {
                queryClient.setQueryData(['explore-data'], context.previousTemples);
            }
            toast.error("Failed to update visited status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['explore-data'] });
            queryClient.invalidateQueries({ queryKey: ['user-history'] });
            queryClient.invalidateQueries({ queryKey: ['recent-entities'] });
            queryClient.invalidateQueries({ queryKey: ['recommended-entities'] });
        },
    });

    // Handle Selection: Open Popup
    useEffect(() => {
        if (selectedId && markerRefs.current[selectedId]) {
            markerRefs.current[selectedId]?.openPopup();
        }
    }, [selectedId]);

    const handleToggle = (temple: Temple) => {
        toggleVisit(temple);
    };

    // Refined Sizing Logic
    const getIconSize = (zoom: number) => {
        if (zoom < 12) return 8;  // Tiny dot
        if (zoom < 14) return 20; // Medium icon
        return 40;                // Full size icon
    };

    const iconSize = getIconSize(currentZoom);
    const isTiny = currentZoom < 12;

    const createTempleIcon = (isVisited: boolean, isSelected: boolean) => {
        const color = isVisited ? "#22c55e" : "#0f172a";

        let html: React.ReactNode;

        if (isTiny) {
            html = (
                <div
                    className={cn(
                        "rounded-full shadow-sm transition-all duration-300",
                        isVisited ? 'bg-green-500' : 'bg-slate-700',
                        isSelected && 'ring-2 ring-yellow-400 scale-150'
                    )}
                    style={{ width: "100%", height: "100%", border: '1px solid white' }}
                />
            );
        } else {
            html = (
                <div
                    className={cn(
                        "rounded-full border bg-white shadow-md flex items-center justify-center transition-all duration-300",
                        isVisited ? 'border-green-500' : 'border-slate-900',
                        isSelected && 'border-yellow-400 ring-2 ring-yellow-400 shadow-xl scale-110'
                    )}
                    style={{
                        padding: Math.max(2, iconSize / 8),
                        width: `${iconSize}px`,
                        height: `${iconSize}px`
                    }}
                >
                    <Landmark
                        size={Math.max(8, iconSize * 0.55)}
                        color={color}
                        fill={isVisited ? "#bbf7d0" : "none"}
                    />
                </div>
            );
        }

        const svgString = renderToStaticMarkup(html);

        return L.divIcon({
            className: "bg-transparent",
            html: svgString,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize / 2, iconSize / 2],
            popupAnchor: [0, -iconSize / 2]
        });
    };

    const center: [number, number] = temples.length > 0
        ? [temples[0].lat, temples[0].lng]
        : [27.7172, 85.3240];

    // Nepal geographical boundaries
    const nepalBounds: [[number, number], [number, number]] = [
        [26.3, 80.0],  // Southwest corner
        [30.4, 88.2]   // Northeast corner
    ];

    return (
        <div className="relative h-full w-full overflow-hidden group bg-neutral-100">
            <MapContainer
                center={center}
                zoom={13}
                minZoom={7}
                maxBounds={nepalBounds}
                maxBoundsViscosity={1.0}
                style={{ height: "100%", width: "100%", padding: 0, margin: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEvents setZoom={setCurrentZoom} />
                <MapSearch temples={temples} onSelect={setSelectedId} />
                <LocationMarker />

                {temples.map((temple) => {
                    const isVisited = temple.isVisited; // Directly from prop/query data
                    const isSelected = selectedId === temple.id;

                    return (
                        <Marker
                            key={temple.id}
                            position={[temple.lat, temple.lng]}
                            icon={createTempleIcon(isVisited, isSelected)}
                            ref={(ref) => {
                                if (ref) markerRefs.current[temple.id] = ref;
                            }}
                            eventHandlers={{
                                click: () => setSelectedId(temple.id)
                            }}
                        >
                            {(!isTiny || isSelected) && (
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-bold text-lg mb-1">{temple.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{temple.description}</p>
                                        <Button
                                            size="sm"
                                            variant={isVisited ? "outline" : "default"}
                                            onClick={() => handleToggle(temple)}
                                            className="w-full"
                                        >
                                            {isVisited ? "Mark as Unvisited" : "Mark as Visited"}
                                        </Button>
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
