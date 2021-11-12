import { ERROR_INVALID_NODEID } from '@craftjs/utils';
import invariant from 'tiny-invariant';

import { adaptLegacyNode } from './types';

import { EditorStore, NodeSelectorWrapper, NodeSelector } from '../interfaces';

type config = { existOnly: boolean; idOnly: boolean };
export const getNodesFromSelector = (
  store: EditorStore,
  selector: NodeSelector,
  config?: Partial<config>
): NodeSelectorWrapper[] => {
  const nodes = store.getState().nodes;
  const items = Array.isArray(selector) ? selector : [selector];

  const mergedConfig = {
    existOnly: false,
    idOnly: false,
    ...(config || {}),
  };

  const nodeSelectors = items
    .filter((item) => !!item)
    .map((item) => {
      if (typeof item === 'string') {
        return {
          node: nodes[item],
          exists: !!nodes[item],
        };
      }

      if (typeof item === 'object' && !mergedConfig.idOnly) {
        const node = adaptLegacyNode(item, store.getState().resolver);
        return {
          node,
          exists: !!nodes[node.id],
        };
      }

      return {
        node: null,
        exists: false,
      };
    });

  if (mergedConfig.existOnly) {
    invariant(
      nodeSelectors.filter((selector) => !selector.exists).length === 0,
      ERROR_INVALID_NODEID
    );
  }

  return nodeSelectors;
};