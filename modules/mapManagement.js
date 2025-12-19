
/**
 * Initialise ou met à jour la carte OpenLayers
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} nom - Nom de l'établissement
 */

export function updateMap(latitude, longitude, nom, site) {
    const points = [
        { lon: longitude, lat: latitude, name: nom, url: site }
    ];

    // 1. Création du marker
    const features = points.map(p => {
        const f = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([p.lon, p.lat])),
            name: p.name,
            url: p.url
        });

        f.setStyle([
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 14,
                    fill: new ol.style.Fill({ color: 'rgba(59,130,246,0.18)' })
                })
            }),
            new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'https://file.garden/aUQd-zgADia4HDGk/pointer-pin.svg',
                    scale: 0.05,
                    anchor: [0.5, 1]
                }),
                text: new ol.style.Text({
                    text: p.name,
                    offsetY: 25,
                    font: '14px Inter, sans-serif',
                    fill: new ol.style.Fill({ color: '#111827' }),
                    stroke: new ol.style.Stroke({ color: '#ffffff', width: 2 })
                })
            })
        ])
        return f;
    });

    // Création de la couche vectorielle
    const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features })
    });

    // Création du fond de carte
    const baseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attributions: '© OpenStreetMap, © CARTO'
        })
    });

    // Initialisation de la carte
    const map = new ol.Map({
        target: 'map',
        layers: [baseLayer, vectorLayer],
        view: new ol.View({
            center: ol.proj.fromLonLat([longitude, latitude]),
            zoom: 6,
            minZoom: 3,
            maxZoom: 19
        })
    });

    // Ouvrir le lien au clic
    map.on('singleclick', function (evt) {
      map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        const url = feature.get('url');
        if (url) {
          window.open(url, '_blank');
        }
      }, { hitTolerance: 6 });
    });
}