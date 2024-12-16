

// Tip için varsayılan değer döner
export function getDefaultValueForType(type: string): string {
    switch (type) {
        case 'number': return '0';
        case 'string': return "''";
        case 'boolean': return 'false';
        default: return 'null';
    }
}
