    function createFloorSuffixRegex(config) {
        const floorSuffixes = Object.values(config.floors).map(f => f.suffix);
        return new RegExp(`(${floorSuffixes.join('|')})$`);
    }