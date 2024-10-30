import * as fs from 'node:fs';
import * as path from 'node:path';
import { Characteristic, Service } from 'hap-nodejs';

/** Generate Service Types */

const ServicesTypesMap = new Map<string, string>();
const ServicesMap = new Map<string, string>();

for (const [name, value] of Object.entries(Service)) {
  if (value.UUID && !ServicesTypesMap.has(value.UUID)) {
    ServicesTypesMap.set(value.UUID, name);
    ServicesMap.set(name, value.UUID);
  }
}

// Create output for ServicesTypes and Service objects
const ServicesTypes = [
  'export const ServicesTypes = {',
  ...Array.from(ServicesTypesMap, ([uuid, name]) => `  '${uuid}': '${name}',`),
  '};\n\n'
].join('\n');

const Services = [
  'export const Service = {',
  ...Array.from(ServicesMap, ([name, uuid]) => `  ${name}: '${uuid}',`),
  '};\n\n'
].join('\n');

/** Generate Characteristic Types */

const CharacteristicsTypesMap = new Map<string, string>();
const CharacteristicsMap = new Map<string, string>();

for (const [name, value] of Object.entries(Characteristic)) {
  if (value.UUID && !CharacteristicsTypesMap.has(value.UUID)) {
    CharacteristicsTypesMap.set(value.UUID, name);
    CharacteristicsMap.set(name, value.UUID);
  }
}

// Create output for CharacteristicsTypes and Characteristic objects
const CharacteristicsTypes = [
  'export const CharacteristicsTypes = {',
  ...Array.from(CharacteristicsTypesMap, ([uuid, name]) => `  '${uuid}': '${name}',`),
  '};\n\n'
].join('\n');

const Characteristics = [
  'export const Characteristic = {',
  ...Array.from(CharacteristicsMap, ([name, uuid]) => `  ${name}: '${uuid}',`),
  '};\n'
].join('\n');

// Write the final file
const out = `/* This file is automatically generated, and can be rebuilt with the command 'npm run build:gen-hap-types' */\n\n${ServicesTypes}${Services}${CharacteristicsTypes}${Characteristics}`;
fs.writeFileSync(path.resolve(__dirname, '../src/hap-types.ts'), out, 'utf8');
