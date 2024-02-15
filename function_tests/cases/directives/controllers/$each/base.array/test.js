runner('*each directive base.array test suite', describe, it, __dirname, $ => {
    const uls = $('.each-ul-item');
    return [uls.then(uls => expect(uls.length).toBe(3)), uls.eq(1).first('li').text().then(li1Text => expect(li1Text).toBe('1 - 1 - b'))];
});
