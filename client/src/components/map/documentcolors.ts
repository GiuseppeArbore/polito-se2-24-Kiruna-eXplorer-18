import { ExpressionSpecification } from 'mapbox-gl';

const documentAreaColorMapping: ExpressionSpecification = [
    'case',
    ['==', ['get', 'type'], 'Informative Document'], '#abc4ab',
    ['==', ['get', 'type'], 'Prescriptive Document'], '#2b9eb3',
    ['==', ['get', 'type'], 'Design Document'], '#fffd82',
    ['==', ['get', 'type'], 'Technical Document'], '#a63446',
    ['==', ['get', 'type'], 'Strategy'], '#6d4c3d',
    ['==', ['get', 'type'], 'Agreement'], '#4fb477',
    ['==', ['get', 'type'], 'Conflict Resolution'], '#474973',
    ['==', ['get', 'type'], 'Consultation'], '#ef8354',
    '#ffcc00' // Default highlight color
];

const documentBorderColorMapping: ExpressionSpecification = [
    'case',
    ['==', ['get', 'type'], 'Informative Document'], '#8a9b8a',
    ['==', ['get', 'type'], 'Prescriptive Document'], '#217a8a',
    ['==', ['get', 'type'], 'Design Document'], '#ccc96a',
    ['==', ['get', 'type'], 'Technical Document'], '#832b36',
    ['==', ['get', 'type'], 'Strategy'], '#55382d',
    ['==', ['get', 'type'], 'Agreement'], '#3a8d5e',
    ['==', ['get', 'type'], 'Conflict Resolution'], '#373a5a',
    ['==', ['get', 'type'], 'Consultation'], '#c66a43',
    '#cc9900' // Default highlight color
];

export { documentAreaColorMapping, documentBorderColorMapping };

