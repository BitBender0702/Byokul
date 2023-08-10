export function enumToObjects(enumObj: any): any[] {
    const keys = Object.keys(enumObj).filter(key => isNaN(Number(key)));
    const values = keys.map(key => enumObj[key]);
    return keys.map((key, index) => ({ key, value: values[index] }));
  }