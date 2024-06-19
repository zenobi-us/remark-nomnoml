import type { ElementContent } from 'hast';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import type { BlockContent, Code, Parent, Root } from 'mdast';
import { renderSvg } from 'nomnoml';
import type { Plugin } from 'unified';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';

type Ancestors = (Code | Parent)[];
interface NomNomlSucessResult {
  svg: string;
}
interface NomNomlErrorResult {
  error: string;
}

const LANG_CODE = 'nomnoml';

export interface RemarkNomNomlOptions {
  /**
   * Create a fallback node if processing of a diagram fails.
   *
   * @param node The mdast `code` node that couldn't be rendered.
   * @param error The error message that was thrown.
   * @param file The file on which the error occurred.
   * @returns A fallback node to render instead of the invalid diagram. If nothing is returned, the
   *   code block is removed
   */
  errorFallback?: (
    node: Code,
    error: string,
    file: VFile,
  ) => BlockContent | undefined | void;

  style?: string;
}

/**
 * @param options Options that may be used to tweak the output.
 */
const remarkNomnoml: Plugin<[RemarkNomNomlOptions?], Root> = (options) => {
  function nomnoml(code: string): NomNomlSucessResult | NomNomlErrorResult {
    try {
      const style = (options?.style && `${options.style}\n`) || '';

      const svg = renderSvg(`${style}${code}`);

      if (!svg) {
        return {
          error: 'No SVG returned from nomnoml.',
        };
      }

      return { svg };
    } catch (error) {
      const message =
        (error instanceof Error && error.message) ||
        (!!error && String(error)) ||
        'Something went wrong while rendering the nomnoml diagram.';
      return {
        error: message,
      };
    }
  }

  return async function transformer(ast, file) {
    const instances: Ancestors[] = [];
    const errorFallback = options?.errorFallback || null;

    visitParents(
      ast,
      { type: 'code', lang: LANG_CODE },
      (node: Code, ancestors) => {
        instances.push([...ancestors, node]);
      },
    );

    // Nothing to do.
    if (!instances.length) {
      return;
    }

    for (const ancestors of instances) {
      const node = ancestors.at(-1) as Code;
      const parent = ancestors.at(-2) as Parent;
      const nodeIndex = parent.children.indexOf(node);
      const result = nomnoml(node.value);

      /**
       * If the result contains an SVG, we replace the code block with a paragraph containing the
       * SVG as HTML and the parsed HAST children.
       */
      if ('svg' in result) {
        const hChildren = fromHtmlIsomorphic(result.svg, { fragment: true })
          .children as ElementContent[];

        parent.children[nodeIndex] = {
          type: 'paragraph',
          children: [{ type: 'html', value: result.svg }],
          data: { hChildren },
        };

        continue;
      }

      /**
       * If the result contains an error, we either create a fallback node or remove the code block
       * entirely.
       */
      if (errorFallback) {
        const fallback = errorFallback(node, result.error, file);
        if (fallback) {
          parent.children[nodeIndex] = fallback;
        } else {
          parent.children.splice(nodeIndex, 1);
        }
        continue;
      }

      /**
       * If no error fallback is provided, we throw a fatal message.
       * This will cause the process to exit with a non-zero status code.
       */
      const message = file.message(result.error, {
        ruleId: 'remark-nomnoml',
        source: 'remark-nomnoml',
        ancestors,
      });
      message.fatal = true;
      message.url = 'https://zenobi.us/p/posts/2024-02-28-remark-nomnoml';
      throw message;
    }

    return;
  };
};

export { remarkNomnoml };
