runner('+click directive stop decorator test suite', describe, it, __dirname, $ => $('#button').click().then(() => Promise.all([$('#count1').text().then(text => expect(text).toBe('0')), $('#count2').text().then(text => expect(text).toBe('1')), $('#count3').text().then(text => expect(text).toBe('0'))])).then(() => $('#div').click().then(() => Promise.all([$('#count1').text().then(text => expect(text).toBe('1')), $('#count2').text().then(text => expect(text).toBe('1')), $('#count3').text().then(text => expect(text).toBe('0'))]))));