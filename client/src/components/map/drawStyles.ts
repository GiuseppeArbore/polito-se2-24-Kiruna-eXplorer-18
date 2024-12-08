const customDrawStyles = [
    {
        'id': 'gl-draw-polygon-fill-informative',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Informative Document']],
        'paint': {
            'fill-color': '#abc4ab',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-informative',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Informative Document']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#8a9b8a',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-prescriptive',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Prescriptive Document']],
        'paint': {
            'fill-color': '#2b9eb3',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-prescriptive',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Prescriptive Document']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#217a8a',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-design',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Design Document']],
        'paint': {
            'fill-color': '#fffd82',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-design',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Design Document']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#ccc96a',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-technical',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Technical Document']],
        'paint': {
            'fill-color': '#a63446',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-technical',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Technical Document']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#832b36',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-strategy',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Strategy']],
        'paint': {
            'fill-color': '#6d4c3d',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-strategy',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Strategy']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#55382d',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-agreement',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Agreement']],
        'paint': {
            'fill-color': '#4fb477',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-agreement',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Agreement']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#3a8d5e',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-conflict',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Conflict Resolution']],
        'paint': {
            'fill-color': '#474973',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-conflict',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Conflict Resolution']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#373a5a',
            'line-width': 2
        }
    },
    {
        'id': 'gl-draw-polygon-fill-consultation',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Consultation']],
        'paint': {
            'fill-color': '#ef8354',
            'fill-opacity': 0.5
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-consultation',
        'type': 'line',
        'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'user_type', 'Consultation']],
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#c66a43',
            'line-width': 2
        }
    }
];


export default customDrawStyles;