

export const loadIcons = (map: mapboxgl.Map): Promise<void[]> => {
    const icons = [
        { name: 'icon-InformativeDocument', path: '/InformativeDocument.png' },
        { name: 'icon-PrescriptiveDocument', path: '/PrescriptiveDocument.png' },
        { name: 'icon-DesignDocument', path: '/DesignDocument.png' },
        { name: 'icon-TechnicalDocument', path: '/TechnicalDocument.png' },
        { name: 'icon-Strategy', path: '/Strategy.png' },
        { name: 'icon-Agreement', path: '/Agreement.png' },
        { name: 'icon-ConflictResolution', path: '/ConflictResolution.png' },
        { name: 'icon-Consultation', path: '/Consultation.png' },
        { name: 'defult-icon', path: '/Default.png' },
    ];

    const promises = icons.map(icon => {
        return new Promise<void>((resolve, reject) => {
            map.loadImage(icon.path, (error, image) => {
                if (error) {
                    reject(error);
                } else {
                    if (image) {
                        map.addImage(icon.name, image);
                        resolve();
                    } else {
                        reject(new Error('Image is undefined'));
                    }
                    resolve();
                }
            });
        });
    });

    return Promise.all(promises);
};