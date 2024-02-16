const helper = ($, values = ['', '', '', '', '', '']) => Promise.all(values.map((value, index) => $(`#span${ index + 1 }`).text().then(text => expect(text).toBe(value))));

runner('+load directive async.nested test suite', describe, it, __dirname, async $ => {
    await helper($);
    let resolve = null;
    let promise = new Promise(r => (resolve = r));
    setTimeout(() => helper($), 200);
    setTimeout(() => helper($, ['', '', '', 'text1', '1', '']), 400);
    setTimeout(() => helper($, ['text2', '1', '2', 'text1', '1', '']).then(resolve), 800);
    return promise;
});
