# @zenobius/remark-nomnoml

A remark plugin that renders nomnoml diagrams inline as svg.

## Usage

````ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkNomnoml from '@zenobius/remark-nomnoml';
import remarkStringify from 'remark-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkNomnoml)
  .use(remarkStringify);

const input = '```nomnoml\n
#stroke: #a86128\n
#direction: down\n
[<frame>Decorator pattern|\n
  [<abstract>Component||+ operation()]\n
  [Client] depends --> [Component]\n
  [Decorator|- next: Component]\n
  [Decorator] decorates -- [ConcreteComponent]\n
  [Component] <:- [Decorator]\n
  [Component] <:- [ConcreteComponent]\n
]\n
```\n';

const output = processor.processSync(input);
console.log(output.contents);
````

<!--- @@inject: dist/docs/modules.md#Functions --->

## Functions

### <a id="remarknomnoml" name="remarknomnoml"></a> remarkNomnoml

▸ **remarkNomnoml**(`this`, `...parameters`): `undefined` | `void` | `Transformer`<`Root`, `Root`>

#### Parameters

| Name            | Type                                                                         |
| :-------------- | :--------------------------------------------------------------------------- |
| `this`          | `Processor`<`undefined`, `undefined`, `undefined`, `undefined`, `undefined`> |
| `...parameters` | \[RemarkNomNomlOptions?]                                                     |

#### Returns

`undefined` | `void` | `Transformer`<`Root`, `Root`>

<!--- @@inject-end: dist/docs/modules.md#Functions --->

<!--- @@inject: dist/docs/interfaces/RemarkNomNomlOptions.md#Properties --->

## Properties

### <a id="errorfallback" name="errorfallback"></a> errorFallback

• `Optional` **errorFallback**: (`node`: `Code`, `error`: `string`, `file`: `VFile`) => `undefined` | `void` | `BlockContent`

Create a fallback node if processing of a diagram fails.

#### Type declaration

▸ (`node`, `error`, `file`): `undefined` | `void` | `BlockContent`

##### Parameters

| Name    | Type     | Description                                      |
| :------ | :------- | :----------------------------------------------- |
| `node`  | `Code`   | The mdast `code` node that couldn't be rendered. |
| `error` | `string` | The error message that was thrown.               |
| `file`  | `VFile`  | The file on which the error occurred.            |

##### Returns

`undefined` | `void` | `BlockContent`

---

### <a id="style" name="style"></a> style

• `Optional` **style**: `string`

<!--- @@inject-end: dist/docs/interfaces/RemarkNomNomlOptions.md#Properties --->
