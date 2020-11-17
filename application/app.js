"use strict";

let step = 0.001;
let current_lng = 0;
let current_lat = 0;
let current_alt;
let current_heading;

let zoom_level = 13;
let current_zoom_level = 13;
let myMarker = "";
let windowOpen = "map";

let tilesLayer;
let tilesUrl;

let map;
let marker_latlng = false;

$(document).ready(function() {

    setTimeout(function() {
        //get location
        getLocation("init");
        ///set default map
        opentopo_map();
        windowOpen = "map";
    }, 0);

    //leaflet add basic map
    map = L.map('map-container', {
        zoomControl: false,
        dragging: false,
        keyboard: true
    }).fitWorld();
    L.control.scale({ position: 'topright', metric: true, imperial: false }).addTo(map);
  
    ////////////////////
    ////MAPS////////////
    ///////////////////

    function opentopo_map() {
        tilesUrl = 'http://tile.opentopomap.org/{z}/{x}/{y}.png'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 17,
            attribution: 'Map data © OpenStreetMap contributors, SRTM<div>Imagery: © OpenTopoMap (CC-BY-SA)</div>'
        });
        map.addLayer(tilesLayer);
    }

    function opencycle_map() {
        tilesUrl = 'http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png32?apikey=5bd2317851a14fcaa3f0986eb79b8725'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 22,
            attribution: 'Map data © OpenStreetMap contributors<div>OpenCycleMap © Thunderforest</div>'
        });
        map.addLayer(tilesLayer);
    }

    function outdoors_map() {
        tilesUrl = 'http://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png32?apikey=5bd2317851a14fcaa3f0986eb79b8725'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 22,
            attribution: 'Map data © OpenStreetMap contributors<div>Outdoors Map © Thunderforest</div>'
        });
        map.addLayer(tilesLayer);
    }

    function osm_map() {
        tilesUrl = 'http://tile.openstreetmap.org/{z}/{x}/{y}.png?'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 18,
            attribution: 'Map data © OpenStreetMap contributors'
        });
        map.addLayer(tilesLayer);
    }

    function worldimagery_map() {
        tilesUrl = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community</div>'
        });
        map.addLayer(tilesLayer);
    }

    function mtb_map() {
        tilesUrl = 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 18,
            attribution: 'Map data © OpenStreetMap contributors, USGS'
        });
        map.addLayer(tilesLayer);
    }

    ////////////////////
    ////GEOLOCATION/////
    ///////////////////
    //////////////////////////
    ////MARKER SET AND UPDATE/////////
    /////////////////////////

    function getLocation(option) {
        marker_latlng = false;
        if (option == "init") {
            toaster("Seeking Position. Press the center key to open the menu.", 10000);
            let options = {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: Infinity
              };
            navigator.geolocation.getCurrentPosition(success, error, options);
        }
        if (option == "update_marker") {
            toaster("Seeking Position...", 2000);
            let options = {
                enableHighAccuracy: true,
                timeout: Infinity,
                maximumAge: 0
              };
            navigator.geolocation.getCurrentPosition(success, error, options);
        }
        function success(pos) {
            let crd = pos.coords;
            current_lat = crd.latitude;
            current_lng = crd.longitude;
            current_alt = crd.altitude;
            current_heading = crd.heading;
            if (option == "init") {
                myMarker = L.marker([current_lat, current_lng]).addTo(map);
                map.flyTo(new L.LatLng(current_lat, current_lng), 13);
                zoom_speed();
                return false;
            }
            if (option == "update_marker" && current_lat != "") {
                myMarker.setLatLng([current_lat, current_lng]).update();
                map.flyTo(new L.LatLng(current_lat, current_lng));
            }
        }
        function error(err) {
            toaster("Position not found. Press center key to search for a location.", 4000);
            return false;
        }
    }

    //////////////////////////
    ////SEARCH BOX////////////
    /////////////////////////

    function showSearch() {
        bottom_bar("Position", "SELECT", "?/About");
        $('div#search-box').css('display', 'block');
        $('div#search-box').find("input").focus();
        $("div#bottom-bar").css("display", "block");
        windowOpen = "search";
    }
    function hideSearch() {
        $("div#bottom-bar").css("display", "none");
        $('div#search-box').css('display', 'none');
        $('div#search-box').find("input").blur();
        windowOpen = "map";
    }


    // ABOUT
    function showAbout() {
        bottom_bar("Close", "SELECT", "About");
        $('div#search-box').css('display', 'none');
        $("div#toast").css("display", "none");
        $('div#search-box').find("input").blur();
        $('div#about').css('display', 'block');
        $("div#bottom-bar").css("display", "block");
        windowOpen = "about";
        nav(1);
    }
    function hideAbout() {
        $("div#bottom-bar").css("display", "none");
        $('div#about').css('display', 'none');
        document.activeElement.blur();
        windowOpen = "map";
    }

    /////////////////////
    ////ZOOM MAP/////////
    ////////////////////

    function ZoomMap(in_out) {
        let current_zoom_level = map.getZoom();
        if (windowOpen == "map" && $('div#search-box').css('display') == 'none') {
            if (in_out == "in") {
                current_zoom_level = current_zoom_level + 1
                map.setZoom(current_zoom_level);
            }
            if (in_out == "out") {
                current_zoom_level = current_zoom_level - 1
                map.setZoom(current_zoom_level);
            }
            zoom_level = current_zoom_level;
            zoom_speed();
        }
    }

    function zoom_speed() {
        if (zoom_level < 2) {
            step = 10;
        }
        if (zoom_level > 2) {
            step = 7.5;
        }
        if (zoom_level > 3) {
            step = 5;
        }
        if (zoom_level > 4) {
            step = 1;
        }
        if (zoom_level > 5) {
            step = 0.50;
        }
        if (zoom_level > 6) {
            step = 0.25;
        }
        if (zoom_level > 7) {
            step = 0.1;
        }
        if (zoom_level > 8) {
            step = 0.075;
        }
        if (zoom_level > 9) {
            step = 0.05;
        }
        if (zoom_level > 10) {
            step = 0.025;
        }
        if (zoom_level > 11) {
            step = 0.01;
        }
        if (zoom_level > 12) {
            step = 0.0075;
        }
        if (zoom_level > 13) {
            step = 0.005;
        }
        if (zoom_level > 14) {
            step = 0.0025;
        }
        if (zoom_level > 15) {
            step = 0.001;
        }
        if (zoom_level > 16) {
            step = 0.0005;
        }
        return step;
    }

    /////////////////////
    //MAP NAVIGATION//
    /////////////////////

    function MovemMap(direction) {
        if (!marker_latlng) {
            if (windowOpen == "map") {
                if (direction == "left") {
                    zoom_speed()
                    current_lng = current_lng - step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "right") {
                    zoom_speed()
                    current_lng = current_lng + step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "up") {
                    zoom_speed()
                    current_lat = current_lat + step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "down") {
                    zoom_speed()
                    current_lat = current_lat - step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
            }
        }

        //when marker is not current location
        //to calculate distance between current position and marker
        if (marker_latlng) {
            if (windowOpen == "map") {
                if (direction == "left") {
                    zoom_speed()
                    marker_lng = marker_lng - step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "right") {
                    zoom_speed()
                    marker_lng = marker_lng + step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "up") {
                    zoom_speed()
                    marker_lat = marker_lat + step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "down") {
                    zoom_speed()
                    marker_lat = marker_lat - step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
            }
        }

    }

    //////////////////////////////
    ////KEYPAD HANDLER////////////
    //////////////////////////////

    let longpress = false;
    const longpress_timespan = 1000;
    let timeout;

    function repeat_action(param) {
        if (windowOpen == "map"){
        switch (param.key) {
            case 'ArrowUp':
                MovemMap("up")
                break;
            case 'ArrowDown':
                MovemMap("down")
                break;
            case 'ArrowLeft':
                MovemMap("left")
                break;
            case 'ArrowRight':
                MovemMap("right")
                break; 
            case 'Enter':
                break;
        }
    }
    }

    ///////////////
    ////SHORTPRESS
    //////////////

    function shortpress_action(param) {
        switch (param.key) {
            case '1':
                map.removeLayer(tilesLayer)
                opentopo_map();
                break;
            case '2':
                map.removeLayer(tilesLayer)
                opencycle_map();
                break;
            case '3':
                map.removeLayer(tilesLayer)
                outdoors_map();
                break;
            case '4':
                map.removeLayer(tilesLayer)
                mtb_map();
                break;
            case '5':
                map.removeLayer(tilesLayer)
                worldimagery_map();
                break;
            case '6':
                map.removeLayer(tilesLayer)
                osm_map();
                break;
            case 'EndCall':
                window.close();
                break;
            case 'Backspace':
                param.preventDefault();
                if (windowOpen == "search") {
                    hideSearch();
                    return false;
                }
                if (windowOpen == "map") {
                    window.close();
                }
                break;
            case 'SoftLeft':
                if (windowOpen == "search") {
                    getLocation("update_marker")
                    hideSearch();
                    return false;
                }
                if (windowOpen == "map") {
                    ZoomMap("out");
                    return false;
                }
                if (windowOpen == "about") {
                    hideAbout();
                    return false;
                }
                break;
            case 'SoftRight':
                if (windowOpen == "search") {
                    showAbout();
                    return false;
                }
                if (windowOpen == "about") {
                    window.open('about.html', "new", "menubar,toolbar,scrollbars");
                    return false;
                    }
                if (windowOpen == "map") {
                    ZoomMap("in");
                }
                break;
            case 'Enter':
                if (windowOpen == "map") {
                    showSearch();
                    return false;
                }
                if (windowOpen == "search") {
                    hideSearch();
                    return false;
                }
                break;
            case 'ArrowRight':
                if (windowOpen == "map") {
                MovemMap("right")
                return false;
                }
                if (windowOpen == "about") {
                nav(1);
                }
                break;
            case 'ArrowLeft':
                if (windowOpen == "map") {
                MovemMap("left")
                return false;
                }
                if (windowOpen == "about") {
                    nav(1);
                }
                break;
            case 'ArrowUp':
                if (windowOpen == "map") {
                MovemMap("up")
                return false;
                }
                if (windowOpen == "about") {
                    nav(1);
                }
                break;
            case 'ArrowDown':
                if (windowOpen == "map") {
                MovemMap("down")
                return false;
                }
                if (windowOpen == "about") {
                nav(1);
                }
                break;
        }
    }

    // D-Pad navigation
    function nav (move) {
        const currentIndex = document.activeElement.tabIndex;
        const next = currentIndex + move;
        const items = document.querySelectorAll('.items');
        const targetElement = items[next];
        targetElement.focus();
      }

    /////////////////////////////////
    ////shortpress / longpress logic
    ////////////////////////////////

    function handleKeyDown(evt) {
        if (!evt.repeat) {
            evt.preventDefault();
            longpress = false;
            timeout = setTimeout(() => {
                longpress = true;
            }, longpress_timespan);
        }
        if (evt.repeat) {
            longpress = false;
            repeat_action(evt);
        }
    }

    function handleKeyUp(evt) {
        evt.preventDefault();
        clearTimeout(timeout);
        if (!longpress) {
            shortpress_action(evt);
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

});
