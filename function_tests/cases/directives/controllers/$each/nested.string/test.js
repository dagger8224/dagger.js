runner('*each directive nested.string test suite', describe, it, __dirname, $ => {
    const divs = $('.each-div-layer1');
    return [divs.then(divs => expect(divs.length).toBe(3)), async () => {
        const spans = divs.find('span');
        expect((await spans).length).toBe(6);
        expect((await spans.eq(0).text())).toBe('0 - a - 0 - 0 - m - 0');
        expect((await spans.eq(2).text())).toBe('1 - b - 1 - 0 - m - 0');
        expect((await spans.eq(5).text())).toBe('2 - c - 2 - 1 - n - 1');
    }];
});
