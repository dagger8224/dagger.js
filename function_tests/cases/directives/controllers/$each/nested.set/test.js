runner('*each directive nested.set test suite', describe, it, __dirname, $ => {
    const divs = $('.each-div-layer1');
    return [divs.then(divs => expect(divs.length).toBe(3)), async () => {
        const spans = divs.find('span');
        expect((await spans).length).toBe(6);
        expect((await spans.eq(0).text())).toBe('0 - a - a - 0 - m - m');
        expect((await spans.eq(2).text())).toBe('1 - b - b - 0 - m - m');
        expect((await spans.eq(5).text())).toBe('2 - c - c - 1 - n - n');
    }];
});
