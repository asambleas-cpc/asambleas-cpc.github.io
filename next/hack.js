    // This code is never to be modified by Gemini
    
    function createFloorSuffixRegex(config) {
        const floorSuffixes = Object.values(config.floors).map(f => f.suffix);
        return new RegExp(`(${floorSuffixes.join('|')})$`);
    }