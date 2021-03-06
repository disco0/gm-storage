const test                        = require('ava')
const { setBackingStore, ...API } = require('./_util.js')

Object.assign(global, API)

const GMStorage = require('..') // must be loaded after the API has been defined

const COUNT = 10

test.beforeEach(t => {
    const $store = new Map()

    setBackingStore($store)

    const store = new GMStorage()

    t.is($store.size, 0)
    t.is(store.size, 0)
    t.not(store, $store)

    for (let i = 1; i <= COUNT; ++i) {
        const key = `key-${i}`
        const value = `value-${i}`
        t.is(store.size, i - 1)
        t.is(store.has(key), false)
        store.set(key, value)
        t.is(store.has(key), true)
        t.is(store.size, i)
    }

    t.is(store.size, COUNT)
    t.context.store = store
})

test('clear', t => {
    const { store } = t.context

    t.is(store.size, COUNT)
    store.clear()
    t.is(store.size, 0)
})

test('delete', t => {
    const { store } = t.context

    t.is(store.size, COUNT)

    for (let i = COUNT; i >= 1; --i) {
        const notAKey = `no-such-key-${i}`
        const key = `key-${i}`

        t.is(store.size, i)
        t.is(store.delete(notAKey), false)
        t.is(store.size, i)
        t.is(store.delete(key), true)
        t.is(store.size, i - 1)
    }

    t.is(store.size, 0)
})

test('entries', t => {
    const { store } = t.context

    // XXX we'd like to dump the entries as a plain object (it's more readable
    // in the (Markdown) snapshot), but `Object.fromEntries` isn't supported by
    // Node.js v10, and it's not worth transpiling the tests for one method, so
    // this will have to do for now
    const entries = Array.from(store.entries())

    t.snapshot(entries)
})

test('forEach', t => {
    const { store } = t.context
    const $this = {}
    const seen = {}

    store.forEach(function (value, key, _store) {
        t.is(this, $this)
        t.is(_store, store)
        seen[key] = value
    }, $this)

    t.snapshot(seen)
})

test('get', t => {
    const { store } = t.context
    const $default = Symbol('default')

    for (let i = 1; i <= COUNT; ++i) {
        const notAKey = `no-such-key-${i}`
        const key = `key-${i}`
        const value = `value-${i}`

        t.is(store.get(key), value)
        t.is(store.get(notAKey), undefined)
        t.is(store.get(key, $default), value)
        t.is(store.get(notAKey, $default), $default)
    }
})

test('has', t => {
    const { store } = t.context

    for (let i = 1; i <= COUNT; ++i) {
        const key = `key-${i}`
        const notAKey = `no-such-key-${i}`

        t.is(store.has(key), true)
        t.is(store.has(notAKey), false)
    }
})

test('keys', t => {
    const { store } = t.context
    t.snapshot(store.keys())
})

test('set', t => {
    const { store } = t.context

    store.clear()

    for (let i = 1; i <= COUNT; ++i) {
        const key = `set-key-${i}`
        const value = `set-value-${i}`

        t.is(store.size, i - 1)
        t.is(store.get(key), undefined)
        t.is(store.has(key), false)
        t.is(store.set(key, value), store)
        t.is(store.get(key), value)
        t.is(store.has(key), true)
        t.is(store.size, i)
    }

    const entries = Array.from(store.entries())

    t.snapshot(entries)
})

test('size', t => {
    const { store } = t.context

    for (let i = 1; i <= COUNT; ++i) {
        store.clear()

        t.is(store.size, 0)

        for (let j = 1; j <= i; ++j) {
            store.set(j, j)
        }

        t.is(store.size, i)
    }
})

test('values', t => {
    const { store } = t.context
    t.snapshot(Array.from(store.values()))
})
