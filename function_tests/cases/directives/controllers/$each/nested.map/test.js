runner('*each directive nested.map test suite', describe, it, __dirname, $ => {
    const divs = $('.each-div-layer1');
    return [divs.then(divs => expect(divs.length).toBe(3)), async () => {
        const spans = divs.find('span');
        expect((await spans).length).toBe(6);
        expect((await spans.eq(0).text())).toBe('0 - 1 - a - 0 - 4 - m');
        expect((await spans.eq(2).text())).toBe('1 - 2 - b - 0 - 4 - m');
        expect((await spans.eq(5).text())).toBe('2 - 3 - c - 1 - 5 - n');
    }];
});
