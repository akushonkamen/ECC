/**
 * Regression tests for issue-number validation in:
 *   scripts/lib/github-coordination/gh-api.js
 *
 * Guards against silent truncation of malformed issue numbers
 * (e.g. "42oops" parsed as 42) and precision loss past
 * Number.MAX_SAFE_INTEGER before any GitHub call or state-store write.
 *
 * Requires gh-api directly so the suite runs without sql.js.
 * Run with: node tests/lib/github-coordination-issue-number.test.js
 */

'use strict';

const assert = require('assert');

const { normalizeIssueNumber } = require('../../scripts/lib/github-coordination/gh-api');

const { test, banner, section, summary } = require('./helpers/mini-test-runner');

let passed = 0;
let failed = 0;

banner('gh-api.js — normalizeIssueNumber validation');

section('accepts well-formed numbers:');

if (test('accepts a plain positive integer string', () => {
  assert.strictEqual(normalizeIssueNumber('42'), 42);
})) passed++; else failed++;

if (test('accepts a plain positive integer number', () => {
  assert.strictEqual(normalizeIssueNumber(42), 42);
})) passed++; else failed++;

if (test('accepts surrounding whitespace', () => {
  assert.strictEqual(normalizeIssueNumber('  7  '), 7);
})) passed++; else failed++;

if (test('accepts an optional leading plus', () => {
  assert.strictEqual(normalizeIssueNumber('+7'), 7);
})) passed++; else failed++;

if (test('accepts leading zeros', () => {
  assert.strictEqual(normalizeIssueNumber('007'), 7);
})) passed++; else failed++;

if (test('accepts Number.MAX_SAFE_INTEGER', () => {
  assert.strictEqual(normalizeIssueNumber('9007199254740991'), 9007199254740991);
})) passed++; else failed++;

section('rejects malformed tokens instead of truncating:');

if (test('rejects trailing garbage after digits ("42oops")', () => {
  assert.throws(() => normalizeIssueNumber('42oops'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects a decimal fraction ("42.9")', () => {
  assert.throws(() => normalizeIssueNumber('42.9'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects exponent notation ("4e2")', () => {
  assert.throws(() => normalizeIssueNumber('4e2'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects digits followed by punctuation ("42,5")', () => {
  assert.throws(() => normalizeIssueNumber('42,5'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects hex notation ("0x10")', () => {
  assert.throws(() => normalizeIssueNumber('0x10'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects an embedded sign ("4-2")', () => {
  assert.throws(() => normalizeIssueNumber('4-2'), /Invalid issue number/);
})) passed++; else failed++;

section('rejects out-of-range and non-positive values:');

if (test('rejects values past Number.MAX_SAFE_INTEGER (2^53+1)', () => {
  assert.throws(() => normalizeIssueNumber('9007199254740993'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects values far past Number.MAX_SAFE_INTEGER', () => {
  assert.throws(() => normalizeIssueNumber('99999999999999999999999'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects zero', () => {
  assert.throws(() => normalizeIssueNumber('0'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects a negative number', () => {
  assert.throws(() => normalizeIssueNumber('-1'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects a bare plus with no digits ("+")', () => {
  assert.throws(() => normalizeIssueNumber('+'), /Invalid issue number/);
})) passed++; else failed++;

section('rejects non-numeric input:');

if (test('rejects an empty string', () => {
  assert.throws(() => normalizeIssueNumber(''), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects a whitespace-only string', () => {
  assert.throws(() => normalizeIssueNumber('   '), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects alphabetic text', () => {
  assert.throws(() => normalizeIssueNumber('abc'), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects null', () => {
  assert.throws(() => normalizeIssueNumber(null), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects undefined', () => {
  assert.throws(() => normalizeIssueNumber(undefined), /Invalid issue number/);
})) passed++; else failed++;

if (test('rejects Infinity ("1e999")', () => {
  assert.throws(() => normalizeIssueNumber('1e999'), /Invalid issue number/);
})) passed++; else failed++;

summary(passed, failed);
