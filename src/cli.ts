#!/usr/bin/env node
import * as yargs from 'yargs';
import { extname, basename, dirname, join } from 'path';

import { validate } from './validate';

import { bundle } from './bundle';
import { dumpBundle, saveBundle, BundleOutputFormat } from './utils';
import { formatMessages } from './format/format';
import { ResolveError, YamlParseError } from './resolve';
import { loadConfig, Config } from './config/config';
import { NormalizedReportMessage } from './walk';
import { red, green, yellow } from 'colorette';

const outputExtensions = ['json', 'yaml', 'yml'] as ReadonlyArray<BundleOutputFormat>;

yargs // eslint-disable-line
  .command(
    'lint [entrypoints...]',
    'Lint definition',
    (yargs) =>
      yargs
        .positional('entrypoints', {
          array: true,
          type: 'string',
          demandOption: true,
        })
        .option('format', {
          description: 'Reduce output to required minimum.',
          choices: ['short', 'detailed'] as ReadonlyArray<'detailed' | 'short'>,
          default: 'detailed' as 'detailed' | 'short',
        })
        .option('max-messages', {
          requiresArg: true,
          description: 'Reduce output to max N messages.',
          type: 'number',
          default: 100,
        })
        .option('config', {
          description: 'Specify custom config file',
          requiresArg: true,
          type: 'string',
        }),
    async (argv) => {
      const config = await loadConfig(argv.config);
      const entrypoints = getFallbackEntryPointsOrExit(argv.entrypoints, config);

      for (const entryPoint of entrypoints) {
        try {
          console.time(`${entryPoint} validation took`);
          const results = await validate({
            ref: entryPoint,
            config: config.lint,
          });
          console.timeEnd(`${entryPoint} validation took`);

          console.time(`Formatting messages took`);
          formatMessages(results, {
            format: argv.format,
            maxMessages: argv['max-messages'],
          });

          const totals = getTotals(results);
          printLintTotals(totals);

          console.timeEnd(`Formatting messages took`);

          process.exit(totals.errors > 0 ? 1 : 0);
        } catch (e) {
          handleError(e, entryPoint);
        }
      }
    },
  )
  .command(
    'bundle [entrypoints...]',
    'Bundle definition',
    (yargs) =>
      yargs
        .positional('entrypoints', {
          array: true,
          type: 'string',
          demandOption: true,
        })
        .options({
          output: { type: 'string', alias: 'o' },
        })
        .option('format', {
          description: 'Reduce output to required minimum.',
          choices: ['short', 'detailed'] as ReadonlyArray<'detailed' | 'short'>,
          default: 'detailed' as 'detailed' | 'short',
        })
        .option('max-messages', {
          requiresArg: true,
          description: 'Reduce output to max N messages.',
          type: 'number',
          default: 100,
        })
        .option('ext', {
          description: 'Output extension: json, yaml or yml',
          requiresArg: true,
          choices: outputExtensions,
        })
        .option('config', {
          description: 'Specify custom config file',
          type: 'string',
        }),
    async (argv) => {
      const config = await loadConfig(argv.config);
      const entrypoints = getFallbackEntryPointsOrExit(argv.entrypoints, config);

      for (const entrypoint of entrypoints) {
        try {
          console.time(`${entrypoint} bundle took`);

          const { bundle: result, messages } = await bundle({
            config: config.lint,
            ref: entrypoint,
          });

          console.timeEnd(`${entrypoint} bundle took`);

          if (result) {
            const output = dumpBundle(result, argv.ext || 'yaml');
            if (!argv.output) {
              process.stdout.write(output);
            } else {
              let outputFile = argv.output;
              let ext: BundleOutputFormat;
              if (entrypoint.length > 1) {
                ext = argv.ext || extname(entrypoint).substring(1) as BundleOutputFormat;
                if (!outputExtensions.includes(ext as any)) {
                  throw new Error(`Invalid file extension: ${ext}`);
                }
                outputFile = join(dirname(outputFile), basename(outputFile, extname(outputFile))) + '.' + ext;
              } else {
                ext = argv.ext || extname(entrypoint).substring(1) as BundleOutputFormat;
                if (!outputExtensions.includes(ext as any)) {
                  throw new Error(`Invalid file extension: ${ext}`);
                }
                outputFile = join(argv.output, basename(entrypoint, extname(entrypoint))) + '.' + ext;
              }
              saveBundle(argv.output, result, ext);
            }
          }

          console.log(messages.length ? 'Failed to bundle' : 'Bundled successfully');
          formatMessages(messages, {
            format: argv.format,
            maxMessages: argv["max-messages"]
          });
        } catch (e) {
          handleError(e, entrypoint);
        }
      }
    },
  )
  .demandCommand(1)
  .strict().argv;

function handleError(e: Error, ref: string) {
  if (e instanceof ResolveError) {
    process.stdout.write(
      `Failed to resolve entrypoint definition at ${ref}:\n\n  - ${e.message}\n`,
    );
  } else if (e instanceof YamlParseError) {
    process.stdout.write(`Failed to parse entrypoint definition at ${ref}:\n\n  - ${e.message}\n`);
    // TODO: codeframe
  } else {
    process.stdout.write(`Something went wrong when processing ${ref}:\n\n  - ${e.message}\n`);
    throw e;
  }

  process.exit(1);
}

function printLintTotals(totals: Totals) {
  if (totals.errors > 0) {
    process.stderr.write(
      red(
        `❌ Validation failed with ${pluralize('error', totals.errors)} and ${pluralize(
          'warning',
          totals.warnings,
        )}\n`,
      ),
    );
  } else if (totals.warnings > 0) {
    process.stderr.write(green('Woohoo! Your OpenAPI definition is valid 🎉\n'));
    process.stderr.write(yellow(`You have ${pluralize('warning', totals.warnings)}\n`));
  } else {
    process.stderr.write(green('Woohoo! Your OpenAPI definition is valid 🎉\n'));
  }

  console.log();
}

type Totals = {
  errors: number;
  warnings: number;
};

function getTotals(messages: NormalizedReportMessage[]): Totals {
  let errors = 0;
  let warnings = 0;

  for (const m of messages) {
    if (m.severity === 'error') errors++;
    if (m.severity === 'warning') warnings++;
  }

  return {
    errors,
    warnings,
  };
}

function pluralize(label: string, num: number) {
  return num === 1 ? `1 ${label}` : `${num} ${label}s`;
}

function getFallbackEntryPointsOrExit(argsEntrypoints: string[] | undefined, config: Config) {
  let res = argsEntrypoints;
  if (
    (!argsEntrypoints || !argsEntrypoints.length)
    && config.apiDefinitions
    && Object.keys(config.apiDefinitions).length > 0
  ) {
    res = Object.values(config.apiDefinitions);
  } else if (argsEntrypoints && argsEntrypoints.length && config.apiDefinitions) {
    res = res!.map((aliasOrPath) => config.apiDefinitions[aliasOrPath] || aliasOrPath);
  }

  if (!res || !res.length) {
    process.stderr.write('error: missing required argument `entrypoints`\n');
    process.exit(1);
  }

  return res;
}