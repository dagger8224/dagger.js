runner('*text directive test suite', describe, it, __dirname, async $ => {
    const helper = async expectedValue => {
        let text = await $('#span1').text();
        expect(text).toBe(expectedValue);
        text = await $('#span2').text();
        expect(text).toBe(`The text content is: ${ expectedValue }`);
        text = await $('#span3').text();
        expect(text).toBe(expectedValue);
        text = await $('#span4').text();
        expect(text).toBe(`The text content is: ${ expectedValue }`);
    };
    await helper('Hello dagger');
    await $('#button1').click();
    await helper('Hello dagger!');
    await $('#button2').click();
    text = await $('#span1').text();
    expect(text).toBe('{"a":1,"b":[]}');
    text = await $('#span2').text();
    expect(text).toBe('The text content is: [object Object]');
    text = await $('#span3').text();
    expect(text).toBe('[object Object]');
    text = await $('#span4').text();
    expect(text).toBe('The text content is: [object Object]');
});
