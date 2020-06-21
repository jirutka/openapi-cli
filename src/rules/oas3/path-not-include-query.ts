import { Oas3Rule } from '../../visitors';

export const PathNotIncludeQuery: Oas3Rule = () => {
  return {
    PathItem(_operation, { report, key }) {
      if (key.toString().includes('?')) {
        report({
          message: `Don't put query string items in the path, they belong in parameters with in: query.`,
          location: { reportOnKey: true },
        });
      }
    },
  };
};