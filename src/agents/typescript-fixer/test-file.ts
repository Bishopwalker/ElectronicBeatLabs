/**
 * Test file with intentional TypeScript errors
 * This file is used to test the TypeScript Fixer Agent
 */

// TS7006: Parameter implicitly has 'any' type
function processData(data) {
  return data.value;
}

// TS2339: Property does not exist on type
const user = { name: 'John' };
console.log(user.email);

// TS2322: Type not assignable
const count: number = "five";

// TS2304: Cannot find name (missing import)
const [state, setState] = useState();

// TS2532: Object is possibly 'undefined'
function getLength(str?: string) {
  return str.length;
}

// TS2741: Property is missing in type
interface Config {
  url: string;
  timeout: number;
  retries: number;
}

const config: Config = {
  url: 'https://api.example.com',
  timeout: 5000
  // missing 'retries' property
};

// TS2345: Argument type not assignable
function expectNumber(n: number) {
  return n * 2;
}
expectNumber("not a number");

// TS2769: No overload matches this call
interface API {
  get(url: string): Promise<any>;
  get(url: string, params: object): Promise<any>;
}

declare const api: API;
api.get("url", "not an object", "extra param");