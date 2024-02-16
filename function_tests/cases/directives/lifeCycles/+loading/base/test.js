runner('+load directive base test suite', describe, it, __dirname, $ => [$('#span1').text().then(text => expect(text).toBe('text')), $('#span2').text().then(text => expect(text).toBe('1'))]);
